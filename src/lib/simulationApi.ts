import type { Model } from '@/stores/modelStore';
import type { Scenario } from '@/stores/scenarioStore';
import type { CalcResults } from '@/lib/calculationEngine';
import { apiJson } from '@/lib/api';

export function scenarioToApi(scenario: Scenario | null | undefined): Record<string, unknown> | null {
  if (!scenario?.changes?.length) return null;
  return {
    changes: scenario.changes.map((c) => ({
      dataType: c.dataType,
      entityId: c.entityId,
      field: c.field,
      whatIfValue: c.whatIfValue,
    })),
  };
}

function asNumber(v: unknown, fallback = 0): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : fallback;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x ?? '')).filter(Boolean);
}

function normalizeResults(raw: Record<string, unknown>, model: Model): CalcResults {
  const r = raw as Record<string, unknown>;
  const modelProductById = new Map(model.products.map((p) => [p.id, p]));

  const equipment = (Array.isArray(r.equipment) ? r.equipment : []).map((row, idx) => {
    const it = (row || {}) as Record<string, unknown>;
    return {
      id: asString(it.id, `equipment-${idx + 1}`),
      name: asString(it.name, `Equipment ${idx + 1}`),
      count: asNumber(it.count),
      setupUtil: asNumber(it.setupUtil),
      runUtil: asNumber(it.runUtil),
      repairUtil: asNumber(it.repairUtil),
      waitLaborUtil: asNumber(it.waitLaborUtil),
      totalUtil: asNumber(it.totalUtil),
      idle: asNumber(it.idle),
      laborGroup: asString(it.laborGroup),
      // Preserve extended backend fields used by Equipment WIP / wait charts.
      wip_process: asNumber(it.wip_process, asNumber(it.wipProcess)),
      wip_queue: asNumber(it.wip_queue, asNumber(it.wipQueue)),
      wip_total: asNumber(it.wip_total, asNumber(it.wipTotal)),
      wait_min: asNumber(it.wait_min, asNumber(it.waitMin)),
      visits_per_100: asNumber(it.visits_per_100, asNumber(it.visitsPer100)),
      machinesTended: asNumber(it.machinesTended),
      machinesWaiting: asNumber(it.machinesWaiting),
    };
  }) as CalcResults['equipment'];

  const labor = (Array.isArray(r.labor) ? r.labor : []).map((row, idx) => {
    const it = (row || {}) as Record<string, unknown>;
    return {
      id: asString(it.id, `labor-${idx + 1}`),
      name: asString(it.name, `Labor ${idx + 1}`),
      count: asNumber(it.count),
      setupUtil: asNumber(it.setupUtil),
      runUtil: asNumber(it.runUtil),
      unavailPct: asNumber(it.unavailPct),
      totalUtil: asNumber(it.totalUtil),
      idle: asNumber(it.idle),
      wip_total: asNumber(it.wip_total, asNumber(it.wipTotal)),
      wip_process: asNumber(it.wip_process, asNumber(it.wipProcess)),
      wip_queue: asNumber(it.wip_queue, asNumber(it.wipQueue)),
      eq_cover: asNumber(it.eq_cover, asNumber(it.eqCover)),
      fac_eq_lab: asNumber(it.fac_eq_lab, asNumber(it.facEqLab)),
      machinesTended: asNumber(it.machinesTended),
      machinesWaiting: asNumber(it.machinesWaiting),
      avgWaitLaborUtil: asNumber(it.avgWaitLaborUtil),
    };
  }) as CalcResults['labor'];

  const products = (Array.isArray(r.products) ? r.products : []).map((row, idx) => {
    const it = (row || {}) as Record<string, unknown>;
    const id = asString(it.id, model.products[idx]?.id ?? `product-${idx + 1}`);
    const modelProduct = modelProductById.get(id) ?? model.products[idx];
    const demand = asNumber(it.demand, asNumber(modelProduct?.demand));
    const lotSize = asNumber(it.lotSize, asNumber(modelProduct?.lot_size, 1));
    const goodMade = asNumber(it.goodMade, asNumber(it.totalGoodProd));
    const goodShipped = asNumber(it.goodShipped, asNumber(it.shippedProd));
    const started = asNumber(it.started, goodMade + asNumber(it.scrap));
    return {
      id,
      name: asString(it.name, modelProduct?.name ?? `Product ${idx + 1}`),
      demand,
      lotSize,
      goodMade,
      goodShipped,
      started,
      scrap: asNumber(it.scrap),
      wip: asNumber(it.wip),
      mct: asNumber(it.mct),
      mctLotWait: asNumber(it.mctLotWait, asNumber(it.w_lot)),
      mctQueue: asNumber(it.mctQueue, asNumber(it.w_equip)),
      mctWaitLabor: asNumber(it.mctWaitLabor, asNumber(it.w_labor)),
      mctSetup: asNumber(it.mctSetup, asNumber(it.w_setup)),
      mctRun: asNumber(it.mctRun, asNumber(it.w_run)),
    };
  }) as CalcResults['products'];

  const operations = (Array.isArray(r.operations) ? r.operations : []).map((row) => {
    const it = (row || {}) as Record<string, unknown>;
    return {
      op_id: asString(it.op_id, asString(it.opId)),
      opId: asString(it.opId, asString(it.op_id)),
      operation: asString(it.operation, asString(it.op_name)),
      op_name: asString(it.op_name, asString(it.operation)),
      op_number: asNumber(it.op_number),
      product_id: asString(it.product_id),
      ueset: asNumber(it.ueset, asNumber(it.EqSetTime)),
      uerun: asNumber(it.uerun, asNumber(it.EqRunTime)),
      ulset: asNumber(it.ulset, asNumber(it.LabSetTime)),
      ulrun: asNumber(it.ulrun, asNumber(it.LabRunTime)),
      w_equip: asNumber(it.w_equip, asNumber(it.LTEquip)),
      w_labor: asNumber(it.w_labor, asNumber(it.LTLabor)),
      w_setup: asNumber(it.w_setup, asNumber(it.LTSetup)),
      w_run: asNumber(it.w_run, asNumber(it.LTRun)),
      w_lot: asNumber(it.w_lot, asNumber(it.LTWaitLot)),
      qpoper: asNumber(it.qpoper, asNumber(it.WIP)),
      flowtime: asNumber(it.flowtime, asNumber(it.FlowTime)),
      visits_per_100: asNumber(it.visits_per_100, asNumber(it.VisitsPer100, asNumber(it.visit_prob) * 100)),
      visit_prob: asNumber(it.visit_prob),
      visits_per_good: asNumber(it.visits_per_good, asNumber(it.VisitsPerGood, asNumber(it.vpergood))),
      n_setups: asNumber(it.n_setups, asNumber(it.NumSetups)),
      avg_lot_size: asNumber(it.avg_lot_size, asNumber(it.AverLotSize)),
    };
  }) as CalcResults['operations'];

  return {
    equipment,
    labor,
    products,
    operations,
    warnings: asStringArray(r.warnings),
    errors: asStringArray(r.errors),
    overLimitResources: asStringArray(r.overLimitResources ?? r.over_limit_resources),
    calculatedAt: asString(r.calculatedAt, new Date().toISOString()),
  };
}

export async function fullCalculate(model: Model, scenario?: Scenario | null): Promise<CalcResults> {
  const body: Record<string, unknown> = { model };
  const s = scenarioToApi(scenario ?? undefined);
  if (s) body.scenario = s;
  const data = await apiJson<{ results: Record<string, unknown> }>('/api/simulations/full-calculate', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!data?.results) throw new Error('Invalid calculate response');
  return normalizeResults(data.results, model);
}

export async function verifyModel(model: Model): Promise<{ errors: string[]; warnings: string[] }> {
  return apiJson<{ errors: string[]; warnings: string[] }>('/api/simulations/verify', {
    method: 'POST',
    body: JSON.stringify({ model }),
  });
}
