/**
 * RMT calculation result types. Numeric simulation runs on the Django backend (see simulationApi.fullCalculate).
 */

import type { Model } from '@/stores/modelStore';
import type { Scenario } from '@/stores/scenarioStore';

export interface EquipmentResult {
  id: string;
  name: string;
  count: number;
  setupUtil: number;
  runUtil: number;
  repairUtil: number;
  waitLaborUtil: number;
  totalUtil: number;
  idle: number;
  laborGroup: string;
  machinesTended?: number;
  machinesWaiting?: number;
}

export interface LaborResult {
  id: string;
  name: string;
  count: number;
  setupUtil: number;
  runUtil: number;
  unavailPct: number;
  totalUtil: number;
  idle: number;
  machinesTended?: number;
  machinesWaiting?: number;
  avgWaitLaborUtil?: number;
}

export interface ProductResult {
  id: string;
  name: string;
  demand: number;
  lotSize: number;
  goodMade: number;
  goodShipped: number;
  started: number;
  scrap: number;
  wip: number;
  mct: number;
  mctLotWait: number;
  mctQueue: number;
  mctWaitLabor: number;
  mctSetup: number;
  mctRun: number;
  shippedProduction?: number;
  usedInAssembly?: number;
  scrappedInAssembly?: number;
  scrapInProduction?: number;
  totalProduction?: number;
}

function asNum(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Out-of-area time — same formula as the Product Results table. */
export function getProductOutOfAreaTime(pr: ProductResult | undefined | null): number {
  if (!pr) return 0;
  const timeWaitingEquipment = asNum(pr.mctQueue);
  const timeWaitingLabor = asNum(pr.mctWaitLabor);
  const timeSetup = asNum(pr.mctSetup);
  const timeRun = asNum(pr.mctRun);
  const timeWaitingRestOfLot = asNum(pr.mctLotWait);
  return asNum(pr.mct) - (timeWaitingEquipment + timeWaitingLabor + timeSetup + timeRun + timeWaitingRestOfLot);
}

/** Per-operation metrics from backend full-calculate response. */
export interface OperationResult {
  op_id?: string;
  opId?: string;
  operation?: string;
  op_name?: string;
  op_number?: number;
  product_id?: string;
  ueset?: number;
  uerun?: number;
  ulset?: number;
  ulrun?: number;
  w_equip?: number;
  w_labor?: number;
  w_setup?: number;
  w_run?: number;
  w_lot?: number;
  qpoper?: number;
  flowtime?: number;
  flowtime_shifts?: number;
  visits_per_100?: number;
  visit_prob?: number;
  visits_per_good?: number;
  n_setups?: number;
  avg_lot_size?: number;
}

export type CalcRunMode = 'full' | 'util_only';

export interface CalcResults {
  equipment: EquipmentResult[];
  labor: LaborResult[];
  products: ProductResult[];
  operations: OperationResult[];
  warnings: string[];
  errors: string[];
  overLimitResources: string[];
  calculatedAt: string;
  /** Set when results are saved so util-only runs stay zeroed after reload. */
  runMode?: CalcRunMode;
}

/** True when results came from Calc Util Only (MCT/WIP are not meaningful). */
export function isUtilOnlyCalcResults(results: CalcResults | undefined | null): boolean {
  return results?.runMode === 'util_only';
}

function dedupeStrings(xs: string[]): string[] {
  return [...new Set(xs)];
}

/** Merge client + server validation results without duplicate lines. */
export function mergeValidationMessages(
  a: { errors: string[]; warnings: string[] },
  b: { errors: string[]; warnings: string[] },
): { errors: string[]; warnings: string[] } {
  return {
    errors: dedupeStrings([...a.errors, ...b.errors]),
    warnings: dedupeStrings([...a.warnings, ...b.warnings]),
  };
}

/** Structural checks only (no queuing/MCT math). */
export function verifyData(model: Model): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const opsUnit = model.general.ops_time_unit || 'ops time unit';

  if (model.labor.length === 0) warnings.push('No labor groups defined.');
  if (model.equipment.length === 0) warnings.push('No equipment groups defined.');
  if (model.products.length === 0) errors.push('No products defined.');
  if (model.operations.length === 0) errors.push('No operations defined for any product.');

  model.equipment.forEach((eq) => {
    if (eq.labor_group_id && !model.labor.find((l) => l.id === eq.labor_group_id)) {
      errors.push(`Equipment "${eq.name}" references a labor group that does not exist — assign a valid group on Equipment Data.`);
    }
    const mttf = Number(eq.mttf);
    if (!Number.isFinite(mttf) || mttf < 1) {
      errors.push(
        `Equipment "${eq.name}": MTTF must be ≥ 1 (${opsUnit}). Use Equipment Data to set mean time to failure.`,
      );
    }
  });

  model.operations.forEach((op) => {
    if (op.equip_id && !model.equipment.find((e) => e.id === op.equip_id)) {
      errors.push(`Operation "${op.op_name}" references equipment that does not exist — fix equipment assignment on Operations Data.`);
    }
  });

  model.products.forEach((p) => {
    const prodOps = model.operations.filter((o) => o.product_id === p.id);
    if (prodOps.length === 0) {
      errors.push(`Product "${p.name}": add at least one operation (Operations Data).`);
    }
    const routes = model.routing.filter((r) => r.product_id === p.id);
    if (routes.length === 0) {
      errors.push(`Product "${p.name}": add at least one routing row with From and To operations (Routing Data).`);
    } else {
      const badEdge = routes.some(
        (r) => !String(r.from_op_name ?? '').trim() || !String(r.to_op_name ?? '').trim(),
      );
      if (badEdge) {
        errors.push(
          `Product "${p.name}": every routing row needs both From operation and To operation filled in (Routing Data).`,
        );
      } else {
        const fromNames = new Set(
          routes.map((r) => String(r.from_op_name ?? '').trim()).filter(Boolean),
        );
        const toNames = new Set(routes.map((r) => String(r.to_op_name ?? '').trim()).filter(Boolean));
        if (fromNames.size < 1 || toNames.size < 1) {
          errors.push(
            `Product "${p.name}": routing must include at least one From step and one To step (Routing Data).`,
          );
        }
      }
    }
  });

  const productIds = [...new Set(model.routing.map((r) => r.product_id))];
  productIds.forEach((pid) => {
    const routes = model.routing.filter((r) => r.product_id === pid);
    const fromOps = [...new Set(routes.map((r) => r.from_op_name))];
    fromOps.forEach((fromOp) => {
      const outgoing = routes.filter((r) => r.from_op_name === fromOp);
      const total = outgoing.reduce((s, r) => s + r.pct_routed, 0);
      if (Math.abs(total - 100) > 0.1) {
        const product = model.products.find((p) => p.id === pid);
        warnings.push(`Product "${product?.name}": routing from "${fromOp}" sums to ${total}%, not 100%.`);
      }
    });
  });

  return { errors, warnings };
}

/** Full pre-calculate checks: structural rules plus general/product/labor constraints used before API runs. */
export function getModelValidationMessages(model: Model): { errors: string[]; warnings: string[] } {
  const base = verifyData(model);
  const errors = [...base.errors];
  const warnings = [...base.warnings];

  const g = model.general;
  if (!Number.isFinite(g.conv1) || g.conv1 <= 0) {
    errors.push('MCT Conversion (operations per MCT time unit) must be greater than 0 — General Data → Time Settings.');
  }
  if (!Number.isFinite(g.conv2) || g.conv2 <= 0) {
    errors.push('Production Period Conversion (MCT units per production period) must be greater than 0 — General Data → Time Settings.');
  }

  model.products.forEach((p) => {
    if (!Number.isFinite(p.lot_size) || p.lot_size < 1) {
      errors.push(`Product "${p.name}": Lot Size must be ≥ 1 — Product Data.`);
    }
    if (!Number.isFinite(p.demand) || p.demand < 0) {
      errors.push(`Product "${p.name}": Demand cannot be negative — Product Data.`);
    }
  });

  model.equipment.forEach((e) => {
    const needsCount = e.equip_type === 'standard' || e.equip_type === 'pure_labor';
    if (needsCount && (!Number.isFinite(e.count) || e.count < 1)) {
      errors.push(`Equipment "${e.name}": Count must be ≥ 1 — Equipment Data.`);
    }
  });

  model.labor.forEach((l) => {
    if (!Number.isFinite(l.count) || l.count < 1) {
      errors.push(`Labor "${l.name}": Count must be ≥ 1 — Labor Data.`);
    }
  });

  return { errors: dedupeStrings(errors), warnings: dedupeStrings(warnings) };
}

/**
 * Backward-compatible local calculator used by client-side what-if helpers.
 * Main production calculations are performed by the backend API.
 */
export function calculate(model: Model, _scenario?: Scenario | null): CalcResults {
  const { errors, warnings } = verifyData(model);

  const equipment: EquipmentResult[] = model.equipment.map((eq) => ({
    id: eq.id,
    name: eq.name,
    count: eq.count,
    setupUtil: 0,
    runUtil: 0,
    repairUtil: 0,
    waitLaborUtil: 0,
    totalUtil: 0,
    idle: 100,
    laborGroup: eq.labor_group_id
      ? model.labor.find((l) => l.id === eq.labor_group_id)?.name || ''
      : '',
  }));

  const labor: LaborResult[] = model.labor.map((l) => ({
    id: l.id,
    name: l.name,
    count: l.count,
    setupUtil: 0,
    runUtil: 0,
    unavailPct: l.unavail_pct ?? 0,
    totalUtil: 0,
    idle: 100,
  }));

  const products: ProductResult[] = model.products.map((p) => {
    const demand = Number.isFinite(p.demand) ? p.demand : 0;
    const lotSize = Number.isFinite(p.lot_size) && p.lot_size > 0 ? p.lot_size : 1;
    const started = Math.max(0, demand);
    const goodMade = started;
    const goodShipped = Math.min(goodMade, demand);

    return {
      id: p.id,
      name: p.name,
      demand,
      lotSize,
      goodMade,
      goodShipped,
      started,
      scrap: 0,
      wip: Math.max(0, started - goodShipped),
      mct: 0,
      mctLotWait: 0,
      mctQueue: 0,
      mctWaitLabor: 0,
      mctSetup: 0,
      mctRun: 0,
    };
  });

  const operations: OperationResult[] = model.operations.map((op) => ({
    op_id: op.id,
    opId: op.id,
    operation: op.op_name,
    op_name: op.op_name,
    product_id: op.product_id,
    op_number: op.op_number,
    ueset: (op.equip_setup_lot ?? 0) + (op.equip_setup_piece ?? 0) + (op.equip_setup_tbatch ?? 0),
    uerun: (op.equip_run_lot ?? 0) + (op.equip_run_piece ?? 0) + (op.equip_run_tbatch ?? 0),
    ulset: (op.labor_setup_lot ?? 0) + (op.labor_setup_piece ?? 0) + (op.labor_setup_tbatch ?? 0),
    ulrun: (op.labor_run_lot ?? 0) + (op.labor_run_piece ?? 0) + (op.labor_run_tbatch ?? 0),
    w_equip: 0,
    w_labor: 0,
    w_setup: 0,
    w_run: 0,
    w_lot: 0,
    qpoper: 0,
    flowtime: 0,
    flowtime_shifts: 0,
    visits_per_100: 0,
    visit_prob: 0,
    visits_per_good: 0,
    n_setups: 0,
    avg_lot_size: 0,
  }));

  return {
    equipment,
    labor,
    products,
    operations,
    warnings,
    errors,
    overLimitResources: [],
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Util-only run: keep equipment/labor utilization and product production counts;
 * zero MCT, WIP, and operation-level queue metrics.
 */
export function toUtilOnlyResults(results: CalcResults): CalcResults {
  const equipment: EquipmentResult[] = results.equipment.map((e) => ({
    id: e.id,
    name: e.name,
    count: e.count,
    setupUtil: e.setupUtil,
    runUtil: e.runUtil,
    repairUtil: e.repairUtil,
    waitLaborUtil: e.waitLaborUtil,
    totalUtil: e.totalUtil,
    idle: e.idle,
    laborGroup: e.laborGroup,
    ...(e.machinesTended != null ? { machinesTended: e.machinesTended } : {}),
    ...(e.machinesWaiting != null ? { machinesWaiting: e.machinesWaiting } : {}),
  }));

  const labor: LaborResult[] = results.labor.map((l) => ({
    id: l.id,
    name: l.name,
    count: l.count,
    setupUtil: l.setupUtil,
    runUtil: l.runUtil,
    unavailPct: l.unavailPct,
    totalUtil: l.totalUtil,
    idle: l.idle,
    ...(l.machinesTended != null ? { machinesTended: l.machinesTended } : {}),
    machinesWaiting: 0,
    ...(l.avgWaitLaborUtil != null ? { avgWaitLaborUtil: l.avgWaitLaborUtil } : {}),
  }));

  const products: ProductResult[] = results.products.map((p) => ({
    id: p.id,
    name: p.name,
    demand: p.demand,
    lotSize: p.lotSize,
    goodMade: p.goodMade,
    goodShipped: p.goodShipped,
    started: p.started,
    scrap: p.scrap,
    shippedProduction: p.shippedProduction,
    usedInAssembly: p.usedInAssembly,
    scrappedInAssembly: p.scrappedInAssembly,
    scrapInProduction: p.scrapInProduction,
    totalProduction: p.totalProduction,
    wip: 0,
    mct: 0,
    mctLotWait: 0,
    mctQueue: 0,
    mctWaitLabor: 0,
    mctSetup: 0,
    mctRun: 0,
  }));

  return {
    ...results,
    equipment,
    labor,
    products,
    operations: [],
    runMode: 'util_only',
  };
}
