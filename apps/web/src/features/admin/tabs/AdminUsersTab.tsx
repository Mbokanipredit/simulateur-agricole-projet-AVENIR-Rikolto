import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Mail,
  MapPin,
  Trash2,
  Edit2,
  CheckCircle,
  X,
  Save,
} from 'lucide-react';
import { AuthPortalUserDto } from '../../../api/generated/avenirApi';
import { adminSyncService } from '../services/adminSyncService';

export const AdminUsersTab: React.FC = () => {
  const [users, setUsers] = useState<AuthPortalUserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<AuthPortalUserDto> & { password?: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await adminSyncService.getAllUsers();
      setUsers(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateNew = () => {
    setEditingUser({
      name: '',
      email: '',
      password: 'Avenir2026!',
      role: 'FACILITATOR',
      organization: 'Rikolto RDC — Projet AVENIR',
      province: 'Kwilu',
    });
    setStatusMessage(null);
  };

  const handleEdit = (u: AuthPortalUserDto) => {
    setEditingUser({ ...u });
    setStatusMessage(null);
  };

  const handleSaveUser = async () => {
    if (!editingUser || !editingUser.name || !editingUser.email) return;
    try {
      await adminSyncService.saveUser(editingUser);
      setStatusMessage('Utilisateur enregistré avec succès !');
      setEditingUser(null);
      await loadUsers();
    } catch {
      setStatusMessage('Erreur lors de l’enregistrement de l’utilisateur.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Confirmez-vous la suppression de "${name}" ?`)) {
      await adminSyncService.deleteUser(id);
      await loadUsers();
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
            Annuaire des Animateurs & Équipe Projet
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#5F685F' }}>
            Gestion des accès sécurisés pour les équipes Rikolto, animateurs de terrain au Kwilu et Kwango, et responsables d’OP.
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
          <UserPlus size={16} color="#FFFFFF" />
          <span>Ajouter un animateur / utilisateur</span>
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

      {/* Users Table */}
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
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Nom & Prénom</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Adresse Email</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Rôle</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Province d'affectation</th>
                <th style={{ padding: '12px 14px', fontWeight: 800 }}>Organisation</th>
                <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isAdmin = u.role === 'ADMIN';
                const isFac = u.role === 'FACILITATOR';

                return (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: '1px solid #F0F4F0',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 800, color: '#122017' }}>{u.name}</div>
                    </td>

                    <td style={{ padding: '12px 14px', color: '#5F685F' }}>
                      {u.email}
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: isAdmin ? '#FEF3C7' : isFac ? '#DCFCE7' : '#E0F2FE',
                          color: isAdmin ? '#8C6218' : isFac ? '#15803D' : '#475569',
                        }}
                      >
                        {isAdmin ? 'Direction ADMIN' : isFac ? 'Animateur Terrain' : 'Responsable OP'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px', color: '#122017' }}>
                      {u.province}
                    </td>

                    <td style={{ padding: '12px 14px', color: '#5F685F' }}>
                      {u.organization || 'Rikolto RDC'}
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleEdit(u)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#1F6338',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                        >
                          <Edit2 size={15} />
                        </button>

                        {u.email !== 'admin@rikolto.org' && (
                          <button
                            type="button"
                            onClick={() => handleDelete(u.id, u.name)}
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
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit User Modal */}
      {editingUser && (
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
              maxWidth: '520px',
              width: '100%',
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
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#122017' }}>
                {editingUser.id ? 'Modifier l’Utilisateur' : 'Créer un Nouvel Utilisateur'}
              </h2>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#5F685F' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122017', marginBottom: '4px' }}>
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  placeholder="Jean-Paul Mbemba"
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #D5DDD5', padding: '0 10px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122017', marginBottom: '4px' }}>
                  Adresse email
                </label>
                <input
                  type="email"
                  required
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="jeanpaul.mbemba@rikolto.org"
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #D5DDD5', padding: '0 10px', fontSize: '13px' }}
                />
              </div>

              {!editingUser.id && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122017', marginBottom: '4px' }}>
                    Mot de passe initial
                  </label>
                  <input
                    type="password"
                    value={editingUser.password || 'Avenir2026!'}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #D5DDD5', padding: '0 10px', fontSize: '13px' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122017', marginBottom: '4px' }}>
                  Rôle sur la plateforme
                </label>
                <select
                  value={editingUser.role || 'FACILITATOR'}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #D5DDD5', padding: '0 10px', fontSize: '13px' }}
                >
                  <option value="FACILITATOR">Animateur Terrain (Facilitateur)</option>
                  <option value="ADMIN">Direction & Administrateur Rikolto</option>
                  <option value="PRODUCER">Responsable d'Organisation Paysanne (OP)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122017', marginBottom: '4px' }}>
                  Province d'affectation
                </label>
                <select
                  value={editingUser.province || 'Kwilu'}
                  onChange={(e) => setEditingUser({ ...editingUser, province: e.target.value })}
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #D5DDD5', padding: '0 10px', fontSize: '13px' }}
                >
                  <option value="Kwilu">Kwilu (Kikwit, Bulungu, Idiofa)</option>
                  <option value="Kwango">Kwango (Kenge, Popokabaka)</option>
                  <option value="Kwilu & Kwango">Kwilu & Kwango (Coordination)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#122017', marginBottom: '4px' }}>
                  Organisation / Antenne
                </label>
                <input
                  type="text"
                  value={editingUser.organization || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, organization: e.target.value })}
                  placeholder="Rikolto RDC — Antenne Kikwit"
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid #D5DDD5', padding: '0 10px', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
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
                Annuler
              </button>

              <button
                type="button"
                onClick={handleSaveUser}
                style={{
                  padding: '8px 20px',
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
                <Save size={14} color="#FFFFFF" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

