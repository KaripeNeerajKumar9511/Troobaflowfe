import type { Model } from '@/stores/modelStore';
import type { MasterCatalog, RmctMasterNames } from './types';

export function buildMasterCatalog(model: Model): MasterCatalog {
  const norm = (s: string) => normalizeKey(s);
  return {
    products: new Set(model.products.map((p) => norm(p.name))),
    equipment: new Set(model.equipment.map((e) => norm(e.name))),
    laborGroups: new Set(model.labor.map((l) => norm(l.name))),
  };
}

export function getRmctMasterNames(model: Model): RmctMasterNames {
  return {
    products: model.products.map((p) => p.name).sort((a, b) => a.localeCompare(b)),
    equipment: model.equipment.map((e) => e.name).sort((a, b) => a.localeCompare(b)),
    laborGroups: model.labor.map((l) => l.name).sort((a, b) => a.localeCompare(b)),
  };
}

export function normalizeKey(value: string): string {
  return value.trim().toUpperCase();
}

export function isInCatalog(catalog: Set<string>, value: string): boolean {
  return catalog.has(normalizeKey(value));
}
