import { useState, useMemo, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import {
  buildVisibleColumnOrder,
  moveColumnGroup,
  isCollapseParentColumn,
  type CollapsibleColumnGroup,
} from '@/lib/premiumCollapsibleColumns';

type ResizableCols = {
  syncWidths: (count: number) => void;
  syncWidthsFromWeights?: (weights: number[]) => void;
  moveColumn: (from: number, to: number) => void;
  resetWidths: () => void;
};

export type CollapsibleTableColumnOptions = {
  /** Use premiumColumnOrder instead of legacyColumnOrder for init/reset. */
  usePremiumOrder: boolean;
  /** Hide child columns until parent "+" is expanded. */
  collapseEnabled: boolean;
  /**
   * Parent ids whose expansion uses horizontal-scroll layout (min-width columns).
   * When omitted, any expanded group triggers scroll layout.
   * Example: product table passes `['mct']` so Started-only expand still fills card width.
   */
  scrollExpandedParents?: readonly string[];
  /** Always use min-width columns + horizontal scroll (e.g. oper details tables). */
  alwaysScrollLayout?: boolean;
};

export function useCollapsibleTableColumns<T extends string>(
  legacyColumnOrder: readonly T[],
  premiumColumnOrder: readonly T[],
  groups: CollapsibleColumnGroup[],
  options: CollapsibleTableColumnOptions,
  resizableCols: ResizableCols,
  getColumnWeightPx?: (col: string) => number,
) {
  const { usePremiumOrder, collapseEnabled, scrollExpandedParents, alwaysScrollLayout } = options;
  const legacyOrderKey = legacyColumnOrder.join('|');
  const premiumOrderKey = premiumColumnOrder.join('|');
  const scrollExpandedParentsKey = scrollExpandedParents?.join('|') ?? '';
  const baseOrder = usePremiumOrder ? premiumColumnOrder : legacyColumnOrder;
  const { syncWidths, syncWidthsFromWeights, moveColumn: resizeMoveColumn, resetWidths } = resizableCols;
  const getColumnWeightPxRef = useRef(getColumnWeightPx);
  getColumnWeightPxRef.current = getColumnWeightPx;

  const [columnOrder, setColumnOrder] = useState<T[]>(() => [...baseOrder] as T[]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const prevVisibleLenRef = useRef<number | null>(null);
  const prevVisibleKeyRef = useRef<string>('');

  const visibleColumnOrder = useMemo(
    () => buildVisibleColumnOrder(columnOrder, groups, expandedGroups, collapseEnabled) as T[],
    [columnOrder, groups, expandedGroups, collapseEnabled],
  );
  const visibleColumnKey = visibleColumnOrder.join('|');
  const expandedGroupsKey = useMemo(
    () => [...expandedGroups].sort().join(','),
    [expandedGroups],
  );
  const hasExpandedGroups = expandedGroups.size > 0;
  const scrollLayoutActive = useMemo(() => {
    if (!collapseEnabled) return false;
    if (alwaysScrollLayout) return true;
    if (!hasExpandedGroups) return false;
    if (!scrollExpandedParents) return true;
    return scrollExpandedParents.some((p) => expandedGroups.has(p));
  }, [collapseEnabled, alwaysScrollLayout, hasExpandedGroups, expandedGroupsKey, scrollExpandedParentsKey]);
  const fillWidthLayout = collapseEnabled && !scrollLayoutActive;

  useEffect(() => {
    const order = usePremiumOrder ? premiumColumnOrder : legacyColumnOrder;
    setColumnOrder([...order] as T[]);
    setExpandedGroups(new Set());
    prevVisibleLenRef.current = null;
    prevVisibleKeyRef.current = '';
  }, [usePremiumOrder, legacyOrderKey, premiumOrderKey]);

  useLayoutEffect(() => {
    const len = visibleColumnOrder.length;
    const weightFn = getColumnWeightPxRef.current;
    const layoutKey = `${visibleColumnKey}|${expandedGroupsKey}`;
    if (prevVisibleKeyRef.current === layoutKey) return;

    // Expanded scroll layout: keep natural min-widths — do not force 100% widths.
    if (scrollLayoutActive) {
      prevVisibleLenRef.current = len;
      prevVisibleKeyRef.current = layoutKey;
      return;
    }

    if (weightFn && syncWidthsFromWeights) {
      syncWidthsFromWeights(visibleColumnOrder.map((col) => weightFn(col)));
    } else {
      syncWidths(len);
    }
    prevVisibleLenRef.current = len;
    prevVisibleKeyRef.current = layoutKey;
  }, [
    visibleColumnKey,
    expandedGroupsKey,
    scrollLayoutActive,
    syncWidths,
    syncWidthsFromWeights,
  ]);

  const toggleGroup = useCallback((parent: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(parent)) next.delete(parent);
      else next.add(parent);
      return next;
    });
  }, []);

  const isCollapseParent = useCallback(
    (col: string) => isCollapseParentColumn(col, groups, collapseEnabled),
    [groups, collapseEnabled],
  );

  const isGroupExpanded = useCallback(
    (parent: string) => expandedGroups.has(parent),
    [expandedGroups],
  );

  const moveColumn = useCallback(
    (fromKey: string, toKey: string, moveOptions?: { skipResize?: boolean }) => {
      const visFrom = visibleColumnOrder.indexOf(fromKey as T);
      const visTo = visibleColumnOrder.indexOf(toKey as T);
      if (visFrom < 0 || visTo < 0 || visFrom === visTo) return;

      setColumnOrder((prev) => moveColumnGroup(prev, fromKey, toKey, groups) as T[]);
      if (!moveOptions?.skipResize) resizeMoveColumn(visFrom, visTo);
    },
    [visibleColumnOrder, groups, resizeMoveColumn],
  );

  const resetColumns = useCallback(() => {
    const order = usePremiumOrder ? premiumColumnOrder : legacyColumnOrder;
    setColumnOrder([...order] as T[]);
    setExpandedGroups(new Set());
    resetWidths();
    prevVisibleLenRef.current = null;
    prevVisibleKeyRef.current = '';
  }, [usePremiumOrder, premiumOrderKey, legacyOrderKey, resetWidths]);

  return {
    columnOrder,
    visibleColumnOrder,
    hasExpandedGroups,
    scrollLayoutActive,
    fillWidthLayout,
    toggleGroup,
    isCollapseParent,
    isGroupExpanded,
    moveColumn,
    resetColumns,
  };
}
