import { ApiProperty } from '@nestjs/swagger';

export class ExpenseLineItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({
    example: 'LAND_PREP',
    description: 'LAND_PREP | SEEDS | PLANTING | MAINTENANCE | INPUTS | LABOR | HARVEST | LOGISTICS',
  })
  stage!: string;

  @ApiProperty({ example: 'Défrichage et labour' })
  label!: string;

  @ApiProperty({ example: 'H/J' })
  unit!: string;

  @ApiProperty({ example: 30 })
  quantity!: number;

  @ApiProperty({ example: 3.5 })
  unitCostUsd!: number;

  @ApiProperty({ example: 'VARIABLE' })
  costType!: string;
}

export class CreateSimulationDto {
  @ApiProperty({ example: 'Simulation Café 1.5 ha - Ménage Kwilu' })
  title!: string;

  @ApiProperty({ required: false, example: 'Coopérative Kikwit' })
  producerName?: string;

  @ApiProperty({ example: 'Kwilu' })
  province!: string;

  @ApiProperty({ example: 'CAFE_ROBUSTA' })
  cropCode!: string;

  @ApiProperty({ example: 'Café Robusta' })
  cropName!: string;

  @ApiProperty({ example: 1 })
  surfaceArea!: number;

  @ApiProperty({ example: 'HA' })
  surfaceUnit!: string;

  @ApiProperty({ example: 1200 })
  expectedYieldTotal!: number;

  @ApiProperty({ example: 1150 })
  commercializedQty!: number;

  @ApiProperty({ example: 'KG' })
  productionUnit!: string;

  @ApiProperty({ example: 1.85 })
  unitSalePriceUsd!: number;

  @ApiProperty({ example: 0 })
  otherRevenueUsd!: number;

  @ApiProperty({ example: 2850 })
  exchangeRateCdfPerUsd!: number;

  @ApiProperty({ required: false, example: 1000 })
  targetProfitUsd?: number;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ type: () => [ExpenseLineItemDto] })
  expenses!: ExpenseLineItemDto[];
}

export class StageBreakdownDto {
  @ApiProperty()
  stage!: string;

  @ApiProperty()
  labelFr!: string;

  @ApiProperty()
  shortLabelFr!: string;

  @ApiProperty()
  icon!: string;

  @ApiProperty()
  amountUsd!: number;

  @ApiProperty()
  sharePercent!: number;
}

export class PedagogicalDiagnosticDto {
  @ApiProperty({ example: 'PROFITABLE' })
  level!: string;

  @ApiProperty()
  headlineFr!: string;

  @ApiProperty({ type: [String] })
  recommendationsFr!: string[];

  @ApiProperty({ type: [String] })
  relatedToolboxSlugs!: string[];
}

export class EconomicResultsDto {
  @ApiProperty()
  surfaceInHectares!: number;

  @ApiProperty()
  totalFixedCostUsd!: number;

  @ApiProperty()
  totalVariableCostUsd!: number;

  @ApiProperty()
  totalCostUsd!: number;

  @ApiProperty()
  costPerHectareUsd!: number;

  @ApiProperty()
  unitProductionCostUsd!: number;

  @ApiProperty()
  commercializedRevenueUsd!: number;

  @ApiProperty()
  selfConsumedQty!: number;

  @ApiProperty()
  selfConsumedValueUsd!: number;

  @ApiProperty()
  otherRevenueUsd!: number;

  @ApiProperty()
  totalCashRevenueUsd!: number;

  @ApiProperty()
  totalEconomicValueUsd!: number;

  @ApiProperty()
  grossMarginUsd!: number;

  @ApiProperty()
  grossMarginPercent!: number;

  @ApiProperty()
  netProfitUsd!: number;

  @ApiProperty()
  roiPercent!: number;

  @ApiProperty()
  breakEvenQuantity!: number;

  @ApiProperty()
  breakEvenSafetyMarginPercent!: number;

  @ApiProperty()
  breakEvenMinPriceUsd!: number;

  @ApiProperty({ type: () => [StageBreakdownDto] })
  stageBreakdown!: StageBreakdownDto[];

  @ApiProperty({ type: () => PedagogicalDiagnosticDto })
  diagnostic!: PedagogicalDiagnosticDto;
}

export class SavedSimulationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'AVN-2026' })
  shareCode!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  producerName?: string | null;

  @ApiProperty()
  province!: string;

  @ApiProperty()
  cropCode!: string;

  @ApiProperty()
  cropName!: string;

  @ApiProperty()
  surfaceArea!: number;

  @ApiProperty()
  surfaceUnit!: string;

  @ApiProperty()
  expectedYieldTotal!: number;

  @ApiProperty()
  commercializedQty!: number;

  @ApiProperty()
  productionUnit!: string;

  @ApiProperty()
  unitSalePriceUsd!: number;

  @ApiProperty()
  otherRevenueUsd!: number;

  @ApiProperty()
  exchangeRateCdfPerUsd!: number;

  @ApiProperty({ type: Number, required: false, nullable: true })
  targetProfitUsd?: number | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  notes?: string | null;

  @ApiProperty({ type: () => [ExpenseLineItemDto] })
  expenses!: ExpenseLineItemDto[];

  @ApiProperty({ type: () => EconomicResultsDto })
  results!: EconomicResultsDto;

  @ApiProperty()
  createdAt!: Date;
}
