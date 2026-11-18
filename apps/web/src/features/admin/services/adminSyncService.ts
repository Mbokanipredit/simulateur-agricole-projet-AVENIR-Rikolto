import axios from 'axios';
import { CropTemplateDto, SavedSimulationDto, AuthPortalUserDto } from '../../../api/generated/avenirApi';

const API_BASE = 'http://localhost:3001';

// Cache keys
const CACHE_KEYS = {
  STATS: 'avenir_admin_stats_v1',
  CROPS: 'avenir_admin_crops_v1',
  SIMULATIONS: 'avenir_admin_simulations_v1',
  USERS: 'avenir_admin_users_v1',
  SETTINGS: 'avenir_admin_settings_v1',
  CONTRIBUTIONS: 'avenir_admin_contribs_v1',
};

export interface AdminProjectSettings {
  exchangeRateCdfPerUsd: number;
  targetHouseholds: number;
  projectAntennas: { id: string; name: string; province: string; lead: string }[];
  projectTitle: string;
  donorLabel: string;
}

export const DEFAULT_SETTINGS: AdminProjectSettings = {
  exchangeRateCdfPerUsd: 2850,
  targetHouseholds: 8000,
  projectAntennas: [
    { id: 'ant-kikwit', name: 'Antenne Centrale de Kikwit', province: 'Kwilu', lead: 'Yvonne Kapinga' },
    { id: 'ant-kenge', name: 'Antenne Provinciale de Kenge', province: 'Kwango', lead: 'Jean-Paul Mbemba' },
    { id: 'ant-bulungu', name: 'Sous-antenne Territoriale Bulungu', province: 'Kwilu', lead: 'Alain Mukwa' },
    { id: 'ant-idiofa', name: 'Point d’Appui Coopératif Idiofa (CAPSA)', province: 'Kwilu', lead: 'Thérèse Nzuzi' },
  ],
  projectTitle: 'Projet AVENIR — Rikolto RDC',
  donorLabel: 'Rikolto RDC & Bailleurs de Fonds Partenaires (Kwilu & Kwango)',
};

export interface AdminStatsData {
  totalSimulations: number;
  targetHouseholds: number;
  progressGoalPercent: number;
  totalSurfaceAreaHa: number;
  totalProductionKg: number;
  totalRevenueUsd: number;
  totalCostUsd: number;
  totalNetProfitUsd: number;
  averageNetMarginPercent: number;
  countByProvince: Record<string, number>;
  countByCrop: Record<string, number>;
}

// Fallback initial data when completely offline
export const FALLBACK_ADMIN_STATS: AdminStatsData = {
  totalSimulations: 8,
  targetHouseholds: 8000,
  progressGoalPercent: 0.1,
  totalSurfaceAreaHa: 10.5,
  totalProductionKg: 23170,
  totalRevenueUsd: 24850,
  totalCostUsd: 15734,
  totalNetProfitUsd: 9116,
  averageNetMarginPercent: 36.7,
  countByProvince: { Kwilu: 5, Kwango: 3 },
  countByCrop: {
    'Café Robusta (Campagne annuelle en production)': 3,
    'Cacao (Cacaoyère villageoise durable)': 2,
    'Manioc amélioré (Cossettes / Chikwangue)': 2,
    'Maïs grain (Cycle de 4 mois)': 1,
  },
};

export const adminSyncService = {
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  },

  // 1. STATS
  async getStats(): Promise<AdminStatsData> {
    try {
      const res = await axios.get<AdminStatsData>(`${API_BASE}/api/simulations/stats`, { timeout: 3500 });
      if (res.data) {
        localStorage.setItem(CACHE_KEYS.STATS, JSON.stringify(res.data));
        return res.data;
      }
    } catch {
      // API unreachable, read cache or fallback
    }

    const cached = localStorage.getItem(CACHE_KEYS.STATS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return FALLBACK_ADMIN_STATS;
  },

  // 2. SIMULATIONS
  async getAllSimulations(): Promise<SavedSimulationDto[]> {
    try {
      const res = await axios.get<SavedSimulationDto[]>(`${API_BASE}/api/simulations/all`, { timeout: 4000 });
      if (res.data && Array.isArray(res.data)) {
        localStorage.setItem(CACHE_KEYS.SIMULATIONS, JSON.stringify(res.data));
        return res.data;
      }
    } catch {
      // fallback
    }

    const cached = localStorage.getItem(CACHE_KEYS.SIMULATIONS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return [];
  },

  async deleteSimulation(id: string): Promise<boolean> {
    try {
      await axios.delete(`${API_BASE}/api/simulations/${id}`, { timeout: 4000 });
    } catch {}

    const cached = localStorage.getItem(CACHE_KEYS.SIMULATIONS);
    if (cached) {
      try {
        const list: SavedSimulationDto[] = JSON.parse(cached);
        const filtered = list.filter((s) => s.id !== id);
        localStorage.setItem(CACHE_KEYS.SIMULATIONS, JSON.stringify(filtered));
      } catch {}
    }
    return true;
  },

  // 3. CROPS
  async getAllCrops(): Promise<CropTemplateDto[]> {
    try {
      const res = await axios.get<CropTemplateDto[]>(`${API_BASE}/api/crops`, { timeout: 4000 });
      if (res.data && Array.isArray(res.data)) {
        localStorage.setItem(CACHE_KEYS.CROPS, JSON.stringify(res.data));
        return res.data;
      }
    } catch {
      // fallback
    }

    const cached = localStorage.getItem(CACHE_KEYS.CROPS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return [];
  },

  async saveCrop(crop: Partial<CropTemplateDto>): Promise<CropTemplateDto> {
    let savedCrop: CropTemplateDto | null = null;
    try {
      if (crop.id && !crop.id.startsWith('local-')) {
        const res = await axios.put<CropTemplateDto>(`${API_BASE}/api/crops/${crop.id}`, crop, { timeout: 4000 });
        savedCrop = res.data;
      } else {
        const res = await axios.post<CropTemplateDto>(`${API_BASE}/api/crops`, crop, { timeout: 4000 });
        savedCrop = res.data;
      }
    } catch {}

    if (!savedCrop) {
      savedCrop = {
        id: crop.id || `local-crop-${Date.now()}`,
        code: crop.code || 'CROP',
        nameFr: crop.nameFr || 'Nouvelle culture',
        localName: crop.localName || null,
        category: crop.category || 'FOOD_CROP',
        icon: crop.icon || '🌱',
        descriptionFr: crop.descriptionFr || '',
        cycleDurationMonths: crop.cycleDurationMonths || 12,
        recommendedProvince: crop.recommendedProvince || 'Kwilu & Kwango',
        defaultSurfaceArea: crop.defaultSurfaceArea || 1,
        defaultSurfaceUnit: crop.defaultSurfaceUnit || 'HA',
        defaultYieldPerHa: crop.defaultYieldPerHa || 1000,
        defaultCommercialQty: crop.defaultCommercialQty || 900,
        productionUnit: crop.productionUnit || 'KG',
        unitWeightKg: crop.unitWeightKg || 1,
        defaultSalePriceUsd: crop.defaultSalePriceUsd || 1.5,
        nutritionTipFr: crop.nutritionTipFr || '',
        agronomicTipFr: crop.agronomicTipFr || '',
        isActive: crop.isActive ?? true,
        defaultExpenses: crop.defaultExpenses || [],
      } as CropTemplateDto;
    }

    // Update local cache
    const cached = localStorage.getItem(CACHE_KEYS.CROPS);
    let list: CropTemplateDto[] = cached ? JSON.parse(cached) : [];
    const index = list.findIndex((c) => c.id === savedCrop!.id || c.code === savedCrop!.code);
    if (index >= 0) {
      list[index] = savedCrop;
    } else {
      list.push(savedCrop);
    }
    localStorage.setItem(CACHE_KEYS.CROPS, JSON.stringify(list));
    return savedCrop;
  },

  async deleteCrop(id: string): Promise<boolean> {
    try {
      await axios.delete(`${API_BASE}/api/crops/${id}`, { timeout: 4000 });
    } catch {}

    const cached = localStorage.getItem(CACHE_KEYS.CROPS);
    if (cached) {
      try {
        const list: CropTemplateDto[] = JSON.parse(cached);
        const filtered = list.filter((c) => c.id !== id);
        localStorage.setItem(CACHE_KEYS.CROPS, JSON.stringify(filtered));
      } catch {}
    }
    return true;
  },

  // 4. USERS
  async getAllUsers(): Promise<AuthPortalUserDto[]> {
    try {
      const res = await axios.get<AuthPortalUserDto[]>(`${API_BASE}/api/auth-portal/users`, { timeout: 4000 });
      if (res.data && Array.isArray(res.data)) {
        localStorage.setItem(CACHE_KEYS.USERS, JSON.stringify(res.data));
        return res.data;
      }
    } catch {}

    const cached = localStorage.getItem(CACHE_KEYS.USERS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }

    return [
      {
        id: 'user-admin-1',
        name: 'Direction Projet AVENIR (Rikolto RDC)',
        email: 'admin@rikolto.org',
        role: 'ADMIN',
        organization: 'Rikolto RDC — Projet AVENIR',
        province: 'Kwilu & Kwango',
      },
      {
        id: 'user-fac-1',
        name: 'Yvonne Kapinga',
        email: 'yvonne.kapinga@rikolto.org',
        role: 'FACILITATOR',
        organization: 'Rikolto RDC — Antenne Kikwit',
        province: 'Kwilu',
      },
      {
        id: 'user-fac-2',
        name: 'Jean-Paul Mbemba',
        email: 'jeanpaul.mbemba@rikolto.org',
        role: 'FACILITATOR',
        organization: 'Rikolto RDC — Antenne Kenge',
        province: 'Kwango',
      },
    ];
  },

  async saveUser(user: Partial<AuthPortalUserDto> & { password?: string }): Promise<AuthPortalUserDto> {
    let saved: AuthPortalUserDto | null = null;
    try {
      if (user.id && !user.id.startsWith('local-')) {
        const res = await axios.put<AuthPortalUserDto>(`${API_BASE}/api/auth-portal/users/${user.id}`, user, {
          timeout: 4000,
        });
        saved = res.data;
      } else {
        const res = await axios.post<{ user?: AuthPortalUserDto }>(
          `${API_BASE}/api/auth-portal/register`,
          {
            name: user.name,
            email: user.email,
            password: user.password || 'Avenir2026!',
            province: user.province || 'Kwilu',
            role: user.role || 'FACILITATOR',
          },
          { timeout: 4000 }
        );
        if (res.data?.user) saved = res.data.user;
      }
    } catch {}

    if (!saved) {
      saved = {
        id: user.id || `local-user-${Date.now()}`,
        name: user.name || 'Nouvel utilisateur',
        email: user.email || 'user@rikolto.org',
        role: user.role || 'FACILITATOR',
        organization: user.organization || 'Rikolto RDC - Projet AVENIR',
        province: user.province || 'Kwilu',
      };
    }

    const cached = localStorage.getItem(CACHE_KEYS.USERS);
    let list: AuthPortalUserDto[] = cached ? JSON.parse(cached) : [];
    const index = list.findIndex((u) => u.id === saved!.id || u.email === saved!.email);
    if (index >= 0) {
      list[index] = saved;
    } else {
      list.push(saved);
    }
    localStorage.setItem(CACHE_KEYS.USERS, JSON.stringify(list));
    return saved;
  },

  async deleteUser(id: string): Promise<boolean> {
    try {
      await axios.delete(`${API_BASE}/api/auth-portal/users/${id}`, { timeout: 4000 });
    } catch {}

    const cached = localStorage.getItem(CACHE_KEYS.USERS);
    if (cached) {
      try {
        const list: AuthPortalUserDto[] = JSON.parse(cached);
        const filtered = list.filter((u) => u.id !== id);
        localStorage.setItem(CACHE_KEYS.USERS, JSON.stringify(filtered));
      } catch {}
    }
    return true;
  },

  // 5. SETTINGS
  getSettings(): AdminProjectSettings {
    const cached = localStorage.getItem(CACHE_KEYS.SETTINGS);
    if (cached) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
      } catch {}
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: Partial<AdminProjectSettings>): AdminProjectSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(CACHE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  clearAllCache(): void {
    Object.values(CACHE_KEYS).forEach((k) => localStorage.removeItem(k));
  },
};

