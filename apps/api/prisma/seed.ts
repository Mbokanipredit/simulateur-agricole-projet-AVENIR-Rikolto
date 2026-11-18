import { PrismaClient } from '@prisma/client';
import { calculateEconomicResults, SimulationInput } from '@avenir/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Projet AVENIR database (Kwilu & Kwango - Rikolto RDC)...');

  // 1. Crop Templates for Kwilu & Kwango
  const crops = [
    {
      code: 'CAFE_ROBUSTA',
      nameFr: 'Café Robusta (Campagne annuelle en production)',
      localName: 'Kawa / Café',
      category: 'PERENNIAL',
      icon: '☕',
      descriptionFr:
        'Exploitation d’une caféière en production (1 ha) dans le Kwilu/Kwango avec bonnes pratiques agricoles et séchage sur claies.',
      cycleDurationMonths: 12,
      recommendedProvince: 'Kwilu & Kwango',
      defaultSurfaceArea: 1,
      defaultSurfaceUnit: 'HA',
      defaultYieldPerHa: 1200,
      defaultCommercialQty: 1150,
      productionUnit: 'KG',
      unitWeightKg: 1,
      defaultSalePriceUsd: 1.85,
      nutritionTipFr:
        'Associez des arbres fruitiers ou légumineuses en bordure de caféière pour diversifier l’alimentation familiale et protéger les sols.',
      agronomicTipFr:
        'La taille de régénération, l’égourmandage et le séchage sur claies surélevées augmentent le grade marchand et le prix au kilo de 25 à 35%.',
      expenses: [
        { stage: 'LAND_PREP', label: 'Entretien des pistes & piquetage complémentaire', unit: 'Forfait/ha', quantity: 1, unitCostUsd: 65, costType: 'FIXED', sortOrder: 1 },
        { stage: 'SEEDS', label: 'Plantules améliorées (remplacement des manquants)', unit: 'Plantules', quantity: 120, unitCostUsd: 0.5, costType: 'VARIABLE', sortOrder: 2 },
        { stage: 'PLANTING', label: 'Regarnissage & mise en place d’ombrage', unit: 'H/J', quantity: 15, unitCostUsd: 3.5, costType: 'VARIABLE', sortOrder: 3 },
        { stage: 'MAINTENANCE', label: 'Sarclage (3 passages) & taille d’entretien/égourmandage', unit: 'H/J', quantity: 55, unitCostUsd: 3.5, costType: 'VARIABLE', sortOrder: 4 },
        { stage: 'INPUTS', label: 'Compost organique, sacs jute, sécateurs & bâches', unit: 'Lot/ha', quantity: 1, unitCostUsd: 145, costType: 'VARIABLE', sortOrder: 5 },
        { stage: 'LABOR', label: 'Main-d’œuvre de surveillance et gestion parcelle', unit: 'H/J', quantity: 35, unitCostUsd: 3.5, costType: 'VARIABLE', sortOrder: 6 },
        { stage: 'HARVEST', label: 'Récolte sélective (cerises rouges), séchage sur claies & décorticage', unit: 'H/J', quantity: 60, unitCostUsd: 4.0, costType: 'VARIABLE', sortOrder: 7 },
        { stage: 'LOGISTICS', label: 'Transport vers coopérative/centre de collecte & manutention', unit: 'Sacs', quantity: 20, unitCostUsd: 6.5, costType: 'VARIABLE', sortOrder: 8 },
      ],
    },
    {
      code: 'CACAO',
      nameFr: 'Cacao (Cacaoyère villageoise durable)',
      localName: 'Cacao',
      category: 'PERENNIAL',
      icon: '🍫',
      descriptionFr:
        'Conduite d’un hectare de cacaoyers en agroforesterie avec fermentation contrôlée en caisses et séchage solaire.',
      cycleDurationMonths: 12,
      recommendedProvince: 'Kwilu & Kwango',
      defaultSurfaceArea: 1,
      defaultSurfaceUnit: 'HA',
      defaultYieldPerHa: 1000,
      defaultCommercialQty: 980,
      productionUnit: 'KG',
      unitWeightKg: 1,
      defaultSalePriceUsd: 2.6,
      nutritionTipFr:
        'L’agroforesterie cacaoyère avec bananiers plantains, avocatiers et safoutiers fournit des nutriments essentiels au ménage toute l’année.',
      agronomicTipFr:
        'Une fermentation de 6 jours avec brassage régulier et un séchage jusqu’à 7.5% d’humidité garantissent un cacao marchand sans moisissure.',
      expenses: [
        { stage: 'LAND_PREP', label: 'Nettoyage parcelle et drainage', unit: 'Forfait/ha', quantity: 1, unitCostUsd: 75, costType: 'FIXED', sortOrder: 1 },
        { stage: 'SEEDS', label: 'Plants greffés / hybrides tolérants (regarnissage)', unit: 'Plants', quantity: 100, unitCostUsd: 0.7, costType: 'VARIABLE', sortOrder: 2 },
        { stage: 'PLANTING', label: 'Plantation des cacaoyers et bananiers d’ombrage', unit: 'H/J', quantity: 18, unitCostUsd: 3.5, costType: 'VARIABLE', sortOrder: 3 },
        { stage: 'MAINTENANCE', label: 'Taille sanitaire, récolte cabosses malades & désherbage', unit: 'H/J', quantity: 65, unitCostUsd: 3.5, costType: 'VARIABLE', sortOrder: 4 },
        { stage: 'INPUTS', label: 'Biopesticides (Neem), compost, sacs de jute & matériel de taille', unit: 'Lot/ha', quantity: 1, unitCostUsd: 180, costType: 'VARIABLE', sortOrder: 5 },
        { stage: 'LABOR', label: 'Main-d’œuvre familiale et saisonnière d’appui', unit: 'H/J', quantity: 40, unitCostUsd: 3.5, costType: 'VARIABLE', sortOrder: 6 },
        { stage: 'HARVEST', label: 'Cueillette, écabossage, fermentation (6j) et séchage', unit: 'H/J', quantity: 70, unitCostUsd: 4.0, costType: 'VARIABLE', sortOrder: 7 },
        { stage: 'LOGISTICS', label: 'Conditionnement, stockage coopérative et transport marché', unit: 'Sacs', quantity: 16, unitCostUsd: 8.5, costType: 'VARIABLE', sortOrder: 8 },
      ],
    },
    {
      code: 'MANIOC',
      nameFr: 'Manioc amélioré (Cossettes / Chikwangue)',
      localName: 'Mpiodi / Songi / Manioc',
      category: 'FOOD_CROP',
      icon: '🥔',
      descriptionFr:
        'Culture de manioc à haut rendement résistant à la mosaïque, essentielle pour la sécurité alimentaire et le revenu des ménages.',
      cycleDurationMonths: 12,
      recommendedProvince: 'Kwilu & Kwango',
      defaultSurfaceArea: 1,
      defaultSurfaceUnit: 'HA',
      defaultYieldPerHa: 3200,
      defaultCommercialQty: 2600,
      productionUnit: 'KG',
      unitWeightKg: 1,
      defaultSalePriceUsd: 0.55,
      nutritionTipFr:
        'Les feuilles de manioc (Pondu/Saka-saka) sont riches en fer et vitamines A/C : associez-les à l’arachide ou au poisson pour l’équilibre nutritionnel.',
      agronomicTipFr:
        'Utilisez exclusivement des boutures saines de variétés améliorées (ex: Obama, Sans Souci) plantées à 1m x 1m (10 000 boutures/ha).',
      expenses: [
        { stage: 'LAND_PREP', label: 'Défrichage, labour et buttage / billonnage', unit: 'H/J', quantity: 40, unitCostUsd: 3.0, costType: 'FIXED', sortOrder: 1 },
        { stage: 'SEEDS', label: 'Boutures saines certifiées (variété résistante mosaïque)', unit: 'Bottes', quantity: 50, unitCostUsd: 2.5, costType: 'VARIABLE', sortOrder: 2 },
        { stage: 'PLANTING', label: 'Coupe des boutures et plantation sur billons', unit: 'H/J', quantity: 20, unitCostUsd: 3.0, costType: 'VARIABLE', sortOrder: 3 },
        { stage: 'MAINTENANCE', label: 'Sarclage (3 passages à 1, 3 et 6 mois)', unit: 'H/J', quantity: 45, unitCostUsd: 3.0, costType: 'VARIABLE', sortOrder: 4 },
        { stage: 'INPUTS', label: 'Houes, machettes, sacs de 100kg et bacs de rouissage', unit: 'Lot', quantity: 1, unitCostUsd: 85, costType: 'VARIABLE', sortOrder: 5 },
        { stage: 'LABOR', label: 'Main-d’œuvre familiale valorisée (suivi champ)', unit: 'H/J', quantity: 25, unitCostUsd: 3.0, costType: 'VARIABLE', sortOrder: 6 },
        { stage: 'HARVEST', label: 'Arrachage, épluchage, rouissage et séchage en cossettes', unit: 'H/J', quantity: 55, unitCostUsd: 3.2, costType: 'VARIABLE', sortOrder: 7 },
        { stage: 'LOGISTICS', label: 'Mise en sacs et transport vers Kikwit / Kenge / Kinshasa', unit: 'Sacs', quantity: 32, unitCostUsd: 5.5, costType: 'VARIABLE', sortOrder: 8 },
      ],
    },
    {
      code: 'MAIS_GRAIN',
      nameFr: 'Maïs grain (Cycle de 4 mois)',
      localName: 'Masangu / Maïs',
      category: 'FOOD_CROP',
      icon: '🌽',
      descriptionFr:
        'Culture de maïs à cycle court permettant une rotation rapide des revenus et l’approvisionnement des marchés locaux.',
      cycleDurationMonths: 4,
      recommendedProvince: 'Kwilu & Kwango',
      defaultSurfaceArea: 1,
      defaultSurfaceUnit: 'HA',
      defaultYieldPerHa: 2000,
      defaultCommercialQty: 1750,
      productionUnit: 'KG',
      unitWeightKg: 1,
      defaultSalePriceUsd: 0.65,
      nutritionTipFr:
        'Associez le maïs avec le niébé ou l’arachide sur la même parcelle : cela enrichit la bouillie des enfants en protéines végétales.',
      agronomicTipFr:
        'Le semis en lignes écartées de 75 cm x 25 cm (25 kg de semences/ha) facilite le sarclage et optimise l’ensoleillement.',
      expenses: [
        { stage: 'LAND_PREP', label: 'Défrichage et labour à plat', unit: 'H/J', quantity: 32, unitCostUsd: 3.0, costType: 'FIXED', sortOrder: 1 },
        { stage: 'SEEDS', label: 'Semences améliorées de maïs (25 kg/ha)', unit: 'Kg', quantity: 25, unitCostUsd: 2.2, costType: 'VARIABLE', sortOrder: 2 },
        { stage: 'PLANTING', label: 'Semis en ligne au cordeau', unit: 'H/J', quantity: 15, unitCostUsd: 3.0, costType: 'VARIABLE', sortOrder: 3 },
        { stage: 'MAINTENANCE', label: 'Deux sarclages + buttage et suivi chenille légionnaire', unit: 'H/J', quantity: 30, unitCostUsd: 3.0, costType: 'VARIABLE', sortOrder: 4 },
        { stage: 'INPUTS', label: 'Amendement organique, sacs PICS hermétiques & petit outillage', unit: 'Lot', quantity: 1, unitCostUsd: 110, costType: 'VARIABLE', sortOrder: 5 },
        { stage: 'LABOR', label: 'Gardiennage et main-d’œuvre d’appoint', unit: 'H/J', quantity: 18, unitCostUsd: 3.0, costType: 'VARIABLE', sortOrder: 6 },
        { stage: 'HARVEST', label: 'Récolte des épis, séchage, égrenage et vannage', unit: 'H/J', quantity: 30, unitCostUsd: 3.2, costType: 'VARIABLE', sortOrder: 7 },
        { stage: 'LOGISTICS', label: 'Conditionnement et transport au marché', unit: 'Sacs', quantity: 20, unitCostUsd: 4.5, costType: 'VARIABLE', sortOrder: 8 },
      ],
    },
    {
      code: 'ARACHIDE_NIEBE',
      nameFr: 'Arachide / Niébé (Légumineuse à haute valeur nutritive)',
      localName: 'Nguba / Nkasa (Légumineuses)',
      category: 'FOOD_CROP',
      icon: '🥜',
      descriptionFr:
        'Culture stratégique sensible à la nutrition et fixatrice d’azote, très prisée par les femmes entrepreneures et jeunes producteurs.',
      cycleDurationMonths: 4,
      recommendedProvince: 'Kwilu & Kwango',
      defaultSurfaceArea: 1,
      defaultSurfaceUnit: 'HA',
      defaultYieldPerHa: 1100,
      defaultCommercialQty: 950,
      productionUnit: 'KG',
      unitWeightKg: 1,
      defaultSalePriceUsd: 1.35,
      nutritionTipFr:
        'Riche en protéines, lipides et zinc : conserver 150 kg pour le ménage améliore directement la nutrition maternelle et infantile.',
      agronomicTipFr:
        'Fixe l’azote atmosphérique dans le sol : idéale en rotation avant le maïs ou en intercalaire dans les jeunes plantations de café/manioc.',
      expenses: [
        { stage: 'LAND_PREP', label: 'Préparation du lit de semence et ameublissement du sol', unit: 'H/J', quantity: 30, unitCostUsd: 3.0, costType: 'FIXED', sortOrder: 1 },
        { stage: 'SEEDS', label: 'Semences d’arachide/niébé triées à haut pouvoir germinatif', unit: 'Kg', quantity: 80, unitCostUsd: 1.8, costType: 'VARIABLE', sortOrder: 2 },
        { stage: 'PLANTING', label: 'Semis à bonne densité', unit: 'H/J', quantity: 18, unitCostUsd: 3.0, costType: 'VARIABLE', sortOrder: 3 },
        { stage: 'MAINTENANCE', label: 'Sarclages précoces et binage avant floraison', unit: 'H/J', quantity: 28, unitCostUsd: 3.0, costType: 'VARIABLE', sortOrder: 4 },
        { stage: 'INPUTS', label: 'Sacs de stockage sec, bâches de séchage et outils', unit: 'Lot', quantity: 1, unitCostUsd: 75, costType: 'VARIABLE', sortOrder: 5 },
        { stage: 'LABOR', label: 'Main-d’œuvre familiale et collective', unit: 'H/J', quantity: 20, unitCostUsd: 3.0, costType: 'VARIABLE', sortOrder: 6 },
        { stage: 'HARVEST', label: 'Arrachage, séchage au soleil, égoussage/décorticage et tri', unit: 'H/J', quantity: 38, unitCostUsd: 3.2, costType: 'VARIABLE', sortOrder: 7 },
        { stage: 'LOGISTICS', label: 'Transport et frais de marché local/urbain', unit: 'Sacs', quantity: 15, unitCostUsd: 5.0, costType: 'VARIABLE', sortOrder: 8 },
      ],
    },
  ];

  for (const crop of crops) {
    const { expenses, ...cropData } = crop;
    const savedCrop = await prisma.cropTemplate.upsert({
      where: { code: crop.code },
      update: cropData,
      create: cropData,
    });

    await prisma.cropExpenseTemplate.deleteMany({
      where: { cropTemplateId: savedCrop.id },
    });

    await prisma.cropExpenseTemplate.createMany({
      data: expenses.map((e) => ({
        ...e,
        cropTemplateId: savedCrop.id,
      })),
    });
  }

  // 2. Toolbox Categories & Articles (Composante 2 : Boîte à outils interactive)
  const categories = [
    {
      slug: 'planification-exploitation',
      titleFr: '1. Planification & Gestion de l’Exploitation',
      descriptionFr: 'Comment planifier sa campagne agricole, estimer ses besoins et organiser son calendrier cultural avant de dépenser.',
      icon: '📅',
      colorHex: '#1B5E20',
      sortOrder: 1,
    },
    {
      slug: 'couts-rentabilite',
      titleFr: '2. Calcul des Coûts, Marges & Seuil de Rentabilité',
      descriptionFr: 'Comprendre la différence entre chiffre d’affaires et bénéfice réel, calculer le coût de revient et fixer son prix.',
      icon: '🧮',
      colorHex: '#0D47A1',
      sortOrder: 2,
    },
    {
      slug: 'prise-decision-scenarios',
      titleFr: '3. Simulation & Prise de Décision (« Et si ? »)',
      descriptionFr: 'Anticiper les risques de baisse de prix ou d’aléas climatiques et dimensionner son exploitation selon un objectif de revenu.',
      icon: '🎯',
      colorHex: '#E65100',
      sortOrder: 3,
    },
    {
      slug: 'commercialisation-op',
      titleFr: '4. Commercialisation, Qualité & Vente Groupée (OP)',
      descriptionFr: 'Stratégies de stockage, négociation collective en Organisation Paysanne et réduction des coûts de transport.',
      icon: '🤝',
      colorHex: '#4A148C',
      sortOrder: 4,
    },
    {
      slug: 'nutrition-resilience',
      titleFr: '5. Entrepreneuriat Inclusif, Résilient & Sensible à la Nutrition',
      descriptionFr: 'Concilier revenus monétaires du ménage, autoconsommation nutritive et pratiques agroécologiques durables.',
      icon: '🥗',
      colorHex: '#00695C',
      sortOrder: 5,
    },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const saved = await prisma.toolboxCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap[cat.slug] = saved.id;
  }

  const articles = [
    {
      slug: 'planification-investissement-epargne',
      categoryId: categoryMap['planification-exploitation'],
      titleFr: 'Planifier sa campagne agricole en 5 étapes clés',
      subtitleFr: 'Ne démarrez jamais un champ sans connaître votre budget total jusqu’à la récolte.',
      readingTimeMinutes: 4,
      targetAudience: 'Producteurs, Jeunes Entrepreneurs & Animateurs',
      linkedSimulatorStage: 'LAND_PREP',
      summaryFr:
        'Beaucoup de producteurs investissent toute leur trésorerie dans le défrichage et les semences, puis manquent de moyens au moment critique du sarclage et de la récolte. Ce guide montre comment budgétiser les 8 étapes du cycle.',
      keyFormulaFr: 'Budget Total de Campagne = Coûts d’installation + Coûts d’entretien + Coûts de récolte & transport',
      contentSectionsJson: [
        {
          heading: 'Pourquoi planifier avant le premier coup de houe ?',
          body: 'Un champ mal entretenu faute d’argent au 3ème mois perd jusqu’à 50% de son rendement. Planifier, c’est vérifier que la superficie choisie correspond aux moyens financiers et à la main-d’œuvre réellement disponibles.',
          practicalExample: 'Exemple à Kikwit : Plutôt que de défricher 2 hectares de maïs sans budget pour le sarclage, cultiver 1 hectare bien entretenu coûte moins cher et produit davantage.',
          illustrationIcon: '🗺️',
        },
        {
          heading: 'Valoriser la main-d’œuvre familiale',
          body: 'Même lorsque les membres du ménage travaillent au champ sans salaire direct, ce temps a une valeur économique. L’inclure dans le simulateur permet de connaître la vraie rentabilité de votre activité.',
          practicalExample: '20 journées familiales x 3 USD/jour = 60 USD de travail investi par le ménage.',
          illustrationIcon: '👨‍👩‍👧‍👦',
        },
      ],
      checklistJson: [
        'Mesurer ou estimer précisément la superficie de la parcelle (en Hectares ou Ares).',
        'Vérifier la disponibilité de semences ou boutures saines avant la saison des pluies.',
        'Prévoir une réserve de trésorerie (25 à 30% du budget) pour la récolte et le transport.',
        'Noter chaque dépense dans un cahier de gestion ou dans le simulateur AVENIR.',
      ],
      facilitatorNoteFr:
        'Conseil Animateur Rikolto : Lors des séances avec les groupes paysans, demandez d’abord aux participants de citer les dépenses souvent oubliées (sacs vides, cordes, transport du champ au village, séchage). Montrez ensuite leur impact dans l’onglet « Dépenses » du simulateur.',
    },
    {
      slug: 'calcul-cout-revient-seuil-rentabilite',
      categoryId: categoryMap['couts-rentabilite'],
      titleFr: 'Calculer son Coût de Revient et son Seuil de Rentabilité',
      subtitleFr: 'À quel prix minimum vendre son kilo de café, cacao ou manioc pour ne jamais vendre à perte ?',
      readingTimeMinutes: 5,
      targetAudience: 'Producteurs & Comités de gestion OP',
      linkedSimulatorStage: 'RESULTS',
      summaryFr:
        'Confondre la recette totale (l’argent reçu le jour de la vente) et le bénéfice net est l’erreur la plus fréquente. Cette fiche explique comment calculer le coût d’un kilo ou d’un sac produit.',
      keyFormulaFr: 'Coût de Revient Unitaire = Coût Total des 8 étapes ÷ Quantité Totale Produite',
      contentSectionsJson: [
        {
          heading: '1. La différence entre Recette, Marge Brute et Bénéfice Net',
          body: 'La Recette est tout l’argent encaissé. Le Bénéfice Net est ce qu’il vous reste réellement après avoir remboursé toutes les dépenses de la campagne (du défrichage au transport).',
          practicalExample: 'Si vous vendez 1 000 kg de café à 1,85 USD (= 1 850 USD de recettes) et que vos dépenses totales sont de 950 USD, votre bénéfice net est de 900 USD (et non 1 850 USD).',
          illustrationIcon: '⚖️',
        },
        {
          heading: '2. Le Seuil de Rentabilité (Point Mort)',
          body: 'Le seuil de rentabilité vous indique deux repères vitaux : (a) combien de kilos/sacs vous devez vendre au minimum pour récupérer votre argent investi, et (b) le prix plancher en dessous duquel vous travaillez à perte.',
          practicalExample: 'Si produire 1 000 kg vous coûte 950 USD, votre coût de revient est de 0,95 USD/kg. Tout prix de vente supérieur à 0,95 USD/kg génère du bénéfice.',
          illustrationIcon: '🛡️',
        },
      ],
      checklistJson: [
        'Toujours calculer le coût de revient par kg ou par sac avant d’aller au marché.',
        'Ne jamais accepter un prix inférieur au prix seuil sans analyser d’autres options (stockage, vente groupée).',
        'Séparer la caisse de l’exploitation agricole des dépenses courantes imprévues.',
      ],
      facilitatorNoteFr:
        'Conseil Animateur Rikolto : Utilisez des billets factices ou des cailloux lors de l’atelier pour séparer visuellement le tas des dépenses (remboursement du capital) et le tas du bénéfice net.',
    },
    {
      slug: 'gestion-risques-scenarios-agricoles',
      categoryId: categoryMap['prise-decision-scenarios'],
      titleFr: 'Utiliser la Simulation Inversée et les Scénarios (« Et si ? »)',
      subtitleFr: 'Fixer un objectif de revenu (ex: 1 000 USD) et tester la résistance de son projet aux imprévus.',
      readingTimeMinutes: 5,
      targetAudience: 'Jeunes Entrepreneurs, OP & Producteurs',
      linkedSimulatorStage: 'DECISION',
      summaryFr:
        'Un bon entrepreneur agricole raisonne par objectif : combien veux-je gagner cette saison pour scolariser mes enfants, améliorer mon habitat ou agrandir mon activité ? Le simulateur calcule automatiquement la surface et l’investissement nécessaires.',
      keyFormulaFr: 'Quantité à vendre pour l’objectif = (Coûts + Bénéfice Cible) ÷ Prix de vente unitaire',
      contentSectionsJson: [
        {
          heading: 'Partir de son objectif financier (Simulation Inversée)',
          body: 'Au lieu de cultiver au hasard, fixez votre objectif de bénéfice net (par exemple 1 000 USD). L’outil calcule combien de kilos vous devez produire, quelle superficie travailler et quel budget mobiliser.',
          practicalExample: 'Pour gagner 1 000 USD de bénéfice net en café ou cacao, le simulateur ajuste instantanément le nombre d’hectares et le besoin en main-d’œuvre.',
          illustrationIcon: '🎯',
        },
        {
          heading: 'Tester le scénario pessimiste avant de s’engager',
          body: 'En agriculture, les prix fluctuent selon l’abondance sur le marché et l’état des routes au Kwilu et au Kwango. Testez toujours : « Que se passe-t-il si le prix baisse de 15% ou si le transport augmente de 20% ? »',
          practicalExample: 'Si votre projet reste bénéficiaire même avec -15% sur le prix de vente, votre activité est résiliente.',
          illustrationIcon: '📉',
        },
      ],
      checklistJson: [
        'Définir un objectif de revenu précis avec son ménage avant le début de saison.',
        'Comparer au moins 2 scénarios (Scénario réaliste vs Scénario prix bas).',
        'Adapter la superficie cultivée au capital réellement mobilisable.',
      ],
      facilitatorNoteFr:
        'Conseil Animateur Rikolto : Ouvrez l’onglet « Objectif & Scénarios » avec le producteur, entrez son objectif de revenu (ex: 500 USD ou 1 000 USD) et discutez ensemble de la faisabilité en surface et en main-d’œuvre.',
    },
    {
      slug: 'commercialisation-negociation-collective',
      categoryId: categoryMap['commercialisation-op'],
      titleFr: 'Mieux vendre : Qualité post-récolte, Stockage et Vente Groupée en OP',
      subtitleFr: 'Comment augmenter son prix de vente et réduire le coût de transport par sac.',
      readingTimeMinutes: 4,
      targetAudience: 'Organisations Paysannes (OP) & Producteurs',
      linkedSimulatorStage: 'LOGISTICS',
      summaryFr:
        'Vendre individuellement bord-champ au moment du pic de récolte expose le producteur aux prix les plus bas. Le groupage via l’Organisation Paysanne (OP) et un bon séchage transforment la rentabilité.',
      keyFormulaFr: 'Gain de Vente Groupée = (Hausse du prix unitaire × Volume) + Économie sur le transport par sac',
      contentSectionsJson: [
        {
          heading: 'Réduire les coûts de transport grâce au groupage',
          body: 'Louer un camion à plusieurs membres d’une OP coûte beaucoup moins cher par sac que le transport individuel par moto ou vélo sur de longues distances.',
          practicalExample: 'Passer de 8 USD/sac à 5 USD/sac sur 20 sacs économise immédiatement 60 USD de bénéfice net.',
          illustrationIcon: '🚚',
        },
        {
          heading: 'La prime à la qualité (Café, Cacao, Maïs, Manioc)',
          body: 'Un café cerise rouge séché sur claie ou un cacao bien fermenté se vend 20 à 35% plus cher qu’un produit tout-venant humide.',
          practicalExample: 'Sur 1 000 kg de cacao, +0,30 USD/kg de prime qualité = +300 USD de bénéfice pur.',
          illustrationIcon: '⭐',
        },
      ],
      checklistJson: [
        'Respecter les normes de séchage et de triage avant la mise en sac.',
        'Regrouper les volumes au centre de collecte de l’OP pour négocier avec les acheteurs.',
        'Éviter les ventes précipitées (« vente sur pied ») à fort taux d’usure.',
      ],
      facilitatorNoteFr:
        'Conseil Animateur Rikolto : Faites varier le curseur du Prix de vente (+15%) et du Transport (-20%) dans le simulateur pour montrer concrètement aux membres d’une OP l’avantage financier de l’action collective.',
    },
    {
      slug: 'agriculture-sensible-nutrition-budget-menage',
      categoryId: categoryMap['nutrition-resilience'],
      titleFr: 'Entrepreneuriat Agricole Sensible à la Nutrition et Résilient',
      subtitleFr: 'Réussir financièrement tout en garantissant une alimentation saine et diversifiée à sa famille.',
      readingTimeMinutes: 4,
      targetAudience: 'Ménages Agricoles, Femmes & Jeunes',
      linkedSimulatorStage: 'REVENUE',
      summaryFr:
        'Un ménage agricole qui vend 100% de sa récolte et doit racheter de la nourriture plus cher en période de soudure s’appauvrit. Le projet AVENIR promeut l’équilibre entre revenu commercial et sécurité nutritionnelle.',
      keyFormulaFr: 'Valeur Économique Totale = Recettes des ventes + Valeur de la part réservée à la nutrition du ménage',
      contentSectionsJson: [
        {
          heading: 'Préserver la part d’autoconsommation nutritive',
          body: 'Dans le simulateur AVENIR, vous pouvez distinguer la quantité produite totale et la quantité commercialisée. La différence représente la réserve alimentaire de votre famille, dont la valeur économique est intégrée au bilan.',
          practicalExample: 'Sur 1 100 kg d’arachide/niébé produits, conserver 150 kg pour la famille sécurise l’apport en protéines des enfants toute l’année.',
          illustrationIcon: '🍲',
        },
        {
          heading: 'Diversifier les cultures pour la résilience climatique',
          body: 'Associer cultures pérennes (café, cacao) et cultures vivrières/légumineuses (manioc, maïs, niébé, arachide) protège le ménage contre les chocs climatiques et étale les revenus sur toute l’année.',
          practicalExample: 'Pendant que le café/cacao génère un revenu annuel fort, le maïs et l’arachide assurent la trésorerie tous les 4 mois.',
          illustrationIcon: '🌱',
        },
      ],
      checklistJson: [
        'Calculer et mettre de côté la réserve alimentaire du ménage dès la récolte.',
        'Associer au moins une légumineuse (arachide, niébé, haricot) dans son système de culture.',
        'Impliquer conjointement l’homme, la femme et les jeunes du ménage dans la décision budgétaire.',
      ],
      facilitatorNoteFr:
        'Conseil Animateur Rikolto : Encouragez le dialogue au sein des couples d’agriculteurs lors de la simulation afin que les décisions sur l’utilisation du revenu prennent en compte la nutrition, la santé et le réinvestissement productif.',
    },
  ];

  for (const art of articles) {
    await prisma.toolboxArticle.upsert({
      where: { slug: art.slug },
      update: art,
      create: art,
    });
  }

  // 3. Seed Users (Administration & Animateurs de terrain)
  const usersToSeed = [
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
      name: 'Yvonne Kapinga',
      email: 'yvonne.kapinga@rikolto.org',
      role: 'FACILITATOR',
      organization: 'Rikolto RDC — Antenne Kikwit',
      province: 'Kwilu',
    },
    {
      id: 'user-fac-2',
      name: 'Jean-Paul Mbemba',
      email: 'jeanpaul.mbemba@rikolto.org',
      role: 'FACILITATOR',
      organization: 'Rikolto RDC — Antenne Kenge',
      province: 'Kwango',
    },
    {
      id: 'user-fac-3',
      name: 'Alain Mukwa',
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

  for (const u of usersToSeed) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: u,
      create: u,
    });
  }

  // 4. Seed Multi-Province Field Simulations (Kwilu & Kwango)
  const simulationsToSeed: {
    shareCode: string;
    title: string;
    producerName: string;
    province: string;
    crop: (typeof crops)[0];
    surfaceArea: number;
    yieldTotal: number;
    commQty: number;
    priceUsd: number;
    otherRevUsd: number;
    targetProfitUsd: number;
    notes: string;
  }[] = [
    {
      shareCode: 'AVN-2026',
      title: 'Campagne Café Robusta 1 ha - Coopérative Kwilu',
      producerName: 'Groupement Pilote Kikwit',
      province: 'Kwilu',
      crop: crops[0],
      surfaceArea: 1,
      yieldTotal: 1200,
      commQty: 1150,
      priceUsd: 1.85,
      otherRevUsd: 50,
      targetProfitUsd: 1000,
      notes: 'Simulation de référence pour 1 ha de Café Robusta séché sur claies.',
    },
    {
      shareCode: 'AVN-5842',
      title: 'Cacaoyère villageoise durable — Coopérative Bulungu',
      producerName: 'Coopérative Agricole de Bulungu (2 ha)',
      province: 'Kwilu',
      crop: crops[1],
      surfaceArea: 2,
      yieldTotal: 2000,
      commQty: 1950,
      priceUsd: 2.6,
      otherRevUsd: 100,
      targetProfitUsd: 2500,
      notes: 'Vente groupée avec l’OP pour obtenir un meilleur prix au kilo bord-champ.',
    },
    {
      shareCode: 'AVN-7139',
      title: 'Manioc amélioré TMC 419 & cossettes — Kenge',
      producerName: 'Ménage Kiese & Fils (1.5 ha)',
      province: 'Kwango',
      crop: crops[2],
      surfaceArea: 1.5,
      yieldTotal: 4800,
      commQty: 3900,
      priceUsd: 0.55,
      otherRevUsd: 40,
      targetProfitUsd: 1000,
      notes: 'Boutures saines TMC 419 résistantes à la mosaïque et séchage sur claies.',
    },
    {
      shareCode: 'AVN-3904',
      title: 'Maïs grain jaune hybride — Masi-Manimba',
      producerName: 'Groupement Paysan Lukula',
      province: 'Kwilu',
      crop: crops[3],
      surfaceArea: 1,
      yieldTotal: 2500,
      commQty: 2200,
      priceUsd: 0.5,
      otherRevUsd: 30,
      targetProfitUsd: 650,
      notes: 'Campagne maïs saison A avec semis en ligne et fertilisation organique.',
    },
    {
      shareCode: 'AVN-8421',
      title: 'Café Robusta séché sur claies — Idiofa',
      producerName: 'Union des Planteurs d’Idiofa',
      province: 'Kwilu',
      crop: crops[0],
      surfaceArea: 1.2,
      yieldTotal: 1450,
      commQty: 1400,
      priceUsd: 1.9,
      otherRevUsd: 60,
      targetProfitUsd: 1200,
      notes: 'Récolte sélective de cerises mûres et tri de qualité pour marché de spécialité.',
    },
    {
      shareCode: 'AVN-6215',
      title: 'Niébé & Légumineuses associées — Popokabaka',
      producerName: 'Association Féminine de Popokabaka',
      province: 'Kwango',
      crop: crops[4],
      surfaceArea: 0.8,
      yieldTotal: 720,
      commQty: 650,
      priceUsd: 1.2,
      otherRevUsd: 25,
      targetProfitUsd: 450,
      notes: 'Culture vivrière et nutritionnelle enrichissant les sols en azote.',
    },
  ];

  for (const sim of simulationsToSeed) {
    const input: SimulationInput = {
      title: sim.title,
      cropCode: sim.crop.code,
      cropName: sim.crop.nameFr,
      province: sim.province,
      surfaceArea: sim.surfaceArea,
      surfaceUnit: 'HA',
      expectedYieldTotal: sim.yieldTotal,
      commercializedQty: sim.commQty,
      productionUnit: sim.crop.productionUnit as any,
      unitSalePriceUsd: sim.priceUsd,
      otherRevenueUsd: sim.otherRevUsd,
      exchangeRateCdfPerUsd: 2850,
      expenses: sim.crop.expenses.map((e, idx) => ({
        id: `seed-${sim.shareCode}-${idx + 1}`,
        stage: e.stage as any,
        label: e.label,
        unit: e.unit,
        quantity: e.quantity * sim.surfaceArea,
        unitCostUsd: e.unitCostUsd,
        costType: e.costType as 'FIXED' | 'VARIABLE',
      })),
    };

    const results = calculateEconomicResults(input);

    await prisma.simulation.upsert({
      where: { shareCode: sim.shareCode },
      update: {
        title: sim.title,
        producerName: sim.producerName,
        province: sim.province,
        cropCode: sim.crop.code,
        cropName: sim.crop.nameFr,
        surfaceArea: sim.surfaceArea,
        surfaceUnit: 'HA',
        expectedYieldTotal: sim.yieldTotal,
        commercializedQty: sim.commQty,
        productionUnit: sim.crop.productionUnit,
        unitSalePriceUsd: sim.priceUsd,
        otherRevenueUsd: sim.otherRevUsd,
        exchangeRateCdfPerUsd: 2850,
        expensesJson: input.expenses as any,
        resultsJson: results as any,
        targetProfitUsd: sim.targetProfitUsd,
        notes: sim.notes,
      },
      create: {
        shareCode: sim.shareCode,
        title: sim.title,
        producerName: sim.producerName,
        province: sim.province,
        cropCode: sim.crop.code,
        cropName: sim.crop.nameFr,
        surfaceArea: sim.surfaceArea,
        surfaceUnit: 'HA',
        expectedYieldTotal: sim.yieldTotal,
        commercializedQty: sim.commQty,
        productionUnit: sim.crop.productionUnit,
        unitSalePriceUsd: sim.priceUsd,
        otherRevenueUsd: sim.otherRevUsd,
        exchangeRateCdfPerUsd: 2850,
        expensesJson: input.expenses as any,
        resultsJson: results as any,
        targetProfitUsd: sim.targetProfitUsd,
        notes: sim.notes,
      },
    });
  }

  console.log(
    '✅ Seed completed: 5 Crop Templates, 5 Categories, 5 Users (Admin + Facilitators), 6 Shared Simulations (AVN-XXXX).'
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

