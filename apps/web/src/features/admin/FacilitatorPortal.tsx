import React, { useEffect, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { YStack, XStack, Text, Button, Input, Separator } from 'tamagui';
import {
  activeMainSectionAtom,
  authUserAtom,
  displayCurrencyAtom,
  formatMoney,
  simulationInputAtom,
  toolboxCategoriesAtom,
} from '../../atoms/appAtoms';
import {
  authControllerLogin,
  authControllerRegister,
  SavedSimulationDto,
  simulationsControllerFindRecent,
  toolboxControllerCreateArticle,
  toolboxControllerFindAllCategories,
} from '../../api/generated/avenirApi';
import type { ExpenseStageCode, ProductionUnit, SurfaceUnit } from '@avenir/shared';

export const FacilitatorPortal: React.FC = () => {
  const [authUser, setAuthUser] = useAtom(authUserAtom);
  const [categories, setCategories] = useAtom(toolboxCategoriesAtom);
  const currency = useAtomValue(displayCurrencyAtom);
  const setSimInput = useSetAtom(simulationInputAtom);
  const setMainSection = useSetAtom(activeMainSectionAtom);

  const [recentSimulations, setRecentSimulations] = useState<SavedSimulationDto[]>([]);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('REGISTER');
  const [name, setName] = useState('Yvonne Kapinga');
  const [email, setEmail] = useState('animateur.kwilu@rikolto.org');
  const [password, setPassword] = useState('Avenir2026!');
  const [province, setProvince] = useState('Kwilu');
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // New Toolbox Article Form
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('planification-exploitation');
  const [newSummary, setNewSummary] = useState('');
  const [newFormula, setNewFormula] = useState('');
  const [newFacilitatorNote, setNewFacilitatorNote] = useState('');
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  useEffect(() => {
    simulationsControllerFindRecent()
      .then((list) => setRecentSimulations(list))
      .catch(() => {});
  }, []);

  const handleAuthSubmit = async () => {
    setAuthMessage(null);
    try {
      if (authMode === 'REGISTER') {
        const res = await authControllerRegister({
          name,
          email,
          password,
          province,
          role: 'FACILITATOR',
        });
        if (res.user) {
          setAuthUser(res.user);
          setAuthMessage(`Connecté via BetterAuth en tant que ${res.user.name} (${res.user.province}).`);
        }
      } else {
        const res = await authControllerLogin({ email, password });
        if (res.user) {
          setAuthUser(res.user);
          setAuthMessage(`Connecté via BetterAuth en tant que ${res.user.name}.`);
        }
      }
    } catch {
      setAuthMessage('Erreur d’authentification. Vérifiez vos identifiants ou créez le compte.');
    }
  };

  const handleLoadSharedSim = (sim: SavedSimulationDto) => {
    setSimInput({
      title: sim.title,
      cropCode: sim.cropCode,
      cropName: sim.cropName,
      province: sim.province,
      surfaceArea: sim.surfaceArea,
      surfaceUnit: (sim.surfaceUnit as SurfaceUnit) || 'HA',
      expectedYieldTotal: sim.expectedYieldTotal,
      commercializedQty: sim.commercializedQty,
      productionUnit: (sim.productionUnit as ProductionUnit) || 'KG',
      unitSalePriceUsd: sim.unitSalePriceUsd,
      otherRevenueUsd: sim.otherRevenueUsd,
      exchangeRateCdfPerUsd: sim.exchangeRateCdfPerUsd || 2850,
      expenses: (sim.expenses || []).map((e) => ({
        id: e.id,
        stage: e.stage as ExpenseStageCode,
        label: e.label,
        unit: e.unit,
        quantity: e.quantity,
        unitCostUsd: e.unitCostUsd,
        costType: (e.costType as 'FIXED' | 'VARIABLE') || 'VARIABLE',
      })),
    });
    setMainSection('SIMULATOR');
  };

  const handlePublishArticle = async () => {
    if (!newTitle.trim() || !newSummary.trim()) return;
    try {
      await toolboxControllerCreateArticle({
        categorySlug: newCategorySlug,
        titleFr: newTitle,
        subtitleFr: newSubtitle || 'Fiche pratique terrain validée — Projet AVENIR',
        readingTimeMinutes: 4,
        targetAudience: 'Producteurs, OP & Animateurs',
        linkedSimulatorStage: 'PLANNING',
        summaryFr: newSummary,
        keyFormulaFr: newFormula || undefined,
        facilitatorNoteFr:
          newFacilitatorNote ||
          'Utilisez cette fiche lors des séances d’accompagnement dans les villages du Kwilu et du Kwango.',
        contentSections: [
          {
            heading: 'Recommandation pratique AVENIR',
            body: newSummary,
            practicalExample: 'Applicable aux campagnes agricoles Café, Cacao, Manioc et Maïs.',
            illustrationIcon: '🌱',
          },
        ],
        checklist: [
          'Vérifier les coûts de production dans le simulateur AVENIR.',
          'Partager les résultats avec les membres de l’Organisation Paysanne (OP).',
        ],
      });
      const updatedCats = await toolboxControllerFindAllCategories();
      setCategories(updatedCats);
      setNewTitle('');
      setNewSubtitle('');
      setNewSummary('');
      setNewFormula('');
      setNewFacilitatorNote('');
      setPublishMessage('Nouvelle fiche pédagogique publiée avec succès dans la Boîte à Outils !');
    } catch {
      setPublishMessage('Erreur lors de la publication de la fiche.');
    }
  };

  return (
    <YStack gap="$4" paddingBottom="$8">
      {/* Top Info Card */}
      <YStack
        backgroundColor="#ffffff"
        borderRadius={16}
        padding="$4"
        borderWidth={1}
        borderColor="#d1fae5"
        gap="$2"
      >
        <Text fontSize={12} fontWeight="800" color="#15803d" textTransform="uppercase">
          ESPACE ANIMATEURS DE TERRAIN & ÉQUIPE RIKOLTO (BETTERAUTH)
        </Text>
        <Text fontSize={20} fontWeight="800" color="#111827">
          Suivi des Simulations Partagées & Administration de la Boîte à Outils
        </Text>
        <Text fontSize={13} color="#4b5563">
          Rappel : Les producteurs utilisent le simulateur et la boîte à outils sans obligation de compte. Cet espace permet aux animateurs et à l’équipe Rikolto d’accompagner les ménages et d’enrichir les contenus pédagogiques.
        </Text>
      </YStack>

      <XStack gap="$4" flexWrap="wrap">
        {/* Shared Simulations Feed */}
        <YStack
          flex={3}
          minWidth={300}
          backgroundColor="#ffffff"
          borderRadius={16}
          padding="$4"
          borderWidth={1}
          borderColor="#e5e7eb"
          gap="$3"
        >
          <Text fontSize={17} fontWeight="800" color="#111827">
            📊 Simulations Partagées par Code (Kwilu & Kwango)
          </Text>

          {recentSimulations.map((sim) => {
            const net = sim.results?.netProfitUsd ?? 0;
            return (
              <YStack
                key={sim.id}
                backgroundColor="#f9fafb"
                padding="$3.5"
                borderRadius={12}
                borderWidth={1}
                borderColor="#e5e7eb"
                gap="$2"
              >
                <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$2">
                  <XStack alignItems="center" gap="$2">
                    <YStack
                      backgroundColor="#14532d"
                      paddingHorizontal="$2.5"
                      paddingVertical={3}
                      borderRadius={6}
                    >
                      <Text fontSize={12} fontWeight="800" color="#ffffff">
                        {sim.shareCode}
                      </Text>
                    </YStack>
                    <Text fontSize={15} fontWeight="800" color="#111827">
                      {sim.title}
                    </Text>
                  </XStack>
                  <Text fontSize={12} fontWeight="700" color="#15803d">
                    📍 {sim.province}
                  </Text>
                </XStack>

                <XStack justifyContent="space-between" flexWrap="wrap" gap="$2">
                  <Text fontSize={12} color="#4b5563">
                    Surface: {sim.surfaceArea} {sim.surfaceUnit} • Production: {sim.expectedYieldTotal} {sim.productionUnit}
                  </Text>
                  <Text
                    fontSize={13}
                    fontWeight="800"
                    color={net >= 0 ? '#15803d' : '#dc2626'}
                  >
                    Bénéfice Net : {formatMoney(net, currency, sim.exchangeRateCdfPerUsd || 2850)}
                  </Text>
                </XStack>

                <XStack justifyContent="flex-end">
                  <Button
                    size="$3"
                    backgroundColor="#16a34a"
                    color="#ffffff"
                    fontWeight="700"
                    onPress={() => handleLoadSharedSim(sim)}
                  >
                    Ouvrir dans le simulateur →
                  </Button>
                </XStack>
              </YStack>
            );
          })}
        </YStack>

        {/* BetterAuth Facilitator Sign-In & CMS Publisher */}
        <YStack
          flex={2}
          minWidth={290}
          backgroundColor="#ffffff"
          borderRadius={16}
          padding="$4"
          borderWidth={1}
          borderColor="#e5e7eb"
          gap="$3"
        >
          <Text fontSize={17} fontWeight="800" color="#111827">
            🔐 Identification Animateur / Rikolto (BetterAuth)
          </Text>

          {authUser ? (
            <YStack gap="$3">
              <YStack
                backgroundColor="#f0fdf4"
                padding="$3"
                borderRadius={12}
                borderWidth={1}
                borderColor="#bbf7d0"
                gap="$1"
              >
                <Text fontSize={14} fontWeight="800" color="#14532d">
                  ✅ {authUser.name} ({authUser.role})
                </Text>
                <Text fontSize={12} color="#166534">
                  {authUser.email} • Province : {authUser.province}
                </Text>
              </YStack>

              <Separator borderColor="#e5e7eb" />

              <Text fontSize={15} fontWeight="800" color="#111827">
                ➕ Ajouter une fiche pédagogique à la Boîte à Outils
              </Text>

              <YStack gap="$2">
                <Text fontSize={12} fontWeight="600" color="#374151">
                  Thématique
                </Text>
                <XStack gap="$1.5" flexWrap="wrap">
                  {categories.map((c) => (
                    <Button
                      key={c.slug}
                      size="$2.5"
                      backgroundColor={newCategorySlug === c.slug ? '#14532d' : '#f3f4f6'}
                      color={newCategorySlug === c.slug ? '#ffffff' : '#374151'}
                      onPress={() => setNewCategorySlug(c.slug)}
                    >
                      {c.icon} {c.titleFr.split('.')[1] || c.titleFr}
                    </Button>
                  ))}
                </XStack>

                <Input
                  placeholder="Titre de la fiche pratique"
                  value={newTitle}
                  onChangeText={setNewTitle}
                  backgroundColor="#f9fafb"
                />
                <Input
                  placeholder="Sous-titre explicatif"
                  value={newSubtitle}
                  onChangeText={setNewSubtitle}
                  backgroundColor="#f9fafb"
                />
                <Input
                  placeholder="Résumé et explication pédagogique"
                  value={newSummary}
                  onChangeText={setNewSummary}
                  backgroundColor="#f9fafb"
                />
                <Input
                  placeholder="Formule clé (optionnel)"
                  value={newFormula}
                  onChangeText={setNewFormula}
                  backgroundColor="#f9fafb"
                />
                <Input
                  placeholder="Conseil pour les animateurs de terrain"
                  value={newFacilitatorNote}
                  onChangeText={setNewFacilitatorNote}
                  backgroundColor="#f9fafb"
                />

                <Button
                  size="$3.5"
                  backgroundColor="#16a34a"
                  color="#ffffff"
                  fontWeight="800"
                  onPress={handlePublishArticle}
                >
                  Publier dans la Boîte à Outils
                </Button>

                {publishMessage && (
                  <Text fontSize={12} fontWeight="700" color="#15803d">
                    {publishMessage}
                  </Text>
                )}
              </YStack>
            </YStack>
          ) : (
            <YStack gap="$2.5">
              <XStack gap="$2">
                <Button
                  flex={1}
                  size="$3"
                  backgroundColor={authMode === 'REGISTER' ? '#14532d' : '#f3f4f6'}
                  color={authMode === 'REGISTER' ? '#ffffff' : '#374151'}
                  onPress={() => setAuthMode('REGISTER')}
                >
                  Activer compte Animateur
                </Button>
                <Button
                  flex={1}
                  size="$3"
                  backgroundColor={authMode === 'LOGIN' ? '#14532d' : '#f3f4f6'}
                  color={authMode === 'LOGIN' ? '#ffffff' : '#374151'}
                  onPress={() => setAuthMode('LOGIN')}
                >
                  Connexion
                </Button>
              </XStack>

              {authMode === 'REGISTER' && (
                <Input
                  placeholder="Nom complet"
                  value={name}
                  onChangeText={setName}
                  backgroundColor="#f9fafb"
                />
              )}
              <Input
                placeholder="Email Rikolto / Animateur"
                value={email}
                onChangeText={setEmail}
                backgroundColor="#f9fafb"
              />
              <Input
                placeholder="Mot de passe"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                backgroundColor="#f9fafb"
              />

              <Button
                size="$4"
                backgroundColor="#16a34a"
                color="#ffffff"
                fontWeight="800"
                onPress={handleAuthSubmit}
              >
                {authMode === 'REGISTER'
                  ? 'Activer et accéder au CMS Rikolto'
                  : 'Se connecter via BetterAuth'}
              </Button>

              {authMessage && (
                <Text fontSize={12} color="#b91c1c" fontWeight="600">
                  {authMessage}
                </Text>
              )}
            </YStack>
          )}
        </YStack>
      </XStack>
    </YStack>
  );
};

