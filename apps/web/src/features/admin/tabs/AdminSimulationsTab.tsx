import React, { useEffect, useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  Trash2,
  ArrowUpRight,
  Eye,
  X,
  CheckCircle,
  MapPin,
  Calendar,
  Users,
  Sprout,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { SavedSimulationDto } from '../../../api/generated/avenirApi';
import { adminSyncService, TimePeriodFilter, calculateFilteredStats } from '../services/adminSyncService';

interface AdminSimulationsTabProps {
  onOpenInSimulator: (sim: SavedSimulationDto) => void;
}

export const AdminSimulationsTab: React.FC<AdminSimulationsTabProps> = ({ onOpenInSimulator }) => {
  const [simulations, setSimulations] = useState<SavedSimulationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
  const [selectedCrop, setSelectedCrop] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriodFilter>('ALL');
  const [selectedSimModal, setSelectedSimModal] = useState<SavedSimulationDto | null>(null);
  const settings = adminSyncService.getSettings();

  const loadSimulations = async () => {
    setLoading(true);
    try {
      const data = await adminSyncService.getAllSimulations();
      setSimulations(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSimulations();
  }, []);

  const handleDelete = async (id: string, code: string) => {
    if (confirm(`Voulez-vous vraiment supprimer la simulation ${code} ?`)) {
      await adminSyncService.deleteSimulation(id);
      await loadSimulations();
    }
  };

  // Period stats calculated dynamically in one click
  const periodStats = useMemo(() => {
    return calculateFilteredStats(simulations, selectedPeriod);
  }, [simulations, selectedPeriod]);

  // CSV Export for Donors and Project Coordination
  const handleExportCSV = () => {
    if (simulations.length === 0) return;

    const headers = [
      'Code Partage',
      'Intitule',
      'Producteur / OP',
      'Province',
      'Culture',
      'Superficie',
      'Unite Surface',
      'Rendement Total',
      'Quantite Vendue',
      'Unite Production',
      'Prix Vente USD',
      'Recette Brute USD',
      'Total Depenses USD',
      'Benefice Net USD',
      'Seuil Rentabilite KG',
      'Date Creation',
    ];

    const rows = simulations.map((s) => {
      const res = s.results || {};
      return [
        `"${s.shareCode}"`,
        `"${s.title.replace(/"/g, '""')}"`,
        `"${(s.producerName || '').replace(/"/g, '""')}"`,
        `"${s.province}"`,
        `"${s.cropName}"`,
        s.surfaceArea,
        s.surfaceUnit,
        s.expectedYieldTotal,
        s.commercializedQty,
        s.productionUnit,
        s.unitSalePriceUsd,
        res.grossRevenueUsd || 0,
        res.totalExpensesUsd || 0,
        res.netProfitUsd || 0,
        res.breakevenProductionQty || 0,
        `"${s.createdAt || ''}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rapport_Simulations_Projet_AVENIR_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered List with Period, Search, Province, and Crop
  const filteredSimulations = useMemo(() => {
    const now = new Date('2026-11-18T20:00:00.000Z').getTime();
    return simulations.filter((s) => {
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

      const matchesSearch =
        s.shareCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.producerName && s.producerName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesProvince = selectedProvince === 'ALL' || s.province === selectedProvince;
      const matchesCrop = selectedCrop === 'ALL' || s.cropCode === selectedCrop;

      return matchesSearch && matchesProvince && matchesCrop;
    });
  }, [simulations, selectedPeriod, searchTerm, selectedProvince, selectedCrop]);

  const formatUsd = (val?: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const periodOptions: { id: TimePeriodFilter; label: string; tooltip: string }[] = [
    { id: '7D', label: '1S', tooltip: 'Derniers 7 jours (1 semaine)' },
    { id: '30D', label: '1M', tooltip: 'Derniers 30 jours (1 mois)' },
    { id: '3M', label: '3M', tooltip: 'Saison A (Trimestre récent)' },
    { id: '6M', label: '6M', tooltip: 'Semestre (Campagne 6 mois)' },
    { id: '1Y', label: '1A', tooltip: 'Année 2026 complète' },
    { id: 'ALL', label: 'Tout', tooltip: 'Toutes les simulations enregistrées' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          backgroundColor: '#FFFFFF',
          padding: '20px 24px',
          borderRadius: '18px',
          border: '1px solid #EEF2F6',
          boxShadow: '0 4px 18px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#122017' }}>
            Registre Centralisé des Simulations Terrain
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#5F685F' }}>
            Consultez, analysez et filtrez périodiquement les comptes d'exploitation chiffrés par les animateurs et ménages.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={simulations.length === 0}
          style={{
            height: '40px',
            padding: '0 18px',
            borderRadius: '10px',
            backgroundColor: '#1F6338',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: simulations.length === 0 ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(31, 99, 56, 0.25)',
          }}
        >
          <Download size={15} color="#FFFFFF" />
          <span>Exporter en CSV (Excel & Bailleurs)</span>
        </button>
      </div>

      {/* Dynamic Period Results Ribbon - Calculates results for the given period in one click */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          gap: '12px',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '14px 16px',
            border: '1px solid #E8EDE8',
            boxShadow: '0 2px 10px rgba(18, 36, 24, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5F685F', fontWeight: 700, textTransform: 'uppercase' }}>
            <Users size={13} color="#1F6338" />
            <span>Ménages Période</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#122017', marginTop: '4px' }}>
            {periodStats.totalHouseholds} <span style={{ fontSize: '12px', color: '#768278' }}>bénéficiaires</span>
          </div>
          <div style={{ fontSize: '11px', color: '#1F6338', marginTop: '2px', fontWeight: 700 }}>
            {periodStats.totalSimulations} simulations actives
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '14px 16px',
            border: '1px solid #E8EDE8',
            boxShadow: '0 2px 10px rgba(18, 36, 24, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5F685F', fontWeight: 700, textTransform: 'uppercase' }}>
            <Sprout size={13} color="#16A34A" />
            <span>Superficie & Récolte</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#122017', marginTop: '4px' }}>
            {periodStats.totalSurfaceAreaHa} <span style={{ fontSize: '12px', color: '#768278' }}>hectares</span>
          </div>
          <div style={{ fontSize: '11px', color: '#16A34A', marginTop: '2px', fontWeight: 700 }}>
            🌾 {periodStats.totalProductionKg.toLocaleString('fr-FR')} kg attendus
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '14px 16px',
            border: '1px solid #E8EDE8',
            boxShadow: '0 2px 10px rgba(18, 36, 24, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5F685F', fontWeight: 700, textTransform: 'uppercase' }}>
            <DollarSign size={13} color="#D97706" />
            <span>Recettes Période</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#122017', marginTop: '4px' }}>
            {formatUsd(periodStats.totalRevenueUsd)}
          </div>
          <div style={{ fontSize: '11px', color: '#D97706', marginTop: '2px', fontWeight: 600 }}>
            Coûts : {formatUsd(periodStats.totalCostUsd)}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '14px 16px',
            border: '1px solid #E8EDE8',
            boxShadow: '0 2px 10px rgba(18, 36, 24, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5F685F', fontWeight: 700, textTransform: 'uppercase' }}>
            <TrendingUp size={13} color="#15803D" />
            <span>Bénéfice Net Global</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803D', marginTop: '4px' }}>
            {formatUsd(periodStats.totalNetProfitUsd)}
          </div>
          <div style={{ fontSize: '11px', color: '#15803D', marginTop: '2px', fontWeight: 700 }}>
            Marge moyenne : {periodStats.averageNetMarginPercent}%
          </div>
        </div>
      </div>

      {/* Filter Bar with Period Pills + Search + Dropdowns */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '16px 20px',
          border: '1px solid #E8EDE8',
          boxShadow: '0 4px 18px rgba(18, 36, 24, 0.02)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Periodic Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#5F685F' }}>Période :</span>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#FAF8F3',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid #DCE7DF',
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
                    padding: '5px 12px',
                    borderRadius: '7px',
                    border: 'none',
                    backgroundColor: active ? '#1F6338' : 'transparent',
                    color: active ? '#FFFFFF' : '#5F685F',
                    fontSize: '12px',
                    fontWeight: active ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: '240px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par code, nom..."
              style={{
                width: '100%',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '0 12px 0 32px',
                fontSize: '12.5px',
                backgroundColor: '#F8FAFC',
                color: '#0F172A',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
          </div>

          {/* Dropdown Filters */}
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            style={{
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              padding: '0 10px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#0F172A',
              outline: 'none',
            }}
          >
            <option value="ALL">Toutes les provinces</option>
            <option value="Kwilu">Kwilu (Kikwit, Bulungu, Idiofa)</option>
            <option value="Kwango">Kwango (Kenge, Popokabaka)</option>
          </select>

          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            style={{
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              padding: '0 10px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#0F172A',
              outline: 'none',
            }}
          >
            <option value="ALL">Toutes les filières</option>
            <option value="CAFE_ROBUSTA">Café Robusta</option>
            <option value="CACAO">Cacao</option>
            <option value="MANIOC">Manioc amélioré</option>
            <option value="MAIS">Maïs grain</option>
            <option value="ARACHIDE_NIEBE">Arachide / Niébé</option>
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #EEF2F6',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #EEF2F6', color: '#64748B' }}>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Code</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Exploitation & Producteur</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Province</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Filière</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Superficie</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>Recette Brute</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>Dépenses</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>Bénéfice Net</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSimulations.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: '#768278' }}>
                    Aucune simulation ne correspond à vos filtres.
                  </td>
                </tr>
              ) : (
                filteredSimulations.map((sim) => {
                  const res = sim.results || {};
                  const rev = res.grossRevenueUsd || 0;
                  const exp = res.totalExpensesUsd || 0;
                  const net = res.netProfitUsd || (rev - exp);

                  return (
                    <tr
                      key={sim.id}
                      style={{
                        borderBottom: '1px solid #F0F4F0',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            backgroundColor: '#EBF4EC',
                            color: '#1F6338',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                          }}
                        >
                          {sim.shareCode}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#122017' }}>{sim.title}</div>
                        <div style={{ fontSize: '11px', color: '#768278' }}>{sim.producerName}</div>
                      </td>

                      <td style={{ padding: '12px 14px', color: '#122017' }}>
                        📍 {sim.province}
                      </td>

                      <td style={{ padding: '12px 14px', color: '#122017', fontWeight: 600 }}>
                        {sim.cropName}
                      </td>

                      <td style={{ padding: '12px 14px', color: '#5F685F' }}>
                        {sim.surfaceArea} {sim.surfaceUnit}
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#122017' }}>
                        {formatUsd(rev)}
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#8C6218', fontWeight: 600 }}>
                        {formatUsd(exp)}
                      </td>

                      <td
                        style={{
                          padding: '12px 14px',
                          textAlign: 'right',
                          fontWeight: 800,
                          color: net >= 0 ? '#15803D' : '#DC2626',
                        }}
                      >
                        {net >= 0 ? `+${formatUsd(net)}` : formatUsd(net)}
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            title="Voir le compte de résultat détaillé"
                            onClick={() => setSelectedSimModal(sim)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#1F6338',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            title="Ouvrir dans le simulateur public"
                            onClick={() => onOpenInSimulator(sim)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#8C6218',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                          >
                            <ArrowUpRight size={16} />
                          </button>

                          <button
                            type="button"
                            title="Supprimer la simulation"
                            onClick={() => handleDelete(sim.id, sim.shareCode)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#DC2626',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Economic Balance Modal */}
      {selectedSimModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 1200,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '14px',
                borderBottom: '1px solid #E2E8E2',
                marginBottom: '16px',
              }}
            >
              <div>
                <span
                  style={{
                    backgroundColor: '#EBF4EC',
                    color: '#1F6338',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  {selectedSimModal.shareCode}
                </span>
                <h2 style={{ margin: '6px 0 0', fontSize: '18px', fontWeight: 800, color: '#122017' }}>
                  {selectedSimModal.title}
                </h2>
                <div style={{ fontSize: '12px', color: '#768278' }}>
                  {selectedSimModal.producerName} • Province de {selectedSimModal.province}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSimModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} color="#5F685F" />
              </button>
            </div>

            {/* Account Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              <div style={{ backgroundColor: '#FAF8F3', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#768278' }}>Recette Brute</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1F6338', marginTop: '2px' }}>
                  {formatUsd(selectedSimModal.results?.grossRevenueUsd)}
                </div>
              </div>

              <div style={{ backgroundColor: '#FAF8F3', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#768278' }}>Total Dépenses</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#8C6218', marginTop: '2px' }}>
                  {formatUsd(selectedSimModal.results?.totalExpensesUsd)}
                </div>
              </div>

              <div style={{ backgroundColor: '#FAF8F3', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#768278' }}>Bénéfice Net</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>
                  {formatUsd(selectedSimModal.results?.netProfitUsd)}
                </div>
              </div>
            </div>

            {/* Agronomic Technical Breakdown */}
            <div
              style={{
                backgroundColor: '#F3FAF5',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #D5EBD9',
                marginBottom: '16px',
                fontSize: '12.5px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                gap: '8px',
              }}
            >
              <div>Superficie : <strong>{selectedSimModal.surfaceArea} {selectedSimModal.surfaceUnit}</strong></div>
              <div>Récolte totale : <strong>{selectedSimModal.expectedYieldTotal} {selectedSimModal.productionUnit}</strong></div>
              <div>Quantité commercialisée : <strong>{selectedSimModal.commercializedQty} {selectedSimModal.productionUnit}</strong></div>
              <div>Prix unitaire : <strong>${selectedSimModal.unitSalePriceUsd} / {selectedSimModal.productionUnit}</strong></div>
              <div>Seuil de rentabilité : <strong>{selectedSimModal.results?.breakevenProductionQty} {selectedSimModal.productionUnit}</strong></div>
              <div>Coût de revient : <strong>${selectedSimModal.results?.costPerProductionUnitUsd} / {selectedSimModal.productionUnit}</strong></div>
            </div>

            {/* Expenses List */}
            <h4 style={{ margin: '0 0 10px', fontSize: '13.5px', fontWeight: 800, color: '#122017' }}>
              Détail des Dépenses Réalisées ({selectedSimModal.expenses?.length || 0} postes)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
              {(selectedSimModal.expenses || []).map((exp, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    backgroundColor: '#FAF8F3',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                >
                  <span style={{ color: '#18241B' }}>{exp.label} ({exp.quantity} {exp.unit} à ${exp.unitCostUsd})</span>
                  <span style={{ fontWeight: 800, color: '#8C6218' }}>${(exp.quantity * exp.unitCostUsd).toFixed(1)}</span>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedSimModal(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '999px',
                  backgroundColor: '#FAF8F3',
                  border: '1px solid #D5DDD5',
                  color: '#5F685F',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                }}
              >
                Fermer
              </button>

              <button
                type="button"
                onClick={() => {
                  const s = selectedSimModal;
                  setSelectedSimModal(null);
                  onOpenInSimulator(s);
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '999px',
                  backgroundColor: '#1F6338',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Ouvrir dans le simulateur public →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

