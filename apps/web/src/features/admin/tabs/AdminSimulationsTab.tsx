import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { SavedSimulationDto } from '../../../api/generated/avenirApi';
import { adminSyncService } from '../services/adminSyncService';

interface AdminSimulationsTabProps {
  onOpenInSimulator: (sim: SavedSimulationDto) => void;
}

export const AdminSimulationsTab: React.FC<AdminSimulationsTabProps> = ({ onOpenInSimulator }) => {
  const [simulations, setSimulations] = useState<SavedSimulationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
  const [selectedCrop, setSelectedCrop] = useState<string>('ALL');
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

  // Filtered List
  const filteredSimulations = simulations.filter((s) => {
    const matchesSearch =
      s.shareCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.producerName && s.producerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesProvince = selectedProvince === 'ALL' || s.province === selectedProvince;
    const matchesCrop = selectedCrop === 'ALL' || s.cropCode === selectedCrop;

    return matchesSearch && matchesProvince && matchesCrop;
  });

  const formatUsd = (val?: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

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
          padding: '18px 22px',
          borderRadius: '16px',
          border: '1px solid #E2E8E2',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#122017' }}>
            Registre Centralisé des Simulations Terrain
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#5F685F' }}>
            Consultez, analysez et exportez les comptes d'exploitation chiffrés par les animateurs et ménages au Kwilu et Kwango.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={simulations.length === 0}
          style={{
            height: '42px',
            padding: '0 18px',
            borderRadius: '999px',
            backgroundColor: '#1F6338',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '13px',
            fontWeight: 800,
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

      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '14px 18px',
          border: '1px solid #E2E8E2',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par code (ex: AVN-2026), producteur..."
            style={{
              width: '100%',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #D5DDD5',
              padding: '0 12px 0 34px',
              fontSize: '13px',
              backgroundColor: '#FAF8F3',
              boxSizing: 'border-box',
            }}
          />
          <Search size={15} color="#768278" style={{ position: 'absolute', left: '11px', top: '12px' }} />
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            style={{
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #D5DDD5',
              backgroundColor: '#FAF8F3',
              padding: '0 12px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#18241B',
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
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #D5DDD5',
              backgroundColor: '#FAF8F3',
              padding: '0 12px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#18241B',
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
          borderRadius: '16px',
          border: '1px solid #E2E8E2',
          overflow: 'hidden',
          boxShadow: '0 6px 18px rgba(18, 36, 24, 0.04)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF8F3', borderBottom: '1px solid #E2E8E2', color: '#5F685F' }}>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Code</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Exploitation & Ménage</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Province</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Filière</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Superficie</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'right' }}>Recette Brute</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'right' }}>Dépenses</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'right' }}>Bénéfice Net</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'center' }}>Actions</th>
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
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              <div style={{ backgroundColor: '#FAF8F3', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#768278' }}>Recette Brute</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0369A1', marginTop: '2px' }}>
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
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}
            >
              <div>🌾 Superficie : <strong>{selectedSimModal.surfaceArea} {selectedSimModal.surfaceUnit}</strong></div>
              <div>⚖️ Récolte totale : <strong>{selectedSimModal.expectedYieldTotal} {selectedSimModal.productionUnit}</strong></div>
              <div>📦 Quantité commercialisée : <strong>{selectedSimModal.commercializedQty} {selectedSimModal.productionUnit}</strong></div>
              <div>💲 Prix unitaire : <strong>${selectedSimModal.unitSalePriceUsd} / {selectedSimModal.productionUnit}</strong></div>
              <div>🎯 Seuil de rentabilité : <strong>{selectedSimModal.results?.breakevenProductionQty} {selectedSimModal.productionUnit}</strong></div>
              <div>📉 Coût de revient unitaire : <strong>${selectedSimModal.results?.costPerProductionUnitUsd} / {selectedSimModal.productionUnit}</strong></div>
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

