/**
 * RMT calculation result types. Numeric simulation runs on the Django backend (see simulationApi.fullCalculate).
 */

import type { Model } from '@/stores/modelStore';

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
}

/** Per-operation metrics from backend full-calculate response. */
export interface OperationResult {
  op_id?: string;
  opId?: string;
  operation?: string;
  product_id?: string;
  w_equip?: number;
  w_labor?: number;
  w_setup?: number;
  w_run?: number;
  w_lot?: number;
  flowtime?: number;
  visits_per_good?: number;
  n_setups?: number;
  avg_lot_size?: number;
}

export interface CalcResults {
  equipment: EquipmentResult[];
  labor: LaborResult[];
  products: ProductResult[];
  operations: OperationResult[];
  warnings: string[];
  errors: string[];
  overLimitResources: string[];
  calculatedAt: string;
}

/** Structural checks only (no queuing/MCT math). */
export function verifyData(model: Model): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (model.labor.length === 0) warnings.push('No labor groups defined.');
  if (model.equipment.length === 0) warnings.push('No equipment groups defined.');
  if (model.products.length === 0) errors.push('No products defined.');
  if (model.operations.length === 0) errors.push('No operations defined for any product.');

  model.equipment.forEach(eq => {
    if (eq.labor_group_id && !model.labor.find(l => l.id === eq.labor_group_id)) {
      errors.push(`Equipment "${eq.name}" references non-existent labor group.`);
    }
  });

  model.operations.forEach(op => {
    if (op.equip_id && !model.equipment.find(e => e.id === op.equip_id)) {
      errors.push(`Operation "${op.op_name}" references non-existent equipment.`);
    }
  });

  model.products.forEach(p => {
    if (p.demand > 0 && !model.operations.find(o => o.product_id === p.id)) {
      warnings.push(`Product "${p.name}" has demand but no operations.`);
    }
  });

  const productIds = [...new Set(model.routing.map(r => r.product_id))];
  productIds.forEach(pid => {
    const routes = model.routing.filter(r => r.product_id === pid);
    const fromOps = [...new Set(routes.map(r => r.from_op_name))];
    fromOps.forEach(fromOp => {
      const outgoing = routes.filter(r => r.from_op_name === fromOp);
      const total = outgoing.reduce((s, r) => s + r.pct_routed, 0);
      if (Math.abs(total - 100) > 0.1) {
        const product = model.products.find(p => p.id === pid);
        warnings.push(`Product "${product?.name}": routing from "${fromOp}" sums to ${total}%, not 100%.`);
      }
    });
  });

  return { errors, warnings };
}
