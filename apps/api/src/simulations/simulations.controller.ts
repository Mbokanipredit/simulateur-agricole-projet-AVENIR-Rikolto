import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
}

