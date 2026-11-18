import React from 'react';
import {
  LayoutDashboard,
  Sprout,
  FileSpreadsheet,
  Layers,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Wifi,
  WifiOff,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MapPin,
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
      title: 'MENU',
      items: [
        {
          id: 'DASHBOARD' as AdminTabId,
          label: 'Dashboard M&E',
          icon: <LayoutDashboard size={18} />,
        },
      ],
    },
    {
      title: 'COMPOSANTS TERRAIN',
      items: [
        {
          id: 'CROPS' as AdminTabId,
          label: 'Filières & Coûts',
          icon: <Sprout size={18} />,
          badge: '5',
          badgeColor: '#10B981',
        },
        {
          id: 'SIMULATIONS' as AdminTabId,
          label: 'Simulations Récentes',
          icon: <FileSpreadsheet size={18} />,
          badge: '16',
          badgeColor: '#EC4899',
        },
        {
          id: 'TOOLBOX' as AdminTabId,
          label: 'Boîte à Images (BD)',
          icon: <Layers size={18} />,
          badge: '12',
          badgeColor: '#D97706',
        },
      ],
    },
    {
      title: 'GESTION & ACCÈS',
      items: [
        {
          id: 'USERS' as AdminTabId,
          label: 'Animateurs & Équipe',
          icon: <Users size={18} />,
          badge: '5',
          badgeColor: '#8B5CF6',
        },
        {
          id: 'SETTINGS' as AdminTabId,
          label: 'Paramètres & Devises',
          icon: <Settings size={18} />,
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
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
          }}
        />
      )}

      {/* Humanized Clean Light Sidebar (Inspired by modern Panda dashboard design) */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#FFFFFF',
          color: '#1E293B',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid #E8EEF5',
          boxSizing: 'border-box',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1010,
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '2px 0 12px rgba(0, 0, 0, 0.02)',
        }}
        className="avenir-admin-sidebar-responsive"
      >
        {/* Top Header & User Card */}
        <div>
          {/* Brand Logo Header */}
          <div
            style={{
              padding: '22px 20px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #F1F5F9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#0E4523',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(14, 69, 35, 0.2)',
                }}
              >
                <Sprout size={20} color="#F2B632" />
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0E4523', letterSpacing: '-0.3px', lineHeight: '1.1' }}>
                  AVENIR
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>
                  Rikolto · Kwilu & Kwango
                </div>
              </div>
            </div>

            {/* Online Status Pill */}
            <div
              title={isOnline ? 'Connecté à PostgreSQL' : 'Mode Hors-Ligne'}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isOnline ? '#10B981' : '#F59E0B',
                boxShadow: isOnline ? '0 0 0 3px rgba(16, 185, 129, 0.2)' : '0 0 0 3px rgba(245, 158, 11, 0.2)',
              }}
            />
          </div>

          {/* User Profile Mini Card (Exact humanized style from example image) */}
          <div style={{ padding: '16px 16px 12px' }}>
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '14px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid #EDF2F7',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#0E4523',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(14, 69, 35, 0.15)',
                  flexShrink: 0,
                }}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#0F172A',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  {currentUser.role === 'ADMIN' ? 'Direction Rikolto' : 'Animateur Terrain'}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu Groups */}
          <nav style={{ padding: '4px 12px' }}>
            {menuSections.map((section, sIdx) => (
              <div key={sIdx} style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#94A3B8',
                    letterSpacing: '0.8px',
                    padding: '0 10px 6px',
                    textTransform: 'uppercase',
                  }}
                >
                  {section.title}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
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
                          padding: '9px 12px',
                          borderRadius: '10px',
                          backgroundColor: active ? '#F1F7F3' : 'transparent',
                          color: active ? '#0E4523' : '#475569',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: active ? 800 : 600,
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: active ? '#0E4523' : '#64748B' }}>{item.icon}</span>
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 800,
                              padding: '2px 7px',
                              borderRadius: '999px',
                              backgroundColor: item.badgeColor || '#E2E8F0',
                              color: '#FFFFFF',
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

        {/* Bottom Actions Area */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid #F1F5F9',
            backgroundColor: '#F8FAFC',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              onClick={onBackToPublic}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                color: '#0E4523',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                textAlign: 'left',
              }}
            >
              <ExternalLink size={14} color="#0E4523" />
              <span>Simulateur Public</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#EF4444',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                textAlign: 'left',
              }}
            >
              <LogOut size={14} color="#EF4444" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
