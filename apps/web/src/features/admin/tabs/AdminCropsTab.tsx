import React, { useEffect, useState } from 'react';
import {
  Sprout,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Clock,
  Layers,
  MapPin,
  X,
  Save,
} from 'lucide-react';
import { CropTemplateDto, CropExpenseTemplateDto } from '../../../api/generated/avenirApi';
import { adminSyncService } from '../services/adminSyncService';

export const AdminCropsTab: React.FC = () => {
  const [crops, setCrops] = useState<CropTemplateDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropTemplateDto | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadCrops = async () => {
    setLoading(true);
    try {
      const data = await adminSyncService.getAllCrops();
      setCrops(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrops();
  }, []);

  const handleEdit = (crop: CropTemplateDto) => {
    setEditingCrop(JSON.parse(JSON.stringify(crop)));
    setIsNew(false);
    setStatusMessage(null);
  };

  const handleCreateNew = () => {
    const newCrop: CropTemplateDto = {
      id: `local-${Date.now()}`,
      code: 'NOUVELLE_CULTURE',
      nameFr: 'Nouvelle Spéculation',
      localName: '',
      category: 'FOOD_CROP',
      icon: '🌱',
      descriptionFr: 'Description de la filière pour le Kwilu et Kwango.',
      cycleDurationMonths: 6,
      recommendedProvince: 'Kwilu & Kwango',
      defaultSurfaceArea: 1,
      defaultSurfaceUnit: 'HA',
      defaultYieldPerHa: 1000,
      defaultCommercialQty: 900,
      productionUnit: 'KG',
      unitWeightKg: 1,
      defaultSalePriceUsd: 1.0,
      nutritionTipFr: 'Recommandation nutritionnelle pour le ménage.',
      agronomicTipFr: 'Bonnes pratiques agricoles recommandées par Rikolto.',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      defaultExpenses: [
        {
          id: 'exp-1',
          cropTemplateId: '',
          stage: 'LAND_PREP',
          label: 'Défrichage et préparation du sol',
          unit: 'H/J',
          quantity: 25,
          unitCostUsd: 3.0,
          costType: 'FIXED',
          sortOrder: 1,
        },
        {
          id: 'exp-2',
          cropTemplateId: '',
          stage: 'SEEDS',
          label: 'Semences ou boutures améliorées',
          unit: 'Kg',
          quantity: 25,
          unitCostUsd: 2.0,
          costType: 'VARIABLE',
          sortOrder: 2,
        },
        {
          id: 'exp-3',
          cropTemplateId: '',
          stage: 'MAINTENANCE',
          label: 'Sarclage et entretien cultural',
          unit: 'H/J',
          quantity: 30,
          unitCostUsd: 3.0,
          costType: 'VARIABLE',
          sortOrder: 3,
        },
        {
          id: 'exp-4',
          cropTemplateId: '',
          stage: 'HARVEST',
          label: 'Récolte, tri et séchage',
          unit: 'H/J',
          quantity: 25,
          unitCostUsd: 3.0,
          costType: 'VARIABLE',
          sortOrder: 4,
        },
      ],
    };
    setEditingCrop(newCrop);
    setIsNew(true);
    setStatusMessage(null);
  };

  const handleSaveCrop = async () => {
    if (!editingCrop) return;
    try {
      await adminSyncService.saveCrop(editingCrop);
      setStatusMessage('Filière et coûts technico-économiques enregistrés avec succès !');
      setEditingCrop(null);
      await loadCrops();
    } catch {
      setStatusMessage('Erreur lors de l’enregistrement de la culture.');
    }
  };

  const handleDeleteCrop = async (id: string, name: string) => {
    if (confirm(`Confirmez-vous la suppression de la filière "${name}" ?`)) {
      await adminSyncService.deleteCrop(id);
      await loadCrops();
    }
  };

  // Helper calculation for total expenses
  const calculateTotalCost = (expenses: CropExpenseTemplateDto[]) => {
    return (expenses || []).reduce((sum, e) => sum + (Number(e.quantity) || 0) * (Number(e.unitCostUsd) || 0), 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Action Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          padding: '18px 22px',
          borderRadius: '16px',
          border: '1px solid #E2E8E2',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#122017' }}>
            Référentiels Technico-Économiques des Cultures
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#5F685F' }}>
            Paramétrez les prix bord-champ indicatifs, rendements cibles et les 8 étapes de dépenses de référence pour le Kwilu et le Kwango.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          style={{
            height: '42px',
            padding: '0 18px',
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
          <Plus size={16} color="#FFFFFF" />
          <span>Ajouter une filière / culture</span>
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

      {/* Crops Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))',
          gap: '18px',
        }}
      >
        {crops.map((crop) => {
          const totalCost = calculateTotalCost(crop.defaultExpenses || []);
          const grossRev = (crop.defaultCommercialQty || 0) * (crop.defaultSalePriceUsd || 0);
          const netEst = grossRev - totalCost;

          return (
            <div
              key={crop.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                border: '1px solid #E2E8E2',
                padding: '20px',
                boxShadow: '0 6px 18px rgba(18, 36, 24, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Header: Icon, Name, Category */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        backgroundColor: '#EBF4EC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                      }}
                    >
                      {crop.icon || '🌱'}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#122017' }}>
                        {crop.nameFr}
                      </div>
                      <div style={{ fontSize: '12px', color: '#768278' }}>
                        Code : <span style={{ fontWeight: 700, color: '#1F6338' }}>{crop.code}</span>
                        {crop.localName ? ` • ${crop.localName}` : ''}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '999px',
                      backgroundColor: crop.category === 'PERENNIAL' ? '#FEF3C7' : '#DCFCE7',
                      color: crop.category === 'PERENNIAL' ? '#8C6218' : '#15803D',
                    }}
                  >
                    {crop.category === 'PERENNIAL' ? 'Pérenne' : 'Vivrière'}
                  </span>
                </div>

                <p
                  style={{
                    margin: '12px 0',
                    fontSize: '13px',
                    color: '#5F685F',
                    lineHeight: '19px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {crop.descriptionFr}
                </p>

                {/* Key Metrics Strip */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    backgroundColor: '#FAF8F3',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #EAE6DD',
                    fontSize: '12px',
                  }}
                >
                  <div>
                    <span style={{ color: '#768278' }}>Rendement moyen :</span>
                    <div style={{ fontWeight: 800, color: '#122017' }}>
                      {crop.defaultYieldPerHa} {crop.productionUnit} / ha
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#768278' }}>Prix indicatif :</span>
                    <div style={{ fontWeight: 800, color: '#1F6338' }}>
                      ${crop.defaultSalePriceUsd} / {crop.productionUnit}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#768278' }}>Durée du cycle :</span>
                    <div style={{ fontWeight: 800, color: '#122017' }}>
                      {crop.cycleDurationMonths} mois
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#768278' }}>Zone cible :</span>
                    <div style={{ fontWeight: 800, color: '#122017' }}>
                      📍 {crop.recommendedProvince}
                    </div>
                  </div>
                </div>

                {/* Economic Baseline Estimate */}
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    backgroundColor: '#F3FAF5',
                    borderRadius: '10px',
                    border: '1px solid #D5EBD9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12.5px',
                  }}
                >
                  <div>
                    <span style={{ color: '#5F685F' }}>Coût standard (8 étapes) :</span>{' '}
                    <span style={{ fontWeight: 800, color: '#8C6218' }}>${totalCost.toFixed(0)}</span>
                  </div>
                  <div>
                    <span style={{ color: '#5F685F' }}>Bénéfice net est. :</span>{' '}
                    <span style={{ fontWeight: 800, color: netEst >= 0 ? '#15803D' : '#DC2626' }}>
                      +${netEst.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid #F0F4F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleEdit(crop)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#1F6338',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Edit2 size={13} color="#FFFFFF" />
                  <span>Modifier les coûts & étapes</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteCrop(crop.id, crop.nameFr)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    border: '1px solid #FECACA',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Trash2 size={13} color="#DC2626" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Modal */}
      {editingCrop && (
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
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              boxSizing: 'border-box',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '16px',
                borderBottom: '1px solid #E2E8E2',
                marginBottom: '18px',
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#122017' }}>
                  {isNew ? 'Créer une Nouvelle Filière' : `Modifier la Culture : ${editingCrop.nameFr}`}
                </h2>
                <div style={{ fontSize: '12px', color: '#5F685F', marginTop: '2px' }}>
                  Paramétrage agronomique et barème des 8 étapes de dépenses
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingCrop(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} color="#5F685F" />
              </button>
            </div>

            {/* General Information Form */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                marginBottom: '20px',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122017', marginBottom: '4px' }}>
                  Intitulé de la culture (FR)
                </label>
                <input
                  type="text"
                  value={editingCrop.nameFr}
                  onChange={(e) => setEditingCrop({ ...editingCrop, nameFr: e.target.value })}
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #D5DDD5', padding: '0 10px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122017', marginBottom: '4px' }}>
                  Nom local (Lingala / Kikongo)
                </label>
                <input
                  type="text"
                  value={editingCrop.localName || ''}
                  onChange={(e) => setEditingCrop({ ...editingCrop, localName: e.target.value })}
                  placeholder="ex: Kawa / Songi"
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #D5DDD5', padding: '0 10px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122017', marginBottom: '4px' }}>
                  Rendement moyen / ha (kg)
                </label>
                <input
                  type="number"
                  value={editingCrop.defaultYieldPerHa}
                  onChange={(e) => setEditingCrop({ ...editingCrop, defaultYieldPerHa: Number(e.target.value) })}
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #D5DDD5', padding: '0 10px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122017', marginBottom: '4px' }}>
                  Prix de vente moyen (USD/kg)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={editingCrop.defaultSalePriceUsd}
                  onChange={(e) => setEditingCrop({ ...editingCrop, defaultSalePriceUsd: Number(e.target.value) })}
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #D5DDD5', padding: '0 10px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122017', marginBottom: '4px' }}>
                  Province recommandée
                </label>
                <select
                  value={editingCrop.recommendedProvince}
                  onChange={(e) => setEditingCrop({ ...editingCrop, recommendedProvince: e.target.value })}
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #D5DDD5', padding: '0 10px', fontSize: '13px' }}
                >
                  <option value="Kwilu & Kwango">Kwilu & Kwango</option>
                  <option value="Kwilu">Kwilu uniquement</option>
                  <option value="Kwango">Kwango uniquement</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122017', marginBottom: '4px' }}>
                  Durée du cycle (mois)
                </label>
                <input
                  type="number"
                  value={editingCrop.cycleDurationMonths}
                  onChange={(e) => setEditingCrop({ ...editingCrop, cycleDurationMonths: Number(e.target.value) })}
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #D5DDD5', padding: '0 10px', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Expenses List Editor */}
            <div style={{ marginTop: '16px', borderTop: '1px solid #E2E8E2', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#122017' }}>
                  Barème des Dépenses par Défaut (8 Étapes de la Campagne)
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    const newExpenses = [
                      ...(editingCrop.defaultExpenses || []),
                      {
                        id: `exp-${Date.now()}`,
                        cropTemplateId: editingCrop.id,
                        stage: 'MAINTENANCE',
                        label: 'Nouvelle dépense',
                        unit: 'H/J',
                        quantity: 1,
                        unitCostUsd: 3.5,
                        costType: 'VARIABLE',
                        sortOrder: (editingCrop.defaultExpenses?.length || 0) + 1,
                      },
                    ];
                    setEditingCrop({ ...editingCrop, defaultExpenses: newExpenses });
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#EBF4EC',
                    color: '#1F6338',
                    border: '1px solid #C6DEC6',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + Ajouter une ligne de dépense
                </button>
              </div>

              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '6px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '560px' }}>
                  {(editingCrop.defaultExpenses || []).map((exp, idx) => (
                  <div
                    key={exp.id || idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '130px 1.8fr 80px 70px 80px 30px',
                      gap: '8px',
                      alignItems: 'center',
                      backgroundColor: '#FAF8F3',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  >
                    <select
                      value={exp.stage}
                      onChange={(e) => {
                        const updated = [...(editingCrop.defaultExpenses || [])];
                        updated[idx].stage = e.target.value;
                        setEditingCrop({ ...editingCrop, defaultExpenses: updated });
                      }}
                      style={{ height: '32px', borderRadius: '6px', border: '1px solid #D5DDD5', fontSize: '11.5px' }}
                    >
                      <option value="LAND_PREP">1. Préparation</option>
                      <option value="SEEDS">2. Semences</option>
                      <option value="PLANTING">3. Plantation</option>
                      <option value="MAINTENANCE">4. Entretien</option>
                      <option value="INPUTS">5. Intrants</option>
                      <option value="LABOR">6. Main-d'œuvre</option>
                      <option value="HARVEST">7. Récolte</option>
                      <option value="LOGISTICS">8. Logistique</option>
                    </select>

                    <input
                      type="text"
                      value={exp.label}
                      onChange={(e) => {
                        const updated = [...(editingCrop.defaultExpenses || [])];
                        updated[idx].label = e.target.value;
                        setEditingCrop({ ...editingCrop, defaultExpenses: updated });
                      }}
                      style={{ height: '32px', borderRadius: '6px', border: '1px solid #D5DDD5', padding: '0 8px', fontSize: '12px' }}
                    />

                    <input
                      type="text"
                      value={exp.unit}
                      placeholder="Unité"
                      onChange={(e) => {
                        const updated = [...(editingCrop.defaultExpenses || [])];
                        updated[idx].unit = e.target.value;
                        setEditingCrop({ ...editingCrop, defaultExpenses: updated });
                      }}
                      style={{ height: '32px', borderRadius: '6px', border: '1px solid #D5DDD5', padding: '0 6px', fontSize: '12px' }}
                    />

                    <input
                      type="number"
                      value={exp.quantity}
                      placeholder="Qté"
                      onChange={(e) => {
                        const updated = [...(editingCrop.defaultExpenses || [])];
                        updated[idx].quantity = Number(e.target.value);
                        setEditingCrop({ ...editingCrop, defaultExpenses: updated });
                      }}
                      style={{ height: '32px', borderRadius: '6px', border: '1px solid #D5DDD5', padding: '0 6px', fontSize: '12px' }}
                    />

                    <input
                      type="number"
                      step="0.1"
                      value={exp.unitCostUsd}
                      placeholder="Coût USD"
                      onChange={(e) => {
                        const updated = [...(editingCrop.defaultExpenses || [])];
                        updated[idx].unitCostUsd = Number(e.target.value);
                        setEditingCrop({ ...editingCrop, defaultExpenses: updated });
                      }}
                      style={{ height: '32px', borderRadius: '6px', border: '1px solid #D5DDD5', padding: '0 6px', fontSize: '12px' }}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const updated = (editingCrop.defaultExpenses || []).filter((_, i) => i !== idx);
                        setEditingCrop({ ...editingCrop, defaultExpenses: updated });
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setEditingCrop(null)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '999px',
                  backgroundColor: '#FAF8F3',
                  border: '1px solid #D5DDD5',
                  color: '#5F685F',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleSaveCrop}
                style={{
                  padding: '10px 22px',
                  borderRadius: '999px',
                  backgroundColor: '#1F6338',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Save size={15} color="#FFFFFF" />
                <span>Enregistrer la filière</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

