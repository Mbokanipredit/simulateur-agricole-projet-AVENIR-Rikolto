import { ApiProperty } from '@nestjs/swagger';

export class ToolboxContentSectionDto {
  @ApiProperty()
  heading!: string;

  @ApiProperty()
  body!: string;

  @ApiProperty()
  practicalExample!: string;

  @ApiProperty()
  illustrationIcon!: string;
}

export class ToolboxArticleDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  titleFr!: string;

  @ApiProperty()
  subtitleFr!: string;

  @ApiProperty()
  readingTimeMinutes!: number;

  @ApiProperty()
  targetAudience!: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  linkedSimulatorStage?: string | null;

  @ApiProperty()
  summaryFr!: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  keyFormulaFr?: string | null;

  @ApiProperty({ type: () => [ToolboxContentSectionDto] })
  contentSections!: ToolboxContentSectionDto[];

  @ApiProperty({ type: [String] })
  checklist!: string[];

  @ApiProperty()
  facilitatorNoteFr!: string;
}

export class ToolboxCategoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  titleFr!: string;

  @ApiProperty()
  descriptionFr!: string;

  @ApiProperty()
  icon!: string;

  @ApiProperty()
  colorHex!: string;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty({ type: () => [ToolboxArticleDto] })
  articles!: ToolboxArticleDto[];
}

export class CreateToolboxArticleDto {
  @ApiProperty({ example: 'planification-exploitation' })
  categorySlug!: string;

  @ApiProperty({ example: 'Tenir un cahier de caisse simplifié au village' })
  titleFr!: string;

  @ApiProperty({ example: 'Noter chaque entrée et sortie en Francs Congolais et USD' })
  subtitleFr!: string;

  @ApiProperty({ example: 4 })
  readingTimeMinutes!: number;

  @ApiProperty({ example: 'Producteurs & OP' })
  targetAudience!: string;

  @ApiProperty({ required: false, example: 'RESULTS' })
  linkedSimulatorStage?: string;

  @ApiProperty()
  summaryFr!: string;

  @ApiProperty({ required: false })
  keyFormulaFr?: string;

  @ApiProperty()
  facilitatorNoteFr!: string;

  @ApiProperty({ type: () => [ToolboxContentSectionDto] })
  contentSections!: ToolboxContentSectionDto[];

  @ApiProperty({ type: [String] })
  checklist!: string[];
}
