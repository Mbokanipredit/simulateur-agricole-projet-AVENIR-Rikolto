import React, { useEffect, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { ChevronRight } from 'lucide-react';
import {
  calculateEconomicResults,
  CurrencyCode,
  ExpenseStageCode,
  ProductionUnit,
  SimulationInput,
  SurfaceUnit,
} from '@avenir/shared';
import {
  activeMainSectionAtom,
  displayCurrencyAtom,
  formatMoney,
  localSavedScenariosAtom,
  simulationInputAtom,
} from '../../atoms/appAtoms';
import {
  SavedSimulationDto,
  simulationsControllerFindRecent,
} from '../../api/generated/avenirApi';

interface PastProjectCardItem {
  id: string;
  tag: string;
  province: 'Kwilu' | 'Kwango';
  title: string;
  producerLabel: string;
  image: string;
  badgeText: string;
  isUserSaved?: boolean;
  input: SimulationInput;
}

const DISTINCT_FIELD_PHOTOS = [
  '/images/agri-2.jpeg',
  '/images/agri-1.jpg',
  '/images/agri-3.jpg',
  '/images/agri-4.jpg',
];

const REFERENCE_PAST_PROJECTS: PastProjectCardItem[] = [
  {
    id: 'ref-cacao-kwilu-2ha',
    tag: 'CACAO - KWILU',
    province: 'Kwilu',
    title: 'Cacaoyère villageoise — Coopérative Bulungu',
    producerLabel: 'Simulé à Bulungu (2 ha) · Vente groupée avec l’OP pour un meilleur prix.',
    image: '/images/agri-2.jpeg',
    badgeText: 'Rentabilité élevée',
    input: {
      title: 'Cacaoyère villageoise 2 ha — Bulungu (Kwilu)',
      cropCode: 'CACAO',
      cropName: 'Cacao (Plantation en production)',
      province: 'Kwilu',
      surfaceArea: 2,
      surfaceUnit: 'HA',
      expectedYieldTotal: 1600,
      commercializedQty: 1520,
      productionUnit: 'KG',
      unitSalePriceUsd: 2.5,
      otherRevenueUsd: 80,
      exchangeRateCdfPerUsd: 2850,
      expenses: [
        { id: 'p1-1', stage: 'LAND_PREP', label: 'Entretien des pistes et drainage', unit: 'Ha', quantity: 2, unitCostUsd: 55, costType: 'FIXED' },
        { id: 'p1-2', stage: 'SEEDS', label: 'Plants sélectionnés (regarnissage)', unit: 'Plants', quantity: 100, unitCostUsd: 0.6, costType: 'VARIABLE' },
        { id: 'p1-3', stage: 'MAINTENANCE', label: 'Sarclage, égourmandage et taille sanitaire', unit: 'H/J', quantity: 70, unitCostUsd: 3.5, costType: 'VARIABLE' },
        { id: 'p1-4', stage: 'INPUTS', label: 'Compost organique, sacs jute et bâches', unit: 'Lot', quantity: 2, unitCostUsd: 120, costType: 'VARIABLE' },
        { id: 'p1-5', stage: 'HARVEST', label: 'Cueillette, écabossage, fermentation et séchage', unit: 'H/J', quantity: 80, unitCostUsd: 4.0, costType: 'VARIABLE' },
        { id: 'p1-6', stage: 'LOGISTICS', label: 'Transport vers le centre d’achat groupé', unit: 'Sacs', quantity: 25, unitCostUsd: 6.0, costType: 'VARIABLE' },
      ],
    },
  },
  {
    id: 'ref-manioc-kwango-1.5ha',
    tag: 'MANIOC - KWANGO',
    province: 'Kwango',
    title: 'Manioc amélioré & cossettes — Kenge',
    producerLabel: 'Simulé à Kenge (1,5 ha) · Boutures saines TME 419 et séchage sur claies.',
    image: '/images/agri-1.jpg',
    badgeText: 'Sécurité vivrière + Cash',
    input: {
      title: 'Manioc amélioré & cossettes 1,5 ha — Kenge (Kwango)',
      cropCode: 'MANIOC',
      cropName: 'Manioc (Cossettes & tubercules)',
      province: 'Kwango',
      surfaceArea: 1.5,
      surfaceUnit: 'HA',
      expectedYieldTotal: 5250,
      commercializedQty: 4700,
      productionUnit: 'KG',
      unitSalePriceUsd: 0.45,
      otherRevenueUsd: 60,
      exchangeRateCdfPerUsd: 2850,
      expenses: [
        { id: 'p2-1', stage: 'LAND_PREP', label: 'Défrichage raisonné et labour en billons', unit: 'H/J', quantity: 55, unitCostUsd: 3.5, costType: 'VARIABLE' },
        { id: 'p2-2', stage: 'SEEDS', label: 'Boutures saines certifiées (TME 419)', unit: 'Bottes', quantity: 75, unitCostUsd: 2.5, costType: 'VARIABLE' },
        { id: 'p2-3', stage: 'MAINTENANCE', label: 'Sarclages réguliers (3 passages)', unit: 'H/J', quantity: 60, unitCostUsd: 3.5, costType: 'VARIABLE' },
        { id: 'p2-4', stage: 'HARVEST', label: 'Arrachage, épluchage, rouissage et séchage sur claies', unit: 'H/J', quantity: 65, unitCostUsd: 3.5, costType: 'VARIABLE' },
        { id: 'p2-5', stage: 'LOGISTICS', label: 'Sacs et transport vers corridor Kinshasa', unit: 'Sacs', quantity: 60, unitCostUsd: 5.0, costType: 'VARIABLE' },
      ],
    },
  },
  {
    id: 'ref-cafe-kwilu-1ha',
    tag: 'CAFÉ ROBUSTA - IDIOFA',
    province: 'Kwilu',
    title: 'Café Robusta séché sur claies — Idiofa',
    producerLabel: 'Simulé à Idiofa (1 ha) · Récolte de cerises mûres et tri de qualité.',
    image: '/images/agri-3.jpg',
    badgeText: 'Qualité contrôlée',
    input: {
      title: 'Café Robusta 1 ha — Idiofa (Kwilu)',
      cropCode: 'CAFE_ROBUSTA',
      cropName: 'Café Robusta (Campagne annuelle)',
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
        { id: 'p3-1', stage: 'LAND_PREP', label: 'Entretien parcelle et piquetage', unit: 'Ha', quantity: 1, unitCostUsd: 65, costType: 'FIXED' },
        { id: 'p3-2', stage: 'MAINTENANCE', label: 'Sarclage et taille d’entretien', unit: 'H/J', quantity: 55, unitCostUsd: 3.5, costType: 'VARIABLE' },
        { id: 'p3-3', stage: 'INPUTS', label: 'Compost, sécateurs et sacs jute', unit: 'Lot', quantity: 1, unitCostUsd: 145, costType: 'VARIABLE' },
        { id: 'p3-4', stage: 'HARVEST', label: 'Récolte cerises rouges et séchage sur claies', unit: 'H/J', quantity: 60, unitCostUsd: 4.0, costType: 'VARIABLE' },
        { id: 'p3-5', stage: 'LOGISTICS', label: 'Transport vers coopérative', unit: 'Sacs', quantity: 20, unitCostUsd: 6.5, costType: 'VARIABLE' },
      ],
    },
  },
  {
    id: 'ref-arachide-kwango-1ha',
    tag: 'ARACHIDE & NIÉBÉ - FESHI',
    province: 'Kwango',
    title: 'Association Arachide & Niébé — Feshi',
    producerLabel: 'Simulé à Feshi (1 ha) · Cycle court de 4 mois à rotation rapide.',
    image: '/images/agri-4.jpg',
    badgeText: 'Cycle rapide 4 mois',
    input: {
      title: 'Arachide & Niébé 1 ha — Feshi (Kwango)',
      cropCode: 'ARACHIDE_NIEBE',
      cropName: 'Arachide / Niébé',
      province: 'Kwango',
      surfaceArea: 1,
      surfaceUnit: 'HA',
      expectedYieldTotal: 1150,
      commercializedQty: 1020,
      productionUnit: 'KG',
      unitSalePriceUsd: 1.25,
      otherRevenueUsd: 35,
      exchangeRateCdfPerUsd: 2850,
      expenses: [
        { id: 'p4-1', stage: 'LAND_PREP', label: 'Labour léger et ameublissement', unit: 'H/J', quantity: 30, unitCostUsd: 3.5, costType: 'VARIABLE' },
        { id: 'p4-2', stage: 'SEEDS', label: 'Semences d’arachide et niébé triées', unit: 'Kg', quantity: 60, unitCostUsd: 1.8, costType: 'VARIABLE' },
        { id: 'p4-3', stage: 'MAINTENANCE', label: 'Désherbage précoce (2 passages)', unit: 'H/J', quantity: 30, unitCostUsd: 3.5, costType: 'VARIABLE' },
        { id: 'p4-4', stage: 'HARVEST', label: 'Arrachage, séchage sur bâche et décorticage', unit: 'H/J', quantity: 35, unitCostUsd: 3.5, costType: 'VARIABLE' },
        { id: 'p4-5', stage: 'LOGISTICS', label: 'Conditionnement et transport marché', unit: 'Sacs', quantity: 20, unitCostUsd: 4.5, costType: 'VARIABLE' },
      ],
    },
  },
];

function mapSavedDtoToCard(dto: SavedSimulationDto, index: number): PastProjectCardItem {
  const normalizedProvince: 'Kwilu' | 'Kwango' =
    dto.province === 'Kwango' ? 'Kwango' : 'Kwilu';
  return {
    id: `api-${dto.id}`,
    tag: `${dto.cropName.split('(')[0].trim().toUpperCase()} - ${normalizedProvince.toUpperCase()}`,
    province: normalizedProvince,
    title: dto.title || `${dto.cropName} — ${dto.province}`,
    producerLabel: dto.producerName
      ? `Simulé par ${dto.producerName} (${dto.province}) · Code ${dto.shareCode}`
      : `Simulation partagée (${dto.province}) · Code ${dto.shareCode}`,
    image: DISTINCT_FIELD_PHOTOS[index % DISTINCT_FIELD_PHOTOS.length],
    badgeText: `Code ${dto.shareCode}`,
    isUserSaved: true,
    input: {
      title: dto.title,
      cropCode: dto.cropCode,
      cropName: dto.cropName,
      province: normalizedProvince,
      surfaceArea: dto.surfaceArea,
      surfaceUnit: (dto.surfaceUnit as SurfaceUnit) || 'HA',
      expectedYieldTotal: dto.expectedYieldTotal,
      commercializedQty: dto.commercializedQty,
      productionUnit: (dto.productionUnit as ProductionUnit) || 'KG',
      unitSalePriceUsd: dto.unitSalePriceUsd,
      otherRevenueUsd: dto.otherRevenueUsd || 0,
      exchangeRateCdfPerUsd: dto.exchangeRateCdfPerUsd || 2850,
      expenses: (dto.expenses || []).map((e) => ({
        id: e.id,
        stage: (e.stage as ExpenseStageCode) || 'MAINTENANCE',
        label: e.label,
        unit: e.unit,
        quantity: e.quantity,
        unitCostUsd: e.unitCostUsd,
        costType: e.costType === 'FIXED' ? 'FIXED' : 'VARIABLE',
      })),
    },
  };
}

/** Removed per user request (Image 2) */
export const GoldenWheatOrnament: React.FC<{ width?: number }> = () => null;

interface PastSimulatedProjectsSectionProps {
  title?: string;
  subtitle?: string;
  openTarget?: 'SIMULATOR' | 'RESULTS';
}

export const PastSimulatedProjectsSection: React.FC<PastSimulatedProjectsSectionProps> = ({
  title = 'Derniers Projets Simulés',
  subtitle = 'Inspirez-vous des campagnes agricoles déjà chiffrées au Kwilu et au Kwango. Cliquez sur un projet pour charger ses chiffres dans le simulateur.',
  openTarget = 'RESULTS',
}) => {
  const setSimulationInput = useSetAtom(simulationInputAtom);
  const setMainSection = useSetAtom(activeMainSectionAtom);
  const currency = useAtomValue<CurrencyCode>(displayCurrencyAtom);
  const localSaved = useAtomValue(localSavedScenariosAtom);
  const [remoteSaved, setRemoteSaved] = useState<PastProjectCardItem[]>([]);

  useEffect(() => {
    simulationsControllerFindRecent()
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          setRemoteSaved(list.slice(0, 4).map(mapSavedDtoToCard));
        }
      })
      .catch(() => {});
  }, []);

  const localCards: PastProjectCardItem[] = localSaved.slice(0, 4).map((item, idx) => {
    const prov: 'Kwilu' | 'Kwango' = item.input.province === 'Kwango' ? 'Kwango' : 'Kwilu';
    return {
      id: `local-${item.id}`,
      tag: `${item.input.cropName.split('(')[0].trim().toUpperCase()} - ${prov.toUpperCase()}`,
      province: prov,
      title: item.input.title,
      producerLabel: item.shareCode
        ? `Votre simulation sauvegardée (${item.input.surfaceArea} ha) · Code ${item.shareCode}`
        : `Votre simulation récente (${item.input.surfaceArea} ha) sur cet appareil.`,
      image: DISTINCT_FIELD_PHOTOS[idx % DISTINCT_FIELD_PHOTOS.length],
      badgeText: 'Votre simulation',
      isUserSaved: true,
      input: item.input,
    };
  });

  // Combine and assign a guaranteed unique image to each of the 4 cards so no two cards share an image
  const mergedProjects: PastProjectCardItem[] = [
    ...localCards,
    ...remoteSaved.filter(
      (r) => !localCards.some((l) => l.title.toLowerCase() === r.title.toLowerCase())
    ),
    ...REFERENCE_PAST_PROJECTS.filter(
      (ref) =>
        !localCards.some((l) => l.title.toLowerCase() === ref.title.toLowerCase()) &&
        !remoteSaved.some((r) => r.title.toLowerCase() === ref.title.toLowerCase())
    ),
  ]
    .slice(0, 4)
    .map((proj, idx) => ({
      ...proj,
      image: DISTINCT_FIELD_PHOTOS[idx % DISTINCT_FIELD_PHOTOS.length],
    }));

  const handleOpenProject = (project: PastProjectCardItem, destination: 'SIMULATOR' | 'RESULTS') => {
    setSimulationInput(project.input);
    setMainSection(destination);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '44px',
        overflow: 'hidden',
      }}
    >
      {/* ====================================================================
          DARK FOREST GREEN BACKDROP (Top ~82% height, matching Image 1)
      ==================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '82%',
          backgroundColor: '#0E4523',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        {/* Subtle Farm / Mill Line-Art Watermark on the Right (like Image 1) */}
        <svg
          width="380"
          height="340"
          viewBox="0 0 360 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            right: '4%',
            top: '10px',
            opacity: 0.08,
            pointerEvents: 'none',
          }}
        >
          <path d="M195 95L168 250H252L225 95H195Z" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M188 95C188 78 232 78 232 95" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="210" cy="82" r="9" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M210 82L135 20L152 10L210 82Z" stroke="#FFFFFF" strokeWidth="1.6" />
          <path d="M210 82L285 144L268 154L210 82Z" stroke="#FFFFFF" strokeWidth="1.6" />
          <path d="M210 82L275 18L286 35L210 82Z" stroke="#FFFFFF" strokeWidth="1.6" />
          <path d="M210 82L145 146L134 129L210 82Z" stroke="#FFFFFF" strokeWidth="1.6" />
          <path d="M20 265C95 235 170 238 255 260C295 245 335 242 360 250" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M55 290C125 258 210 262 345 288" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M180 140H240M176 175H244M172 210H248" stroke="#FFFFFF" strokeWidth="1.4" strokeDasharray="6 4" />
        </svg>

        {/* Organic Brush / Torn Edge along the bottom of the dark green area */}
        <svg
          viewBox="0 0 1440 34"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: -1,
            left: 0,
            width: '100%',
            height: '28px',
            display: 'block',
          }}
        >
          <path
            d="M0,18 Q90,28 180,15 T360,22 T540,14 T720,24 T900,15 T1080,23 T1260,14 T1440,20 L1440,34 L0,34 Z"
            fill="#FAF8F3"
          />
        </svg>
      </div>

      {/* ====================================================================
          CENTERED FOREGROUND CONTAINER (margin: 0 auto guarantees true centering!)
      ==================================================================== */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1380px',
          width: '100%',
          margin: '0 auto',
          padding: 'clamp(36px, 5vw, 64px) clamp(16px, 4vw, 28px) 0',
          boxSizing: 'border-box',
        }}
      >
        {/* Centered Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          <span
            style={{
              color: '#F2B632',
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(15px, 2.5vw, 17px)',
              fontWeight: 600,
              letterSpacing: '0.4px',
              marginBottom: '8px',
            }}
          >
            Projets Simulés · Kwilu & Kwango
          </span>

          <h2
            style={{
              margin: '0 0 12px 0',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-0.6px',
              lineHeight: 1.18,
              maxWidth: '820px',
            }}
          >
            {title}
          </h2>

          <p
            style={{
              margin: '0 0 18px 0',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.84)',
              maxWidth: '680px',
              lineHeight: '22px',
            }}
          >
            {subtitle}
          </p>

          <GoldenWheatOrnament width={66} />
        </div>

        {/* Centered Grid of Large Full-Bleed Image Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '24px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          {mergedProjects.map((project) => {
            const calc = calculateEconomicResults(project.input);
            const rate = project.input.exchangeRateCdfPerUsd || 2850;
            const isPositive = calc.netProfitUsd >= 0;

            return (
              <div
                key={project.id}
                onClick={() => handleOpenProject(project, openTarget)}
                style={{
                  position: 'relative',
                  height: '405px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  backgroundColor: '#163020',
                  boxShadow: '0 16px 36px rgba(10, 32, 18, 0.22)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Full-Bleed Background Photo */}
                <img
                  src={project.image}
                  alt={project.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block',
                  }}
                />

                {/* Warm Dark Gradient Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(180deg, rgba(12, 24, 15, 0.06) 0%, rgba(12, 24, 15, 0.45) 45%, rgba(12, 24, 15, 0.92) 100%)',
                  }}
                />

                {/* Bottom Overlay Content */}
                <div
                  style={{
                    position: 'absolute',
                    left: '26px',
                    right: '26px',
                    bottom: '26px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                  }}
                >
                  {/* Golden Condensed Uppercase Category Tag */}
                  <span
                    style={{
                      color: '#F2B632',
                      fontSize: '13px',
                      fontWeight: 800,
                      letterSpacing: '1.1px',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                  >
                    {project.tag}
                  </span>

                  {/* Bold White Project Title */}
                  <div
                    style={{
                      color: '#FFFFFF',
                      fontSize: '21px',
                      fontWeight: 800,
                      lineHeight: '26px',
                      letterSpacing: '-0.2px',
                      paddingRight: '48px',
                    }}
                  >
                    {project.title}
                  </div>

                  {/* Short Golden Horizontal Accent Bar */}
                  <div
                    style={{
                      width: '38px',
                      height: '2.5px',
                      backgroundColor: '#F2B632',
                      borderRadius: '2px',
                      marginTop: '10px',
                      marginBottom: '12px',
                    }}
                  />

                  {/* Muted White Description + Simulated Profit Figures */}
                  <div
                    style={{
                      color: 'rgba(255, 255, 255, 0.88)',
                      fontSize: '13px',
                      lineHeight: '19px',
                      paddingRight: '58px',
                    }}
                  >
                    <div>{project.producerLabel}</div>
                    <div
                      style={{
                        marginTop: '6px',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '12.5px',
                      }}
                    >
                      Coût : {formatMoney(calc.totalCostUsd, currency, rate)} · Bénéfice :{' '}
                      <span style={{ color: isPositive ? '#8CE99A' : '#FCA5A5', fontWeight: 800 }}>
                        {isPositive ? '+' : ''}
                        {formatMoney(calc.netProfitUsd, currency, rate)}
                      </span>
                    </div>
                  </div>

                  {/* Circular Golden Chevron Button in Bottom-Right */}
                  <div
                    title="Ouvrir cette simulation"
                    style={{
                      position: 'absolute',
                      right: 0,
                      bottom: 0,
                      width: '46px',
                      height: '46px',
                      borderRadius: '999px',
                      backgroundColor: '#F2B632',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.32)',
                    }}
                  >
                    <ChevronRight size={22} color="#18241B" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
