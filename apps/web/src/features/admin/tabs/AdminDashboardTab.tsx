import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  Sprout,
  DollarSign,
  Layers,
  MapPin,
  RefreshCw,
  Download,
  Calendar,
  CheckCircle,
  ArrowUpRight,
} from 'lucide-react';
import { adminSyncService, AdminStatsData, FALLBACK_ADMIN_STATS } from '../services/adminSyncService';
import { SavedSimulationDto } from '../../../api/generated/avenirApi';

interface AdminDashboardTabProps {
  onNavigateToTab: (tab: any) => void;
  onOpenSimulation: (sim: SavedSimulationDto) => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({ onNavigateToTab, onOpenSimulation }) => {
  const [stats, setStats] = useState<AdminStatsData>(FALLBACK_ADMIN_STATS);
  const [recentSims, setRecentSims] = useState<SavedSimulationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const settings = adminSyncService.getSettings();

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, sims] = await Promise.all([
        adminSyncService.getStats(),
        adminSyncService.getAllSimulations(),
      ]);
      setStats(statsData);
      setRecentSims(sims.slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatUsd = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCdf = (usdAmount: number) => {
    const cdf = usdAmount * settings.exchangeRateCdfPerUsd;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'CDF',
      maximumFractionDigits: 0,
    }).format(cdf);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div
        style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          backgroundColor: '#0E4523',
          padding: 'clamp(20px, 4vw, 28px)',
          color: '#FFFFFF',
          boxShadow: '0 12px 32px rgba(14, 69, 35, 0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11.5px',
                fontWeight: 800,
                color: '#F2B632',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              SUIVI-ÉVALUATION (M&E) · PROJET AVENIR
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(22px, 4vw, 30px)',
                fontWeight: 800,
                lineHeight: '1.2',
                color: '#FFFFFF',
              }}
            >
              Tableau de Bord Stratégique & Impact
            </h1>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: '13.5px',
                color: '#DCE7DF',
                maxWidth: '680px',
                lineHeight: '20px',
              }}
            >
              Suivi en temps réel de l’objectif de 8 000 ménages agricoles accompagnés par saison dans les provinces du Kwilu (Kikwit, Bulungu, Idiofa) et du Kwango (Kenge, Popokabaka).
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              style={{
                height: '40px',
                padding: '0 16px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.14)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} color="#F2B632" />
              <span>{loading ? 'Actualisation...' : 'Actualiser les données'}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('SIMULATOR_EXPORT')}
              style={{
                height: '40px',
                padding: '0 18px',
                borderRadius: '999px',
                backgroundColor: '#F2B632',
                border: 'none',
                color: '#0E1711',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(242, 182, 50, 0.3)',
              }}
            >
              <Download size={14} color="#0E1711" />
              <span>Rapport d’Impact</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Major KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '16px',
        }}
      >
        {/* KPI 1: Households Target */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8E2',
            boxShadow: '0 6px 20px rgba(18, 36, 24, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#5F685F', textTransform: 'uppercase' }}>
                Ménages Accompagnés
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#EBF4EC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={16} color="#1F6338" />
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '28px', fontWeight: 800, color: '#122017' }}>
              {stats.totalSimulations}{' '}
              <span style={{ fontSize: '15px', color: '#768278', fontWeight: 600 }}>/ 8 000 cibles</span>
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: '12px' }}>
              <div
                style={{
                  height: '8px',
                  width: '100%',
                  backgroundColor: '#EAE6DD',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.max(3, stats.progressGoalPercent)}%`,
                    backgroundColor: '#1F6338',
                    borderRadius: '999px',
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#5F685F',
                  fontWeight: 600,
                }}
              >
                <span>Avancement saisonnier</span>
                <span style={{ fontWeight: 800, color: '#1F6338' }}>{stats.progressGoalPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 2: Production Volume & Surface */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8E2',
            boxShadow: '0 6px 20px rgba(18, 36, 24, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#5F685F', textTransform: 'uppercase' }}>
                Récolte & Superficie
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sprout size={16} color="#8C6218" />
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '28px', fontWeight: 800, color: '#122017' }}>
              {stats.totalProductionKg.toLocaleString('fr-FR')}{' '}
              <span style={{ fontSize: '16px', color: '#5F685F' }}>kg</span>
            </div>

            <div style={{ marginTop: '6px', fontSize: '13px', color: '#1F6338', fontWeight: 700 }}>
              🌾 {stats.totalSurfaceAreaHa} hectares simulés
            </div>
          </div>
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#768278' }}>
            Kwilu ({stats.countByProvince.Kwilu || 0}) • Kwango ({stats.countByProvince.Kwango || 0})
          </div>
        </div>

        {/* KPI 3: Gross Revenue */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8E2',
            boxShadow: '0 6px 20px rgba(18, 36, 24, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#5F685F', textTransform: 'uppercase' }}>
                Valeur Économique Brute
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#E0F2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DollarSign size={16} color="#0369A1" />
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '28px', fontWeight: 800, color: '#0369A1' }}>
              {formatUsd(stats.totalRevenueUsd)}
            </div>

            <div style={{ marginTop: '4px', fontSize: '12.5px', color: '#5F685F' }}>
              ≈ {formatCdf(stats.totalRevenueUsd)}
            </div>
          </div>
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#768278' }}>
            Taux officiel : 1 USD = {settings.exchangeRateCdfPerUsd} CDF
          </div>
        </div>

        {/* KPI 4: Net Profit & Margin */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8E2',
            boxShadow: '0 6px 20px rgba(18, 36, 24, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#5F685F', textTransform: 'uppercase' }}>
                Bénéfice Net Global Estimé
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp size={16} color="#15803D" />
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '28px', fontWeight: 800, color: '#15803D' }}>
              {formatUsd(stats.totalNetProfitUsd)}
            </div>

            <div style={{ marginTop: '4px', fontSize: '12.5px', color: '#15803D', fontWeight: 700 }}>
              Marge nette moyenne : {stats.averageNetMarginPercent}%
            </div>
          </div>
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#768278' }}>
            Après déduction des 8 étapes de coûts
          </div>
        </div>
      </div>

      {/* Two Column Layout: Provincial Balance & Crops Priority */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
          gap: '20px',
        }}
      >
        {/* Card 1: Provincial Breakdown Kwilu vs Kwango */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '22px',
            border: '1px solid #E2E8E2',
            boxShadow: '0 6px 20px rgba(18, 36, 24, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="#1F6338" />
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#122017' }}>
                Répartition Géographique & Antennes
              </h2>
            </div>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#1F6338',
                backgroundColor: '#EBF4EC',
                padding: '4px 10px',
                borderRadius: '999px',
              }}
            >
              2 Provinces d'action
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Kwilu Section */}
            <div
              style={{
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: '#FAF8F3',
                border: '1px solid #EAE6DD',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#122017' }}>
                  Province du Kwilu
                </span>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#1F6338' }}>
                  {stats.countByProvince.Kwilu || 0} exploitations
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#5F685F', marginTop: '4px' }}>
                Antennes : Kikwit (Centrale), Bulungu, Territoire d'Idiofa (Coopérative CAPSA)
              </div>
              <div style={{ fontSize: '12px', color: '#122017', marginTop: '6px', fontWeight: 600 }}>
                Filières dominantes : Café Robusta, Cacaoyère villageoise, Maïs jaune.
              </div>
            </div>

            {/* Kwango Section */}
            <div
              style={{
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: '#FAF8F3',
                border: '1px solid #EAE6DD',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#122017' }}>
                  Province du Kwango
                </span>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#8C6218' }}>
                  {stats.countByProvince.Kwango || 0} exploitations
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#5F685F', marginTop: '4px' }}>
                Antennes : Kenge (Provinciale), Territoire de Popokabaka
              </div>
              <div style={{ fontSize: '12px', color: '#122017', marginTop: '6px', fontWeight: 600 }}>
                Filières dominantes : Manioc amélioré (TMC 419 / Cossettes), Niébé & Légumineuses.
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Priority Crops Distribution */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '22px',
            border: '1px solid #E2E8E2',
            boxShadow: '0 6px 20px rgba(18, 36, 24, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sprout size={18} color="#1F6338" />
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#122017' }}>
                Filières Accompagnées par le Projet
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('CROPS')}
              style={{
                background: 'none',
                border: 'none',
                color: '#1F6338',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Gérer les référentiels →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(stats.countByCrop).map(([cropName, count]) => {
              const percent = Math.round((count / Math.max(1, stats.totalSimulations)) * 100);
              return (
                <div key={cropName} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ fontWeight: 700, color: '#122017' }}>{cropName}</span>
                    <span style={{ fontWeight: 800, color: '#1F6338' }}>
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      width: '100%',
                      backgroundColor: '#EAE6DD',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${percent}%`,
                        backgroundColor: '#1F6338',
                        borderRadius: '999px',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Field Simulations Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          padding: '22px',
          border: '1px solid #E2E8E2',
          boxShadow: '0 6px 20px rgba(18, 36, 24, 0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#122017' }}>
              Dernières Simulations Terrain Enregistrées
            </h2>
            <div style={{ fontSize: '12.5px', color: '#5F685F', marginTop: '2px' }}>
              Chiffrages économiques soumis par les animateurs et ménages
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('SIMULATIONS')}
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
              gap: '4px',
            }}
          >
            Voir tout le registre →
          </button>
        </div>

        {recentSims.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#768278', fontSize: '13.5px' }}>
            Aucune simulation enregistrée pour le moment.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8E2', color: '#5F685F' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Code</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Intitulé & Producteur</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Province</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Culture</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Superficie</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Bénéfice Net</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentSims.map((sim) => {
                  const profit = sim.results?.netProfitUsd ?? 0;
                  return (
                    <tr
                      key={sim.id}
                      style={{
                        borderBottom: '1px solid #F0F4F0',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <td style={{ padding: '12px', fontWeight: 800, color: '#1F6338' }}>
                        <span
                          style={{
                            backgroundColor: '#EBF4EC',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                          }}
                        >
                          {sim.shareCode}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700, color: '#122017' }}>{sim.title}</div>
                        <div style={{ fontSize: '11px', color: '#768278' }}>{sim.producerName}</div>
                      </td>
                      <td style={{ padding: '12px', color: '#122017' }}>
                        📍 {sim.province}
                      </td>
                      <td style={{ padding: '12px', color: '#122017' }}>
                        {sim.cropName}
                      </td>
                      <td style={{ padding: '12px', color: '#5F685F' }}>
                        {sim.surfaceArea} {sim.surfaceUnit}
                      </td>
                      <td
                        style={{
                          padding: '12px',
                          textAlign: 'right',
                          fontWeight: 800,
                          color: profit >= 0 ? '#15803D' : '#DC2626',
                        }}
                      >
                        {formatUsd(profit)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => onOpenSimulation(sim)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#1F6338',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}
                        >
                          Ouvrir <ArrowUpRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

