import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateToolboxArticleDto, ToolboxArticleDto, ToolboxCategoryDto } from './dto/toolbox.dto';

@Injectable()
export class ToolboxService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllCategoriesWithArticles(): Promise<ToolboxCategoryDto[]> {
    const categories = await this.prisma.toolboxCategory.findMany({
      include: {
        articles: {
          where: { isPublished: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      titleFr: cat.titleFr,
      descriptionFr: cat.descriptionFr,
      icon: cat.icon,
      colorHex: cat.colorHex,
      sortOrder: cat.sortOrder,
      articles: cat.articles.map((art) => this.mapArticle(art)),
    }));
  }

  async findArticleBySlug(slug: string): Promise<ToolboxArticleDto> {
    const art = await this.prisma.toolboxArticle.findUnique({
      where: { slug },
    });
    if (!art) {
      throw new NotFoundException(`Fiche pédagogique ${slug} introuvable`);
    }
    return this.mapArticle(art);
  }

  async createArticle(dto: CreateToolboxArticleDto): Promise<ToolboxArticleDto> {
    const category = await this.prisma.toolboxCategory.findUnique({
      where: { slug: dto.categorySlug },
    });
    if (!category) {
      throw new NotFoundException(`Catégorie ${dto.categorySlug} introuvable`);
    }

    const baseSlug = dto.titleFr
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const created = await this.prisma.toolboxArticle.create({
      data: {
        slug,
        categoryId: category.id,
        titleFr: dto.titleFr,
        subtitleFr: dto.subtitleFr,
        readingTimeMinutes: dto.readingTimeMinutes || 4,
        targetAudience: dto.targetAudience || 'Producteurs & Animateurs',
        linkedSimulatorStage: dto.linkedSimulatorStage || null,
        summaryFr: dto.summaryFr,
        keyFormulaFr: dto.keyFormulaFr || null,
        facilitatorNoteFr: dto.facilitatorNoteFr,
        contentSectionsJson: (dto.contentSections || []) as any,
        checklistJson: (dto.checklist || []) as any,
      },
    });

    return this.mapArticle(created);
  }

  private mapArticle(art: any): ToolboxArticleDto {
    return {
      id: art.id,
      slug: art.slug,
      categoryId: art.categoryId,
      titleFr: art.titleFr,
      subtitleFr: art.subtitleFr,
      readingTimeMinutes: art.readingTimeMinutes,
      targetAudience: art.targetAudience,
      linkedSimulatorStage: art.linkedSimulatorStage,
      summaryFr: art.summaryFr,
      keyFormulaFr: art.keyFormulaFr,
      contentSections: Array.isArray(art.contentSectionsJson) ? art.contentSectionsJson : [],
      checklist: Array.isArray(art.checklistJson) ? art.checklistJson : [],
      facilitatorNoteFr: art.facilitatorNoteFr,
    };
  }
}

