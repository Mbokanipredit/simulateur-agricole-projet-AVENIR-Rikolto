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

// Facilitators metadata for realistic humanized representation
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Banner / Strategy Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '4px 2px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#2563EB',
                backgroundColor: '#EFF6FF',
                padding: '3px 10px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
              }}
            >
              Suivi-Évaluation (M&E) · Rikolto RDC
            </span>
            <span style={{ fontSize: '12px', color: '#64748B' }}>•</span>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
              Campagne Agricole Kwilu & Kwango 2026
            </span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(20px, 3.2vw, 26px)',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.3px',
            }}
          >
            Tableau de Bord Stratégique & Impact
          </h1>
        </div>

        {/* Action Controls & Global Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Periodic Filter Pills Selector */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              padding: '4px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
              gap: '2px',
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
                    backgroundColor: active ? '#2563EB' : 'transparent',
                    color: active ? '#FFFFFF' : '#64748B',
                    fontSize: '12.5px',
                    fontWeight: active ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
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
              height: '38px',
              padding: '0 14px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#334155',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} color="#2563EB" />
            <span>{loading ? 'Calcul...' : 'Actualiser'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToTab('SIMULATIONS')}
            style={{
              height: '38px',
              padding: '0 16px',
              borderRadius: '10px',
              backgroundColor: '#2563EB',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            }}
          >
            <Download size={13} color="#FFFFFF" />
            <span>Rapport d'Impact</span>
          </button>
        </div>
      </div>

      {/* Row 1: The 4 Top Metric Wave Cards (Panda SaaS Style) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
          gap: '16px',
        }}
      >
        {/* Card 1: Households & Beneficiaries */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 18px rgba(15, 23, 42, 0.03)',
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
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={18} color="#2563EB" />
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#2563EB',
                backgroundColor: '#EFF6FF',
                padding: '3px 9px',
                borderRadius: '999px',
              }}
            >
              {stats.progressGoalPercent}% objectif
            </span>
          </div>

          {/* Smooth Sine Wave Curve with Midpoint Data Dot */}
          <div style={{ margin: '8px -20px 4px -20px', height: '54px', position: 'relative' }}>
            <svg width="100%" height="54" viewBox="0 0 280 54" preserveAspectRatio="none" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="waveBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <path
                d="M 0 34 C 45 10, 85 48, 140 26 C 195 5, 235 44, 280 18 L 280 54 L 0 54 Z"
                fill="url(#waveBlue)"
              />
              <path
                d="M 0 34 C 45 10, 85 48, 140 26 C 195 5, 235 44, 280 18"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Highlight Circle Dot at Midpoint Peak */}
              <circle cx="140" cy="26" r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
            </svg>
          </div>

          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
              {stats.totalHouseholds.toLocaleString('fr-FR')}{' '}
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>/ 8 000</span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
              Ménages accompagnés (Kwilu & Kwango)
            </div>
          </div>
        </div>

        {/* Card 2: Surface & Crop Volume */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 18px rgba(15, 23, 42, 0.03)',
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
              <Sprout size={18} color="#10B981" />
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#10B981',
                backgroundColor: '#ECFDF5',
                padding: '3px 9px',
                borderRadius: '999px',
              }}
            >
              {stats.totalSurfaceAreaHa} ha simulés
            </span>
          </div>

          {/* Smooth Sine Wave Curve (Green) */}
          <div style={{ margin: '8px -20px 4px -20px', height: '54px', position: 'relative' }}>
            <svg width="100%" height="54" viewBox="0 0 280 54" preserveAspectRatio="none" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="waveGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <path
                d="M 0 30 C 50 48, 90 12, 140 24 C 190 38, 230 10, 280 28 L 280 54 L 0 54 Z"
                fill="url(#waveGreen)"
              />
              <path
                d="M 0 30 C 50 48, 90 12, 140 24 C 190 38, 230 10, 280 28"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="140" cy="24" r="4.5" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" />
            </svg>
          </div>

          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
              {stats.totalProductionKg.toLocaleString('fr-FR')}{' '}
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>kg</span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
              Volume de récolte totale estimée
            </div>
          </div>
        </div>

        {/* Card 3: Gross Economic Value */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 18px rgba(15, 23, 42, 0.03)',
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
                fontWeight: 700,
                color: '#D97706',
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
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="140" cy="20" r="4.5" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2.5" />
            </svg>
          </div>

          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
              {formatUsd(stats.totalRevenueUsd)}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
              ≈ {formatCdf(stats.totalRevenueUsd)}
            </div>
          </div>
        </div>

        {/* Card 4: Net Profit & Margin */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '20px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 18px rgba(15, 23, 42, 0.03)',
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
                backgroundColor: '#F3E8FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={18} color="#8B5CF6" />
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#8B5CF6',
                backgroundColor: '#F3E8FF',
                padding: '3px 9px',
                borderRadius: '999px',
              }}
            >
              Marge {stats.averageNetMarginPercent}%
            </span>
          </div>

          {/* Smooth Sine Wave Curve (Violet) */}
          <div style={{ margin: '8px -20px 4px -20px', height: '54px', position: 'relative' }}>
            <svg width="100%" height="54" viewBox="0 0 280 54" preserveAspectRatio="none" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="waveViolet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <path
                d="M 0 32 C 40 45, 85 15, 140 28 C 190 40, 235 12, 280 22 L 280 54 L 0 54 Z"
                fill="url(#waveViolet)"
              />
              <path
                d="M 0 32 C 40 45, 85 15, 140 28 C 190 40, 235 12, 280 22"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="140" cy="28" r="4.5" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="2.5" />
            </svg>
          </div>

          <div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
              {formatUsd(stats.totalNetProfitUsd)}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
              Bénéfice net global après 8 étapes
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Two Middle Cards (Panda "Invoice Overview" & "Revenue" Bar Chart) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
          gap: '20px',
        }}
      >
        {/* Middle-Left Card: Donut Circular Progress + Financial Breakdown */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                Objectif d'Impact & Équilibre Financier
              </h2>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Période active : {periodOptions.find((p) => p.id === selectedPeriod)?.tooltip}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#64748B',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
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
                  color: '#94A3B8',
                  padding: '4px',
                }}
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* Donut Gauge & Metrics Side-by-Side */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px',
              padding: '8px 0',
            }}
          >
            {/* SVG Donut Progress Gauge */}
            <div
              style={{
                position: 'relative',
                width: '150px',
                height: '150px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <svg width="150" height="150" viewBox="0 0 160 160">
                <defs>
                  <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="14"
                />
                {/* Animated Value Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  fill="none"
                  stroke="url(#donutGradient)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${(stats.progressGoalPercent / 100) * (2 * Math.PI * 64)} ${(2 * Math.PI * 64)}`}
                  transform="rotate(-90 80 80)"
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>

              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {stats.progressGoalPercent}%
                </div>
                <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, marginTop: '3px' }}>
                  de l'objectif
                </div>
              </div>
            </div>

            {/* Financial Details Columns */}
            <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                  Valeur Économique Consolidée
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                  {formatUsd(stats.totalRevenueUsd)}
                </div>
                <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>
                  ↑ Marge bénéficiaire nette : {stats.averageNetMarginPercent}%
                </div>
              </div>

              {/* Income vs Expenses Mini Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  backgroundColor: '#F8FAFC',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748B' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
                    <span>Recettes</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '3px' }}>
                    {formatUsd(stats.totalRevenueUsd)}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748B' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                    <span>Dépenses</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '3px' }}>
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
                  backgroundColor: '#2563EB',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                }}
              >
                <span>Consulter les simulations complètes</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Middle-Right Card: Vertical Grouped Bar Chart (Recettes vs Dépenses) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                Flux Mensuel : Recettes vs Dépenses
              </h2>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Comparaison sur les 6 derniers mois de campagne (USD)
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Chart Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: 700 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#2563EB' }} />
                  <span style={{ color: '#475569' }}>Recettes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#F59E0B' }} />
                  <span style={{ color: '#475569' }}>Dépenses</span>
                </div>
              </div>

              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  padding: '4px',
                }}
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* SVG Grouped Vertical Bar Chart */}
          <div style={{ width: '100%', height: '190px', position: 'relative', marginTop: '10px' }}>
            <svg width="100%" height="190" viewBox="0 0 440 190" preserveAspectRatio="none">
              {/* Horizontal guide lines */}
              <line x1="10" y1="30" x2="430" y2="30" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="10" y1="80" x2="430" y2="80" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="10" y1="130" x2="430" y2="130" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="10" y1="165" x2="430" y2="165" stroke="#E2E8F0" strokeWidth="1" />

              {/* 6 Monthly Pairs */}
              {stats.monthlyBars.map((bar, index) => {
                const groupWidth = 60;
                const startX = 30 + index * 66;
                const chartHeight = 135;

                // Scale bar heights proportionally
                const revHeight = Math.max(6, (bar.revenue / maxMonthRev) * chartHeight);
                const expHeight = Math.max(6, (bar.expense / maxMonthRev) * chartHeight);

                const revY = 165 - revHeight;
                const expY = 165 - expHeight;

                return (
                  <g key={bar.month}>
                    {/* Revenue Bar (Blue) */}
                    <rect
                      x={startX}
                      y={revY}
                      width="16"
                      height={revHeight}
                      rx="4"
                      ry="4"
                      fill="#2563EB"
                      style={{ transition: 'all 0.4s ease' }}
                    >
                      <title>{`${bar.month} - Recettes: ${formatUsd(bar.revenue)}`}</title>
                    </rect>

                    {/* Expense Bar (Yellow/Amber) */}
                    <rect
                      x={startX + 18}
                      y={expY}
                      width="16"
                      height={expHeight}
                      rx="4"
                      ry="4"
                      fill="#F59E0B"
                      style={{ transition: 'all 0.4s ease' }}
                    >
                      <title>{`${bar.month} - Dépenses: ${formatUsd(bar.expense)}`}</title>
                    </rect>

                    {/* Month Label */}
                    <text
                      x={startX + 17}
                      y="182"
                      textAnchor="middle"
                      fill="#64748B"
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
              color: '#64748B',
              paddingTop: '8px',
              borderTop: '1px solid #F1F5F9',
            }}
          >
            <span>Données issues du registre des 16 exploitations pilotes</span>
            <span style={{ fontWeight: 700, color: '#10B981' }}>Solde net global : {formatUsd(stats.totalNetProfitUsd)}</span>
          </div>
        </div>
      </div>

      {/* Row 3: Bottom Two Cards (Panda "Active Projects" Table + "Current Statistic" Concentric Rings) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)',
          gap: '20px',
        }}
      >
        {/* Bottom-Left Card: Active Simulations Table with Period Filter */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
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
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                Simulations d'Exploitations Agricoles
              </h2>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                {filteredSims.length} exploitations enregistrées sur la période sélectionnée
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Quick Period Buttons inside table */}
              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: '#F8FAFC',
                  padding: '3px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  gap: '2px',
                }}
              >
                {periodOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedPeriod(opt.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: selectedPeriod === opt.id ? '#2563EB' : 'transparent',
                      color: selectedPeriod === opt.id ? '#FFFFFF' : '#64748B',
                      fontSize: '11.5px',
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
                <Search size={13} color="#94A3B8" style={{ position: 'absolute', left: '10px' }} />
                <input
                  type="text"
                  placeholder="Filtrer..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  style={{
                    height: '32px',
                    padding: '0 10px 0 28px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    outline: 'none',
                    width: '130px',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </div>

              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  padding: '4px',
                }}
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* Simulations Table */}
          {filteredSims.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#94A3B8', fontSize: '13px' }}>
              Aucune simulation trouvée pour cette période ou ce filtre.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
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
                  {filteredSims.slice(0, 7).map((sim, idx) => {
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
                          borderBottom: '1px solid #F1F5F9',
                          transition: 'background-color 0.15s',
                        }}
                      >
                        {/* 1. Name & Crop */}
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '13px' }}>
                            {sim.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <span style={{ fontWeight: 700, color: '#2563EB' }}>{sim.shareCode}</span>
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
                              <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '12px' }}>
                                {facilitator.name}
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                                📍 {sim.province}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Progress / Margin Bar */}
                        <td style={{ padding: '12px 8px', minWidth: '130px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11.5px', fontWeight: 800, color: isProfitable ? '#10B981' : '#EF4444', minWidth: '32px' }}>
                              {margin}%
                            </span>
                            <div
                              style={{
                                flex: 1,
                                height: '6px',
                                backgroundColor: '#F1F5F9',
                                borderRadius: '999px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${Math.min(100, Math.max(10, margin))}%`,
                                  backgroundColor: isProfitable ? '#2563EB' : '#EF4444',
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
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '999px',
                              backgroundColor: isProfitable ? '#ECFDF5' : margin > 30 ? '#FEF3C7' : '#FEF2F2',
                              color: isProfitable ? '#10B981' : margin > 30 ? '#D97706' : '#EF4444',
                            }}
                          >
                            {isProfitable ? 'Rentable' : 'À surveiller'}
                          </span>
                        </td>

                        {/* 6. Date */}
                        <td style={{ padding: '12px 8px', textAlign: 'right', color: '#64748B', fontSize: '11.5px', fontWeight: 600 }}>
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
                              backgroundColor: '#EFF6FF',
                              border: 'none',
                              color: '#2563EB',
                              fontWeight: 700,
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
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: '#64748B',
            }}
          >
            <span>Affichage de {Math.min(7, filteredSims.length)} sur {filteredSims.length} simulations</span>
            <button
              type="button"
              onClick={() => onNavigateToTab('SIMULATIONS')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563EB',
                fontWeight: 700,
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

        {/* Bottom-Right Card: Concentric Radial Rings (Panda "Current Statistic") */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #EEF2F6',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                Taux de Réalisation par Zone
              </h2>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Progression des cibles territoriales 2026
              </div>
            </div>

            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                padding: '4px',
              }}
            >
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Concentric Multi-Ring SVG Chart */}
          <div
            style={{
              position: 'relative',
              width: '180px',
              height: '180px',
              margin: '10px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="180" height="180" viewBox="0 0 200 200">
              {/* Outer Ring 1: Kwilu (Blue) - 86% */}
              <circle
                cx="100"
                cy="100"
                r="82"
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="10"
              />
              <circle
                cx="100"
                cy="100"
                r="82"
                fill="none"
                stroke="#2563EB"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${0.86 * (2 * Math.PI * 82)} ${(2 * Math.PI * 82)}`}
                transform="rotate(-90 100 100)"
              />

              {/* Middle Ring 2: Kwango (Amber) - 72% */}
              <circle
                cx="100"
                cy="100"
                r="64"
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="10"
              />
              <circle
                cx="100"
                cy="100"
                r="64"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${0.72 * (2 * Math.PI * 64)} ${(2 * Math.PI * 64)}`}
                transform="rotate(-90 100 100)"
              />

              {/* Inner Ring 3: Coopératives Partenaires (Emerald) - 94% */}
              <circle
                cx="100"
                cy="100"
                r="46"
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="10"
              />
              <circle
                cx="100"
                cy="100"
                r="46"
                fill="none"
                stroke="#10B981"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${0.94 * (2 * Math.PI * 46)} ${(2 * Math.PI * 46)}`}
                transform="rotate(-90 100 100)"
              />
            </svg>

            {/* Center Global Text */}
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                {stats.progressGoalPercent}%
              </div>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
                Global
              </div>
            </div>
          </div>

          {/* Zones Legend Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
                <span style={{ color: '#0F172A', fontWeight: 700 }}>Province du Kwilu</span>
                <span style={{ fontSize: '10.5px', color: '#64748B' }}>(Kikwit, Bulungu, Idiofa)</span>
              </div>
              <span style={{ fontWeight: 800, color: '#2563EB' }}>86%</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <span style={{ color: '#0F172A', fontWeight: 700 }}>Province du Kwango</span>
                <span style={{ fontSize: '10.5px', color: '#64748B' }}>(Kenge, Popokabaka)</span>
              </div>
              <span style={{ fontWeight: 800, color: '#F59E0B' }}>72%</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                <span style={{ color: '#0F172A', fontWeight: 700 }}>Organisations Paysannes</span>
                <span style={{ fontSize: '10.5px', color: '#64748B' }}>(CAPSA, Mwinda...)</span>
              </div>
              <span style={{ fontWeight: 800, color: '#10B981' }}>94%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
