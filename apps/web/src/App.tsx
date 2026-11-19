import React, { useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { YStack, XStack, Text, Button } from 'tamagui';
import {
  BarChart3,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import {
  activeMainSectionAtom,
  cropTemplatesAtom,
  displayCurrencyAtom,
  economicResultsAtom,
  formatMoney,
  selectedToolboxArticleSlugAtom,
  simulationInputAtom,
  toolboxCategoriesAtom,
} from './atoms/appAtoms';
import {
  cropsControllerFindAll,
  toolboxControllerFindAllCategories,
  CropTemplateDto,
  ToolboxCategoryDto,
} from './api/generated/avenirApi';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SimulatorWorkspace } from './features/simulator/SimulatorWorkspace';
import { ResultsPage } from './features/simulator/ResultsPage';
import {
  PastSimulatedProjectsSection,
  GoldenWheatOrnament,
} from './features/simulator/PastSimulatedProjectsSection';
import { ToolboxWorkspace } from './features/toolbox/ToolboxWorkspace';
import { AdminApp } from './features/admin/AdminApp';

const FALLBACK_TEMPLATES: CropTemplateDto[] = [
  {
    id: 'fallback-cacao',
    code: 'CACAO',
    nameFr: 'Cacao (Plantation en production)',
    localName: 'Kakawo',
    category: 'PERENNIAL',
    icon: 'CACAO',
    descriptionFr: 'Cacaoyère villageoise en production dans le Kwilu.',
    cycleDurationMonths: 12,
    recommendedProvince: 'Kwilu',
    defaultSurfaceArea: 2,
    defaultSurfaceUnit: 'HA',
    defaultYieldPerHa: 800,
    defaultCommercialQty: 1520,
    productionUnit: 'KG',
    unitWeightKg: 1,
    defaultSalePriceUsd: 2.5,
    nutritionTipFr: 'Associez des arbres fruitiers dans la cacaoyère pour la nutrition familiale.',
    agronomicTipFr: 'Ombrage agroforestier et taille sanitaire régulière.',
    defaultExpenses: [
      { id: 'c-1', stage: 'LAND_PREP', label: 'Entretien des pistes et drainage', unit: 'Ha', quantity: 2, unitCostUsd: 55, costType: 'FIXED', sortOrder: 1 },
      { id: 'c-2', stage: 'SEEDS', label: 'Cabosses / plants sélectionnés (regarnissage)', unit: 'Plants', quantity: 100, unitCostUsd: 0.6, costType: 'VARIABLE', sortOrder: 2 },
      { id: 'c-3', stage: 'MAINTENANCE', label: 'Sarclage, égourmandage et taille sanitaire', unit: 'H/J', quantity: 70, unitCostUsd: 3.5, costType: 'VARIABLE', sortOrder: 3 },
      { id: 'c-4', stage: 'INPUTS', label: 'Compost organique, sacs jute et bâches', unit: 'Lot', quantity: 2, unitCostUsd: 120, costType: 'VARIABLE', sortOrder: 4 },
      { id: 'c-5', stage: 'HARVEST', label: 'Cueillette, écabossage, fermentation et séchage', unit: 'H/J', quantity: 80, unitCostUsd: 4.0, costType: 'VARIABLE', sortOrder: 5 },
      { id: 'c-6', stage: 'LOGISTICS', label: 'Transport vers le centre d’achat groupé', unit: 'Sacs', quantity: 25, unitCostUsd: 6.0, costType: 'VARIABLE', sortOrder: 6 },
    ],
  },
  {
    id: 'fallback-cafe',
    code: 'CAFE_ROBUSTA',
    nameFr: 'Café Robusta (Campagne annuelle)',
    localName: 'Kafe',
    category: 'PERENNIAL',
    icon: 'CAFE',
    descriptionFr: 'Exploitation familiale de Café Robusta au Kwilu / Kwango.',
    cycleDurationMonths: 12,
    recommendedProvince: 'Kwilu',
    defaultSurfaceArea: 1,
    defaultSurfaceUnit: 'HA',
    defaultYieldPerHa: 1200,
    defaultCommercialQty: 1150,
    productionUnit: 'KG',
    unitWeightKg: 1,
    defaultSalePriceUsd: 1.85,
    nutritionTipFr: 'Réservez une parcelle vivrière à côté de la caféière.',
    agronomicTipFr: 'Paillage des caféiers et récolte sélective des cerises mûres.',
    defaultExpenses: [
      { id: 'cf-1', stage: 'LAND_PREP', label: 'Entretien parcelle et piquetage', unit: 'Ha', quantity: 1, unitCostUsd: 65, costType: 'FIXED', sortOrder: 1 },
      { id: 'cf-2', stage: 'MAINTENANCE', label: 'Sarclage et taille d’entretien', unit: 'H/J', quantity: 55, unitCostUsd: 3.5, costType: 'VARIABLE', sortOrder: 2 },
      { id: 'cf-3', stage: 'INPUTS', label: 'Compost, sécateurs et sacs', unit: 'Lot', quantity: 1, unitCostUsd: 145, costType: 'VARIABLE', sortOrder: 3 },
      { id: 'cf-4', stage: 'HARVEST', label: 'Récolte cerises rouges et séchage sur claies', unit: 'H/J', quantity: 60, unitCostUsd: 4.0, costType: 'VARIABLE', sortOrder: 4 },
      { id: 'cf-5', stage: 'LOGISTICS', label: 'Transport vers coopérative', unit: 'Sacs', quantity: 20, unitCostUsd: 6.5, costType: 'VARIABLE', sortOrder: 5 },
    ],
  },
  {
    id: 'fallback-manioc',
    code: 'MANIOC',
    nameFr: 'Manioc (Cossettes & tubercules)',
    localName: 'Mioko / Pondu',
    category: 'SUBSISTENCE_CASH',
    icon: 'MANIOC',
    descriptionFr: 'Production de manioc amélioré résistant à la mosaïque.',
    cycleDurationMonths: 12,
    recommendedProvince: 'Kwango',
    defaultSurfaceArea: 1,
    defaultSurfaceUnit: 'HA',
    defaultYieldPerHa: 3500,
    defaultCommercialQty: 3200,
    productionUnit: 'KG',
    unitWeightKg: 1,
    defaultSalePriceUsd: 0.45,
    nutritionTipFr: 'Les feuilles de manioc (pondu) sont riches en vitamines et fer.',
    agronomicTipFr: 'Boutures saines certifiées et association avec légumineuses.',
    defaultExpenses: [
      { id: 'm-1', stage: 'LAND_PREP', label: 'Défrichage raisonné et labour en billons', unit: 'H/J', quantity: 40, unitCostUsd: 3.5, costType: 'VARIABLE', sortOrder: 1 },
      { id: 'm-2', stage: 'SEEDS', label: 'Boutures saines variété améliorée', unit: 'Bottes', quantity: 50, unitCostUsd: 2.5, costType: 'VARIABLE', sortOrder: 2 },
      { id: 'm-3', stage: 'MAINTENANCE', label: 'Sarclages réguliers (3 passages)', unit: 'H/J', quantity: 45, unitCostUsd: 3.5, costType: 'VARIABLE', sortOrder: 3 },
      { id: 'm-4', stage: 'HARVEST', label: 'Arrachage, rouissage et séchage cossettes', unit: 'H/J', quantity: 50, unitCostUsd: 3.5, costType: 'VARIABLE', sortOrder: 4 },
      { id: 'm-5', stage: 'LOGISTICS', label: 'Sacs et transport marché / Kinshasa', unit: 'Sacs', quantity: 45, unitCostUsd: 5.0, costType: 'VARIABLE', sortOrder: 5 },
    ],
  },
  {
    id: 'fallback-mais',
    code: 'MAIS_GRAIN',
    nameFr: 'Maïs grain sec',
    localName: 'Masangu',
    category: 'ANNUAL',
    icon: 'MAIS',
    descriptionFr: 'Culture de maïs grain en rotation avec arachide ou niébé.',
    cycleDurationMonths: 4,
    recommendedProvince: 'Kwilu',
    defaultSurfaceArea: 1,
    defaultSurfaceUnit: 'HA',
    defaultYieldPerHa: 1800,
    defaultCommercialQty: 1650,
    productionUnit: 'KG',
    unitWeightKg: 1,
    defaultSalePriceUsd: 0.65,
    nutritionTipFr: 'Associez le maïs aux légumineuses pour équilibrer les repas.',
    agronomicTipFr: 'Semis en ligne et enfouissement des résidus.',
    defaultExpenses: [
      { id: 'ma-1', stage: 'LAND_PREP', label: 'Préparation du sol et labour', unit: 'H/J', quantity: 35, unitCostUsd: 3.5, costType: 'VARIABLE', sortOrder: 1 },
      { id: 'ma-2', stage: 'SEEDS', label: 'Semences de maïs sélectionnées (25 kg/ha)', unit: 'Kg', quantity: 25, unitCostUsd: 2.2, costType: 'VARIABLE', sortOrder: 2 },
      { id: 'ma-3', stage: 'MAINTENANCE', label: 'Sarclage et buttage', unit: 'H/J', quantity: 35, unitCostUsd: 3.5, costType: 'VARIABLE', sortOrder: 3 },
      { id: 'ma-4', stage: 'HARVEST', label: 'Récolte, égrenage et séchage', unit: 'H/J', quantity: 30, unitCostUsd: 3.5, costType: 'VARIABLE', sortOrder: 4 },
      { id: 'ma-5', stage: 'LOGISTICS', label: 'Sacs et transport', unit: 'Sacs', quantity: 30, unitCostUsd: 4.0, costType: 'VARIABLE', sortOrder: 5 },
    ],
  },
  {
    id: 'fallback-arachide',
    code: 'ARACHIDE_NIEBE',
    nameFr: 'Arachide / Niébé',
    localName: 'Nguba / Nkasa',
    category: 'LEGUME',
    icon: 'ARACHIDE',
    descriptionFr: 'Légumineuse à haute valeur nutritive et commerciale.',
    cycleDurationMonths: 4,
    recommendedProvince: 'Kwango',
    defaultSurfaceArea: 1,
    defaultSurfaceUnit: 'HA',
    defaultYieldPerHa: 1100,
    defaultCommercialQty: 1000,
    productionUnit: 'KG',
    unitWeightKg: 1,
    defaultSalePriceUsd: 1.2,
    nutritionTipFr: 'Riche en protéines végétales essentielles pour les enfants.',
    agronomicTipFr: 'Fixation biologique de l’azote et séchage soigné sur bâche.',
    defaultExpenses: [
      { id: 'ar-1', stage: 'LAND_PREP', label: 'Labour léger et ameublissement', unit: 'H/J', quantity: 30, unitCostUsd: 3.5, costType: 'VARIABLE', sortOrder: 1 },
      { id: 'ar-2', stage: 'SEEDS', label: 'Semences d’arachide / niébé', unit: 'Kg', quantity: 60, unitCostUsd: 1.8, costType: 'VARIABLE', sortOrder: 2 },
      { id: 'ar-3', stage: 'MAINTENANCE', label: 'Désherbage précoce', unit: 'H/J', quantity: 30, unitCostUsd: 3.5, costType: 'VARIABLE', sortOrder: 3 },
      { id: 'ar-4', stage: 'HARVEST', label: 'Arrachage, séchage et décorticage', unit: 'H/J', quantity: 35, unitCostUsd: 3.5, costType: 'VARIABLE', sortOrder: 4 },
      { id: 'ar-5', stage: 'LOGISTICS', label: 'Conditionnement et transport', unit: 'Sacs', quantity: 20, unitCostUsd: 4.5, costType: 'VARIABLE', sortOrder: 5 },
    ],
  },
];

export const App: React.FC = () => {
  const [mainSection, setMainSection] = useAtom(activeMainSectionAtom);
  const setCropTemplates = useSetAtom(cropTemplatesAtom);
  const setToolboxCategories = useSetAtom(toolboxCategoriesAtom);
  const [selectedArticleSlug, setSelectedArticleSlug] = useAtom(selectedToolboxArticleSlugAtom);
  const results = useAtomValue(economicResultsAtom);
  const simInput = useAtomValue(simulationInputAtom);
  const currency = useAtomValue(displayCurrencyAtom);

  const isPopstateRef = React.useRef(false);
  const isInitializedRef = React.useRef(false);

  useEffect(() => {
    cropsControllerFindAll()
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          setCropTemplates(list);
        } else {
          setCropTemplates(FALLBACK_TEMPLATES);
        }
      })
      .catch(() => {
        setCropTemplates(FALLBACK_TEMPLATES);
      });

    toolboxControllerFindAllCategories()
      .then((cats: ToolboxCategoryDto[]) => {
        if (Array.isArray(cats) && cats.length > 0) {
          setToolboxCategories(cats);
        }
      })
      .catch(() => {});
  }, [setCropTemplates, setToolboxCategories]);

  const openToolboxCard = (articleSlug: string) => {
    setSelectedArticleSlug(articleSlug);
    setMainSection('TOOLBOX');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Initial route sync & history primer
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const isAdmin = path.startsWith('/admin') || hash === '#admin';

    let initialSection: MainSection = 'HOME';
    let initialArticleSlug: string | null = null;

    if (isAdmin) {
      initialSection = 'ADMIN';
    } else if (hash === '#simulateur') {
      initialSection = 'SIMULATOR';
    } else if (hash === '#resultats') {
      initialSection = 'RESULTS';
    } else if (hash.startsWith('#boite-a-outils')) {
      initialSection = 'TOOLBOX';
      const parts = hash.split('/');
      if (parts.length > 1 && parts[1]) {
        initialArticleSlug = parts[1];
      }
    } else if (hash === '#comment-ca-marche') {
      initialSection = 'HOW_IT_WORKS';
    } else {
      initialSection = 'HOME';
    }

    const hasPriorSiteHistory = Boolean(window.history.state?.primed);

    // If entering directly in a fresh browser tab with no prior history (length <= 1):
    // Replace current state with HOME ('/') and push the target page.
    // This immediately turns the browser's native Back button '←' and swipe-back gestures ACTIVE!
    if (!hasPriorSiteHistory) {
      if (isAdmin) {
        window.history.replaceState({ section: 'HOME', primed: true }, '', '/');
        const adminUrl = path.startsWith('/admin') ? '/admin' : '/#admin';
        window.history.pushState({ section: 'ADMIN', primed: true }, '', adminUrl);
        setMainSection('ADMIN');
      } else if (hash && hash !== '#accueil') {
        window.history.replaceState({ section: 'HOME', primed: true }, '', '/');
        window.history.pushState(
          { section: initialSection, slug: initialArticleSlug, primed: true },
          '',
          window.location.href
        );
        setMainSection(initialSection);
        if (initialArticleSlug) {
          setSelectedArticleSlug(initialArticleSlug);
        }
      } else {
        window.history.replaceState({ section: 'HOME', primed: true }, '', '/');
        setMainSection('HOME');
      }
    } else {
      setMainSection(initialSection);
      if (initialArticleSlug) {
        setSelectedArticleSlug(initialArticleSlug);
      }
    }

    isInitializedRef.current = true;

    // Handle browser Back / Forward buttons & mobile edge swipe gestures
    const handlePopState = (e: PopStateEvent) => {
      isPopstateRef.current = true;
      const curPath = window.location.pathname;
      const curHash = window.location.hash;
      const stateSection = e.state?.section as MainSection | undefined;
      const stateSlug = e.state?.slug as string | null | undefined;

      if (stateSection) {
        setMainSection(stateSection);
        setSelectedArticleSlug(stateSlug || null);
      } else if (curPath.startsWith('/admin') || curHash === '#admin') {
        setMainSection('ADMIN');
      } else if (curHash === '#simulateur') {
        setMainSection('SIMULATOR');
      } else if (curHash === '#resultats') {
        setMainSection('RESULTS');
      } else if (curHash.startsWith('#boite-a-outils')) {
        setMainSection('TOOLBOX');
        const parts = curHash.split('/');
        setSelectedArticleSlug(parts.length > 1 && parts[1] ? parts[1] : null);
      } else if (curHash === '#comment-ca-marche') {
        setMainSection('HOW_IT_WORKS');
      } else {
        setMainSection('HOME');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleHashChange = () => {
      if (isPopstateRef.current) return;
      const curHash = window.location.hash;
      if (curHash === '#admin') {
        setMainSection('ADMIN');
      } else if (curHash === '#simulateur') {
        setMainSection('SIMULATOR');
      } else if (curHash === '#resultats') {
        setMainSection('RESULTS');
      } else if (curHash.startsWith('#boite-a-outils')) {
        setMainSection('TOOLBOX');
      } else if (curHash === '#comment-ca-marche') {
        setMainSection('HOW_IT_WORKS');
      } else if (curHash === '#accueil' || curHash === '') {
        setMainSection('HOME');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [setMainSection, setSelectedArticleSlug]);

  // 2. Automatically push history entries when user clicks buttons in the app
  useEffect(() => {
    if (!isInitializedRef.current) return;

    if (isPopstateRef.current) {
      isPopstateRef.current = false;
      return;
    }

    const curPath = window.location.pathname;
    const curHash = window.location.hash;

    let targetUrl = '/';
    let targetHash = '';

    if (mainSection === 'ADMIN') {
      targetUrl = curPath.startsWith('/admin') ? '/admin' : '/#admin';
      targetHash = '#admin';
    } else if (mainSection === 'SIMULATOR') {
      targetUrl = '/#simulateur';
      targetHash = '#simulateur';
    } else if (mainSection === 'RESULTS') {
      targetUrl = '/#resultats';
      targetHash = '#resultats';
    } else if (mainSection === 'TOOLBOX') {
      targetUrl = selectedArticleSlug ? `/#boite-a-outils/${selectedArticleSlug}` : '/#boite-a-outils';
      targetHash = selectedArticleSlug ? `#boite-a-outils/${selectedArticleSlug}` : '#boite-a-outils';
    } else if (mainSection === 'HOW_IT_WORKS') {
      targetUrl = '/#comment-ca-marche';
      targetHash = '#comment-ca-marche';
    } else {
      targetUrl = '/';
      targetHash = '';
    }

    const isCurrentMatch =
      (mainSection === 'ADMIN' && (curPath.startsWith('/admin') || curHash === '#admin')) ||
      (mainSection === 'HOME' && curHash === '' && curPath === '/') ||
      curHash === targetHash;

    if (!isCurrentMatch) {
      window.history.pushState(
        { section: mainSection, slug: mainSection === 'TOOLBOX' ? selectedArticleSlug : null, primed: true },
        '',
        targetUrl
      );
    }
  }, [mainSection, selectedArticleSlug]);

  if (mainSection === 'ADMIN') {
    return (
      <AdminApp
        onBackToPublicSite={() => {
          if (window.history.length > 1) {
            window.history.back();
            return;
          }
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/';
            return;
          }
          window.location.hash = '';
          setMainSection('HOME');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <YStack minHeight="100vh" backgroundColor="#FAF8F3" justifyContent="space-between">
      {/* Header Include */}
      <Header />

      {/* Main Content Area */}
      <YStack flex={1}>
        {mainSection === 'SIMULATOR' && <SimulatorWorkspace mode="FULL_PAGE" />}

        {mainSection === 'RESULTS' && <ResultsPage />}

        {mainSection === 'TOOLBOX' && (
          <div
            style={{
              maxWidth: '1380px',
              width: '100%',
              margin: '0 auto',
              padding: 'clamp(14px, 2.5vw, 32px) clamp(10px, 2.5vw, 28px) 0',
              boxSizing: 'border-box',
            }}
          >
            <ToolboxWorkspace />
          </div>
        )}

        {(mainSection === 'HOME' ||
          mainSection === 'HOW_IT_WORKS' ||
          mainSection === 'FACILITATOR') && (
          <YStack>
            {/* ==============================================================
                HERO SECTION (Executive Agricultural Editorial Hero on HOME)
            ============================================================== */}
            {mainSection !== 'HOW_IT_WORKS' && (
              <div
                className="avenir-hero-section"
                style={{
                  position: 'relative',
                  width: '100%',
                  minHeight: '690px',
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#0E4523',
                  paddingTop: '88px',
                  paddingBottom: '124px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                {/* Full-Bleed Authentic Agricultural Field Backdrop */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'url(/images/agri-4.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 45%',
                    transform: 'scale(1.02)',
                    filter: 'saturate(1.08)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Multi-Layered Deep Forest Green Editorial Gradient Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(108deg, rgba(9, 43, 21, 0.95) 0%, rgba(14, 69, 35, 0.90) 46%, rgba(16, 62, 32, 0.72) 100%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Subtle Warm Golden Sunburst Glow on the Right */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'radial-gradient(circle at 78% 38%, rgba(242, 182, 50, 0.16) 0%, rgba(31, 99, 56, 0.08) 45%, rgba(9, 43, 21, 0) 75%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Subtle Architectural Line-Art Watermark on Right Backdrop */}
                <svg
                  viewBox="0 0 380 340"
                  style={{
                    position: 'absolute',
                    right: '2%',
                    top: '44px',
                    width: '360px',
                    height: '320px',
                    opacity: 0.07,
                    pointerEvents: 'none',
                  }}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.4"
                >
                  <path d="M180 120 L155 290 L225 290 L200 120 Z" />
                  <path d="M162 175 L218 175 M158 230 L222 230" />
                  <circle cx="190" cy="120" r="12" />
                  <path d="M190 120 L115 45 L132 30 L190 105" />
                  <path d="M190 120 L265 45 L280 62 L195 120" />
                  <path d="M190 120 L265 195 L248 210 L190 135" />
                  <path d="M190 120 L115 195 L100 178 L185 120" />
                  <path d="M10 300 Q110 265 220 295 T370 285" />
                  <path d="M10 322 Q140 285 260 315 T370 308" />
                </svg>

                {/* Centered 1240px Main Hero Grid Container */}
                <div
                  className="avenir-hero-grid"
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    maxWidth: '1240px',
                    width: '100%',
                    margin: '0 auto',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '48px',
                  }}
                >
                  {/* LEFT COLUMN: Editorial Headline, Lead Copy, Actions & Quick Crop Selector */}
                  <div
                    className="avenir-hero-left"
                    style={{
                      flex: '1.12 1 320px',
                      maxWidth: '610px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '22px',
                    }}
                  >
                    {/* Warm Italic Serif Overline */}
                    <div
                      style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontStyle: 'italic',
                        fontSize: 'clamp(16px, 2vw, 20px)',
                        color: '#F2B632',
                        letterSpacing: '0.3px',
                      }}
                    >
                      Éducation Entrepreneuriale & Décision Paysanne
                    </div>

                    {/* Main Display Title */}
                    <h1
                      style={{
                        margin: 0,
                        fontSize: 'clamp(34px, 4.6vw, 58px)',
                        fontWeight: 900,
                        color: '#FFFFFF',
                        lineHeight: 1.08,
                        letterSpacing: '-1.2px',
                      }}
                    >
                      Planifiez votre champ.{' '}
                      <span style={{ color: '#F2B632', display: 'block', marginTop: '4px' }}>
                        Calculez votre gain.
                      </span>
                    </h1>

                    {/* Golden Accent Divider Bar */}
                    <div
                      style={{
                        width: '68px',
                        height: '4px',
                        backgroundColor: '#F2B632',
                        borderRadius: '2px',
                      }}
                    />

                    {/* Editorial Lead Paragraph */}
                    <p
                      style={{
                        margin: 0,
                        fontSize: 'clamp(15px, 1.8vw, 17.5px)',
                        color: '#DCE8DF',
                        lineHeight: '27px',
                        maxWidth: '560px',
                      }}
                    >
                      Estimez vos dépenses par étape, vos recettes attendues et votre bénéfice net avant de semer. Un outil visuel et pratique conçu pour accompagner les producteurs et coopératives agricoles.
                    </p>

                    {/* Primary & Secondary Action Buttons */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '14px',
                        paddingTop: '6px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setMainSection('SIMULATOR');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        style={{
                          height: '52px',
                          padding: '0 24px',
                          borderRadius: '999px',
                          border: 'none',
                          backgroundColor: '#F2B632',
                          color: '#122017',
                          fontSize: '14.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                          boxShadow: '0 12px 28px rgba(242, 182, 50, 0.30)',
                        }}
                      >
                        <span>Commencer la simulation</span>
                        <span
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '999px',
                            backgroundColor: 'rgba(18, 32, 23, 0.12)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ArrowRight size={15} color="#122017" />
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMainSection('TOOLBOX');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        style={{
                          height: '52px',
                          padding: '0 22px',
                          borderRadius: '999px',
                          border: '1.5px solid rgba(255, 255, 255, 0.38)',
                          backgroundColor: 'rgba(255, 255, 255, 0.10)',
                          color: '#FFFFFF',
                          fontSize: '14.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '9px',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <BookOpen size={16} color="#F2B632" />
                        <span>Explorer la boîte à images</span>
                      </button>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Layered Dual-Photo Agricultural Composition + Live Financial Card */}
                  <div
                    className="avenir-hero-right"
                    style={{
                      flex: '1 1 320px',
                      maxWidth: '540px',
                      position: 'relative',
                      paddingTop: '16px',
                      paddingBottom: '28px',
                      paddingLeft: '20px',
                      paddingRight: '12px',
                    }}
                  >
                    {/* Decorative Warm Amber Frame Offset Behind Photo */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '0px',
                        right: '0px',
                        width: '78%',
                        height: '390px',
                        borderRadius: '28px',
                        border: '2px solid rgba(242, 182, 50, 0.35)',
                        background:
                          'linear-gradient(145deg, rgba(242, 182, 50, 0.14) 0%, rgba(255, 255, 255, 0.03) 100%)',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Main Featured Field Photo (agri-3.jpg) — Pill removed per user request (Image 1) */}
                    <div
                      className="avenir-hero-photo"
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '435px',
                        borderRadius: '26px',
                        overflow: 'hidden',
                        border: '4px solid rgba(255, 255, 255, 0.22)',
                        boxShadow: '0 26px 54px rgba(5, 24, 12, 0.42)',
                        backgroundColor: '#143D22',
                      }}
                    >
                      <img
                        src="/images/agri-3.jpg"
                        alt="Productrices agricoles en pépinière avec smartphone"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      {/* Subtle Bottom Vignette for Depth */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(180deg, rgba(9, 34, 17, 0.05) 0%, rgba(9, 34, 17, 0.08) 55%, rgba(9, 34, 17, 0.55) 100%)',
                        }}
                      />
                    </div>

                    {/* Secondary Overlapping Field Inset Photo (agri-1.jpg) */}
                    <div
                      className="avenir-hero-inset-photo"
                      style={{
                        position: 'absolute',
                        top: '-14px',
                        right: '-6px',
                        width: '185px',
                        height: '136px',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        border: '4px solid #FAF8F3',
                        boxShadow: '0 16px 32px rgba(7, 28, 14, 0.35)',
                        backgroundColor: '#0E4523',
                      }}
                    >
                      <img
                        src="/images/agri-1.jpg"
                        alt="Suivi agronomique au champ"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </div>

                    {/* Floating Interactive Financial Summary Card (Bottom-Left Overlap) */}
                    <div
                      className="avenir-hero-float-card"
                      onClick={() => {
                        setMainSection('RESULTS');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        position: 'absolute',
                        bottom: '0px',
                        left: '0px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '20px',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        cursor: 'pointer',
                        boxShadow: '0 18px 40px rgba(7, 28, 14, 0.28)',
                        border: '1px solid #DCE5DC',
                        minWidth: '280px',
                      }}
                    >
                      <div
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '14px',
                          backgroundColor: '#F2B632',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <BarChart3 size={24} color="#122017" />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '11.5px',
                              fontWeight: 700,
                              color: '#5E6E62',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            Bénéfice net estimé
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#1F6338',
                              backgroundColor: '#E7F3E7',
                              padding: '2px 8px',
                              borderRadius: '999px',
                            }}
                          >
                            Rentable
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: '23px',
                            fontWeight: 900,
                            color: '#0E4523',
                            letterSpacing: '-0.5px',
                            marginTop: '2px',
                          }}
                        >
                          {formatMoney(
                            results.netProfitUsd > 0 ? results.netProfitUsd : 1000,
                            currency,
                            simInput.exchangeRateCdfPerUsd || 2850
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organic Sculpted Wave Bottom Transition into Comment ça marche */}
                <svg
                  viewBox="0 0 1440 56"
                  preserveAspectRatio="none"
                  style={{
                    position: 'absolute',
                    bottom: -1,
                    left: 0,
                    width: '100%',
                    height: '44px',
                    display: 'block',
                    zIndex: 3,
                    pointerEvents: 'none',
                  }}
                >
                  <path
                    d="M0,18 C320,56 640,0 960,28 C1180,46 1340,18 1440,8 L1440,56 L0,56 Z"
                    fill="#F2EEE4"
                  />
                </svg>
              </div>
            )}

            {/* ==============================================================
                SECTION 1: COMMENT ÇA MARCHE ? (Exact Image 4 + Image 3 Design)
            ============================================================== */}
            <div
              id="comment-ca-marche"
              style={{
                position: 'relative',
                width: '100%',
                backgroundColor: '#FFFFFF',
                paddingBottom: '64px',
                overflow: 'hidden',
              }}
            >
              {/* Top ~76% Field Backdrop with Rich Warm Parchment/Sage Overlay & Farm Sketch (Item 3) */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '76%',
                  backgroundImage: 'url(/images/agri-4.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  zIndex: 0,
                  overflow: 'hidden',
                }}
              >
                {/* Rich Warm Parchment & Forest Sage Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(180deg, rgba(242, 238, 228, 0.92) 0%, rgba(235, 243, 236, 0.90) 65%, rgba(242, 238, 228, 0.95) 100%)',
                  }}
                />
                {/* Delicate Farm Barn, Silo, Trees & Fence Line-Art Watermark on the Right (like Image 4) */}
                <svg
                  width="540"
                  height="340"
                  viewBox="0 0 540 340"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    position: 'absolute',
                    right: 0,
                    bottom: '18px',
                    opacity: 0.22,
                    pointerEvents: 'none',
                  }}
                >
                  {/* Clouds */}
                  <path d="M90 55C96 46 112 46 118 55H132C138 55 142 62 136 66H84C78 62 82 55 90 55Z" stroke="#9C9585" strokeWidth="1.2" />
                  <path d="M270 38C276 29 292 29 298 38H312C318 38 322 45 316 49H264C258 45 262 38 270 38Z" stroke="#9C9585" strokeWidth="1.2" />
                  {/* Windmill */}
                  <path d="M352 98L344 176H366L358 98H352Z" stroke="#8C8474" strokeWidth="1.4" />
                  <circle cx="355" cy="95" r="5" stroke="#8C8474" strokeWidth="1.4" />
                  <path d="M355 95L336 76M355 95L374 114M355 95L374 76M355 95L336 114" stroke="#8C8474" strokeWidth="1.4" />
                  {/* Farmhouse / Barn */}
                  <path d="M385 145L425 116L468 145V184H385V145Z" stroke="#8C8474" strokeWidth="1.5" />
                  <path d="M425 116L485 124L512 148H468" stroke="#8C8474" strokeWidth="1.4" />
                  <path d="M468 145H512V184H468" stroke="#8C8474" strokeWidth="1.4" />
                  <rect x="412" y="152" width="24" height="32" stroke="#8C8474" strokeWidth="1.3" />
                  <path d="M412 152L436 184M436 152L412 184" stroke="#8C8474" strokeWidth="1.1" />
                  {/* Trees */}
                  <circle cx="242" cy="162" r="18" stroke="#8C8474" strokeWidth="1.3" />
                  <path d="M242 180V202" stroke="#8C8474" strokeWidth="1.6" />
                  <circle cx="282" cy="154" r="22" stroke="#8C8474" strokeWidth="1.3" />
                  <path d="M282 176V198" stroke="#8C8474" strokeWidth="1.6" />
                  {/* Rolling Hills & Furrows */}
                  <path d="M120 225C220 185 350 178 540 192" stroke="#8C8474" strokeWidth="1.6" />
                  <path d="M160 255C260 205 390 198 540 218" stroke="#8C8474" strokeWidth="1.3" />
                  <path d="M210 290C310 230 420 222 540 245" stroke="#8C8474" strokeWidth="1.2" strokeDasharray="5 4" />
                  {/* Wooden Fence on Right */}
                  <path d="M430 245V315M472 260V325M515 275V335" stroke="#8C8474" strokeWidth="2.2" />
                  <path d="M420 265L535 302M420 290L535 325" stroke="#8C8474" strokeWidth="1.8" />
                </svg>

                {/* Organic Brush / Torn Bottom Edge transitioning to #FFFFFF */}
                <svg
                  viewBox="0 0 1440 32"
                  preserveAspectRatio="none"
                  style={{
                    position: 'absolute',
                    bottom: -1,
                    left: 0,
                    width: '100%',
                    height: '24px',
                    display: 'block',
                  }}
                >
                  <path
                    d="M0,16 Q80,26 160,14 T320,20 T480,12 T640,22 T800,14 T960,22 T1120,13 T1280,21 T1440,15 L1440,32 L0,32 Z"
                    fill="#FFFFFF"
                  />
                </svg>
              </div>

              {/* Centered Foreground Container */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  maxWidth: '1380px',
                  width: '100%',
                  margin: '0 auto',
                  padding: 'clamp(44px, 6vw, 68px) clamp(16px, 3vw, 28px) 0',
                  boxSizing: 'border-box',
                }}
              >
                {/* Centered Header (Green Script Overline + Bold Dark Forest Title + Subtitle + Golden Wheat) */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    marginBottom: '68px',
                  }}
                >
                  <span
                    style={{
                      color: '#1F6338',
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontStyle: 'italic',
                      fontSize: '17px',
                      fontWeight: 700,
                      marginBottom: '8px',
                    }}
                  >
                    Comment ça marche ? · Simple & Sans Compte
                  </span>

                  <h2
                    style={{
                      margin: '0 0 12px 0',
                      fontSize: 'clamp(28px, 3.6vw, 38px)',
                      fontWeight: 900,
                      color: '#0D2615',
                      lineHeight: 1.18,
                      letterSpacing: '-0.7px',
                      maxWidth: '680px',
                    }}
                  >
                    Planifiez et Simulez Votre Campagne en 4 Étapes
                  </h2>

                  <p
                    style={{
                      margin: '0 0 18px 0',
                      fontSize: '14.5px',
                      color: '#5F685F',
                      maxWidth: '640px',
                      lineHeight: '22px',
                    }}
                  >
                    Quatre étapes intuitives avec des images et des chiffres clairs, conçues pour tous les producteurs et animateurs du Kwilu et du Kwango.
                  </p>

                  <GoldenWheatOrnament width={64} />
                </div>

                {/* 4 Deep Forest Green Cards with Overlapping Top Golden Circle Icons */}
                <div className="avenir-steps-grid">
                  {[
                    {
                      stepNum: '1.',
                      title: 'Choisissez votre culture',
                      desc: 'Sélectionnez votre spéculation (Cacao, Manioc, Café, Maïs, Arachide) et indiquez la superficie de votre champ.',
                      targetSection: 'SIMULATOR' as const,
                      highlightFrame: false,
                      svgIcon: (
                        <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                          {/* Sprouting plant & field rows */}
                          <path
                            d="M24 38V18"
                            stroke="#3B2507"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M24 24C24 15 13 11 9 14C9 21 15 26 24 24Z"
                            fill="#3B2507"
                          />
                          <path
                            d="M24 20C24 11 35 7 39 10C39 17 33 22 24 20Z"
                            fill="#3B2507"
                          />
                          <path
                            d="M10 38C15 34 33 34 38 38"
                            stroke="#3B2507"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          <path
                            d="M14 42H34"
                            stroke="#3B2507"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      ),
                    },
                    {
                      stepNum: '2.',
                      title: 'Notez vos dépenses',
                      desc: 'Ajustez facilement les coûts de préparation du terrain, semences, sarclage, récolte et transport avec les boutons - et +.',
                      targetSection: 'SIMULATOR' as const,
                      highlightFrame: false,
                      svgIcon: (
                        <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                          {/* Farmer's notebook / calculator & coin */}
                          <rect
                            x="11"
                            y="8"
                            width="24"
                            height="32"
                            rx="4"
                            stroke="#3B2507"
                            strokeWidth="3"
                            fill="rgba(59,37,7,0.12)"
                          />
                          <rect x="16" y="13" width="14" height="6" rx="1.5" fill="#3B2507" />
                          <circle cx="18.5" cy="25" r="2" fill="#3B2507" />
                          <circle cx="23" cy="25" r="2" fill="#3B2507" />
                          <circle cx="27.5" cy="25" r="2" fill="#3B2507" />
                          <circle cx="18.5" cy="31" r="2" fill="#3B2507" />
                          <circle cx="23" cy="31" r="2" fill="#3B2507" />
                          <circle cx="34" cy="33" r="7" fill="#3B2507" />
                          <text
                            x="34"
                            y="36.5"
                            textAnchor="middle"
                            fill="#F2B632"
                            fontSize="10"
                            fontWeight="900"
                          >
                            $
                          </text>
                        </svg>
                      ),
                    },
                    {
                      stepNum: '3.',
                      title: 'Comparez les scénarios',
                      desc: 'Testez plusieurs prix de vente au marché et quantités récoltées (scénario prudent, moyen ou favorable).',
                      targetSection: 'SIMULATOR' as const,
                      highlightFrame: true,
                      svgIcon: (
                        <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                          {/* Rising bars & trend arrow */}
                          <rect x="10" y="26" width="6.5" height="13" rx="2" fill="#3B2507" />
                          <rect x="20.5" y="19" width="6.5" height="20" rx="2" fill="#3B2507" />
                          <rect x="31" y="12" width="6.5" height="27" rx="2" fill="#3B2507" />
                          <path
                            d="M11 20L22 12L34 7"
                            stroke="#3B2507"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M29 6.5H35.5V13"
                            stroke="#3B2507"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ),
                    },
                    {
                      stepNum: '4.',
                      title: 'Décidez en confiance',
                      desc: 'Connaissez votre seuil de rentabilité et votre vrai bénéfice net avant de semer ou de vendre votre récolte.',
                      targetSection: 'SIMULATOR' as const,
                      highlightFrame: false,
                      svgIcon: (
                        <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                          {/* Harvest sack with wheat & checkmark badge */}
                          <path
                            d="M17 16C14 21 12 27 12 34C12 38 16 40 24 40C32 40 36 38 36 34C36 27 34 21 31 16H17Z"
                            fill="#3B2507"
                          />
                          <path
                            d="M18 11C20 14 28 14 30 11"
                            stroke="#3B2507"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          <path
                            d="M16 16H32"
                            stroke="#F2B632"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M19.5 28.5L22.8 32L29.5 25"
                            stroke="#F2B632"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ),
                    },
                  ].map((step, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setMainSection(step.targetSection);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        position: 'relative',
                        backgroundColor: '#0E4523',
                        borderRadius: '18px',
                        padding: '62px 26px 32px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        boxShadow: '0 16px 36px rgba(12, 42, 22, 0.16)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                    >
                      {/* Subtle Inner Dashed Border Frame (matching Image 4) */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: '10px',
                          borderRadius: '13px',
                          border: step.highlightFrame
                            ? '1px dashed rgba(242, 182, 50, 0.45)'
                            : '1px dashed rgba(255, 255, 255, 0.14)',
                          pointerEvents: 'none',
                        }}
                      />

                      {/* Large Overlapping Top Golden Circle Badge (Exact Image 4) + Step Number Pill (Image 3) */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '-46px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '92px',
                          height: '92px',
                          borderRadius: '999px',
                          backgroundColor: '#F2B632',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 10px 24px rgba(24, 36, 27, 0.2)',
                        }}
                      >
                        {step.svgIcon}

                        {/* Step Number Badge (1., 2., 3., 4. from Image 3) */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '-4px',
                            left: '-6px',
                            width: '30px',
                            height: '30px',
                            borderRadius: '999px',
                            backgroundColor: '#0E4523',
                            border: '2px solid #F2B632',
                            color: '#FFFFFF',
                            fontSize: '12.5px',
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {step.stepNum}
                        </div>
                      </div>

                      {/* Bold White Step Title */}
                      <div
                        style={{
                          fontSize: '20px',
                          fontWeight: 800,
                          color: '#FFFFFF',
                          lineHeight: '26px',
                          letterSpacing: '-0.2px',
                          marginTop: '4px',
                        }}
                      >
                        {step.title}
                      </div>

                      {/* Short Golden Horizontal Accent Line (Exact Image 4) */}
                      <div
                        style={{
                          width: '44px',
                          height: '2.5px',
                          backgroundColor: '#F2B632',
                          borderRadius: '2px',
                          marginTop: '14px',
                          marginBottom: '16px',
                        }}
                      />

                      {/* Muted Cream/White Step Description */}
                      <div
                        style={{
                          fontSize: '13.5px',
                          color: 'rgba(255, 255, 255, 0.82)',
                          lineHeight: '21px',
                          maxWidth: '250px',
                          marginBottom: '24px',
                          flex: 1,
                        }}
                      >
                        {step.desc}
                      </div>

                      {/* Hand-Drawn Curved Arrow Icon at Bottom (Exact Image 4) */}
                      <svg
                        width="42"
                        height="16"
                        viewBox="0 0 42 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2 9.5C13 7.5 25 7.5 38 8.5"
                          stroke={step.highlightFrame ? '#F2B632' : '#FFFFFF'}
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />
                        <path
                          d="M32 3.5L39 8.5L32.5 13"
                          stroke={step.highlightFrame ? '#F2B632' : '#FFFFFF'}
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ))}
                </div>

                {/* Centered Bottom Pill CTA Button (from Image 3) */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '42px',
                  }}
                >
                  <div
                    onClick={() => {
                      setMainSection('SIMULATOR');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: '#6EA13C',
                      color: '#FFFFFF',
                      padding: '13px 34px',
                      borderRadius: '999px',
                      fontSize: '14.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 8px 22px rgba(110, 161, 60, 0.28)',
                    }}
                  >
                    <span>Commencer ma simulation étape par étape</span>
                    <ArrowRight size={16} color="#FFFFFF" />
                  </div>
                </div>
              </div>
            </div>

            {/* ==============================================================
                SECTION 2: LE SIMULATEUR ÉCONOMIQUE (Exact Image 2 Design on Crisp White)
            ============================================================== */}
            <div
              id="simulateur-section"
              style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                paddingTop: '56px',
                paddingBottom: '76px',
              }}
            >
              <SimulatorWorkspace mode="HOME_SECTION" />
            </div>

            {/* ==============================================================
                SECTION 3: AUTRES PROJETS SIMULÉS (Shown on HOME, hidden on HOW_IT_WORKS)
            ============================================================== */}
            {mainSection !== 'HOW_IT_WORKS' && (
              <YStack
                id="past-projects-section"
                paddingTop="$6"
                paddingBottom="$4"
                backgroundColor="#FAF8F3"
                width="100%"
              >
                <PastSimulatedProjectsSection openTarget="RESULTS" />
              </YStack>
            )}

            {/* ==============================================================
                SECTION 4: LA BOÎTE À OUTILS / BOÎTE À IMAGES (Exact Image 2 Design, Centered & Balanced)
            ============================================================== */}
            <div
              id="boite-a-outils-section"
              style={{
                position: 'relative',
                width: '100%',
                backgroundColor: '#FFFFFF',
                paddingTop: '68px',
                paddingBottom: '76px',
                overflow: 'hidden',
              }}
            >
              {/* Centered Container (margin: 0 auto guarantees true horizontal centering!) */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  maxWidth: '1380px',
                  width: '100%',
                  margin: '0 auto',
                  padding: '0 clamp(16px, 3vw, 28px)',
                  boxSizing: 'border-box',
                }}
              >
                {/* Centered Section Header */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    marginBottom: '40px',
                  }}
                >
                  <GoldenWheatOrnament width={62} />
                  <h2
                    style={{
                      margin: '12px 0 10px 0',
                      fontSize: 'clamp(28px, 3.5vw, 36px)',
                      fontWeight: 900,
                      color: '#18241B',
                      letterSpacing: '-0.6px',
                      lineHeight: 1.18,
                    }}
                  >
                    La boîte à outils pédagogique
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '14.5px',
                      color: '#5F685F',
                      maxWidth: '680px',
                      lineHeight: '22px',
                    }}
                  >
                    Fiches illustrées pour producteurs, animateurs et jeunes entrepreneurs : suivez Papa Mavungu, Mama Nzuzi et Kiese à travers les 12 scènes de la Boîte à images AVENIR.
                  </p>
                </div>

                {/* Balanced Unified Scenic Cards Grid with Image First & Dark Hover Overlay */}
                <div className="avenir-cards-grid-4">
                  {[
                    {
                      badge: 'Images 1 à 4 · Planifier',
                      title: 'Gérer son exploitation',
                      desc: 'Voir le champ comme une activité économique, choisir son marché et planifier avant de semer.',
                      slug: 'image-1',
                      photo: '/boite-a-images/card-1.png',
                    },
                    {
                      badge: 'Images 5 à 7 · Produire & Suivre',
                      title: 'Calculer ses coûts',
                      desc: 'Noter chaque dépense dans un cahier, calculer le coût de revient et connaître son vrai bénéfice.',
                      slug: 'image-7',
                      photo: '/boite-a-images/card-7.png',
                    },
                    {
                      badge: 'Images 8 à 11 · Qualité & Vente',
                      title: 'Mieux vendre',
                      desc: 'Sécher sur bâche propre, comparer les acheteurs et vendre groupé avec la coopérative.',
                      slug: 'image-10',
                      photo: '/boite-a-images/card-10.png',
                    },
                    {
                      badge: 'Image 12 · Réinvestir',
                      title: 'Entreprendre & Réinvestir',
                      desc: 'Séparer les dépenses du ménage, l’épargne de sécurité et le capital de la prochaine saison.',
                      slug: 'image-12',
                      photo: '/boite-a-images/card-12.png',
                    },
                  ].map((card, i) => (
                    <div
                      key={i}
                      className="avenir-hover-comic-card"
                      onClick={() => openToolboxCard(card.slug)}
                    >
                      {/* Initially full image */}
                      <img
                        src={card.photo}
                        alt={card.title}
                        className="card-base-img"
                      />

                      {/* Mobile hint visible on touch screens */}
                      <div className="card-mobile-hint">
                        <div style={{ fontSize: '14px', fontWeight: 800 }}>{card.title}</div>
                      </div>

                      {/* Dark Transparent Hover Overlay */}
                      <div className="card-hover-overlay">
                        <div className="card-hover-content">
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#F2B632',
                              letterSpacing: '0.8px',
                              textTransform: 'uppercase',
                              marginBottom: '6px',
                            }}
                          >
                            {card.badge}
                          </span>

                          <div
                            style={{
                              fontSize: '18px',
                              fontWeight: 800,
                              color: '#FFFFFF',
                              lineHeight: '23px',
                              marginBottom: '8px',
                            }}
                          >
                            {card.title}
                          </div>

                          <div
                            style={{
                              fontSize: '12.5px',
                              color: '#DCE7DF',
                              lineHeight: '18px',
                              maxWidth: '260px',
                              marginBottom: '16px',
                            }}
                          >
                            {card.desc}
                          </div>

                          <div
                            style={{
                              padding: '8px 20px',
                              borderRadius: '999px',
                              backgroundColor: '#F2B632',
                              color: '#122017',
                              fontSize: '12.5px',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 4px 14px rgba(242, 182, 50, 0.35)',
                            }}
                          >
                            <span>Lire la fiche</span>
                            <span>→</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom CTA Button to view all 12 images */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '36px',
                  }}
                >
                  <Button
                    size="$4"
                    height={46}
                    borderRadius={999}
                    paddingHorizontal="$5"
                    backgroundColor="#1F6338"
                    onPress={() => {
                      setSelectedArticleSlug(null);
                      setMainSection('TOOLBOX');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <XStack alignItems="center" gap="$2">
                      <BookOpen size={15} color="#FFFFFF" />
                      <Text fontSize={14} fontWeight="700" color="#FFFFFF">
                        Explorer les 12 images de la Boîte à outils
                      </Text>
                      <ArrowRight size={15} color="#FFFFFF" />
                    </XStack>
                  </Button>
                </div>
              </div>
            </div>
          </YStack>
        )}
      </YStack>

      {/* Footer Include */}
      <Footer />
    </YStack>
  );
};

export default App;
