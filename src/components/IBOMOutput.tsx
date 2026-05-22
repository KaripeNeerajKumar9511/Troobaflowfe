import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useModelStore, type Model } from '@/stores/modelStore';
import { useScenarioStore } from '@/stores/scenarioStore';
import { useResultsStore } from '@/stores/resultsStore';
import { type CalcResults, type ProductResult, getProductOutOfAreaTime } from '@/lib/calculationEngine';
import { scheduleIbomNodeTree, schedulePolePath } from '@/lib/ibomSchedule';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Network, Star, Package, RotateCcw } from 'lucide-react';

// ── 5-Segment MCT Colours (Section 1) ──
const MCT_SEGMENTS = [
  { key: 'waitEquip', label: 'Wait for Equipment', color: 'hsl(0, 72%, 51%)' },    // Red
  { key: 'waitLabor', label: 'Wait for Labor', color: 'hsl(45, 93%, 47%)' },        // Yellow
  { key: 'setup', label: 'Setup', color: 'hsl(217, 91%, 60%)' },                    // Blue
  { key: 'run', label: 'Run', color: 'hsl(142, 71%, 45%)' },                        // Green
  { key: 'lotWait', label: 'Wait for Lot', color: 'hsl(270, 50%, 60%)' },           // Purple
] as const;

type SegmentKey = typeof MCT_SEGMENTS[number]['key'];

interface MCTBreakdown {
  waitEquip: number;
  waitLabor: number;
  setup: number;
  run: number;
  lotWait: number;
  total: number;
}

function estimateColMinWidthPx(label: string, values: Array<string | number>, minPx = 80, maxPx = 320): number {
  let maxLen = label.length;
  for (const v of values) {
    const len = String(v ?? '').length;
    if (len > maxLen) maxLen = len;
  }
  const px = Math.round(maxLen * 8 + 24);
  return Math.max(minPx, Math.min(maxPx, px));
}

function fmt2(v: number): string {
  return Number.isFinite(v) ? v.toFixed(2) : '0.00';
}

function getBreakdown(pr: ProductResult | undefined, product: any): MCTBreakdown {
  if (!pr || product?.make_to_stock) {
    return { waitEquip: 0, waitLabor: 0, setup: 0, run: 0, lotWait: 0, total: 0 };
  }
  return {
    waitEquip: pr.mctQueue,
    waitLabor: pr.mctWaitLabor,
    setup: pr.mctSetup,
    run: pr.mctRun,
    lotWait: pr.mctLotWait,
    total: pr.mct,
  };
}

// ── Shared Header ──
function IBOMHeader({
  model, finalAssemblies, selectedProductId, onProductChange,
  scenarioId, onScenarioChange, scenarioLabel,
}: {
  model: Model;
  finalAssemblies: { id: string; name: string }[];
  selectedProductId: string;
  onProductChange: (id: string) => void;
  scenarioId: string;
  onScenarioChange: (id: string) => void;
  scenarioLabel: string;
}) {
  const allScenarios = useScenarioStore(s => s.scenarios);
  const modelScenarios = allScenarios.filter(s => s.modelId === model.id);
  const { getResults } = useResultsStore();
  const runScenarios = modelScenarios.filter(s => getResults(s.id));

  return (
    <div className="flex flex-wrap items-center gap-3 mb-2">
      <Select value={selectedProductId} onValueChange={onProductChange}>
        <SelectTrigger className="w-48 h-8 text-xs"><SelectValue placeholder="Select assembly..." /></SelectTrigger>
        <SelectContent>
          {finalAssemblies.map(p => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={scenarioId} onValueChange={onScenarioChange}>
        <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="basecase">Basecase</SelectItem>
          {runScenarios.map(s => (
            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-sm font-medium text-primary ml-1">{scenarioLabel}</span>
    </div>
  );
}

// ── MCT Legend ──
function MCTLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 py-2 px-1 border-t mt-4">
      {MCT_SEGMENTS.map(s => (
        <div key={s.key} className="flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
          <span className="text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Stacked Bar (horizontal) ──
function StackedMCTBar({
  breakdown, maxMCT, mctUnit, productName, isMTS = false, minWidth = 2,
}: {
  breakdown: MCTBreakdown; maxMCT: number; mctUnit: string; productName: string; isMTS?: boolean; minWidth?: number;
}) {
  if (isMTS) {
    return <Badge variant="secondary" className="text-[10px] font-mono bg-muted text-muted-foreground">MTS</Badge>;
  }
  if (breakdown.total <= 0 || maxMCT <= 0) {
    return <div className="h-5 w-1 bg-muted rounded" />;
  }
  const barWidth = Math.max(minWidth, (breakdown.total / maxMCT) * 100);
  const segments: { key: SegmentKey; value: number; color: string; label: string }[] = MCT_SEGMENTS
    .map(s => ({ key: s.key, value: breakdown[s.key], color: s.color, label: s.label }))
    .filter(s => s.value > 0);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex h-5 rounded overflow-hidden" style={{ width: `${barWidth}%`, minWidth: `${minWidth}px` }}>
        {segments.map(seg => {
          const pct = (seg.value / breakdown.total) * 100;
          return (
            <Tooltip key={seg.key}>
              <TooltipTrigger asChild>
                <div
                  className="h-full transition-all hover:brightness-110 cursor-default"
                  style={{ width: `${pct}%`, backgroundColor: seg.color, minWidth: seg.value > 0 ? '1px' : 0 }}
                />
              </TooltipTrigger>
              <TooltipContent className="text-xs font-mono">
                <p className="font-semibold">{productName} — {seg.label}: {seg.value.toFixed(2)} {mctUnit}</p>
                <p className="text-muted-foreground">Total MCT: {breakdown.total.toFixed(2)} {mctUnit}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

function DraggableHead({
  label,
  align = 'left',
  onDragStart,
  onDragOver,
  onDrop,
}: {
  label: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  onDragStart: () => void;
  onDragOver: (ev: React.DragEvent) => void;
  onDrop: () => void;
}) {
  return (
    <TableHead
      className={`font-mono text-xs whitespace-nowrap cursor-move ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {label}
    </TableHead>
  );
}

type IbomDetailColKey =
  | 'product'
  | 'level'
  | 'endTime'
  | 'startTime'
  | 'criticalPath'
  | 'waitEquip'
  | 'waitLabor'
  | 'setup'
  | 'run'
  | 'waitLot'
  | 'outOfArea';

type TreeTableColKey = IbomDetailColKey;

type PoleTableColKey = 'pole' | IbomDetailColKey;

const TREE_TABLE_DEFAULT_ORDER: TreeTableColKey[] = [
  'product', 'level', 'endTime', 'startTime', 'criticalPath',
  'waitEquip', 'waitLabor', 'setup', 'run', 'waitLot', 'outOfArea',
];

const POLE_TABLE_DEFAULT_ORDER: PoleTableColKey[] = [
  'pole', 'product', 'level', 'endTime', 'startTime', 'criticalPath',
  'waitEquip', 'waitLabor', 'setup', 'run', 'waitLot', 'outOfArea',
];

function ibomTableColumnLabel(colKey: TreeTableColKey | 'pole'): React.ReactNode {
  switch (colKey) {
    case 'pole': return 'Pole';
    case 'product': return 'Product Name';
    case 'level': return 'Level';
    case 'endTime': return 'End Time';
    case 'startTime': return 'Start Time';
    case 'criticalPath': return 'Manufacturing Critical-path Time';
    case 'waitEquip': return 'Time Waiting for Equip';
    case 'waitLabor': return 'Time Waiting for Labor';
    case 'setup': return 'Time in Setup';
    case 'run': return 'Time in Run';
    case 'waitLot': return 'Time Waiting for Rest of Lot';
    case 'outOfArea': return 'Time Out Of Area';
  }
}

function linearStepCriticalPaths(flowTimes: number[]): number[] {
  const cp = new Array<number>(flowTimes.length);
  for (let i = flowTimes.length - 1; i >= 0; i--) {
    cp[i] = flowTimes[i] + (i + 1 < flowTimes.length ? cp[i + 1] : 0);
  }
  return cp;
}

// ── IBOM tree node with breakdown ──
interface IBOMNodeData {
  productId: string;
  name: string;
  breakdown: MCTBreakdown;
  isMTS: boolean;
  unitsPerAssy: number;
  level: number;
  children: IBOMNodeData[];
  startTime: number;
  endTime: number;
  criticalPathTime: number;
  outOfAreaTime: number;
}

function buildNodeTree(model: Model, results: CalcResults, rootId: string, level: number, visited: Set<string>): IBOMNodeData {
  const product = model.products.find(p => p.id === rootId);
  const pr = results.products.find(p => p.id === rootId);
  const isMTS = product?.make_to_stock ?? false;
  const breakdown = getBreakdown(pr, product);
  const nextVisited = new Set(visited);
  nextVisited.add(rootId);
  const children = model.ibom
    .filter(e => e.parent_product_id === rootId && !visited.has(e.component_product_id))
    .map(e => ({
      ...buildNodeTree(model, results, e.component_product_id, level + 1, nextVisited),
      unitsPerAssy: e.units_per_assy,
    }));

  const tree: IBOMNodeData = {
    productId: rootId,
    name: product?.name || '?',
    breakdown,
    isMTS,
    unitsPerAssy: 1,
    level,
    children,
    startTime: 0,
    endTime: 0,
    criticalPathTime: 0,
    outOfAreaTime: getProductOutOfAreaTime(pr),
  };
  scheduleIbomNodeTree(tree);
  return tree;
}

function getMaxMCT(node: IBOMNodeData): number {
  return Math.max(node.breakdown.total, ...node.children.map(c => getMaxMCT(c)));
}

/** Longest flow-time branch (uses criticalPathTime from backward schedule). */
function getCriticalPathSet(node: IBOMNodeData): Set<string> {
  const path = new Set<string>();
  function walk(n: IBOMNodeData): void {
    path.add(n.productId);
    if (n.children.length === 0) return;
    let bestChild: IBOMNodeData | null = null;
    let bestCp = -1;
    for (const c of n.children) {
      if (c.criticalPathTime > bestCp) {
        bestCp = c.criticalPathTime;
        bestChild = c;
      }
    }
    if (bestChild) walk(bestChild);
  }
  walk(node);
  return path;
}

// Flatten tree depth-first for table
function flattenTree(node: IBOMNodeData): IBOMNodeData[] {
  const result: IBOMNodeData[] = [node];
  node.children.forEach(c => result.push(...flattenTree(c)));
  return result;
}

// Build poles (all root-to-leaf paths)
interface PolePathStep {
  productId: string;
  name: string;
  breakdown: MCTBreakdown;
  isMTS: boolean;
  level: number;
  startTime: number;
  endTime: number;
  criticalPathTime: number;
  outOfAreaTime: number;
}

interface Pole {
  path: PolePathStep[];
  totalBreakdown: MCTBreakdown;
  startTime: number;
  endTime: number;
  criticalPathTime: number;
}

interface PoleTableRow extends PolePathStep {
  poleIndex: number;
  poleLabel: string;
  isCriticalPole: boolean;
}

function flattenPolesForTable(poles: Pole[]): PoleTableRow[] {
  const rows: PoleTableRow[] = [];
  poles.forEach((pole, poleIndex) => {
    pole.path.forEach(step => {
      rows.push({
        ...step,
        poleIndex,
        poleLabel: `Pole ${poleIndex + 1}`,
        isCriticalPole: poleIndex === 0,
      });
    });
  });
  return rows;
}

function buildPoles(node: IBOMNodeData): Pole[] {
  const poles: Pole[] = [];
  function traverse(n: IBOMNodeData, currentPath: Array<Pick<PolePathStep, 'productId' | 'name' | 'breakdown' | 'isMTS' | 'outOfAreaTime'>>) {
    const step = {
      productId: n.productId,
      name: n.name,
      breakdown: n.breakdown,
      isMTS: n.isMTS,
      outOfAreaTime: n.outOfAreaTime,
    };
    const newPath = [...currentPath, step];
    if (n.children.length === 0) {
      const totalBreakdown: MCTBreakdown = {
        waitEquip: newPath.reduce((s, p) => s + p.breakdown.waitEquip, 0),
        waitLabor: newPath.reduce((s, p) => s + p.breakdown.waitLabor, 0),
        setup: newPath.reduce((s, p) => s + p.breakdown.setup, 0),
        run: newPath.reduce((s, p) => s + p.breakdown.run, 0),
        lotWait: newPath.reduce((s, p) => s + p.breakdown.lotWait, 0),
        total: newPath.reduce((s, p) => s + p.breakdown.total, 0),
      };
      const flowSteps = newPath.map(p => ({
        id: p.productId,
        flowTime: p.isMTS ? 0 : p.breakdown.total,
      }));
      const flowTimes = flowSteps.map(s => s.flowTime);
      const scheduled = schedulePolePath(flowSteps);
      const stepCriticalPaths = linearStepCriticalPaths(flowTimes);
      const enrichedPath: PolePathStep[] = newPath.map((p, idx) => ({
        ...p,
        level: idx + 1,
        startTime: scheduled.stepTimes[idx]?.startTime ?? 0,
        endTime: scheduled.stepTimes[idx]?.endTime ?? 0,
        criticalPathTime: stepCriticalPaths[idx] ?? 0,
      }));
      poles.push({
        path: enrichedPath,
        totalBreakdown,
        startTime: scheduled.startTime,
        endTime: scheduled.endTime,
        criticalPathTime: scheduled.criticalPathTime,
      });
    } else {
      n.children.forEach(c => traverse(c, newPath));
    }
  }
  traverse(node, []);
  return poles.sort((a, b) => b.totalBreakdown.total - a.totalBreakdown.total);
}

// ════════════════════════════════════════════════════════════
//  TREE CHART (Section 2)
// ════════════════════════════════════════════════════════════
function TreeChart({ model, results, tree, mctUnit }: {
  model: Model; results: CalcResults; tree: IBOMNodeData; mctUnit: string;
}) {
  const maxMCT = useMemo(() => getMaxMCT(tree), [tree]);
  const criticalPath = useMemo(() => getCriticalPathSet(tree), [tree]);
  const scale = 1;

  const renderNode = (node: IBOMNodeData, depth: number) => {
    const isCritical = criticalPath.has(node.productId);
    return (
      <div key={`${node.productId}-${depth}`} style={{ marginLeft: depth > 0 ? 24 * scale : 0 }}>
        <div className={`flex items-center gap-2 py-1 px-2 rounded-md mb-0.5 ${
          isCritical ? 'border-l-2 border-amber-400 bg-amber-50/40 dark:bg-amber-900/10' : ''
        }`}>
          <span className="text-xs font-mono font-medium shrink-0 w-20 truncate" style={{ fontSize: 12 * scale }}>
            {node.name}
          </span>
          {node.unitsPerAssy > 1 && (
            <Badge variant="secondary" className="text-[9px] h-4 px-1" style={{ fontSize: 9 * scale }}>×{node.unitsPerAssy}</Badge>
          )}
          <div className="flex-1 max-w-md">
            <StackedMCTBar breakdown={node.breakdown} maxMCT={maxMCT} mctUnit={mctUnit} productName={node.name} isMTS={node.isMTS} />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap" style={{ fontSize: 10 * scale }}>
            {node.isMTS ? '' : `${node.breakdown.total.toFixed(2)} ${mctUnit}`}
          </span>
          {isCritical && depth === 0 && (
            <Badge variant="outline" className="text-[9px] border-amber-400 text-amber-600 gap-0.5">
              <Star className="h-2.5 w-2.5" /> Critical Path
            </Badge>
          )}
        </div>
        {node.children.length > 0 && (
          <div className="border-l border-border ml-3" style={{ marginLeft: 12 * scale }}>
            {node.children.map((c, i) => renderNode(c, 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
      {renderNode(tree, 0)}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  TREE TABLE (Section 3)
// ════════════════════════════════════════════════════════════
function TreeTable({ model, results, tree, mctUnit }: {
  model: Model; results: CalcResults; tree: IBOMNodeData; mctUnit: string;
}) {
  const [columnOrder, setColumnOrder] = useState<TreeTableColKey[]>(TREE_TABLE_DEFAULT_ORDER);
  const dragFromRef = useRef<string | null>(null);
  const moveColumn = useCallback((fromKey: string, toKey: string) => {
    const fromIndex = columnOrder.indexOf(fromKey as TreeTableColKey);
    const toIndex = columnOrder.indexOf(toKey as TreeTableColKey);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    setColumnOrder(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, [columnOrder]);
  const resetColumns = useCallback(() => setColumnOrder(TREE_TABLE_DEFAULT_ORDER), []);

  const rows = useMemo(() => flattenTree(tree), [tree]);
  const minWidthByKey = useMemo((): Record<TreeTableColKey, number> => ({
    product: estimateColMinWidthPx('Product Name', rows.map(r => r.name), 120, 260),
    level: estimateColMinWidthPx('Level', rows.map(r => r.level + 1), 70, 90),
    endTime: estimateColMinWidthPx('End Time', rows.map(r => fmt2(r.endTime)), 95, 130),
    startTime: estimateColMinWidthPx('Start Time', rows.map(r => fmt2(r.startTime)), 95, 130),
    criticalPath: estimateColMinWidthPx('Manufacturing Critical-path Time', rows.map(r => fmt2(r.criticalPathTime)), 200, 280),
    waitEquip: estimateColMinWidthPx('Time Waiting for Equip', rows.map(r => fmt2(r.breakdown.waitEquip)), 150, 200),
    waitLabor: estimateColMinWidthPx('Time Waiting for Labor', rows.map(r => fmt2(r.breakdown.waitLabor)), 150, 200),
    setup: estimateColMinWidthPx('Time in Setup', rows.map(r => fmt2(r.breakdown.setup)), 120, 160),
    run: estimateColMinWidthPx('Time in Run', rows.map(r => fmt2(r.breakdown.run)), 120, 160),
    waitLot: estimateColMinWidthPx('Time Waiting for Rest of Lot', rows.map(r => fmt2(r.breakdown.lotWait)), 180, 220),
    outOfArea: estimateColMinWidthPx('Time Out Of Area', rows.map(r => fmt2(r.outOfAreaTime)), 140, 180),
  }), [rows]);

  const renderTreeCell = (r: IBOMNodeData, colKey: TreeTableColKey) => {
    const numCell = 'font-mono text-xs text-right whitespace-nowrap tabular-nums';
    switch (colKey) {
      case 'product':
        return (
          <TableCell key={colKey} className="font-mono text-xs whitespace-nowrap" style={{ paddingLeft: 12 + r.level * 16 }}>
            <span className={r.level === 0 ? 'font-bold' : ''}>{r.name}</span>
            {r.unitsPerAssy > 1 && (
              <span className="text-muted-foreground ml-1">×{r.unitsPerAssy}</span>
            )}
          </TableCell>
        );
      case 'level':
        return <TableCell key={colKey} className="font-mono text-xs text-center whitespace-nowrap tabular-nums">{r.level + 1}</TableCell>;
      case 'endTime':
        return <TableCell key={colKey} className={numCell}>{fmt2(r.endTime)}</TableCell>;
      case 'startTime':
        return <TableCell key={colKey} className={numCell}>{fmt2(r.startTime)}</TableCell>;
      case 'criticalPath':
        return <TableCell key={colKey} className={numCell}>{fmt2(r.criticalPathTime)}</TableCell>;
      case 'waitEquip':
        return <TableCell key={colKey} className={numCell}>{fmt2(r.breakdown.waitEquip)}</TableCell>;
      case 'waitLabor':
        return <TableCell key={colKey} className={numCell}>{fmt2(r.breakdown.waitLabor)}</TableCell>;
      case 'setup':
        return <TableCell key={colKey} className={numCell}>{fmt2(r.breakdown.setup)}</TableCell>;
      case 'run':
        return <TableCell key={colKey} className={numCell}>{fmt2(r.breakdown.run)}</TableCell>;
      case 'waitLot':
        return <TableCell key={colKey} className={numCell}>{fmt2(r.breakdown.lotWait)}</TableCell>;
      case 'outOfArea':
        return <TableCell key={colKey} className={numCell}>{fmt2(r.outOfAreaTime)}</TableCell>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end mb-2">
        <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={resetColumns}>
          <RotateCcw className="h-3 w-3" />
          Reset Columns
        </Button>
      </div>
      <Table className="table-auto">
        <colgroup>
          {columnOrder.map(colKey => (
            <col key={colKey} style={{ minWidth: `${minWidthByKey[colKey]}px` }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            {columnOrder.map(colKey => (
              <DraggableHead
                key={colKey}
                label={ibomTableColumnLabel(colKey)}
                align={
                  colKey === 'product' ? 'left' :
                  colKey === 'level' ? 'center' : 'right'
                }
                onDragStart={() => { dragFromRef.current = colKey; }}
                onDragOver={ev => ev.preventDefault()}
                onDrop={() => {
                  if (dragFromRef.current) moveColumn(dragFromRef.current, colKey);
                  dragFromRef.current = null;
                }}
              />
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={`${r.productId}-${i}`}>
              {columnOrder.map(colKey => renderTreeCell(r, colKey))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  POLES CHART (Section 4)
// ════════════════════════════════════════════════════════════
function PolesChart({ model, poles, mctUnit }: {
  model: Model; poles: Pole[]; mctUnit: string;
}) {
  const maxMCT = poles[0]?.totalBreakdown.total || 1;
  const scale = 1;
  const barMinWidth = 48 * scale;

  if (poles.length === 0) return null;

  const criticalDesc = poles[0].path.map(p => p.name).reverse().join(' → ');

  return (
    <div>
      <div className="flex items-end gap-3 overflow-x-auto pb-2" style={{ minHeight: 200 * scale }}>
        {poles.map((pole, i) => {
          const heightPct = (pole.totalBreakdown.total / maxMCT) * 100;
          const isCritical = i === 0;
          const segments = MCT_SEGMENTS
            .map(s => ({ key: s.key, value: pole.totalBreakdown[s.key], color: s.color, label: s.label }))
            .filter(s => s.value > 0);

          return (
            <TooltipProvider key={i} delayDuration={100}>
              <div className="flex flex-col items-center shrink-0" style={{ minWidth: barMinWidth }}>
                {isCritical && (
                  <Badge variant="outline" className="text-[8px] border-amber-400 text-amber-600 mb-1 whitespace-nowrap" style={{ fontSize: 8 * scale }}>
                    Critical Path
                  </Badge>
                )}
                <div
                  className={`flex flex-col-reverse rounded overflow-hidden ${isCritical ? 'ring-2 ring-amber-400' : ''}`}
                  style={{ height: `${Math.max(4, heightPct * 1.8)}px`, width: barMinWidth }}
                >
                  {segments.map(seg => {
                    const segPct = (seg.value / pole.totalBreakdown.total) * 100;
                    return (
                      <Tooltip key={seg.key}>
                        <TooltipTrigger asChild>
                          <div
                            className="w-full transition-all hover:brightness-110 cursor-default"
                            style={{ height: `${segPct}%`, backgroundColor: seg.color, minHeight: seg.value > 0 ? 1 : 0 }}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="text-xs font-mono">
                          <p>{seg.label}: {seg.value.toFixed(2)} {mctUnit}</p>
                          <p className="text-muted-foreground">Total: {pole.totalBreakdown.total.toFixed(2)} {mctUnit}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
                <span className="text-[9px] font-mono text-muted-foreground mt-1 text-center" style={{ fontSize: 9 * scale, maxWidth: barMinWidth + 20 }}>
                  {pole.totalBreakdown.total.toFixed(2)}
                </span>
                <span className="text-[8px] font-mono text-muted-foreground text-center leading-tight mt-0.5" style={{ fontSize: 8 * scale, maxWidth: barMinWidth + 30 }}>
                  {pole.path.map(p => p.name).reverse().join(' / ')}
                </span>
              </div>
            </TooltipProvider>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-2 italic">
        The critical path is <span className="font-medium text-foreground">{criticalDesc}</span>. Focus MCT reduction efforts here first.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  POLES TABLE (Section 5)
// ════════════════════════════════════════════════════════════
function PolesTable({ model, poles, mctUnit }: {
  model: Model; poles: Pole[]; mctUnit: string;
}) {
  if (poles.length === 0) return null;
  const [columnOrder, setColumnOrder] = useState<PoleTableColKey[]>(POLE_TABLE_DEFAULT_ORDER);
  const dragFromRef = useRef<string | null>(null);
  const moveColumn = useCallback((fromKey: string, toKey: string) => {
    const fromIndex = columnOrder.indexOf(fromKey as PoleTableColKey);
    const toIndex = columnOrder.indexOf(toKey as PoleTableColKey);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    setColumnOrder(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, [columnOrder]);
  const resetColumns = useCallback(() => setColumnOrder(POLE_TABLE_DEFAULT_ORDER), []);

  const rows = useMemo(() => flattenPolesForTable(poles), [poles]);
  const minWidthByKey = useMemo((): Record<PoleTableColKey, number> => ({
    pole: estimateColMinWidthPx('Pole', rows.map(r => r.poleLabel), 70, 100),
    product: estimateColMinWidthPx('Product Name', rows.map(r => r.name), 120, 260),
    level: estimateColMinWidthPx('Level', rows.map(r => r.level), 70, 90),
    endTime: estimateColMinWidthPx('End Time', rows.map(r => fmt2(r.endTime)), 95, 130),
    startTime: estimateColMinWidthPx('Start Time', rows.map(r => fmt2(r.startTime)), 95, 130),
    criticalPath: estimateColMinWidthPx('Manufacturing Critical-path Time', rows.map(r => fmt2(r.criticalPathTime)), 200, 280),
    waitEquip: estimateColMinWidthPx('Time Waiting for Equip', rows.map(r => fmt2(r.breakdown.waitEquip)), 150, 200),
    waitLabor: estimateColMinWidthPx('Time Waiting for Labor', rows.map(r => fmt2(r.breakdown.waitLabor)), 150, 200),
    setup: estimateColMinWidthPx('Time in Setup', rows.map(r => fmt2(r.breakdown.setup)), 120, 160),
    run: estimateColMinWidthPx('Time in Run', rows.map(r => fmt2(r.breakdown.run)), 120, 160),
    waitLot: estimateColMinWidthPx('Time Waiting for Rest of Lot', rows.map(r => fmt2(r.breakdown.lotWait)), 180, 220),
    outOfArea: estimateColMinWidthPx('Time Out Of Area', rows.map(r => fmt2(r.outOfAreaTime)), 140, 180),
  }), [rows]);

  const renderPoleCell = (r: PoleTableRow, colKey: PoleTableColKey) => {
    const numCell = 'font-mono text-xs text-right whitespace-nowrap tabular-nums';
    switch (colKey) {
      case 'pole':
        return <TableCell key={colKey} className="font-mono text-xs whitespace-nowrap tabular-nums">{r.poleLabel}</TableCell>;
      case 'product':
        return (
          <TableCell key={colKey} className="font-mono text-xs whitespace-nowrap">
            <span className={r.level === 1 ? 'font-bold' : ''}>{r.name}</span>
          </TableCell>
        );
      case 'level':
        return <TableCell key={colKey} className="font-mono text-xs text-center whitespace-nowrap tabular-nums">{r.level}</TableCell>;
      case 'endTime':
        return <TableCell key={colKey} className={numCell}>{fmt2(r.endTime)}</TableCell>;
      case 'startTime':
        return <TableCell key={colKey} className={numCell}>{fmt2(r.startTime)}</TableCell>;
      case 'criticalPath':
        return <TableCell key={colKey} className={numCell}>{fmt2(r.criticalPathTime)}</TableCell>;
      case 'waitEquip':
        return <TableCell key={colKey} className={numCell}>{fmt2(r.breakdown.waitEquip)}</TableCell>;
      case 'waitLabor':
        return <TableCell key={colKey} className={numCell}>{fmt2(r.breakdown.waitLabor)}</TableCell>;
      case 'setup':
        return <TableCell key={colKey} className={numCell}>{fmt2(r.breakdown.setup)}</TableCell>;
      case 'run':
        return <TableCell key={colKey} className={numCell}>{fmt2(r.breakdown.run)}</TableCell>;
      case 'waitLot':
        return <TableCell key={colKey} className={numCell}>{fmt2(r.breakdown.lotWait)}</TableCell>;
      case 'outOfArea':
        return <TableCell key={colKey} className={numCell}>{fmt2(r.outOfAreaTime)}</TableCell>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end mb-2">
        <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={resetColumns}>
          <RotateCcw className="h-3 w-3" />
          Reset Columns
        </Button>
      </div>
      <Table className="table-auto">
        <colgroup>
          {columnOrder.map(colKey => (
            <col key={colKey} style={{ minWidth: `${minWidthByKey[colKey]}px` }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow>
            {columnOrder.map(colKey => (
              <DraggableHead
                key={colKey}
                label={ibomTableColumnLabel(colKey)}
                align={
                  colKey === 'product' || colKey === 'pole' ? 'left' :
                  colKey === 'level' ? 'center' : 'right'
                }
                onDragStart={() => { dragFromRef.current = colKey; }}
                onDragOver={ev => ev.preventDefault()}
                onDrop={() => {
                  if (dragFromRef.current) moveColumn(dragFromRef.current, colKey);
                  dragFromRef.current = null;
                }}
              />
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={`${r.poleIndex}-${r.productId}-${i}`}>
              {columnOrder.map(colKey => renderPoleCell(r, colKey))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="border-t px-3 py-2 text-xs font-mono">
        <span className="font-semibold">Critical path MCT: {poles[0].totalBreakdown.total.toFixed(2)} {mctUnit}</span>
        <span className="text-muted-foreground"> — {poles[0].path.map(p => p.name).reverse().join(' → ')}</span>
      </div>
    </div>
  );
}

// Export sub-components and utilities for use in RunResults IBOM tab
export { TreeChart, TreeTable, PolesChart, PolesTable, MCTLegend, buildNodeTree, buildPoles, getMaxMCT };
export type { IBOMNodeData, Pole };

// ════════════════════════════════════════════════════════════
//  MAIN IBOM OUTPUT COMPONENT (legacy, kept for compatibility)
// ════════════════════════════════════════════════════════════
export default function IBOMOutput({ model, isRunning }: { model: Model; isRunning?: boolean }) {
  const { getResults } = useResultsStore();
  const allScenarios = useScenarioStore(s => s.scenarios);

  // Find final assemblies: products that are parents but not components of other products
  const finalAssemblies = useMemo(() => {
    const parentIds = new Set(model.ibom.map(e => e.parent_product_id));
    const componentIds = new Set(model.ibom.map(e => e.component_product_id));
    // Products that are parents but not children
    const topLevel = model.products.filter(p => parentIds.has(p.id) && !componentIds.has(p.id));
    // If none, fall back to products with demand > 0 that are parents
    if (topLevel.length === 0) {
      return model.products.filter(p => parentIds.has(p.id));
    }
    return topLevel;
  }, [model]);

  const [selectedProductId, setSelectedProductId] = useState(() => finalAssemblies[0]?.id || '');
  const [scenarioId, setScenarioId] = useState('basecase');
  const [activeTab, setActiveTab] = useState('tree-chart');

  const results = getResults(scenarioId);
  const scenario = allScenarios.find(s => s.id === scenarioId);
  const scenarioLabel = scenarioId === 'basecase' ? 'Basecase results' : `${scenario?.name || 'What-if'} results`;
  const mctUnit = model.general.mct_time_unit.toLowerCase() + 's';

  // No IBOM structure
  if (model.ibom.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Network className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground font-medium">No IBOM structure defined.</p>
          <p className="text-xs text-muted-foreground">Go to Input → IBOM to add component relationships between products.</p>
        </CardContent>
      </Card>
    );
  }

  // No final assemblies
  if (finalAssemblies.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Package className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">No IBOM structure defined. Go to Input → IBOM to add component relationships.</p>
        </CardContent>
      </Card>
    );
  }

  // No results
  if (!results) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          {isRunning ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
              <Skeleton className="h-40 w-full max-w-lg mx-auto" />
            </div> 
          ) : (
            <>
              <Network className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground font-medium">No results yet</p>
              <p className="text-xs text-muted-foreground">Run Full Calculate to generate IBOM output.</p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Selected product has no children
  const hasChildren = model.ibom.some(e => e.parent_product_id === selectedProductId);
  if (!hasChildren && selectedProductId) {
    return (
      <Card>
        <CardContent className="pt-4">
          <IBOMHeader
            model={model} finalAssemblies={finalAssemblies}
            selectedProductId={selectedProductId} onProductChange={setSelectedProductId}
            scenarioId={scenarioId} onScenarioChange={setScenarioId}
            scenarioLabel={scenarioLabel}
          />
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">This product has no components. Select a product with sub-assemblies to view the IBOM tree.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tree = buildNodeTree(model, results, selectedProductId, 0, new Set());
  const poles = buildPoles(tree);

  return (
    <Card>
      <CardContent className="pt-4">
        <IBOMHeader
          model={model} finalAssemblies={finalAssemblies}
          selectedProductId={selectedProductId} onProductChange={setSelectedProductId}
          scenarioId={scenarioId} onScenarioChange={setScenarioId}
          scenarioLabel={scenarioLabel}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-3">
            <TabsList>
              <TabsTrigger value="tree-chart" className="text-xs">Tree Chart</TabsTrigger>
              <TabsTrigger value="tree-table" className="text-xs">Tree Table</TabsTrigger>
              <TabsTrigger value="poles-chart" className="text-xs">Poles Chart</TabsTrigger>
              <TabsTrigger value="poles-table" className="text-xs">Poles Table</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="tree-chart">
            <TreeChart model={model} results={results} tree={tree} mctUnit={mctUnit} />
            <MCTLegend />
          </TabsContent>

          <TabsContent value="tree-table">
            <TreeTable model={model} results={results} tree={tree} mctUnit={mctUnit} />
          </TabsContent>

          <TabsContent value="poles-chart">
            <PolesChart model={model} poles={poles} mctUnit={mctUnit} />
            <MCTLegend />
          </TabsContent>

          <TabsContent value="poles-table">
            <PolesTable model={model} poles={poles} mctUnit={mctUnit} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Export the standard 5 MCT segment colours for use in Product MCT chart
export const MCT_COLORS = {
  waitEquip: MCT_SEGMENTS[0].color,  // Red - Wait for Equipment (queue)
  waitLabor: MCT_SEGMENTS[1].color,  // Yellow - Wait for Labor
  setup: MCT_SEGMENTS[2].color,      // Blue - Setup
  run: MCT_SEGMENTS[3].color,        // Green - Run
  lotWait: MCT_SEGMENTS[4].color,    // Purple - Wait for Lot
};
