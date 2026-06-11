/** Shared in-memory cache so all useDeptCodes hooks for one model stay in sync. */

export type DeptCodeSection = 'labor' | 'equipment' | 'product';

export interface DeptCode {
  id: string;
  model_id: string;
  value: string;
  is_default: boolean;
  section: DeptCodeSection;
}

export type Catalog = Record<string, DeptCode[]>;

type Listener = () => void;

const catalogs = new Map<string, Catalog>();
const listeners = new Map<string, Set<Listener>>();

function notify(modelId: string) {
  listeners.get(modelId)?.forEach((fn) => fn());
}

export function getCatalog(modelId: string): Catalog | undefined {
  return catalogs.get(modelId);
}

export function setCatalog(modelId: string, catalog: Catalog) {
  catalogs.set(modelId, catalog);
  notify(modelId);
}

export function subscribe(modelId: string, listener: Listener): () => void {
  if (!listeners.has(modelId)) listeners.set(modelId, new Set());
  listeners.get(modelId)!.add(listener);
  return () => listeners.get(modelId)?.delete(listener);
}
