import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import {
  applySensitivityScenario,
  calculateEconomicResults,
  calculateGoalSeek,
  SimulationInput,
} from '@avenir/shared';

describe('Projet AVENIR — Moteur de Calcul Économique & Aide à la Décision', () => {
  const sampleSimulation: SimulationInput = {
    title: 'Café Robusta 1 ha Kwilu',
    cropCode: 'CAFE_ROBUSTA',
    cropName: 'Café Robusta',
    province: 'Kwilu',
    surfaceArea: 1,
    surfaceUnit: 'HA',
    expectedYieldTotal: 1000,
    commercializedQty: 900,
    productionUnit: 'KG',
    unitSalePriceUsd: 2.0,
    otherRevenueUsd: 100,
    exchangeRateCdfPerUsd: 2850,
    expenses: [
      {
        id: '1',
        stage: 'LAND_PREP',
        label: 'Aménagement',
        unit: 'Forfait',
        quantity: 1,
        unitCostUsd: 100,
        costType: 'FIXED',
      },
      {
        id: '2',
        stage: 'MAINTENANCE',
        label: 'Entretien',
        unit: 'H/J',
        quantity: 100,
        unitCostUsd: 3,
        costType: 'VARIABLE',
      },
      {
        id: '3',
        stage: 'HARVEST',
        label: 'Récolte',
        unit: 'H/J',
        quantity: 50,
        unitCostUsd: 4,
        costType: 'VARIABLE',
      },
    ],
  };

  it('calcule correctement les coûts, recettes, marge brute, bénéfice net et seuil de rentabilité', () => {
    const res = calculateEconomicResults(sampleSimulation);
    assert.strictEqual(res.totalFixedCostUsd, 100);
    assert.strictEqual(res.totalVariableCostUsd, 500);
    assert.strictEqual(res.totalCostUsd, 600);
    assert.strictEqual(res.unitProductionCostUsd, 0.6); // 600 USD / 1000 kg
    assert.strictEqual(res.commercializedRevenueUsd, 1800); // 900 * 2.0
    assert.strictEqual(res.totalCashRevenueUsd, 1900); // 1800 + 100
    assert.strictEqual(res.selfConsumedQty, 100); // 1000 - 900
    assert.strictEqual(res.selfConsumedValueUsd, 200); // 100 * 2.0
    assert.strictEqual(res.grossMarginUsd, 1400); // 1900 - 500
    assert.strictEqual(res.netProfitUsd, 1300); // 1900 - 600
    assert.strictEqual(res.breakEvenQuantity, 250); // (600 - 100) / 2.0 = 250 kg
  });

  it('calcule correctement la simulation inversée pour un objectif de bénéfice de 1 000 USD', () => {
    const goal = calculateGoalSeek({
      targetNetProfitUsd: 1000,
      baseSimulation: sampleSimulation,
    });
    assert.strictEqual(goal.isFeasibleAtCurrentPrice, true);
    assert.ok(goal.requiredSoldQuantity > 0);
    assert.ok(goal.requiredSurfaceInHectares > 0);
  });

  it('applique correctement les scénarios de sensibilité (« Et si ? »)', () => {
    const pessimistic = applySensitivityScenario(sampleSimulation, {
      name: 'Baisse prix -20%',
      priceChangePercent: -20,
      yieldChangePercent: 0,
      costChangePercent: 10,
    });
    assert.strictEqual(pessimistic.input.unitSalePriceUsd, 1.6);
    assert.ok(pessimistic.results.netProfitUsd < 1300);
  });
});

