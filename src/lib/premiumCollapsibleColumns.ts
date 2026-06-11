/** Premium table column groups: parent shows aggregate; children expand on "+". */

export type CollapsibleColumnGroup = {
  parent: string;
  children: readonly string[];
};

export const EQUIPMENT_WIP_GROUP: CollapsibleColumnGroup = {
  parent: 'wip',
  children: ['piecesInProcess', 'piecesWaiting'],
};

export const EQUIPMENT_LEGACY_COLUMN_ORDER = [
  'name', 'count', 'setupUtil', 'runUtil', 'repairUtil', 'waitLaborUtil', 'totalUtil', 'idle',
  'piecesInProcess', 'piecesWaiting', 'wip', 'laborName',
] as const;

export const EQUIPMENT_PREMIUM_COLUMN_ORDER = [
  'name', 'count', 'setupUtil', 'runUtil', 'repairUtil', 'waitLaborUtil', 'totalUtil', 'idle',
  'wip', 'piecesInProcess', 'piecesWaiting', 'laborName',
] as const;

export const PRODUCT_STARTED_GROUP: CollapsibleColumnGroup = {
  parent: 'started',
  children: ['goodMade', 'scrap'],
};

export const PRODUCT_MCT_GROUP: CollapsibleColumnGroup = {
  parent: 'mct',
  children: ['timeWaitingEquipment', 'timeWaitingLabor', 'timeSetup', 'timeRun', 'timeWaitingRestOfLot'],
};

export const PRODUCT_LEGACY_COLUMN_ORDER = [
  'name', 'goodMade', 'goodShipped', 'started', 'scrap', 'scrappedInAssembly', 'usedInAssembly',
  'timeWaitingEquipment', 'timeWaitingLabor', 'timeSetup', 'timeRun', 'timeWaitingRestOfLot',
  'outOfAreaTime', 'wip', 'mct',
] as const;

export const PRODUCT_PREMIUM_COLUMN_ORDER = [
  'name', 'goodShipped', 'started', 'goodMade', 'scrap', 'scrappedInAssembly', 'usedInAssembly',
  'outOfAreaTime', 'wip', 'mct',
  'timeWaitingEquipment', 'timeWaitingLabor', 'timeSetup', 'timeRun', 'timeWaitingRestOfLot',
] as const;

export const PRODUCT_COLLAPSE_GROUPS = [PRODUCT_STARTED_GROUP, PRODUCT_MCT_GROUP];

export const OPER_MCT_GROUP: CollapsibleColumnGroup = {
  parent: 'mctAtOp',
  children: ['timeWaitingEquipment', 'timeWaitingLabor', 'timeInSetup', 'timeInRun', 'timeWaitingRestOfLot'],
};

export const EQUIP_OPER_LEGACY_COLUMN_ORDER = [
  'productName', 'opName', 'laborName', 'opNumber', 'pctAssigned', 'eqSetupUtil', 'eqRunUtil', 'labSetupUtil', 'labRunUtil',
  'timeWaitingEquipment', 'timeWaitingLabor', 'timeInSetup', 'timeInRun', 'timeWaitingRestOfLot',
  'visitsPerGoodPiece', 'noOfSetups', 'avgLotSize', 'wip', 'mctAtOp', 'visits',
] as const;

export const EQUIP_OPER_PREMIUM_COLUMN_ORDER = [
  'productName', 'opName', 'laborName', 'opNumber', 'pctAssigned', 'eqSetupUtil', 'eqRunUtil', 'labSetupUtil', 'labRunUtil',
  'visitsPerGoodPiece', 'noOfSetups', 'avgLotSize', 'wip', 'mctAtOp',
  'timeWaitingEquipment', 'timeWaitingLabor', 'timeInSetup', 'timeInRun', 'timeWaitingRestOfLot', 'visits',
] as const;

export const LABOR_OPER_LEGACY_COLUMN_ORDER = [
  'productName', 'opName', 'equipName', 'opNumber', 'pctAssigned', 'eqSetupUtil', 'eqRunUtil', 'labSetupUtil', 'labRunUtil',
  'timeWaitingEquipment', 'timeWaitingLabor', 'timeInSetup', 'timeInRun', 'timeWaitingRestOfLot',
  'visitsPerGoodPiece', 'visits', 'noOfSetups', 'avgLotSize', 'wip', 'mctAtOp',
] as const;

export const LABOR_OPER_PREMIUM_COLUMN_ORDER = [
  'productName', 'opName', 'equipName', 'opNumber', 'pctAssigned', 'eqSetupUtil', 'eqRunUtil', 'labSetupUtil', 'labRunUtil',
  'visitsPerGoodPiece', 'visits', 'noOfSetups', 'avgLotSize', 'wip', 'mctAtOp',
  'timeWaitingEquipment', 'timeWaitingLabor', 'timeInSetup', 'timeInRun', 'timeWaitingRestOfLot',
] as const;

export const PRODUCT_OPER_LEGACY_COLUMN_ORDER = [
  'opNumber', 'opName', 'equipName', 'laborName', 'pctAssigned', 'eqSetupUtil', 'eqRunUtil', 'labSetupUtil', 'labRunUtil',
  'timeWaitingEquipment', 'timeWaitingLabor', 'timeInSetup', 'timeInRun', 'timeWaitingRestOfLot',
  'visitsPer100', 'visitsPerGoodPiece', 'noOfSetups', 'avgLotSize', 'wip', 'mctAtOp',
] as const;

export const PRODUCT_OPER_PREMIUM_COLUMN_ORDER = [
  'opNumber', 'opName', 'equipName', 'laborName', 'pctAssigned', 'eqSetupUtil', 'eqRunUtil', 'labSetupUtil', 'labRunUtil',
  'visitsPer100', 'visitsPerGoodPiece', 'noOfSetups', 'avgLotSize', 'wip', 'mctAtOp',
  'timeWaitingEquipment', 'timeWaitingLabor', 'timeInSetup', 'timeInRun', 'timeWaitingRestOfLot',
] as const;

function allChildColumns(groups: CollapsibleColumnGroup[]): Set<string> {
  return new Set(groups.flatMap((g) => g.children));
}

/** Visible columns for premium view; non-premium shows full order. */
export function buildVisibleColumnOrder(
  columnOrder: readonly string[],
  groups: CollapsibleColumnGroup[],
  expandedGroups: ReadonlySet<string>,
  isPremium: boolean,
): string[] {
  if (!isPremium || groups.length === 0) return [...columnOrder];

  const childSet = allChildColumns(groups);
  return columnOrder.filter((col) => {
    if (!childSet.has(col)) return true;
    const group = groups.find((g) => g.children.includes(col));
    return group != null && expandedGroups.has(group.parent);
  });
}

/** Move a column (and its collapse children, if any) within the master order. */
export function moveColumnGroup(
  order: readonly string[],
  fromKey: string,
  toKey: string,
  groups: CollapsibleColumnGroup[],
): string[] {
  const fromGroup = groups.find((g) => g.parent === fromKey || g.children.includes(fromKey));
  const keysToMove = fromGroup
    ? [fromGroup.parent, ...fromGroup.children.filter((c) => order.includes(c))]
    : [fromKey];

  const next = [...order];
  const indices = keysToMove
    .map((k) => next.indexOf(k))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b);
  if (indices.length === 0) return next;

  const moving = indices.map((i) => next[i]);
  for (let i = indices.length - 1; i >= 0; i--) next.splice(indices[i], 1);

  const toGroup = groups.find((g) => g.parent === toKey || g.children.includes(toKey));
  const insertBefore = toGroup ? toGroup.parent : toKey;
  const insertAt = next.indexOf(insertBefore);
  if (insertAt < 0) return [...order];

  next.splice(insertAt, 0, ...moving);
  return next;
}

export function isCollapseParentColumn(
  col: string,
  groups: CollapsibleColumnGroup[],
  isPremium: boolean,
): boolean {
  return isPremium && groups.some((g) => g.parent === col);
}
