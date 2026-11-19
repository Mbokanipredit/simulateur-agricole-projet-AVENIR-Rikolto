import React, { useState } from 'react';
import {
  Layers,
  CheckCircle,
  FileText,
  Download,
  Eye,
  Edit3,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { BOITE_A_IMAGES_DATA } from '../../toolbox/ToolboxWorkspace';

export const AdminToolboxTab: React.FC = () => {
  const [selectedImageNumber, setSelectedImageNumber] = useState<number | null>(null);
  const [filterPhase, setFilterPhase] = useState<string>('ALL');

  // Load saved team contributions from localStorage if any
  const getSavedContribs = () => {
    try {
      const saved = localStorage.getItem('avenir_boite_a_images_contribs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const contribs = getSavedContribs();

  const filtered = filterPhase === 'ALL'
    ? BOITE_A_IMAGES_DATA
    : BOITE_A_IMAGES_DATA.filter((img) => img.phaseCode === filterPhase);

  const handleExportSynthesis = () => {
    const lines = [
      'NUMERO;TITRE;PHASE;STATUT_EQUIPE;MESSAGE_PRINCIPAL;REMARQUE_TERRAIN',
      ...BOITE_A_IMAGES_DATA.map((img) => {
        const c = contribs[img.number] || {};
        return [
          img.number,
          `"${img.title}"`,
          `"${img.phaseLabel}"`,
          `"${c.status || 'Conserver'}"`,
          `"${img.mainMessage.replace(/"/g, '""')}"`,
          `"${(c.technicalPractice || c.mainMessage || '').replace(/"/g, '""')}"`,
        ].join(';');
      }),
    ];

    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Synthese_Boite_a_Images_AVENIR_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            Gestion de la Boîte à Images & Retours Terrain
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#5F685F' }}>
            Suivi des 12 planches de bande dessinée, messages pédagogiques et consolidation des contributions des animateurs Rikolto.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportSynthesis}
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
          <Download size={15} color="#FFFFFF" />
          <span>Exporter la Synthèse Terrain (CSV)</span>
        </button>
      </div>

      {/* 12 Images Status Table */}
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
          <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF8F3', borderBottom: '1px solid #E2E8E2', color: '#5F685F' }}>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>N°</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Planche & Titre</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Phase Pédagogique</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Message Clé</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Statut Terrain</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'center' }}>Aperçu</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const userContrib = contribs[item.number] || {};
                const currentStatus = userContrib.status || 'Conserver';

                return (
                  <tr
                    key={item.number}
                    style={{
                      borderBottom: '1px solid #F0F4F0',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#1F6338' }}>
                      <span
                        style={{
                          backgroundColor: '#EBF4EC',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      >
                        Image {item.number}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#122017' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: '#768278' }}>
                        Personnages : {item.characters}
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          backgroundColor: item.phaseColor,
                          color: '#FFFFFF',
                          padding: '3px 8px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 800,
                        }}
                      >
                        {item.phaseLabel}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px', color: '#18241B', maxWidth: '320px' }}>
                      <div
                        style={{
                          fontSize: '12.5px',
                          lineHeight: '17px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.mainMessage}
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          backgroundColor:
                            currentStatus === 'Modifier'
                              ? '#FEF3C7'
                              : currentStatus === 'Supprimer'
                              ? '#FEE2E2'
                              : '#DCFCE7',
                          color:
                            currentStatus === 'Modifier'
                              ? '#8C6218'
                              : currentStatus === 'Supprimer'
                              ? '#DC2626'
                              : '#15803D',
                        }}
                      >
                        {currentStatus}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedImageNumber(item.number)}
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImageNumber !== null && (
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
          {(() => {
            const img = BOITE_A_IMAGES_DATA.find((i) => i.number === selectedImageNumber);
            if (!img) return null;

            return (
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#122017' }}>
                    Image {img.number} : {img.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedImageNumber(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#5F685F' }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#EBF4EC', marginBottom: '14px' }}>
                  <img
                    src={img.imageUrl}
                    alt={img.title}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>

                <div style={{ backgroundColor: '#FFF8E6', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #F2B632', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#8C6218', textTransform: 'uppercase' }}>
                    Message Principal
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#122017', marginTop: '4px' }}>
                    {img.mainMessage}
                  </div>
                </div>

                <div style={{ fontSize: '12.5px', color: '#18241B', marginBottom: '12px', lineHeight: '18px' }}>
                  <strong>Situation :</strong> {img.situation}
                </div>

                <div style={{ fontSize: '12.5px', color: '#18241B', marginBottom: '16px', lineHeight: '18px' }}>
                  <strong>Question à poser :</strong> {img.questionToAsk}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedImageNumber(null)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '999px',
                      backgroundColor: '#1F6338',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
