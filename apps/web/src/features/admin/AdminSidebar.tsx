import React from 'react';
import {
  LayoutDashboard,
  Sprout,
  FileSpreadsheet,
  BookOpen,
  Users,
  Settings,
  LogOut,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { AuthPortalUserDto } from '../../api/generated/avenirApi';

export type AdminTabId = 'DASHBOARD' | 'CROPS' | 'SIMULATIONS' | 'TOOLBOX' | 'USERS' | 'SETTINGS';

interface AdminSidebarProps {
  activeTab: AdminTabId;
  onSelectTab: (tab: AdminTabId) => void;
  currentUser: AuthPortalUserDto;
  onLogout: () => void;
  onBackToPublic: () => void;
  isOnline: boolean;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
  onBackToPublic,
  isOnline,
  mobileMenuOpen,
  onCloseMobileMenu,
}) => {
  const menuSections = [
    {
      title: 'Pilotage',
      items: [
        {
          id: 'DASHBOARD' as AdminTabId,
          label: 'Tableau de bord M&E',
          icon: <LayoutDashboard size={17} />,
        },
      ],
    },
    {
      title: 'Données de terrain',
      items: [
        {
          id: 'CROPS' as AdminTabId,
          label: 'Filières & Référentiels',
          icon: <Sprout size={17} />,
          badge: '5 filières',
          badgeBg: '#EBF4EC',
          badgeColor: '#1F6338',
        },
        {
          id: 'SIMULATIONS' as AdminTabId,
          label: 'Registre des Simulations',
          icon: <FileSpreadsheet size={17} />,
          badge: '16',
          badgeBg: '#F4EFE6',
          badgeColor: '#8C6218',
        },
        {
          id: 'TOOLBOX' as AdminTabId,
          label: 'Boîte à images terrain',
          icon: <BookOpen size={17} />,
          badge: '12 planches',
          badgeBg: '#F1F5F9',
          badgeColor: '#475569',
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          id: 'USERS' as AdminTabId,
          label: 'Équipe & Animateurs',
          icon: <Users size={17} />,
          badge: '5 actifs',
          badgeBg: '#EBF4EC',
          badgeColor: '#1F6338',
        },
        {
          id: 'SETTINGS' as AdminTabId,
          label: 'Paramètres du projet',
          icon: <Settings size={17} />,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={onCloseMobileMenu}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(18, 36, 24, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
          }}
        />
      )}

      {/* Humanized Clean Light Sidebar */}
      <aside
        style={{
          width: '270px',
          backgroundColor: '#FFFFFF',
          color: '#122017',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid #E8EDE8',
          boxSizing: 'border-box',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1010,
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '1px 0 10px rgba(18, 36, 24, 0.03)',
        }}
        className="avenir-admin-sidebar-responsive"
      >
        <div>
          {/* Brand Header */}
          <div
            style={{
              padding: '18px 20px',
              backgroundColor: '#1F6338',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            <span
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              PROJET AVENIR
            </span>
          </div>

          {/* Navigation Groups */}
          <nav style={{ padding: '14px 12px 8px' }}>
            {menuSections.map((section, sIdx) => (
              <div key={sIdx} style={{ marginBottom: '14px' }}>
                <div
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: '#8A968C',
                    letterSpacing: '0.5px',
                    padding: '0 10px 5px',
                    textTransform: 'uppercase',
                  }}
                >
                  {section.title}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {section.items.map((item) => {
                    const active = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectTab(item.id);
                          onCloseMobileMenu();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '8px 11px',
                          borderRadius: '9px',
                          backgroundColor: active ? '#EBF4EC' : 'transparent',
                          color: active ? '#1F6338' : '#3B453D',
                          border: 'none',
                          borderLeft: active ? '3px solid #1F6338' : '3px solid transparent',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: active ? 700 : 500,
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <span style={{ color: active ? '#1F6338' : '#68746A' }}>{item.icon}</span>
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '999px',
                              backgroundColor: active ? '#FFFFFF' : item.badgeBg || '#F0F4F0',
                              color: item.badgeColor || '#1F6338',
                              border: active ? '1px solid #D5DDD5' : 'none',
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid #F0F4F0',
            backgroundColor: '#FAF8F3',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <button
              type="button"
              onClick={onBackToPublic}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '7px 10px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                color: '#1F6338',
                border: '1px solid #D5DDD5',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                textAlign: 'left',
              }}
            >
              <ArrowLeft size={13} color="#1F6338" />
              <span>Simulateur public</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '7px 10px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#B91C1C',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                textAlign: 'left',
              }}
            >
              <LogOut size={13} color="#B91C1C" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
