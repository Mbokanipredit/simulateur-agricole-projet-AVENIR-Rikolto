import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import {
  applySensitivityScenario,
  calculateEconomicResults,
  calculateGoalSeek,
  CurrencyCode,
  EconomicResults,
  GoalSeekResult,
  SensitivityModifiers,
  SimulationInput,
} from '@avenir/shared';
import type {
  AuthPortalUserDto,
  CropTemplateDto,
  ToolboxCategoryDto,
} from '../api/generated/avenirApi';

export type MainSection =
  | 'HOME'
  | 'SIMULATOR'
  | 'RESULTS'
  | 'TOOLBOX'
  | 'HOW_IT_WORKS'
  | 'FACILITATOR';
export type SimulatorTab = 'PLANNING' | 'EXPENSES' | 'RESULTS' | 'DECISION';

export const activeMainSectionAtom = atom<MainSection>('HOME');
export const activeSimulatorTabAtom = atom<SimulatorTab>('PLANNING');
export const displayCurrencyAtom = atomWithStorage<CurrencyCode>('avenir_currency_v1', 'USD');

export const defaultSimulationInput: SimulationInput = {
  title: 'Campagne Café Robusta 1 ha — Kwilu',
  cropCode: 'CAFE_ROBUSTA',
  cropName: 'Café Robusta (Campagne annuelle en production)',
  province: 'Kwilu',
  surfaceArea: 1,
  surfaceUnit: 'HA',
  expectedYieldTotal: 1200,
  commercializedQty: 1150,
  productionUnit: 'KG',
  unitSalePriceUsd: 1.85,
  otherRevenueUsd: 0,
  exchangeRateCdfPerUsd: 2850,
  expenses: [
    {
      id: 'init-1',
      stage: 'LAND_PREP',
      label: 'Entretien des pistes & piquetage complémentaire',
      unit: 'Forfait/ha',
      quantity: 1,
      unitCostUsd: 65,
      costType: 'FIXED',
    },
    {
      id: 'init-2',
      stage: 'SEEDS',
      label: 'Plantules améliorées (remplacement des manquants)',
      unit: 'Plantules',
      quantity: 120,
      unitCostUsd: 0.5,
      costType: 'VARIABLE',
    },
    {
      id: 'init-3',
      stage: 'PLANTING',
      label: 'Regarnissage & mise en place d’ombrage',
      unit: 'H/J',
      quantity: 15,
      unitCostUsd: 3.5,
      costType: 'VARIABLE',
    },
    {
      id: 'init-4',
      stage: 'MAINTENANCE',
      label: 'Sarclage (3 passages) & taille d’entretien/égourmandage',
      unit: 'H/J',
      quantity: 55,
      unitCostUsd: 3.5,
      costType: 'VARIABLE',
    },
    {
      id: 'init-5',
      stage: 'INPUTS',
      label: 'Compost organique, sacs jute, sécateurs & bâches',
      unit: 'Lot/ha',
      quantity: 1,
      unitCostUsd: 145,
      costType: 'VARIABLE',
    },
    {
      id: 'init-6',
      stage: 'LABOR',
      label: 'Main-d’œuvre de surveillance et gestion parcelle',
      unit: 'H/J',
      quantity: 35,
      unitCostUsd: 3.5,
      costType: 'VARIABLE',
    },
    {
      id: 'init-7',
      stage: 'HARVEST',
      label: 'Récolte sélective (cerises rouges), séchage sur claies & décorticage',
      unit: 'H/J',
      quantity: 60,
      unitCostUsd: 4.0,
      costType: 'VARIABLE',
    },
    {
      id: 'init-8',
      stage: 'LOGISTICS',
      label: 'Transport vers coopérative/centre de collecte & manutention',
      unit: 'Sacs',
      quantity: 20,
      unitCostUsd: 6.5,
      costType: 'VARIABLE',
    },
  ],
};

// Persisted simulation state in localStorage (works 100% without account & offline)
export const simulationInputAtom = atomWithStorage<SimulationInput>(
  'avenir_active_simulation_v2',
  defaultSimulationInput
);

// Target net profit in USD for Goal-Seek (Reverse Simulation)
export const targetNetProfitUsdAtom = atomWithStorage<number>('avenir_target_profit_usd_v2', 1000);

// Sensitivity sliders ("Et si ?")
export const customSensitivityAtom = atom<SensitivityModifiers>({
  name: 'Scénario personnalisé (« Et si ? »)',
  priceChangePercent: -15,
  yieldChangePercent: 0,
  costChangePercent: 10,
});

// Derived real-time economic results atom
export const economicResultsAtom = atom<EconomicResults>((get) => {
  const input = get(simulationInputAtom);
  return calculateEconomicResults(input);
});

// Derived real-time Goal-Seek (Reverse simulation) result atom
export const goalSeekResultAtom = atom<GoalSeekResult>((get) => {
  const baseSimulation = get(simulationInputAtom);
  const targetNetProfitUsd = get(targetNetProfitUsdAtom);
  return calculateGoalSeek({
    targetNetProfitUsd,
    baseSimulation,
  });
});

// Derived multi-scenario comparison (Base vs Optimistic vs Pessimistic vs Custom "What-If")
export const multiScenarioComparisonAtom = atom((get) => {
  const baseInput = get(simulationInputAtom);
  const baseResults = get(economicResultsAtom);
  const customMods = get(customSensitivityAtom);

  const pessimistic = applySensitivityScenario(baseInput, {
    name: 'Scénario Prudent (Prix -15%, Coûts +10%)',
    priceChangePercent: -15,
    yieldChangePercent: -10,
    costChangePercent: 10,
  });

  const optimistic = applySensitivityScenario(baseInput, {
    name: 'Scénario Optimiste / Vente Groupée OP (Prix +15%, Coûts -5%)',
    priceChangePercent: 15,
    yieldChangePercent: 10,
    costChangePercent: -5,
  });

  const custom = applySensitivityScenario(baseInput, customMods);

  return {
    base: { name: 'Scénario Actuel (Base)', input: baseInput, results: baseResults },
    pessimistic: { name: pessimistic.input.title, ...pessimistic },
    optimistic: { name: optimistic.input.title, ...optimistic },
    custom: { name: customMods.name, ...custom, modifiers: customMods },
  };
});

export interface LocalSavedScenario {
  id: string;
  savedAt: string;
  shareCode?: string;
  input: SimulationInput;
  results: EconomicResults;
}

export const localSavedScenariosAtom = atomWithStorage<LocalSavedScenario[]>(
  'avenir_saved_scenarios_v1',
  []
);

// Backend catalog & toolbox atoms
export const cropTemplatesAtom = atom<CropTemplateDto[]>([]);
export const toolboxCategoriesAtom = atom<ToolboxCategoryDto[]>([]);
export const selectedToolboxCategorySlugAtom = atom<string>('ALL');
export const selectedToolboxArticleSlugAtom = atom<string | null>(null);
export const authUserAtom = atom<AuthPortalUserDto | null>(null);
export const lastGeneratedShareCodeAtom = atom<string | null>(null);

export function formatMoney(
  amountUsd: number,
  currency: CurrencyCode,
  exchangeRateCdfPerUsd: number
): string {
  const safeUsd = Number.isFinite(amountUsd) ? amountUsd : 0;
  if (currency === 'CDF') {
    const cdf = Math.round(safeUsd * (exchangeRateCdfPerUsd || 2850));
    return `${cdf.toLocaleString('fr-FR')} CDF`;
  }
  return `${safeUsd.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USD`;
}

