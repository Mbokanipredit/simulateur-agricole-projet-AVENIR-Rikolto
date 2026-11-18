import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CropTemplateDto } from './dto/crop.dto';

@Injectable()
export class CropsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CropTemplateDto[]> {
    return this.prisma.cropTemplate.findMany({
      where: { isActive: true },
      include: {
        defaultExpenses: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByCode(code: string): Promise<CropTemplateDto> {
    const crop = await this.prisma.cropTemplate.findUnique({
      where: { code },
      include: {
        defaultExpenses: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!crop) {
      throw new NotFoundException(`Culture ${code} introuvable`);
    }
    return crop;
  }

  async create(dto: any): Promise<CropTemplateDto> {
    const code = (dto.code || dto.nameFr || 'CULTURE')
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]+/g, '_');

    const created = await this.prisma.cropTemplate.create({
      data: {
        code,
        nameFr: dto.nameFr,
        localName: dto.localName || null,
        category: dto.category || 'FOOD_CROP',
        icon: dto.icon || '🌱',
        descriptionFr: dto.descriptionFr || '',
        cycleDurationMonths: Number(dto.cycleDurationMonths) || 12,
        recommendedProvince: dto.recommendedProvince || 'Kwilu & Kwango',
        defaultSurfaceArea: Number(dto.defaultSurfaceArea) || 1,
        defaultSurfaceUnit: dto.defaultSurfaceUnit || 'HA',
        defaultYieldPerHa: Number(dto.defaultYieldPerHa) || 1000,
        defaultCommercialQty: Number(dto.defaultCommercialQty) || 900,
        productionUnit: dto.productionUnit || 'KG',
        unitWeightKg: Number(dto.unitWeightKg) || 1,
        defaultSalePriceUsd: Number(dto.defaultSalePriceUsd) || 1.0,
        nutritionTipFr: dto.nutritionTipFr || '',
        agronomicTipFr: dto.agronomicTipFr || '',
        isActive: true,
        defaultExpenses: {
          create: (dto.defaultExpenses || []).map((e: any, idx: number) => ({
            stage: e.stage || 'MAINTENANCE',
            label: e.label,
            unit: e.unit || 'H/J',
            quantity: Number(e.quantity) || 1,
            unitCostUsd: Number(e.unitCostUsd) || 1,
            costType: e.costType || 'VARIABLE',
            sortOrder: idx + 1,
          })),
        },
      },
      include: {
        defaultExpenses: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    return created;
  }

  async update(id: string, dto: any): Promise<CropTemplateDto> {
    const existing = await this.prisma.cropTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Culture avec ID ${id} introuvable`);
    }

    if (dto.defaultExpenses && Array.isArray(dto.defaultExpenses)) {
      await this.prisma.cropExpenseTemplate.deleteMany({
        where: { cropTemplateId: id },
      });
      await this.prisma.cropExpenseTemplate.createMany({
        data: dto.defaultExpenses.map((e: any, idx: number) => ({
          cropTemplateId: id,
          stage: e.stage || 'MAINTENANCE',
          label: e.label,
          unit: e.unit || 'H/J',
          quantity: Number(e.quantity) || 1,
          unitCostUsd: Number(e.unitCostUsd) || 1,
          costType: e.costType || 'VARIABLE',
          sortOrder: idx + 1,
        })),
      });
    }

    const updated = await this.prisma.cropTemplate.update({
      where: { id },
      data: {
        ...(dto.nameFr ? { nameFr: dto.nameFr } : {}),
        ...(dto.localName !== undefined ? { localName: dto.localName } : {}),
        ...(dto.category ? { category: dto.category } : {}),
        ...(dto.icon ? { icon: dto.icon } : {}),
        ...(dto.descriptionFr !== undefined ? { descriptionFr: dto.descriptionFr } : {}),
        ...(dto.cycleDurationMonths ? { cycleDurationMonths: Number(dto.cycleDurationMonths) } : {}),
        ...(dto.recommendedProvince ? { recommendedProvince: dto.recommendedProvince } : {}),
        ...(dto.defaultSurfaceArea ? { defaultSurfaceArea: Number(dto.defaultSurfaceArea) } : {}),
        ...(dto.defaultSurfaceUnit ? { defaultSurfaceUnit: dto.defaultSurfaceUnit } : {}),
        ...(dto.defaultYieldPerHa ? { defaultYieldPerHa: Number(dto.defaultYieldPerHa) } : {}),
        ...(dto.defaultCommercialQty ? { defaultCommercialQty: Number(dto.defaultCommercialQty) } : {}),
        ...(dto.productionUnit ? { productionUnit: dto.productionUnit } : {}),
        ...(dto.defaultSalePriceUsd ? { defaultSalePriceUsd: Number(dto.defaultSalePriceUsd) } : {}),
        ...(dto.nutritionTipFr !== undefined ? { nutritionTipFr: dto.nutritionTipFr } : {}),
        ...(dto.agronomicTipFr !== undefined ? { agronomicTipFr: dto.agronomicTipFr } : {}),
        ...(dto.isActive !== undefined ? { isActive: Boolean(dto.isActive) } : {}),
      },
      include: {
        defaultExpenses: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return updated;
  }

  async delete(id: string): Promise<{ success: boolean }> {
    await this.prisma.cropTemplate.delete({ where: { id } });
    return { success: true };
  }
}

