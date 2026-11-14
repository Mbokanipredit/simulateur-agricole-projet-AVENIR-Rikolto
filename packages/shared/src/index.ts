export type ExpenseStageCode =
  | 'LAND_PREP'
  | 'SEEDS'
  | 'PLANTING'
  | 'MAINTENANCE'
  | 'INPUTS'
  | 'LABOR'
  | 'HARVEST'
  | 'LOGISTICS';

export type SurfaceUnit = 'HA' | 'ARE' | 'M2';
export type ProductionUnit = 'KG' | 'SAC_50KG' | 'SAC_100KG' | 'BASSINE_25KG' | 'TONNE';
export type CurrencyCode = 'USD' | 'CDF';

export interface ExpenseStageMeta {
  code: ExpenseStageCode;
  order: number;
  labelFr: string;
  shortLabelFr: string;
  descriptionFr: string;
  defaultCostType: 'FIXED' | 'VARIABLE';
  icon: string;
}

export const EXPENSE_STAGES: ExpenseStageMeta[] = [
  {
    code: 'LAND_PREP',
    order: 1,
    labelFr: 'Préparation et aménagement du terrain',
    shortLabelFr: 'Préparation terrain',
    descriptionFr: 'Défrichage, labour, piquetage, trouaison ou aménagement des parcelles.',
    defaultCostType: 'FIXED',
    icon: '🚜',
  },
  {
    code: 'SEEDS',
    order: 2,
    labelFr: 'Achat des semences ou du matériel végétal',
    shortLabelFr: 'Semences / Plants',
    descriptionFr: 'Graines certifiées, boutures de manioc, plantules de café ou cacao.',
    defaultCostType: 'VARIABLE',
    icon: '🌱',
  },
  {
    code: 'PLANTING',
    order: 3,
    labelFr: 'Semis ou plantation',
    shortLabelFr: 'Semis & Plantation',
    descriptionFr: 'Mise en terre, repiquage, ombrage temporaire et remplacement des manquants.',
    defaultCostType: 'VARIABLE',
    icon: '🌾',
  },
  {
    code: 'MAINTENANCE',
    order: 4,
    labelFr: 'Entretien des cultures',
    shortLabelFr: 'Entretien cultural',
    descriptionFr: 'Sarclage, désherbage, taille, égourmandage et suivi phytosanitaire.',
    defaultCostType: 'VARIABLE',
    icon: '✂️',
  },
  {
    code: 'INPUTS',
    order: 5,
    labelFr: 'Achat des intrants et autres consommables',
    shortLabelFr: 'Intrants & Outils',
    descriptionFr: 'Compost, engrais organiques/minéraux, biopesticides, sacs, machettes, houes.',
    defaultCostType: 'VARIABLE',
    icon: '🧪',
  },
  {
    code: 'LABOR',
    order: 6,
    labelFr: 'Main-d’œuvre',
    shortLabelFr: 'Main-d’œuvre',
    descriptionFr: 'Journées de travail salariées et valorisation de la main-d’œuvre familiale.',
    defaultCostType: 'VARIABLE',
    icon: '👥',
  },
  {
    code: 'HARVEST',
    order: 7,
    labelFr: 'Récolte et post-récolte',
    shortLabelFr: 'Récolte & Post-récolte',
    descriptionFr: 'Cueillette, écabossage, fermentation, séchage, décorticage, triage.',
    defaultCostType: 'VARIABLE',
    icon: '🧺',
  },
  {
    code: 'LOGISTICS',
    order: 8,
    labelFr: 'Transport, stockage et commercialisation',
    shortLabelFr: 'Transport & Vente',
    descriptionFr: 'Acheminement au marché/coopérative, entreposage, taxes locales et emballages.',
    defaultCostType: 'VARIABLE',
    icon: '🚚',
  },
];

export interface ExpenseLineItem {
  id: string;
  stage: ExpenseStageCode;
  label: string;
  unit: string;
  quantity: number;
  unitCostUsd: number;
  costType: 'FIXED' | 'VARIABLE';
}

export interface SimulationInput {
  title: string;
  cropCode: string;
  cropName: string;
  province: string;
  surfaceArea: number;
  surfaceUnit: SurfaceUnit;
  expectedYieldTotal: number;
  commercializedQty: number;
  productionUnit: ProductionUnit;
  unitSalePriceUsd: number;
  otherRevenueUsd: number;
  exchangeRateCdfPerUsd: number;
  expenses: ExpenseLineItem[];
}

export interface StageCostBreakdown {
  stage: ExpenseStageCode;
  labelFr: string;
  shortLabelFr: string;
  icon: string;
  amountUsd: number;
  sharePercent: number;
}

export interface PedagogicalDiagnostic {
  level: 'PROFITABLE' | 'FRAGILE' | 'LOSS';
  headlineFr: string;
  recommendationsFr: string[];
  relatedToolboxSlugs: string[];
}

export interface EconomicResults {
  surfaceInHectares: number;
  totalFixedCostUsd: number;
  totalVariableCostUsd: number;
  totalCostUsd: number;
  costPerHectareUsd: number;
  unitProductionCostUsd: number;
  commercializedRevenueUsd: number;
  selfConsumedQty: number;
  selfConsumedValueUsd: number;
  otherRevenueUsd: number;
  totalCashRevenueUsd: number;
  totalEconomicValueUsd: number;
  grossMarginUsd: number;
  grossMarginPercent: number;
  netProfitUsd: number;
  roiPercent: number;
  breakEvenQuantity: number;
  breakEvenSafetyMarginPercent: number;
  breakEvenMinPriceUsd: number;
  stageBreakdown: StageCostBreakdown[];
  diagnostic: PedagogicalDiagnostic;
}

export interface GoalSeekInput {
  targetNetProfitUsd: number;
  baseSimulation: SimulationInput;
}

export interface GoalSeekResult {
  targetNetProfitUsd: number;
  requiredSoldQuantity: number;
  requiredTotalProduction: number;
  requiredSurfaceInHectares: number;
  requiredSurfaceInSelectedUnit: number;
  requiredTotalInvestmentUsd: number;
  expectedTotalRevenueUsd: number;
  requiredUnitPriceIfVolumeFixedUsd: number;
  isFeasibleAtCurrentPrice: boolean;
  explanationFr: string;
}

export interface SensitivityModifiers {
  name: string;
  priceChangePercent: number;
  yieldChangePercent: number;
  costChangePercent: number;
}

export function convertSurfaceToHectares(value: number, unit: SurfaceUnit): number {
  const safeVal = Math.max(0, Number(value) || 0);
  switch (unit) {
    case 'HA':
      return safeVal;
    case 'ARE':
      return safeVal / 100;
    case 'M2':
      return safeVal / 10000;
    default:
      return safeVal;
  }
}

export function convertHectaresToUnit(hectares: number, unit: SurfaceUnit): number {
  switch (unit) {
    case 'HA':
      return hectares;
    case 'ARE':
      return hectares * 100;
    case 'M2':
      return hectares * 10000;
    default:
      return hectares;
  }
}

export function calculateEconomicResults(input: SimulationInput): EconomicResults {
  const surfaceInHectares = Math.max(0.0001, convertSurfaceToHectares(input.surfaceArea, input.surfaceUnit));
  const expectedYieldTotal = Math.max(0, Number(input.expectedYieldTotal) || 0);
  const commercializedQty = Math.min(expectedYieldTotal, Math.max(0, Number(input.commercializedQty) || 0));
  const selfConsumedQty = Math.max(0, expectedYieldTotal - commercializedQty);
  const unitSalePriceUsd = Math.max(0, Number(input.unitSalePriceUsd) || 0);
  const otherRevenueUsd = Math.max(0, Number(input.otherRevenueUsd) || 0);

  let totalFixedCostUsd = 0;
  let totalVariableCostUsd = 0;

  const stageTotals: Record<ExpenseStageCode, number> = {
    LAND_PREP: 0,
    SEEDS: 0,
    PLANTING: 0,
    MAINTENANCE: 0,
    INPUTS: 0,
    LABOR: 0,
    HARVEST: 0,
    LOGISTICS: 0,
  };

  for (const line of input.expenses || []) {
    const qty = Math.max(0, Number(line.quantity) || 0);
    const unitCost = Math.max(0, Number(line.unitCostUsd) || 0);
    const lineCost = qty * unitCost;
    stageTotals[line.stage] = (stageTotals[line.stage] || 0) + lineCost;
    if (line.costType === 'FIXED') {
      totalFixedCostUsd += lineCost;
    } else {
      totalVariableCostUsd += lineCost;
    }
  }

  const totalCostUsd = totalFixedCostUsd + totalVariableCostUsd;
  const costPerHectareUsd = totalCostUsd / surfaceInHectares;
  const unitProductionCostUsd = expectedYieldTotal > 0 ? totalCostUsd / expectedYieldTotal : 0;

  const commercializedRevenueUsd = commercializedQty * unitSalePriceUsd;
  const selfConsumedValueUsd = selfConsumedQty * unitSalePriceUsd;
  const totalCashRevenueUsd = commercializedRevenueUsd + otherRevenueUsd;
  const totalEconomicValueUsd = totalCashRevenueUsd + selfConsumedValueUsd;

  const grossMarginUsd = totalCashRevenueUsd - totalVariableCostUsd;
  const grossMarginPercent = totalCashRevenueUsd > 0 ? (grossMarginUsd / totalCashRevenueUsd) * 100 : 0;
  const netProfitUsd = totalCashRevenueUsd - totalCostUsd;
  const roiPercent = totalCostUsd > 0 ? (netProfitUsd / totalCostUsd) * 100 : 0;

  const netCostAfterOtherRev = Math.max(0, totalCostUsd - otherRevenueUsd);
  const breakEvenQuantity = unitSalePriceUsd > 0 ? netCostAfterOtherRev / unitSalePriceUsd : 0;
  const breakEvenSafetyMarginPercent =
    commercializedQty > 0 ? ((commercializedQty - breakEvenQuantity) / commercializedQty) * 100 : -100;
  const breakEvenMinPriceUsd = commercializedQty > 0 ? netCostAfterOtherRev / commercializedQty : 0;

  const stageBreakdown: StageCostBreakdown[] = EXPENSE_STAGES.map((meta) => {
    const amountUsd = stageTotals[meta.code] || 0;
    const sharePercent = totalCostUsd > 0 ? (amountUsd / totalCostUsd) * 100 : 0;
    return {
      stage: meta.code,
      labelFr: meta.labelFr,
      shortLabelFr: meta.shortLabelFr,
      icon: meta.icon,
      amountUsd,
      sharePercent,
    };
  });

  const recommendationsFr: string[] = [];
  const relatedToolboxSlugs: string[] = [];

  if (netProfitUsd < 0) {
    recommendationsFr.push(
      `Attention : Votre prix de vente actuel (${unitSalePriceUsd.toFixed(2)} USD) ou la quantité vendue ne couvre pas le coût de revient unitaire (${unitProductionCostUsd.toFixed(2)} USD).`
    );
    recommendationsFr.push(
      `Pour ne pas perdre d'argent, il faut vendre au moins ${Math.ceil(breakEvenQuantity)} unités ou négocier un prix minimum de ${breakEvenMinPriceUsd.toFixed(2)} USD.`
    );
    relatedToolboxSlugs.push('calcul-cout-revient-seuil-rentabilite', 'commercialisation-negociation-collective');
  } else if (roiPercent < 20) {
    recommendationsFr.push(
      `L'activité dégage un léger bénéfice (${netProfitUsd.toFixed(2)} USD), mais reste sensible à une baisse de prix sur le marché.`
    );
    relatedToolboxSlugs.push('gestion-risques-scenarios-agricoles');
  } else {
    recommendationsFr.push(
      `Bonne rentabilité prévisionnelle (${roiPercent.toFixed(1)}% de retour sur investissement). Pensez à épargner une partie du bénéfice pour la campagne suivante.`
    );
    relatedToolboxSlugs.push('planification-investissement-epargne');
  }

  const logisticsShare = stageBreakdown.find((s) => s.stage === 'LOGISTICS')?.sharePercent || 0;
  if (logisticsShare > 22) {
    recommendationsFr.push(
      `Le transport et la commercialisation représentent ${logisticsShare.toFixed(1)}% de vos dépenses. Envisagez le groupage via une Organisation Paysanne (OP) pour réduire ce coût.`
    );
    if (!relatedToolboxSlugs.includes('commercialisation-negociation-collective')) {
      relatedToolboxSlugs.push('commercialisation-negociation-collective');
    }
  }

  if (selfConsumedQty > 0) {
    recommendationsFr.push(
      `Sécurité alimentaire du ménage : ${selfConsumedQty} unités conservées pour la famille, représentant une valeur économique de ${selfConsumedValueUsd.toFixed(2)} USD.`
    );
    relatedToolboxSlugs.push('agriculture-sensible-nutrition-budget-menage');
  }

  let level: 'PROFITABLE' | 'FRAGILE' | 'LOSS' = 'PROFITABLE';
  let headlineFr = 'Activité économiquement rentable selon vos hypothèses';
  if (netProfitUsd < 0) {
    level = 'LOSS';
    headlineFr = 'Activité déficitaire : les dépenses dépassent les recettes';
  } else if (roiPercent < 20) {
    level = 'FRAGILE';
    headlineFr = 'Rentabilité fragile : marge de sécurité faible';
  }

  return {
    surfaceInHectares,
    totalFixedCostUsd,
    totalVariableCostUsd,
    totalCostUsd,
    costPerHectareUsd,
    unitProductionCostUsd,
    commercializedRevenueUsd,
    selfConsumedQty,
    selfConsumedValueUsd,
    otherRevenueUsd,
    totalCashRevenueUsd,
    totalEconomicValueUsd,
    grossMarginUsd,
    grossMarginPercent,
    netProfitUsd,
    roiPercent,
    breakEvenQuantity,
    breakEvenSafetyMarginPercent,
    breakEvenMinPriceUsd,
    stageBreakdown,
    diagnostic: {
      level,
      headlineFr,
      recommendationsFr,
      relatedToolboxSlugs,
    },
  };
}

export function calculateGoalSeek(input: GoalSeekInput): GoalSeekResult {
  const { targetNetProfitUsd, baseSimulation } = input;
  const baseResults = calculateEconomicResults(baseSimulation);

  const currentCommercialized = Math.max(1, baseSimulation.commercializedQty);
  const currentYield = Math.max(1, baseSimulation.expectedYieldTotal);
  const commercializationRatio = Math.min(1, Math.max(0.2, currentCommercialized / currentYield));

  const variableCostPerSoldUnit =
    currentCommercialized > 0 ? baseResults.totalVariableCostUsd / currentCommercialized : 0;
  const unitContributionMargin = baseSimulation.unitSalePriceUsd - variableCostPerSoldUnit;

  const requiredUnitPriceIfVolumeFixedUsd =
    currentCommercialized > 0
      ? (baseResults.totalCostUsd + targetNetProfitUsd - baseResults.otherRevenueUsd) / currentCommercialized
      : 0;

  if (unitContributionMargin <= 0) {
    return {
      targetNetProfitUsd,
      requiredSoldQuantity: 0,
      requiredTotalProduction: 0,
      requiredSurfaceInHectares: 0,
      requiredSurfaceInSelectedUnit: 0,
      requiredTotalInvestmentUsd: baseResults.totalCostUsd,
      expectedTotalRevenueUsd: baseResults.totalCashRevenueUsd,
      requiredUnitPriceIfVolumeFixedUsd,
      isFeasibleAtCurrentPrice: false,
      explanationFr: `Au prix actuel (${baseSimulation.unitSalePriceUsd.toFixed(2)} USD), le coût variable par unité (${variableCostPerSoldUnit.toFixed(2)} USD) dépasse le prix de vente. Pour atteindre ${targetNetProfitUsd.toFixed(0)} USD de bénéfice sans changer la quantité, le prix de vente doit être d'au moins ${requiredUnitPriceIfVolumeFixedUsd.toFixed(2)} USD.`,
    };
  }

  const requiredSoldQuantity = Math.max(
    0,
    (baseResults.totalFixedCostUsd + targetNetProfitUsd - baseResults.otherRevenueUsd) / unitContributionMargin
  );
  const requiredTotalProduction = requiredSoldQuantity / commercializationRatio;

  const yieldPerHectare = currentYield / baseResults.surfaceInHectares;
  const requiredSurfaceInHectares = yieldPerHectare > 0 ? requiredTotalProduction / yieldPerHectare : 0;
  const requiredSurfaceInSelectedUnit = convertHectaresToUnit(
    requiredSurfaceInHectares,
    baseSimulation.surfaceUnit
  );

  const requiredTotalInvestmentUsd =
    baseResults.totalFixedCostUsd + requiredSoldQuantity * variableCostPerSoldUnit;
  const expectedTotalRevenueUsd =
    requiredSoldQuantity * baseSimulation.unitSalePriceUsd + baseResults.otherRevenueUsd;

  return {
    targetNetProfitUsd,
    requiredSoldQuantity,
    requiredTotalProduction,
    requiredSurfaceInHectares,
    requiredSurfaceInSelectedUnit,
    requiredTotalInvestmentUsd,
    expectedTotalRevenueUsd,
    requiredUnitPriceIfVolumeFixedUsd,
    isFeasibleAtCurrentPrice: true,
    explanationFr: `Pour obtenir un bénéfice net de ${targetNetProfitUsd.toFixed(0)} USD, vous devez commercialiser environ ${Math.ceil(requiredSoldQuantity)} unités (production totale : ${Math.ceil(requiredTotalProduction)}), soit une superficie estimée à ${requiredSurfaceInSelectedUnit.toFixed(2)} ${baseSimulation.surfaceUnit} et un investissement total de ${requiredTotalInvestmentUsd.toFixed(0)} USD.`,
  };
}

export function applySensitivityScenario(
  base: SimulationInput,
  modifiers: SensitivityModifiers
): { input: SimulationInput; results: EconomicResults } {
  const priceFactor = 1 + modifiers.priceChangePercent / 100;
  const yieldFactor = 1 + modifiers.yieldChangePercent / 100;
  const costFactor = 1 + modifiers.costChangePercent / 100;

  const modifiedInput: SimulationInput = {
    ...base,
    title: `${base.title} (${modifiers.name})`,
    expectedYieldTotal: Math.max(0, base.expectedYieldTotal * yieldFactor),
    commercializedQty: Math.max(0, base.commercializedQty * yieldFactor),
    unitSalePriceUsd: Math.max(0, base.unitSalePriceUsd * priceFactor),
    expenses: base.expenses.map((exp) => ({
      ...exp,
      unitCostUsd: Math.max(0, exp.unitCostUsd * costFactor),
    })),
  };

  return {
    input: modifiedInput,
    results: calculateEconomicResults(modifiedInput),
  };
}

