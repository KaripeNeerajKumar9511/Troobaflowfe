import type { Operation } from '@/stores/modelStore';

const DOCK = 'DOCK';

function isDockOp(op: Pick<Operation, 'op_name'>): boolean {
  return String(op.op_name ?? '').trim().toUpperCase() === DOCK;
}

/** Pick the single DOCK row to keep for a product's operation list. */
function pickCanonicalDock(docks: Operation[]): Operation {
  return docks.find((d) => d.op_number === 0) ?? docks.reduce((a, b) => (a.op_number <= b.op_number ? a : b));
}

/**
 * Ensure at most one DOCK per product; canonical DOCK uses op_number 0.
 * Drops extra DOCK rows (caller should delete them on save).
 */
export function normalizeProductOperations(ops: Operation[]): Operation[] {
  const docks = ops.filter(isDockOp);
  if (docks.length === 0) return ops;

  const canonical = pickCanonicalDock(docks);
  const dropIds = new Set(docks.filter((d) => d.id !== canonical.id).map((d) => d.id));

  return ops
    .filter((o) => !dropIds.has(o.id))
    .map((o) => (o.id === canonical.id ? { ...o, op_number: 0 } : o));
}

/** Normalize operations for every product on a model. */
export function normalizeModelOperations(operations: Operation[]): Operation[] {
  const byProduct = new Map<string, Operation[]>();
  for (const op of operations) {
    const pid = String(op.product_id);
    const list = byProduct.get(pid) ?? [];
    list.push(op);
    byProduct.set(pid, list);
  }
  const out: Operation[] = [];
  for (const prodOps of byProduct.values()) {
    out.push(...normalizeProductOperations(prodOps));
  }
  return out;
}

/** True if normalization would remove or renumber DOCK rows. */
export function productOperationsNeedDockCleanup(ops: Operation[]): boolean {
  const normalized = normalizeProductOperations(ops.map((o) => ({ ...o })));
  if (normalized.length !== ops.length) return true;
  return ops.some((o) => {
    const n = normalized.find((x) => x.id === o.id);
    return !n || n.op_number !== o.op_number;
  });
}

/** Apply normalized ops + routing for one product into a model snapshot (local store). */
export function mergeProductDraftIntoModel(
  model: Model,
  productId: string,
  draftOps: Operation[],
  draftRouting: RoutingEntry[],
): Model {
  const opsNorm = normalizeProductOperations(draftOps);
  const stockScrap = (model.operations ?? []).filter(
    (o) => o.product_id === productId && (o.op_name === 'STOCK' || o.op_name === 'SCRAP'),
  );
  const otherOps = (model.operations ?? []).filter((o) => o.product_id !== productId);
  const otherRouting = (model.routing ?? []).filter((r) => r.product_id !== productId);
  const routingForProduct = draftRouting.filter((r) => String(r.product_id) === String(productId));
  return {
    ...model,
    operations: [...otherOps, ...opsNorm, ...stockScrap],
    routing: [...otherRouting, ...routingForProduct],
    updated_at: new Date().toISOString(),
    run_status: 'needs_recalc',
  };
}
