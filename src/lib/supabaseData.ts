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
  return {
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

async function postJson(path: string, body: unknown): Promise<void> {
  const res = await apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
  if (!res.ok) console.error('POST', path, res.status, await res.text());
}

async function patchJson(path: string, body: unknown): Promise<void> {
  const res = await apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) });
  if (!res.ok) console.error('PATCH', path, res.status, await res.text());
}

async function putJson(path: string, body: unknown): Promise<void> {
  const res = await apiFetch(path, { method: 'PUT', body: JSON.stringify(body) });
  if (!res.ok) console.error('PUT', path, res.status, await res.text());
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
    await postJson(`/api/models/${model.id}/equipment/`, {
      id: e.id,
      name: e.name,
      equip_type: e.equip_type,
      count: e.count,
      mttf: e.mttf,
      mttr: e.mttr,
      overtime_pct: e.overtime_pct,
      labor_group_id: e.labor_group_id || null,
      dept_code: e.dept_code,
      out_of_area: e.out_of_area,
      unavail_pct: e.unavail_pct,
      setup_factor: e.setup_factor,
      run_factor: e.run_factor,
      var_factor: e.var_factor,
      eq1: e.eq1,
      eq2: e.eq2,
      eq3: e.eq3,
      eq4: e.eq4,
      comments: e.comments,
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

  async updateLabor(id: string, modelId: string, data: Partial<LaborGroup>) {
    await patchJson(`/api/models/${modelId}/labor/${id}/`, data);
  },

  async deleteLabor(modelId: string, id: string) {
    const res = await apiFetch(`/api/models/${modelId}/labor/${id}/delete/`, { method: 'DELETE' });
    if (!res.ok) console.error('deleteLabor:', res.status);
  },

  async insertEquipment(modelId: string, e: EquipmentGroup) {
    await postJson(`/api/models/${modelId}/equipment/`, {
      id: e.id,
      name: e.name,
      equip_type: e.equip_type,
      count: e.count,
      mttf: e.mttf,
      mttr: e.mttr,
      overtime_pct: e.overtime_pct,
      labor_group_id: e.labor_group_id || null,
      dept_code: e.dept_code,
      out_of_area: e.out_of_area,
      unavail_pct: e.unavail_pct,
      setup_factor: e.setup_factor,
      run_factor: e.run_factor,
      var_factor: e.var_factor,
      eq1: e.eq1,
      eq2: e.eq2,
      eq3: e.eq3,
      eq4: e.eq4,
      comments: e.comments,
    });
  },

  async updateEquipment(id: string, modelId: string, data: Partial<EquipmentGroup>) {
    await patchJson(`/api/models/${modelId}/equipment/${id}/`, data);
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

  async updateProduct(id: string, modelId: string, data: Partial<Product>) {
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
    });
  },

  async updateOperation(id: string, modelId: string, data: Partial<Operation>) {
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

  async updateRouting(id: string, modelId: string, data: Partial<RoutingEntry>) {
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

  async updateIBOM(id: string, modelId: string, data: Partial<IBOMEntry>) {
    await patchJson(`/api/models/${modelId}/ibom/entry/${id}/`, data);
  },

  async deleteIBOM(modelId: string, id: string) {
    const res = await apiFetch(`/api/models/${modelId}/ibom/entry/${id}/delete/`, { method: 'DELETE' });
    if (!res.ok) console.error('deleteIBOM:', res.status);
  },

  async setIBOMForParent(modelId: string, parentId: string, entries: IBOMEntry[]) {
    await putJson(`/api/models/${modelId}/ibom/${parentId}/`, entries);
  },
};

export interface ModelVersionRow {
  id: string;
  label: string;
  created_at: string;
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

export async function restoreModelFromVersion(modelId: string, versionId: string): Promise<Model | null> {
  try {
    const res = await apiFetch(`/api/models/${modelId}/versions/${versionId}/restore/`, { method: 'POST' });
    if (!res.ok) return null;
    const row = await res.json();
    return normalizeModel(row as Record<string, unknown>);
  } catch {
    return null;
  }
}
