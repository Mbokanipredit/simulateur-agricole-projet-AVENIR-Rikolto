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
  const menuItems: { id: AdminTabId; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'DASHBOARD',
      label: 'Vue d’ensemble & M&E',
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: 'CROPS',
      label: 'Référentiels Cultures & Coûts',
      icon: <Sprout size={18} />,
      badge: '5 filières',
    },
    {
      id: 'SIMULATIONS',
      label: 'Registre des Simulations',
      icon: <FileSpreadsheet size={18} />,
    },
    {
      id: 'TOOLBOX',
      label: 'Boîte à Images & Retours',
      icon: <Layers size={18} />,
      badge: '12 fiches',
    },
    {
      id: 'USERS',
      label: 'Équipe & Animateurs',
      icon: <Users size={18} />,
    },
    {
      id: 'SETTINGS',
      label: 'Paramètres & Devises',
      icon: <Settings size={18} />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={onCloseMobileMenu}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            zIndex: 1000,
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: '280px',
          backgroundColor: '#0E4523',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          boxSizing: 'border-box',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1010,
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}
        className="avenir-admin-sidebar-responsive"
      >
        {/* Top Header & Brand */}
        <div>
          <div
            style={{
              padding: '24px 20px 18px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#F2B632',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(242, 182, 50, 0.3)',
                }}
              >
                <ShieldCheck size={22} color="#0E4523" />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.4px' }}>
                  AVENIR ADMIN
                </div>
                <div style={{ fontSize: '11px', color: '#DCE7DF', fontWeight: 600 }}>
                  Rikolto RDC · Kwilu & Kwango
                </div>
              </div>
            </div>

            {/* Connectivity Badge */}
            <div
              style={{
                marginTop: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '999px',
                backgroundColor: isOnline ? 'rgba(74, 222, 128, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                border: `1px solid ${isOnline ? '#4ADE80' : '#FBBF24'}`,
                fontSize: '11px',
                fontWeight: 700,
                color: isOnline ? '#86EFAC' : '#FDE047',
              }}
            >
              {isOnline ? <Wifi size={12} color="#86EFAC" /> : <WifiOff size={12} color="#FDE047" />}
              {isOnline ? 'Base PostgreSQL Connectée' : 'Mode Hors-Ligne Actif'}
            </div>
          </div>

          {/* Navigation Items */}
          <nav style={{ padding: '16px 12px' }}>
            <div
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                color: '#8BA593',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                padding: '0 10px 8px',
              }}
            >
              Modules de gestion
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {menuItems.map((item) => {
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
                      padding: '11px 12px',
                      borderRadius: '10px',
                      backgroundColor: active ? '#F2B632' : 'transparent',
                      color: active ? '#0E1711' : '#EBF2EA',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13.5px',
                      fontWeight: active ? 800 : 600,
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: active ? '#0E4523' : '#F2B632' }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '999px',
                          backgroundColor: active ? 'rgba(14, 69, 35, 0.2)' : 'rgba(255, 255, 255, 0.12)',
                          color: active ? '#0E4523' : '#DCE7DF',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Bottom User Area & Logout */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* User Profile Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#F2B632',
                color: '#122017',
                fontWeight: 800,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentUser.name}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#A5D6A7',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentUser.role === 'ADMIN' ? 'Direction Rikolto' : 'Animateur'} · {currentUser.province}
              </div>
            </div>
          </div>

          {/* Action Links */}
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
                backgroundColor: 'transparent',
                color: '#DCE7DF',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: 700,
                textAlign: 'left',
              }}
            >
              <ExternalLink size={14} color="#F2B632" />
              <span>Voir le site public AVENIR</span>
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
                color: '#FCA5A5',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: 700,
                textAlign: 'left',
              }}
            >
              <LogOut size={14} color="#F87171" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

