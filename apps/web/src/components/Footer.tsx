import React from 'react';
import { useSetAtom } from 'jotai';
import { YStack, XStack, Text, Separator } from 'tamagui';
import { Sprout } from 'lucide-react';
import { activeMainSectionAtom, MainSection } from '../atoms/appAtoms';

export const Footer: React.FC = () => {
  const setMainSection = useSetAtom(activeMainSectionAtom);

  const go = (section: MainSection) => {
    setMainSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <YStack
      backgroundColor="#162D1F"
      paddingVertical="$7"
      paddingHorizontal="$4"
    >
      <YStack maxWidth={1120} width="100%" alignSelf="center" gap="$5">
        <XStack justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="$6">
          {/* Left Column: AVENIR / Rikolto en RDC */}
          <YStack flex={1.2} minWidth={240} gap="$2.5">
            <XStack alignItems="center" gap="$2.5">
              <YStack
                width={32}
                height={32}
                borderRadius={8}
                backgroundColor="#216139"
                alignItems="center"
                justifyContent="center"
              >
                <Sprout size={17} color="#FFFFFF" />
              </YStack>
              <Text fontSize={16} fontWeight="800" color="#FFFFFF" letterSpacing={0.3}>
                AVENIR
              </Text>
            </XStack>
            <Text fontSize={13} color="#A3B5A7" lineHeight={20}>
              Mis en œuvre par Rikolto en RDC · Provinces du Kwilu et du Kwango.
            </Text>
          </YStack>

          {/* Middle Column: Rubriques */}
          <YStack flex={1} minWidth={180} gap="$2">
            <Text fontSize={12.5} fontWeight="700" color="#FFFFFF">
              Plateforme
            </Text>
            <XStack gap="$4" flexWrap="wrap">
              <Text
                fontSize={13}
                color="#A3B5A7"
                cursor="pointer"
                onPress={() => go('HOME')}
              >
                Accueil
              </Text>
              <Text
                fontSize={13}
                color="#A3B5A7"
                cursor="pointer"
                onPress={() => go('SIMULATOR')}
              >
                Simulateur
              </Text>
              <Text
                fontSize={13}
                color="#A3B5A7"
                cursor="pointer"
                onPress={() => go('RESULTS')}
              >
                Résultats
              </Text>
              <Text
                fontSize={13}
                color="#A3B5A7"
                cursor="pointer"
                onPress={() => go('TOOLBOX')}
              >
                Boîte à outils
              </Text>
              <Text
                fontSize={13}
                color="#A3B5A7"
                cursor="pointer"
                onPress={() => go('HOW_IT_WORKS')}
              >
                Comment ça marche
              </Text>
            </XStack>
          </YStack>

          {/* Right Column: Institutional Disclaimer (Exact mockup text) */}
          <YStack flex={1.4} minWidth={260} gap="$1.5">
            <Text fontSize={12.5} color="#A3B5A7" lineHeight={19}>
              Avec le soutien du FIDA, de l’AFD et du FEM/GEF. Les simulations sont indicatives et ne garantissent ni production ni revenus.
            </Text>
          </YStack>
        </XStack>

        <Separator borderColor="#23402E" />

        <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$2">
          <Text fontSize={12} color="#7E9483">
            © {new Date().getFullYear()} Projet AVENIR · Rikolto RDC
          </Text>
          <Text fontSize={12} color="#7E9483">
            Accès libre sans compte · Compatible smartphone et hors connexion
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
};
