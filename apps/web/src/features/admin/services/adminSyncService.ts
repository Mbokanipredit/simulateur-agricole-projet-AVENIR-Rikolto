import axios from 'axios';
import { CropTemplateDto, SavedSimulationDto, AuthPortalUserDto } from '../../../api/generated/avenirApi';

const API_BASE = 'http://localhost:3001';

// Cache keys
const CACHE_KEYS = {
  STATS: 'avenir_admin_stats_v2',
  CROPS: 'avenir_admin_crops_v2',
  SIMULATIONS: 'avenir_admin_simulations_v2',
  USERS: 'avenir_admin_users_v2',
  SETTINGS: 'avenir_admin_settings_v2',
  CONTRIBUTIONS: 'avenir_admin_contribs_v2',
};

export interface AdminProjectSettings {
  exchangeRateCdfPerUsd: number;
  targetHouseholds: number;
  projectAntennas: { id: string; name: string; province: string; lead: string }[];
  projectTitle: string;
  donorLabel: string;
}

export const DEFAULT_SETTINGS: AdminProjectSettings = {
  exchangeRateCdfPerUsd: 2850,
  targetHouseholds: 8000,
  projectAntennas: [
    { id: 'ant-kikwit', name: 'Antenne Centrale de Kikwit', province: 'Kwilu', lead: 'Yvonne Kapinga' },
    { id: 'ant-kenge', name: 'Antenne Provinciale de Kenge', province: 'Kwango', lead: 'Jean-Paul Mbemba' },
    { id: 'ant-bulungu', name: 'Sous-antenne Territoriale Bulungu', province: 'Kwilu', lead: 'Alain Mukwa' },
    { id: 'ant-idiofa', name: 'Point d’Appui Coopératif Idiofa (CAPSA)', province: 'Kwilu', lead: 'Thérèse Nzuzi' },
  ],
  projectTitle: 'Projet AVENIR — Rikolto RDC',
  donorLabel: 'Rikolto RDC & Bailleurs de Fonds Partenaires (Kwilu & Kwango)',
};

export type TimePeriodFilter = 'ALL' | '7D' | '30D' | '3M' | '6M' | '1Y';

export interface MonthlyBarData {
  month: string;
  revenue: number;
  expense: number;
  net: number;
}

export interface AdminStatsData {
  totalSimulations: number;
  totalHouseholds: number;
  targetHouseholds: number;
  progressGoalPercent: number;
  totalSurfaceAreaHa: number;
  totalProductionKg: number;
  totalRevenueUsd: number;
  totalCostUsd: number;
  totalNetProfitUsd: number;
  averageNetMarginPercent: number;
  countByProvince: Record<string, number>;
  countByCrop: Record<string, number>;
  monthlyBars: MonthlyBarData[];
}

// 16 Detailed, Realistic Field Simulations across Kwilu & Kwango with dates spanning 6 months
export const RICH_INITIAL_SIMULATIONS: SavedSimulationDto[] = [
  {
    id: 'sim-1',
    shareCode: 'AVN-2026',
    title: 'Campagne Café Robusta 1 ha — Coopérative Pilote Kikwit',
    producerName: 'Groupement Paysan Pilote Kikwit (15 ménages)',
    province: 'Kwilu',
    cropCode: 'CAFE_ROBUSTA',
    cropName: 'Café Robusta (Campagne annuelle en production)',
    surfaceArea: 1,
    surfaceUnit: 'HA',
    expectedYieldTotal: 1200,
    commercializedQty: 1150,
    productionUnit: 'KG',
    unitSalePriceUsd: 1.85,
    otherRevenueUsd: 50,
    exchangeRateCdfPerUsd: 2850,
    results: {
      grossRevenueUsd: 2177.5,
      totalExpensesUsd: 1007.5,
      netProfitUsd: 1170.0,
      costPerProductionUnitUsd: 0.84,
      breakevenProductionQty: 544,
      netProfitMarginPercent: 53.7,
      isProfitable: true,
    },
    expenses: [
      { id: 'e1', stage: 'LAND_PREP', label: 'Entretien des pistes & piquetage', unit: 'Forfait/ha', quantity: 1, unitCostUsd: 65, costType: 'FIXED' },
      { id: 'e2', stage: 'SEEDS', label: 'Plantules améliorées (remplacement)', unit: 'Plantules', quantity: 120, unitCostUsd: 0.5, costType: 'VARIABLE' },
      { id: 'e3', stage: 'MAINTENANCE', label: 'Sarclage & taille d’entretien', unit: 'H/J', quantity: 55, unitCostUsd: 3.5, costType: 'VARIABLE' },
      { id: 'e4', stage: 'INPUTS', label: 'Compost organique & sacs jute', unit: 'Lot/ha', quantity: 1, unitCostUsd: 145, costType: 'VARIABLE' },
      { id: 'e5', stage: 'HARVEST', label: 'Récolte cerises & séchage sur claies', unit: 'H/J', quantity: 60, unitCostUsd: 4.0, costType: 'VARIABLE' },
      { id: 'e6', stage: 'LOGISTICS', label: 'Transport centre collecte Kikwit', unit: 'Sacs', quantity: 20, unitCostUsd: 6.5, costType: 'VARIABLE' },
    ],
    createdAt: '2026-11-17T09:30:00.000Z',
  },
  {
    id: 'sim-2',
    shareCode: 'AVN-5842',
    title: 'Cacaoyère villageoise durable — Coopérative Bulungu',
    producerName: 'Union des Planteurs de Bulungu (28 ménages)',
    province: 'Kwilu',
    cropCode: 'CACAO',
    cropName: 'Cacao (Cacaoyère villageoise durable)',
    surfaceArea: 2,
    surfaceUnit: 'HA',
    expectedYieldTotal: 2000,
    commercializedQty: 1960,
    productionUnit: 'KG',
    unitSalePriceUsd: 2.6,
    otherRevenueUsd: 100,
    exchangeRateCdfPerUsd: 2850,
    results: {
      grossRevenueUsd: 5196.0,
      totalExpensesUsd: 2441.0,
      netProfitUsd: 2755.0,
      costPerProductionUnitUsd: 1.22,
      breakevenProductionQty: 938,
      netProfitMarginPercent: 53.0,
      isProfitable: true,
    },
    expenses: [
      { id: 'e2-1', stage: 'LAND_PREP', label: 'Nettoyage & drainage', unit: 'Ha', quantity: 2, unitCostUsd: 75, costType: 'FIXED' },
      { id: 'e2-2', stage: 'SEEDS', label: 'Plants greffés tolérants', unit: 'Plants', quantity: 200, unitCostUsd: 0.7, costType: 'VARIABLE' },
      { id: 'e2-3', stage: 'MAINTENANCE', label: 'Taille sanitaire & désherbage', unit: 'H/J', quantity: 130, unitCostUsd: 3.5, costType: 'VARIABLE' },
      { id: 'e2-4', stage: 'HARVEST', label: 'Cueillette, écabossage & séchage', unit: 'H/J', quantity: 140, unitCostUsd: 4.0, costType: 'VARIABLE' },
    ],
    createdAt: '2026-11-15T14:15:00.000Z',
  },
  {
    id: 'sim-3',
    shareCode: 'AVN-7139',
    title: 'Manioc amélioré TMC 419 & cossettes — Kenge',
    producerName: 'Ménage Kiese & Fils (Kenge - 8 personnes)',
    province: 'Kwango',
    cropCode: 'MANIOC',
    cropName: 'Manioc amélioré (Cossettes / Chikwangue)',
    surfaceArea: 1.5,
    surfaceUnit: 'HA',
    expectedYieldTotal: 4800,
    commercializedQty: 3900,
    productionUnit: 'KG',
    unitSalePriceUsd: 0.55,
    otherRevenueUsd: 40,
    exchangeRateCdfPerUsd: 2850,
    results: {
      grossRevenueUsd: 2185.0,
      totalExpensesUsd: 1127.5,
      netProfitUsd: 1057.5,
      costPerProductionUnitUsd: 0.23,
      breakevenProductionQty: 2050,
      netProfitMarginPercent: 48.4,
      isProfitable: true,
    },
    expenses: [
      { id: 'e3-1', stage: 'LAND_PREP', label: 'Labour et billonnage à plat', unit: 'H/J', quantity: 60, unitCostUsd: 3.0, costType: 'FIXED' },
      { id: 'e3-2', stage: 'SEEDS', label: 'Boutures certifiées TMC 419', unit: 'Bottes', quantity: 75, unitCostUsd: 2.5, costType: 'VARIABLE' },
      { id: 'e3-3', stage: 'MAINTENANCE', label: 'Sarclage (3 passages)', unit: 'H/J', quantity: 65, unitCostUsd: 3.0, costType: 'VARIABLE' },
      { id: 'e3-4', stage: 'HARVEST', label: 'Arrachage & séchage claies', unit: 'H/J', quantity: 50, unitCostUsd: 3.0, costType: 'VARIABLE' },
    ],
    createdAt: '2026-11-12T11:00:00.000Z',
  },
  {
    id: 'sim-4',
    shareCode: 'AVN-3904',
    title: 'Maïs grain jaune hybride — Masi-Manimba',
    producerName: 'Groupement Paysan Lukula (22 ménages)',
    province: 'Kwilu',
    cropCode: 'MAIS',
    cropName: 'Maïs grain (Cycle de 4 mois)',
    surfaceArea: 1,
    surfaceUnit: 'HA',
    expectedYieldTotal: 2500,
    commercializedQty: 2200,
    productionUnit: 'KG',
    unitSalePriceUsd: 0.5,
    otherRevenueUsd: 30,
    exchangeRateCdfPerUsd: 2850,
    results: {
      grossRevenueUsd: 1130.0,
      totalExpensesUsd: 489.0,
      netProfitUsd: 641.0,
      costPerProductionUnitUsd: 0.2,
      breakevenProductionQty: 978,
      netProfitMarginPercent: 56.7,
      isProfitable: true,
    },
    expenses: [
      { id: 'e4-1', stage: 'LAND_PREP', label: 'Défrichage et labour', unit: 'H/J', quantity: 32, unitCostUsd: 3.0, costType: 'FIXED' },
      { id: 'e4-2', stage: 'SEEDS', label: 'Semences maïs hybride (25kg)', unit: 'Kg', quantity: 25, unitCostUsd: 2.2, costType: 'VARIABLE' },
      { id: 'e4-3', stage: 'MAINTENANCE', label: 'Sarclage et buttage', unit: 'H/J', quantity: 30, unitCostUsd: 3.0, costType: 'VARIABLE' },
      { id: 'e4-4', stage: 'HARVEST', label: 'Récolte, égrenage & sacs', unit: 'H/J', quantity: 30, unitCostUsd: 3.2, costType: 'VARIABLE' },
    ],
    createdAt: '2026-11-04T16:20:00.000Z',
  },
  {
    id: 'sim-5',
    shareCode: 'AVN-8421',
    title: 'Café Robusta séché sur claies — Idiofa',
    producerName: 'Union des Planteurs d’Idiofa / CAPSA (34 ménages)',
    province: 'Kwilu',
    cropCode: 'CAFE_ROBUSTA',
    cropName: 'Café Robusta (Campagne annuelle en production)',
    surfaceArea: 1.2,
    surfaceUnit: 'HA',
    expectedYieldTotal: 1450,
    commercializedQty: 1400,
    productionUnit: 'KG',
    unitSalePriceUsd: 1.9,
    otherRevenueUsd: 60,
    exchangeRateCdfPerUsd: 2850,
    results: {
      grossRevenueUsd: 2720.0,
      totalExpensesUsd: 1245.0,
      netProfitUsd: 1475.0,
      costPerProductionUnitUsd: 0.86,
      breakevenProductionQty: 655,
      netProfitMarginPercent: 54.2,
      isProfitable: true,
    },
    expenses: [
      { id: 'e5-1', stage: 'LAND_PREP', label: 'Piquetage et taille d’entretien', unit: 'Ha', quantity: 1.2, unitCostUsd: 70, costType: 'FIXED' },
      { id: 'e5-2', stage: 'MAINTENANCE', label: 'Sarclage & apport compost', unit: 'H/J', quantity: 65, unitCostUsd: 3.5, costType: 'VARIABLE' },
      { id: 'e5-3', stage: 'HARVEST', label: 'Cueillette rouge & claies solaires', unit: 'H/J', quantity: 72, unitCostUsd: 4.0, costType: 'VARIABLE' },
    ],
    createdAt: '2026-10-28T08:45:00.000Z',
  },
  {
    id: 'sim-6',
    shareCode: 'AVN-6215',
    title: 'Niébé & Légumineuses vivrières — Popokabaka',
    producerName: 'Association Féminine de Popokabaka (18 femmes)',
    province: 'Kwango',
    cropCode: 'ARACHIDE_NIEBE',
    cropName: 'Arachide / Niébé (Légumineuse à haute valeur nutritive)',
    surfaceArea: 0.8,
    surfaceUnit: 'HA',
    expectedYieldTotal: 880,
    commercializedQty: 760,
    productionUnit: 'KG',
    unitSalePriceUsd: 1.35,
    otherRevenueUsd: 25,
    exchangeRateCdfPerUsd: 2850,
    results: {
      grossRevenueUsd: 1051.0,
      totalExpensesUsd: 486.0,
      netProfitUsd: 565.0,
      costPerProductionUnitUsd: 0.55,
      breakevenProductionQty: 360,
      netProfitMarginPercent: 53.8,
      isProfitable: true,
    },
    expenses: [
      { id: 'e6-1', stage: 'LAND_PREP', label: 'Préparation du lit de semis', unit: 'H/J', quantity: 24, unitCostUsd: 3.0, costType: 'FIXED' },
      { id: 'e6-2', stage: 'SEEDS', label: 'Semences certifiées de niébé', unit: 'Kg', quantity: 60, unitCostUsd: 1.8, costType: 'VARIABLE' },
      { id: 'e6-3', stage: 'HARVEST', label: 'Récolte et battage', unit: 'H/J', quantity: 30, unitCostUsd: 3.2, costType: 'VARIABLE' },
    ],
    createdAt: '2026-10-22T13:10:00.000Z',
  },
  {
    id: 'sim-7',
    shareCode: 'AVN-4412',
    title: 'Manioc de bas-fond & cossettes séchées — Feshi',
    producerName: 'Groupement Agricole Feshi-Sud (12 ménages)',
    province: 'Kwango',
    cropCode: 'MANIOC',
    cropName: 'Manioc amélioré (Cossettes / Chikwangue)',
    surfaceArea: 2,
    surfaceUnit: 'HA',
    expectedYieldTotal: 6400,
    commercializedQty: 5200,
    productionUnit: 'KG',
    unitSalePriceUsd: 0.52,
    otherRevenueUsd: 50,
    exchangeRateCdfPerUsd: 2850,
    results: {
      grossRevenueUsd: 2754.0,
      totalExpensesUsd: 1420.0,
      netProfitUsd: 1334.0,
      costPerProductionUnitUsd: 0.22,
      breakevenProductionQty: 2730,
      netProfitMarginPercent: 48.4,
      isProfitable: true,
    },
    expenses: [
      { id: 'e7-1', stage: 'LAND_PREP', label: 'Labour et drainage', unit: 'H/J', quantity: 70, unitCostUsd: 3.0, costType: 'FIXED' },
      { id: 'e7-2', stage: 'SEEDS', label: 'Boutures TMC 419', unit: 'Bottes', quantity: 90, unitCostUsd: 2.5, costType: 'VARIABLE' },
      { id: 'e7-3', stage: 'HARVEST', label: 'Récolte et séchage', unit: 'H/J', quantity: 60, unitCostUsd: 3.0, costType: 'VARIABLE' },
    ],
    createdAt: '2026-10-14T10:00:00.000Z',
  },
  {
    id: 'sim-8',
    shareCode: 'AVN-9104',
    title: 'Campagne Cacao agroforestier 3 ha — Bagata',
    producerName: 'Coopérative Cacaoyère Bagata (42 ménages)',
    province: 'Kwilu',
    cropCode: 'CACAO',
    cropName: 'Cacao (Cacaoyère villageoise durable)',
    surfaceArea: 3,
    surfaceUnit: 'HA',
    expectedYieldTotal: 3000,
    commercializedQty: 2940,
    productionUnit: 'KG',
    unitSalePriceUsd: 2.65,
    otherRevenueUsd: 150,
    exchangeRateCdfPerUsd: 2850,
    results: {
      grossRevenueUsd: 7941.0,
      totalExpensesUsd: 3680.0,
      netProfitUsd: 4261.0,
      costPerProductionUnitUsd: 1.23,
      breakevenProductionQty: 1388,
      netProfitMarginPercent: 53.7,
      isProfitable: true,
    },
    expenses: [
      { id: 'e8-1', stage: 'LAND_PREP', label: 'Aménagement agroforestier', unit: 'Ha', quantity: 3, unitCostUsd: 75, costType: 'FIXED' },
      { id: 'e8-2', stage: 'MAINTENANCE', label: 'Entretien et émondage bananiers', unit: 'H/J', quantity: 180, unitCostUsd: 3.5, costType: 'VARIABLE' },
      { id: 'e8-3', stage: 'HARVEST', label: 'Écabossage & fermentation', unit: 'H/J', quantity: 210, unitCostUsd: 4.0, costType: 'VARIABLE' },
    ],
    createdAt: '2026-09-30T15:30:00.000Z',
  },
  {
    id: 'sim-9',
    shareCode: 'AVN-3320',
    title: 'Maïs jaune & rotation légumineuse — Gungu',
    producerName: 'Groupement Agricole Gungu-Nord (19 ménages)',
    province: 'Kwilu',
    cropCode: 'MAIS',
    cropName: 'Maïs grain (Cycle de 4 mois)',
    surfaceArea: 1.5,
    surfaceUnit: 'HA',
    expectedYieldTotal: 3750,
    commercializedQty: 3300,
    productionUnit: 'KG',
    unitSalePriceUsd: 0.48,
    otherRevenueUsd: 40,
    exchangeRateCdfPerUsd: 2850,
    results: {
      grossRevenueUsd: 1624.0,
      totalExpensesUsd: 735.0,
      netProfitUsd: 889.0,
      costPerProductionUnitUsd: 0.2,
      breakevenProductionQty: 1531,
      netProfitMarginPercent: 54.7,
      isProfitable: true,
    },
    expenses: [
      { id: 'e9-1', stage: 'LAND_PREP', label: 'Labour et hersage', unit: 'H/J', quantity: 45, unitCostUsd: 3.0, costType: 'FIXED' },
      { id: 'e9-2', stage: 'SEEDS', label: 'Semences maïs (38 kg)', unit: 'Kg', quantity: 38, unitCostUsd: 2.2, costType: 'VARIABLE' },
      { id: 'e9-3', stage: 'HARVEST', label: 'Égrenage et emballage', unit: 'H/J', quantity: 45, unitCostUsd: 3.2, costType: 'VARIABLE' },
    ],
    createdAt: '2026-09-18T11:20:00.000Z',
  },
  {
    id: 'sim-10',
    shareCode: 'AVN-7815',
    title: 'Café Robusta jeune plantation — Kasongo-Lunda',
    producerName: 'Ménage Mavungu & Fils (Kasongo-Lunda)',
    province: 'Kwango',
    cropCode: 'CAFE_ROBUSTA',
    cropName: 'Café Robusta (Campagne annuelle en production)',
    surfaceArea: 1,
    surfaceUnit: 'HA',
    expectedYieldTotal: 950,
    commercializedQty: 900,
    productionUnit: 'KG',
    unitSalePriceUsd: 1.8,
    otherRevenueUsd: 30,
    exchangeRateCdfPerUsd: 2850,
    results: {
      grossRevenueUsd: 1650.0,
      totalExpensesUsd: 890.0,
      netProfitUsd: 760.0,
      costPerProductionUnitUsd: 0.94,
      breakevenProductionQty: 494,
      netProfitMarginPercent: 46.1,
      isProfitable: true,
    },
    expenses: [
      { id: 'e10-1', stage: 'LAND_PREP', label: 'Entretien parcelle', unit: 'Ha', quantity: 1, unitCostUsd: 65, costType: 'FIXED' },
      { id: 'e10-2', stage: 'MAINTENANCE', label: 'Sarclage & paillage', unit: 'H/J', quantity: 50, unitCostUsd: 3.5, costType: 'VARIABLE' },
      { id: 'e10-3', stage: 'HARVEST', label: 'Récolte sélective', unit: 'H/J', quantity: 48, unitCostUsd: 4.0, costType: 'VARIABLE' },
    ],
    createdAt: '2026-09-05T09:15:00.000Z',
  },
  {
    id: 'sim-11',
    shareCode: 'AVN-5120',
    title: 'Arachide de saison A — Bulungu',
    producerName: 'Groupement Féminin Mwinda (14 femmes)',
    province: 'Kwilu',
    cropCode: 'ARACHIDE_NIEBE',
    cropName: 'Arachide / Niébé (Légumineuse à haute valeur nutritive)',
    surfaceArea: 1,
    surfaceUnit: 'HA',
    expectedYieldTotal: 1100,
    commercializedQty: 950,
    productionUnit: 'KG',
    unitSalePriceUsd: 1.35,
    otherRevenueUsd: 30,
    exchangeRateCdfPerUsd: 2850,
    results: {
      grossRevenueUsd: 1312.5,
      totalExpensesUsd: 605.0,
      netProfitUsd: 707.5,
      costPerProductionUnitUsd: 0.55,
      breakevenProductionQty: 448,
      netProfitMarginPercent: 53.9,
      isProfitable: true,
    },
    expenses: [
      { id: 'e11-1', stage: 'LAND_PREP', label: 'Labour et billonnage', unit: 'H/J', quantity: 30, unitCostUsd: 3.0, costType: 'FIXED' },
      { id: 'e11-2', stage: 'SEEDS', label: 'Semences arachide (80 kg)', unit: 'Kg', quantity: 80, unitCostUsd: 1.8, costType: 'VARIABLE' },
      { id: 'e11-3', stage: 'HARVEST', label: 'Arrachage & décorticage', unit: 'H/J', quantity: 38, unitCostUsd: 3.2, costType: 'VARIABLE' },
    ],
    createdAt: '2026-08-25T14:40:00.000Z',
  },
  {
    id: 'sim-12',
    shareCode: 'AVN-8840',
    title: 'Manioc & pondu en association maraîchère — Kikwit Ouest',
    producerName: 'Ménage Kapita (Kikwit Ouest)',
    province: 'Kwilu',
    cropCode: 'MANIOC',
    cropName: 'Manioc amélioré (Cossettes / Chikwangue)',
    surfaceArea: 1,
    surfaceUnit: 'HA',
    expectedYieldTotal: 3200,
    commercializedQty: 2600,
    productionUnit: 'KG',
    unitSalePriceUsd: 0.55,
    otherRevenueUsd: 60,
    exchangeRateCdfPerUsd: 2850,
    results: {
      grossRevenueUsd: 1490.0,
      totalExpensesUsd: 755.0,
      netProfitUsd: 735.0,
      costPerProductionUnitUsd: 0.24,
      breakevenProductionQty: 1372,
      netProfitMarginPercent: 49.3,
      isProfitable: true,
    },
    expenses: [
      { id: 'e12-1', stage: 'LAND_PREP', label: 'Préparation billons', unit: 'H/J', quantity: 40, unitCostUsd: 3.0, costType: 'FIXED' },
      { id: 'e12-2', stage: 'SEEDS', label: 'Boutures certifiées', unit: 'Bottes', quantity: 50, unitCostUsd: 2.5, costType: 'VARIABLE' },
      { id: 'e12-3', stage: 'HARVEST', label: 'Récolte racines & feuilles', unit: 'H/J', quantity: 40, unitCostUsd: 3.0, costType: 'VARIABLE' },
    ],
    createdAt: '2026-08-10T16:00:00.000Z',
  },
  {
    id: 'sim-13',
    shareCode: 'AVN-2910',
    title: 'Café Robusta réhabilité — Gungu Centre',
    producerName: 'Coopérative Caféière du Kwilu (31 ménages)',
    province: 'Kwilu',
    cropCode: 'CAFE_ROBUSTA',
    cropName: 'Café Robusta (Campagne annuelle en production)',
    surfaceArea: 2,
    surfaceUnit: 'HA',
    expectedYieldTotal: 2400,
    commercializedQty: 2300,
    productionUnit: 'KG',
    unitSalePriceUsd: 1.85,
    otherRevenueUsd: 80,
    exchangeRateCdfPerUsd: 2850,
    results: {
      grossRevenueUsd: 4335.0,
      totalExpensesUsd: 2015.0,
      netProfitUsd: 2320.0,
      costPerProductionUnitUsd: 0.84,
      breakevenProductionQty: 1089,
      netProfitMarginPercent: 53.5,
      isProfitable: true,
    },
    expenses: [
      { id: 'e13-1', stage: 'LAND_PREP', label: 'Taille de rajeunissement', unit: 'Ha', quantity: 2, unitCostUsd: 65, costType: 'FIXED' },
      { id: 'e13-2', stage: 'MAINTENANCE', label: 'Sarclage et fertilisation', unit: 'H/J', quantity: 110, unitCostUsd: 3.5, costType: 'VARIABLE' },
      { id: 'e13-3', stage: 'HARVEST', label: 'Récolte cerises & claies', unit: 'H/J', quantity: 120, unitCostUsd: 4.0, costType: 'VARIABLE' },
    ],
    createdAt: '2026-07-28T10:30:00.000Z',
  },
  {
    id: 'sim-14',
    shareCode: 'AVN-6632',
    title: 'Niébé grain & fane pour fourrage — Kenge Plateau',
    producerName: 'Union Paysanne du Kwango (26 ménages)',
    province: 'Kwango',
    cropCode: 'ARACHIDE_NIEBE',
    cropName: 'Arachide / Niébé (Légumineuse à haute valeur nutritive)',
    surfaceArea: 1.2,
    surfaceUnit: 'HA',
    expectedYieldTotal: 1320,
    commercializedQty: 1140,
    productionUnit: 'KG',
    unitSalePriceUsd: 1.3,
    otherRevenueUsd: 40,
    exchangeRateCdfPerUsd: 2850,
    results: {
      grossRevenueUsd: 1522.0,
      totalExpensesUsd: 720.0,
      netProfitUsd: 802.0,
      costPerProductionUnitUsd: 0.55,
      breakevenProductionQty: 553,
      netProfitMarginPercent: 52.7,
      isProfitable: true,
    },
    expenses: [
      { id: 'e14-1', stage: 'LAND_PREP', label: 'Préparation sol savane', unit: 'H/J', quantity: 36, unitCostUsd: 3.0, costType: 'FIXED' },
      { id: 'e14-2', stage: 'SEEDS', label: 'Semences niébé (90 kg)', unit: 'Kg', quantity: 90, unitCostUsd: 1.8, costType: 'VARIABLE' },
      { id: 'e14-3', stage: 'HARVEST', label: 'Récolte et vannage', unit: 'H/J', quantity: 45, unitCostUsd: 3.2, costType: 'VARIABLE' },
    ],
    createdAt: '2026-07-15T15:00:00.000Z',
  },
  {
    id: 'sim-15',
    shareCode: 'AVN-4050',
    title: 'Maïs & Niébé en couloir agroforestier — Idiofa',
    producerName: 'Groupement Bangu-Bangu (20 ménages)',
    province: 'Kwilu',
    cropCode: 'MAIS',
    cropName: 'Maïs grain (Cycle de 4 mois)',
    surfaceArea: 1.5,
    surfaceUnit: 'HA',
    expectedYieldTotal: 3600,
    commercializedQty: 3100,
    productionUnit: 'KG',
    unitSalePriceUsd: 0.5,
    otherRevenueUsd: 50,
    exchangeRateCdfPerUsd: 2850,
    results: {
      grossRevenueUsd: 1600.0,
      totalExpensesUsd: 740.0,
      netProfitUsd: 860.0,
      costPerProductionUnitUsd: 0.21,
      breakevenProductionQty: 1480,
      netProfitMarginPercent: 53.8,
      isProfitable: true,
    },
    expenses: [
      { id: 'e15-1', stage: 'LAND_PREP', label: 'Labour à plat', unit: 'H/J', quantity: 48, unitCostUsd: 3.0, costType: 'FIXED' },
      { id: 'e15-2', stage: 'SEEDS', label: 'Semences certifiées', unit: 'Kg', quantity: 38, unitCostUsd: 2.2, costType: 'VARIABLE' },
      { id: 'e15-3', stage: 'HARVEST', label: 'Récolte et stockage PICS', unit: 'H/J', quantity: 45, unitCostUsd: 3.2, costType: 'VARIABLE' },
    ],
    createdAt: '2026-06-25T11:45:00.000Z',
  },
  {
    id: 'sim-16',
    shareCode: 'AVN-1102',
    title: 'Cacaoyère pilote régénérée — Bulungu Centre',
    producerName: 'Ménage Mama Nzuzi (Bulungu - 9 personnes)',
    province: 'Kwilu',
    cropCode: 'CACAO',
    cropName: 'Cacao (Cacaoyère villageoise durable)',
    surfaceArea: 1,
    surfaceUnit: 'HA',
    expectedYieldTotal: 1000,
    commercializedQty: 980,
    productionUnit: 'KG',
    unitSalePriceUsd: 2.6,
    otherRevenueUsd: 50,
    exchangeRateCdfPerUsd: 2850,
    results: {
      grossRevenueUsd: 2598.0,
      totalExpensesUsd: 1220.0,
      netProfitUsd: 1378.0,
      costPerProductionUnitUsd: 1.22,
      breakevenProductionQty: 469,
      netProfitMarginPercent: 53.0,
      isProfitable: true,
    },
    expenses: [
      { id: 'e16-1', stage: 'LAND_PREP', label: 'Nettoyage & taille sanitaire', unit: 'Ha', quantity: 1, unitCostUsd: 75, costType: 'FIXED' },
      { id: 'e16-2', stage: 'MAINTENANCE', label: 'Sarclage & ombrage', unit: 'H/J', quantity: 65, unitCostUsd: 3.5, costType: 'VARIABLE' },
      { id: 'e16-3', stage: 'HARVEST', label: 'Fermentation caisses & séchage', unit: 'H/J', quantity: 70, unitCostUsd: 4.0, costType: 'VARIABLE' },
    ],
    createdAt: '2026-06-12T08:30:00.000Z',
  },
];

// Helper to calculate filtered stats dynamically based on any selected period
export function calculateFilteredStats(
  simulations: SavedSimulationDto[],
  period: TimePeriodFilter
): AdminStatsData {
  const now = new Date('2026-11-18T20:00:00.000Z').getTime();

  const filtered = simulations.filter((s) => {
    if (period === 'ALL') return true;
    const simTime = new Date(s.createdAt || '2026-10-01').getTime();
    const diffDays = (now - simTime) / (1000 * 60 * 60 * 24);

    if (period === '7D') return diffDays <= 7;
    if (period === '30D') return diffDays <= 30;
    if (period === '3M') return diffDays <= 90; // Season A (Sep - Nov)
    if (period === '6M') return diffDays <= 180;
    if (period === '1Y') return diffDays <= 365;
    return true;
  });

  let totalSurfaceAreaHa = 0;
  let totalProductionKg = 0;
  let totalRevenueUsd = 0;
  let totalCostUsd = 0;
  let totalNetProfitUsd = 0;
  let totalHouseholds = 0;

  const countByProvince: Record<string, number> = { Kwilu: 0, Kwango: 0 };
  const countByCrop: Record<string, number> = {};

  // Monthly buckets for the chart (Juin, Juil, Août, Sept, Oct, Nov)
  const monthMap: Record<string, MonthlyBarData> = {
    '06': { month: 'Juin', revenue: 0, expense: 0, net: 0 },
    '07': { month: 'Juil', revenue: 0, expense: 0, net: 0 },
    '08': { month: 'Août', revenue: 0, expense: 0, net: 0 },
    '09': { month: 'Sept', revenue: 0, expense: 0, net: 0 },
    '10': { month: 'Oct', revenue: 0, expense: 0, net: 0 },
    '11': { month: 'Nov', revenue: 0, expense: 0, net: 0 },
  };

  filtered.forEach((sim) => {
    totalSurfaceAreaHa += Number(sim.surfaceArea) || 0;
    totalProductionKg += Number(sim.expectedYieldTotal) || 0;

    // Approximate households based on title / producer
    let hh = 1;
    const match = (sim.producerName || '').match(/(\d+)\s*(?:ménages|personnes|femmes)/i);
    if (match) {
      hh = parseInt(match[1], 10);
    } else if ((sim.producerName || '').includes('Coopérative') || (sim.producerName || '').includes('Groupement')) {
      hh = 15;
    }
    totalHouseholds += hh;

    const res: any = sim.results || {};
    const rev = Number(res.grossRevenueUsd) || 0;
    const exp = Number(res.totalExpensesUsd) || 0;
    const profit = Number(res.netProfitUsd) || (rev - exp);

    totalRevenueUsd += rev;
    totalCostUsd += exp;
    totalNetProfitUsd += profit;

    const prov = sim.province || 'Kwilu';
    countByProvince[prov] = (countByProvince[prov] || 0) + 1;

    const crop = sim.cropName || 'Autre';
    countByCrop[crop] = (countByCrop[crop] || 0) + 1;

    // Month breakdown
    if (sim.createdAt) {
      const m = sim.createdAt.slice(5, 7);
      if (monthMap[m]) {
        monthMap[m].revenue += rev;
        monthMap[m].expense += exp;
        monthMap[m].net += profit;
      }
    }
  });

  const averageNetMarginPercent =
    totalRevenueUsd > 0 ? (totalNetProfitUsd / totalRevenueUsd) * 100 : 0;
  const targetHouseholds = 8000;
  const progressGoalPercent = Math.min(100, Math.round((totalHouseholds / targetHouseholds) * 100 * 10) / 10);

  return {
    totalSimulations: filtered.length,
    totalHouseholds,
    targetHouseholds,
    progressGoalPercent,
    totalSurfaceAreaHa: Math.round(totalSurfaceAreaHa * 10) / 10,
    totalProductionKg: Math.round(totalProductionKg),
    totalRevenueUsd: Math.round(totalRevenueUsd),
    totalCostUsd: Math.round(totalCostUsd),
    totalNetProfitUsd: Math.round(totalNetProfitUsd),
    averageNetMarginPercent: Math.round(averageNetMarginPercent * 10) / 10,
    countByProvince,
    countByCrop,
    monthlyBars: Object.values(monthMap),
  };
}

export const FALLBACK_ADMIN_STATS: AdminStatsData = calculateFilteredStats(RICH_INITIAL_SIMULATIONS, 'ALL');

export const adminSyncService = {
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  },

  // 1. STATS
  async getStats(period: TimePeriodFilter = 'ALL'): Promise<AdminStatsData> {
    const sims = await this.getAllSimulations();
    return calculateFilteredStats(sims, period);
  },

  // 2. SIMULATIONS
  async getAllSimulations(): Promise<SavedSimulationDto[]> {
    try {
      const res = await axios.get<SavedSimulationDto[]>(`${API_BASE}/api/simulations/all`, { timeout: 4000 });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        // Merge with rich examples if server has only few
        const merged = [...res.data];
        RICH_INITIAL_SIMULATIONS.forEach((rich) => {
          if (!merged.some((m) => m.shareCode === rich.shareCode)) {
            merged.push(rich);
          }
        });
        localStorage.setItem(CACHE_KEYS.SIMULATIONS, JSON.stringify(merged));
        return merged;
      }
    } catch {
      // offline fallback
    }

    const cached = localStorage.getItem(CACHE_KEYS.SIMULATIONS);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return RICH_INITIAL_SIMULATIONS;
  },

  async deleteSimulation(id: string): Promise<boolean> {
    try {
      await axios.delete(`${API_BASE}/api/simulations/${id}`, { timeout: 4000 });
    } catch {}

    const cached = localStorage.getItem(CACHE_KEYS.SIMULATIONS);
    if (cached) {
      try {
        const list: SavedSimulationDto[] = JSON.parse(cached);
        const filtered = list.filter((s) => s.id !== id);
        localStorage.setItem(CACHE_KEYS.SIMULATIONS, JSON.stringify(filtered));
      } catch {}
    }
    return true;
  },

  // 3. CROPS
  async getAllCrops(): Promise<CropTemplateDto[]> {
    try {
      const res = await axios.get<CropTemplateDto[]>(`${API_BASE}/api/crops`, { timeout: 4000 });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        localStorage.setItem(CACHE_KEYS.CROPS, JSON.stringify(res.data));
        return res.data;
      }
    } catch {}

    const cached = localStorage.getItem(CACHE_KEYS.CROPS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return [];
  },

  async saveCrop(crop: Partial<CropTemplateDto>): Promise<CropTemplateDto> {
    let savedCrop: CropTemplateDto | null = null;
    try {
      if (crop.id && !crop.id.startsWith('local-')) {
        const res = await axios.put<CropTemplateDto>(`${API_BASE}/api/crops/${crop.id}`, crop, { timeout: 4000 });
        savedCrop = res.data;
      } else {
        const res = await axios.post<CropTemplateDto>(`${API_BASE}/api/crops`, crop, { timeout: 4000 });
        savedCrop = res.data;
      }
    } catch {}

    if (!savedCrop) {
      savedCrop = {
        id: crop.id || `local-crop-${Date.now()}`,
        code: crop.code || 'CROP',
        nameFr: crop.nameFr || 'Nouvelle culture',
        localName: crop.localName || null,
        category: crop.category || 'FOOD_CROP',
        icon: crop.icon || '🌱',
        descriptionFr: crop.descriptionFr || '',
        cycleDurationMonths: crop.cycleDurationMonths || 12,
        recommendedProvince: crop.recommendedProvince || 'Kwilu & Kwango',
        defaultSurfaceArea: crop.defaultSurfaceArea || 1,
        defaultSurfaceUnit: crop.defaultSurfaceUnit || 'HA',
        defaultYieldPerHa: crop.defaultYieldPerHa || 1000,
        defaultCommercialQty: crop.defaultCommercialQty || 900,
        productionUnit: crop.productionUnit || 'KG',
        unitWeightKg: crop.unitWeightKg || 1,
        defaultSalePriceUsd: crop.defaultSalePriceUsd || 1.5,
        nutritionTipFr: crop.nutritionTipFr || '',
        agronomicTipFr: crop.agronomicTipFr || '',
        isActive: crop.isActive ?? true,
        defaultExpenses: crop.defaultExpenses || [],
      } as CropTemplateDto;
    }

    const cached = localStorage.getItem(CACHE_KEYS.CROPS);
    let list: CropTemplateDto[] = cached ? JSON.parse(cached) : [];
    const index = list.findIndex((c) => c.id === savedCrop!.id || c.code === savedCrop!.code);
    if (index >= 0) {
      list[index] = savedCrop;
    } else {
      list.push(savedCrop);
    }
    localStorage.setItem(CACHE_KEYS.CROPS, JSON.stringify(list));
    return savedCrop;
  },

  async deleteCrop(id: string): Promise<boolean> {
    try {
      await axios.delete(`${API_BASE}/api/crops/${id}`, { timeout: 4000 });
    } catch {}

    const cached = localStorage.getItem(CACHE_KEYS.CROPS);
    if (cached) {
      try {
        const list: CropTemplateDto[] = JSON.parse(cached);
        const filtered = list.filter((c) => c.id !== id);
        localStorage.setItem(CACHE_KEYS.CROPS, JSON.stringify(filtered));
      } catch {}
    }
    return true;
  },

  // 4. USERS
  async getAllUsers(): Promise<AuthPortalUserDto[]> {
    try {
      const res = await axios.get<AuthPortalUserDto[]>(`${API_BASE}/api/auth-portal/users`, { timeout: 4000 });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        localStorage.setItem(CACHE_KEYS.USERS, JSON.stringify(res.data));
        return res.data;
      }
    } catch {}

    const cached = localStorage.getItem(CACHE_KEYS.USERS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }

    return [
      {
        id: 'user-admin-1',
        name: 'Direction Projet AVENIR (Rikolto RDC)',
        email: 'admin@rikolto.org',
        role: 'ADMIN',
        organization: 'Rikolto RDC — Projet AVENIR',
        province: 'Kwilu & Kwango',
      },
      {
        id: 'user-fac-1',
        name: 'Yvonne Kapinga (Animateur Kikwit)',
        email: 'yvonne.kapinga@rikolto.org',
        role: 'FACILITATOR',
        organization: 'Rikolto RDC — Antenne Kikwit',
        province: 'Kwilu',
      },
      {
        id: 'user-fac-2',
        name: 'Jean-Paul Mbemba (Animateur Kenge)',
        email: 'jeanpaul.mbemba@rikolto.org',
        role: 'FACILITATOR',
        organization: 'Rikolto RDC — Antenne Kenge',
        province: 'Kwango',
      },
      {
        id: 'user-fac-3',
        name: 'Alain Mukwa (Conseiller Bulungu)',
        email: 'alain.mukwa@rikolto.org',
        role: 'FACILITATOR',
        organization: 'Rikolto RDC — Antenne Bulungu',
        province: 'Kwilu',
      },
      {
        id: 'user-prod-1',
        name: 'Thérèse Nzuzi (Coopérative CAPSA)',
        email: 'therese.nzuzi@capsa.org',
        role: 'PRODUCER',
        organization: 'Coopérative Agricole CAPSA Idiofa',
        province: 'Kwilu',
      },
    ];
  },

  async saveUser(user: Partial<AuthPortalUserDto> & { password?: string }): Promise<AuthPortalUserDto> {
    let saved: AuthPortalUserDto | null = null;
    try {
      if (user.id && !user.id.startsWith('local-')) {
        const res = await axios.put<AuthPortalUserDto>(`${API_BASE}/api/auth-portal/users/${user.id}`, user, {
          timeout: 4000,
        });
        saved = res.data;
      } else {
        const res = await axios.post<{ user?: AuthPortalUserDto }>(
          `${API_BASE}/api/auth-portal/register`,
          {
            name: user.name,
            email: user.email,
            password: user.password || 'Avenir2026!',
            province: user.province || 'Kwilu',
            role: user.role || 'FACILITATOR',
          },
          { timeout: 4000 }
        );
        if (res.data?.user) saved = res.data.user;
      }
    } catch {}

    if (!saved) {
      saved = {
        id: user.id || `local-user-${Date.now()}`,
        name: user.name || 'Nouvel utilisateur',
        email: user.email || 'user@rikolto.org',
        role: user.role || 'FACILITATOR',
        organization: user.organization || 'Rikolto RDC - Projet AVENIR',
        province: user.province || 'Kwilu',
      };
    }

    const cached = localStorage.getItem(CACHE_KEYS.USERS);
    let list: AuthPortalUserDto[] = cached ? JSON.parse(cached) : [];
    const index = list.findIndex((u) => u.id === saved!.id || u.email === saved!.email);
    if (index >= 0) {
      list[index] = saved;
    } else {
      list.push(saved);
    }
    localStorage.setItem(CACHE_KEYS.USERS, JSON.stringify(list));
    return saved;
  },

  async deleteUser(id: string): Promise<boolean> {
    try {
      await axios.delete(`${API_BASE}/api/auth-portal/users/${id}`, { timeout: 4000 });
    } catch {}

    const cached = localStorage.getItem(CACHE_KEYS.USERS);
    if (cached) {
      try {
        const list: AuthPortalUserDto[] = JSON.parse(cached);
        const filtered = list.filter((u) => u.id !== id);
        localStorage.setItem(CACHE_KEYS.USERS, JSON.stringify(filtered));
      } catch {}
    }
    return true;
  },

  // 5. SETTINGS
  getSettings(): AdminProjectSettings {
    const cached = localStorage.getItem(CACHE_KEYS.SETTINGS);
    if (cached) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
      } catch {}
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: Partial<AdminProjectSettings>): AdminProjectSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(CACHE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  clearAllCache(): void {
    Object.values(CACHE_KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
