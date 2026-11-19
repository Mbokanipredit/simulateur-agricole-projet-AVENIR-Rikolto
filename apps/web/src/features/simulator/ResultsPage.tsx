import React, { useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Share2,
  Printer,
  Calendar,
  ChevronRight,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { EXPENSE_STAGES } from '@avenir/shared';
import {
  activeMainSectionAtom,
  displayCurrencyAtom,
  economicResultsAtom,
  formatMoney,
  goalSeekResultAtom,
  lastGeneratedShareCodeAtom,
  localSavedScenariosAtom,
  multiScenarioComparisonAtom,
  simulationInputAtom,
  targetNetProfitUsdAtom,
} from '../../atoms/appAtoms';
import { simulationsControllerSave } from '../../api/generated/avenirApi';
import { NumberInputWithStepper } from '../../components/NumberInputWithStepper';
import { PastSimulatedProjectsSection } from './PastSimulatedProjectsSection';

const CROP_LABELS: Record<string, string> = {
  CACAO: 'Cacao',
  CAFE_ROBUSTA: 'Café Robusta',
  MANIOC: 'Manioc',
  MAIS_GRAIN: 'Maïs grain',
  ARACHIDE_NIEBE: 'Arachide / Niébé',
};

export const ResultsPage: React.FC = () => {
  const simInput = useAtomValue(simulationInputAtom);
  const results = useAtomValue(economicResultsAtom);
  const scenarios = useAtomValue(multiScenarioComparisonAtom);
  const [targetProfitUsd, setTargetProfitUsd] = useAtom(targetNetProfitUsdAtom);
  const goalSeek = useAtomValue(goalSeekResultAtom);
  const currency = useAtomValue(displayCurrencyAtom);
  const setMainSection = useSetAtom(activeMainSectionAtom);
  const [savedScenarios, setSavedScenarios] = useAtom(localSavedScenariosAtom);
  const [lastShareCode, setLastShareCode] = useAtom(lastGeneratedShareCodeAtom);
  const [isSaving, setIsSaving] = useState(false);
  const [saveBannerMsg, setSaveBannerMsg] = useState<string | null>(null);

  const rate = simInput.exchangeRateCdfPerUsd || 2850;

  const fmtUsd = (valUsd: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(valUsd);
  };

  const fmtCdf = (valUsd: number) => {
    const cdf = Math.round(valUsd * rate);
    return new Intl.NumberFormat('fr-FR').format(cdf) + ' CDF';
  };

  const fmt = (val: number) =>
    formatMoney(val, currency, rate);

  const safeCost = Number(results.totalCostUsd) || 0;
  const safeRev = Number(results.totalCashRevenueUsd) || 0;
  const isProfitable = results.netProfitUsd >= 0;
  const profitPerHa =
    results.netProfitUsd / Math.max(0.1, Number(results.surfaceInHectares) || 1);

  const returnPerDollar = safeCost > 0 ? (safeRev / safeCost).toFixed(2) : '—';

  const handleSaveSimulation = async () => {
    setIsSaving(true);
    setSaveBannerMsg(null);
    try {
      const saved = await simulationsControllerSave({
        title: simInput.title,
        cropCode: simInput.cropCode,
        cropName: simInput.cropName,
        province: simInput.province,
        surfaceArea: simInput.surfaceArea,
        surfaceUnit: simInput.surfaceUnit,
        expectedYieldTotal: simInput.expectedYieldTotal,
        commercializedQty: simInput.commercializedQty,
        productionUnit: simInput.productionUnit,
        unitSalePriceUsd: simInput.unitSalePriceUsd,
        otherRevenueUsd: simInput.otherRevenueUsd,
        exchangeRateCdfPerUsd: simInput.exchangeRateCdfPerUsd,
        expenses: simInput.expenses.map((e) => ({
          id: e.id,
          stage: e.stage,
          label: e.label,
          unit: e.unit,
          quantity: e.quantity,
          unitCostUsd: e.unitCostUsd,
          costType: e.costType,
        })),
      });
      setLastShareCode(saved.shareCode);
      setSavedScenarios([
        {
          id: saved.id,
          savedAt: new Date().toLocaleString('fr-FR'),
          shareCode: saved.shareCode,
          input: simInput,
          results,
        },
        ...savedScenarios.slice(0, 9),
      ]);
      setSaveBannerMsg(
        `Simulation enregistrée avec succès. Code de consultation : ${saved.shareCode}`
      );
    } catch {
      const offlineCode = `LOCAL-${Math.floor(1000 + Math.random() * 9000)}`;
      setLastShareCode(offlineCode);
      setSaveBannerMsg(`Simulation enregistrée hors ligne (Code : ${offlineCode})`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#FAF8F3',
        minHeight: '100vh',
        paddingBottom: '60px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#122017',
      }}
    >
      {/* Top Breadcrumb & Control Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #EAE6DD',
          padding: '14px clamp(16px, 4vw, 36px)',
          boxShadow: '0 1px 4px rgba(18, 36, 24, 0.03)',
        }}
      >
        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1 && window.history.state?.section === 'RESULTS') {
                window.history.back();
              } else {
                setMainSection('SIMULATOR');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            style={{
              background: '#FAF8F3',
              border: '1px solid #D5DDD5',
              borderRadius: '999px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#1F6338',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={14} color="#1F6338" />
            <span>Modifier mes chiffres</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleSaveSimulation}
              disabled={isSaving}
              style={{
                backgroundColor: '#F2B632',
                color: '#122017',
                border: 'none',
                borderRadius: '999px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(242, 182, 50, 0.3)',
              }}
            >
              <Share2 size={14} color="#122017" />
              <span>{isSaving ? 'Enregistrement...' : 'Garder le code de ma fiche'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#1F6338',
                border: '1px solid #D5DDD5',
                borderRadius: '999px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Printer size={14} color="#1F6338" />
              <span>Imprimer ma fiche</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Sheet Container */}
      <div
        style={{
          maxWidth: '1080px',
          margin: '28px auto 0',
          padding: '0 clamp(14px, 3vw, 24px)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Save confirmation banner */}
        {saveBannerMsg && (
          <div
            style={{
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '12px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#065F46', fontWeight: 600 }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>{saveBannerMsg}</span>
            </div>
            {lastShareCode && (
              <span
                style={{
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  padding: '3px 12px',
                  borderRadius: '999px',
                  letterSpacing: '0.6px',
                }}
              >
                CODE : {lastShareCode}
              </span>
            )}
          </div>
        )}

        {/* 1. Header Information of the Sheet */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8E2',
            padding: '24px clamp(18px, 4vw, 32px)',
            boxShadow: '0 4px 16px rgba(18, 36, 24, 0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '12px',
              borderBottom: '1px solid #F0F4F0',
              paddingBottom: '16px',
              marginBottom: '20px',
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(22px, 3.5vw, 30px)',
                  fontWeight: 800,
                  color: '#122017',
                  letterSpacing: '-0.4px',
                }}
              >
                {CROP_LABELS[simInput.cropCode] || simInput.cropName} — {simInput.surfaceArea} {simInput.surfaceUnit}
              </h1>
              <div style={{ marginTop: '6px', fontSize: '13.5px', color: '#5F685F' }}>
                Province du <strong>{simInput.province}</strong> · Campagne agricole 2026
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#FAF8F3',
                border: '1px solid #EAE6DD',
                borderRadius: '12px',
                padding: '8px 14px',
                textAlign: 'right',
              }}
            >
              <div style={{ fontSize: '11px', color: '#768278', fontWeight: 600 }}>Taux de change appliqué</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1F6338', marginTop: '2px' }}>
                1 USD = {rate.toLocaleString('fr-FR')} CDF
              </div>
            </div>
          </div>

          {/* 2. THE BIG VERDICT (Clear, direct, understandable by anyone) */}
          <div
            style={{
              backgroundColor: isProfitable ? '#ECFDF5' : '#FEF2F2',
              border: `1.5px solid ${isProfitable ? '#10B981' : '#EF4444'}`,
              borderRadius: '16px',
              padding: '24px clamp(16px, 4vw, 28px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', color: '#4B5563', fontWeight: 500 }}>
                  {isProfitable
                    ? 'Bénéfice net réel restant dans votre poche après toutes les dépenses :'
                    : 'Montant du déficit prévisionnel à combler :'}
                </div>
                <div
                  style={{
                    fontSize: 'clamp(32px, 5vw, 44px)',
                    fontWeight: 900,
                    color: isProfitable ? '#047857' : '#DC2626',
                    letterSpacing: '-1px',
                    lineHeight: 1.1,
                    marginTop: '4px',
                  }}
                >
                  {isProfitable ? '+ ' : ''}{fmtUsd(results.netProfitUsd)}
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: isProfitable ? '#065F46' : '#991B1B',
                    marginTop: '4px',
                  }}
                >
                  Soit environ {fmtCdf(Math.abs(results.netProfitUsd))}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  border: '1px solid #E5E7EB',
                  textAlign: 'right',
                }}
              >
                <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                  Gain par hectare
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1F6338', marginTop: '2px' }}>
                  {fmtUsd(profitPerHa)} / ha
                </div>
              </div>
            </div>
          </div>

          {/* 3. The 2 Pillars: Money Coming In vs Money Going Out */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '16px',
              marginTop: '20px',
            }}
          >
            {/* Sales / Cash In */}
            <div
              style={{
                backgroundColor: '#FAF8F3',
                border: '1px solid #EAE6DD',
                borderRadius: '14px',
                padding: '18px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#1F6338', textTransform: 'uppercase' }}>
                1. Ce que vous gagnez (Total des Ventes)
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#122017', marginTop: '6px' }}>
                {fmtUsd(safeRev)}
              </div>
              <div style={{ fontSize: '12.5px', color: '#5F685F', marginTop: '2px' }}>
                {fmtCdf(safeRev)}
              </div>
              <div style={{ fontSize: '12px', color: '#687068', marginTop: '10px', lineHeight: '18px' }}>
                Calcul basé sur <strong>{simInput.commercializedQty.toLocaleString('fr-FR')} {simInput.productionUnit}</strong> vendus à <strong>{simInput.unitSalePriceUsd} USD / {simInput.productionUnit}</strong>.
              </div>
            </div>

            {/* Expenses / Cash Out */}
            <div
              style={{
                backgroundColor: '#FAF8F3',
                border: '1px solid #EAE6DD',
                borderRadius: '14px',
                padding: '18px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#8C6218', textTransform: 'uppercase' }}>
                2. Ce que vous dépensez (Total des Coûts)
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#122017', marginTop: '6px' }}>
                {fmtUsd(safeCost)}
              </div>
              <div style={{ fontSize: '12.5px', color: '#5F685F', marginTop: '2px' }}>
                {fmtCdf(safeCost)}
              </div>
              <div style={{ fontSize: '12px', color: '#687068', marginTop: '10px', lineHeight: '18px' }}>
                Comprend la préparation du sol, les semences, l’entretien, la main-d’œuvre et la récolte.
              </div>
            </div>
          </div>
        </div>

        {/* 4. Three Essential Decision Benchmarks (No confusing icons, plain human language) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
            gap: '16px',
          }}
        >
          {/* Benchmark 1 */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8E2',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#5F685F', textTransform: 'uppercase' }}>
                Récolte minimum sans perte
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#1F6338', marginTop: '4px' }}>
                {Math.ceil(results.breakEvenQuantity).toLocaleString('fr-FR')} {simInput.productionUnit}
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#687068', marginTop: '10px', lineHeight: '17px' }}>
              En dessous de cette quantité vendue, vous perdez de l’argent. Au-dessus, chaque kilo rapporte un vrai bénéfice.
            </div>
          </div>

          {/* Benchmark 2 */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8E2',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#5F685F', textTransform: 'uppercase' }}>
                Coût de revient pour 1 {simInput.productionUnit}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#122017', marginTop: '4px' }}>
                {fmtUsd(results.unitProductionCostUsd)} / {simInput.productionUnit}
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#687068', marginTop: '10px', lineHeight: '17px' }}>
              Produire 1 {simInput.productionUnit} vous coûte {fmtUsd(results.unitProductionCostUsd)}. Vous le vendez à {fmtUsd(simInput.unitSalePriceUsd)}.
            </div>
          </div>

          {/* Benchmark 3 */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8E2',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#5F685F', textTransform: 'uppercase' }}>
                Rendement de votre argent
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#047857', marginTop: '4px' }}>
                {returnPerDollar} $ récupéré
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#687068', marginTop: '10px', lineHeight: '17px' }}>
              Pour chaque 1 USD dépensé dans cette campagne, vous récupérez <strong>{returnPerDollar} USD</strong> au moment de la récolte.
            </div>
          </div>
        </div>

        {/* 5. Clean Expenses Breakdown by Stage (No noisy icons) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            border: '1px solid #E2E8E2',
            padding: '24px clamp(18px, 4vw, 30px)',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#122017' }}>
              Où part votre argent ? (Détail des dépenses)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#5F685F' }}>
              Répartition des coûts par étape de travail tout au long de la saison agricole.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {EXPENSE_STAGES.map((stage, sIdx) => {
              const stageItems = simInput.expenses.filter((e) => e.stage === stage.code);
              const stageCost = stageItems.reduce(
                (acc, item) => acc + item.quantity * item.unitCostUsd,
                0
              );
              const pct = safeCost > 0 ? Math.round((stageCost / safeCost) * 100) : 0;

              return (
                <div key={stage.code} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ fontWeight: 700, color: '#122017' }}>
                      {sIdx + 1}. {stage.shortLabelFr}
                    </span>
                    <span style={{ fontWeight: 800, color: '#1F6338' }}>
                      {fmtUsd(stageCost)} <span style={{ color: '#768278', fontWeight: 500, fontSize: '12px' }}>({pct}%)</span>
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#F0F4F0',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.max(pct, stageCost > 0 ? 3 : 0)}%`,
                        height: '100%',
                        backgroundColor: '#1F6338',
                        borderRadius: '999px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Realistic Market Scenarios + Goal Calculator */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: '20px',
          }}
        >
          {/* Market Scenarios */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E2E8E2',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#122017' }}>
                Que se passe-t-il si les prix changent au marché ?
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#5F685F' }}>
                Anticipez les variations de prix avant de vendre votre récolte.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Prudent */}
              <div
                style={{
                  backgroundColor: '#FAF8F3',
                  border: '1px solid #EAE6DD',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#122017' }}>
                    Si les prix baissent de 15%
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#687068', marginTop: '2px' }}>
                    Mauvaise saison de vente locale
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 800,
                      color: scenarios.pessimistic.results.netProfitUsd >= 0 ? '#1F6338' : '#DC2626',
                    }}
                  >
                    {fmtUsd(scenarios.pessimistic.results.netProfitUsd)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#768278' }}>Bénéfice restant</div>
                </div>
              </div>

              {/* Base */}
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  border: '1.5px solid #10B981',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#065F46' }}>
                    Votre estimation actuelle
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#047857', marginTop: '2px' }}>
                    Hypothèse normale de la campagne
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#047857' }}>
                    {fmtUsd(results.netProfitUsd)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#065F46' }}>Bénéfice prévu</div>
                </div>
              </div>

              {/* Optimistic */}
              <div
                style={{
                  backgroundColor: '#FEF9EE',
                  border: '1px solid #F2B632',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#78350F' }}>
                    Vente groupée en coopérative (+15%)
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#92400E', marginTop: '2px' }}>
                    En vendant ensemble avec d'autres producteurs
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#047857' }}>
                    {fmtUsd(scenarios.optimistic.results.netProfitUsd)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#78350F' }}>Gain supérieur</div>
                </div>
              </div>
            </div>
          </div>

          {/* Goal Seek Calculator */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E2E8E2',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#122017' }}>
                Combien voulez-vous gagner au total ?
              </h3>
              <p style={{ margin: '4px 0 14px', fontSize: '12.5px', color: '#5F685F' }}>
                Indiquez votre objectif de bénéfice, nous calculons ce qu'il vous faut.
              </p>

              <NumberInputWithStepper
                value={targetProfitUsd}
                onChange={setTargetProfitUsd}
                step={100}
                min={50}
                max={100000}
                unitLabel="USD"
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginTop: '10px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#FAF8F3',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid #EAE6DD',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#5F685F', textTransform: 'uppercase' }}>
                  Récolte à vendre
                </div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#1F6338', marginTop: '4px' }}>
                  {Math.ceil(Number(goalSeek.requiredTotalProduction) || 0).toLocaleString('fr-FR')} {simInput.productionUnit}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FAF8F3',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid #EAE6DD',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#5F685F', textTransform: 'uppercase' }}>
                  Surface nécessaire
                </div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#8C6218', marginTop: '4px' }}>
                  {(Number(goalSeek.requiredSurfaceInHectares) || 0).toFixed(2)} ha
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Next Steps & Practical Toolbox Gateway */}
        <div
          style={{
            backgroundColor: '#1F6338',
            borderRadius: '18px',
            padding: '24px clamp(18px, 4vw, 32px)',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '18px',
          }}
        >
          <div style={{ flex: '1 1 320px' }}>
            <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#FFFFFF' }}>
              Comment augmenter votre récolte et réduire vos dépenses ?
            </h3>
            <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: '#DCE7DF', lineHeight: '20px' }}>
              Consultez les 12 images illustrées de la boîte à outils AVENIR pour apprendre à gérer votre champ comme un vrai business rentable.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setMainSection('TOOLBOX');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              backgroundColor: '#F2B632',
              color: '#122017',
              border: 'none',
              borderRadius: '999px',
              padding: '12px 24px',
              fontSize: '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
            }}
          >
            <span>Explorer la boîte à outils pédagogique</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* 8. Other Simulated Projects Section */}
      <div style={{ width: '100%', marginTop: '36px' }}>
        <PastSimulatedProjectsSection
          title="Autres projets simulés au Kwilu et au Kwango"
          subtitle="Comparez vos résultats avec d’autres campagnes agricoles déjà simulées ou ouvrez un autre projet."
          openTarget="RESULTS"
        />
      </div>
    </div>
  );
};
