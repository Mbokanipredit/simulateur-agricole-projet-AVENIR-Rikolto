import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { YStack, XStack, Text, Button } from 'tamagui';
import { Sprout, ArrowRight, Menu, X } from 'lucide-react';
import {
  activeMainSectionAtom,
  displayCurrencyAtom,
  MainSection,
} from '../atoms/appAtoms';

export const Header: React.FC = () => {
  const [mainSection, setMainSection] = useAtom(activeMainSectionAtom);
  const [currency, setCurrency] = useAtom(displayCurrencyAtom);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (section: MainSection, anchorId?: string) => {
    setMainSection(section);
    setMobileMenuOpen(false);
    if (anchorId) {
      setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navItems: { id: MainSection; label: string }[] = [
    { id: 'HOME', label: 'Accueil' },
    { id: 'SIMULATOR', label: 'Simulateur' },
    { id: 'RESULTS', label: 'Résultats' },
    { id: 'TOOLBOX', label: 'Boîte à outils' },
    { id: 'HOW_IT_WORKS', label: 'Comment ça marche' },
  ];

  return (
    <YStack
      backgroundColor="#FAF8F3"
      borderBottomWidth={1}
      borderBottomColor="#EAE6DD"
      paddingHorizontal="$4"
      paddingVertical="$3.5"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Brand Logo */}
          <XStack
            alignItems="center"
            gap="$2.5"
            cursor="pointer"
            onPress={() => navigateTo('HOME')}
          >
            <YStack
              width={34}
              height={34}
              borderRadius={9}
              backgroundColor="#1F6338"
              alignItems="center"
              justifyContent="center"
            >
              <Sprout size={18} color="#FFFFFF" />
            </YStack>
            <Text fontSize={17} fontWeight="800" color="#18241B" letterSpacing={0.3}>
              AVENIR
            </Text>
          </XStack>

          {/* Desktop Navigation Links */}
          <nav className="avenir-desktop-nav">
            {navItems.map((item) => {
              const active = mainSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '6px 2px',
                    fontSize: '14px',
                    fontWeight: active ? 700 : 500,
                    color: active ? '#1F6338' : '#3B433C',
                    borderBottom: active ? '2px solid #F2B632' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: USD/CDF Switch + CTA Button + Mobile Menu Button */}
          <XStack alignItems="center" gap="$2.5">
            <XStack
              backgroundColor="#EFECE4"
              padding={2}
              borderRadius={999}
              alignItems="center"
            >
              {(['USD', 'CDF'] as const).map((curr) => {
                const active = currency === curr;
                return (
                  <Button
                    key={curr}
                    size="$2"
                    height={26}
                    paddingHorizontal="$2.5"
                    borderRadius={999}
                    backgroundColor={active ? '#FFFFFF' : 'transparent'}
                    onPress={() => setCurrency(curr)}
                  >
                    <Text
                      fontSize={11}
                      fontWeight="700"
                      color={active ? '#18241B' : '#687068'}
                    >
                      {curr}
                    </Text>
                  </Button>
                );
              })}
            </XStack>

            <div className="avenir-header-cta-btn">
              <Button
                size="$3.5"
                height={38}
                borderRadius={999}
                paddingHorizontal="$4"
                backgroundColor="#F2B632"
                color="#18241B"
                fontWeight="700"
                onPress={() => navigateTo('SIMULATOR')}
              >
                <XStack alignItems="center" gap="$1.5">
                  <Text fontSize={13} fontWeight="700" color="#18241B">
                    Lancer la simulation
                  </Text>
                  <ArrowRight size={14} color="#18241B" />
                </XStack>
              </Button>
            </div>

            <button
              type="button"
              className="avenir-mobile-menu-btn"
              aria-label="Menu"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: '1px solid #DCE5DC',
                backgroundColor: '#FFFFFF',
                color: '#18241B',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </XStack>
        </div>

        {/* Mobile Collapsible Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="avenir-mobile-drawer">
            {navItems.map((item) => {
              const active = mainSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: active ? '#E7F3E7' : 'transparent',
                    color: active ? '#0E4523' : '#2C382E',
                    fontSize: '14.5px',
                    fontWeight: active ? 800 : 600,
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => navigateTo('SIMULATOR')}
              style={{
                marginTop: '6px',
                width: '100%',
                height: '42px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: '#F2B632',
                color: '#122017',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <span>Lancer la simulation</span>
              <ArrowRight size={15} color="#122017" />
            </button>
          </div>
        )}
      </div>
    </YStack>
  );
};
