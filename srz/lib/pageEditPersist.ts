import { db } from '@/lib/supabaseData';
import type {
  EquipmentGroup,
  GeneralData,
  LaborGroup,
  Model,
  Operation,
  Product,
  RoutingEntry,
} from '@/stores/modelStore';
import { routingEntriesForSave } from '@/lib/draftDirty';
import { normalizeProductOperations } from '@/lib/productOperations';

const PRODUCT_KEYS: (keyof Product)[] = [
  'name',
  'demand',
  'lot_size',
  'tbatch_size',
  'demand_factor',
  'lot_factor',
  'var_factor',
  'setup_factor',
  'make_to_stock',
  'gather_tbatches',
  'dept_code',
  'prod1',
  'prod2',
  'prod3',
  'prod4',
  'comments',
];

const LABOR_KEYS: (keyof LaborGroup)[] = [
  'name',
  'count',
  'overtime_pct',
  'unavail_pct',
  'dept_code',
  'prioritize_use',
  'setup_factor',
  'run_factor',
  'var_factor',
  'lab1',
  'lab2',
  'lab3',
  'lab4',
  'comments',
];

const EQUIPMENT_KEYS: (keyof EquipmentGroup)[] = [
  'name',
  'equip_type',
  'count',
  'mttf',
  'mttr',
  'overtime_pct',
  'labor_group_id',
  'dept_code',
  'out_of_area',
  'unavail_pct',
  'setup_factor',
  'run_factor',
  'var_factor',
  'eq1',
  'eq2',
  'eq3',
  'eq4',
  'comments',
];

const OP_PATCH_KEYS: (keyof Operation)[] = [
  'op_name',
  'op_number',
  'equip_id',
  'pct_assigned',
  'equip_setup_lot',
  'equip_setup_piece',
  'equip_setup_tbatch',
  'equip_run_piece',
  'equip_run_lot',
  'equip_run_tbatch',
  'labor_setup_lot',
  'labor_setup_piece',
  'labor_setup_tbatch',
  'labor_run_piece',
  'labor_run_lot',
  'labor_run_tbatch',
  'oper1',
  'oper2',
  'oper3',
  'oper4',
];

function buildPatch<T extends object>(
  prev: T,
  next: T,
  keys: (keyof T)[],
): Partial<T> | null {
  const patch: Partial<T> = {};
  for (const k of keys) {
    if (prev[k] !== next[k]) (patch as Record<string, unknown>)[k as string] = next[k];
  }
  return Object.keys(patch).length > 0 ? patch : null;
}

export async function persistProductsDraft(modelId: string, draft: Product[], baseline: Model) {
  const server = baseline.products ?? [];
  const serverById = new Map(server.map((p) => [p.id, p]));
  const draftIds = new Set(draft.map((p) => p.id));

  for (const p of draft) {
    if (!serverById.has(p.id)) await db.insertProduct(modelId, p);
  }
  for (const p of draft) {
    const prev = serverById.get(p.id);
    if (!prev) continue;
    const patch = buildPatch(prev, p, PRODUCT_KEYS);
    if (patch) await db.updateProduct(modelId, p.id, patch);
  }
  for (const s of server) {
    if (!draftIds.has(s.id)) await db.deleteProduct(modelId, s.id);
  }
  await db.updateModel(modelId, { run_status: 'needs_recalc' });
}

export async function persistLaborDraft(modelId: string, draft: LaborGroup[], baseline: Model) {
  const server = baseline.labor ?? [];
  const serverById = new Map(server.map((l) => [l.id, l]));
  const draftIds = new Set(draft.map((l) => l.id));

  for (const l of draft) {
    if (!serverById.has(l.id)) await db.insertLabor(modelId, l);
  }
  for (const l of draft) {
    const prev = serverById.get(l.id);
    if (!prev) continue;
    const patch = buildPatch(prev, l, LABOR_KEYS);
    if (patch) await db.updateLabor(modelId, l.id, patch);
  }
  for (const s of server) {
    if (!draftIds.has(s.id)) await db.deleteLabor(modelId, s.id);
  }
  await db.updateModel(modelId, { run_status: 'needs_recalc' });
}

export async function persistEquipmentDraft(
  modelId: string,
  draft: EquipmentGroup[],
  baseline: Model,
) {
  const server = baseline.equipment ?? [];
  const serverById = new Map(server.map((e) => [e.id, e]));
  const draftIds = new Set(draft.map((e) => e.id));

  for (const e of draft) {
    if (!serverById.has(e.id)) await db.insertEquipment(modelId, e, baseline.labor);
  }
  for (const e of draft) {
    const prev = serverById.get(e.id);
    if (!prev) continue;
    const patch = buildPatch(prev, e, EQUIPMENT_KEYS);
    if (patch) await db.updateEquipment(modelId, e.id, patch);
  }
  for (const s of server) {
    if (!draftIds.has(s.id)) await db.deleteEquipment(modelId, s.id);
  }
  await db.updateModel(modelId, { run_status: 'needs_recalc' });
}

export async function persistGeneralDraft(modelId: string, draft: GeneralData, baseline: Model) {
  const patch = buildPatch(baseline.general, draft, Object.keys(draft) as (keyof GeneralData)[]);
  if (patch) await db.updateGeneral(modelId, patch);
  await db.updateModel(modelId, { run_status: 'needs_recalc' });
}

/** Persist one product's operations + routing. */
export async function persistOperationsProductDraft(
  modelId: string,
  productId: string,
  draftOps: Operation[],
  draftRouting: RoutingEntry[],
  baseline: Model,
): Promise<void> {
  const opsToSave = normalizeProductOperations(draftOps);
  const serverOps = (baseline.operations ?? []).filter(
    (o) => o.product_id === productId && o.op_name !== 'STOCK' && o.op_name !== 'SCRAP',
  );
  const serverById = new Map(serverOps.map((o) => [o.id, o]));
  const draftIds = new Set(opsToSave.map((o) => o.id));

  for (const op of opsToSave) {
    if (!serverById.has(op.id)) await db.insertOperation(modelId, op);
  }
  for (const op of opsToSave) {
    const prev = serverById.get(op.id);
    if (!prev) continue;
    const patch = buildPatch(prev, op, OP_PATCH_KEYS);
    if (patch) await db.updateOperation(modelId, op.id, patch);
  }

  await db.setRouting(modelId, productId, routingEntriesForSave(productId, draftRouting));

  for (const s of serverOps) {
    if (draftIds.has(s.id)) continue;
    if (s.op_name === 'STOCK' || s.op_name === 'SCRAP') continue;
    await db.deleteOperation(modelId, s.id);
  }

  await db.updateModel(modelId, { run_status: 'needs_recalc' });
}

export type DraftIbomComponent = {
  id: string;
  component_product_id: string;
  units_per_assy: number;
};

export async function persistIbomProductDraft(
  modelId: string,
  parentProductId: string,
  draft: DraftIbomComponent[],
  baseline: Model,
): Promise<void> {
  const server = (baseline.ibom ?? []).filter((e) => e.parent_product_id === parentProductId);
  const serverById = new Map(server.map((e) => [e.id, e]));
  const draftIds = new Set(draft.map((e) => e.id));

  for (const row of draft) {
    if (!serverById.has(row.id)) {
      await db.insertIBOM(modelId, {
        id: row.id,
        parent_product_id: parentProductId,
        component_product_id: row.component_product_id,
        units_per_assy: row.units_per_assy,
      });
    }
  }
  for (const row of draft) {
    const prev = serverById.get(row.id);
    if (!prev) continue;
    if (prev.units_per_assy !== row.units_per_assy) {
      await db.updateIBOM(modelId, row.id, { units_per_assy: row.units_per_assy });
    }
    if (prev.component_product_id !== row.component_product_id) {
      await db.updateIBOM(modelId, row.id, { component_product_id: row.component_product_id });
    }
  }
  for (const s of server) {
    if (!draftIds.has(s.id)) await db.deleteIBOM(modelId, s.id);
  }
  await db.updateModel(modelId, { run_status: 'needs_recalc' });
}
