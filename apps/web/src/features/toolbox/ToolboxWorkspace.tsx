import React, { useState, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { YStack, XStack, Text, Button, Input } from 'tamagui';
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Copy,
  Check,
  BookOpen,
  Layers,
  ClipboardList,
  MessageSquare,
} from 'lucide-react';
import {
  activeMainSectionAtom,
  selectedToolboxArticleSlugAtom,
} from '../../atoms/appAtoms';
import { GoldenWheatOrnament } from '../simulator/PastSimulatedProjectsSection';

export type BoitePhaseCode =
  | 'ALL'
  | 'PLANIFIER'
  | 'PRODUIRE_SUIVRE'
  | 'QUALITE'
  | 'VENDRE'
  | 'REINVESTIR';

export interface BoiteImageItem {
  number: number;
  slug: string;
  title: string;
  phaseCode: Exclude<BoitePhaseCode, 'ALL'>;
  phaseLabel: string;
  phaseColor: string;
  imageUrl: string;
  mainMessage: string;
  situation: string;
  facilitatorMessages: string[];
  questionToAsk: string;
  characters: string;
  elementsToShow: string;
}

export const BOITE_A_IMAGES_DATA: BoiteImageItem[] = [
  {
    number: 1,
    slug: 'image-1-agriculture-activite-economique',
    title: 'L’agriculture, une activité économique',
    phaseCode: 'PLANIFIER',
    phaseLabel: 'PLANIFIER',
    phaseColor: '#216139',
    imageUrl: '/boite-a-images/image-1.png',
    mainMessage:
      '« Mon exploitation agricole est aussi une activité économique : je dois la planifier et la gérer. »',
    situation:
      'Un producteur dans son exploitation, entouré de ses produits agricoles, avec quelques éléments représentant ses dépenses et ses revenus.',
    facilitatorMessages: [
      'Produire ne suffit pas : il faut savoir ce que l’on veut produire, pourquoi et pour qui.',
      'Une activité agricole demande des investissements.',
      'Le producteur doit connaître ses dépenses et ses revenus.',
    ],
    questionToAsk:
      '« Qu’est-ce qui fait de votre activité agricole une activité économique ? »',
    characters:
      'Papa Mavungu, producteur (chapeau de paille), au centre, bras ouverts.',
    elementsToShow:
      'Paniers de manioc, de maïs et d’arachides, sacs de récolte ; champs de maïs et de manioc ; case et palmier ; panneau DÉPENSES (semences, intrants, houe) ; panneau REVENUS (billets et pièces).',
  },
  {
    number: 2,
    slug: 'image-2-je-definis-mon-objectif',
    title: 'Je définis mon objectif',
    phaseCode: 'PLANIFIER',
    phaseLabel: 'PLANIFIER',
    phaseColor: '#216139',
    imageUrl: '/boite-a-images/image-2.png',
    mainMessage:
      '« Avant de produire, je définis ce que je veux obtenir de mon activité. »',
    situation:
      'Un producteur qui réfléchit à son activité avant le début de la saison : superficie, culture, quantité à produire et objectif de vente.',
    facilitatorMessages: [
      'Que vais-je produire ?',
      'Sur quelle superficie ?',
      'Quelle quantité est-ce que je souhaite obtenir ?',
      'Quelle partie sera destinée à la consommation et quelle partie à la vente ?',
    ],
    questionToAsk:
      '« Avant de commencer une saison agricole, que prévoyez-vous ? »',
    characters: 'Papa Mavungu, pensif, la main au menton.',
    elementsToShow:
      'Grande bulle de pensée en 4 cases : superficie ?, culture ?, quantité ?, consommer / vendre ? ; case, arbre, paniers de maïs et de manioc, sac.',
  },
  {
    number: 3,
    slug: 'image-3-je-choisis-ce-que-je-vais-produire',
    title: 'Je choisis ce que je vais produire',
    phaseCode: 'PLANIFIER',
    phaseLabel: 'PLANIFIER',
    phaseColor: '#216139',
    imageUrl: '/boite-a-images/image-3.png',
    mainMessage:
      '« Je choisis ma production en fonction de mes possibilités et des opportunités. »',
    situation:
      'Un producteur comparant différentes cultures en tenant compte de la saison, de ses moyens et des possibilités de vente.',
    facilitatorMessages: [
      'Tenir compte des conditions agroécologiques.',
      'Tenir compte des besoins du ménage.',
      'Observer les possibilités de marché.',
      'Éviter de choisir une spéculation uniquement parce que les autres producteurs la cultivent.',
    ],
    questionToAsk:
      '« Quels éléments prenez-vous en compte avant de choisir une culture ? »',
    characters:
      'Papa Mavungu, qui montre les cartes ; quatre producteurs voisins en miniature.',
    elementsToShow:
      'Trois cartes (maïs, manioc, arachide) avec trois critères cochés : saison, moyens, vente ; les voisins qui cultivent tous la même chose, barrés d’une croix rouge.',
  },
  {
    number: 4,
    slug: 'image-4-je-planifie-mes-besoins',
    title: 'Je planifie mes besoins',
    phaseCode: 'PLANIFIER',
    phaseLabel: 'PLANIFIER',
    phaseColor: '#216139',
    imageUrl: '/boite-a-images/image-4.png',
    mainMessage:
      '« Je prépare à l’avance les ressources nécessaires à ma production. »',
    situation:
      'Un producteur préparant ses semences, outils, intrants et besoins en main-d’œuvre avant le début de la campagne.',
    facilitatorMessages: [
      'Prévoir les semences.',
      'Prévoir les intrants nécessaires.',
      'Prévoir la main-d’œuvre.',
      'Prévoir les autres dépenses liées à la production.',
      'Utiliser des semences de qualité certifiée lorsque cela est recommandé.',
    ],
    questionToAsk:
      '« Quelles ressources devez-vous prévoir avant de commencer votre production ? »',
    characters:
      'Mama Nzuzi, productrice, avec sa liste ; deux ouvriers agricoles (un homme, une femme).',
    elementsToShow:
      'Sacs de semences de qualité certifiée, sacs d’intrants, houe et machette, liste « À prévoir » (semences, intrants, main-d’œuvre, autres dépenses), case.',
  },
  {
    number: 5,
    slug: 'image-5-je-produis-avec-de-bonnes-pratiques',
    title: 'Je produis avec de bonnes pratiques',
    phaseCode: 'PRODUIRE_SUIVRE',
    phaseLabel: 'PRODUIRE ET SUIVRE',
    phaseColor: '#8C6218',
    imageUrl: '/boite-a-images/image-5.png',
    mainMessage:
      '« De bonnes pratiques agricoles permettent d’améliorer progressivement ma production. »',
    situation:
      'Une parcelle bien entretenue avec un producteur appliquant les bonnes pratiques agricoles.',
    facilitatorMessages: [
      'Préparer correctement le terrain.',
      'Utiliser les semences et intrants de manière appropriée.',
      'Respecter les pratiques recommandées pour chaque culture.',
      'Entretenir régulièrement la parcelle.',
      'Protéger les ressources naturelles.',
    ],
    questionToAsk:
      '« Quelles bonnes pratiques utilisez-vous déjà dans votre exploitation ? »',
    characters:
      'Mama Nzuzi avec sa houe ; Kiese, un jeune qui participe aux travaux.',
    elementsToShow:
      'Parcelle en lignes régulières de maïs et de manioc, buttes préparées, sac de semences, arbres préservés ; cinq pastilles numérotées qui reprennent les cinq messages clés.',
  },
  {
    number: 6,
    slug: 'image-6-je-connais-mes-depenses',
    title: 'Je connais mes dépenses',
    phaseCode: 'PRODUIRE_SUIVRE',
    phaseLabel: 'PRODUIRE ET SUIVRE',
    phaseColor: '#8C6218',
    imageUrl: '/boite-a-images/image-6.png',
    mainMessage:
      '« Je note mes dépenses pour savoir combien me coûte ma production. »',
    situation:
      'Un producteur notant dans un carnet les dépenses liées à son activité agricole.',
    facilitatorMessages: [
      'Les semences',
      'Les intrants',
      'La main-d’œuvre',
      'Le transport',
      'La location éventuelle',
      'Les autres coûts liés à l’activité.',
    ],
    questionToAsk:
      '« Si vous ne notez pas vos dépenses, comment pouvez-vous savoir si votre activité est rentable ? »',
    characters: 'Papa Mavungu, qui écrit à une table devant sa case.',
    elementsToShow:
      'Carnet des dépenses en gros plan avec six lignes (semences, intrants, main-d’œuvre, transport, location éventuelle, autres coûts), pièces, crayon, sachet de semences, sac d’intrants.',
  },
  {
    number: 7,
    slug: 'image-7-je-suis-ma-production',
    title: 'Je suis ma production',
    phaseCode: 'PRODUIRE_SUIVRE',
    phaseLabel: 'PRODUIRE ET SUIVRE',
    phaseColor: '#8C6218',
    imageUrl: '/boite-a-images/image-7.png',
    mainMessage:
      '« Je suis ma production pour mieux gérer mon exploitation. »',
    situation:
      'Un producteur observant sa parcelle et enregistrant les informations sur sa production.',
    facilitatorMessages: [
      'Connaître la superficie emblavée.',
      'Suivre les activités réalisées.',
      'Estimer ou mesurer les quantités produites.',
      'Garder les informations utiles sur chaque campagne.',
    ],
    questionToAsk:
      '« Quelles informations devriez-vous conserver sur votre exploitation ? »',
    characters: 'Mama Nzuzi, qui observe sa parcelle et tient un carnet.',
    elementsToShow:
      'Parcelle délimitée par des piquets et une corde (« superficie emblavée »), carnet « Campagne » (superficie, activités, quantités), panier de maïs et sacs avec l’étiquette « … kg récoltés ? ».',
  },
  {
    number: 8,
    slug: 'image-8-je-reduis-les-pertes-et-ameliore-la-qualite',
    title: 'Je réduis les pertes et améliore la qualité',
    phaseCode: 'QUALITE',
    phaseLabel: 'GARDER LA QUALITÉ',
    phaseColor: '#1E6B6B',
    imageUrl: '/boite-a-images/image-8.png',
    mainMessage:
      '« Une bonne récolte peut perdre sa valeur si elle est mal manipulée ou mal conservée. »',
    situation:
      'Des produits récoltés, triés, séchés et correctement stockés, avec une comparaison avec des produits mal conservés.',
    facilitatorMessages: [
      'Récolter au bon moment.',
      'Manipuler correctement les produits.',
      'Trier les produits.',
      'Respecter les bonnes pratiques de séchage et de stockage.',
      'Réduire les pertes après récolte.',
      'Préserver la qualité jusqu’à la vente.',
    ],
    questionToAsk:
      '« Que faites-vous pour éviter que vos produits perdent leur qualité après la récolte ? »',
    characters: 'Mama Nzuzi (récolte, séchage) et Papa Mavungu (tri).',
    elementsToShow:
      'Quatre cases « bien géré » (récolter, trier, sécher, stocker) face à une scène « mal conservé » (pluie, produits moisis, insectes) ; comparaison bon prix / prix bas.',
  },
  {
    number: 9,
    slug: 'image-9-je-connais-mon-marche',
    title: 'Je connais mon marché',
    phaseCode: 'VENDRE',
    phaseLabel: 'VENDRE',
    phaseColor: '#A8442A',
    imageUrl: '/boite-a-images/image-9.png',
    mainMessage:
      '« Avant de vendre, je cherche à connaître mon marché. »',
    situation:
      'Un producteur échangeant avec un acheteur ou observant différents marchés et prix.',
    facilitatorMessages: [
      'Qui achète mon produit ?',
      'Où puis-je le vendre ?',
      'Quelle quantité est demandée ?',
      'Quelle qualité est recherchée ?',
      'Quel prix est proposé ?',
      'À quel moment est-il intéressant de vendre ?',
    ],
    questionToAsk:
      '« Comment connaissez-vous les besoins et les prix du marché ? »',
    characters:
      'Mama Nzuzi, productrice ; un acheteur (casquette bleue).',
    elementsToShow:
      'Trois étals avec étiquettes de prix, panier de maïs, six questions du marché sous forme de bulles.',
  },
  {
    number: 10,
    slug: 'image-10-je-m-organise-avec-d-autres-producteurs',
    title: 'Je m’organise avec d’autres producteurs',
    phaseCode: 'VENDRE',
    phaseLabel: 'VENDRE',
    phaseColor: '#A8442A',
    imageUrl: '/boite-a-images/image-10.png',
    mainMessage:
      '« En nous organisant, nous pouvons mieux produire et mieux commercialiser. »',
    situation:
      'Des producteurs réunis au sein d’une OP, regroupant leurs productions.',
    facilitatorMessages: [
      'Participer à une organisation de producteurs.',
      'Mutualiser certaines informations et certains moyens.',
      'Regrouper les productions lorsque cela est pertinent.',
      'Faciliter les relations avec les acheteurs.',
      'Renforcer la capacité de négociation.',
    ],
    questionToAsk:
      '« Quels avantages pouvez-vous tirer du fait de travailler ensemble ? »',
    characters:
      'Six membres de l’OP : hommes, femmes et jeunes.',
    elementsToShow:
      'Abri « Organisation paysanne », sacs et paniers regroupés en un seul tas, étiquettes (production regroupée, informations et moyens partagés, négociation renforcée), camion d’un acheteur au loin.',
  },
  {
    number: 11,
    slug: 'image-11-je-commercialise-ma-production',
    title: 'Je commercialise ma production',
    phaseCode: 'VENDRE',
    phaseLabel: 'VENDRE',
    phaseColor: '#A8442A',
    imageUrl: '/boite-a-images/image-11.png',
    mainMessage:
      '« Je cherche les meilleures opportunités pour vendre ma production. »',
    situation:
      'Des producteurs présentant des produits de qualité à un acheteur ou vendant collectivement leur production.',
    facilitatorMessages: [
      'Identifier les acheteurs.',
      'Préparer les produits selon les exigences du marché.',
      'Comparer les opportunités de vente.',
      'Négocier dans de bonnes conditions.',
      'Respecter les engagements pris avec les acheteurs.',
    ],
    questionToAsk:
      '« Que faut-il préparer avant de négocier avec un acheteur ? »',
    characters:
      'Papa Mavungu, Kiese et Mama Nzuzi, face à l’acheteur.',
    elementsToShow:
      'Sacs triés « produits de qualité », poignée de main entre productrice et acheteur, papier « engagement », camion de collecte.',
  },
  {
    number: 12,
    slug: 'image-12-je-gere-mes-revenus-et-je-reinvestis',
    title: 'Je gère mes revenus et je réinvestis',
    phaseCode: 'REINVESTIR',
    phaseLabel: 'RÉINVESTIR',
    phaseColor: '#4A3E85',
    imageUrl: '/boite-a-images/image-12.png',
    mainMessage:
      '« Je gère mes revenus pour faire grandir mon activité. »',
    situation:
      'Un producteur répartissant son revenu après la vente entre les besoins du ménage, l’épargne et le réinvestissement dans son activité.',
    facilitatorMessages: [
      'Couvrir les besoins prioritaires du ménage',
      'Épargner une partie du revenu',
      'Rembourser les engagements éventuels',
      'Réinvestir dans la prochaine saison',
      'Améliorer progressivement son champ.',
    ],
    questionToAsk:
      '« Après avoir vendu votre production, que faites-vous de l’argent gagné ? »',
    characters: 'Papa Mavungu, qui répartit son revenu.',
    elementsToShow:
      'Billets et pièces, cinq cartes (ménage, tirelire d’épargne, remboursement, semences pour la saison suivante, champ), rangée de plants qui grandissent de gauche à droite.',
  },
];

interface ImageContributionNote {
  status: string;
  situation: string;
  mainMessage: string;
  secondaryMessages: string;
  technicalPractice: string;
  question: string;
  practicalTip: string;
}

type ToolboxSubView = 'PARCOURS' | 'CADRE' | 'GRILLE';

export const ToolboxWorkspace: React.FC = () => {
  const [selectedSlug, setSelectedSlug] = useAtom(selectedToolboxArticleSlugAtom);
  const setMainSection = useSetAtom(activeMainSectionAtom);

  const [subView, setSubView] = useState<ToolboxSubView>('PARCOURS');
  const [phaseFilter, setPhaseFilter] = useState<BoitePhaseCode>('ALL');
  const [contributions, setContributions] = useState<Record<number, ImageContributionNote>>(() => {
    try {
      const raw = localStorage.getItem('avenir_boite_images_contributions_v1');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [globalObs, setGlobalObs] = useState<string>(() => {
    try {
      return localStorage.getItem('avenir_boite_images_global_obs_v1') || '';
    } catch {
      return '';
    }
  });
  const [copiedMsg, setCopiedMsg] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('avenir_boite_images_contributions_v1', JSON.stringify(contributions));
    } catch {}
  }, [contributions]);

  useEffect(() => {
    try {
      localStorage.setItem('avenir_boite_images_global_obs_v1', globalObs);
    } catch {}
  }, [globalObs]);

  // Match either direct slug, short image-N slug, or legacy 4-card slugs from Home page
  const resolveImageFromSlug = (slug: string | null): BoiteImageItem | null => {
    if (!slug) return null;
    const direct = BOITE_A_IMAGES_DATA.find(
      (item) => item.slug === slug || `image-${item.number}` === slug
    );
    if (direct) return direct;
    if (slug === 'planification-investissement-epargne') return BOITE_A_IMAGES_DATA[0];
    if (slug === 'calcul-cout-revient-seuil-rentabilite') return BOITE_A_IMAGES_DATA[5];
    if (slug === 'commercialisation-negociation-collective') return BOITE_A_IMAGES_DATA[10];
    if (slug === 'gestion-risques-scenarios-agricoles') return BOITE_A_IMAGES_DATA[11];
    return null;
  };

  const activeItem = resolveImageFromSlug(selectedSlug);

  const updateContrib = (imgNum: number, patch: Partial<ImageContributionNote>) => {
    const existing = contributions[imgNum] || {
      status: 'Conserver',
      situation: '',
      mainMessage: '',
      secondaryMessages: '',
      technicalPractice: '',
      question: '',
      practicalTip: '',
    };
    setContributions({
      ...contributions,
      [imgNum]: { ...existing, ...patch },
    });
  };

  const handleCopyContributions = () => {
    const lines: string[] = [
      'PROJET AVENIR (KWILU & KWANGO) — CONTRIBUTIONS BOÎTE À IMAGES',
      '==============================================================',
    ];
    if (globalObs.trim()) {
      lines.push(`\nObservations générales :\n${globalObs.trim()}\n`);
    }
    BOITE_A_IMAGES_DATA.forEach((img) => {
      const c = contributions[img.number];
      if (
        c &&
        (c.situation ||
          c.mainMessage ||
          c.secondaryMessages ||
          c.technicalPractice ||
          c.question ||
          c.practicalTip)
      ) {
        lines.push(`\n--- Image ${img.number} : ${img.title} (${c.status}) ---`);
        if (c.situation) lines.push(`Situation : ${c.situation}`);
        if (c.mainMessage) lines.push(`Message principal : ${c.mainMessage}`);
        if (c.secondaryMessages) lines.push(`Messages complémentaires : ${c.secondaryMessages}`);
        if (c.technicalPractice) lines.push(`Notion technique : ${c.technicalPractice}`);
        if (c.question) lines.push(`Question : ${c.question}`);
        if (c.practicalTip) lines.push(`Conseil pratique : ${c.practicalTip}`);
      }
    });
    navigator.clipboard?.writeText(lines.join('\n'));
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 3000);
  };

  // ==========================================================================
  // VIEW 1: DETAILED FICHE-IMAGE (Matches Pages 7 to 30 of the PDF)
  // ==========================================================================
  if (activeItem) {
    const prevItem =
      activeItem.number > 1
        ? BOITE_A_IMAGES_DATA.find((x) => x.number === activeItem.number - 1) || null
        : null;
    const nextItem =
      activeItem.number < 12
        ? BOITE_A_IMAGES_DATA.find((x) => x.number === activeItem.number + 1) || null
        : BOITE_A_IMAGES_DATA[0];

    const currentContrib = contributions[activeItem.number] || {
      status: 'Conserver',
      situation: '',
      mainMessage: '',
      secondaryMessages: '',
      technicalPractice: '',
      question: '',
      practicalTip: '',
    };

    const onlyOnePaging = Boolean((prevItem && !nextItem) || (!prevItem && nextItem));

    const renderDetailNavigation = (isBottom = false) => (
      <div className="avenir-toolbox-nav">
        <div className="avenir-toolbox-nav-left">
          <Button
            size="$3.5"
            height={40}
            borderRadius={999}
            paddingHorizontal="$4"
            backgroundColor="#FFFFFF"
            borderWidth={1.5}
            borderColor="#1F6338"
            onPress={() => {
              if (window.history.length > 1 && window.history.state?.slug) {
                window.history.back();
              } else {
                setSelectedSlug(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <XStack alignItems="center" gap="$2">
              <ArrowLeft size={15} color="#1F6338" />
              <Text fontSize={13} fontWeight="700" color="#1F6338">
                {isBottom ? 'Retour aux 12 images' : 'Parcours des 12 images'}
              </Text>
            </XStack>
          </Button>
        </div>

        <div className="avenir-toolbox-nav-right">
          {prevItem && (
            <Button
              size="$3.5"
              height={40}
              borderRadius={999}
              paddingHorizontal="$3.5"
              backgroundColor="#FFFFFF"
              borderWidth={1}
              borderColor="#D5DDD5"
              className={onlyOnePaging ? 'avenir-toolbox-paging-single' : 'avenir-toolbox-paging-btn'}
              onPress={() => {
                setSelectedSlug(prevItem.slug);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <XStack alignItems="center" gap="$1.5" justifyContent="center">
                <ArrowLeft size={14} color="#18241B" />
                <Text fontSize={12.5} fontWeight="700" color="#18241B">
                  Image {prevItem.number}
                </Text>
              </XStack>
            </Button>
          )}

          {nextItem && (
            <Button
              size="$3.5"
              height={40}
              borderRadius={999}
              paddingHorizontal="$4"
              backgroundColor="#1F6338"
              className={onlyOnePaging ? 'avenir-toolbox-paging-single' : 'avenir-toolbox-paging-btn'}
              onPress={() => {
                setSelectedSlug(nextItem.slug);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <XStack alignItems="center" gap="$1.5" justifyContent="center">
                <Text fontSize={12.5} fontWeight="700" color="#FFFFFF">
                  {activeItem.number === 12 ? (
                    <>
                      <span className="avenir-toolbox-next-full">Saison suivante · Image 1</span>
                      <span className="avenir-toolbox-next-short">Saison suivante</span>
                    </>
                  ) : (
                    <>
                      <span className="avenir-toolbox-next-full">{`Image ${nextItem.number} : ${nextItem.title}`}</span>
                      <span className="avenir-toolbox-next-short">{`Image ${nextItem.number}`}</span>
                    </>
                  )}
                </Text>
                <ArrowRight size={14} color="#FFFFFF" />
              </XStack>
            </Button>
          )}

          <Button
            size="$3.5"
            height={40}
            borderRadius={999}
            paddingHorizontal="$4"
            backgroundColor="#F2B632"
            className="avenir-toolbox-sim-btn"
            onPress={() => {
              setMainSection('SIMULATOR');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <XStack alignItems="center" gap="$1.5" justifyContent="center">
              <Calculator size={14} color="#18241B" />
              <Text fontSize={12.5} fontWeight="700" color="#18241B">
                Ouvrir le simulateur
              </Text>
            </XStack>
          </Button>
        </div>
      </div>
    );

    return (
      <YStack gap="$5" paddingBottom="$9">
        {/* Top Navigation Bar */}
        {renderDetailNavigation(false)}

        {/* Main Fiche-Image Sheet (Exact PDF Layout) */}
        <YStack
          backgroundColor="#FFFFFF"
          borderRadius={16}
          padding="clamp(16px, 4vw, 24px)"
          borderWidth={1}
          borderColor="#E2E0D8"
          gap="$5"
          style={{ boxShadow: '0 6px 24px rgba(24, 36, 27, 0.05)', maxWidth: '100%', boxSizing: 'border-box' }}
        >
          {/* Header: Number Box + Title + Phase Pill */}
          <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
            <XStack alignItems="center" gap="$3" flex={1} minWidth="min(100%, 250px)">
              <YStack
                width={48}
                height={48}
                flexShrink={0}
                backgroundColor="#1F6338"
                borderRadius={12}
                borderWidth={2}
                borderColor="#F2B632"
                alignItems="center"
                justifyContent="center"
                style={{ boxShadow: '0 6px 16px rgba(31, 99, 56, 0.2)' }}
              >
                <Text fontSize={22} fontWeight="900" color="#FFFFFF">
                  {activeItem.number}
                </Text>
              </YStack>
              <Text
                fontSize="clamp(20px, 4.5vw, 28px)"
                fontWeight="800"
                color="#122017"
                lineHeight="clamp(26px, 5.5vw, 34px)"
                flex={1}
              >
                {activeItem.title}
              </Text>
            </XStack>

            <YStack
              backgroundColor={activeItem.phaseColor}
              paddingHorizontal="$3.5"
              paddingVertical={6}
              borderRadius={999}
              flexShrink={0}
            >
              <Text fontSize={11.5} fontWeight="800" color="#FFFFFF" letterSpacing={0.6}>
                {activeItem.phaseLabel}
              </Text>
            </YStack>
          </XStack>

          {/* Exact Comic Panel Illustration from the PDF */}
          <YStack
            width="100%"
            borderRadius={12}
            overflow="hidden"
            backgroundColor="#EBF2EA"
            borderWidth={1}
            borderColor="#DCE5DC"
          >
            <img
              src={activeItem.imageUrl}
              alt={`Image ${activeItem.number} - ${activeItem.title}`}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </YStack>

          {/* MESSAGE PRINCIPAL (Warm Amber Banner aligned with website palette) */}
          <YStack gap="$2">
            <Text
              fontSize={12}
              fontWeight="800"
              color="#1F6338"
              letterSpacing={0.8}
              textTransform="uppercase"
            >
              MESSAGE PRINCIPAL
            </Text>
            <YStack
              backgroundColor="#FFF8E6"
              borderWidth={1.5}
              borderColor="#F2B632"
              borderLeftWidth={5}
              borderLeftColor="#F2B632"
              borderRadius={12}
              padding="$4"
              style={{ boxShadow: '0 6px 20px rgba(242, 182, 50, 0.12)' }}
            >
              <Text fontSize={18} fontWeight="800" color="#122017" lineHeight={26}>
                {activeItem.mainMessage}
              </Text>
            </YStack>
          </YStack>

          {/* 2 Columns: SITUATION À ILLUSTRER & MESSAGES CLÉS POUR L'ANIMATEUR */}
          <XStack gap="$6" flexWrap="wrap">
            <YStack flex={1} minWidth={260} gap="$2">
              <Text
                fontSize={12}
                fontWeight="800"
                color="#5F685F"
                letterSpacing={0.8}
                textTransform="uppercase"
              >
                SITUATION À ILLUSTRER
              </Text>
              <Text fontSize={14.5} color="#18241B" lineHeight={23}>
                {activeItem.situation}
              </Text>
            </YStack>

            <YStack flex={1.2} minWidth={280} gap="$2">
              <Text
                fontSize={12}
                fontWeight="800"
                color="#5F685F"
                letterSpacing={0.8}
                textTransform="uppercase"
              >
                MESSAGES CLÉS POUR L’ANIMATEUR
              </Text>
              <YStack gap="$1.5">
                {activeItem.facilitatorMessages.map((msg, idx) => (
                  <XStack key={idx} alignItems="flex-start" gap="$2">
                    <Text fontSize={15} fontWeight="900" color="#1F6338">
                      •
                    </Text>
                    <Text fontSize={14.5} color="#18241B" lineHeight={22} flex={1}>
                      {msg}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          </XStack>

          {/* QUESTION À POSER */}
          <YStack gap="$2">
            <Text
              fontSize={12}
              fontWeight="800"
              color="#5F685F"
              letterSpacing={0.8}
              textTransform="uppercase"
            >
              QUESTION À POSER AUX PRODUCTEURS
            </Text>
            <YStack
              borderLeftWidth={4}
              borderLeftColor="#1F6338"
              paddingLeft="$4"
              paddingVertical="$1"
            >
              <Text fontSize={17} fontWeight="800" color="#18241B" lineHeight={25}>
                {activeItem.questionToAsk}
              </Text>
            </YStack>
          </YStack>

          {/* Dashed Technical Sheet (Personnages & Éléments à faire apparaître) */}
          <YStack
            backgroundColor="#FAF8F3"
            borderRadius={10}
            padding="$4"
            borderWidth={1.5}
            borderColor="#C9CEC9"
            borderStyle="dashed"
            gap="$2.5"
          >
            <XStack gap="$3" flexWrap="wrap">
              <Text fontSize={11.5} fontWeight="800" color="#5F685F" width={140}>
                NUMÉRO
              </Text>
              <Text fontSize={13.5} color="#18241B" flex={1}>
                Image {activeItem.number} sur 12
              </Text>
            </XStack>
            <XStack gap="$3" flexWrap="wrap">
              <Text fontSize={11.5} fontWeight="800" color="#5F685F" width={140}>
                PERSONNAGES
              </Text>
              <Text fontSize={13.5} color="#18241B" flex={1}>
                {activeItem.characters}
              </Text>
            </XStack>
            <XStack gap="$3" flexWrap="wrap">
              <Text fontSize={11.5} fontWeight="800" color="#5F685F" width={140}>
                À FAIRE APPARAÎTRE
              </Text>
              <Text fontSize={13.5} color="#18241B" flex={1} lineHeight={20}>
                {activeItem.elementsToShow}
              </Text>
            </XStack>
          </YStack>

          {/* Interactive Team Contribution Form for this Image */}
          <YStack
            backgroundColor="#FFFFFF"
            borderRadius={14}
            padding="$5"
            borderWidth={1.5}
            borderColor="#DCE5DC"
            gap="$4"
            style={{ boxShadow: '0 8px 24px rgba(14, 42, 22, 0.05)' }}
          >
            <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$2">
              <Text fontSize={16} fontWeight="800" color="#122017">
                Grille de travail : mes contributions pour l’image {activeItem.number}
              </Text>
              <XStack gap="$2">
                {(['Conserver', 'Modifier', 'Supprimer'] as const).map((st) => {
                  const active = currentContrib.status === st;
                  return (
                    <Button
                      key={st}
                      size="$2.5"
                      height={30}
                      paddingHorizontal="$3"
                      borderRadius={6}
                      backgroundColor={active ? '#1F6338' : '#EBF2EA'}
                      onPress={() => updateContrib(activeItem.number, { status: st })}
                    >
                      <Text
                        fontSize={12}
                        fontWeight="700"
                        color={active ? '#FFFFFF' : '#1F6338'}
                      >
                        {st}
                      </Text>
                    </Button>
                  );
                })}
              </XStack>
            </XStack>

            <XStack gap="$4" flexWrap="wrap">
              <YStack flex={1} minWidth={250} gap="$1.5">
                <Text fontSize={12.5} fontWeight="700" color="#122017">
                  Situation à représenter / adapter
                </Text>
                <Input
                  value={currentContrib.situation}
                  onChangeText={(v) => updateContrib(activeItem.number, { situation: v })}
                  placeholder="Vos propositions sur la scène..."
                  backgroundColor="#FAF8F3"
                  borderColor="#D5DDD5"
                />
              </YStack>

              <YStack flex={1} minWidth={250} gap="$1.5">
                <Text fontSize={12.5} fontWeight="700" color="#122017">
                  Message principal ou complémentaire
                </Text>
                <Input
                  value={currentContrib.mainMessage}
                  onChangeText={(v) => updateContrib(activeItem.number, { mainMessage: v })}
                  placeholder="Message clé à enrichir..."
                  backgroundColor="#FAF8F3"
                  borderColor="#D5DDD5"
                />
              </YStack>
            </XStack>

            <XStack gap="$4" flexWrap="wrap">
              <YStack flex={1} minWidth={250} gap="$1.5">
                <Text fontSize={12.5} fontWeight="700" color="#122017">
                  Pratique ou notion technique à ajouter
                </Text>
                <Input
                  value={currentContrib.technicalPractice}
                  onChangeText={(v) =>
                    updateContrib(activeItem.number, { technicalPractice: v })
                  }
                  placeholder="Ex: variété locale, stockage..."
                  backgroundColor="#FAF8F3"
                  borderColor="#D5DDD5"
                />
              </YStack>

              <YStack flex={1} minWidth={250} gap="$1.5">
                <Text fontSize={12.5} fontWeight="700" color="#122017">
                  Conseil pratique à retenir
                </Text>
                <Input
                  value={currentContrib.practicalTip}
                  onChangeText={(v) => updateContrib(activeItem.number, { practicalTip: v })}
                  placeholder="Conseil terrain Kwilu / Kwango..."
                  backgroundColor="#FAF8F3"
                  borderColor="#D5DDD5"
                />
              </YStack>
            </XStack>
          </YStack>
        </YStack>

        {/* Bottom Navigation Bar */}
        {renderDetailNavigation(true)}
      </YStack>
    );
  }

  // ==========================================================================
  // VIEW 2: MAIN BOÎTE À IMAGES WORKSPACE (Parcours 12 images / Cadre / Grille)
  // ==========================================================================
  const filteredImages =
    phaseFilter === 'ALL'
      ? BOITE_A_IMAGES_DATA
      : BOITE_A_IMAGES_DATA.filter((item) => item.phaseCode === phaseFilter);

  return (
    <YStack gap="$6" paddingBottom="$9">
      {/* Header Banner (Aligned with Projet AVENIR Deep Forest Green & Golden Amber Palette) */}
      <div
        style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          backgroundColor: '#0E4523',
          boxShadow: '0 16px 38px rgba(14, 69, 35, 0.16)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/images/agri-4.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 55%',
            opacity: 0.2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(125deg, rgba(14, 69, 35, 0.96) 0%, rgba(22, 85, 45, 0.90) 60%, rgba(14, 69, 35, 0.94) 100%)',
          }}
        />

        <YStack
          padding="clamp(18px, 4vw, 24px)"
          gap="$3.5"
          style={{ position: 'relative', zIndex: 2 }}
        >
          <Text
            fontSize={12}
            fontWeight="800"
            color="#F2B632"
            letterSpacing={1.2}
            textTransform="uppercase"
          >
            PROJET AVENIR · KWILU ET KWANGO
          </Text>

          <Text
            fontSize="clamp(22px, 5vw, 36px)"
            fontWeight="800"
            color="#FFFFFF"
            lineHeight="clamp(28px, 6vw, 42px)"
          >
            Boîte à images sur l’entrepreneuriat agricole
          </Text>

          <Text
            fontSize="clamp(13px, 3.5vw, 15px)"
            color="#DCE7DF"
            lineHeight="clamp(19px, 4.5vw, 23px)"
            maxWidth={780}
          >
            Cahier de contenu illustré : les 12 images, scène par scène, comme une bande dessinée, avec les messages, les questions et la grille de contribution de l’équipe.
          </Text>

          {/* Sub-navigation Tabs */}
          <XStack gap="$2.5" flexWrap="wrap" paddingTop="$2">
            {[
              {
                id: 'PARCOURS' as const,
                label: 'Parcours des 12 images (Bande dessinée)',
                shortLabel: '12 images (BD)',
                icon: <Layers size={15} color={subView === 'PARCOURS' ? '#122017' : '#FFFFFF'} />,
              },
              {
                id: 'CADRE' as const,
                label: 'Cadre pédagogique & Objectifs',
                shortLabel: 'Cadre & Objectifs',
                icon: <BookOpen size={15} color={subView === 'CADRE' ? '#122017' : '#FFFFFF'} />,
              },
              {
                id: 'GRILLE' as const,
                label: 'Grille de travail & Contributions',
                shortLabel: 'Grille & Contributions',
                icon: <ClipboardList size={15} color={subView === 'GRILLE' ? '#122017' : '#FFFFFF'} />,
              },
            ].map((tab) => {
              const active = subView === tab.id;
              return (
                <Button
                  key={tab.id}
                  size="$3.5"
                  height={40}
                  borderRadius={999}
                  paddingHorizontal="$3.5"
                  backgroundColor={active ? '#F2B632' : 'rgba(255, 255, 255, 0.14)'}
                  borderWidth={1}
                  borderColor={active ? '#F2B632' : 'rgba(255, 255, 255, 0.24)'}
                  onPress={() => setSubView(tab.id)}
                >
                  <XStack alignItems="center" gap="$2">
                    {tab.icon}
                    <Text
                      fontSize={12.5}
                      fontWeight="700"
                      color={active ? '#122017' : '#FFFFFF'}
                    >
                      <span className="avenir-toolbox-tab-full">{tab.label}</span>
                      <span className="avenir-toolbox-tab-short">{tab.shortLabel}</span>
                    </Text>
                  </XStack>
                </Button>
              );
            })}
          </XStack>
        </YStack>
      </div>

      {/* ====================================================================
          SUBVIEW A: LE PARCOURS DES 12 IMAGES (Pages 5 & 6 of PDF)
      ==================================================================== */}
      {subView === 'PARCOURS' && (
        <YStack gap="$5">
          {/* Warm Amber & Sage Transversal Message Box */}
          <YStack
            backgroundColor="#FFF8E6"
            borderWidth={1.5}
            borderColor="#F2B632"
            borderLeftWidth={6}
            borderLeftColor="#1F6338"
            padding="$5"
            borderRadius={14}
            style={{ boxShadow: '0 10px 26px rgba(14, 69, 35, 0.06)' }}
            gap="$2"
          >
            <Text fontSize={12} fontWeight="800" color="#1F6338" textTransform="uppercase" letterSpacing={0.8}>
              MESSAGE TRANSVERSAL DU PARCOURS
            </Text>
            <Text fontSize={18} fontWeight="800" color="#122017" lineHeight={27}>
              Une activité agricole peut être gérée comme une entreprise : je planifie, j’investis, je produis, je suis mes dépenses et ma production, j’améliore la qualité, je cherche le marché, je vends et je réinvestis.
            </Text>
          </YStack>

          {/* Step-by-Step Cycle Chips */}
          <XStack gap="$2" flexWrap="wrap" alignItems="center">
            {[
              'Je planifie',
              'j’investis',
              'je produis',
              'je suis mes dépenses et ma production',
              'j’améliore la qualité',
              'je cherche le marché',
              'je vends',
              'je réinvestis',
            ].map((stepText, idx, arr) => (
              <React.Fragment key={stepText}>
                <YStack
                  backgroundColor="#E7F3E7"
                  borderWidth={1}
                  borderColor="#C6DEC6"
                  borderRadius={999}
                  paddingHorizontal="$3.5"
                  paddingVertical={6}
                >
                  <Text fontSize={13} fontWeight="700" color="#0E4523">
                    {stepText}
                  </Text>
                </YStack>
                {idx < arr.length - 1 && (
                  <Text fontSize={14} fontWeight="800" color="#F2B632">
                    →
                  </Text>
                )}
              </React.Fragment>
            ))}
          </XStack>

          {/* 5 Phase Filter Pills (Aligned with Website Forest Green & Sage) */}
          <XStack gap="$2.5" flexWrap="wrap">
            {[
              { code: 'ALL' as const, label: 'Toutes les 12 images', bg: '#0E4523' },
              { code: 'PLANIFIER' as const, label: 'Planifier · Images 1 à 4', bg: '#1F6338' },
              { code: 'PRODUIRE_SUIVRE' as const, label: 'Produire et suivre · Images 5 à 7', bg: '#8C6218' },
              { code: 'QUALITE' as const, label: 'Garder la qualité · Image 8', bg: '#1E6B6B' },
              { code: 'VENDRE' as const, label: 'Vendre · Images 9 à 11', bg: '#A8442A' },
              { code: 'REINVESTIR' as const, label: 'Réinvestir · Image 12', bg: '#4A3E85' },
            ].map((pill) => {
              const active = phaseFilter === pill.code;
              return (
                <Button
                  key={pill.code}
                  size="$3"
                  height={36}
                  borderRadius={999}
                  paddingHorizontal="$4"
                  backgroundColor={active ? pill.bg : '#FFFFFF'}
                  borderWidth={1.5}
                  borderColor={active ? pill.bg : '#DCE5DC'}
                  onPress={() => setPhaseFilter(pill.code)}
                >
                  <Text
                    fontSize={12.5}
                    fontWeight="700"
                    color={active ? '#FFFFFF' : '#1F6338'}
                  >
                    {pill.label}
                  </Text>
                </Button>
              );
            })}
          </XStack>

          {/* 3-Column Responsive CSS Grid of the 12 Comic Panels (Exact Image 2 Card Design, Balanced & Borderless) */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '12px',
              paddingBottom: '12px',
              overflow: 'hidden',
            }}
          >
            {/* Lush Green Field Panorama Strip across the middle-back with Rich Forest Green Overlay */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '190px',
                height: '190px',
                zIndex: 0,
                backgroundImage: 'url(/images/agri-4.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center 58%',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, #FAF8F3 0%, rgba(14, 69, 35, 0.72) 24%, rgba(14, 69, 35, 0.78) 76%, #FAF8F3 100%)',
                }}
              />
            </div>

            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
                gap: '24px',
                width: '100%',
                margin: '0 auto',
              }}
            >
              {filteredImages.map((item, idx) => {
                const skyGradients = [
                  'linear-gradient(180deg, #BBD9F6 0%, #CEE5F6 55%, #D5EBF2 100%)',
                  'linear-gradient(180deg, #A9D3F8 0%, #C6E2F6 55%, #D5EBF2 100%)',
                  'linear-gradient(180deg, #9ECAF3 0%, #C0DFF5 55%, #D5EBF2 100%)',
                ];
                const skyBg = skyGradients[idx % skyGradients.length];

                return (
                  <div
                    key={item.number}
                    onClick={() => {
                      setSelectedSlug(item.slug);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      borderRadius: '20px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: skyBg,
                      boxShadow: '0 14px 34px rgba(18, 36, 24, 0.12)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                  >
                    {/* Top Sky-Tinted Content Area (Compact height so card is wide & balanced) */}
                    <div
                      style={{
                        padding: '22px 24px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <GoldenWheatOrnament width={50} />

                      <span
                        style={{
                          marginTop: '8px',
                          fontSize: '11px',
                          fontWeight: 800,
                          color: item.phaseColor,
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px',
                        }}
                      >
                        Image {item.number} / 12 · {item.phaseLabel}
                      </span>

                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '20px',
                          fontWeight: 800,
                          color: '#0E1711',
                          lineHeight: '25px',
                          letterSpacing: '-0.3px',
                        }}
                      >
                        {item.title}
                      </div>

                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '13px',
                          color: '#465663',
                          lineHeight: '19px',
                          maxWidth: '295px',
                        }}
                      >
                        {item.mainMessage}
                      </div>

                      {/* Centered Action Link with Golden Underline Bar (Exact Image 2) */}
                      <div
                        style={{
                          marginTop: '12px',
                          display: 'inline-flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '12.5px',
                            fontWeight: 800,
                            color: '#121C15',
                            letterSpacing: '0.2px',
                          }}
                        >
                          Lire la fiche
                        </span>
                        <div
                          style={{
                            width: '68px',
                            height: '2.5px',
                            backgroundColor: '#F2B632',
                            marginTop: '4px',
                            borderRadius: '2px',
                          }}
                        />
                      </div>
                    </div>

                    {/* Bottom Borderless Scene seamlessly blending with #D5EBF2 sky */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '16 / 9.5',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={`/boite-a-images/card-${item.number}.png`}
                        alt={item.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center bottom',
                          display: 'block',
                        }}
                      />
                      {/* Soft top sky fade so the upper text area blends into the illustration */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '24px',
                          background:
                            'linear-gradient(180deg, #D5EBF2 0%, rgba(213, 235, 242, 0) 100%)',
                          pointerEvents: 'none',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </YStack>
      )}

      {/* ====================================================================
          SUBVIEW B: CADRE DE LA BOÎTE À IMAGES (Pages 1 to 4 of PDF)
      ==================================================================== */}
      {subView === 'CADRE' && (
        <YStack gap="$4">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
              gap: '20px',
              width: '100%',
            }}
          >
            {/* 1. Contexte */}
            <YStack
              backgroundColor="#FFFFFF"
              padding="$5"
              borderRadius={16}
              borderWidth={1.5}
              borderColor="#DCE5DC"
              gap="$3"
              style={{ boxShadow: '0 8px 24px rgba(14, 42, 22, 0.05)' }}
            >
              <Text fontSize={19} fontWeight="800" color="#0E4523">
                1. Contexte du Projet AVENIR
              </Text>
              <Text fontSize={13.5} color="#3B433C" lineHeight={21}>
                Dans le cadre de la mise en œuvre du Projet AVENIR dans le Kwilu et le Kwango, le projet prévoit d’accompagner au moins 8 000 ménages agricoles bénéficiaires par saison dans l’adoption de meilleures pratiques agricoles, l’organisation en réseaux de production et de commercialisation, le renforcement des OP et l’accès aux marchés.
              </Text>
              <Text fontSize={13.5} color="#3B433C" lineHeight={21}>
                Cette boîte à images sur l’entrepreneuriat agricole constitue un outil simple de sensibilisation et de vulgarisation auprès des producteurs et des ménages agricoles.
              </Text>
            </YStack>

            {/* 2. Objectif général & Public cible */}
            <YStack
              backgroundColor="#FFFFFF"
              padding="$5"
              borderRadius={16}
              borderWidth={1.5}
              borderColor="#DCE5DC"
              gap="$3"
              style={{ boxShadow: '0 8px 24px rgba(14, 42, 22, 0.05)' }}
            >
              <Text fontSize={19} fontWeight="800" color="#0E4523">
                2. Objectif général & Public cible
              </Text>
              <Text fontSize={13.5} color="#3B433C" lineHeight={21}>
                Sensibiliser les ménages agricoles à l’approche entrepreneuriale de l’agriculture et les accompagner dans l’amélioration de la gestion de leurs activités agricoles, depuis la planification jusqu’à la commercialisation.
              </Text>
              <YStack backgroundColor="#EBF2EA" padding="$3.5" borderRadius={10} gap="$1.5">
                <Text fontSize={12.5} fontWeight="800" color="#1F6338">
                  Public cible :
                </Text>
                <Text fontSize={13} color="#122017" lineHeight={19}>
                  • Ménages agricoles bénéficiaires du Projet AVENIR{'\n'}
                  • Petits producteurs accompagnés à travers les Organisations Paysannes (OP){'\n'}
                  • Animateurs, agents de terrain et responsables d’OP.
                </Text>
              </YStack>
            </YStack>

            {/* 3. Principe pédagogique */}
            <YStack
              backgroundColor="#FFFFFF"
              padding="$5"
              borderRadius={16}
              borderWidth={1.5}
              borderColor="#DCE5DC"
              gap="$3"
              style={{ boxShadow: '0 8px 24px rgba(14, 42, 22, 0.05)' }}
            >
              <Text fontSize={19} fontWeight="800" color="#0E4523">
                3. Principe pédagogique
              </Text>
              <Text fontSize={13.5} color="#3B433C" lineHeight={21}>
                Chaque image utilise des illustrations simples, réalistes et proches du quotidien des producteurs du Kwilu et du Kwango (parcelle, famille, OP, semences, récolte, stockage, marchés, dépenses et revenus).
              </Text>
              <Text fontSize={13.5} color="#1F6338" fontWeight="700" lineHeight={21}>
                L’image est ce qui se dessine ; la fiche est ce que l’animateur explique et discute avec les producteurs.
              </Text>
            </YStack>

            {/* 4. Résultat attendu */}
            <YStack
              backgroundColor="#FFFFFF"
              padding="$5"
              borderRadius={16}
              borderWidth={1.5}
              borderColor="#DCE5DC"
              gap="$3"
              style={{ boxShadow: '0 8px 24px rgba(14, 42, 22, 0.05)' }}
            >
              <Text fontSize={19} fontWeight="800" color="#0E4523">
                4. Résultat attendu
              </Text>
              <Text fontSize={13.5} color="#3B433C" lineHeight={21}>
                À partir des 12 images et des questions, les producteurs parlent de leurs propres pratiques, de leurs choix, des difficultés qu’ils rencontrent et des possibilités d’améliorer leur activité.
              </Text>
              <YStack
                backgroundColor="#FFF8E6"
                borderWidth={1}
                borderColor="#F2B632"
                padding="$3.5"
                borderRadius={10}
              >
                <Text fontSize={14} fontWeight="800" color="#122017">
                  Objectif final : faire de leur activité agricole un vrai business rentable.
                </Text>
              </YStack>
            </YStack>
          </div>
        </YStack>
      )}

      {/* ====================================================================
          SUBVIEW C: GRILLE DE TRAVAIL & CONTRIBUTIONS (Pages 31 to 34 of PDF)
      ==================================================================== */}
      {subView === 'GRILLE' && (
        <YStack
          backgroundColor="#FFFFFF"
          borderRadius={18}
          padding="$6"
          borderWidth={1.5}
          borderColor="#DCE5DC"
          gap="$5"
          style={{ boxShadow: '0 10px 28px rgba(14, 42, 22, 0.06)' }}
        >
          <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
            <YStack gap="$1" flex={1} minWidth={260}>
              <Text fontSize={22} fontWeight="800" color="#0E4523">
                Grille de travail · Contributions pour la boîte à images
              </Text>
              <Text fontSize={13.5} color="#5F685F">
                Ce que vous écrivez ici reste enregistré dans votre navigateur. Cliquez sur « Copier mes contributions » pour les partager avec l’équipe Rikolto.
              </Text>
            </YStack>

            <Button
              size="$4"
              height={42}
              borderRadius={999}
              paddingHorizontal="$4.5"
              backgroundColor="#1F6338"
              onPress={handleCopyContributions}
            >
              <XStack alignItems="center" gap="$2">
                {copiedMsg ? (
                  <Check size={16} color="#FFFFFF" />
                ) : (
                  <Copy size={16} color="#FFFFFF" />
                )}
                <Text fontSize={13.5} fontWeight="700" color="#FFFFFF">
                  {copiedMsg ? 'Contributions copiées !' : 'Copier mes contributions'}
                </Text>
              </XStack>
            </Button>
          </XStack>

          <YStack gap="$2">
            <Text fontSize={14} fontWeight="800" color="#122017">
              Observations générales / Adaptation aux réalités du Kwilu et du Kwango
            </Text>
            <Input
              value={globalObs}
              onChangeText={setGlobalObs}
              placeholder="Spéculations prioritaires, pratiques locales, rôle des femmes et des jeunes, fonctionnement des OP..."
              backgroundColor="#FAF8F3"
              borderColor="#D5DDD5"
            />
          </YStack>

          <YStack gap="$2.5">
            <Text fontSize={14} fontWeight="800" color="#122017">
              Accès direct aux fiches de contribution image par image (1 à 12)
            </Text>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '12px',
              }}
            >
              {BOITE_A_IMAGES_DATA.map((img) => {
                const c = contributions[img.number];
                const hasNotes = Boolean(
                  c &&
                    (c.situation ||
                      c.mainMessage ||
                      c.technicalPractice ||
                      c.practicalTip)
                );
                return (
                  <YStack
                    key={img.number}
                    padding="$3.5"
                    borderRadius={12}
                    borderWidth={1.5}
                    borderColor={hasNotes ? '#1F6338' : '#DCE5DC'}
                    backgroundColor={hasNotes ? '#E7F3E7' : '#FAF8F3'}
                    cursor="pointer"
                    onPress={() => {
                      setSelectedSlug(img.slug);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    gap="$1"
                  >
                    <Text fontSize={13.5} fontWeight="800" color="#122017">
                      <span style={{ color: '#1F6338', marginRight: 6 }}>{img.number}</span>
                      {img.title}
                    </Text>
                    <Text fontSize={11.5} color="#5F685F">
                      {hasNotes ? 'Contribution renseignée' : 'Cliquer pour annoter cette image →'}
                    </Text>
                  </YStack>
                );
              })}
            </div>
          </YStack>
        </YStack>
      )}
    </YStack>
  );
};
