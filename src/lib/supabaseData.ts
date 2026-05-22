/**
 * RMCT data access via Django REST API (PostgreSQL). Legacy filename kept for import stability.
 */
import { apiFetch, apiJson } from '@/lib/api';
import type {
  Model,
  LaborGroup,
  EquipmentGroup,
  Product,
  Operation,
  RoutingEntry,
  IBOMEntry,
  GeneralData,
  ParamNames,
} from '@/stores/modelStore';
import { defaultParamNames } from '@/stores/modelStore';
import { enrichModelPureLabor, equipmentToApiPayload, PURE_LABOR_MTTF, PURE_LABOR_MTTR } from '@/lib/pureLabor';

function defaultGeneral(name: string): GeneralData {
  return {
    model_title: name,
    ops_time_unit: 'MIN',
    mct_time_unit: 'DAY',
    prod_period_unit: 'YEAR',
    conv1: 480,
    conv2: 210,
    util_limit: 95,
    var_equip: 30,
    var_labor: 30,
    var_prod: 30,
    gen1: 0,
    gen2: 0,
    gen3: 0,
    gen4: 0,
    author: '',
    comments: '',
  };
}

function mergeParamNames(pn: Record<string, string> | null | undefined): ParamNames {
  const base = { ...defaultParamNames };
  if (!pn || typeof pn !== 'object') return base;
  Object.keys(base).forEach((k) => {
    if (pn[k] != null && pn[k] !== '') (base as Record<string, string>)[k] = String(pn[k]);
  });
  return base;
}

/** Map API JSON (snake_case dates) to store Model */
function normalizeModel(m: Record<string, unknown>): Model {
  const g = (m.general as GeneralData | undefined) || defaultGeneral(String(m.name || ''));
  const base: Model = {
    id: String(m.id),
    name: String(m.name || ''),
    description: String(m.description || ''),
    tags: (m.tags as string[]) || [],
    created_at: String(m.created_at || new Date().toISOString()),
    updated_at: String(m.updated_at || new Date().toISOString()),
    last_run_at: (m.last_run_at as string | null) ?? null,
    run_status: (m.run_status || 'never_run') as Model['run_status'],
    is_archived: Boolean(m.is_archived),
    is_demo: Boolean(m.is_demo),
    is_starred: Boolean(m.is_starred),
    general: { ...defaultGeneral(String(m.name || '')), ...g },
    param_names: mergeParamNames(m.param_names as Record<string, string>),
    labor: (m.labor as LaborGroup[]) || [],
    equipment: (m.equipment as EquipmentGroup[]) || [],
    products: (m.products as Product[]) || [],
    operations: (m.operations as Operation[]) || [],
    routing: (m.routing as RoutingEntry[]) || [],
    ibom: (m.ibom as IBOMEntry[]) || [],
  };
  return enrichModelPureLabor(base);
}

export async function fetchAllModels(): Promise<Model[]> {
  try {
    const res = await apiFetch('/api/models/');
    if (!res.ok) {
      console.error('fetchAllModels', res.status);
      return [];
    }
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];
    return rows.map((row: Record<string, unknown>) => normalizeModel(row));
  } catch (e) {
    console.error('fetchAllModels', e);
    return [];
  }
}

/** GET /api/models/:id — single model (same shape as list items). */
export async function fetchModelById(modelId: string): Promise<Model | null> {
  try {
    const res = await apiFetch(`/api/models/${modelId}/`);
    if (!res.ok) return null;
    const row = await res.json();
    if (row == null || typeof row !== 'object') return null;
    return normalizeModel(row as Record<string, unknown>);
  } catch (e) {
    console.error('fetchModelById', e);
    return null;
  }
}

async function postJson(path: string, body: unknown): Promise<void> {
  const res = await apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
  if (!res.ok) {
    const detail = await res.text();
    console.error('POST', path, res.status, detail);
    throw new Error(`POST ${path} failed (${res.status}): ${detail || res.statusText}`);
  }
}

async function patchJson(path: string, body: unknown): Promise<void> {
  const res = await apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) });
  if (!res.ok) {
    const detail = await res.text();
    console.error('PATCH', path, res.status, detail);
    throw new Error(`PATCH ${path} failed (${res.status}): ${detail || res.statusText}`);
  }
}

async function putJson(path: string, body: unknown): Promise<void> {
  const res = await apiFetch(path, { method: 'PUT', body: JSON.stringify(body) });
  if (!res.ok) {
    const detail = await res.text();
    console.error('PUT', path, res.status, detail);
    throw new Error(`PUT ${path} failed (${res.status}): ${detail || res.statusText}`);
  }
}

export async function saveFullModelToDB(model: Model): Promise<void> {
  await postJson('/api/models/', {
    id: model.id,
    name: model.name,
    description: model.description,
    tags: model.tags,
    run_status: model.run_status,
    is_archived: model.is_archived,
    is_demo: model.is_demo,
    is_starred: model.is_starred,
    last_run_at: model.last_run_at,
    param_names: model.param_names,
  });

  await patchJson(`/api/models/${model.id}/general/`, model.general);

  await putJson(`/api/models/${model.id}/param-names/upsert/`, model.param_names);

  for (const l of model.labor) {
    await postJson(`/api/models/${model.id}/labor/`, {
      id: l.id,
      name: l.name,
      count: l.count,
      overtime_pct: l.overtime_pct,
      unavail_pct: l.unavail_pct,
      dept_code: l.dept_code,
      prioritize_use: l.prioritize_use,
      setup_factor: l.setup_factor,
      run_factor: l.run_factor,
      var_factor: l.var_factor,
      lab1: l.lab1,
      lab2: l.lab2,
      lab3: l.lab3,
      lab4: l.lab4,
      comments: l.comments,
    });
  }

  for (const e of model.equipment) {
    const apiEq = equipmentToApiPayload(e, model.labor);
    await postJson(`/api/models/${model.id}/equipment/`, {
      id: e.id,
      name: apiEq.name,
      equip_type: apiEq.equip_type,
      count: apiEq.count,
      mttf: apiEq.mttf,
      mttr: apiEq.mttr,
      overtime_pct: apiEq.overtime_pct,
      labor_group_id: apiEq.labor_group_id || null,
      dept_code: apiEq.dept_code,
      out_of_area: apiEq.out_of_area,
      unavail_pct: apiEq.unavail_pct,
      setup_factor: apiEq.setup_factor,
      run_factor: apiEq.run_factor,
      var_factor: apiEq.var_factor,
      eq1: apiEq.eq1,
      eq2: apiEq.eq2,
      eq3: apiEq.eq3,
      eq4: apiEq.eq4,
      comments: apiEq.comments,
    });
  }

  for (const p of model.products) {
    await postJson(`/api/models/${model.id}/products/`, {
      id: p.id,
      name: p.name,
      demand: p.demand,
      lot_size: p.lot_size,
      tbatch_size: p.tbatch_size,
      demand_factor: p.demand_factor,
      lot_factor: p.lot_factor,
      var_factor: p.var_factor,
      setup_factor: p.setup_factor,
      make_to_stock: p.make_to_stock,
      gather_tbatches: p.gather_tbatches,
      dept_code: p.dept_code,
      prod1: p.prod1,
      prod2: p.prod2,
      prod3: p.prod3,
      prod4: p.prod4,
      comments: p.comments,
    });
  }

  for (const o of model.operations) {
    await postJson(`/api/models/${model.id}/operations/`, {
      id: o.id,
      product_id: o.product_id,
      op_name: o.op_name,
      op_number: o.op_number,
      equip_id: o.equip_id || null,
      pct_assigned: o.pct_assigned,
      equip_setup_lot: o.equip_setup_lot,
      equip_setup_piece: o.equip_setup_piece,
      equip_setup_tbatch: o.equip_setup_tbatch,
      equip_run_piece: o.equip_run_piece,
      equip_run_lot: o.equip_run_lot,
      equip_run_tbatch: o.equip_run_tbatch,
      labor_setup_lot: o.labor_setup_lot,
      labor_setup_piece: o.labor_setup_piece,
      labor_setup_tbatch: o.labor_setup_tbatch,
      labor_run_piece: o.labor_run_piece,
      labor_run_lot: o.labor_run_lot,
      labor_run_tbatch: o.labor_run_tbatch,
      oper1: o.oper1,
      oper2: o.oper2,
      oper3: o.oper3,
      oper4: o.oper4,
    });
  }

  const byProd = new Map<string, RoutingEntry[]>();
  model.routing.forEach((r) => {
    const list = byProd.get(r.product_id) || [];
    list.push(r);
    byProd.set(r.product_id, list);
  });
  for (const [, entries] of byProd) {
    await putJson(`/api/models/${model.id}/routing/set/`, {
      product_id: entries[0]?.product_id,
      entries: entries.map((e) => ({
        from_op_name: e.from_op_name,
        to_op_name: e.to_op_name,
        pct_routed: e.pct_routed,
      })),
    });
  }

  for (const i of model.ibom) {
    await postJson(`/api/models/${model.id}/ibom/`, {
      id: i.id,
      parent_product_id: i.parent_product_id,
      component_product_id: i.component_product_id,
      units_per_assy: i.units_per_assy,
    });
  }
}

export async function seedDemoModelToDB(): Promise<void> {
  const { createDemoModel } = await import('@/stores/modelStore');
  const demo = createDemoModel();
  await saveFullModelToDB(demo);
}

export const db = {
  async updateModel(id: string, data: Record<string, unknown>) {
    await patchJson(`/api/models/${id}/patch/`, data);
  },

  async deleteModel(id: string) {
    const res = await apiFetch(`/api/models/${id}/delete/`, { method: 'DELETE' });
    if (!res.ok) console.error('deleteModel:', res.status);
  },

  async updateGeneral(modelId: string, data: Partial<GeneralData>) {
    await patchJson(`/api/models/${modelId}/general/`, data);
  },

  async upsertParamNames(modelId: string, data: Partial<ParamNames>) {
    await putJson(`/api/models/${modelId}/param-names/upsert/`, data);
  },

  async insertLabor(modelId: string, l: LaborGroup) {
    await postJson(`/api/models/${modelId}/labor/`, {
      id: l.id,
      name: l.name,
      count: l.count,
      overtime_pct: l.overtime_pct,
      unavail_pct: l.unavail_pct,
      dept_code: l.dept_code,
      prioritize_use: l.prioritize_use,
      setup_factor: l.setup_factor,
      run_factor: l.run_factor,
      var_factor: l.var_factor,
      lab1: l.lab1,
      lab2: l.lab2,
      lab3: l.lab3,
      lab4: l.lab4,
      comments: l.comments,
    });
  },

  async updateLabor(modelId: string, id: string, data: Partial<LaborGroup>) {
    await patchJson(`/api/models/${modelId}/labor/${id}/`, data);
  },

  async deleteLabor(modelId: string, id: string) {
    const res = await apiFetch(`/api/models/${modelId}/labor/${id}/delete/`, { method: 'DELETE' });
    if (!res.ok) console.error('deleteLabor:', res.status);
  },

  async insertEquipment(modelId: string, e: EquipmentGroup, labor?: LaborGroup[]) {
    const apiEq = equipmentToApiPayload(e, labor);
    await postJson(`/api/models/${modelId}/equipment/`, {
      id: e.id,
      name: apiEq.name,
      equip_type: apiEq.equip_type,
      count: apiEq.count,
      mttf: apiEq.mttf,
      mttr: apiEq.mttr,
      overtime_pct: apiEq.overtime_pct,
      labor_group_id: apiEq.labor_group_id || null,
      dept_code: apiEq.dept_code,
      out_of_area: apiEq.out_of_area,
      unavail_pct: apiEq.unavail_pct,
      setup_factor: apiEq.setup_factor,
      run_factor: apiEq.run_factor,
      var_factor: apiEq.var_factor,
      eq1: apiEq.eq1,
      eq2: apiEq.eq2,
      eq3: apiEq.eq3,
      eq4: apiEq.eq4,
      comments: apiEq.comments,
    });
  },

  async updateEquipment(modelId: string, id: string, data: Partial<EquipmentGroup>) {
    const patch: Record<string, unknown> = { ...data };
    if (patch.equip_type === 'pure_labor') {
      patch.equip_type = 'standard';
      patch.mttf = PURE_LABOR_MTTF;
      patch.mttr = PURE_LABOR_MTTR;
    }
    delete patch.is_pure_labor;
    delete patch.pure_labor_labor_id;
    await patchJson(`/api/models/${modelId}/equipment/${id}/`, patch);
  },

  async deleteEquipment(modelId: string, id: string) {
    const res = await apiFetch(`/api/models/${modelId}/equipment/${id}/delete/`, { method: 'DELETE' });
    if (!res.ok) console.error('deleteEquipment:', res.status);
  },

  async insertProduct(modelId: string, p: Product) {
    await postJson(`/api/models/${modelId}/products/`, {
      id: p.id,
      name: p.name,
      demand: p.demand,
      lot_size: p.lot_size,
      tbatch_size: p.tbatch_size,
      demand_factor: p.demand_factor,
      lot_factor: p.lot_factor,
      var_factor: p.var_factor,
      setup_factor: p.setup_factor,
      make_to_stock: p.make_to_stock,
      gather_tbatches: p.gather_tbatches,
      dept_code: p.dept_code,
      prod1: p.prod1,
      prod2: p.prod2,
      prod3: p.prod3,
      prod4: p.prod4,
      comments: p.comments,
    });
  },

  async updateProduct(modelId: string, id: string, data: Partial<Product>) {
    await patchJson(`/api/models/${modelId}/products/${id}/`, data);
  },

  async deleteProduct(modelId: string, productId: string) {
    const res = await apiFetch(`/api/models/${modelId}/products/${productId}/delete/`, { method: 'DELETE' });
    if (!res.ok) console.error('deleteProduct:', res.status);
  },

  async insertOperation(modelId: string, o: Operation) {
    await postJson(`/api/models/${modelId}/operations/`, {
      id: o.id,
      product_id: o.product_id,
      op_name: o.op_name,
      op_number: o.op_number,
      equip_id: o.equip_id || null,
      pct_assigned: o.pct_assigned,
      equip_setup_lot: o.equip_setup_lot,
      equip_setup_piece: o.equip_setup_piece,
      equip_setup_tbatch: o.equip_setup_tbatch,
      equip_run_piece: o.equip_run_piece,
      equip_run_lot: o.equip_run_lot,
      equip_run_tbatch: o.equip_run_tbatch,
      labor_setup_lot: o.labor_setup_lot,
      labor_setup_piece: o.labor_setup_piece,
      labor_setup_tbatch: o.labor_setup_tbatch,
      labor_run_piece: o.labor_run_piece,
      labor_run_lot: o.labor_run_lot,
      labor_run_tbatch: o.labor_run_tbatch,
      oper1: o.oper1,
      oper2: o.oper2,
      oper3: o.oper3,
      oper4: o.oper4,
    });
  },

  async updateOperation(modelId: string, id: string, data: Partial<Operation>) {
    await patchJson(`/api/models/${modelId}/operations/${id}/`, data);
  },

  async deleteOperation(modelId: string, opId: string) {
    const res = await apiFetch(`/api/models/${modelId}/operations/${opId}/delete/`, { method: 'DELETE' });
    if (!res.ok) console.error('deleteOperation:', res.status);
  },

  async insertRouting(modelId: string, r: RoutingEntry) {
    await postJson(`/api/models/${modelId}/routing/`, {
      product_id: r.product_id,
      from_op_name: r.from_op_name,
      to_op_name: r.to_op_name,
      pct_routed: r.pct_routed,
    });
  },

  async updateRouting(modelId: string, id: string, data: Partial<RoutingEntry>) {
    await patchJson(`/api/models/${modelId}/routing/${id}/`, data);
  },

  async deleteRouting(modelId: string, id: string) {
    const res = await apiFetch(`/api/models/${modelId}/routing/${id}/delete/`, { method: 'DELETE' });
    if (!res.ok) console.error('deleteRouting:', res.status);
  },

  async setRouting(modelId: string, productId: string, entries: RoutingEntry[]) {
    await putJson(`/api/models/${modelId}/routing/set/`, {
      product_id: productId,
      entries: entries.map((e) => ({
        from_op_name: e.from_op_name,
        to_op_name: e.to_op_name,
        pct_routed: e.pct_routed,
      })),
    });
  },

  async insertIBOM(modelId: string, entry: IBOMEntry) {
    await postJson(`/api/models/${modelId}/ibom/`, {
      id: entry.id,
      parent_product_id: entry.parent_product_id,
      component_product_id: entry.component_product_id,
      units_per_assy: entry.units_per_assy,
    });
  },

  async updateIBOM(modelId: string, id: string, data: Partial<IBOMEntry>) {
    await patchJson(`/api/models/${modelId}/ibom/entry/${id}/`, data);
  },

  async deleteIBOM(modelId: string, id: string) {
    const res = await apiFetch(`/api/models/${modelId}/ibom/entry/${id}/delete/`, { method: 'DELETE' });
    if (!res.ok) console.error('deleteIBOM:', res.status);
  },

  async setIBOMForParent(modelId: string, parentId: string, entries: IBOMEntry[]) {
    await putJson(`/api/models/${modelId}/ibom/${parentId}/`, entries);
  },

  async clearProductOperationsAndRouting(modelId: string, productId: string) {
    const res = await apiFetch(
      `/api/models/${modelId}/products/${productId}/operations-and-routing/`,
      { method: 'DELETE' },
    );
    if (!res.ok) console.error('clearProductOperationsAndRouting:', res.status);
  },
};

export type ModelVersionKind = 'manual' | 'pre_restore';

export interface ModelVersionRow {
  id: string;
  label: string;
  created_at: string;
  version_kind?: ModelVersionKind;
}

export interface RestoreModelResult {
  model: Model;
  rollbackVersionId?: string;
  rollbackLabel?: string;
  /** True when user restored the auto-saved "Previous state" undo row (it is removed). */
  consumedUndo?: boolean;
}

export async function fetchModelVersions(modelId: string): Promise<ModelVersionRow[]> {
  try {
    const res = await apiFetch(`/api/models/${modelId}/versions/`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Snapshot shape expected by Django `version_restore` (JSON blobs on RMCMModel). */
export function buildModelSnapshot(model: Model): Record<string, unknown> {
  return {
    general: model.general,
    labor: model.labor,
    equipment: model.equipment,
    products: model.products,
    operations: model.operations,
    routing: model.routing,
    ibom: model.ibom,
    param_names: model.param_names,
    dept_codes: (model as Model & { dept_codes?: Record<string, string> }).dept_codes ?? {},
  };
}

export async function createModelCheckpoint(
  modelId: string,
  label: string,
  snapshot: Record<string, unknown>
): Promise<boolean> {
  const res = await apiFetch(`/api/models/${modelId}/versions/create/`, {
    method: 'POST',
    body: JSON.stringify({ label, snapshot }),
  });
  return res.ok;
}

export async function patchModelVersionLabel(versionId: string, label: string): Promise<boolean> {
  const res = await apiFetch(`/api/versions/${versionId}/patch/`, {
    method: 'PATCH',
    body: JSON.stringify({ label }),
  });
  return res.ok;
}

export async function deleteModelVersion(versionId: string): Promise<boolean> {
  const res = await apiFetch(`/api/versions/${versionId}/delete/`, { method: 'DELETE' });
  return res.ok;
}

export async function restoreModelFromVersion(
  modelId: string,
  versionId: string,
): Promise<RestoreModelResult | null> {
  try {
    const res = await apiFetch(`/api/models/${modelId}/versions/${versionId}/restore/`, { method: 'POST' });
    if (!res.ok) return null;
    const row = (await res.json()) as Record<string, unknown>;
    const meta = row.restore_meta as Record<string, unknown> | undefined;
    delete row.restore_meta;
    return {
      model: normalizeModel(row),
      rollbackVersionId: meta?.rollback_version_id != null ? String(meta.rollback_version_id) : undefined,
      rollbackLabel: meta?.rollback_label != null ? String(meta.rollback_label) : undefined,
      consumedUndo: Boolean(meta?.consumed_undo),
    };
  } catch {
    return null;
  }
}

/** @deprecated Use restoreModelFromVersion — returns model only. */
export async function restoreVersionToModel(versionId: string, modelId: string): Promise<Model | null> {
  const result = await restoreModelFromVersion(modelId, versionId);
  return result?.model ?? null;
}

export async function getVersions(modelId: string): Promise<ModelVersionRow[]> {
  return fetchModelVersions(modelId);
}

export async function createVersion(modelId: string, label: string, snapshot: Record<string, unknown>): Promise<string> {
  const ok = await createModelCheckpoint(modelId, label, snapshot);
  if (!ok) throw new Error('create checkpoint failed');
  return '';
}

export async function getVersionSnapshot(versionId: string): Promise<{ snapshot: Record<string, unknown>; created_at: string } | null> {
  try {
    const res = await apiFetch(`/api/versions/${versionId}/`);
    if (!res.ok) return null;
    const data = await res.json();
    return data as { snapshot: Record<string, unknown>; created_at: string };
  } catch {
    return null;
  }
}

export async function updateVersionLabel(versionId: string, label: string): Promise<void> {
  await patchModelVersionLabel(versionId, label);
}

export async function deleteVersion(versionId: string): Promise<void> {
  await deleteModelVersion(versionId);
}
