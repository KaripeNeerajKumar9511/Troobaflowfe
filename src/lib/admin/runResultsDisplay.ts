import type { Model } from '@/stores/modelStore';
import type { CalcResults, OperationResult } from '@/lib/calculationEngine';
import { getProductOutOfAreaTime } from '@/lib/calculationEngine';

export type AdminTableColumn<TRow> = {
  key: string;
  label: string;
  align?: 'left' | 'right';
  get: (row: TRow) => string | number;
};

function asNum(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function fmtFixed(v: unknown, digits = 2): string {
  const n = asNum(v);
  const f = 10 ** digits;
  return (Math.round((n + Number.EPSILON) * f) / f).toFixed(digits);
}

function productNameById(model: Model, productId: string): string {
  return model.products.find((p) => p.id === productId)?.name ?? (productId || '—');
}

function opResultFor(results: CalcResults, op: { id: string; product_id: string; op_name: string; op_number: number }) {
  const list = results.operations || [];
  const matched = list.filter((o: OperationResult) => {
    const sameId = String(o.op_id ?? (o as { opId?: string }).opId ?? '') === String(op.id);
    const sameName = String(o.op_name ?? o.operation ?? '') === String(op.op_name);
    const sameProduct = String(o.product_id ?? '') === String(op.product_id);
    return sameId || (sameProduct && sameName);
  });
  if (!matched.length) return undefined;
  return matched.reduce(
    (acc, o) => {
      acc.ueset += asNum(o.ueset);
      acc.uerun += asNum(o.uerun);
      acc.ulset += asNum(o.ulset);
      acc.ulrun += asNum(o.ulrun);
      acc.w_equip += asNum(o.w_equip);
      acc.w_labor += asNum(o.w_labor);
      acc.w_setup += asNum(o.w_setup);
      acc.w_run += asNum(o.w_run);
      acc.w_lot += asNum(o.w_lot);
      acc.qpoper += asNum(o.qpoper);
      acc.flowtime += asNum(o.flowtime);
      acc.visits_per_100 = Math.max(acc.visits_per_100, asNum(o.visits_per_100 ?? asNum(o.visit_prob) * 100));
      acc.visits_per_good = Math.max(acc.visits_per_good, asNum(o.visits_per_good ?? (o as { vpergood?: number }).vpergood));
      acc.n_setups = Math.max(acc.n_setups, asNum(o.n_setups));
      acc.avg_lot_size = Math.max(acc.avg_lot_size, asNum(o.avg_lot_size));
      return acc;
    },
    {
      ueset: 0, uerun: 0, ulset: 0, ulrun: 0,
      w_equip: 0, w_labor: 0, w_setup: 0, w_run: 0, w_lot: 0,
      qpoper: 0, flowtime: 0, visits_per_100: 0, visits_per_good: 0, n_setups: 0, avg_lot_size: 0,
    },
  );
}

export interface AdminProductResultRow {
  id: string;
  name: string;
  goodMade: number;
  goodShipped: number;
  started: number;
  scrap: number;
  scrappedInAssembly: number;
  usedInAssembly: number;
  timeWaitingEquipment: number;
  timeWaitingLabor: number;
  timeSetup: number;
  timeRun: number;
  timeWaitingRestOfLot: number;
  outOfAreaTime: number;
  wip: number;
  mct: number;
}

export function buildProductResultRows(results: CalcResults, isUtilOnly: boolean): AdminProductResultRow[] {
  return (results.products || []).map((pr) => {
    const anyPr = pr as Record<string, unknown>;
    const scrappedInAssembly = asNum(
      anyPr.scrappedInAssembly ?? anyPr.scrapInAssembly ?? anyPr.ScrapInAsm ?? 0,
    );
    const totalGoodProd = asNum(anyPr.totalGoodProd ?? anyPr.total_good_prod ?? pr.goodMade);
    const usedInAssembly = Math.max(0, totalGoodProd - scrappedInAssembly);
    const timeWaitingEquipment = asNum(pr.mctQueue);
    const timeWaitingLabor = asNum(pr.mctWaitLabor);
    const timeSetup = asNum(pr.mctSetup);
    const timeRun = asNum(pr.mctRun);
    const timeWaitingRestOfLot = asNum(pr.mctLotWait);
    const outOfAreaTime = getProductOutOfAreaTime(pr);
    return {
      id: pr.id,
      name: pr.name,
      goodMade: asNum(pr.goodMade),
      goodShipped: asNum(pr.goodShipped),
      started: asNum(pr.started),
      scrap: asNum(pr.scrap),
      scrappedInAssembly,
      usedInAssembly,
      timeWaitingEquipment,
      timeWaitingLabor,
      timeSetup,
      timeRun,
      timeWaitingRestOfLot,
      outOfAreaTime,
      wip: isUtilOnly ? 0 : asNum(pr.wip),
      mct: isUtilOnly ? 0 : asNum(pr.mct),
    };
  });
}

export const PRODUCT_RESULT_COLUMNS: AdminTableColumn<AdminProductResultRow>[] = [
  { key: 'name', label: 'Product', align: 'left', get: (r) => r.name },
  { key: 'goodMade', label: 'Good Made', get: (r) => fmtFixed(r.goodMade, 2) },
  { key: 'goodShipped', label: 'Good Shipped', get: (r) => fmtFixed(r.goodShipped, 2) },
  { key: 'started', label: 'Started', get: (r) => fmtFixed(r.started, 2) },
  { key: 'scrap', label: 'Scrap', get: (r) => fmtFixed(r.scrap, 2) },
  { key: 'scrappedInAssembly', label: 'Scrapped in Assembly', get: (r) => fmtFixed(r.scrappedInAssembly, 2) },
  { key: 'usedInAssembly', label: 'Used in Assembly', get: (r) => fmtFixed(r.usedInAssembly, 2) },
  { key: 'timeWaitingEquipment', label: 'Time Waiting in Equipment', get: (r) => fmtFixed(r.timeWaitingEquipment, 2) },
  { key: 'timeWaitingLabor', label: 'Time Waiting in Labor', get: (r) => fmtFixed(r.timeWaitingLabor, 2) },
  { key: 'timeSetup', label: 'Time Setup', get: (r) => fmtFixed(r.timeSetup, 2) },
  { key: 'timeRun', label: 'Time Run', get: (r) => fmtFixed(r.timeRun, 2) },
  { key: 'timeWaitingRestOfLot', label: 'Time Waiting for Rest of Lot', get: (r) => fmtFixed(r.timeWaitingRestOfLot, 2) },
  { key: 'outOfAreaTime', label: 'Out of Area Time', get: (r) => fmtFixed(r.outOfAreaTime, 2) },
  { key: 'wip', label: 'WIP', get: (r) => fmtFixed(r.wip, 3) },
  { key: 'mct', label: 'MCT', get: (r) => fmtFixed(r.mct, 3) },
];

export interface AdminEquipmentResultRow {
  name: string;
  count: number;
  setupUtil: number;
  runUtil: number;
  repairUtil: number;
  waitLaborUtil: number;
  totalUtil: number;
  idle: number;
  piecesInProcess: number;
  piecesWaiting: number;
  wip: number;
  laborName: string;
}

export function buildEquipmentResultRows(results: CalcResults, model: Model): AdminEquipmentResultRow[] {
  return (results.equipment || []).map((eq) => {
    const anyEq = eq as Record<string, unknown>;
    const piecesInProcess = asNum(anyEq.wip_process ?? anyEq.wipProcess ?? 0);
    const piecesWaiting = asNum(anyEq.wip_queue ?? anyEq.wipQueue ?? 0);
    const wip = asNum(anyEq.wip_total ?? anyEq.wipTotal ?? piecesInProcess + piecesWaiting);
    const modelEq = model.equipment.find((me) => me.id === eq.id) || model.equipment.find((me) => me.name === eq.name);
    const modelLabor =
      (modelEq && model.labor.find((l) => l.id === modelEq.labor_group_id)) ||
      model.labor.find((l) => l.name === (eq.laborGroup as string));
    return {
      name: eq.name,
      count: asNum(eq.count),
      setupUtil: asNum(eq.setupUtil),
      runUtil: asNum(eq.runUtil),
      repairUtil: asNum(eq.repairUtil),
      waitLaborUtil: asNum(eq.waitLaborUtil),
      totalUtil: asNum(eq.totalUtil),
      idle: asNum(eq.idle),
      piecesInProcess,
      piecesWaiting,
      wip,
      laborName: modelLabor?.name || (eq.laborGroup as string) || '—',
    };
  });
}

export const EQUIPMENT_RESULT_COLUMNS: AdminTableColumn<AdminEquipmentResultRow>[] = [
  { key: 'name', label: 'Equipment', align: 'left', get: (r) => r.name },
  { key: 'count', label: 'Count', get: (r) => fmtFixed(r.count, 1) },
  { key: 'setupUtil', label: 'Setup %', get: (r) => fmtFixed(r.setupUtil, 1) },
  { key: 'runUtil', label: 'Run %', get: (r) => fmtFixed(r.runUtil, 1) },
  { key: 'repairUtil', label: 'Repair %', get: (r) => fmtFixed(r.repairUtil, 1) },
  { key: 'waitLaborUtil', label: 'Wait Labor %', get: (r) => fmtFixed(r.waitLaborUtil, 1) },
  { key: 'totalUtil', label: 'Total %', get: (r) => fmtFixed(r.totalUtil, 1) },
  { key: 'idle', label: 'Idle %', get: (r) => fmtFixed(r.idle, 1) },
  { key: 'piecesInProcess', label: 'Pieces in Process', get: (r) => fmtFixed(r.piecesInProcess, 2) },
  { key: 'piecesWaiting', label: 'Pieces Waiting', get: (r) => fmtFixed(r.piecesWaiting, 2) },
  { key: 'wip', label: 'WIP', get: (r) => fmtFixed(r.wip, 2) },
  { key: 'laborName', label: 'Labor Name', align: 'left', get: (r) => r.laborName },
];

export interface AdminLaborResultRow {
  name: string;
  count: number;
  setupUtil: number;
  runUtil: number;
  equipTended: number;
  avgEquipWaiting: number;
  unavailPct: number;
  totalUtil: number;
  idle: number;
}

export function buildLaborResultRows(results: CalcResults): AdminLaborResultRow[] {
  return (results.labor || []).map((l) => {
    const anyL = l as Record<string, unknown>;
    return {
      name: l.name,
      count: asNum(l.count),
      setupUtil: asNum(l.setupUtil),
      runUtil: asNum(l.runUtil),
      equipTended: asNum(anyL.machinesTended ?? 0),
      avgEquipWaiting: asNum(anyL.machinesWaiting ?? 0),
      unavailPct: asNum(l.unavailPct),
      totalUtil: asNum(l.totalUtil),
      idle: asNum(l.idle),
    };
  });
}

export const LABOR_RESULT_COLUMNS: AdminTableColumn<AdminLaborResultRow>[] = [
  { key: 'name', label: 'Labor', align: 'left', get: (r) => r.name },
  { key: 'count', label: 'Count', get: (r) => fmtFixed(r.count, 1) },
  { key: 'setupUtil', label: 'Setup %', get: (r) => fmtFixed(r.setupUtil, 1) },
  { key: 'runUtil', label: 'Run %', get: (r) => fmtFixed(r.runUtil, 1) },
  { key: 'equipTended', label: 'Equip Tended', get: (r) => fmtFixed(r.equipTended, 2) },
  { key: 'avgEquipWaiting', label: 'Avg Equip Waiting', get: (r) => fmtFixed(r.avgEquipWaiting, 2) },
  { key: 'unavailPct', label: 'Unavail %', get: (r) => fmtFixed(r.unavailPct, 1) },
  { key: 'totalUtil', label: 'Total %', get: (r) => fmtFixed(r.totalUtil, 1) },
  { key: 'idle', label: 'Idle %', get: (r) => fmtFixed(r.idle, 1) },
];

export interface AdminOperationResultRow {
  productName: string;
  opName: string;
  opNumber: number;
  equipName: string;
  laborName: string;
  pctAssigned: number;
  eqSetupUtil: number;
  eqRunUtil: number;
  labSetupUtil: number;
  labRunUtil: number;
  timeWaitingEquipment: number;
  timeWaitingLabor: number;
  timeInSetup: number;
  timeInRun: number;
  timeWaitingRestOfLot: number;
  visitsPerGoodPiece: number;
  noOfSetups: number;
  avgLotSize: number;
  wip: number;
  mctAtOp: number;
  visits: number;
}

export function buildOperationResultRows(results: CalcResults, model: Model): AdminOperationResultRow[] {
  return model.operations
    .map((op) => {
      const eq = model.equipment.find((e) => e.id === op.equip_id);
      const prod = model.products.find((p) => p.id === op.product_id);
      const pr = results.products.find((p) => p.id === op.product_id);
      const lab = eq ? model.labor.find((l) => l.id === eq.labor_group_id) : undefined;
      if (!prod || !eq) return null;

      const opr = opResultFor(results, op);
      const demand = pr?.demand ?? prod.demand ?? 0;
      const allOpsForProd = model.operations.filter((o) => o.product_id === op.product_id);
      const wipShare = asNum(opr?.qpoper) || (asNum(pr?.wip) / Math.max(1, allOpsForProd.length));
      const visits = asNum(opr?.visits_per_100) || (demand > 0 ? 100 : 0);

      return {
        productName: prod.name,
        opName: op.op_name,
        opNumber: op.op_number,
        equipName: eq.name,
        laborName: lab?.name || '—',
        pctAssigned: op.pct_assigned,
        eqSetupUtil: asNum(opr?.ueset),
        eqRunUtil: asNum(opr?.uerun),
        labSetupUtil: asNum(opr?.ulset),
        labRunUtil: asNum(opr?.ulrun),
        timeWaitingEquipment: asNum(opr?.w_equip),
        timeWaitingLabor: asNum(opr?.w_labor),
        timeInSetup: asNum(opr?.w_setup),
        timeInRun: asNum(opr?.w_run),
        timeWaitingRestOfLot: asNum(opr?.w_lot),
        visitsPerGoodPiece: asNum(opr?.visits_per_good),
        noOfSetups: asNum(opr?.n_setups),
        avgLotSize: asNum(opr?.avg_lot_size),
        wip: Math.round(wipShare * 10) / 10,
        mctAtOp: asNum(opr?.flowtime),
        visits: Math.round(visits * 10) / 10,
      };
    })
    .filter((r): r is AdminOperationResultRow => r != null);
}

export const OPERATION_RESULT_COLUMNS: AdminTableColumn<AdminOperationResultRow>[] = [
  { key: 'productName', label: 'Product', align: 'left', get: (r) => r.productName },
  { key: 'opName', label: 'Operation', align: 'left', get: (r) => r.opName },
  { key: 'opNumber', label: 'Op #', get: (r) => r.opNumber },
  { key: 'equipName', label: 'Equipment', align: 'left', get: (r) => r.equipName },
  { key: 'laborName', label: 'Labor', align: 'left', get: (r) => r.laborName },
  { key: 'pctAssigned', label: '% Assign', get: (r) => fmtFixed(r.pctAssigned, 2) },
  { key: 'eqSetupUtil', label: 'Eq Setup %', get: (r) => fmtFixed(r.eqSetupUtil, 2) },
  { key: 'eqRunUtil', label: 'Eq Run %', get: (r) => fmtFixed(r.eqRunUtil, 2) },
  { key: 'labSetupUtil', label: 'Lab Setup %', get: (r) => fmtFixed(r.labSetupUtil, 2) },
  { key: 'labRunUtil', label: 'Lab Run %', get: (r) => fmtFixed(r.labRunUtil, 2) },
  { key: 'timeWaitingEquipment', label: 'Time Waiting for Equip', get: (r) => fmtFixed(r.timeWaitingEquipment, 2) },
  { key: 'timeWaitingLabor', label: 'Time Waiting for Labor', get: (r) => fmtFixed(r.timeWaitingLabor, 2) },
  { key: 'timeInSetup', label: 'Time in Setup', get: (r) => fmtFixed(r.timeInSetup, 2) },
  { key: 'timeInRun', label: 'Time in Run', get: (r) => fmtFixed(r.timeInRun, 2) },
  { key: 'timeWaitingRestOfLot', label: 'Time Waiting for Rest of Lot', get: (r) => fmtFixed(r.timeWaitingRestOfLot, 2) },
  { key: 'visitsPerGoodPiece', label: 'Visits for 1 Good Piece', get: (r) => fmtFixed(r.visitsPerGoodPiece, 2) },
  { key: 'noOfSetups', label: 'No. of Setups', get: (r) => fmtFixed(r.noOfSetups, 2) },
  { key: 'avgLotSize', label: 'Avg Lot Size', get: (r) => fmtFixed(r.avgLotSize, 2) },
  { key: 'wip', label: 'WIP', get: (r) => fmtFixed(r.wip, 2) },
  { key: 'mctAtOp', label: 'MCT at Op', get: (r) => fmtFixed(r.mctAtOp, 2) },
  { key: 'visits', label: 'Visits/100', get: (r) => fmtFixed(r.visits, 2) },
];

export { productNameById };
