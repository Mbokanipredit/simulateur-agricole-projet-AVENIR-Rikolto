import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSimulationDto, EconomicResultsDto, SavedSimulationDto } from './dto/simulation.dto';
import { SimulationsService } from './simulations.service';

@ApiTags('Simulations (Calculs Économiques & Partage Sans Compte)')
@Controller('api/simulations')
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  @Post('calculate')
  @ApiOperation({
    summary: 'Calculer les résultats économiques complets d’une simulation agricole',
  })
  @ApiResponse({ status: 200, type: EconomicResultsDto })
  calculate(@Body() dto: CreateSimulationDto): EconomicResultsDto {
    return this.simulationsService.calculate(dto);
  }

  @Post()
  @ApiOperation({
    summary: 'Enregistrer une simulation sans compte obligatoire et générer un code de partage (ex: AVN-XXXX)',
  })
  @ApiResponse({ status: 201, type: SavedSimulationDto })
  save(@Body() dto: CreateSimulationDto): Promise<SavedSimulationDto> {
    return this.simulationsService.saveSimulation(dto);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Statistiques globales de suivi-évaluation du Projet AVENIR (Kwilu & Kwango)',
  })
  getStats() {
    return this.simulationsService.getStats();
  }

  @Get('all')
  @ApiOperation({
    summary: 'Lister toutes les simulations enregistrées avec filtres (Administration)',
  })
  @ApiResponse({ status: 200, type: [SavedSimulationDto] })
  findAll(
    @Query('province') province?: string,
    @Query('cropCode') cropCode?: string,
    @Query('search') search?: string,
  ): Promise<SavedSimulationDto[]> {
    return this.simulationsService.findAll({ province, cropCode, search });
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les simulations récentes partagées (pour suivi par les animateurs Rikolto)',
  })
  @ApiResponse({ status: 200, type: [SavedSimulationDto] })
  findRecent(): Promise<SavedSimulationDto[]> {
    return this.simulationsService.findRecent();
  }

  @Get('share/:shareCode')
  @ApiOperation({
    summary: 'Récupérer une simulation sauvegardée via son code court (ex: AVN-2026)',
  })
  @ApiResponse({ status: 200, type: SavedSimulationDto })
  findByShareCode(@Param('shareCode') shareCode: string): Promise<SavedSimulationDto> {
    return this.simulationsService.findByShareCode(shareCode);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer une simulation enregistrée (Administration)',
  })
  delete(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.simulationsService.delete(id);
  }
}

