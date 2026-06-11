import type {
  EquipmentGroup,
  LaborGroup,
  Model,
  Operation,
  Product,
  RoutingEntry,
} from '@/stores/modelStore';
import {
  normalizeProductOperations,
  productOperationsNeedDockCleanup,
} from '@/lib/productOperations';
const OP_PATCH_KEYS: (keyof Operation)[] = [
  'op_name', 'op_number', 'equip_id', 'pct_assigned',
  'equip_setup_lot', 'equip_setup_piece', 'equip_setup_tbatch', 'equip_run_piece', 'equip_run_lot', 'equip_run_tbatch',
  'labor_setup_lot', 'labor_setup_piece', 'labor_setup_tbatch', 'labor_run_piece', 'labor_run_lot', 'labor_run_tbatch',
  'oper1', 'oper2', 'oper3', 'oper4',
];

function buildOperationPatch(prev: Operation, next: Operation): Partial<Operation> | null {
  const patch: Partial<Operation> = {};
  for (const k of OP_PATCH_KEYS) {
    if (prev[k] !== next[k]) (patch as Record<string, unknown>)[k as string] = next[k];
  }
  return Object.keys(patch).length > 0 ? patch : null;
}

export function cloneProductDraftFromModel(
  model: Model,
  productId: string,
): { ops: Operation[]; routing: RoutingEntry[] } {
  const ops = normalizeProductOperations(
    (model.operations ?? [])
      .filter((o) => o.product_id === productId && o.op_name !== 'STOCK' && o.op_name !== 'SCRAP')
      .map((o) => ({ ...o })),
  ).sort((a, b) => a.op_number - b.op_number);
  const routing = (model.routing ?? []).filter((r) => r.product_id === productId).map((r) => ({ ...r }));
  return { ops, routing };
}

function routingKey(r: Pick<RoutingEntry, 'from_op_name' | 'to_op_name' | 'pct_routed'>): string {
  return `${r.from_op_name}\0${r.to_op_name}\0${r.pct_routed}`;
}

export function routingEntriesEqual(a: RoutingEntry[], b: RoutingEntry[]): boolean {
  if (a.length !== b.length) return false;
  const keysA = a.map(routingKey).sort();
  const keysB = b.map(routingKey).sort();
  return keysA.every((k, i) => k === keysB[i]);
}

/** Payload for PUT routing/set (server replaces all routes for one product). */
export function routingEntriesForSave(
  productId: string,
  draftRouting: RoutingEntry[],
): Pick<RoutingEntry, 'from_op_name' | 'to_op_name' | 'pct_routed'>[] {
  return draftRouting
    .filter((r) => String(r.product_id) === String(productId))
    .map((r) => ({
      from_op_name: String(r.from_op_name ?? '').trim(),
      to_op_name: String(r.to_op_name ?? '').trim(),
      pct_routed: Number(r.pct_routed) || 0,
    }))
    .filter((r) => r.from_op_name && r.to_op_name);
}

function listIdsChanged<T>(saved: T[], draft: T[], getId: (row: T) => string): boolean {
  const savedIds = new Set(saved.map(getId));
  const draftIds = new Set(draft.map(getId));
  if (saved.length !== draft.length) return true;
  for (const id of draftIds) {
    if (!savedIds.has(id)) return true;
  }
  for (const id of savedIds) {
    if (!draftIds.has(id)) return true;
  }
  return false;
}

const PRODUCT_KEYS: (keyof Product)[] = [
  'name', 'demand', 'lot_size', 'tbatch_size', 'demand_factor', 'lot_factor', 'var_factor',
  'setup_factor', 'make_to_stock', 'gather_tbatches', 'dept_code', 'prod1', 'prod2', 'prod3', 'prod4', 'comments',
];

const LABOR_KEYS: (keyof LaborGroup)[] = [
  'name', 'count', 'overtime_pct', 'unavail_pct', 'dept_code', 'prioritize_use',
  'setup_factor', 'run_factor', 'var_factor', 'lab1', 'lab2', 'lab3', 'lab4', 'comments',
];

const EQUIPMENT_KEYS: (keyof EquipmentGroup)[] = [
  'name', 'equip_type', 'count', 'mttf', 'mttr', 'overtime_pct', 'labor_group_id', 'dept_code',
  'out_of_area', 'unavail_pct', 'setup_factor', 'run_factor', 'var_factor', 'eq1', 'eq2', 'eq3', 'eq4', 'comments',
];

const GENERAL_KEYS: (keyof Model['general'])[] = [
  'model_title', 'ops_time_unit', 'mct_time_unit', 'prod_period_unit', 'conv1', 'conv2',
  'util_limit', 'var_equip', 'var_labor', 'var_prod', 'gen1', 'gen2', 'gen3', 'gen4', 'author', 'comments',
];

function rowFieldsDirty<T>(saved: T | undefined, draft: T, keys: (keyof T)[]): boolean {
  if (!saved) return true;
  for (const k of keys) {
    if (saved[k] !== draft[k]) return true;
  }
  return false;
}

/** Products: full draft vs server (page edit mode). */
export function productsDraftDirty(model: Model, draft: Product[]): boolean {
  if (listIdsChanged(model.products ?? [], draft, (p) => p.id)) return true;
  const byId = new Map((model.products ?? []).map((p) => [p.id, p]));
  for (const d of draft) {
    if (rowFieldsDirty(byId.get(d.id), d, PRODUCT_KEYS)) return true;
  }
  return false;
}

/** Labor: full draft vs server. */
export function laborDraftDirty(model: Model, draft: LaborGroup[]): boolean {
  if (listIdsChanged(model.labor ?? [], draft, (l) => l.id)) return true;
  const byId = new Map((model.labor ?? []).map((l) => [l.id, l]));
  for (const d of draft) {
    if (rowFieldsDirty(byId.get(d.id), d, LABOR_KEYS)) return true;
  }
  return false;
}

/** Equipment: full draft vs server. */
export function equipmentDraftDirty(model: Model, draft: EquipmentGroup[]): boolean {
  if (listIdsChanged(model.equipment ?? [], draft, (e) => e.id)) return true;
  const byId = new Map((model.equipment ?? []).map((e) => [e.id, e]));
  for (const d of draft) {
    if (rowFieldsDirty(byId.get(d.id), d, EQUIPMENT_KEYS)) return true;
  }
  return false;
}

/** General tab draft vs server. */
export function generalDraftDirty(model: Model, draft: Model['general']): boolean {
  return rowFieldsDirty(model.general, draft, GENERAL_KEYS);
}

/** Products: Save needed for add/delete/copy only (cell edits auto-save). */
export function productsNeedSave(model: Model, draft: Product[]): boolean {
  return productsDraftDirty(model, draft);
}

/** Labor groups: Save needed for add/delete only. */
export function laborNeedSave(model: Model, draft: LaborGroup[]): boolean {
  return laborDraftDirty(model, draft);
}

/** Equipment groups: Save needed for add/delete only. */
export function equipmentNeedSave(model: Model, draft: EquipmentGroup[]): boolean {
  return equipmentDraftDirty(model, draft);
}

/**
 * Operations & routing: Save needed when ops/routing differ from the server model.
 * Operation field edits auto-save via collab; routing add/update/delete stays draft until Save.
 */
export type IbomDraftRow = {
  id: string;
  component_product_id: string;
  units_per_assy: number;
};

export function ibomProductDraftDirty(
  model: Model,
  parentProductId: string,
  draft: IbomDraftRow[],
): boolean {
  const server = (model.ibom ?? []).filter((e) => e.parent_product_id === parentProductId);
  if (listIdsChanged(server, draft, (e) => e.id)) return true;
  const byId = new Map(server.map((e) => [e.id, e]));
  for (const d of draft) {
    const s = byId.get(d.id);
    if (!s) return true;
    if (
      s.component_product_id !== d.component_product_id
      || s.units_per_assy !== d.units_per_assy
    ) {
      return true;
    }
  }
  return false;
}

export function operationsNeedSave(
  model: Model,
  productId: string,
  draftOps: Operation[],
  draftRouting: RoutingEntry[],
): boolean {
  if (!productId) return false;

  const draftNorm = normalizeProductOperations(draftOps.map((o) => ({ ...o })));
  const rawServerOps = (model.operations ?? []).filter(
    (o) => o.product_id === productId && o.op_name !== 'STOCK' && o.op_name !== 'SCRAP',
  );
  if (productOperationsNeedDockCleanup(rawServerOps)) return true;

  const saved = cloneProductDraftFromModel(model, productId);
  if (listIdsChanged(saved.ops, draftNorm, (o) => o.id)) return true;

  for (const d of draftNorm) {
    const modelOp = (model.operations ?? []).find((o) => o.id === d.id);
    if (!modelOp) return true;
    if (buildOperationPatch(modelOp, d)) return true;
  }

  const modelRouting = (model.routing ?? []).filter((r) => r.product_id === productId);
  if (!routingEntriesEqual(modelRouting, draftRouting)) return true;

  return false;
}
