import React, { useEffect, useState, useMemo } from 'react';
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
  MoreVertical,
  Filter,
  Check,
  ChevronDown,
  ExternalLink,
  Search,
} from 'lucide-react';
import {
  adminSyncService,
  AdminStatsData,
  FALLBACK_ADMIN_STATS,
  TimePeriodFilter,
  calculateFilteredStats,
} from '../services/adminSyncService';
import { SavedSimulationDto } from '../../../api/generated/avenirApi';

interface AdminDashboardTabProps {
  onNavigateToTab: (tab: any) => void;
  onOpenSimulation: (sim: SavedSimulationDto) => void;
}

// Facilitators metadata for realistic humanized representation (Kwilu & Kwango)
const FACILITATORS: Record<string, { name: string; avatar: string; role: string; province: string }> = {
  Kwilu: {
    name: 'Yvonne Kapinga',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    role: 'Coordonnatrice M&E Kikwit',
    province: 'Kwilu',
  },
  Kwango: {
    name: 'Jean-Paul Mbemba',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    role: 'Agronome Référent Kenge',
    province: 'Kwango',
  },
  Bulungu: {
    name: 'Alain Mukwa',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    role: 'Conseiller Agricole Bulungu',
    province: 'Kwilu',
  },
  Idiofa: {
    name: 'Thérèse Nzuzi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    role: 'Spécialiste Filières CAPSA Idiofa',
    province: 'Kwilu',
  },
};

const BENEFICIARY_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80',
];

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({ onNavigateToTab, onOpenSimulation }) => {
  const [allSims, setAllSims] = useState<SavedSimulationDto[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriodFilter>('ALL');
  const [loading, setLoading] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const settings = adminSyncService.getSettings();

  const loadData = async () => {
    setLoading(true);
    try {
      const sims = await adminSyncService.getAllSimulations();
      setAllSims(sims);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Dynamically calculate stats based on the selected period
  const stats: AdminStatsData = useMemo(() => {
    if (allSims.length === 0) return FALLBACK_ADMIN_STATS;
    return calculateFilteredStats(allSims, selectedPeriod);
  }, [allSims, selectedPeriod]);

  // Filtered simulations list for the projects table
  const filteredSims = useMemo(() => {
    const now = new Date('2026-11-18T20:00:00.000Z').getTime();
    return allSims.filter((s) => {
      // Period filter
      if (selectedPeriod !== 'ALL') {
        const simTime = new Date(s.createdAt || '2026-10-01').getTime();
        const diffDays = (now - simTime) / (1000 * 60 * 60 * 24);
        if (selectedPeriod === '7D' && diffDays > 7) return false;
        if (selectedPeriod === '30D' && diffDays > 30) return false;
        if (selectedPeriod === '3M' && diffDays > 90) return false;
        if (selectedPeriod === '6M' && diffDays > 180) return false;
        if (selectedPeriod === '1Y' && diffDays > 365) return false;
      }
      // Text search
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        const matchTitle = (s.title || '').toLowerCase().includes(q);
        const matchProd = (s.producerName || '').toLowerCase().includes(q);
        const matchCrop = (s.cropName || '').toLowerCase().includes(q);
        const matchProv = (s.province || '').toLowerCase().includes(q);
        const matchCode = (s.shareCode || '').toLowerCase().includes(q);
        return matchTitle || matchProd || matchCrop || matchProv || matchCode;
      }
      return true;
    });
  }, [allSims, selectedPeriod, tableSearch]);

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

  const periodOptions: { id: TimePeriodFilter; label: string; tooltip: string }[] = [
    { id: '7D', label: '1S', tooltip: 'Derniers 7 jours (1 semaine)' },
    { id: '30D', label: '1M', tooltip: 'Derniers 30 jours (1 mois)' },
    { id: '3M', label: '3M', tooltip: 'Saison A (Trimestre récent)' },
    { id: '6M', label: '6M', tooltip: 'Semestre (Campagne 6 mois)' },
    { id: '1Y', label: '1A', tooltip: 'Année 2026 complète' },
    { id: 'ALL', label: 'Tout', tooltip: 'Toutes les simulations enregistrées' },
  ];

  // Max value for the monthly bars scaling
  const maxMonthRev = Math.max(1, ...stats.monthlyBars.map((b) => Math.max(b.revenue, b.expense)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
      {/* Top Banner / Strategy Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          padding: '2px 0',
        }}
      >
        <div style={{ minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#1F6338',
                backgroundColor: '#EBF4EC',
                padding: '3px 10px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
              }}
            >
              Suivi-Évaluation (M&E) · Rikolto RDC
            </span>
            <span style={{ fontSize: '12px', color: '#768278' }}>•</span>
            <span style={{ fontSize: '12px', color: '#5F685F', fontWeight: 600 }}>
              Campagne Agricole Kwilu & Kwango 2026
            </span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(19px, 3vw, 25px)',
              fontWeight: 800,
              color: '#122017',
              letterSpacing: '-0.3px',
            }}
          >
            Tableau de Bord Stratégique & Impact
          </h1>
        </div>

        {/* Action Controls & Periodic Filter Ribbon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Periodic Filter Pills Selector with Mobile Scroll */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              padding: '3px',
              borderRadius: '12px',
              border: '1px solid #DCE7DF',
              boxShadow: '0 2px 8px rgba(18, 36, 24, 0.03)',
              gap: '2px',
              overflowX: 'auto',
              maxWidth: '100%',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {periodOptions.map((opt) => {
              const active = selectedPeriod === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  title={opt.tooltip}
                  onClick={() => setSelectedPeriod(opt.id)}
                  style={{
                    padding: '6px 13px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: active ? '#1F6338' : 'transparent',
                    color: active ? '#FFFFFF' : '#5F685F',
                    fontSize: '12px',
                    fontWeight: active ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            style={{
              height: '36px',
              padding: '0 14px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #DCE7DF',
              color: '#122017',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: '0 2px 6px rgba(18, 36, 24, 0.03)',
              whiteSpace: 'nowrap',
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} color="#1F6338" />
            <span>{loading ? 'Calcul...' : 'Actualiser'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToTab('SIMULATIONS')}
            style={{
              height: '36px',
              padding: '0 16px',
              borderRadius: '10px',
              backgroundColor: '#1F6338',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: '0 4px 14px rgba(31, 99, 56, 0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            <Download size={13} color="#FFFFFF" />
            <span>Rapport d'Impact</span>
          </button>
        </div>
      </div>

      {/* Row 1: The 4 Top Metric Wave Cards (Pure White Cards, Agricultural Colors, Midpoint Dots) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '16px',
        }}
      >
        {/* Card 1: Households & Beneficiaries (Forest Green #1F6338) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #E8EDE8',
            boxShadow: '0 4px 18px rgba(18, 36, 24, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#EBF4EC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={18} color="#1F6338" />
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#1F6338',
                backgroundColor: '#EBF4EC',
                padding: '3px 9px',
                borderRadius: '999px',
              }}
            >
              {stats.progressGoalPercent}% cible
            </span>
          </div>

          {/* Smooth Sine Wave Curve with Forest Green Fill & Midpoint Dot */}
          <div style={{ margin: '8px -20px 4px -20px', height: '54px', position: 'relative' }}>
            <svg width="100%" height="54" viewBox="0 0 280 54" preserveAspectRatio="none" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="waveForest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1F6338" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#1F6338" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <path
                d="M 0 34 C 45 10, 85 48, 140 26 C 195 5, 235 44, 280 18 L 280 54 L 0 54 Z"
                fill="url(#waveForest)"
              />
              <path
                d="M 0 34 C 45 10, 85 48, 140 26 C 195 5, 235 44, 280 18"
                fill="none"
                stroke="#1F6338"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="140" cy="26" r="4.5" fill="#FFFFFF" stroke="#1F6338" strokeWidth="2.5" />
            </svg>
          </div>

          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#122017', lineHeight: 1.1 }}>
              {stats.totalHouseholds.toLocaleString('fr-FR')}{' '}
              <span style={{ fontSize: '13px', color: '#768278', fontWeight: 600 }}>/ 8 000</span>
            </div>
            <div style={{ fontSize: '12px', color: '#5F685F', marginTop: '4px', fontWeight: 600 }}>
              Ménages accompagnés (Kwilu & Kwango)
            </div>
          </div>
        </div>

        {/* Card 2: Surface & Crop Volume (Leaf Green #16A34A) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #E8EDE8',
            boxShadow: '0 4px 18px rgba(18, 36, 24, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sprout size={18} color="#16A34A" />
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#16A34A',
                backgroundColor: '#ECFDF5',
                padding: '3px 9px',
                borderRadius: '999px',
              }}
            >
              {stats.totalSurfaceAreaHa} ha simulés
            </span>
          </div>

          {/* Smooth Sine Wave Curve (Leaf Green) */}
          <div style={{ margin: '8px -20px 4px -20px', height: '54px', position: 'relative' }}>
            <svg width="100%" height="54" viewBox="0 0 280 54" preserveAspectRatio="none" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="waveLeaf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16A34A" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <path
                d="M 0 30 C 50 48, 90 12, 140 24 C 190 38, 230 10, 280 28 L 280 54 L 0 54 Z"
                fill="url(#waveLeaf)"
              />
              <path
                d="M 0 30 C 50 48, 90 12, 140 24 C 190 38, 230 10, 280 28"
                fill="none"
                stroke="#16A34A"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="140" cy="24" r="4.5" fill="#FFFFFF" stroke="#16A34A" strokeWidth="2.5" />
            </svg>
          </div>

          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#122017', lineHeight: 1.1 }}>
              {stats.totalProductionKg.toLocaleString('fr-FR')}{' '}
              <span style={{ fontSize: '13px', color: '#768278', fontWeight: 600 }}>kg</span>
            </div>
            <div style={{ fontSize: '12px', color: '#5F685F', marginTop: '4px', fontWeight: 600 }}>
              Volume de récolte totale estimée
            </div>
          </div>
        </div>

        {/* Card 3: Gross Economic Value (Warm Gold #D97706 / #F2B632) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #E8EDE8',
            boxShadow: '0 4px 18px rgba(18, 36, 24, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarSign size={18} color="#D97706" />
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#B45309',
                backgroundColor: '#FEF3C7',
                padding: '3px 9px',
                borderRadius: '999px',
              }}
            >
              Recettes brutes
            </span>
          </div>

          {/* Smooth Sine Wave Curve (Amber) */}
          <div style={{ margin: '8px -20px 4px -20px', height: '54px', position: 'relative' }}>
            <svg width="100%" height="54" viewBox="0 0 280 54" preserveAspectRatio="none" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="waveAmber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <path
                d="M 0 38 C 45 15, 80 44, 140 20 C 190 2, 235 38, 280 15 L 280 54 L 0 54 Z"
                fill="url(#waveAmber)"
              />
              <path
                d="M 0 38 C 45 15, 80 44, 140 20 C 190 2, 235 38, 280 15"
                fill="none"
                stroke="#D97706"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="140" cy="20" r="4.5" fill="#FFFFFF" stroke="#D97706" strokeWidth="2.5" />
            </svg>
          </div>

          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#122017', lineHeight: 1.1 }}>
              {formatUsd(stats.totalRevenueUsd)}
            </div>
            <div style={{ fontSize: '12px', color: '#5F685F', marginTop: '4px', fontWeight: 600 }}>
              ≈ {formatCdf(stats.totalRevenueUsd)}
            </div>
          </div>
        </div>

        {/* Card 4: Net Profit & Margin (Emerald #15803D) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #E8EDE8',
            boxShadow: '0 4px 18px rgba(18, 36, 24, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={18} color="#15803D" />
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#15803D',
                backgroundColor: '#DCFCE7',
                padding: '3px 9px',
                borderRadius: '999px',
              }}
            >
              Marge {stats.averageNetMarginPercent}%
            </span>
          </div>

          {/* Smooth Sine Wave Curve (Emerald) */}
          <div style={{ margin: '8px -20px 4px -20px', height: '54px', position: 'relative' }}>
            <svg width="100%" height="54" viewBox="0 0 280 54" preserveAspectRatio="none" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="waveEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <path
                d="M 0 32 C 40 45, 85 15, 140 28 C 190 40, 235 12, 280 22 L 280 54 L 0 54 Z"
                fill="url(#waveEmerald)"
              />
              <path
                d="M 0 32 C 40 45, 85 15, 140 28 C 190 40, 235 12, 280 22"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="140" cy="28" r="4.5" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" />
            </svg>
          </div>

          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#15803D', lineHeight: 1.1 }}>
              {formatUsd(stats.totalNetProfitUsd)}
            </div>
            <div style={{ fontSize: '12px', color: '#5F685F', marginTop: '4px', fontWeight: 600 }}>
              Bénéfice net global après 8 étapes
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Two Middle Cards (Donut Progress & Vertical Bar Chart) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
          gap: '20px',
        }}
      >
        {/* Middle-Left Card: Donut Circular Progress + Financial Breakdown */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #E8EDE8',
            boxShadow: '0 4px 20px rgba(18, 36, 24, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#122017' }}>
                Objectif d'Impact & Équilibre Financier
              </h2>
              <div style={{ fontSize: '12px', color: '#5F685F', marginTop: '2px' }}>
                Période active : {periodOptions.find((p) => p.id === selectedPeriod)?.tooltip}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#1F6338',
                  backgroundColor: '#EBF4EC',
                  border: '1px solid #DCE7DF',
                  padding: '4px 10px',
                  borderRadius: '8px',
                }}
              >
                Saison 2026
              </span>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#768278',
                  padding: '4px',
                }}
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* Donut Gauge & Metrics Side-by-Side (Fully Responsive on Small Screens) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
              padding: '6px 0',
            }}
          >
            {/* SVG Donut Progress Gauge with Agricultural Green to Gold Gradient */}
            <div
              style={{
                position: 'relative',
                width: '145px',
                height: '145px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <svg width="145" height="145" viewBox="0 0 160 160">
                <defs>
                  <linearGradient id="donutAvenir" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0E4523" />
                    <stop offset="50%" stopColor="#1F6338" />
                    <stop offset="100%" stopColor="#F2B632" />
                  </linearGradient>
                </defs>
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  fill="none"
                  stroke="#EBF4EC"
                  strokeWidth="14"
                />
                {/* Animated Value Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  fill="none"
                  stroke="url(#donutAvenir)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${(stats.progressGoalPercent / 100) * (2 * Math.PI * 64)} ${(2 * Math.PI * 64)}`}
                  transform="rotate(-90 80 80)"
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>

              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#122017', lineHeight: 1 }}>
                  {stats.progressGoalPercent}%
                </div>
                <div style={{ fontSize: '10.5px', color: '#5F685F', fontWeight: 600, marginTop: '3px' }}>
                  de la cible
                </div>
              </div>
            </div>

            {/* Financial Details Columns */}
            <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '11.5px', color: '#5F685F', fontWeight: 600 }}>
                  Valeur Économique Consolidée
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#122017', marginTop: '2px' }}>
                  {formatUsd(stats.totalRevenueUsd)}
                </div>
                <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700, marginTop: '2px' }}>
                  ↑ Marge bénéficiaire nette : {stats.averageNetMarginPercent}%
                </div>
              </div>

              {/* Income vs Expenses Mini Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  backgroundColor: '#FAF8F3',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #E8EDE8',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#5F685F' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1F6338' }} />
                    <span>Recettes</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#122017', marginTop: '3px' }}>
                    {formatUsd(stats.totalRevenueUsd)}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#5F685F' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F2B632' }} />
                    <span>Dépenses</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#122017', marginTop: '3px' }}>
                    {formatUsd(stats.totalCostUsd)}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateToTab('SIMULATIONS')}
                style={{
                  marginTop: '4px',
                  height: '38px',
                  width: '100%',
                  borderRadius: '10px',
                  backgroundColor: '#1F6338',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(31, 99, 56, 0.2)',
                }}
              >
                <span>Consulter les simulations complètes</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Middle-Right Card: Vertical Grouped Bar Chart (Recettes Forest Green vs Dépenses Gold) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #E8EDE8',
            boxShadow: '0 4px 20px rgba(18, 36, 24, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#122017' }}>
                Flux Mensuel : Recettes vs Dépenses
              </h2>
              <div style={{ fontSize: '12px', color: '#5F685F', marginTop: '2px' }}>
                Comparaison sur les 6 derniers mois de campagne (USD)
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Chart Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: 700 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#1F6338' }} />
                  <span style={{ color: '#122017' }}>Recettes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#F2B632' }} />
                  <span style={{ color: '#122017' }}>Dépenses</span>
                </div>
              </div>

              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#768278',
                  padding: '4px',
                }}
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* SVG Grouped Vertical Bar Chart */}
          <div style={{ width: '100%', height: '190px', position: 'relative', marginTop: '6px' }}>
            <svg width="100%" height="190" viewBox="0 0 440 190" preserveAspectRatio="none">
              {/* Horizontal guide lines */}
              <line x1="10" y1="30" x2="430" y2="30" stroke="#F0F4F0" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="10" y1="80" x2="430" y2="80" stroke="#F0F4F0" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="10" y1="130" x2="430" y2="130" stroke="#F0F4F0" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="10" y1="165" x2="430" y2="165" stroke="#E2E8E2" strokeWidth="1" />

              {/* 6 Monthly Pairs */}
              {stats.monthlyBars.map((bar, index) => {
                const startX = 30 + index * 66;
                const chartHeight = 135;

                const revHeight = Math.max(6, (bar.revenue / maxMonthRev) * chartHeight);
                const expHeight = Math.max(6, (bar.expense / maxMonthRev) * chartHeight);

                const revY = 165 - revHeight;
                const expY = 165 - expHeight;

                return (
                  <g key={bar.month}>
                    {/* Revenue Bar (Forest Green #1F6338) */}
                    <rect
                      x={startX}
                      y={revY}
                      width="16"
                      height={revHeight}
                      rx="4"
                      ry="4"
                      fill="#1F6338"
                      style={{ transition: 'all 0.4s ease' }}
                    >
                      <title>{`${bar.month} - Recettes: ${formatUsd(bar.revenue)}`}</title>
                    </rect>

                    {/* Expense Bar (Warm Gold #F2B632) */}
                    <rect
                      x={startX + 18}
                      y={expY}
                      width="16"
                      height={expHeight}
                      rx="4"
                      ry="4"
                      fill="#F2B632"
                      style={{ transition: 'all 0.4s ease' }}
                    >
                      <title>{`${bar.month} - Dépenses: ${formatUsd(bar.expense)}`}</title>
                    </rect>

                    {/* Month Label */}
                    <text
                      x={startX + 17}
                      y="182"
                      textAnchor="middle"
                      fill="#5F685F"
                      fontSize="11.5"
                      fontWeight="700"
                    >
                      {bar.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div
            style={{
              marginTop: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11.5px',
              color: '#5F685F',
              paddingTop: '8px',
              borderTop: '1px solid #F0F4F0',
            }}
          >
            <span>Données issues du registre des 16 exploitations pilotes</span>
            <span style={{ fontWeight: 800, color: '#15803D' }}>Solde net global : {formatUsd(stats.totalNetProfitUsd)}</span>
          </div>
        </div>
      </div>

      {/* Row 3: Bottom Two Cards (Active Simulations Table & Concentric Regional Rings) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: '20px',
        }}
      >
        {/* Bottom-Left Card: Active Simulations Table with Period Filter */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '22px',
            border: '1px solid #E8EDE8',
            boxShadow: '0 4px 20px rgba(18, 36, 24, 0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Table Header with Title & Filter Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#122017' }}>
                Simulations d'Exploitations Agricoles
              </h2>
              <div style={{ fontSize: '12px', color: '#5F685F', marginTop: '2px' }}>
                {filteredSims.length} exploitations enregistrées sur la période sélectionnée
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Quick Period Buttons inside table */}
              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: '#FAF8F3',
                  padding: '3px',
                  borderRadius: '10px',
                  border: '1px solid #DCE7DF',
                  gap: '2px',
                }}
              >
                {periodOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedPeriod(opt.id)}
                    style={{
                      padding: '4px 9px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: selectedPeriod === opt.id ? '#1F6338' : 'transparent',
                      color: selectedPeriod === opt.id ? '#FFFFFF' : '#5F685F',
                      fontSize: '11px',
                      fontWeight: selectedPeriod === opt.id ? 800 : 600,
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Search input in table */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Search size={13} color="#768278" style={{ position: 'absolute', left: '10px' }} />
                <input
                  type="text"
                  placeholder="Filtrer..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  style={{
                    height: '30px',
                    padding: '0 10px 0 28px',
                    borderRadius: '8px',
                    border: '1px solid #DCE7DF',
                    fontSize: '12px',
                    outline: 'none',
                    width: '120px',
                    backgroundColor: '#FAF8F3',
                    color: '#122017',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Simulations Table with Smooth Horizontal Overflow for Mobile */}
          {filteredSims.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#768278', fontSize: '13px' }}>
              Aucune simulation trouvée pour cette période ou ce filtre.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E8EDE8', color: '#5F685F' }}>
                    <th style={{ padding: '10px 8px', fontWeight: 700 }}>Exploitation & Filière</th>
                    <th style={{ padding: '10px 8px', fontWeight: 700 }}>Animateur Référent</th>
                    <th style={{ padding: '10px 8px', fontWeight: 700 }}>Marge & Avancement</th>
                    <th style={{ padding: '10px 8px', fontWeight: 700 }}>Ménage</th>
                    <th style={{ padding: '10px 8px', fontWeight: 700 }}>Statut</th>
                    <th style={{ padding: '10px 8px', fontWeight: 700, textAlign: 'right' }}>Date</th>
                    <th style={{ padding: '10px 8px', fontWeight: 700, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSims.slice(0, 6).map((sim) => {
                    const profit = sim.results?.netProfitUsd ?? 0;
                    const margin = Math.round(sim.results?.netProfitMarginPercent ?? 50);
                    const facilitator = FACILITATORS[sim.province || 'Kwilu'] || FACILITATORS['Kwilu'];
                    const isProfitable = profit > 0;
                    const dateFormatted = sim.createdAt
                      ? new Date(sim.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                      : '15 Nov';

                    return (
                      <tr
                        key={sim.id}
                        style={{
                          borderBottom: '1px solid #F0F4F0',
                          transition: 'background-color 0.15s',
                        }}
                      >
                        {/* 1. Name & Crop */}
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ fontWeight: 800, color: '#122017', fontSize: '13px' }}>
                            {sim.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#5F685F', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <span style={{ fontWeight: 800, color: '#1F6338' }}>{sim.shareCode}</span>
                            <span>•</span>
                            <span>{sim.cropName}</span>
                            <span>•</span>
                            <span>{sim.surfaceArea} {sim.surfaceUnit}</span>
                          </div>
                        </td>

                        {/* 2. Facilitator with Photo */}
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                              src={facilitator.avatar}
                              alt={facilitator.name}
                              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: '#122017', fontSize: '12px' }}>
                                {facilitator.name}
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#5F685F' }}>
                                📍 {sim.province}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Progress / Margin Bar */}
                        <td style={{ padding: '12px 8px', minWidth: '120px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11.5px', fontWeight: 800, color: isProfitable ? '#15803D' : '#DC2626', minWidth: '32px' }}>
                              {margin}%
                            </span>
                            <div
                              style={{
                                flex: 1,
                                height: '6px',
                                backgroundColor: '#EBF4EC',
                                borderRadius: '999px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${Math.min(100, Math.max(10, margin))}%`,
                                  backgroundColor: isProfitable ? '#1F6338' : '#DC2626',
                                  borderRadius: '999px',
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* 4. Assignee Stacked Avatars */}
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {BENEFICIARY_AVATARS.slice(0, 3).map((av, avIdx) => (
                              <img
                                key={avIdx}
                                src={av}
                                alt="Ménage"
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  border: '2px solid #FFFFFF',
                                  marginLeft: avIdx > 0 ? '-8px' : '0',
                                  objectFit: 'cover',
                                }}
                              />
                            ))}
                          </div>
                        </td>

                        {/* 5. Status Pill Tag */}
                        <td style={{ padding: '12px 8px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '999px',
                              backgroundColor: isProfitable ? '#DCFCE7' : margin > 30 ? '#FEF3C7' : '#FEE2E2',
                              color: isProfitable ? '#15803D' : margin > 30 ? '#B45309' : '#DC2626',
                            }}
                          >
                            {isProfitable ? 'Rentable' : 'À surveiller'}
                          </span>
                        </td>

                        {/* 6. Date */}
                        <td style={{ padding: '12px 8px', textAlign: 'right', color: '#5F685F', fontSize: '11.5px', fontWeight: 600 }}>
                          {dateFormatted}
                        </td>

                        {/* 7. Action Button */}
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => onOpenSimulation(sim)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#EBF4EC',
                              border: 'none',
                              color: '#1F6338',
                              fontWeight: 800,
                              cursor: 'pointer',
                              fontSize: '11.5px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <span>Ouvrir</span>
                            <ArrowUpRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          <div
            style={{
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: '1px solid #E8EDE8',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: '#5F685F',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <span>Affichage de {Math.min(6, filteredSims.length)} sur {filteredSims.length} simulations</span>
            <button
              type="button"
              onClick={() => onNavigateToTab('SIMULATIONS')}
              style={{
                background: 'none',
                border: 'none',
                color: '#1F6338',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Voir tout le registre des 16 simulations</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {/* Bottom-Right Card: Concentric Radial Rings (Forest Green, Gold, Leaf Green) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '22px',
            border: '1px solid #E8EDE8',
            boxShadow: '0 4px 20px rgba(18, 36, 24, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#122017' }}>
                Taux de Réalisation par Zone
              </h2>
              <div style={{ fontSize: '12px', color: '#5F685F', marginTop: '2px' }}>
                Progression des cibles territoriales 2026
              </div>
            </div>

            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#768278',
                padding: '4px',
              }}
            >
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Concentric Multi-Ring SVG Chart with Agricultural Colors */}
          <div
            style={{
              position: 'relative',
              width: '180px',
              height: '180px',
              margin: '8px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="180" height="180" viewBox="0 0 200 200">
              {/* Outer Ring 1: Kwilu (Forest Green #1F6338) - 86% */}
              <circle
                cx="100"
                cy="100"
                r="82"
                fill="none"
                stroke="#EBF4EC"
                strokeWidth="10"
              />
              <circle
                cx="100"
                cy="100"
                r="82"
                fill="none"
                stroke="#1F6338"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${0.86 * (2 * Math.PI * 82)} ${(2 * Math.PI * 82)}`}
                transform="rotate(-90 100 100)"
              />

              {/* Middle Ring 2: Kwango (Warm Gold #F2B632) - 72% */}
              <circle
                cx="100"
                cy="100"
                r="64"
                fill="none"
                stroke="#FEF3C7"
                strokeWidth="10"
              />
              <circle
                cx="100"
                cy="100"
                r="64"
                fill="none"
                stroke="#F2B632"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${0.72 * (2 * Math.PI * 64)} ${(2 * Math.PI * 64)}`}
                transform="rotate(-90 100 100)"
              />

              {/* Inner Ring 3: Coopératives Partenaires (Leaf Green #16A34A) - 94% */}
              <circle
                cx="100"
                cy="100"
                r="46"
                fill="none"
                stroke="#DCFCE7"
                strokeWidth="10"
              />
              <circle
                cx="100"
                cy="100"
                r="46"
                fill="none"
                stroke="#16A34A"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${0.94 * (2 * Math.PI * 46)} ${(2 * Math.PI * 46)}`}
                transform="rotate(-90 100 100)"
              />
            </svg>

            {/* Center Global Text */}
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#122017', lineHeight: 1 }}>
                {stats.progressGoalPercent}%
              </div>
              <div style={{ fontSize: '10px', color: '#5F685F', fontWeight: 600, marginTop: '2px' }}>
                Global
              </div>
            </div>
          </div>

          {/* Zones Legend Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1F6338' }} />
                <span style={{ color: '#122017', fontWeight: 700 }}>Province du Kwilu</span>
                <span style={{ fontSize: '10.5px', color: '#5F685F' }}>(Kikwit, Bulungu, Idiofa)</span>
              </div>
              <span style={{ fontWeight: 800, color: '#1F6338' }}>86%</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F2B632' }} />
                <span style={{ color: '#122017', fontWeight: 700 }}>Province du Kwango</span>
                <span style={{ fontSize: '10.5px', color: '#5F685F' }}>(Kenge, Popokabaka)</span>
              </div>
              <span style={{ fontWeight: 800, color: '#B45309' }}>72%</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
                <span style={{ color: '#122017', fontWeight: 700 }}>Organisations Paysannes</span>
                <span style={{ fontSize: '10.5px', color: '#5F685F' }}>(CAPSA, Mwinda...)</span>
              </div>
              <span style={{ fontWeight: 800, color: '#16A34A' }}>94%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
