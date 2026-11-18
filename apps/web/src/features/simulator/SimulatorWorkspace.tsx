import React, { useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { YStack, XStack, Text, Button, Input } from 'tamagui';
import {
  ArrowRight,
  Plus,
  Trash2,
  Sprout,
  Coffee,
  Leaf,
  Wheat,
  Shovel,
  Scissors,
  Package,
  Users,
  ShoppingBasket,
  Truck,
  BarChart3,
  Check,
  FolderDown,
  MapPin,
} from 'lucide-react';
import {
  ExpenseLineItem,
  EXPENSE_STAGES,
  ExpenseStageCode,
  ProductionUnit,
  SurfaceUnit,
} from '@avenir/shared';
import {
  activeMainSectionAtom,
  cropTemplatesAtom,
  displayCurrencyAtom,
  economicResultsAtom,
  formatMoney,
  simulationInputAtom,
} from '../../atoms/appAtoms';
import {
  CropTemplateDto,
  simulationsControllerFindByShareCode,
} from '../../api/generated/avenirApi';
import { NumberInputWithStepper } from '../../components/NumberInputWithStepper';
import {
  PastSimulatedProjectsSection,
  GoldenWheatOrnament,
} from './PastSimulatedProjectsSection';

interface SimulatorWorkspaceProps {
  mode?: 'HOME_SECTION' | 'FULL_PAGE';
}

const CROP_META: Record<
  string,
  {
    label: string;
    desc: string;
    photo: string;
    renderIcon: (color: string) => React.ReactNode;
  }
> = {
  CACAO: {
    label: 'Cacao',
    desc: 'Fèves fermentées et séchées',
    photo: '/images/agri-3.jpg',
    renderIcon: (color) => <Sprout size={18} color={color} />,
  },
  CAFE_ROBUSTA: {
    label: 'Café Robusta',
    desc: 'Cerises rouges et café marchand',
    photo: '/images/agri-1.jpg',
    renderIcon: (color) => <Coffee size={18} color={color} />,
  },
  MANIOC: {
    label: 'Manioc',
    desc: 'Cossettes et tubercules frais',
    photo: '/images/agri-2.jpeg',
    renderIcon: (color) => <Leaf size={18} color={color} />,
  },
  MAIS_GRAIN: {
    label: 'Maïs grain',
    desc: 'Maïs grain sec égrené',
    photo: '/images/agri-4.jpg',
    renderIcon: (color) => <Wheat size={18} color={color} />,
  },
  ARACHIDE_NIEBE: {
    label: 'Arachide / Niébé',
    desc: 'Gousses et graines sèches',
    photo: '/images/agri-3.jpg',
    renderIcon: (color) => <Sprout size={18} color={color} />,
  },
};

const STAGE_ICONS: Record<ExpenseStageCode, (color: string) => React.ReactNode> = {
  LAND_PREP: (color) => <Shovel size={16} color={color} />,
  SEEDS: (color) => <Sprout size={16} color={color} />,
  PLANTING: (color) => <Leaf size={16} color={color} />,
  MAINTENANCE: (color) => <Scissors size={16} color={color} />,
  INPUTS: (color) => <Package size={16} color={color} />,
  LABOR: (color) => <Users size={16} color={color} />,
  HARVEST: (color) => <ShoppingBasket size={16} color={color} />,
  LOGISTICS: (color) => <Truck size={16} color={color} />,
};

export const SimulatorWorkspace: React.FC<SimulatorWorkspaceProps> = ({
  mode = 'HOME_SECTION',
}) => {
  const [simInput, setSimInput] = useAtom(simulationInputAtom);
  const results = useAtomValue(economicResultsAtom);
  const templates = useAtomValue(cropTemplatesAtom);
  const currency = useAtomValue(displayCurrencyAtom);
  const setMainSection = useSetAtom(activeMainSectionAtom);

  const [activeStageFilter, setActiveStageFilter] = useState<ExpenseStageCode | 'ALL'>('ALL');
  const [shareCodeQuery, setShareCodeQuery] = useState('');
  const [loadStatusMessage, setLoadStatusMessage] = useState<string | null>(null);

  const fmt = (val: number) =>
    formatMoney(val, currency, simInput.exchangeRateCdfPerUsd || 2850);

  const handleSelectCropTemplate = (tpl: CropTemplateDto) => {
    const defaultExpenses = Array.isArray(tpl.defaultExpenses)
      ? tpl.defaultExpenses
      : [];
    const surf = Number(tpl.defaultSurfaceArea) || 1;
    const yieldPerHa = Number(tpl.defaultYieldPerHa) || 1000;
    const salePrice = Number(tpl.defaultSalePriceUsd) || 1.5;

    setSimInput({
      ...simInput,
      title: `Campagne ${tpl.nameFr} (${surf} ha)`,
      cropCode: tpl.code,
      cropName: tpl.nameFr,
      surfaceArea: surf,
      surfaceUnit: (tpl.defaultSurfaceUnit as SurfaceUnit) || 'HA',
      expectedYieldTotal: Math.round(yieldPerHa * surf),
      commercializedQty: Math.round(yieldPerHa * surf * 0.95),
      productionUnit: (tpl.productionUnit as ProductionUnit) || 'KG',
      unitSalePriceUsd: salePrice,
      expenses: defaultExpenses.map((e, idx) => ({
        id: `${tpl.code}-${idx}-${Date.now()}`,
        stage: (e.stage as ExpenseStageCode) || 'MAINTENANCE',
        label: e.label,
        unit: e.unit,
        quantity: Number(e.quantity) || 1,
        unitCostUsd: Number(e.unitCostUsd) || 1,
        costType: (e.costType as 'FIXED' | 'VARIABLE') || 'VARIABLE',
      })),
    });
  };

  const handleSurfaceChange = (nextSurface: number) => {
    const safeNext = Math.max(0.25, Number(nextSurface.toFixed(2)));
    const prevSurface = simInput.surfaceArea > 0 ? simInput.surfaceArea : 1;
    const ratio = safeNext / prevSurface;
    setSimInput({
      ...simInput,
      surfaceArea: safeNext,
      expectedYieldTotal: Math.round(simInput.expectedYieldTotal * ratio),
      commercializedQty: Math.round(simInput.commercializedQty * ratio),
      expenses: simInput.expenses.map((exp) =>
        exp.costType === 'VARIABLE'
          ? { ...exp, quantity: Number((exp.quantity * ratio).toFixed(1)) }
          : exp
      ),
    });
  };

  const handlePriceChange = (nextPrice: number) => {
    const safePrice = Math.max(0.05, Number(nextPrice.toFixed(2)));
    setSimInput({
      ...simInput,
      unitSalePriceUsd: safePrice,
    });
  };

  const handleYieldChange = (nextYield: number) => {
    const safeYield = Math.max(10, Math.round(nextYield));
    setSimInput({
      ...simInput,
      expectedYieldTotal: safeYield,
      commercializedQty: safeYield,
    });
  };

  const handleUpdateExpense = (id: string, patch: Partial<ExpenseLineItem>) => {
    setSimInput({
      ...simInput,
      expenses: simInput.expenses.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    });
  };

  const handleAddExpense = (stage: ExpenseStageCode) => {
    const stageMeta = EXPENSE_STAGES.find((s) => s.code === stage);
    const newItem: ExpenseLineItem = {
      id: `exp-${Date.now()}`,
      stage,
      label: `Dépense (${stageMeta?.shortLabelFr || stage})`,
      unit: 'Unité',
      quantity: 1,
      unitCostUsd: 10,
      costType: 'VARIABLE',
    };
    setSimInput({
      ...simInput,
      expenses: [...simInput.expenses, newItem],
    });
  };

  const handleDeleteExpense = (id: string) => {
    setSimInput({
      ...simInput,
      expenses: simInput.expenses.filter((item) => item.id !== id),
    });
  };

  const handleLoadByCode = async () => {
    if (!shareCodeQuery.trim()) return;
    setLoadStatusMessage(null);
    try {
      const loaded = await simulationsControllerFindByShareCode(
        shareCodeQuery.trim().toUpperCase()
      );
      setSimInput({
        title: loaded.title,
        cropCode: loaded.cropCode,
        cropName: loaded.cropName,
        province: loaded.province,
        surfaceArea: loaded.surfaceArea,
        surfaceUnit: (loaded.surfaceUnit as SurfaceUnit) || 'HA',
        expectedYieldTotal: loaded.expectedYieldTotal,
        commercializedQty: loaded.commercializedQty,
        productionUnit: (loaded.productionUnit as ProductionUnit) || 'KG',
        unitSalePriceUsd: loaded.unitSalePriceUsd,
        otherRevenueUsd: loaded.otherRevenueUsd,
        exchangeRateCdfPerUsd: loaded.exchangeRateCdfPerUsd || 2850,
        expenses: (loaded.expenses || []).map((e) => ({
          id: e.id,
          stage: e.stage as ExpenseStageCode,
          label: e.label,
          unit: e.unit,
          quantity: e.quantity,
          unitCostUsd: e.unitCostUsd,
          costType: (e.costType as 'FIXED' | 'VARIABLE') || 'VARIABLE',
        })),
      });
      setLoadStatusMessage(`Simulation ${loaded.shareCode} chargée.`);
    } catch {
      setLoadStatusMessage(`Code introuvable (exemple : AVN-2026).`);
    }
  };

  const goToResultsPage = () => {
    setMainSection('RESULTS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================================================
  // MODE 1: HOME SECTION (Exact Image 2 Design: Left Tall Photo,
  // Right Editorial Content + Interactive Quick Simulator + Dark Green Pill CTA,
  // and Overlapping 3-Column Dark Espresso/Umber Feature Banner at Bottom!)
  // ============================================================================
  if (mode === 'HOME_SECTION') {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: '1340px',
          margin: '0 auto',
          padding: '12px clamp(16px, 3vw, 24px)',
          boxSizing: 'border-box',
        }}
      >
        {/* Top 2-Column Area */}
        <div className="avenir-sim-home-grid">
          {/* Left Column: Tall Rounded Field Photo (Yellow play square removed per user request Image 3) */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '500px',
              margin: '0 auto',
            }}
          >
            {/* Tall Rounded Photo */}
            <div
              className="avenir-sim-home-photo"
              style={{
                width: '100%',
                height: '540px',
                borderRadius: '22px',
                overflow: 'hidden',
                boxShadow: '0 18px 40px rgba(18, 36, 24, 0.14)',
                backgroundColor: '#163020',
              }}
            >
              <img
                src="/images/agri-2.jpeg"
                alt="Producteur agricole au Kwilu et Kwango"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  display: 'block',
                }}
              />
            </div>
          </div>

          {/* Right Column: Overline + Bold Heading + Description + Quick Interactive Simulator + Pill CTA */}
          <div
            className="avenir-sim-home-right"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              paddingTop: '14px',
              paddingBottom: '130px',
            }}
          >
            {/* Green Script Overline */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px',
              }}
            >
              <GoldenWheatOrnament width={48} />
              <span
                style={{
                  color: '#1F6338',
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontStyle: 'italic',
                  fontSize: '16px',
                  fontWeight: 700,
                }}
              >
                Pourquoi utiliser le simulateur AVENIR ?
              </span>
            </div>

            {/* Bold Dark Forest Heading */}
            <h2
              style={{
                margin: '0 0 16px 0',
                fontSize: 'clamp(26px, 3.4vw, 38px)',
                fontWeight: 900,
                color: '#0E2917',
                lineHeight: 1.18,
                letterSpacing: '-0.7px',
              }}
            >
              Le Simulateur Économique : Cultivez Avec des Chiffres Clairs
            </h2>

            {/* Muted Editorial Paragraph */}
            <p
              style={{
                margin: '0 0 22px 0',
                fontSize: '14.5px',
                color: '#5F685F',
                lineHeight: '23px',
                maxWidth: '600px',
              }}
            >
              Coût total, coût de revient par unité, recettes, marge brute, bénéfice net et seuil de rentabilité, calculés automatiquement pour vous. Testez votre culture ci-dessous ou ouvrez le simulateur complet avant de semer.
            </p>

            {/* Compact Interactive Quick-Simulator Card (Culture, Superficie, Prix -> Bénéfice) */}
            <div
              style={{
                width: '100%',
                maxWidth: '600px',
                backgroundColor: '#FAF8F3',
                border: '1px solid #E6E3DA',
                borderRadius: '16px',
                padding: '18px 20px',
                marginBottom: '24px',
                boxSizing: 'border-box',
              }}
            >
              {/* Culture Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                {templates.map((tpl) => {
                  const active = simInput.cropCode === tpl.code;
                  const meta = CROP_META[tpl.code] || {
                    label: tpl.nameFr.split('(')[0].trim(),
                  };
                  return (
                    <button
                      key={tpl.code}
                      type="button"
                      onClick={() => handleSelectCropTemplate(tpl)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '999px',
                        border: active ? '1.5px solid #0E4523' : '1px solid #D5DDD5',
                        backgroundColor: active ? '#0E4523' : '#FFFFFF',
                        color: active ? '#FFFFFF' : '#18241B',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>

              {/* Quick Steppers + Live Profit Pill */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))',
                  gap: '12px',
                  alignItems: 'end',
                }}
              >
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#5F685F', marginBottom: '4px' }}>
                    Superficie (hectares)
                  </div>
                  <NumberInputWithStepper
                    value={simInput.surfaceArea}
                    onChange={handleSurfaceChange}
                    step={0.5}
                    min={0.25}
                    max={500}
                    unitLabel="ha"
                  />
                </div>

                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#5F685F', marginBottom: '4px' }}>
                    Prix de vente (USD/kg)
                  </div>
                  <NumberInputWithStepper
                    value={simInput.unitSalePriceUsd}
                    onChange={handlePriceChange}
                    step={0.1}
                    min={0.05}
                    max={100}
                    unitLabel="$/kg"
                  />
                </div>

                <div
                  onClick={goToResultsPage}
                  style={{
                    backgroundColor: '#F2B632',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#4A2E0B' }}>
                    Bénéfice prévu
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#18241B' }}>
                    {fmt(results.netProfitUsd)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Row: Dark Forest Green Pill with Golden Circle Chevron (Exact Image 2) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <div
                onClick={() => {
                  setMainSection('SIMULATOR');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '18px',
                  backgroundColor: '#0E4523',
                  borderRadius: '999px',
                  padding: '7px 8px 7px 26px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(14, 69, 35, 0.22)',
                }}
              >
                <span
                  style={{
                    color: '#FFFFFF',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    letterSpacing: '0.2px',
                  }}
                >
                  Ouvrir le simulateur complet
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '999px',
                    backgroundColor: '#F2B632',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ArrowRight size={17} color="#18241B" strokeWidth={2.5} />
                </div>
              </div>

              <div
                onClick={goToResultsPage}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '999px',
                  border: '1.5px solid #0E4523',
                  color: '#0E4523',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <span>Voir la page des résultats</span>
                <ArrowRight size={15} color="#0E4523" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Overlapping 3-Column Dark Espresso/Earth-Brown Banner (Exact Image 2 Design!) */}
        <div
          className="avenir-sim-umber-banner"
          style={{
            position: 'relative',
            zIndex: 3,
            marginTop: '-115px',
            marginLeft: 'auto',
            width: '90%',
            maxWidth: '1080px',
            backgroundColor: '#4A2E0B',
            borderRadius: '22px',
            padding: '38px 42px',
            boxShadow: '0 20px 44px rgba(34, 20, 4, 0.24)',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
              gap: '28px',
            }}
          >
            {[
              {
                title: 'Coût Total & Coût par Unité',
                desc: `Toutes vos dépenses par étape (semences, main-d’œuvre, transport). Coût simulé : ${fmt(results.totalCostUsd)} (${fmt(results.unitProductionCostUsd)}/kg).`,
              },
              {
                title: 'Recettes & Marge Brute',
                desc: `Comparez immédiatement vos dépenses et vos ventes prévues (${simInput.commercializedQty} kg). Recettes estimées : ${fmt(results.totalCashRevenueUsd)}.`,
              },
              {
                title: 'Bénéfice & Seuil de Rentabilité',
                desc: `Sachez avant de planter à partir de quelle récolte (${Math.round(results.breakEvenQuantity)} kg) vous gagnez de l’argent.`,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="avenir-sim-umber-item"
                style={{
                  paddingRight: idx < 2 ? '24px' : 0,
                  borderRight:
                    idx < 2 ? '1px dashed rgba(255, 255, 255, 0.18)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Golden Circle Checkmark Badge */}
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '999px',
                    backgroundColor: '#F2B632',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={16} color="#4A2E0B" strokeWidth={3} />
                </div>

                <div
                  style={{
                    color: '#FFFFFF',
                    fontSize: '18px',
                    fontWeight: 800,
                    letterSpacing: '-0.2px',
                  }}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    color: 'rgba(255, 255, 255, 0.78)',
                    fontSize: '13.5px',
                    lineHeight: '21px',
                  }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MODE 2: STANDALONE FULL SIMULATOR PAGE ('FULL_PAGE')
  // ============================================================================
  const filteredExpenses =
    activeStageFilter === 'ALL'
      ? simInput.expenses
      : simInput.expenses.filter((e) => e.stage === activeStageFilter);

  return (
    <div
      style={{
        width: '100%',
        background: 'linear-gradient(180deg, #E8F2EA 0%, #F3EFE6 45%, #FAF8F3 100%)',
      }}
    >
      {/* Full-Width Executive Hero Banner with Field Photo & Deep Forest Overlay */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          backgroundImage: 'url(/images/agri-1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          paddingTop: '56px',
          paddingBottom: '94px',
          overflow: 'hidden',
        }}
      >
        {/* Rich Emerald & Forest Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(105deg, rgba(14, 69, 35, 0.95) 0%, rgba(18, 78, 41, 0.88) 55%, rgba(14, 52, 27, 0.78) 100%)',
          }}
        />

        {/* Organic Bottom Wave */}
        <svg
          viewBox="0 0 1440 34"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: -1,
            left: 0,
            width: '100%',
            height: '26px',
            display: 'block',
          }}
        >
          <path
            d="M0,18 Q120,30 240,16 T480,22 T720,14 T960,24 T1200,15 T1440,20 L1440,34 L0,34 Z"
            fill="#EBF3EC"
          />
        </svg>

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '1240px',
            width: '100%',
            margin: '0 auto',
            padding: '0 24px',
            boxSizing: 'border-box',
          }}
        >
          <XStack gap="$6" flexWrap="wrap" alignItems="center" justifyContent="space-between">
            <YStack flex={1.3} minWidth={300} maxWidth={680} gap="$3">
              <span
                style={{
                  color: '#F2B632',
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontStyle: 'italic',
                  fontSize: '16px',
                  fontWeight: 700,
                }}
              >
                Simulateur Économique Agricole · Kwilu & Kwango
              </span>

              <Text fontSize={36} fontWeight="900" color="#FFFFFF" lineHeight={42} letterSpacing={-0.6}>
                Planifiez votre campagne et estimez vos coûts
              </Text>
              <Text fontSize={15} color="rgba(255, 255, 255, 0.86)" lineHeight={23}>
                Choisissez votre culture, ajustez la superficie de votre champ et détaillez vos dépenses étape par étape. Vos résultats financiers se mettent à jour instantanément.
              </Text>
            </YStack>

            <Button
              size="$4"
              height={48}
              borderRadius={999}
              paddingHorizontal="$5"
              backgroundColor="#F2B632"
              color="#18241B"
              fontWeight="800"
              onPress={goToResultsPage}
              style={{ boxShadow: '0 10px 24px rgba(0,0,0,0.22)' }}
            >
              <XStack alignItems="center" gap="$2">
                <BarChart3 size={18} color="#18241B" />
                <Text fontSize={14} fontWeight="800" color="#18241B">
                  Voir les résultats complets
                </Text>
                <ArrowRight size={16} color="#18241B" />
              </XStack>
            </Button>
          </XStack>
        </div>
      </div>

      {/* Main Centered Simulator Content Container Overlapping the Hero Banner */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1240px',
          width: '100%',
          margin: '-54px auto 0',
          padding: '0 24px 48px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
        }}
      >
        {/* Live Floating KPI Strip Overlapping the Hero Banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '20px 24px',
            boxShadow: '0 16px 38px rgba(14, 42, 22, 0.12)',
            border: '1px solid #E4EAE4',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#5F685F', textTransform: 'uppercase' }}>
              Culture & Parcelle
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0E4523', marginTop: '4px' }}>
              {simInput.cropName.split('(')[0].trim()} · {simInput.surfaceArea} ha
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#5F685F', textTransform: 'uppercase' }}>
              Coût Total Estimé
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#C86D28', marginTop: '4px' }}>
              {fmt(results.totalCostUsd)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#5F685F', textTransform: 'uppercase' }}>
              Recettes Prévues
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#1F6338', marginTop: '4px' }}>
              {fmt(results.totalCashRevenueUsd)}
            </div>
          </div>

          <div
            onClick={goToResultsPage}
            style={{
              backgroundColor: '#F2B632',
              borderRadius: '12px',
              padding: '10px 16px',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#4A2E0B', textTransform: 'uppercase' }}>
              Bénéfice Net Prévu →
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#18241B', marginTop: '2px' }}>
              {fmt(results.netProfitUsd)}
            </div>
          </div>
        </div>

      {/* SECTION 1: Culture & Paramètres de Récolte */}
      <YStack
        backgroundColor="#FFFFFF"
        borderRadius={20}
        padding="$5"
        borderWidth={1}
        borderColor="#E4EAE4"
        gap="$4"
        style={{ boxShadow: '0 12px 32px rgba(14, 42, 22, 0.06)' }}
      >
        <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$2">
          <YStack gap="$1">
            <Text fontSize={18} fontWeight="800" color="#18241B">
              1. Choisissez votre culture et votre parcelle
            </Text>
            <Text fontSize={13} color="#687068">
              Chaque culture charge un modèle de dépenses adapté aux provinces du Kwilu et du Kwango.
            </Text>
          </YStack>

          {/* Province Selector */}
          <XStack alignItems="center" gap="$2">
            <MapPin size={15} color="#1F6338" />
            <Text fontSize={12.5} fontWeight="600" color="#5F685F">
              Province :
            </Text>
            {(['Kwilu', 'Kwango'] as const).map((prov) => {
              const active = simInput.province === prov;
              return (
                <Button
                  key={prov}
                  size="$2.5"
                  height={32}
                  paddingHorizontal="$3"
                  borderRadius={999}
                  backgroundColor={active ? '#1F6338' : '#F4F6F4'}
                  onPress={() => setSimInput({ ...simInput, province: prov })}
                >
                  <Text
                    fontSize={12}
                    fontWeight="700"
                    color={active ? '#FFFFFF' : '#18241B'}
                  >
                    {prov}
                  </Text>
                </Button>
              );
            })}
          </XStack>
        </XStack>

        {/* Photo Crop Cards using the 4 real agricultural photos in a proportional CSS Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))',
            gap: '14px',
            width: '100%',
          }}
        >
          {templates.map((tpl) => {
            const active = simInput.cropCode === tpl.code;
            const meta = CROP_META[tpl.code] || {
              label: tpl.nameFr,
              desc: 'Filière locale',
              photo: '/images/agri-4.jpg',
              renderIcon: (color: string) => <Sprout size={18} color={color} />,
            };
            return (
              <YStack
                key={tpl.code}
                backgroundColor={active ? '#F4F9F4' : '#FFFFFF'}
                borderRadius={12}
                overflow="hidden"
                borderWidth={active ? 2 : 1}
                borderColor={active ? '#1F6338' : '#EAE8E1'}
                cursor="pointer"
                onPress={() => handleSelectCropTemplate(tpl)}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16 / 10',
                    backgroundColor: '#E7F3E7',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={meta.photo}
                    alt={meta.label}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      display: 'block',
                    }}
                  />
                  {active && (
                    <YStack
                      style={{ position: 'absolute', top: 8, right: 8 }}
                      width={26}
                      height={26}
                      borderRadius={999}
                      backgroundColor="#1F6338"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Check size={14} color="#FFFFFF" />
                    </YStack>
                  )}
                </div>

                <YStack padding="$3" gap="$1">
                  <XStack alignItems="center" gap="$1.5">
                    {meta.renderIcon('#1F6338')}
                    <Text fontSize={14.5} fontWeight="800" color="#18241B">
                      {meta.label}
                    </Text>
                  </XStack>
                  <Text fontSize={11.5} color="#687068" lineHeight={16}>
                    {meta.desc} · {tpl.defaultSalePriceUsd} USD/kg
                  </Text>
                </YStack>
              </YStack>
            );
          })}
        </div>

        {/* 3 Numeric Inputs (Direct Input + -/+) */}
        <XStack gap="$3" flexWrap="wrap" paddingTop="$2">
          <YStack
            flex={1}
            minWidth={200}
            backgroundColor="#FAF8F3"
            padding="$3.5"
            borderRadius={12}
            borderWidth={1}
            borderColor="#EAE8E1"
            gap="$2"
            style={{ boxSizing: 'border-box' }}
          >
            <Text fontSize={13} fontWeight="700" color="#18241B">
              Superficie (hectares)
            </Text>
            <NumberInputWithStepper
              value={simInput.surfaceArea}
              onChange={handleSurfaceChange}
              step={0.5}
              min={0.25}
              max={500}
              unitLabel="ha"
            />
          </YStack>

          <YStack
            flex={1}
            minWidth={200}
            backgroundColor="#FAF8F3"
            padding="$3.5"
            borderRadius={12}
            borderWidth={1}
            borderColor="#EAE8E1"
            gap="$2"
            style={{ boxSizing: 'border-box' }}
          >
            <Text fontSize={13} fontWeight="700" color="#18241B">
              Quantité commercialisée (kg)
            </Text>
            <NumberInputWithStepper
              value={simInput.commercializedQty}
              onChange={handleYieldChange}
              step={50}
              min={10}
              max={500000}
              unitLabel="kg"
            />
          </YStack>

          <YStack
            flex={1}
            minWidth={200}
            backgroundColor="#FAF8F3"
            padding="$3.5"
            borderRadius={12}
            borderWidth={1}
            borderColor="#EAE8E1"
            gap="$2"
            style={{ boxSizing: 'border-box' }}
          >
            <Text fontSize={13} fontWeight="700" color="#18241B">
              Prix de vente (USD/kg)
            </Text>
            <NumberInputWithStepper
              value={simInput.unitSalePriceUsd}
              onChange={handlePriceChange}
              step={0.1}
              min={0.05}
              max={100}
              unitLabel="USD/kg"
            />
          </YStack>
        </XStack>
      </YStack>

      {/* SECTION 2: Dépenses de Campagne */}
      <YStack
        backgroundColor="#FFFFFF"
        borderRadius={14}
        padding="$5"
        borderWidth={1}
        borderColor="#EAE8E1"
        gap="$4"
      >
        <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$2.5">
          <YStack gap="$1" flex={1} minWidth={220}>
            <Text fontSize={18} fontWeight="800" color="#18241B">
              2. Notez vos dépenses par étape culturale
            </Text>
            <Text fontSize={13} color="#687068">
              Terrain, semences, plantation, entretien, intrants, main-d’œuvre, récolte et transport.
            </Text>
          </YStack>

          <YStack
            backgroundColor="#E7F3E7"
            paddingHorizontal="$3.5"
            paddingVertical="$2"
            borderRadius={999}
            alignSelf="flex-start"
          >
            <Text fontSize={13} fontWeight="800" color="#1F6338">
              Coût total : {fmt(results.totalCostUsd)}
            </Text>
          </YStack>
        </XStack>

        {/* Clean Stage Filter Pills (No Emojis) */}
        <XStack gap="$2" flexWrap="wrap">
          <Button
            size="$2.5"
            height={32}
            borderRadius={999}
            backgroundColor={activeStageFilter === 'ALL' ? '#1F6338' : '#FAF8F3'}
            borderWidth={1}
            borderColor={activeStageFilter === 'ALL' ? '#1F6338' : '#EAE8E1'}
            onPress={() => setActiveStageFilter('ALL')}
          >
            <Text
              fontSize={12}
              fontWeight="700"
              color={activeStageFilter === 'ALL' ? '#FFFFFF' : '#18241B'}
            >
              Toutes les étapes ({simInput.expenses.length})
            </Text>
          </Button>
          {EXPENSE_STAGES.map((st) => {
            const active = activeStageFilter === st.code;
            const renderIcon = STAGE_ICONS[st.code];
            return (
              <Button
                key={st.code}
                size="$2.5"
                height={32}
                borderRadius={999}
                backgroundColor={active ? '#1F6338' : '#FAF8F3'}
                borderWidth={1}
                borderColor={active ? '#1F6338' : '#EAE8E1'}
                onPress={() => setActiveStageFilter(st.code)}
              >
                <XStack alignItems="center" gap="$1.5">
                  {renderIcon(active ? '#FFFFFF' : '#1F6338')}
                  <Text
                    fontSize={12}
                    fontWeight="700"
                    color={active ? '#FFFFFF' : '#18241B'}
                  >
                    {st.shortLabelFr}
                  </Text>
                </XStack>
              </Button>
            );
          })}
        </XStack>

        {/* Expense Rows */}
        <YStack gap="$2.5">
          {filteredExpenses.map((item) => {
            const stMeta = EXPENSE_STAGES.find((s) => s.code === item.stage);
            const renderIcon = STAGE_ICONS[item.stage] || ((c: string) => <Sprout size={16} color={c} />);
            const lineTotal = item.quantity * item.unitCostUsd;
            return (
              <div
                key={item.id}
                className="avenir-expense-row"
                style={{
                  backgroundColor: '#FAF8F3',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #EAE8E1',
                }}
              >
                {/* Title & Stage */}
                <div className="avenir-expense-title">
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#E7F3E7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {renderIcon('#1F6338')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <Input
                      height={34}
                      fontSize={13.5}
                      fontWeight="700"
                      color="#18241B"
                      backgroundColor="#FFFFFF"
                      borderColor="#E2E8E2"
                      value={item.label}
                      onChangeText={(txt) => handleUpdateExpense(item.id, { label: txt })}
                      style={{ width: '100%', minWidth: 0 }}
                    />
                    <span style={{ fontSize: '11px', color: '#687068', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {stMeta?.shortLabelFr} · Unité : {item.unit}
                    </span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="avenir-expense-stepper">
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#5F685F' }}>
                    Quantité ({item.unit})
                  </span>
                  <NumberInputWithStepper
                    compact
                    value={item.quantity}
                    onChange={(q) => handleUpdateExpense(item.id, { quantity: q })}
                    step={1}
                    min={0}
                    max={100000}
                  />
                </div>

                {/* Unit Cost */}
                <div className="avenir-expense-stepper">
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#5F685F' }}>
                    Coût unitaire (USD)
                  </span>
                  <NumberInputWithStepper
                    compact
                    value={item.unitCostUsd}
                    onChange={(c) => handleUpdateExpense(item.id, { unitCostUsd: c })}
                    step={0.5}
                    min={0}
                    max={100000}
                    unitLabel="USD"
                  />
                </div>

                {/* Subtotal & Delete */}
                <div className="avenir-expense-total">
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#687068' }}>
                      Montant
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1F6338' }}>
                      {fmt(lineTotal)}
                    </div>
                  </div>
                  <Button
                    size="$2.5"
                    circular
                    backgroundColor="#FEE2E2"
                    onPress={() => handleDeleteExpense(item.id)}
                  >
                    <Trash2 size={14} color="#B91C1C" />
                  </Button>
                </div>
              </div>
            );
          })}

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              paddingTop: '6px',
              width: '100%',
            }}
          >
            <Button
              size="$3"
              borderRadius={8}
              backgroundColor="#E7F3E7"
              color="#1F6338"
              fontWeight="700"
              onPress={() =>
                handleAddExpense(
                  activeStageFilter === 'ALL' ? 'MAINTENANCE' : activeStageFilter
                )
              }
            >
              <XStack alignItems="center" gap="$1.5">
                <Plus size={15} color="#1F6338" />
                <Text fontSize={12.5} fontWeight="700" color="#1F6338">
                  Ajouter une ligne de dépense
                </Text>
              </XStack>
            </Button>

            {/* Load existing simulation by code */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                flex: '1 1 260px',
                justifyContent: 'flex-end',
              }}
            >
              <Input
                height={36}
                fontSize={12.5}
                backgroundColor="#FAF8F3"
                borderColor="#D5DDD5"
                placeholder="Code ex: AVN-2026"
                value={shareCodeQuery}
                onChangeText={setShareCodeQuery}
                style={{ flex: '1 1 140px', minWidth: '120px' }}
              />
              <Button
                size="$3"
                height={36}
                borderRadius={8}
                backgroundColor="#1F6338"
                color="#FFFFFF"
                fontWeight="700"
                onPress={handleLoadByCode}
              >
                <XStack alignItems="center" gap="$1.5">
                  <FolderDown size={14} color="#FFFFFF" />
                  <Text fontSize={12} fontWeight="700" color="#FFFFFF">
                    Charger un code
                  </Text>
                </XStack>
              </Button>
              {loadStatusMessage && (
                <Text fontSize={12} fontWeight="700" color="#1F6338" width="100%">
                  {loadStatusMessage}
                </Text>
              )}
            </div>
          </div>
        </YStack>
      </YStack>

      {/* Bottom Summary & Redirect to Results Page */}
      <YStack
        backgroundColor="#216139"
        borderRadius={16}
        padding="clamp(16px, 4vw, 24px)"
        gap="$3.5"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            width: '100%',
          }}
        >
          <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#F2B632' }}>
              Récapitulatif de votre simulation
            </span>
            <div style={{ fontSize: 'clamp(18px, 4.5vw, 22px)', fontWeight: 800, color: '#FFFFFF' }}>
              Bénéfice prévisionnel : {fmt(results.netProfitUsd)}
            </div>
            <span style={{ fontSize: '13px', color: '#DCE8DE' }}>
              Coûts : {fmt(results.totalCostUsd)} · Recettes : {fmt(results.totalCashRevenueUsd)}
            </span>
          </div>

          <div style={{ flex: '1 1 240px', maxWidth: '100%' }}>
            <button
              type="button"
              onClick={goToResultsPage}
              style={{
                width: '100%',
                minHeight: '48px',
                padding: '10px 18px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: '#F2B632',
                color: '#18241B',
                fontWeight: 800,
                fontSize: 'clamp(13px, 3.2vw, 14.5px)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.22)',
                boxSizing: 'border-box',
              }}
            >
              <BarChart3 size={17} color="#18241B" style={{ flexShrink: 0 }} />
              <span style={{ textAlign: 'center' }}>
                Calculer et voir la page des résultats
              </span>
              <ArrowRight size={16} color="#18241B" style={{ flexShrink: 0 }} />
            </button>
          </div>
        </div>
      </YStack>
      </div>

      {/* Full-Width Past Simulated Projects Section (Exact match to Image 3) */}
      <YStack width="100%" paddingBottom="$4">
        <PastSimulatedProjectsSection
          title="Autres projets simulés (Charger un modèle)"
          subtitle="Cliquez sur l’un de ces projets déjà simulés au Kwilu ou au Kwango pour pré-remplir automatiquement vos chiffres."
          openTarget="SIMULATOR"
        />
      </YStack>
    </div>
  );
};
