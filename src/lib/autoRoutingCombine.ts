import type { Operation, RoutingEntry } from '@/stores/modelStore';

export type RoutingInputRow = {
  product: string;
  routing: string;
  totalDemand: number;
  combinationId: string;
};

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function compareProductNames(a: string, b: string): number {
  const ma = /^P(\d+)$/i.exec(a.trim());
  const mb = /^P(\d+)$/i.exec(b.trim());
  if (ma && mb) return Number(ma[1]) - Number(mb[1]);
  return a.localeCompare(b);
}

class TrieNode {
  readonly children = new Map<string, TrieNode>();
  /** Demand of products that end routing exactly on this operation node. */
  endHere = 0;
  /** Demand of products whose path visits this node (includes those that end here). */
  throughAll = 0;
  readonly pathKey: string;

  constructor(
    readonly parent: TrieNode | null,
    readonly lastCode: string,
  ) {
    this.pathKey = parent ? parent.pathKey + lastCode : '';
  }

  insert(codes: string[], d: number): void {
    let n: TrieNode = this;
    for (let j = 0; j < codes.length; j++) {
      const ch = codes[j]!;
      if (!n.children.has(ch)) n.children.set(ch, new TrieNode(n, ch));
      n = n.children.get(ch)!;
      n.throughAll += d;
    }
    n.endHere += d;
  }

  subtreeTotal(): number {
    let s = this.endHere;
    for (const c of this.children.values()) s += c.subtreeTotal();
    return s;
  }
}

function roundPcts(weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0) return weights.map(() => 0);
  const raw = weights.map((w) => (100 * w) / sum);
  const floors = raw.map((x) => Math.floor(x));
  let rem = 100 - floors.reduce((a, b) => a + b, 0);
  const order = raw.map((x, i) => ({ i, frac: x - Math.floor(x) })).sort((a, b) => b.frac - a.frac);
  const out = [...floors];
  for (let k = 0; k < rem; k++) out[order[k % order.length]!.i] += 1;
  return out;
}

function exactPcts(weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0) return weights.map(() => 0);
  return weights.map((w) => (100 * w) / sum);
}

function toFixedPct(x: number, digits = 6): number {
  if (!Number.isFinite(x)) return 0;
  const p = Number(x.toFixed(digits));
  // eslint / esbuild warning: -0 compares equal to 0. Use Object.is.
  return Object.is(p, -0) ? 0 : p;
}

function buildCodeToOpMap(legend: { operation: string; code: string }[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const r of legend) {
    const k = normalizeCode(r.code);
    if (!k) continue;
    map.set(k, r.operation.trim());
  }
  return map;
}

function codesForRow(routing: string, codeToOp: Map<string, string>): string[] {
  const raw = normalizeCode(routing).replace(/\s+/g, '');
  const out: string[] = [];
  for (const ch of raw.split('')) {
    if (!ch) continue;
    if (!codeToOp.has(ch)) continue;
    out.push(ch);
  }
  return out;
}

/** Combined product: one DOCK, trie-shaped ops, demand-weighted splits at divergences. */
export function buildCombinedRouting(
  rows: RoutingInputRow[],
  legendRows: { operation: string; code: string }[],
  terminal: 'STOCK' | 'SCRAP',
  opts?: { rounding?: 'rounded' | 'exact' },
): {
  productId: string;
  productName: string;
  totalDemand: number;
  operations: Operation[];
  routing: RoutingEntry[];
  removedZeroPctOps: { from: string; to: string; exactPct: number }[];
} {
  const codeToOp = buildCodeToOpMap(legendRows);
  const sorted = [...rows].sort((a, b) => compareProductNames(a.product, b.product));

  for (const r of sorted) {
    if (!Number.isFinite(r.totalDemand) || r.totalDemand <= 0) {
      throw new Error(`Invalid demand for product "${r.product}": must be > 0.`);
    }
  }

  const productName = sorted.map((r) => r.product.trim()).join('');
  const totalDemand = sorted.reduce((s, r) => s + r.totalDemand, 0);

  const root = new TrieNode(null, '');
  for (const r of sorted) {
    const codes = codesForRow(r.routing, codeToOp);
    if (codes.length === 0) throw new Error(`Product "${r.product}" has empty or invalid routing.`);
    root.insert(codes, r.totalDemand);
  }

  const trieNodes: TrieNode[] = [];
  const queue: TrieNode[] = [];
  for (const c of root.children.values()) queue.push(c);
  while (queue.length) {
    const n = queue.shift()!;
    trieNodes.push(n);
    for (const ch of n.children.values()) queue.push(ch);
  }

  const opNameCount = new Map<string, number>();
  const nodeToOpName = new Map<TrieNode, string>();
  for (const n of trieNodes) {
    const base = codeToOp.get(n.lastCode) ?? n.lastCode;
    const seen = opNameCount.get(base) ?? 0;
    opNameCount.set(base, seen + 1);
    const name = seen > 0 ? `${base} [${n.pathKey}]` : base;
    nodeToOpName.set(n, name);
  }

  const mkRoute = (productId: string, from: string, to: string, pct: number): RoutingEntry => ({
    id: crypto.randomUUID(),
    product_id: productId,
    from_op_name: from,
    to_op_name: to,
    pct_routed: pct,
  });

  const productId = crypto.randomUUID();
  const removedZeroPctOps: { from: string; to: string; exactPct: number }[] = [];
  const operations: Operation[] = [];
  const routing: RoutingEntry[] = [];

  operations.push({
    id: crypto.randomUUID(),
    product_id: productId,
    op_name: 'DOCK',
    op_number: 0,
    equip_id: '',
    pct_assigned: 100,
    equip_setup_lot: 0,
    equip_setup_piece: 0,
    equip_setup_tbatch: 0,
    equip_run_piece: 0,
    equip_run_lot: 0,
    equip_run_tbatch: 0,
    labor_setup_lot: 0,
    labor_setup_piece: 0,
    labor_setup_tbatch: 0,
    labor_run_piece: 0,
    labor_run_lot: 0,
    labor_run_tbatch: 0,
    oper1: 0,
    oper2: 0,
    oper3: 0,
    oper4: 0,
  });

  const rounding: 'rounded' | 'exact' = opts?.rounding ?? 'rounded';
  const reachable = new Set<TrieNode>();

  // Build reachability based on outgoing pcts; 0% children are unreachable.
  const traverse = (parentOp: string, n: TrieNode): void => {
    reachable.add(n);
    const children = [...n.children.values()];
    const weights = children.map((ch) => ch.subtreeTotal());
    const exact = exactPcts(weights);
    const routed = rounding === 'exact' ? exact.map((x) => toFixedPct(x)) : roundPcts(weights);

    children.forEach((ch, i) => {
      const pct = routed[i] ?? 0;
      const exactPct = exact[i] ?? 0;
      const toName = nodeToOpName.get(ch)!;
      if (pct > 0) {
        traverse(toName, ch);
      } else if (exactPct > 0) {
        removedZeroPctOps.push({ from: parentOp, to: toName, exactPct });
      }
    });
  };

  // Root is DOCK's outgoing. Root itself isn't an op.
  for (const ch of root.children.values()) {
    // For root children, parent op is DOCK.
    const parentOp = 'DOCK';
    const children = [...root.children.values()];
    const weights = children.map((c) => c.subtreeTotal());
    const exact = exactPcts(weights);
    const routed = rounding === 'exact' ? exact.map((x) => toFixedPct(x)) : roundPcts(weights);
    const idx = children.indexOf(ch);
    const pct = routed[idx] ?? 0;
    const exactPct = exact[idx] ?? 0;
    const toName = nodeToOpName.get(ch)!;
    if (pct > 0) traverse(parentOp, ch);
    else if (exactPct > 0) removedZeroPctOps.push({ from: 'DOCK', to: toName, exactPct });
  }

  let opNum = 10;
  for (const n of trieNodes) {
    if (!reachable.has(n)) continue;
    operations.push({
      id: crypto.randomUUID(),
      product_id: productId,
      op_name: nodeToOpName.get(n)!,
      op_number: opNum,
      equip_id: '',
      pct_assigned: 100,
      equip_setup_lot: 0,
      equip_setup_piece: 0,
      equip_setup_tbatch: 0,
      equip_run_piece: 0,
      equip_run_lot: 0,
      equip_run_tbatch: 0,
      labor_setup_lot: 0,
      labor_setup_piece: 0,
      labor_setup_tbatch: 0,
      labor_run_piece: 0,
      labor_run_lot: 0,
      labor_run_tbatch: 0,
      oper1: 0,
      oper2: 0,
      oper3: 0,
      oper4: 0,
    });
    opNum += 10;
  }

  function edgesFrom(n: TrieNode): void {
    const fromName = n.parent === null ? 'DOCK' : nodeToOpName.get(n)!;
    const targets: { to: string; w: number }[] = [];

    if (n.parent === null) {
      const children = [...root.children.values()];
      const weights = children.map((ch) => ch.subtreeTotal());
      const exact = exactPcts(weights);
      const pcts = rounding === 'exact' ? exact.map((x) => toFixedPct(x)) : roundPcts(weights);
      children.forEach((ch, i) => {
        const toName = nodeToOpName.get(ch)!;
        if (pcts[i] && pcts[i]! > 0) targets.push({ to: toName, w: pcts[i] ?? 0 });
      });
    } else {
      type Out = { to: string; w: number };
      const outs: Out[] = [];
      const weights: number[] = [];
      for (const ch of n.children.values()) {
        weights.push(ch.subtreeTotal());
      }
      if (n.endHere > 0) weights.push(n.endHere);
      const exact = exactPcts(weights);
      const pcts = rounding === 'exact' ? exact.map((x) => toFixedPct(x)) : roundPcts(weights);
      let i = 0;
      for (const ch of n.children.values()) {
        const w = pcts[i++] ?? 0;
        const toName = nodeToOpName.get(ch)!;
        if (w > 0) outs.push({ to: toName, w });
      }
      if (n.endHere > 0) {
        const w = pcts[i++] ?? 0;
        if (w > 0) outs.push({ to: terminal, w });
      }
      outs.forEach((o) => targets.push(o));
    }

    for (const t of targets) {
      if (t.w <= 0) continue;
      routing.push(mkRoute(productId, fromName, t.to, t.w));
    }
  }

  edgesFrom(root);
  for (const n of trieNodes) {
    if (!reachable.has(n)) continue;
    edgesFrom(n);
  }

  return { productId, productName, totalDemand, operations, routing, removedZeroPctOps };
}

export function buildLinearRoutingSingle(
  productId: string,
  opNamesInOrder: string[],
  terminal: 'STOCK' | 'SCRAP',
): RoutingEntry[] {
  const mk = (from: string, to: string): RoutingEntry => ({
    id: crypto.randomUUID(),
    product_id: productId,
    from_op_name: from,
    to_op_name: to,
    pct_routed: 100,
  });
  if (opNamesInOrder.length === 0) return [mk('DOCK', terminal)];
  const entries: RoutingEntry[] = [];
  entries.push(mk('DOCK', opNamesInOrder[0]!));
  for (let i = 0; i < opNamesInOrder.length - 1; i++) entries.push(mk(opNamesInOrder[i]!, opNamesInOrder[i + 1]!));
  entries.push(mk(opNamesInOrder[opNamesInOrder.length - 1]!, terminal));
  return entries;
}
