import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CropsService } from './crops.service';
import { CropTemplateDto } from './dto/crop.dto';

@ApiTags('Crops (Référentiels Cultures Kwilu & Kwango)')
@Controller('api/crops')
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Get()
  @ApiOperation({
    summary: 'Lister tous les modèles de cultures avec leurs 8 étapes de dépenses de référence',
  })
  @ApiResponse({ status: 200, type: [CropTemplateDto] })
  findAll(): Promise<CropTemplateDto[]> {
    return this.cropsService.findAll();
  }

  @Get(':code')
  @ApiOperation({
    summary: 'Obtenir le référentiel détaillé d’une culture par son code (ex: CAFE_ROBUSTA)',
  })
  @ApiResponse({ status: 200, type: CropTemplateDto })
  findByCode(@Param('code') code: string): Promise<CropTemplateDto> {
    return this.cropsService.findByCode(code);
  }

  @Post()
  @ApiOperation({
    summary: 'Créer un nouveau modèle de culture (Administration)',
  })
  @ApiResponse({ status: 201, type: CropTemplateDto })
  create(@Body() dto: any): Promise<CropTemplateDto> {
    return this.cropsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mettre à jour un modèle de culture et ses dépenses de référence (Administration)',
  })
  @ApiResponse({ status: 200, type: CropTemplateDto })
  update(@Param('id') id: string, @Body() dto: any): Promise<CropTemplateDto> {
    return this.cropsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un modèle de culture (Administration)',
  })
  delete(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.cropsService.delete(id);
  }
}

