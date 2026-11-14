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
}

