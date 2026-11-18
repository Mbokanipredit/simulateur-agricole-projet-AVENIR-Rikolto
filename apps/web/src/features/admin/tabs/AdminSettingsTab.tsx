import React, { useState } from 'react';
import {
  Settings,
  DollarSign,
  Users,
  Building,
  RefreshCw,
  Database,
  CheckCircle,
  AlertCircle,
  Save,
  Trash2,
} from 'lucide-react';
import { adminSyncService, AdminProjectSettings } from '../services/adminSyncService';

export const AdminSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<AdminProjectSettings>(adminSyncService.getSettings());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);

  const handleSave = () => {
    adminSyncService.saveSettings(settings);
    setStatusMessage('Paramètres globaux enregistrés avec succès !');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleClearCache = () => {
    if (confirm('Voulez-vous réinitialiser le cache local hors-ligne ? Les données fraîches seront rechargées depuis le serveur.')) {
      adminSyncService.clearAllCache();
      setStatusMessage('Cache hors-ligne réinitialisé.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleForceSync = async () => {
    setSyncLoading(true);
    try {
      await Promise.all([
        adminSyncService.getStats(),
        adminSyncService.getAllSimulations(),
        adminSyncService.getAllCrops(),
        adminSyncService.getAllUsers(),
      ]);
      setStatusMessage('Synchronisation complète avec la base PostgreSQL réussie !');
    } catch {
      setStatusMessage('Synchronisation terminée (certains endpoints distants indisponibles, cache local préservé).');
    } finally {
      setSyncLoading(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          backgroundColor: '#FFFFFF',
          padding: '18px 22px',
          borderRadius: '16px',
          border: '1px solid #E2E8E2',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#122017' }}>
            Paramètres du Projet & Synchronisation
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#5F685F' }}>
            Taux de change de référence, cibles saisonnières et gestionnaire du cache hors-ligne pour le Kwilu et le Kwango.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          style={{
            height: '42px',
            padding: '0 20px',
            borderRadius: '999px',
            backgroundColor: '#1F6338',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(31, 99, 56, 0.25)',
          }}
        >
          <Save size={15} color="#FFFFFF" />
          <span>Enregistrer les paramètres</span>
        </button>
      </div>

      {statusMessage && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#166534',
            fontSize: '13.5px',
            fontWeight: 600,
          }}
        >
          <CheckCircle size={16} color="#16A34A" />
          {statusMessage}
        </div>
      )}

      {/* Settings Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: '20px',
        }}
      >
        {/* Card 1: Economic Parameters */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '22px',
            border: '1px solid #E2E8E2',
            boxShadow: '0 6px 18px rgba(18, 36, 24, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <DollarSign size={18} color="#1F6338" />
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#122017' }}>
              Paramètres Économiques & Devises
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#122017', marginBottom: '4px' }}>
                Taux de change officiel (CDF pour 1 USD)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={settings.exchangeRateCdfPerUsd}
                  onChange={(e) => setSettings({ ...settings, exchangeRateCdfPerUsd: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1.5px solid #D5DDD5',
                    padding: '0 12px',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#122017',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ fontSize: '11px', color: '#768278', marginTop: '4px' }}>
                Ce taux s’applique à toutes les conversions automatiques USD ⇄ CDF sur la plateforme et les rapports.
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#122017', marginBottom: '4px' }}>
                Cible d'accompagnement par saison (Ménages)
              </label>
              <input
                type="number"
                value={settings.targetHouseholds}
                onChange={(e) => setSettings({ ...settings, targetHouseholds: Number(e.target.value) })}
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '8px',
                  border: '1.5px solid #D5DDD5',
                  padding: '0 12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#122017',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ fontSize: '11px', color: '#768278', marginTop: '4px' }}>
                Objectif officiel fixé pour le Projet AVENIR au Kwilu & Kwango (8 000 ménages).
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Offline Synchronization Manager */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '22px',
            border: '1px solid #E2E8E2',
            boxShadow: '0 6px 18px rgba(18, 36, 24, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Database size={18} color="#1F6338" />
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#122017' }}>
              Synchronisation & Mode Hors-Ligne
            </h2>
          </div>

          <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#5F685F', lineHeight: '18px' }}>
            Permet aux animateurs de travailler dans les zones rurales isolées du Kwilu et Kwango sans coupure, avec synchronisation bidirectionnelle lorsque le réseau est rétabli.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              disabled={syncLoading}
              onClick={handleForceSync}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#FAF8F3',
                border: '1.5px solid #1F6338',
                color: '#1F6338',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <RefreshCw size={15} className={syncLoading ? 'animate-spin' : ''} color="#1F6338" />
              <span>{syncLoading ? 'Synchronisation en cours...' : 'Forcer la synchronisation avec PostgreSQL'}</span>
            </button>

            <button
              type="button"
              onClick={handleClearCache}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Trash2 size={14} color="#DC2626" />
              <span>Réinitialiser le cache local</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
