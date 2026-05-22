import { create } from 'zustand';
import { apiFetch, resolveApiUrl, AUTH_PROFILE } from '@/lib/api';

export type UserLevel = 'novice' | 'standard' | 'advanced';

const USER_LEVEL_STORAGE_KEY = 'trooba_rmct_user_level';

function readPersistedUserLevel(): UserLevel | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = sessionStorage.getItem(USER_LEVEL_STORAGE_KEY);
    if (v === 'novice' || v === 'standard' || v === 'advanced') return v;
  } catch {
    /* ignore */
  }
  return null;
}

function persistUserLevel(level: UserLevel) {
  try {
    sessionStorage.setItem(USER_LEVEL_STORAGE_KEY, level);
  } catch {
    /* ignore */
  }
}

function levelFromNumber(n: number): UserLevel {
  if (n <= 1) return 'novice';
  if (n >= 4) return 'advanced';
  return 'standard';
}

/** Map API / profile `user_level` number to app level (same rules as the backend profile). */
export function userLevelFromApiNumber(n: number): UserLevel {
  return levelFromNumber(n);
}

function numberFromLevel(level: UserLevel): number {
  if (level === 'novice') return 1;
  if (level === 'advanced') return 5;
  return 3;
}

/** All gated feature keys — the single source of truth */
export type FeatureKey =
  | 'all_operations'
  | 'advanced_parameters'
  | 'calculate_util_only'
  | 'formula_builder'
  | 'oper_details'
  | 'parameter_names'
  | 'aggregate_products'
  | 'allow_edit_whatif'
  | 'whatif_families'
  | 'max_throughput'
  | 'lot_size_range'
  | 'optimise_lot_sizes'
  | 'product_inclusion';

/**
 * Complete gating table — true means visible at that level.
 * Standard-gated: hidden for novice, visible for standard+advanced.
 * Advanced-gated: hidden for novice+standard, visible for advanced only.
 */
const GATING_TABLE: Record<FeatureKey, Record<UserLevel, boolean>> = {
  // Standard-gated (novice: hidden, standard+advanced: visible)
  all_operations:       { novice: false, standard: true, advanced: true },
  advanced_parameters:  { novice: false, standard: true, advanced: true },
  calculate_util_only:  { novice: false, standard: true, advanced: true },
  formula_builder:      { novice: false, standard: true, advanced: true },
  oper_details:         { novice: false, standard: true, advanced: true },
  parameter_names:      { novice: false, standard: true, advanced: true },

  // Advanced-gated (novice+standard: hidden, advanced only)
  aggregate_products:   { novice: false, standard: false, advanced: true },
  allow_edit_whatif:     { novice: false, standard: false, advanced: true },
  whatif_families:       { novice: false, standard: false, advanced: true },
  max_throughput:        { novice: false, standard: false, advanced: true },
  lot_size_range:        { novice: false, standard: false, advanced: true },
  optimise_lot_sizes:    { novice: false, standard: false, advanced: true },
  product_inclusion:     { novice: false, standard: false, advanced: true },
};

/** Single utility function for all feature gating — the ONLY function components should call */
export function isVisible(feature: FeatureKey, level: UserLevel): boolean {
  return GATING_TABLE[feature]?.[level] ?? false;
}

/** @deprecated Use isVisible() instead */
export function canAccess(level: UserLevel, feature: string): boolean {
  // Map old keys to new keys for backward compat during migration
  const keyMap: Record<string, FeatureKey> = {
    'all-operations': 'all_operations',
    'advanced-params': 'advanced_parameters',
    'util-only-mode': 'calculate_util_only',
    'formula-builder': 'formula_builder',
    'oper-details': 'oper_details',
    'param-names': 'parameter_names',
    'inline-change-edit': 'allow_edit_whatif',
    'whatif-families': 'whatif_families',
    'product-inclusion': 'product_inclusion',
    'max-throughput': 'max_throughput',
    'optimize-lots': 'optimise_lot_sizes',
  };
  const mapped = keyMap[feature] || (feature as FeatureKey);
  return isVisible(mapped, level);
}

interface UserLevelStore {
  userLevel: UserLevel;
  loading: boolean;
  /** Apply level from auth profile or API without a second network round-trip. */
  syncFromProfileNumber: (userLevelNum: number | undefined) => void;
  /** Clear persisted level (call on sign-out or anonymous profile). */
  clearPersistedUserLevel: () => void;
  fetchUserLevel: () => Promise<void>;
  setUserLevel: (level: UserLevel) => Promise<void>;
}

const initialUserLevel: UserLevel = readPersistedUserLevel() ?? 'standard';

export const useUserLevelStore = create<UserLevelStore>((set, get) => ({
  userLevel: initialUserLevel,
  loading: readPersistedUserLevel() == null,

  syncFromProfileNumber: (userLevelNum) => {
    const n = typeof userLevelNum === 'number' ? userLevelNum : 3;
    const level = levelFromNumber(n);
    persistUserLevel(level);
    set({ userLevel: level, loading: false });
  },

  clearPersistedUserLevel: () => {
    try {
      sessionStorage.removeItem(USER_LEVEL_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    set({ userLevel: 'standard', loading: true });
  },

  fetchUserLevel: async () => {
    try {
      const res = await fetch(resolveApiUrl(AUTH_PROFILE), { credentials: 'include' });
      if (!res.ok) {
        set({ loading: false });
        return;
      }
      const d = await res.json();
      if (!d.authenticated || d.error || !d.email) {
        set({ loading: false });
        return;
      }
      const n = typeof d.user_level === 'number' ? d.user_level : 3;
      get().syncFromProfileNumber(n);
    } catch {
      set({ loading: false });
    }
  },

  setUserLevel: async (level) => {
    const res = await apiFetch('/api/profile/patch/', {
      method: 'PATCH',
      body: JSON.stringify({ user_level: numberFromLevel(level) }),
    });
    if (res.ok) {
      persistUserLevel(level);
      set({ userLevel: level });
    }
  },
}));
