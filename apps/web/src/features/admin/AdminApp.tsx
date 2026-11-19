import React, { useEffect, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Menu, X, ShieldCheck, Wifi, WifiOff, Search } from 'lucide-react';
import { AuthPortalUserDto, SavedSimulationDto } from '../../api/generated/avenirApi';
import {
  activeMainSectionAtom,
  authUserAtom,
  simulationInputAtom,
} from '../../atoms/appAtoms';
import { AdminLoginPortal } from './AdminLoginPortal';
import { AdminSidebar, AdminTabId } from './AdminSidebar';
import { AdminDashboardTab } from './tabs/AdminDashboardTab';
import { AdminCropsTab } from './tabs/AdminCropsTab';
import { AdminSimulationsTab } from './tabs/AdminSimulationsTab';
import { AdminToolboxTab } from './tabs/AdminToolboxTab';
import { AdminUsersTab } from './tabs/AdminUsersTab';
import { AdminSettingsTab } from './tabs/AdminSettingsTab';
import { adminSyncService } from './services/adminSyncService';

interface AdminAppProps {
  onBackToPublicSite?: () => void;
}

export const AdminApp: React.FC<AdminAppProps> = ({ onBackToPublicSite }) => {
  const [authUser, setAuthUser] = useAtom(authUserAtom);
  const setMainSection = useSetAtom(activeMainSectionAtom);
  const setSimInput = useSetAtom(simulationInputAtom);

  const [activeTab, setActiveTab] = useState<AdminTabId>('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(adminSyncService.isOnline());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up any old persisted sessions so visiting /admin always presents the login portal
    try {
      localStorage.removeItem('avenir_admin_session');
      sessionStorage.removeItem('avenir_admin_session');
    } catch {}

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLoginSuccess = (user: AuthPortalUserDto) => {
    setAuthUser(user);
  };

  const handleLogout = () => {
    setAuthUser(null);
    try {
      localStorage.removeItem('avenir_admin_session');
      sessionStorage.removeItem('avenir_admin_session');
    } catch {}
  };

  const handleBackToPublic = () => {
    if (onBackToPublicSite) {
      onBackToPublicSite();
      return;
    }
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
  };

  const handleOpenSimulationInSimulator = (sim: SavedSimulationDto) => {
    setSimInput({
      title: sim.title,
      cropCode: sim.cropCode,
      cropName: sim.cropName,
      province: sim.province,
      surfaceArea: sim.surfaceArea,
      surfaceUnit: (sim.surfaceUnit as any) || 'HA',
      expectedYieldTotal: sim.expectedYieldTotal,
      commercializedQty: sim.commercializedQty,
      productionUnit: (sim.productionUnit as any) || 'KG',
      unitSalePriceUsd: sim.unitSalePriceUsd,
      otherRevenueUsd: sim.otherRevenueUsd || 0,
      exchangeRateCdfPerUsd: sim.exchangeRateCdfPerUsd || 2850,
      expenses: (sim.expenses || []).map((e) => ({
        id: e.id,
        stage: e.stage as any,
        label: e.label,
        unit: e.unit,
        quantity: e.quantity,
        unitCostUsd: e.unitCostUsd,
        costType: (e.costType as any) || 'VARIABLE',
      })),
    });

    handleBackToPublic();
    setMainSection('SIMULATOR');
  };

  // If not logged in, display the dedicated Executive Login Portal
  if (!authUser) {
    return (
      <AdminLoginPortal
        onLoginSuccess={handleLoginSuccess}
        onBackToPublic={handleBackToPublic}
      />
    );
  }

  const tabTitles: Record<AdminTabId, string> = {
    DASHBOARD: 'Vue d’ensemble & Suivi-Évaluation (M&E)',
    CROPS: 'Référentiels Techniques & Coûts des Filières',
    SIMULATIONS: 'Registre des Simulations & Exploitations',
    TOOLBOX: 'Boîte à Images Pédagogique & Synthèse Terrain',
    USERS: 'Gestion de l’Équipe & Animateurs de Terrain',
    SETTINGS: 'Paramètres du Projet & Synchronisation Hors-Ligne',
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#FAF8F3',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={authUser}
        onLogout={handleLogout}
        onBackToPublic={handleBackToPublic}
        isOnline={isOnline}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Pane */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: '280px',
        }}
        className="avenir-admin-main-pane"
      >
        {/* Top Header Bar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E8EDE8',
            padding: '12px clamp(14px, 2.5vw, 28px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 10px rgba(18, 36, 24, 0.03)',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="avenir-admin-mobile-toggle"
              style={{
                display: 'none',
                background: '#F0F5F1',
                border: '1px solid #DCE7DF',
                padding: '7px',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#1F6338',
                flexShrink: 0,
              }}
            >
              <Menu size={20} />
            </button>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#687068', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Projet AVENIR</span>
                <span>/</span>
                <span>Kwilu & Kwango</span>
              </div>
              <div style={{ fontSize: 'clamp(14px, 2vw, 17px)', fontWeight: 800, color: '#18241B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {tabTitles[activeTab]}
              </div>
            </div>
          </div>

          {/* Center Search Bar */}
          <div
            style={{
              position: 'relative',
              maxWidth: '340px',
              width: '100%',
              display: 'none',
            }}
            className="avenir-admin-header-search"
          >
            <Search size={15} color="#768278" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              placeholder="Rechercher une exploitation, un ménage..."
              style={{
                width: '100%',
                height: '36px',
                padding: '0 14px 0 36px',
                borderRadius: '999px',
                backgroundColor: '#FAF8F3',
                border: '1px solid #DCE7DF',
                fontSize: '12.5px',
                color: '#122017',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Right Header Status & User Profile Chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {/* User Profile Header Chip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 8px 4px 10px',
                borderRadius: '999px',
                backgroundColor: '#FAF8F3',
                border: '1px solid #DCE7DF',
              }}
            >
              <div style={{ textAlign: 'right', display: 'none' }} className="avenir-admin-user-info">
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#18241B', lineHeight: 1.1 }}>
                  {authUser.name}
                </div>
                <div style={{ fontSize: '10.5px', color: '#687068' }}>
                  {authUser.role === 'ADMIN' ? 'Direction' : 'Animateur terrain'}
                </div>
              </div>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#1F6338',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {authUser.name ? authUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Tab Body View */}
        <main
          style={{
            flex: 1,
            padding: 'clamp(16px, 3vw, 28px)',
            maxWidth: '1440px',
            width: '100%',
            boxSizing: 'border-box',
            margin: '0 auto',
          }}
        >
          {activeTab === 'DASHBOARD' && (
            <AdminDashboardTab
              onNavigateToTab={setActiveTab}
              onOpenSimulation={handleOpenSimulationInSimulator}
            />
          )}

          {activeTab === 'CROPS' && <AdminCropsTab />}

          {activeTab === 'SIMULATIONS' && (
            <AdminSimulationsTab onOpenInSimulator={handleOpenSimulationInSimulator} />
          )}

          {activeTab === 'TOOLBOX' && <AdminToolboxTab />}

          {activeTab === 'USERS' && <AdminUsersTab />}

          {activeTab === 'SETTINGS' && <AdminSettingsTab />}
        </main>
      </div>
    </div>
  );
};

