/**
 * Backward-scheduling for IBOM trees: critical path (flow time only) then EndTime/StartTime.
 * Quantities / UPA are not used in critical-path timing.
 */

export interface IbomScheduleNode {
  id: string;
  flowTime: number;
  children: IbomScheduleNode[];
  endTime?: number;
  startTime?: number;
  criticalPathTime?: number;
}

/** Step 1: criticalPathTime = flowTime + max(child branch), or flowTime if leaf. */
export function calcCriticalPathTime(node: IbomScheduleNode): number {
  if (node.children.length === 0) {
    node.criticalPathTime = node.flowTime;
    return node.criticalPathTime;
  }

  let maxChild = 0;
  for (const child of node.children) {
    const childPath = calcCriticalPathTime(child);
    if (childPath > maxChild) maxChild = childPath;
  }

  node.criticalPathTime = node.flowTime + maxChild;
  return node.criticalPathTime;
}

/** Step 3: startTime = endTime - flowTime (floor 0); child.endTime = parent.startTime. */
export function assignBackwardTimes(node: IbomScheduleNode, endTime?: number): void {
  if (endTime !== undefined) {
    node.endTime = endTime;
  }

  node.startTime = Math.max(0, (node.endTime ?? 0) - node.flowTime);

  for (const child of node.children) {
    assignBackwardTimes(child, node.startTime);
  }
}

/** Full schedule: calc critical path, root.endTime = criticalPathTime, then backward assign. */
export function scheduleIbomTree(root: IbomScheduleNode): void {
  calcCriticalPathTime(root);
  root.endTime = root.criticalPathTime ?? root.flowTime;
  assignBackwardTimes(root);
}

/** Product ids on the longest flow-time branch (for highlighting). */
export function findCriticalPathIds(root: IbomScheduleNode): Set<string> {
  const path = new Set<string>();

  function walk(node: IbomScheduleNode): void {
    path.add(node.id);
    if (node.children.length === 0) return;

    let bestChild: IbomScheduleNode | null = null;
    let bestCp = -1;
    for (const child of node.children) {
      const cp = child.criticalPathTime ?? 0;
      if (cp > bestCp) {
        bestCp = cp;
        bestChild = child;
      }
    }
    if (bestChild) walk(bestChild);
  }

  walk(root);
  return path;
}

export interface IbomPathStep {
  id: string;
  flowTime: number;
}

export interface PoleSchedule {
  startTime: number;
  endTime: number;
  criticalPathTime: number;
  /** Per-step times in path order (root → leaf). */
  stepTimes: { id: string; startTime: number; endTime: number }[];
}

function buildLinearChain(steps: IbomPathStep[]): IbomScheduleNode {
  const [head, ...rest] = steps;
  return {
    id: head.id,
    flowTime: head.flowTime,
    children: rest.length > 0 ? [buildLinearChain(rest)] : [],
  };
}

/** Schedule a single root-to-leaf pole as a one-child-per-level chain. */
export function schedulePolePath(steps: IbomPathStep[]): PoleSchedule {
  if (steps.length === 0) {
    return { startTime: 0, endTime: 0, criticalPathTime: 0, stepTimes: [] };
  }

  const root = buildLinearChain(steps);
  scheduleIbomTree(root);

  const stepTimes: PoleSchedule['stepTimes'] = [];
  function collect(node: IbomScheduleNode): void {
    stepTimes.push({
      id: node.id,
      startTime: node.startTime ?? 0,
      endTime: node.endTime ?? 0,
    });
    if (node.children.length > 0) collect(node.children[0]);
  }
  collect(root);

  return {
    startTime: root.startTime ?? 0,
    endTime: root.endTime ?? 0,
    criticalPathTime: root.criticalPathTime ?? 0,
    stepTimes,
  };
}

/** Map schedule results onto a tree by product id. */
export function applyScheduleToTree<T extends { productId: string; children: T[] }>(
  root: T,
  scheduleRoot: IbomScheduleNode,
): void {
  const byId = new Map<string, IbomScheduleNode>();

  function index(node: IbomScheduleNode): void {
    byId.set(node.id, node);
    node.children.forEach(index);
  }
  index(scheduleRoot);

  function apply(node: T): void {
    const s = byId.get(node.productId);
    if (s) {
      (node as T & { startTime?: number; endTime?: number; criticalPathTime?: number }).startTime =
        s.startTime ?? 0;
      (node as T & { startTime?: number; endTime?: number; criticalPathTime?: number }).endTime =
        s.endTime ?? 0;
      (node as T & { startTime?: number; endTime?: number; criticalPathTime?: number }).criticalPathTime =
        s.criticalPathTime ?? 0;
    }
    node.children.forEach(apply);
  }
  apply(root);
}

export function treeToScheduleNode<T extends { productId: string; breakdown: { total: number }; isMTS: boolean; children: T[] }>(
  node: T,
): IbomScheduleNode {
  return {
    id: node.productId,
    flowTime: node.isMTS ? 0 : node.breakdown.total,
    children: node.children.map(treeToScheduleNode),
  };
}

export function scheduleIbomNodeTree<T extends { productId: string; breakdown: { total: number }; isMTS: boolean; children: T[] }>(
  root: T,
): IbomScheduleNode {
  const scheduleRoot = treeToScheduleNode(root);
  scheduleIbomTree(scheduleRoot);
  applyScheduleToTree(root, scheduleRoot);
  return scheduleRoot;
}
