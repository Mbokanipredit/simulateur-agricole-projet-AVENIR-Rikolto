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

