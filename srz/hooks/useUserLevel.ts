import { create } from 'zustand';
// import { apiFetch, resolveApiUrl, AUTH_PROFILE } from '@/lib/api';

export type UserLevel = 'novice' | 'standard' | 'advanced';

/** Interface level feature is disabled — treat everyone as advanced (full UI). */
const DISABLED_DEFAULT_LEVEL: UserLevel = 'advanced';

// const USER_LEVEL_STORAGE_KEY = 'trooba_rmct_user_level';

// function readPersistedUserLevel(): UserLevel | null {
//   if (typeof window === 'undefined') return null;
//   try {
//     const v = sessionStorage.getItem(USER_LEVEL_STORAGE_KEY);
//     if (v === 'novice' || v === 'standard' || v === 'advanced') return v;
//   } catch {
//     /* ignore */
//   }
//   return null;
// }

// function persistUserLevel(level: UserLevel) {
//   try {
//     sessionStorage.setItem(USER_LEVEL_STORAGE_KEY, level);
//   } catch {
//     /* ignore */
//   }
// }

// function levelFromNumber(n: number): UserLevel {
//   if (n <= 1) return 'novice';
//   if (n >= 4) return 'advanced';
//   return 'standard';
// }

/** Map API / profile `user_level` number to app level (same rules as the backend profile). */
export function userLevelFromApiNumber(_n: number): UserLevel {
  return DISABLED_DEFAULT_LEVEL;
  // return levelFromNumber(n);
}

// function numberFromLevel(level: UserLevel): number {
//   if (level === 'novice') return 1;
//   if (level === 'advanced') return 5;
//   return 3;
// }

/** All gated feature keys — kept for call sites; gating is currently disabled. */
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
 * Interface level gating — DISABLED. All features visible for all users.
 * Original gating table preserved below for future re-enable.
 */
// const GATING_TABLE: Record<FeatureKey, Record<UserLevel, boolean>> = {
//   all_operations:       { novice: false, standard: true, advanced: true },
//   advanced_parameters:  { novice: false, standard: true, advanced: true },
//   calculate_util_only:  { novice: false, standard: true, advanced: true },
//   formula_builder:      { novice: false, standard: true, advanced: true },
//   oper_details:         { novice: false, standard: true, advanced: true },
//   parameter_names:      { novice: false, standard: true, advanced: true },
//   aggregate_products:   { novice: false, standard: false, advanced: true },
//   allow_edit_whatif:     { novice: false, standard: false, advanced: true },
//   whatif_families:       { novice: false, standard: false, advanced: true },
//   max_throughput:        { novice: false, standard: false, advanced: true },
//   lot_size_range:        { novice: false, standard: false, advanced: true },
//   optimise_lot_sizes:    { novice: false, standard: false, advanced: true },
//   product_inclusion:     { novice: false, standard: false, advanced: true },
// };

export function isVisible(_feature: FeatureKey, _level?: UserLevel): boolean {
  return true;
  // return GATING_TABLE[feature]?.[level] ?? false;
}

/** @deprecated Use isVisible() instead */
export function canAccess(_level: UserLevel, _feature: string): boolean {
  return true;
}

interface UserLevelStore {
  userLevel: UserLevel;
  loading: boolean;
  syncFromProfileNumber: (userLevelNum: number | undefined) => void;
  clearPersistedUserLevel: () => void;
  fetchUserLevel: () => Promise<void>;
  setUserLevel: (level: UserLevel) => Promise<void>;
}

export const useUserLevelStore = create<UserLevelStore>((set) => ({
  userLevel: DISABLED_DEFAULT_LEVEL,
  loading: false,

  syncFromProfileNumber: () => {
    set({ userLevel: DISABLED_DEFAULT_LEVEL, loading: false });
  },

  clearPersistedUserLevel: () => {
    set({ userLevel: DISABLED_DEFAULT_LEVEL, loading: false });
  },

  fetchUserLevel: async () => {
    set({ userLevel: DISABLED_DEFAULT_LEVEL, loading: false });
  },

  setUserLevel: async (_level) => {
    // Interface level UI disabled — no profile patch.
    set({ userLevel: DISABLED_DEFAULT_LEVEL });
  },
}));
