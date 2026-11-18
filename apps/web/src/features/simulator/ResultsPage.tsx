import React, { useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { YStack, XStack, Text, Button } from 'tamagui';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Share2,
  Printer,
  TrendingUp,
  Calculator,
  Scale,
  Coins,
  Sprout,
  BookOpen,
  Shovel,
  Leaf,
  Scissors,
  Package,
  Users,
  ShoppingBasket,
  Truck,
  Target,
} from 'lucide-react';
import { EXPENSE_STAGES, ExpenseStageCode } from '@avenir/shared';
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

const STAGE_ICONS: Record<ExpenseStageCode, (color: string) => React.ReactNode> = {
  LAND_PREP: (color) => <Shovel size={15} color={color} />,
  SEEDS: (color) => <Sprout size={15} color={color} />,
  PLANTING: (color) => <Leaf size={15} color={color} />,
  MAINTENANCE: (color) => <Scissors size={15} color={color} />,
  INPUTS: (color) => <Package size={15} color={color} />,
  LABOR: (color) => <Users size={15} color={color} />,
  HARVEST: (color) => <ShoppingBasket size={15} color={color} />,
  LOGISTICS: (color) => <Truck size={15} color={color} />,
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

  const fmt = (val: number) =>
    formatMoney(val, currency, simInput.exchangeRateCdfPerUsd || 2850);

  const safeCost = Number(results.totalCostUsd) || 0;
  const safeRev = Number(results.totalCashRevenueUsd) || 0;
  const maxBar = Math.max(safeCost, safeRev, 1);
  const costRatio = Math.min(100, Math.max(10, Math.round((safeCost / maxBar) * 100)));
  const revRatio = Math.min(100, Math.max(10, Math.round((safeRev / maxBar) * 100)));
  const isProfitable = results.netProfitUsd >= 0;
  const profitPerHa =
    results.netProfitUsd / Math.max(0.1, Number(results.surfaceInHectares) || 1);

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
        `Simulation enregistrée. Code de partage sans compte : ${saved.shareCode}`
      );
    } catch {
      const offlineCode = `LOCAL-${Math.floor(1000 + Math.random() * 9000)}`;
      setLastShareCode(offlineCode);
      setSaveBannerMsg(`Simulation enregistrée hors connexion (Code : ${offlineCode})`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        background: 'linear-gradient(180deg, #E8F2EA 0%, #F3EFE6 45%, #FAF8F3 100%)',
      }}
    >
      {/* Full-Width Executive Results Hero Banner with Field Photo & Deep Forest Overlay */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          backgroundImage: 'url(/images/agri-2.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          paddingTop: '48px',
          paddingBottom: '94px',
          overflow: 'hidden',
        }}
      >
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
          {/* Top Action Bar Inside Hero */}
          <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3" marginBottom="$5">
            <Button
              size="$3.5"
              height={40}
              borderRadius={999}
              paddingHorizontal="$4"
              backgroundColor="rgba(255,255,255,0.14)"
              borderWidth={1}
              borderColor="rgba(255,255,255,0.35)"
              color="#FFFFFF"
              fontWeight="700"
              onPress={() => {
                if (window.history.length > 1 && window.history.state?.section === 'RESULTS') {
                  window.history.back();
                } else {
                  setMainSection('SIMULATOR');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <XStack alignItems="center" gap="$2">
                <ArrowLeft size={15} color="#FFFFFF" />
                <Text fontSize={13} fontWeight="700" color="#FFFFFF">
                  Modifier mes données dans le simulateur
                </Text>
              </XStack>
            </Button>

            <XStack gap="$2.5" flexWrap="wrap">
              <Button
                size="$3.5"
                height={40}
                borderRadius={999}
                paddingHorizontal="$4"
                backgroundColor="#F2B632"
                color="#18241B"
                fontWeight="800"
                onPress={handleSaveSimulation}
                disabled={isSaving}
              >
                <XStack alignItems="center" gap="$2">
                  <Share2 size={14} color="#18241B" />
                  <Text fontSize={13} fontWeight="800" color="#18241B">
                    {isSaving ? 'Enregistrement...' : 'Obtenir un code de partage'}
                  </Text>
                </XStack>
              </Button>

              <Button
                size="$3.5"
                height={40}
                borderRadius={999}
                paddingHorizontal="$4"
                backgroundColor="#FFFFFF"
                color="#1F6338"
                fontWeight="700"
                onPress={() => window.print()}
              >
                <XStack alignItems="center" gap="$2">
                  <Printer size={14} color="#1F6338" />
                  <Text fontSize={13} fontWeight="700" color="#1F6338">
                    Imprimer
                  </Text>
                </XStack>
              </Button>
            </XStack>
          </XStack>

          <YStack gap="$2" maxWidth={780}>
            <span
              style={{
                color: '#F2B632',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontStyle: 'italic',
                fontSize: '16px',
                fontWeight: 700,
              }}
            >
              Diagnostic & Résultats Financiers · Province du {simInput.province}
            </span>
            <Text fontSize={36} fontWeight="900" color="#FFFFFF" lineHeight={42} letterSpacing={-0.6}>
              {CROP_LABELS[simInput.cropCode] || simInput.cropName} · {simInput.surfaceArea} ha
            </Text>
            <Text fontSize={15} color="rgba(255,255,255,0.85)" lineHeight={23}>
              Production commercialisée : {simInput.commercializedQty.toLocaleString('fr-FR')} kg au prix de vente de {simInput.unitSalePriceUsd} USD/kg.
            </Text>
          </YStack>
        </div>
      </div>

      {/* Main Centered Results Content Container Overlapping the Hero Banner */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1240px',
          width: '100%',
          margin: '-54px auto 0',
          padding: '0 clamp(14px, 3vw, 24px) 48px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '26px',
        }}
      >
        {/* 4 Overlapping Executive KPI Cards */}
        <div
          className="avenir-kpi-strip"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '20px 24px',
            boxShadow: '0 16px 38px rgba(14, 42, 22, 0.12)',
            border: '1px solid #E4EAE4',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#5F685F', textTransform: 'uppercase' }}>
              Coût Total de Production
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#C86D28', marginTop: '4px' }}>
              {fmt(results.totalCostUsd)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#5F685F', textTransform: 'uppercase' }}>
              Recettes Totales Prévues
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#1F6338', marginTop: '4px' }}>
              {fmt(results.totalCashRevenueUsd)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#5F685F', textTransform: 'uppercase' }}>
              Seuil de Rentabilité
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#0E4523', marginTop: '4px' }}>
              {Math.round(results.breakEvenQuantity).toLocaleString('fr-FR')} kg
            </div>
          </div>

          <div
            style={{
              backgroundColor: isProfitable ? '#F2B632' : '#FEE2E2',
              borderRadius: '12px',
              padding: '10px 16px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: isProfitable ? '#4A2E0B' : '#991B1B',
                textTransform: 'uppercase',
              }}
            >
              {isProfitable ? 'Bénéfice Net Prévisionnel' : 'Déficit Prévisionnel'}
            </div>
            <div
              style={{
                fontSize: '21px',
                fontWeight: 900,
                color: isProfitable ? '#18241B' : '#991B1B',
                marginTop: '2px',
              }}
            >
              {fmt(results.netProfitUsd)}
            </div>
          </div>
        </div>

      {saveBannerMsg && (
        <XStack
          backgroundColor="#E7F3E7"
          borderWidth={1}
          borderColor="#1F6338"
          borderRadius={12}
          padding="$3.5"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap="$2"
        >
          <XStack alignItems="center" gap="$2">
            <CheckCircle2 size={17} color="#1F6338" />
            <Text fontSize={13.5} fontWeight="700" color="#1F6338">
              {saveBannerMsg}
            </Text>
          </XStack>
          {lastShareCode && (
            <YStack
              backgroundColor="#1F6338"
              paddingHorizontal="$3"
              paddingVertical={4}
              borderRadius={999}
            >
              <Text fontSize={12} fontWeight="800" color="#FFFFFF">
                Code : {lastShareCode}
              </Text>
            </YStack>
          )}
        </XStack>
      )}

      {/* Main Results Banner with Real Field Photo (agri-2.jpeg) */}
      <YStack
        backgroundColor="#216139"
        borderRadius={16}
        padding="$5"
      >
        <XStack gap="$5" flexWrap="wrap" alignItems="center">
          {/* Left: Real Field Photo & Campaign Details */}
          <YStack flex={1.05} minWidth={290} gap="$3.5">
            <XStack alignItems="center" gap="$2" flexWrap="wrap">
              <YStack
                backgroundColor="#E7F3E7"
                paddingHorizontal="$3"
                paddingVertical={4}
                borderRadius={999}
              >
                <Text fontSize={11.5} fontWeight="700" color="#1F6338">
                  Résultats de la simulation · {simInput.province}
                </Text>
              </YStack>
            </XStack>

            <Text fontSize={28} fontWeight="800" color="#FFFFFF" lineHeight={34}>
              {CROP_LABELS[simInput.cropCode] || simInput.cropName} · {simInput.surfaceArea} ha
            </Text>

            <Text fontSize={14} color="#DCE8DE" lineHeight={21}>
              Production commercialisée : {simInput.commercializedQty.toLocaleString('fr-FR')} kg au prix de {simInput.unitSalePriceUsd} USD/kg.
            </Text>

            <YStack
              height={195}
              borderRadius={12}
              overflow="hidden"
              position="relative"
              backgroundColor="#18492A"
            >
              <img
                src="/images/agri-2.jpeg"
                alt="Producteur agricole dans son champ"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <XStack
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                }}
              >
                <XStack
                  backgroundColor="#FFFFFF"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius={8}
                  alignItems="center"
                  gap="$1.5"
                >
                  {isProfitable ? (
                    <CheckCircle2 size={15} color="#1F6338" />
                  ) : (
                    <AlertTriangle size={15} color="#B91C1C" />
                  )}
                  <Text
                    fontSize={12.5}
                    fontWeight="800"
                    color={isProfitable ? '#1F6338' : '#B91C1C'}
                  >
                    {isProfitable ? 'Exploitation rentable' : 'Attention : Déficit prévisionnel'}
                  </Text>
                </XStack>
              </XStack>
            </YStack>
          </YStack>

          {/* Right: White Results Card */}
          <YStack
            flex={1.1}
            minWidth={300}
            backgroundColor="#FFFFFF"
            borderRadius={14}
            padding="$5"
            gap="$3.5"
          >
            <Text fontSize={16} fontWeight="800" color="#18241B">
              Synthèse économique
            </Text>

            {/* Coûts Bar */}
            <YStack backgroundColor="#E6EFE6" borderRadius={10} padding="$3.5" gap="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={13} fontWeight="600" color="#4A554C">
                  Coûts totaux
                </Text>
                <Text fontSize={14.5} fontWeight="800" color="#C86D28">
                  {fmt(results.totalCostUsd)}
                </Text>
              </XStack>
              <YStack height={10} backgroundColor="#D3E2D3" borderRadius={999} overflow="hidden">
                <YStack
                  width={`${costRatio}%`}
                  height="100%"
                  backgroundColor="#C86D28"
                  borderRadius={999}
                />
              </YStack>
            </YStack>

            {/* Recettes Bar */}
            <YStack backgroundColor="#E6EFE6" borderRadius={10} padding="$3.5" gap="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={13} fontWeight="600" color="#4A554C">
                  Recettes totales
                </Text>
                <Text fontSize={14.5} fontWeight="800" color="#216139">
                  {fmt(results.totalCashRevenueUsd)}
                </Text>
              </XStack>
              <YStack height={10} backgroundColor="#D3E2D3" borderRadius={999} overflow="hidden">
                <YStack
                  width={`${revRatio}%`}
                  height="100%"
                  backgroundColor="#216139"
                  borderRadius={999}
                />
              </YStack>
            </YStack>

            {/* Golden Bénéfice Prévisionnel Card */}
            <YStack
              backgroundColor="#F2B632"
              borderRadius={12}
              padding="$4"
              gap="$1"
            >
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={12.5} fontWeight="700" color="#4E3808">
                  Bénéfice prévisionnel
                </Text>
                <Text fontSize={11.5} fontWeight="800" color="#18241B">
                  Rentabilité : {(Number(results.roiPercent) || 0).toFixed(1)} %
                </Text>
              </XStack>
              <Text fontSize={28} fontWeight="900" color="#18241B" letterSpacing={-0.5}>
                {fmt(results.netProfitUsd)}
              </Text>
              <Text fontSize={12} fontWeight="600" color="#4E3808">
                Soit {fmt(profitPerHa)} par hectare
              </Text>
            </YStack>
          </YStack>
        </XStack>
      </YStack>

      {/* 4 Key Indicators Grid */}
      <XStack gap="$3.5" flexWrap="wrap">
        {[
          {
            icon: <Coins size={18} color="#1F6338" />,
            title: 'Marge brute',
            value: fmt(results.grossMarginUsd),
            subtitle: 'Recettes moins les coûts variables directs',
          },
          {
            icon: <Scale size={18} color="#1F6338" />,
            title: 'Coût de revient par kg',
            value: `${fmt(results.unitProductionCostUsd)} / kg`,
            subtitle: `Prix de vente prévu : ${fmt(simInput.unitSalePriceUsd)} / kg`,
          },
          {
            icon: <TrendingUp size={18} color="#1F6338" />,
            title: 'Seuil de rentabilité (volume)',
            value: `${Math.ceil(Number(results.breakEvenQuantity) || 0).toLocaleString('fr-FR')} kg`,
            subtitle: 'Quantité minimale à vendre pour couvrir vos charges',
          },
          {
            icon: <Calculator size={18} color="#1F6338" />,
            title: 'Prix minimum sans perte',
            value: `${fmt(results.breakEvenMinPriceUsd)} / kg`,
            subtitle: 'Prix plancher pour rembourser vos dépenses',
          },
        ].map((kpi, idx) => (
          <YStack
            key={idx}
            flex={1}
            minWidth={240}
            backgroundColor="#FFFFFF"
            borderRadius={14}
            padding="$4"
            borderWidth={1}
            borderColor="#EAE8E1"
            gap="$2"
          >
            <XStack alignItems="center" gap="$2.5">
              <YStack
                width={36}
                height={36}
                borderRadius={9}
                backgroundColor="#E7F3E7"
                alignItems="center"
                justifyContent="center"
              >
                {kpi.icon}
              </YStack>
              <Text fontSize={13} fontWeight="600" color="#5F685F" flex={1}>
                {kpi.title}
              </Text>
            </XStack>
            <Text fontSize={20} fontWeight="800" color="#18241B">
              {kpi.value}
            </Text>
            <Text fontSize={12} color="#687068" lineHeight={17}>
              {kpi.subtitle}
            </Text>
          </YStack>
        ))}
      </XStack>

      {/* Breakdown by Stage + Scenarios & Goal-Seek */}
      <XStack gap="$4" flexWrap="wrap">
        {/* Left: Breakdown of Expenses by Stage */}
        <YStack
          flex={1.1}
          minWidth={310}
          backgroundColor="#FFFFFF"
          borderRadius={14}
          padding="$5"
          borderWidth={1}
          borderColor="#EAE8E1"
          gap="$3.5"
        >
          <YStack gap="$1">
            <Text fontSize={17} fontWeight="800" color="#18241B">
              Répartition des coûts par étape
            </Text>
            <Text fontSize={12.5} color="#687068">
              Poids de chaque poste de dépense dans votre campagne
            </Text>
          </YStack>

          <YStack gap="$3">
            {EXPENSE_STAGES.map((stage) => {
              const stageItems = simInput.expenses.filter((e) => e.stage === stage.code);
              const stageCost = stageItems.reduce(
                (acc, item) => acc + item.quantity * item.unitCostUsd,
                0
              );
              const pct =
                results.totalCostUsd > 0
                  ? Math.round((stageCost / results.totalCostUsd) * 100)
                  : 0;
              const renderIcon = STAGE_ICONS[stage.code];

              return (
                <YStack key={stage.code} gap="$1.5">
                  <XStack justifyContent="space-between" alignItems="center">
                    <XStack alignItems="center" gap="$2">
                      <YStack
                        width={26}
                        height={26}
                        borderRadius={6}
                        backgroundColor="#E7F3E7"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {renderIcon('#1F6338')}
                      </YStack>
                      <Text fontSize={13} fontWeight="600" color="#18241B">
                        {stage.shortLabelFr}
                      </Text>
                    </XStack>
                    <Text fontSize={13} fontWeight="700" color="#1F6338">
                      {fmt(stageCost)} ({pct}%)
                    </Text>
                  </XStack>
                  <YStack height={7} backgroundColor="#E6EFE6" borderRadius={999} overflow="hidden">
                    <YStack
                      width={`${Math.max(pct, stageCost > 0 ? 4 : 0)}%`}
                      height="100%"
                      backgroundColor="#C86D28"
                      borderRadius={999}
                    />
                  </YStack>
                </YStack>
              );
            })}
          </YStack>
        </YStack>

        {/* Right: 3 Scenarios + Goal Seek */}
        <YStack flex={1} minWidth={310} gap="$4">
          <YStack
            backgroundColor="#FFFFFF"
            borderRadius={14}
            padding="$5"
            borderWidth={1}
            borderColor="#EAE8E1"
            gap="$3"
          >
            <Text fontSize={17} fontWeight="800" color="#18241B">
              3. Comparez les scénarios
            </Text>
            <YStack gap="$2.5">
              {[
                {
                  label: 'Scénario prudent (prix -15 %, coûts +10 %)',
                  data: scenarios.pessimistic.results,
                  bg: '#FAF8F3',
                  border: '#EAE8E1',
                },
                {
                  label: 'Votre scénario actuel',
                  data: scenarios.base.results,
                  bg: '#E7F3E7',
                  border: '#1F6338',
                },
                {
                  label: 'Scénario optimiste / vente groupée (prix +15 %)',
                  data: scenarios.optimistic.results,
                  bg: '#FEF6E0',
                  border: '#F2B632',
                },
              ].map((sc, idx) => (
                <XStack
                  key={idx}
                  backgroundColor={sc.bg}
                  borderWidth={1}
                  borderColor={sc.border}
                  borderRadius={10}
                  padding="$3"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <YStack flex={1} paddingRight="$2">
                    <Text fontSize={13} fontWeight="700" color="#18241B">
                      {sc.label}
                    </Text>
                    <Text fontSize={11.5} color="#5F685F">
                      Recettes : {fmt(sc.data.totalCashRevenueUsd)} · Coûts : {fmt(sc.data.totalCostUsd)}
                    </Text>
                  </YStack>
                  <Text
                    fontSize={14.5}
                    fontWeight="800"
                    color={sc.data.netProfitUsd >= 0 ? '#1F6338' : '#B91C1C'}
                  >
                    {fmt(sc.data.netProfitUsd)}
                  </Text>
                </XStack>
              ))}
            </YStack>
          </YStack>

          {/* 4. Décidez (Objectif de gain) */}
          <YStack
            backgroundColor="#FFFFFF"
            borderRadius={14}
            padding="$5"
            borderWidth={1}
            borderColor="#EAE8E1"
            gap="$3"
          >
            <XStack alignItems="center" gap="$2">
              <YStack
                width={32}
                height={32}
                borderRadius={8}
                backgroundColor="#E7F3E7"
                alignItems="center"
                justifyContent="center"
              >
                <Target size={16} color="#1F6338" />
              </YStack>
              <Text fontSize={16} fontWeight="800" color="#18241B">
                4. Décidez selon votre objectif de gain
              </Text>
            </XStack>

            <NumberInputWithStepper
              value={targetProfitUsd}
              onChange={setTargetProfitUsd}
              step={100}
              min={50}
              max={100000}
              unitLabel="USD"
            />

            <XStack gap="$2.5" flexWrap="wrap">
              <YStack flex={1} backgroundColor="#E7F3E7" padding="$3" borderRadius={10} gap="$1">
                <Text fontSize={11.5} fontWeight="600" color="#1F6338">
                  Production à vendre
                </Text>
                <Text fontSize={16.5} fontWeight="800" color="#18241B">
                  {Math.ceil(Number(goalSeek.requiredTotalProduction) || 0).toLocaleString('fr-FR')} kg
                </Text>
              </YStack>
              <YStack flex={1} backgroundColor="#FEF6E0" padding="$3" borderRadius={10} gap="$1">
                <Text fontSize={11.5} fontWeight="600" color="#4E3808">
                  Superficie nécessaire
                </Text>
                <Text fontSize={16.5} fontWeight="800" color="#18241B">
                  {(Number(goalSeek.requiredSurfaceInHectares) || 0).toFixed(2)} ha
                </Text>
              </YStack>
            </XStack>
          </YStack>
        </YStack>
      </XStack>

      {/* Bottom Navigation Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '20px clamp(16px, 4vw, 24px)',
          border: '1px solid #EAE8E1',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#18241B' }}>
            Ajuster vos paramètres ou consulter les fiches pratiques
          </div>
          <div style={{ fontSize: '13px', color: '#5F685F' }}>
            Testez d’autres hypothèses de prix et de surface dans le simulateur.
          </div>
        </div>

        <div className="avenir-results-bottom-actions">
          <Button
            size="$3.5"
            height={42}
            borderRadius={999}
            paddingHorizontal="$4.5"
            backgroundColor="#F2B632"
            color="#18241B"
            fontWeight="700"
            onPress={() => {
              if (window.history.length > 1 && window.history.state?.section === 'RESULTS') {
                window.history.back();
              } else {
                setMainSection('SIMULATOR');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <XStack alignItems="center" gap="$2" justifyContent="center">
              <Calculator size={15} color="#18241B" />
              <Text fontSize={13.5} fontWeight="700" color="#18241B">
                Retour au simulateur
              </Text>
            </XStack>
          </Button>

          <Button
            size="$3.5"
            height={42}
            borderRadius={999}
            paddingHorizontal="$4.5"
            backgroundColor="#1F6338"
            color="#FFFFFF"
            fontWeight="700"
            onPress={() => {
              setMainSection('TOOLBOX');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <XStack alignItems="center" gap="$2" justifyContent="center">
              <BookOpen size={15} color="#FFFFFF" />
              <Text fontSize={13.5} fontWeight="700" color="#FFFFFF">
                Boîte à outils pédagogique
              </Text>
            </XStack>
          </Button>
        </div>
      </div>
      </div>

      {/* Full-Width Past Simulated Projects Section (Exact match to Image 3) */}
      <YStack width="100%" paddingBottom="$4">
        <PastSimulatedProjectsSection
          title="Autres projets simulés au Kwilu et au Kwango"
          subtitle="Comparez vos résultats avec d’autres campagnes agricoles déjà simulées ou ouvrez un autre projet."
          openTarget="RESULTS"
        />
      </YStack>
    </div>
  );
};
