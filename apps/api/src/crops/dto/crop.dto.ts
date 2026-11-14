import { ApiProperty } from '@nestjs/swagger';

export class CropExpenseTemplateDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({
    example: 'LAND_PREP',
    description: 'LAND_PREP | SEEDS | PLANTING | MAINTENANCE | INPUTS | LABOR | HARVEST | LOGISTICS',
  })
  stage!: string;

  @ApiProperty({ example: 'Sarclage et taille d’entretien' })
  label!: string;

  @ApiProperty({ example: 'H/J' })
  unit!: string;

  @ApiProperty({ example: 45 })
  quantity!: number;

  @ApiProperty({ example: 3.5 })
  unitCostUsd!: number;

  @ApiProperty({ example: 'VARIABLE' })
  costType!: string;

  @ApiProperty({ example: 1 })
  sortOrder!: number;
}

export class CropTemplateDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'CAFE_ROBUSTA' })
  code!: string;

  @ApiProperty({ example: 'Café Robusta (Campagne annuelle en production)' })
  nameFr!: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  localName?: string | null;

  @ApiProperty({ example: 'PERENNIAL' })
  category!: string;

  @ApiProperty({ example: '☕' })
  icon!: string;

  @ApiProperty()
  descriptionFr!: string;

  @ApiProperty({ example: 12 })
  cycleDurationMonths!: number;

  @ApiProperty({ example: 'Kwilu & Kwango' })
  recommendedProvince!: string;

  @ApiProperty({ example: 1 })
  defaultSurfaceArea!: number;

  @ApiProperty({ example: 'HA' })
  defaultSurfaceUnit!: string;

  @ApiProperty({ example: 1200 })
  defaultYieldPerHa!: number;

  @ApiProperty({ example: 1150 })
  defaultCommercialQty!: number;

  @ApiProperty({ example: 'KG' })
  productionUnit!: string;

  @ApiProperty({ example: 1 })
  unitWeightKg!: number;

  @ApiProperty({ example: 1.85 })
  defaultSalePriceUsd!: number;

  @ApiProperty()
  nutritionTipFr!: string;

  @ApiProperty()
  agronomicTipFr!: string;

  @ApiProperty({ type: () => [CropExpenseTemplateDto] })
  defaultExpenses!: CropExpenseTemplateDto[];
}
