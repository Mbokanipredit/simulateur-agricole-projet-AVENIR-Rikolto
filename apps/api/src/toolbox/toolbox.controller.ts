import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateToolboxArticleDto, ToolboxArticleDto, ToolboxCategoryDto } from './dto/toolbox.dto';
import { ToolboxService } from './toolbox.service';

@ApiTags('Toolbox (Boîte à Outils Pédagogique & Éducation Entrepreneuriale)')
@Controller('api/toolbox')
export class ToolboxController {
  constructor(private readonly toolboxService: ToolboxService) {}

  @Get('categories')
  @ApiOperation({
    summary: 'Lister toutes les thématiques de la boîte à outils avec leurs fiches pratiques',
  })
  @ApiResponse({ status: 200, type: [ToolboxCategoryDto] })
  findAllCategories(): Promise<ToolboxCategoryDto[]> {
    return this.toolboxService.findAllCategoriesWithArticles();
  }

  @Get('articles/:slug')
  @ApiOperation({
    summary: 'Obtenir une fiche pratique complète par son slug',
  })
  @ApiResponse({ status: 200, type: ToolboxArticleDto })
  findArticleBySlug(@Param('slug') slug: string): Promise<ToolboxArticleDto> {
    return this.toolboxService.findArticleBySlug(slug);
  }

  @Post('articles')
  @ApiOperation({
    summary: 'Publier une nouvelle fiche pédagogique dans la boîte à outils (Équipe Rikolto)',
  })
  @ApiResponse({ status: 201, type: ToolboxArticleDto })
  createArticle(@Body() dto: CreateToolboxArticleDto): Promise<ToolboxArticleDto> {
    return this.toolboxService.createArticle(dto);
  }
}

