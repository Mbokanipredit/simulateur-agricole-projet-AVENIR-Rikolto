import React, { useEffect, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Menu, X, ArrowLeft, ShieldCheck, Wifi, WifiOff } from 'lucide-react';
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

    // Check persisted admin session
    if (!authUser) {
      const savedSession = localStorage.getItem('avenir_admin_session');
      if (savedSession) {
        try {
          const user = JSON.parse(savedSession);
          if (user?.email) {
            setAuthUser(user);
          }
        } catch {}
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [authUser, setAuthUser]);

  const handleLoginSuccess = (user: AuthPortalUserDto) => {
    setAuthUser(user);
    localStorage.setItem('avenir_admin_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem('avenir_admin_session');
  };

  const handleBackToPublic = () => {
    if (onBackToPublicSite) {
      onBackToPublicSite();
    } else {
      window.location.hash = '';
      setMainSection('HOME');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
        fontFamily: "'Plus Jakarta Sans', sans-serif",
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
            borderBottom: '1px solid #E2E8E2',
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="avenir-admin-mobile-toggle"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                color: '#122017',
              }}
            >
              <Menu size={22} />
            </button>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#1F6338', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                ADMINISTRATION CENTRALE · PROJET AVENIR
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#122017' }}>
                {tabTitles[activeTab]}
              </div>
            </div>
          </div>

          {/* Right Header Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={handleBackToPublic}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: '#FAF8F3',
                border: '1.5px solid #1F6338',
                color: '#1F6338',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ArrowLeft size={13} color="#1F6338" />
              <span>Site public</span>
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FAF8F3',
                padding: '5px 12px',
                borderRadius: '999px',
                border: '1px solid #E2E8E2',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isOnline ? '#16A34A' : '#EAB308',
                }}
              />
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#122017' }}>
                {isOnline ? 'Connecté' : 'Hors-ligne'}
              </span>
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
