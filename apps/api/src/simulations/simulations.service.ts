import { Injectable, NotFoundException } from '@nestjs/common';
import { calculateEconomicResults, SimulationInput } from '@avenir/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSimulationDto, EconomicResultsDto, SavedSimulationDto } from './dto/simulation.dto';

@Injectable()
export class SimulationsService {
  constructor(private readonly prisma: PrismaService) {}

  calculate(dto: CreateSimulationDto): EconomicResultsDto {
    const input: SimulationInput = {
      title: dto.title,
      cropCode: dto.cropCode,
      cropName: dto.cropName,
      province: dto.province,
      surfaceArea: dto.surfaceArea,
      surfaceUnit: dto.surfaceUnit as any,
      expectedYieldTotal: dto.expectedYieldTotal,
      commercializedQty: dto.commercializedQty,
      productionUnit: dto.productionUnit as any,
      unitSalePriceUsd: dto.unitSalePriceUsd,
      otherRevenueUsd: dto.otherRevenueUsd || 0,
      exchangeRateCdfPerUsd: dto.exchangeRateCdfPerUsd || 2850,
      expenses: (dto.expenses || []).map((e) => ({
        id: e.id,
        stage: e.stage as any,
        label: e.label,
        unit: e.unit,
        quantity: Number(e.quantity) || 0,
        unitCostUsd: Number(e.unitCostUsd) || 0,
        costType: (e.costType as any) || 'VARIABLE',
      })),
    };
    return calculateEconomicResults(input);
  }

  private generateShareCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `AVN-${suffix}`;
  }

  async saveSimulation(dto: CreateSimulationDto): Promise<SavedSimulationDto> {
    const results = this.calculate(dto);
    let shareCode = this.generateShareCode();

    for (let attempt = 0; attempt < 5; attempt++) {
      const existing = await this.prisma.simulation.findUnique({ where: { shareCode } });
      if (!existing) break;
      shareCode = this.generateShareCode();
    }

    const created = await this.prisma.simulation.create({
      data: {
        shareCode,
        title: dto.title,
        producerName: dto.producerName || 'Producteur / Ménage (Sans compte)',
        province: dto.province || 'Kwilu',
        cropCode: dto.cropCode,
        cropName: dto.cropName,
        surfaceArea: dto.surfaceArea,
        surfaceUnit: dto.surfaceUnit,
        expectedYieldTotal: dto.expectedYieldTotal,
        commercializedQty: dto.commercializedQty,
        productionUnit: dto.productionUnit,
        unitSalePriceUsd: dto.unitSalePriceUsd,
        otherRevenueUsd: dto.otherRevenueUsd || 0,
        exchangeRateCdfPerUsd: dto.exchangeRateCdfPerUsd || 2850,
        targetProfitUsd: dto.targetProfitUsd ?? null,
        notes: dto.notes ?? null,
        expensesJson: dto.expenses as any,
        resultsJson: results as any,
      },
    });

    return this.mapToDto(created);
  }

  async findByShareCode(shareCode: string): Promise<SavedSimulationDto> {
    const normalized = shareCode.trim().toUpperCase();
    const sim = await this.prisma.simulation.findUnique({
      where: { shareCode: normalized },
    });
    if (!sim) {
      throw new NotFoundException(`Aucune simulation trouvée pour le code ${normalized}`);
    }
    return this.mapToDto(sim);
  }

  async findRecent(): Promise<SavedSimulationDto[]> {
    const list = await this.prisma.simulation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
    });
    return list.map((item) => this.mapToDto(item));
  }

  async findAll(query?: { province?: string; cropCode?: string; search?: string }): Promise<SavedSimulationDto[]> {
    const where: any = {};
    if (query?.province && query.province !== 'ALL') {
      where.province = query.province;
    }
    if (query?.cropCode && query.cropCode !== 'ALL') {
      where.cropCode = query.cropCode;
    }
    if (query?.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { producerName: { contains: q, mode: 'insensitive' } },
        { shareCode: { contains: q, mode: 'insensitive' } },
      ];
    }
    const list = await this.prisma.simulation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return list.map((item) => this.mapToDto(item));
  }

  async getStats() {
    const list = await this.prisma.simulation.findMany();
    const targetHouseholds = 8000;
    const count = list.length;
    let totalSurfaceAreaHa = 0;
    let totalProductionKg = 0;
    let totalRevenueUsd = 0;
    let totalCostUsd = 0;
    let totalNetProfitUsd = 0;

    const countByProvince: Record<string, number> = { Kwilu: 0, Kwango: 0 };
    const countByCrop: Record<string, number> = {};

    for (const sim of list) {
      totalSurfaceAreaHa += Number(sim.surfaceArea) || 0;
      totalProductionKg += Number(sim.expectedYieldTotal) || 0;

      const res: any = sim.resultsJson || {};
      const rev = Number(res.grossRevenueUsd) || 0;
      const cost = Number(res.totalExpensesUsd) || 0;
      const profit = Number(res.netProfitUsd) || (rev - cost);

      totalRevenueUsd += rev;
      totalCostUsd += cost;
      totalNetProfitUsd += profit;

      const prov = sim.province || 'Kwilu';
      countByProvince[prov] = (countByProvince[prov] || 0) + 1;

      const crop = sim.cropName || sim.cropCode || 'Autre';
      countByCrop[crop] = (countByCrop[crop] || 0) + 1;
    }

    const averageNetMarginPercent =
      totalRevenueUsd > 0 ? (totalNetProfitUsd / totalRevenueUsd) * 100 : 0;
    const progressGoalPercent = Math.min(100, Math.round((count / targetHouseholds) * 100 * 10) / 10);

    return {
      totalSimulations: count,
      targetHouseholds,
      progressGoalPercent,
      totalSurfaceAreaHa: Math.round(totalSurfaceAreaHa * 10) / 10,
      totalProductionKg: Math.round(totalProductionKg),
      totalRevenueUsd: Math.round(totalRevenueUsd),
      totalCostUsd: Math.round(totalCostUsd),
      totalNetProfitUsd: Math.round(totalNetProfitUsd),
      averageNetMarginPercent: Math.round(averageNetMarginPercent * 10) / 10,
      countByProvince,
      countByCrop,
    };
  }

  async delete(id: string): Promise<{ success: boolean }> {
    await this.prisma.simulation.delete({ where: { id } });
    return { success: true };
  }

  private mapToDto(sim: any): SavedSimulationDto {
    return {
      id: sim.id,
      shareCode: sim.shareCode,
      title: sim.title,
      producerName: sim.producerName,
      province: sim.province,
      cropCode: sim.cropCode,
      cropName: sim.cropName,
      surfaceArea: sim.surfaceArea,
      surfaceUnit: sim.surfaceUnit,
      expectedYieldTotal: sim.expectedYieldTotal,
      commercializedQty: sim.commercializedQty,
      productionUnit: sim.productionUnit,
      unitSalePriceUsd: sim.unitSalePriceUsd,
      otherRevenueUsd: sim.otherRevenueUsd,
      exchangeRateCdfPerUsd: sim.exchangeRateCdfPerUsd,
      targetProfitUsd: sim.targetProfitUsd,
      notes: sim.notes,
      expenses: Array.isArray(sim.expensesJson) ? sim.expensesJson : [],
      results: sim.resultsJson,
      createdAt: sim.createdAt,
    };
  }
}

