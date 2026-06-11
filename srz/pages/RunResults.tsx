// Legacy page implementation
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, Lock } from 'lucide-react';
import { useSortableTable, type SortDir } from '@/hooks/useSortableTable';
import { useModelStore, type Model } from '@/stores/modelStore';
import { useScenarioStore } from '@/stores/scenarioStore';
import { useResultsStore } from '@/stores/resultsStore';
import { getScenarioColor } from '@/lib/scenarioColors';
import { type CalcResults, type ProductResult, type EquipmentResult, type LaborResult, isUtilOnlyCalcResults } from '@/lib/calculationEngine';
import { fullCalculate } from '@/lib/simulationApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/Checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip as ShadTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Play, CheckCircle, AlertTriangle, Shield, XCircle, RotateCcw, ArrowLeftRight, Network, Gauge, RefreshCw, Clock,
  TrendingUp, BarChart3, Settings2, Square, ChevronRight, ToggleLeft, Layers,BadgeCheck,
} from 'lucide-react';
import IBOMOutput, { MCT_COLORS, TreeChart, TreeTable, PolesChart, PolesTable, MCTLegend, buildNodeTree, buildPoles } from '@/components/IBOMOutput';
import { toast } from 'sonner';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useRunCalculation, type RunMode } from '@/hooks/useRunCalculation';
import { useRunIssueBannerDismiss, type RunIssueDismissPersist } from '@/hooks/useRunIssueBannerDismiss';
import {
  RunResultsIssueBanners,
  RunResultsIssuesDialog,
  hasAnyIssueMessages,
} from '@/components/run/RunResultsIssueBanners';
import { ProductGroupSummaryTable } from '@/components/run/ProductGroupSummaryTable';
import { useUserLevelStore, isVisible } from '@/hooks/useUserLevel';
import { scenarioDb } from '@/lib/scenarioDb';
import ScenarioContextBar from '@/components/ScenarioContextBar';
import ChartScenarioLabel from '@/components/ChartScenarioLabel';
import { RechartsTooltipWithTotal } from '@/components/charts/RechartsTooltipWithTotal';
import { NonNegativeNumericInput } from '@/components/NonNegativeNumericInput';

// ── Scenario color palettes for grouped charts ──
const SCENARIO_PALETTES = [
  { setup: 'hsl(217, 91%, 75%)', run: 'hsl(217, 91%, 55%)', repair: 'hsl(217, 70%, 40%)', waitLabor: 'hsl(217, 60%, 30%)', unavail: 'hsl(217, 30%, 50%)', lotWait: 'hsl(217, 91%, 80%)', queue: 'hsl(217, 70%, 45%)', single: 'hsl(217, 91%, 60%)' },
  { setup: 'hsl(160, 60%, 70%)', run: 'hsl(160, 60%, 45%)', repair: 'hsl(160, 50%, 35%)', waitLabor: 'hsl(160, 40%, 25%)', unavail: 'hsl(160, 25%, 45%)', lotWait: 'hsl(160, 60%, 75%)', queue: 'hsl(160, 50%, 40%)', single: 'hsl(160, 60%, 45%)' },
  { setup: 'hsl(30, 90%, 75%)', run: 'hsl(30, 90%, 55%)', repair: 'hsl(30, 70%, 40%)', waitLabor: 'hsl(30, 60%, 30%)', unavail: 'hsl(30, 30%, 50%)', lotWait: 'hsl(30, 90%, 80%)', queue: 'hsl(30, 70%, 45%)', single: 'hsl(30, 90%, 55%)' },
  { setup: 'hsl(280, 60%, 75%)', run: 'hsl(280, 60%, 55%)', repair: 'hsl(280, 50%, 40%)', waitLabor: 'hsl(280, 40%, 30%)', unavail: 'hsl(280, 25%, 45%)', lotWait: 'hsl(280, 60%, 80%)', queue: 'hsl(280, 50%, 45%)', single: 'hsl(280, 60%, 55%)' },
  { setup: 'hsl(0, 70%, 75%)', run: 'hsl(0, 70%, 55%)', repair: 'hsl(0, 55%, 40%)', waitLabor: 'hsl(0, 45%, 30%)', unavail: 'hsl(0, 25%, 45%)', lotWait: 'hsl(0, 70%, 80%)', queue: 'hsl(0, 55%, 45%)', single: 'hsl(0, 70%, 55%)' },
];

// Single-scenario colors — use consistent 5-segment MCT colours for product charts
const chartColors = {
  setup: MCT_COLORS.setup, run: MCT_COLORS.run,
  repair: 'hsl(0, 72%, 51%)', waitLabor: MCT_COLORS.waitLabor,
  unavail: 'hsl(220, 9%, 46%)', lotWait: MCT_COLORS.lotWait, queue: MCT_COLORS.waitEquip,
};

type ScenarioEntry = { id: string; name: string; results: CalcResults };

function asNum(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function roundTo(v: unknown, digits: number): number {
  const n = asNum(v);
  const f = 10 ** digits;
  return Math.round((n + Number.EPSILON) * f) / f;
}

function estimateColMinWidthPx(label: string, values: Array<string | number>, minPx = 90, maxPx = 320): number {
  let maxLen = label.length;
  for (const v of values) {
    const len = String(v ?? '').length;
    if (len > maxLen) maxLen = len;
  }
  const px = Math.round(maxLen * 8 + 28);
  return Math.max(minPx, Math.min(maxPx, px));
}

function fmtFixed(v: unknown, digits: number): string {
  return roundTo(v, digits).toFixed(digits);
}

function opResultFor(results: CalcResults, op: any) {
  const list = results.operations || [];
  const matched = list.filter((o: any) => {
    const sameId =
      String(o.op_id ?? o.opId ?? o.id ?? o.operation_id ?? '') === String(op.id);
    const sameName =
      String(o.operation ?? o.op_name ?? o.opName ?? '') === String(op.op_name ?? op.operation ?? '');
    const sameProduct =
      String(o.product_id ?? o.productId ?? '') === String(op.product_id ?? '');
    return sameId || (sameProduct && sameName);
  });
  if (!matched.length) return undefined;
  const summed = matched.reduce(
    (acc: any, o: any) => {
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
      acc.visits_per_good = Math.max(acc.visits_per_good, asNum(o.visits_per_good ?? o.vpergood));
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
  return summed;
}

function buildGroupedEquipData(scenarios: ScenarioEntry[]) {
  if (scenarios.length === 0) return { data: [], bars: [] };
  const names = scenarios[0].results.equipment.map(e => e.name);
  const data = names.map(name => {
    const row: Record<string, any> = { name };
    scenarios.forEach((s, i) => {
      const eq = s.results.equipment.find(e => e.name === name);
      const prefix = `s${i}_`;
      row[prefix + 'setup'] = eq?.setupUtil || 0;
      row[prefix + 'run'] = eq?.runUtil || 0;
      row[prefix + 'repair'] = eq?.repairUtil || 0;
      row[prefix + 'waitLabor'] = eq?.waitLaborUtil || 0;
    });
    return row;
  });
  const bars = scenarios.map((s, i) => ({
    prefix: `s${i}_`,
    stackId: `s${i}`,
    name: s.name,
    palette: SCENARIO_PALETTES[i % SCENARIO_PALETTES.length],
  }));
  return { data, bars };
}

function buildGroupedLaborData(scenarios: ScenarioEntry[]) {
  if (scenarios.length === 0) return { data: [], bars: [] };
  const names = scenarios[0].results.labor.map(l => l.name);
  const data = names.map(name => {
    const row: Record<string, any> = { name };
    scenarios.forEach((s, i) => {
      const l = s.results.labor.find(l => l.name === name);
      const prefix = `s${i}_`;
      row[prefix + 'setup'] = l?.setupUtil || 0;
      row[prefix + 'run'] = l?.runUtil || 0;
      row[prefix + 'unavail'] = l?.unavailPct || 0;
    });
    return row;
  });
  const bars = scenarios.map((s, i) => ({
    prefix: `s${i}_`,
    stackId: `s${i}`,
    name: s.name,
    palette: SCENARIO_PALETTES[i % SCENARIO_PALETTES.length],
  }));
  return { data, bars };
}

function buildGroupedProductMCTData(scenarios: ScenarioEntry[]) {
  if (scenarios.length === 0) return { data: [], bars: [] };
  const names = scenarios[0].results.products.map(p => p.name);
  const data = names.map(name => {
    const row: Record<string, any> = { name };
    scenarios.forEach((s, i) => {
      const p = s.results.products.find(p => p.name === name);
      const prefix = `s${i}_`;
      row[prefix + 'lotWait'] = p?.mctLotWait || 0;
      row[prefix + 'queue'] = p?.mctQueue || 0;
      row[prefix + 'waitLabor'] = p?.mctWaitLabor || 0;
      row[prefix + 'setup'] = p?.mctSetup || 0;
      row[prefix + 'run'] = p?.mctRun || 0;
    });
    return row;
  });
  const bars = scenarios.map((s, i) => ({
    prefix: `s${i}_`,
    stackId: `s${i}`,
    name: s.name,
    palette: SCENARIO_PALETTES[i % SCENARIO_PALETTES.length],
  }));
  return { data, bars };
}

function buildGroupedProductWIPData(scenarios: ScenarioEntry[]) {
  if (scenarios.length === 0) return { data: [], bars: [] };
  const names = scenarios[0].results.products.map(p => p.name);
  const data = names.map(name => {
    const row: Record<string, any> = { name };
    scenarios.forEach((s, i) => {
      const p = s.results.products.find(p => p.name === name);
      row[`s${i}_wip`] = p?.wip || 0;
    });
    return row;
  });
  const bars = scenarios.map((s, i) => ({
    prefix: `s${i}_`,
    stackId: `s${i}`,
    name: s.name,
    palette: SCENARIO_PALETTES[i % SCENARIO_PALETTES.length],
  }));
  return { data, bars };
}

// Re-export RechartsTooltip as Tooltip for chart usage (ShadTooltip used for UI tooltips)
const Tooltip = RechartsTooltip;
const tooltipStyle = { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 12 };
const axisStyle = { fontSize: 11, fontFamily: 'JetBrains Mono' };

/* ─── Sortable Table Header ─── */
function useResizableColumns(initialWidths: number[], minWidthPercent = 8) {
  const [widths, setWidths] = useState<number[]>(initialWidths);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initialWidthsRef = useRef<number[]>(initialWidths);

  const startResize = useCallback((index: number, ev: React.MouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (index < 0 || index >= widths.length - 1) return;
    const containerWidth = containerRef.current?.getBoundingClientRect().width ?? 0;
    if (!containerWidth) return;

    const startX = ev.clientX;
    const startWidths = [...widths];

    const onMouseMove = (moveEv: MouseEvent) => {
      const deltaPercent = ((moveEv.clientX - startX) / containerWidth) * 100;
      let left = startWidths[index] + deltaPercent;
      let right = startWidths[index + 1] - deltaPercent;

      if (left < minWidthPercent) {
        right -= minWidthPercent - left;
        left = minWidthPercent;
      }
      if (right < minWidthPercent) {
        left -= minWidthPercent - right;
        right = minWidthPercent;
      }

      setWidths(prev => prev.map((w, i) => {
        if (i === index) return left;
        if (i === index + 1) return right;
        return w;
      }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [minWidthPercent, widths]);

  const moveColumn = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= widths.length || toIndex >= widths.length) return;
    setWidths(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, [widths.length]);

  const resetWidths = useCallback(() => {
    setWidths([...initialWidthsRef.current]);
  }, []);

  const syncWidths = useCallback((count: number) => {
    const equal = Array(Math.max(count, 1)).fill(100 / Math.max(count, 1));
    initialWidthsRef.current = equal;
    setWidths(equal);
  }, []);

  return { widths, containerRef, startResize, moveColumn, resetWidths, syncWidths };
}

const PRODUCT_TABLE_SCROLL_CLASS = 'max-h-[min(70vh,32rem)] overflow-auto [&>div]:overflow-visible';
const PRODUCT_TABLE_STICKY_TOP = 'sticky top-0 z-20 bg-[#F4F6F8] shadow-[0_1px_0_0_hsl(var(--border))]';
const PRODUCT_TABLE_STICKY_TOP_LEFT = 'sticky top-0 left-0 z-30 bg-[#F4F6F8] shadow-[2px_1px_0_0_hsl(var(--border))]';
/** Shrink numeric columns to content width; extra table width goes to name / long headers. */
const PRODUCT_TABLE_NUMERIC_HEAD = 'w-px max-w-none';
const PRODUCT_TABLE_NUMERIC_CELL = 'w-px max-w-none';
/** Match transpose view: semibold foreground labels (not muted uppercase). */
const PRODUCT_TABLE_COLUMN_HEAD = '!text-foreground !font-semibold normal-case !tracking-normal';

const TRANSPOSE_PRODUCT_COL_DIVIDER = 'border-l border-border/40';
const TRANSPOSE_PRODUCT_HEAD = 'text-center !px-2.5 !py-2 font-semibold text-foreground';
const TRANSPOSE_PRODUCT_CELL = '!px-2.5 !py-2 text-right tabular-nums';
const TRANSPOSE_METRIC_CELL = '!pl-3 !pr-4 !py-2 text-left';

function SortHead({ label, sortKey, current, onSort, align = 'right', onResizeStart, draggable = false, onDragStart, onDragOver, onDrop, onDragEnd, multiLine = false, compact = false, stickyHeader = false, stickyTopLeft = false, className }: {
  label: string; sortKey: string; current: { key: string; dir: SortDir };
  onSort: (k: string) => void; align?: 'left' | 'right';
  onResizeStart?: (ev: React.MouseEvent) => void;
  draggable?: boolean;
  onDragStart?: (ev: React.DragEvent) => void;
  onDragOver?: (ev: React.DragEvent) => void;
  onDrop?: (ev: React.DragEvent) => void;
  onDragEnd?: () => void;
  multiLine?: boolean;
  compact?: boolean;
  stickyHeader?: boolean;
  stickyTopLeft?: boolean;
  className?: string;
}) {
  const active = current.key === sortKey && current.dir !== 'default';
  const normalized = label.replace(/\s+/g, ' ').trim();
  const shouldWrap = multiLine && normalized.includes(' ');
  let lines: string[] = [normalized];
  if (shouldWrap) {
    const words = normalized.split(' ');
    const targetLines = normalized.length > 22 ? 3 : 2;
    const targetChars = Math.ceil(normalized.length / targetLines);
    const wrapped: string[] = [];
    let currentLine = '';
    words.forEach((word) => {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (candidate.length > targetChars && currentLine && wrapped.length < targetLines - 1) {
        wrapped.push(currentLine);
        currentLine = word;
      } else {
        currentLine = candidate;
      }
    });
    if (currentLine) wrapped.push(currentLine);
    if (wrapped.length > targetLines) {
      const prefix = wrapped.slice(0, targetLines - 1);
      const suffix = wrapped.slice(targetLines - 1).join(' ');
      lines = [...prefix, suffix];
    } else {
      lines = wrapped;
    }
  }
  return (
    <TableHead
      className={`font-mono text-xs cursor-pointer select-none hover:text-foreground transition-colors relative pr-3 ${shouldWrap ? 'h-auto py-3 whitespace-normal align-top' : 'whitespace-nowrap'} ${compact ? '!px-2' : ''} ${draggable ? 'cursor-move' : ''} ${align === 'right' ? 'text-right' : 'text-left'} ${stickyTopLeft ? PRODUCT_TABLE_STICKY_TOP_LEFT : stickyHeader ? PRODUCT_TABLE_STICKY_TOP : ''} ${className ?? ''}`}
      onClick={() => onSort(sortKey)}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <span className={`inline-flex items-center gap-1 ${shouldWrap ? 'whitespace-normal' : 'whitespace-nowrap'}`}>
        {shouldWrap ? (
          <span className="inline-flex flex-col leading-tight">
            {lines.map((line, idx) => (
              <span key={`${sortKey}-line-${idx}`}>{line}</span>
            ))}
          </span>
        ) : (
          label
        )}
        {active ? (
          current.dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-30" />
        )}
      </span>
      {onResizeStart && (
        <span
          className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-border/60 transition-colors"
          onMouseDown={onResizeStart}
        />
      )}
    </TableHead>
  );
}

/* ─── Production Chart Data Builder ─── */
function buildProductionData(results: CalcResults, model: any) {
  return results.products.map(pr => {
    // Use DLL/backend result fields only (no frontend IBOM-derived math).
    const anyPr = pr as any;
    const shippedRaw = anyPr.shippedProduction ?? anyPr.shippedProd ?? anyPr.shipped;
    const totalGoodProdRaw = anyPr.totalGoodProd ?? anyPr.total_good_prod ?? anyPr.goodMade;
    const scrappedInAssemblyRaw =
      anyPr.scrappedInAssembly ??
      anyPr.scrapInAssembly ??
      anyPr.ScrapInAsm ??
      anyPr.scrappedInAssy ??
      anyPr.scrapInAssy ??
      anyPr.ScarpInAsm ??
      anyPr.scrapped_in_assembly ??
      anyPr.scrap_in_assembly;
    const scrapInProdRaw = anyPr.scrapInProduction ?? anyPr.scrap_in_production;
    const totalRaw = anyPr.totalProduction ?? anyPr.total_production ?? anyPr.total;

    const shipped = shippedRaw != null ? asNum(shippedRaw) : asNum(pr.goodShipped);
    const scrappedInAssembly = scrappedInAssemblyRaw != null ? asNum(scrappedInAssemblyRaw) : 0;
    // Per requirement: Used in Assembly = TotalGoodProd - ScarpInAsm.
    const totalGoodProd = totalGoodProdRaw != null ? asNum(totalGoodProdRaw) : asNum(pr.goodMade);
    const usedInAssembly = Math.max(0, totalGoodProd - scrappedInAssembly);
    const scrapInProd = scrapInProdRaw != null ? asNum(scrapInProdRaw) : asNum(pr.scrap);
    const total = totalRaw != null ? asNum(totalRaw) : (shipped + usedInAssembly + scrappedInAssembly + scrapInProd);
    return {
      name: pr.name,
      shipped: Math.round(shipped),
      usedInAssembly: Math.round(usedInAssembly),
      scrappedInAssembly: Math.round(scrappedInAssembly),
      scrapInProduction: Math.round(scrapInProd),
      total: Math.round(total),
    };
  });
}

// Extended run mode type for advanced modes
type ExtendedRunMode = RunMode | 'max_throughput' | 'lot_size_range' | 'tbatch_range' | 'optimize_lots';

const STANDARD_MODES: { mode: ExtendedRunMode; icon: typeof Play; label: string; description: string }[] = [
  { mode: 'full', icon: Play, label: 'Full Calculate', description: 'Complete queuing analysis with utilization, MCT, WIP, and queue times.' },
  { mode: 'verify', icon: Shield, label: 'Verify Data Only', description: 'Validates input data for errors without running calculations.' },
  { mode: 'util_only', icon: Gauge, label: 'Utilization Only', description: 'Equipment and labor utilization only — faster for capacity exploration.' },
];

const SCENARIO_MODES: { mode: ExtendedRunMode; icon: typeof Play; label: string; description: string }[] = [
  { mode: 'max_throughput', icon: TrendingUp, label: 'Max Throughput', description: 'Find the maximum achievable demand for a selected product.' },
];

const OPTIMIZATION_MODES: { mode: ExtendedRunMode; icon: typeof Play; label: string; description: string }[] = [
  { mode: 'lot_size_range', icon: BarChart3, label: 'Lot Size Range', description: 'Run a range of lot sizes and chart MCT vs lot size curve.' },
  { mode: 'tbatch_range', icon: Layers, label: 'Transfer Batch Range', description: 'Sweep transfer batch sizes for a product and chart MCT sensitivity.' },
  { mode: 'optimize_lots', icon: Settings2, label: 'Optimize Lot Sizes', description: 'Minimize total WIP by iteratively adjusting lot sizes and transfer batches.' },
];

export default function RunResults() {
  const model = useModelStore(s => s.getActiveModel());
  const allScenarios = useScenarioStore(s => s.scenarios);
  const activeScenarioId = useScenarioStore(s => s.activeScenarioId);
  const displayIds = useScenarioStore(s => s.displayScenarioIds);
  const { getResults } = useResultsStore();
  const selectedRunScenarioId = useResultsStore(s => s.selectedRunScenarioId);
  const setSelectedRunScenarioId = useResultsStore(s => s.setSelectedRunScenarioId);
  const { userLevel, loading: userLevelLoading, fetchUserLevel } = useUserLevelStore();

  const { isRunning, runLog, verifyMessages, showIssueBanners, handleRun } = useRunCalculation();
  const [issuesDialogOpen, setIssuesDialogOpen] = useState(false);

  const [extRunMode, setExtRunMode] = useState<ExtendedRunMode>('full');
  const runMode: RunMode = (extRunMode === 'full' || extRunMode === 'verify' || extRunMode === 'util_only') ? extRunMode : 'full';
  const [transposed, setTransposed] = useState(false);
  // ibomProduct state removed — now managed inside IBOMOutput component

  // Advanced mode state — must be before early return
  const [mtProduct, setMtProduct] = useState(model?.products[0]?.id || '');
  const [mtScenarioName, setMtScenarioName] = useState('');
  const [mtResult, setMtResult] = useState<{demand: number; limitingResource: string} | null>(null);
  const [lsrProduct, setLsrProduct] = useState(model?.products[0]?.id || '');
  const [lsrMin, setLsrMin] = useState(10);
  const [lsrMax, setLsrMax] = useState(200);
  const [lsrStep, setLsrStep] = useState(10);
  const [lsrResults, setLsrResults] = useState<{lotSize: number; mct: number}[]>([]);
  const [tbrProduct, setTbrProduct] = useState(model?.products[0]?.id || '');
  const [tbrMin, setTbrMin] = useState(1);
  const [tbrMax, setTbrMax] = useState(50);
  const [tbrStep, setTbrStep] = useState(5);
  const [tbrResults, setTbrResults] = useState<{tbatch: number; mct: number}[]>([]);
  const [optProducts, setOptProducts] = useState<Set<string>>(new Set(model?.products.map(p => p.id) || []));
  const [optResult, setOptResult] = useState<{original: {name:string;lot:number;wip:number}[]; optimized: {name:string;lot:number;wip:number}[]; wipReduction: number} | null>(null);
  const [advProgress, setAdvProgress] = useState<{current:number; total:number; label:string} | null>(null);
  const [advRunning, setAdvRunning] = useState(false);

  // Max Throughput + Lot Size Range modal state
  const [mtModalOpen, setMtModalOpen] = useState(false);
  const [mtModalMode, setMtModalMode] = useState<'max_throughput' | 'lot_size_range'>('max_throughput');
  const [mtModalProduct, setMtModalProduct] = useState(model?.products[0]?.id || '');
  const [mtModalName, setMtModalName] = useState('');
  const [mtModalLsFrom, setMtModalLsFrom] = useState(10);
  const [mtModalLsTo, setMtModalLsTo] = useState(200);
  const [mtModalLsStep, setMtModalLsStep] = useState(10);

  // Optimise Lot Sizes modal state
  const [olModalOpen, setOlModalOpen] = useState(false);
  const [olName, setOlName] = useState('Optimised Lot Sizes');
  const [olUnitValues, setOlUnitValues] = useState<Record<string, number>>({});
  const [olOptLot, setOlOptLot] = useState<Set<string>>(new Set());
  const [olOptTb, setOlOptTb] = useState<Set<string>>(new Set());
  const [olInitialWip, setOlInitialWip] = useState<number | null>(null);
  const [olCurrentWip, setOlCurrentWip] = useState<number | null>(null);

  const { createScenario } = useScenarioStore();
  const { setResults: setStoreResults } = useResultsStore();

  const activeScenario = model ? (allScenarios.find(s => s.id === activeScenarioId) || null) : null;
  const modelScenarios = model ? allScenarios.filter(s => s.modelId === model.id) : [];
  const resultKey = selectedRunScenarioId && selectedRunScenarioId !== 'basecase'
    ? selectedRunScenarioId
    : (activeScenario ? activeScenario.id : 'basecase');
  const results = getResults(resultKey);
  const basecaseResults = getResults('basecase');
  const hasRun = !!results;

  const resultsStamp =
    (results?.calculatedAt || (model ? `pending:${resultKey}` : '')) as string;
  const issueDismissPersist = useMemo((): RunIssueDismissPersist | null => {
    if (!model) return null;
    return { modelId: model.id, resultKey, resultsStamp };
  }, [model, resultKey, resultsStamp]);

  const { dismissed: dismissedIssueBanners, dismiss: dismissIssueBanner, clearDismiss } =
    useRunIssueBannerDismiss(runLog, issueDismissPersist);

  // Build list of scenarios to display in charts
  const chartScenarios: ScenarioEntry[] = useMemo(() => {
    const entries: ScenarioEntry[] = [];
    if (basecaseResults) {
      entries.push({ id: 'basecase', name: 'Basecase', results: basecaseResults });
    }
    displayIds.forEach(id => {
      const sc = modelScenarios.find(s => s.id === id);
      const r = getResults(id);
      if (sc && r && id !== 'basecase') {
        entries.push({ id, name: sc.name, results: r });
      }
    });
    return entries;
  }, [basecaseResults, displayIds, modelScenarios, getResults]);

  const isMultiScenario = chartScenarios.length > 1;

  const displayScenarioResults = useMemo(() => displayIds
    .map(id => ({ id, scenario: modelScenarios.find(s => s.id === id), results: getResults(id) }))
    .filter(d => d.scenario && d.results) as { id: string; scenario: typeof modelScenarios[0]; results: CalcResults }[],
    [displayIds, modelScenarios, getResults]);

  // Single-scenario chart data
  const equipChartData = useMemo(() => results?.equipment.map(e => ({
    name: e.name, setup: e.setupUtil, run: e.runUtil, repair: e.repairUtil, waitLabor: e.waitLaborUtil,
  })) || [], [results]);

  const laborChartData = useMemo(() => results?.labor.map(l => ({
    name: l.name, setup: l.setupUtil, run: l.runUtil, unavail: l.unavailPct,
  })) || [], [results]);

  const productChartData = useMemo(() => results?.products.map(p => ({
    name: p.name, lotWait: p.mctLotWait, queue: p.mctQueue, waitLabor: p.mctWaitLabor, setup: p.mctSetup, run: p.mctRun,
  })) || [], [results]);

  // Grouped chart data
  const groupedEquip = useMemo(() => isMultiScenario ? buildGroupedEquipData(chartScenarios) : null, [isMultiScenario, chartScenarios]);
  const groupedLabor = useMemo(() => isMultiScenario ? buildGroupedLaborData(chartScenarios) : null, [isMultiScenario, chartScenarios]);
  const groupedMCT = useMemo(() => isMultiScenario ? buildGroupedProductMCTData(chartScenarios) : null, [isMultiScenario, chartScenarios]);
  const groupedWIP = useMemo(() => isMultiScenario ? buildGroupedProductWIPData(chartScenarios) : null, [isMultiScenario, chartScenarios]);

  // ibomSelectedProduct removed — now managed inside IBOMOutput component

  // Render a mode card
  const renderModeCard = (opt: {mode: ExtendedRunMode; icon: typeof Play; label: string; description: string}) => {
    const Icon = opt.icon;
    const selected = extRunMode === opt.mode;
    return (
      <button
        key={opt.label}
        onClick={() => setExtRunMode(opt.mode)}
        className={`text-left p-3 rounded-lg border-2 transition-all ${
          selected ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/40 hover:bg-accent/30'
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Icon className={`h-4 w-4 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className={`text-sm font-medium ${selected ? 'text-primary' : ''}`}>{opt.label}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{opt.description}</p>
      </button>
    );
  };

  // Advanced run handlers
  const handleAdvancedRun = useCallback(async () => {
    if (!model || advRunning) return;

    if (extRunMode === 'max_throughput') {
      setAdvRunning(true);
      const product = model.products.find(p => p.id === mtProduct);
      if (!product) { setAdvRunning(false); return; }
      let demand = product.demand > 0 ? product.demand : 100;
      let lastValidDemand = demand;
      let limitingResource = '';
      const step = Math.max(1, Math.round(demand * 0.1));
      let iterations = 0;
      const maxIter = 200;

      while (iterations < maxIter) {
        iterations++;
        setAdvProgress({ current: iterations, total: maxIter, label: `Testing demand: ${Math.round(demand)}` });
        const testModel = { ...model, products: model.products.map(p => p.id === mtProduct ? { ...p, demand } : p) };
        const r = await fullCalculate(testModel);
        if (r.overLimitResources.length > 0) {
          limitingResource = r.overLimitResources[0];
          // Binary search refinement
          let lo = lastValidDemand, hi = demand;
          for (let i = 0; i < 20; i++) {
            const mid = Math.round((lo + hi) / 2);
            const tr = await fullCalculate({ ...model, products: model.products.map(p => p.id === mtProduct ? { ...p, demand: mid } : p) });
            if (tr.overLimitResources.length > 0) { hi = mid; limitingResource = tr.overLimitResources[0]; }
            else { lo = mid; lastValidDemand = mid; }
            if (hi - lo <= 1) break;
          }
          break;
        }
        lastValidDemand = demand;
        demand += step;
        await new Promise(r => setTimeout(r, 0));
      }

      const name = mtScenarioName || `Max Throughput — ${product.name}`;
      const scenarioId = await createScenario(model.id, name);
      useScenarioStore.getState().applyScenarioChange(scenarioId, 'Product', mtProduct, product.name, 'demand', 'Demand', lastValidDemand);
      const scenario = useScenarioStore.getState().scenarios.find(s => s.id === scenarioId);
      if (scenario) {
        const r = await fullCalculate(model, scenario);
        setStoreResults(scenarioId, r);
        useScenarioStore.getState().markCalculated(scenarioId);
        await scenarioDb.saveResults(scenarioId, r);
      }
      setMtResult({ demand: lastValidDemand, limitingResource });
      setAdvProgress(null);
      setAdvRunning(false);
      toast.success(`Max throughput for ${product.name}: ${lastValidDemand} units`);
      return;
    }

    if (extRunMode === 'lot_size_range') {
      setAdvRunning(true);
      const product = model.products.find(p => p.id === lsrProduct);
      if (!product) { setAdvRunning(false); return; }
      const steps: number[] = [];
      for (let ls = lsrMin; ls <= lsrMax; ls += lsrStep) steps.push(ls);
      const curResults: {lotSize: number; mct: number}[] = [];

      for (let i = 0; i < steps.length; i++) {
        setAdvProgress({ current: i + 1, total: steps.length, label: `Lot size: ${steps[i]}` });
        const testModel = { ...model, products: model.products.map(p => p.id === lsrProduct ? { ...p, lot_size: steps[i] } : p) };
        const r = await fullCalculate(testModel);
        const pr = r.products.find(p => p.id === lsrProduct);
        curResults.push({ lotSize: steps[i], mct: pr?.mct || 0 });

        const scName = `${product.name}-LotSize-${steps[i]}`;
        const scenarioId = await createScenario(model.id, scName);
        useScenarioStore.getState().applyScenarioChange(scenarioId, 'Product', lsrProduct, product.name, 'lot_size', 'Lot Size', steps[i]);
        const sc = useScenarioStore.getState().scenarios.find(s => s.id === scenarioId);
        if (sc) {
          setStoreResults(scenarioId, r);
          useScenarioStore.getState().markCalculated(scenarioId);
          await scenarioDb.saveResults(scenarioId, r);
        }
        await new Promise(r => setTimeout(r, 0));
      }
      setLsrResults(curResults);
      setAdvProgress(null);
      setAdvRunning(false);
      toast.success(`Created ${steps.length} lot size scenarios for ${product.name}`);
      return;
    }

    if (extRunMode === 'tbatch_range') {
      setAdvRunning(true);
      const product = model.products.find(p => p.id === tbrProduct);
      if (!product) { setAdvRunning(false); return; }
      const steps: number[] = [];
      for (let tb = tbrMin; tb <= tbrMax; tb += tbrStep) steps.push(tb);
      const curResults: {tbatch: number; mct: number}[] = [];

      for (let i = 0; i < steps.length; i++) {
        setAdvProgress({ current: i + 1, total: steps.length, label: `Transfer Batch: ${steps[i]}` });
        const testModel = { ...model, products: model.products.map(p => p.id === tbrProduct ? { ...p, tbatch_size: steps[i] } : p) };
        const r = await fullCalculate(testModel);
        const pr = r.products.find(p => p.id === tbrProduct);
        curResults.push({ tbatch: steps[i], mct: pr?.mct || 0 });

        const scName = `${product.name}-TBatch-${steps[i]}`;
        const scenarioId = await createScenario(model.id, scName);
        useScenarioStore.getState().applyScenarioChange(scenarioId, 'Product', tbrProduct, product.name, 'tbatch_size', 'Transfer Batch Size', steps[i]);
        const sc = useScenarioStore.getState().scenarios.find(s => s.id === scenarioId);
        if (sc) {
          setStoreResults(scenarioId, r);
          useScenarioStore.getState().markCalculated(scenarioId);
          await scenarioDb.saveResults(scenarioId, r);
        }
        await new Promise(r => setTimeout(r, 0));
      }
      setTbrResults(curResults);
      setAdvProgress(null);
      setAdvRunning(false);
      toast.success(`Created ${steps.length} transfer batch scenarios for ${product.name}`);
      return;
    }

    if (extRunMode === 'optimize_lots') {
      setAdvRunning(true);
      const selectedProducts = model.products.filter(p => optProducts.has(p.id));
      if (selectedProducts.length === 0) { setAdvRunning(false); return; }

      const baseCalc = await fullCalculate(model);
      const original = selectedProducts.map(p => {
        const pr = baseCalc.products.find(pp => pp.id === p.id);
        return { name: p.name, lot: p.lot_size, wip: pr?.wip || 0 };
      });
      const baseWip = baseCalc.products.reduce((s, p) => s + p.wip, 0);

      let bestLots: Record<string,number> = {};
      selectedProducts.forEach(p => { bestLots[p.id] = p.lot_size; });
      let bestWip = baseWip;
      const maxIter = 50;

      for (let iter = 0; iter < maxIter; iter++) {
        setAdvProgress({ current: iter + 1, total: maxIter, label: `WIP: ${Math.round(bestWip)} (iter ${iter + 1})` });
        let improved = false;
        for (const p of selectedProducts) {
          for (const delta of [-Math.max(1, Math.round(bestLots[p.id] * 0.1)), Math.max(1, Math.round(bestLots[p.id] * 0.1))]) {
            const newLot = Math.max(1, bestLots[p.id] + delta);
            if (newLot === bestLots[p.id]) continue;
            const testModel = { ...model, products: model.products.map(pp => ({ ...pp, lot_size: bestLots[pp.id] !== undefined ? (pp.id === p.id ? newLot : bestLots[pp.id]) : pp.lot_size })) };
            const r = await fullCalculate(testModel);
            const totalWip = r.products.reduce((s, pp) => s + pp.wip, 0);
            if (totalWip < bestWip && r.overLimitResources.length === 0) {
              bestLots[p.id] = newLot;
              bestWip = totalWip;
              improved = true;
            }
          }
        }
        if (!improved) break;
        await new Promise(r => setTimeout(r, 0));
      }

      const scenarioId = await createScenario(model.id, 'Optimized Lot Sizes');
      for (const p of selectedProducts) {
        if (bestLots[p.id] !== p.lot_size) {
          useScenarioStore.getState().applyScenarioChange(scenarioId, 'Product', p.id, p.name, 'lot_size', 'Lot Size', bestLots[p.id]);
        }
      }
      const scenario = useScenarioStore.getState().scenarios.find(s => s.id === scenarioId);
      if (scenario) {
        const r = await fullCalculate(model, scenario);
        setStoreResults(scenarioId, r);
        useScenarioStore.getState().markCalculated(scenarioId);
        await scenarioDb.saveResults(scenarioId, r);
        const optimized = selectedProducts.map(p => {
          const pr = r.products.find(pp => pp.id === p.id);
          return { name: p.name, lot: bestLots[p.id], wip: pr?.wip || 0 };
        });
        setOptResult({ original, optimized, wipReduction: Math.round((1 - bestWip / baseWip) * 1000) / 10 });
      }
      setAdvProgress(null);
      setAdvRunning(false);
      toast.success(`Optimization complete — WIP reduced by ${Math.round((1 - bestWip / baseWip) * 100)}%`);
      return;
    }
  }, [model, extRunMode, advRunning, mtProduct, mtScenarioName, lsrProduct, lsrMin, lsrMax, lsrStep, tbrProduct, tbrMin, tbrMax, tbrStep, optProducts, createScenario, setStoreResults, handleRun]);

  const isAdvancedMode = ['max_throughput', 'lot_size_range', 'tbatch_range', 'optimize_lots'].includes(extRunMode);

  const [activeTab, setActiveTab] = useState('summary');
  const [equipSubTab, setEquipSubTab] = useState('util-chart');
  const [laborSubTab, setLaborSubTab] = useState('util-chart');
  const [productsSubTab, setProductsSubTab] = useState('mct-chart');
  const [ibomSubTab, setIbomSubTab] = useState('tree-chart');

  // Detect if last run was util-only (MCT/WIP not available)
  const lastRunMode = runLog.length > 0 ? runLog[0].mode : null;
  const isUtilOnly = lastRunMode === 'util_only' || isUtilOnlyCalcResults(results);
  const validationOnlyPanel = lastRunMode === 'verify';

  const equipSubTabs = isUtilOnly
    ? ([
        { key: 'util-chart' as const, label: 'Util Chart' },
        { key: 'results-table' as const, label: 'Results Table' },
      ])
    : ([
        { key: 'util-chart' as const, label: 'Util Chart' },
        { key: 'results-table' as const, label: 'Results Table' },
        { key: 'wip-chart' as const, label: 'WIP Chart' },
        { key: 'oper-details' as const, label: 'Oper Details' },
      ]);

  const laborSubTabs = isUtilOnly
    ? ([
        { key: 'util-chart' as const, label: 'Util Chart' },
        { key: 'results-table' as const, label: 'Results Table' },
      ])
    : ([
        { key: 'util-chart' as const, label: 'Util Chart' },
        { key: 'results-table' as const, label: 'Results Table' },
        { key: 'equip-wait' as const, label: 'Equip Wait Chart' },
        { key: 'oper-details' as const, label: 'Oper Details' },
      ]);

  const productSubTabs = isUtilOnly
    ? ([{ key: 'results-table' as const, label: 'Results Table' }])
    : ([
        { key: 'mct-chart' as const, label: 'MCT Chart' },
        { key: 'results-table' as const, label: 'Results Table' },
        { key: 'production-chart' as const, label: 'Production Chart' },
        { key: 'wip-chart' as const, label: 'WIP Chart' },
        { key: 'oper-details' as const, label: 'Oper Details' },
      ]);

  useEffect(() => {
    if (!isUtilOnly) return;
    if (!equipSubTabs.some((t) => t.key === equipSubTab)) setEquipSubTab('util-chart');
    if (!laborSubTabs.some((t) => t.key === laborSubTab)) setLaborSubTab('util-chart');
    if (!productSubTabs.some((t) => t.key === productsSubTab)) setProductsSubTab('results-table');
  }, [isUtilOnly, equipSubTab, laborSubTab, productsSubTab, equipSubTabs, laborSubTabs, productSubTabs]);

  // Auto-navigate to Summary on Full Calculate completion; toast on background recalc
  const prevRunLogLenRef = useRef(runLog.length);
  const wasViewingTabRef = useRef(activeTab);
  const hydratedOpsRef = useRef<Set<string>>(new Set());
  // Track which tab user is on before a run starts
  useEffect(() => { wasViewingTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => {
    if (runLog.length > prevRunLogLenRef.current) {
      const latest = runLog[0];
      if (latest?.mode === 'util_only' && latest.status !== 'error') {
        setActiveTab('summary');
      } else if (latest && latest.mode === 'full' && latest.status !== 'error') {
        // If user was on summary or had no results, go to summary
        if (wasViewingTabRef.current === 'summary') {
          setActiveTab('summary');
        }
      }
    }
    prevRunLogLenRef.current = runLog.length;
  }, [runLog.length]);

  // Backfill stale results (older saved runs without operation-level metrics).
  useEffect(() => {
    if (!model || !results) return;
    if (isUtilOnly) return;
    const hasOperations = Array.isArray((results as any).operations) && (results as any).operations.length > 0;
    if (hasOperations) return;
    if (hydratedOpsRef.current.has(resultKey)) return;
    hydratedOpsRef.current.add(resultKey);

    const scenario = resultKey === 'basecase'
      ? null
      : (modelScenarios.find(s => s.id === resultKey) || null);

    (async () => {
      try {
        const refreshed = await fullCalculate(model, scenario);
        const refreshedHasOps = Array.isArray((refreshed as any).operations) && (refreshed as any).operations.length > 0;
        if (!refreshedHasOps) return;
        setStoreResults(resultKey, refreshed);
        const { scenarioDb } = await import('@/lib/scenarioDb');
        if (scenario) {
          await scenarioDb.saveResults(resultKey, refreshed);
        } else {
          await scenarioDb.saveBasecaseResults(model.id, refreshed);
        }
      } catch (e) {
        console.error('Failed to refresh operation metrics', e);
      }
    })();
  }, [model, modelScenarios, resultKey, results, setStoreResults, isUtilOnly]);

  useEffect(() => {
    if (userLevelLoading) fetchUserLevel();
  }, [userLevelLoading, fetchUserLevel]);

  if (!model) return (
    <div className="p-6 space-y-4">
      <div className="h-7 w-48 bg-muted animate-pulse rounded" />
      <div className="h-4 w-64 bg-muted animate-pulse rounded" />
      <div className="h-48 bg-muted animate-pulse rounded-lg mt-4" />
    </div>
  );

  const scenarioLabel = activeScenario ? activeScenario.name : 'Basecase';
  const modeLabel = extRunMode === 'full' ? 'Run Full Calculate' : extRunMode === 'verify' ? 'Verify Data' : extRunMode === 'util_only' ? 'Calculate Utilization' : extRunMode === 'max_throughput' ? 'Find Max Throughput' : extRunMode === 'lot_size_range' ? 'Run Lot Size Range' : extRunMode === 'tbatch_range' ? 'Run TBatch Range' : 'Run Optimize';

  // Status chip
  const statusChip = isRunning || advRunning
  ? {
      label: 'Running…',
      color: 'bg-info/15 text-info border-info/30',
      icon: (
        <span className="animate-spin inline-block h-3 w-3 border-2 border-info border-t-transparent rounded-full" />
      ),
    }
  : model.run_status === 'needs_recalc' && hasRun
  ? {
      label: 'Recalc Needed',
      color: 'bg-warning/15 text-warning border-warning/30',
      icon: <AlertTriangle className="h-3 w-3" />,
    }
  : {
      label: 'Ready',
      color: 'bg-teal-100 text-teal-700 border-teal-200',
      icon: <BadgeCheck className="h-3.5 w-3.5 text-teal-600" />
    };
  const lastRunText = model.last_run_at ? `Last run: ${new Date(model.last_run_at).toLocaleString()}` : 'Never run';

  const canShowIssueBanners =
    showIssueBanners &&
    !isRunning &&
    !advRunning &&
    hasAnyIssueMessages(results, verifyMessages, { validationOnly: validationOnlyPanel });

  return (
    <div className="h-full flex flex-col overflow-hidden animate-fade-in">
      {/* ── Page Header Row ── */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2 shrink-0">
        <h1 className="text-xl font-bold">Run &amp; Results</h1>
        {activeScenario && (
          <Badge variant="outline" className="border-warning/50 bg-warning/10 text-warning gap-1.5 text-xs font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-warning" />
            {activeScenario.name}
          </Badge>
        )}
      </div>

      {/* ── Run Control Bar ── */}
      <div className="h-[52px] shrink-0 flex items-center gap-3 px-6 bg-[#EAEFEF] border-b border-border">
        {/* Left — standard run buttons */}
        <Button
          size="sm"
          className="h-9 gap-1.5 px-4"
          onClick={() => {
            clearDismiss();
            handleRun('full');
          }}
          disabled={isRunning || advRunning}
        >
          {isRunning || advRunning ? (
            <><span className="animate-spin h-3.5 w-3.5 border-2 border-primary-foreground border-t-transparent rounded-full" /> Running…</>
          ) : (
            <><Play className="h-3.5 w-3.5" /> Full Calculate</>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-9 gap-1.5 px-3"
          onClick={() => {
            clearDismiss('validations');
            handleRun('verify');
          }}
          disabled={isRunning || advRunning}
        >
          <CheckCircle className="h-3.5 w-3.5" /> Verify Data
        </Button>
        
          <ShadTooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-1.5 px-3"
                onClick={() => {
                  clearDismiss();
                  handleRun('util_only');
                }}
                disabled={isRunning || advRunning}
              >
                <Gauge className="h-3.5 w-3.5" /> Calc. Util Only
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Calculates equipment and labor utilisation only — faster than Full Calculate.</TooltipContent>
          </ShadTooltip>
   

        {/* Vertical divider before Advanced section */}
        {isVisible('max_throughput', userLevel) && (
          <div className="h-[60%] w-px bg-border self-center" />
        )}

        {/* Advanced dropdown — Advanced users only */}
        {isVisible('max_throughput', userLevel) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-9 gap-1.5 px-3 text-xs">
                <Settings2 className="h-3.5 w-3.5" /> Advanced <ChevronRight className="h-3 w-3 rotate-90" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuItem onClick={() => {
                setMtModalProduct(model?.products[0]?.id || '');
                setMtModalName('');
                setMtModalMode('max_throughput');
                setMtModalLsFrom(10);
                setMtModalLsTo(200);
                setMtModalLsStep(10);
                setMtModalOpen(true);
              }}>
                <TrendingUp className="h-4 w-4 mr-2" /> Max Throughput + Lot Size Range…
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                const vals: Record<string, number> = {};
                model?.products.forEach(p => { vals[p.id] = 1; });
                setOlUnitValues(vals);
                setOlOptLot(new Set(model?.products.map(p => p.id) || []));
                setOlOptTb(new Set(model?.products.map(p => p.id) || []));
                setOlName('Optimised Lot Sizes');
                const baseCalc = await fullCalculate(model!);
                const initWip = baseCalc.products.reduce((s, pr) => s + pr.wip * (vals[pr.id] || 1), 0);
                setOlInitialWip(Math.round(initWip * 100) / 100);
                setOlCurrentWip(null);
                setOlModalOpen(true);
              }}>
                <Settings2 className="h-4 w-4 mr-2" /> Optimise Lot Sizes &amp; Transfer Batches…
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <AlertTriangle className="h-4 w-4 mr-2" /> Errors &amp; Warning Messages
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Scenario context dropdown */}
        <div className="h-[60%] w-px bg-border self-center" />
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">Running for:</span>
          <Select value={selectedRunScenarioId} onValueChange={setSelectedRunScenarioId}>
            <SelectTrigger className={`h-7 w-auto min-w-[140px] max-w-[220px] text-xs gap-1 ${selectedRunScenarioId !== 'basecase' ? 'text-warning border-warning/40' : ''}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basecase">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Lock className="h-3 w-3" /> Basecase
                </span>
              </SelectItem>
              {modelScenarios.map((sc, idx) => (
                <SelectItem key={sc.id} value={sc.id}>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: getScenarioColor(idx) }} />
                    {sc.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1" />

        <RunResultsIssuesDialog
          open={issuesDialogOpen}
          onOpenChange={setIssuesDialogOpen}
          results={results}
          validationMessages={verifyMessages}
          validationOnly={validationOnlyPanel}
        />
        {canShowIssueBanners && (
          <TooltipProvider>
            <ShadTooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
                  onClick={() => setIssuesDialogOpen(true)}
                  aria-label="View errors and warnings"
                >
                  <AlertTriangle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                View errors and warnings from the latest run
              </TooltipContent>
            </ShadTooltip>
          </TooltipProvider>
        )}

        {/* Far right — status chip + last run */}
        <Badge variant="outline" className={`gap-1.5 text-xs font-medium ${statusChip.color}`}>
          {statusChip.icon}
          {statusChip.label}
        </Badge>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{lastRunText}</span>
      </div>

      {/* ── Primary Tab Bar ── */}
      <div className="shrink-0 px-6 border-b border-border">
        <div className="flex h-10 items-center gap-0">
          {(['summary', 'equipment', 'labor', 'products', 'ibom'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-10 px-4 text-sm font-medium capitalize relative transition-colors ${
                activeTab === tab
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'ibom' ? 'IBOM' : tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content Panel — scrolls internally ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 pb-6">
        {showIssueBanners && !isRunning && !advRunning && (
          <RunResultsIssueBanners
            results={results}
            validationMessages={verifyMessages}
            validationOnly={validationOnlyPanel}
            dismissed={dismissedIssueBanners}
            onDismiss={dismissIssueBanner}
          />
        )}

        {/* ── Summary Tab ── */}
        {activeTab === 'summary' && (
          <>
            <ScenarioContextBar />
            {!isUtilOnly && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <QuickStatCard
                label="Most loaded equipment"
                value={results ? (() => { const top = [...results.equipment].sort((a, b) => b.totalUtil - a.totalUtil)[0]; return top ? top.name : '—'; })() : '—'}
                metric={results ? (() => { const top = [...results.equipment].sort((a, b) => b.totalUtil - a.totalUtil)[0]; return top ? `${top.totalUtil.toFixed(1)}%` : ''; })() : ''}
              />
              <QuickStatCard
                label="Most loaded labor"
                value={results ? (() => { const top = [...results.labor].sort((a, b) => b.totalUtil - a.totalUtil)[0]; return top ? top.name : '—'; })() : '—'}
                metric={results ? (() => { const top = [...results.labor].sort((a, b) => b.totalUtil - a.totalUtil)[0]; return top ? `${top.totalUtil.toFixed(1)}%` : ''; })() : ''}
              />
              <QuickStatCard
                label="Highest MCT product"
                value={results ? (() => { const top = [...results.products].sort((a, b) => b.mct - a.mct)[0]; return top ? top.name : '—'; })() : '—'}
                metric={results ? (() => { const top = [...results.products].sort((a, b) => b.mct - a.mct)[0]; return top ? top.mct.toFixed(4) : ''; })() : ''}
              />
              <QuickStatCard
                label="Total system WIP"
                value={results ? `${Math.round(results.products.reduce((s, p) => s + p.wip, 0)).toLocaleString()}` : '—'}
                metric={results ? 'pieces' : ''}
              />
            </div>
            )}

            {/* Pre-run empty state or Output Summary table */}
            {!hasRun ? (
              <NoResultsPlaceholder />
            ) : (
              <>
                {isUtilOnly && (
                  <UtilOnlyBanner message="Utilization-only run: production counts are shown below. MCT and WIP are zero until you run Full Calculate." />
                )}
                {!isUtilOnly &&
                  results &&
                  results.overLimitResources.length === 0 &&
                  results.errors.length === 0 &&
                  (results.warnings?.length ?? 0) === 0 && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-success/10 border border-success/30 rounded-md">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm text-success font-medium">All production targets can be achieved. Results are current.</span>
                  </div>
                )}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Output Summary</CardTitle>
                        <CardDescription>
                          Consolidated production metrics
                          {displayScenarioResults.length > 0 && ` — comparing ${displayScenarioResults.length} scenario(s)`}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setTransposed(!transposed)}>
                        <RotateCcw className="h-3.5 w-3.5" /> {transposed ? 'Normal View' : 'Transpose'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                    {transposed ? (
                      <TransposedSummary results={results!} model={model} scenarioResults={displayScenarioResults} isUtilOnly={isUtilOnly} />
                    ) : (
                      <NormalSummary results={results!} model={model} scenarioResults={displayScenarioResults} isUtilOnly={isUtilOnly} />
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}

        {/* ── Equipment Tab ── */}
        {activeTab === 'equipment' && (
          !hasRun ? <NoResultsPlaceholder /> : (
            <div className="flex flex-col h-full">
              {/* Level 2 sub-tab bar */}
              <div className="flex h-8 items-center gap-0 border-b border-border/50 -mx-6 px-6 mb-6 shrink-0">
                {equipSubTabs.map(st => (
                  <button
                    key={st.key}
                    onClick={() => setEquipSubTab(st.key)}
                    className={`h-8 px-4 text-[13px] relative transition-colors ${
                      equipSubTab === st.key
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {st.label}
                    {equipSubTab === st.key && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/60" />
                    )}
                  </button>
                ))}
              </div>
              <ScenarioContextBar />

              {equipSubTab === 'util-chart' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Equipment Utilization</CardTitle>
                    <CardDescription>
                      {isMultiScenario
                        ? `Comparing ${chartScenarios.length} scenarios — grouped stacked bars`
                        : 'Stacked utilization breakdown by equipment group'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <ChartScenarioLabel />
                    <ResponsiveContainer width="100%" height={350}>
                      {isMultiScenario && groupedEquip ? (
                        <BarChart data={groupedEquip.data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={axisStyle} stroke="hsl(var(--muted-foreground))" />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: '% Utilization', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                          <Tooltip content={<RechartsTooltipWithTotal />} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <ReferenceLine y={model.general.util_limit} stroke="hsl(0, 72%, 51%)" strokeDasharray="5 5" label={{ value: `Limit ${model.general.util_limit}%`, position: 'right', style: { fontSize: 10, fill: 'hsl(0, 72%, 51%)' } }} />
                          {groupedEquip.bars.map(b => (
                            <Bar key={b.prefix + 'setup'} dataKey={b.prefix + 'setup'} stackId={b.stackId} fill={b.palette.setup} name={`${b.name} Setup`} />
                          ))}
                          {groupedEquip.bars.map(b => (
                            <Bar key={b.prefix + 'run'} dataKey={b.prefix + 'run'} stackId={b.stackId} fill={b.palette.run} name={`${b.name} Run`} />
                          ))}
                          {groupedEquip.bars.map(b => (
                            <Bar key={b.prefix + 'repair'} dataKey={b.prefix + 'repair'} stackId={b.stackId} fill={b.palette.repair} name={`${b.name} Repair`} />
                          ))}
                          {groupedEquip.bars.map((b) => (
                            <Bar key={b.prefix + 'waitLabor'} dataKey={b.prefix + 'waitLabor'} stackId={b.stackId} fill={b.palette.waitLabor} name={`${b.name} Wait Labor`} radius={[2, 2, 0, 0]} />
                          ))}
                        </BarChart>
                      ) : (
                        <BarChart data={equipChartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={axisStyle} stroke="hsl(var(--muted-foreground))" />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: '% Utilization', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                          <Tooltip content={<RechartsTooltipWithTotal />} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <ReferenceLine y={model.general.util_limit} stroke="hsl(0, 72%, 51%)" strokeDasharray="5 5" label={{ value: `Limit ${model.general.util_limit}%`, position: 'right', style: { fontSize: 10, fill: 'hsl(0, 72%, 51%)' } }} />
                          <Bar dataKey="setup" stackId="a" fill={chartColors.setup} name="Setup" />
                          <Bar dataKey="run" stackId="a" fill={chartColors.run} name="Run" />
                          <Bar dataKey="repair" stackId="a" fill={chartColors.repair} name="Repair" />
                          <Bar dataKey="waitLabor" stackId="a" fill={chartColors.waitLabor} name="Wait for Labor" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {equipSubTab === 'results-table' && (
                <EquipmentResultsTable equipment={results!.equipment} utilLimit={model.general.util_limit} model={model} />
              )}

              {equipSubTab === 'wip-chart' && (
                <EquipmentWIPChart results={results!} model={model} isMultiScenario={isMultiScenario} chartScenarios={chartScenarios} />
              )}

              {equipSubTab === 'oper-details' && (
                <EquipOperDetails model={model} results={results!} />
              )}
            </div>
          )
        )}

        {/* ── Labor Tab ── */}
        {activeTab === 'labor' && (
          !hasRun ? <NoResultsPlaceholder /> : (
            <div className="flex flex-col h-full">
              {/* Level 2 sub-tab bar */}
              <div className="flex h-8 items-center gap-0 border-b border-border/50 -mx-6 px-6 mb-6 shrink-0">
                {laborSubTabs.map(st => (
                  <button
                    key={st.key}
                    onClick={() => setLaborSubTab(st.key)}
                    className={`h-8 px-4 text-[13px] relative transition-colors ${
                      laborSubTab === st.key
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {st.label}
                    {laborSubTab === st.key && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/60" />
                    )}
                  </button>
                ))}
              </div>
              <ScenarioContextBar />

              {laborSubTab === 'util-chart' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Labor Utilization</CardTitle>
                    <CardDescription>
                      {isMultiScenario
                        ? `Comparing ${chartScenarios.length} scenarios`
                        : 'Utilization breakdown by labor group'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <ChartScenarioLabel />
                    <ResponsiveContainer width="100%" height={300}>
                      {isMultiScenario && groupedLabor ? (
                        <BarChart data={groupedLabor.data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={axisStyle} stroke="hsl(var(--muted-foreground))" />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip content={<RechartsTooltipWithTotal />} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <ReferenceLine y={model.general.util_limit} stroke="hsl(0, 72%, 51%)" strokeDasharray="5 5" />
                          {groupedLabor.bars.map(b => (
                            <Bar key={b.prefix + 'setup'} dataKey={b.prefix + 'setup'} stackId={b.stackId} fill={b.palette.setup} name={`${b.name} Setup`} />
                          ))}
                          {groupedLabor.bars.map(b => (
                            <Bar key={b.prefix + 'run'} dataKey={b.prefix + 'run'} stackId={b.stackId} fill={b.palette.run} name={`${b.name} Run`} />
                          ))}
                          {groupedLabor.bars.map(b => (
                            <Bar key={b.prefix + 'unavail'} dataKey={b.prefix + 'unavail'} stackId={b.stackId} fill={b.palette.unavail} name={`${b.name} Unavail`} radius={[2, 2, 0, 0]} />
                          ))}
                        </BarChart>
                      ) : (
                        <BarChart data={laborChartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={axisStyle} stroke="hsl(var(--muted-foreground))" />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip content={<RechartsTooltipWithTotal />} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <ReferenceLine y={model.general.util_limit} stroke="hsl(0, 72%, 51%)" strokeDasharray="5 5" />
                          <Bar dataKey="setup" stackId="a" fill={chartColors.setup} name="Setup" />
                          <Bar dataKey="run" stackId="a" fill={chartColors.run} name="Run" />
                          <Bar dataKey="unavail" stackId="a" fill={chartColors.unavail} name="Unavailable" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {laborSubTab === 'results-table' && (
                <LaborResultsTable labor={results!.labor} utilLimit={model.general.util_limit} />
              )}

              {laborSubTab === 'equip-wait' && (
                <>
                  <p className="text-xs text-muted-foreground mb-4">
                    Shows the average number of machines waiting for each labor group. Large values indicate understaffing or misallocated labor.
                  </p>
                  <LaborWaitChart results={results!} model={model} />
                </>
              )}

              {laborSubTab === 'oper-details' && (
                <LaborOperDetails model={model} results={results!} />
              )}
            </div>
          )
        )}

        {/* ── Products Tab ── */}
        {activeTab === 'products' && (
          !hasRun ? <NoResultsPlaceholder /> : (
            <div className="flex flex-col h-full">
              {/* Level 2 sub-tab bar */}
              <div className="flex h-8 items-center gap-0 border-b border-border/50 -mx-6 px-6 mb-6 shrink-0">
                {productSubTabs.map(st => (
                  <button
                    key={st.key}
                    onClick={() => setProductsSubTab(st.key)}
                    className={`h-8 px-4 text-[13px] relative transition-colors ${
                      productsSubTab === st.key
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {st.label}
                    {productsSubTab === st.key && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/60" />
                    )}
                  </button>
                ))}
              </div>
              <ScenarioContextBar />

              {productsSubTab === 'mct-chart' && (
                <>
                  {isUtilOnly && <UtilOnlyBanner />}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Product MCT (Manufacturing Cycle Time)</CardTitle>
                      <CardDescription>
                        {isMultiScenario
                          ? `Comparing ${chartScenarios.length} scenarios — MCT in ${model.general.mct_time_unit}s`
                          : `MCT breakdown by product in ${model.general.mct_time_unit}s`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <ChartScenarioLabel />
                      <ResponsiveContainer width="100%" height={350}>
                        {isMultiScenario && groupedMCT ? (
                          <BarChart data={groupedMCT.data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={axisStyle} stroke="hsl(var(--muted-foreground))" />
                            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: `MCT (${model.general.mct_time_unit})`, angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                            <Tooltip content={<RechartsTooltipWithTotal />} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            {groupedMCT.bars.map(b => (
                              <Bar key={b.prefix + 'lotWait'} dataKey={b.prefix + 'lotWait'} stackId={b.stackId} fill={b.palette.lotWait} name={`${b.name} Lot Wait`} />
                            ))}
                            {groupedMCT.bars.map(b => (
                              <Bar key={b.prefix + 'queue'} dataKey={b.prefix + 'queue'} stackId={b.stackId} fill={b.palette.queue} name={`${b.name} Queue`} />
                            ))}
                            {groupedMCT.bars.map(b => (
                              <Bar key={b.prefix + 'waitLabor'} dataKey={b.prefix + 'waitLabor'} stackId={b.stackId} fill={b.palette.waitLabor} name={`${b.name} Wait Labor`} />
                            ))}
                            {groupedMCT.bars.map(b => (
                              <Bar key={b.prefix + 'setup'} dataKey={b.prefix + 'setup'} stackId={b.stackId} fill={b.palette.setup} name={`${b.name} Setup`} />
                            ))}
                            {groupedMCT.bars.map(b => (
                              <Bar key={b.prefix + 'run'} dataKey={b.prefix + 'run'} stackId={b.stackId} fill={b.palette.run} name={`${b.name} Run`} radius={[2, 2, 0, 0]} />
                            ))}
                          </BarChart>
                        ) : (
                          <BarChart data={productChartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={axisStyle} stroke="hsl(var(--muted-foreground))" />
                            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: `MCT (${model.general.mct_time_unit})`, angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                            <Tooltip content={<RechartsTooltipWithTotal />} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="lotWait" stackId="a" fill={chartColors.lotWait} name="Wait for Lot" />
                            <Bar dataKey="queue" stackId="a" fill={chartColors.queue} name="Wait for Equipment" />
                            <Bar dataKey="waitLabor" stackId="a" fill={chartColors.waitLabor} name="Wait for Labor" />
                            <Bar dataKey="setup" stackId="a" fill={chartColors.setup} name="Setup" />
                            <Bar dataKey="run" stackId="a" fill={chartColors.run} name="Run" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              )}

              {productsSubTab === 'results-table' && (
                <>
                  {isUtilOnly && (
                    <UtilOnlyBanner message="Production counts from Calc. Util Only. MCT and WIP are zero until you run Full Calculate." />
                  )}
                  <ProductResultsTable
                    results={results!}
                    model={model}
                    displayScenarioResults={displayScenarioResults}
                    isUtilOnly={isUtilOnly}
                  />
                </>
              )}

              {productsSubTab === 'production-chart' && (
                <ProductionChart results={results!} model={model} isMultiScenario={isMultiScenario} chartScenarios={chartScenarios} />
              )}

              {productsSubTab === 'wip-chart' && (
                <>
                  {isUtilOnly && <UtilOnlyBanner />}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Product WIP (Work In Progress)</CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <ChartScenarioLabel />
                      <ResponsiveContainer width="100%" height={300}>
                        {isMultiScenario && groupedWIP ? (
                          <BarChart data={groupedWIP.data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={axisStyle} stroke="hsl(var(--muted-foreground))" />
                            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: 'WIP Units', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                            <Tooltip content={<RechartsTooltipWithTotal />} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            {groupedWIP.bars.map((b) => (
                              <Bar key={b.prefix + 'wip'} dataKey={b.prefix + 'wip'} fill={b.palette.single} name={`${b.name} WIP`} radius={[2, 2, 0, 0]} />
                            ))}
                          </BarChart>
                        ) : (
                          <BarChart data={results?.products.map(p => ({ name: p.name, wip: p.wip })) || []} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={axisStyle} stroke="hsl(var(--muted-foreground))" />
                            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: 'WIP Units', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                            <Tooltip content={<RechartsTooltipWithTotal />} />
                            <Bar dataKey="wip" fill={chartColors.setup} name="WIP" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              )}

              {productsSubTab === 'oper-details' && (
                <>
                  {isUtilOnly && <UtilOnlyBanner />}
                  <ProductOperDetails model={model} results={results!} />
                </>
              )}
            </div>
          )
        )}

        {/* ── IBOM Tab ── */}
        {activeTab === 'ibom' && (
          !hasRun ? <NoResultsPlaceholder /> : (
            <>
            <ScenarioContextBar />
            <IBOMTabContent
              model={model}
              results={results!}
              basecaseResults={basecaseResults}
              isRunning={isRunning}
              isUtilOnly={isUtilOnly}
              ibomSubTab={ibomSubTab}
              setIbomSubTab={setIbomSubTab}
            />
            </>
          )
        )}

        {/* Run Log
        {activeTab === 'summary' && runLog.length > 0 && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Recent Runs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Time</TableHead>
                    <TableHead className="text-xs">Mode</TableHead>
                    <TableHead className="text-xs">Scenario</TableHead>
                    <TableHead className="text-xs text-right">Duration</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runLog.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-xs font-mono">{new Date(entry.timestamp).toLocaleTimeString()}</TableCell>
                      <TableCell className="text-xs capitalize">{entry.mode === 'full' ? 'Full Calculate' : entry.mode === 'verify' ? 'Verify Data' : 'Util Only'}</TableCell>
                      <TableCell className="text-xs">{entry.scenarioName}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{entry.durationMs < 1000 ? `${entry.durationMs}ms` : `${(entry.durationMs / 1000).toFixed(1)}s`}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${
                          entry.status === 'success' ? 'border-success/40 text-success' :
                          entry.status === 'warning' ? 'border-warning/40 text-warning' :
                          'border-destructive/40 text-destructive'
                        }`}>
                          {entry.status === 'success' ? <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> :
                           entry.status === 'warning' ? <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> :
                           <XCircle className="h-2.5 w-2.5 mr-0.5" />}
                          {entry.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card> 
        )} */}
      </div>

      {/* ── Max Throughput + Lot Size Range Modal ── */}
      <Dialog open={mtModalOpen} onOpenChange={setMtModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Max. Throughput + Lot Size Range</DialogTitle>
            <DialogDescription>Find max production or sweep lot sizes for a product.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Section 1 — Choose Product */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Choose Product</Label>
              <Select value={mtModalProduct} onValueChange={setMtModalProduct}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {model?.products.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section 2 — What-if Name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">What-if Name</Label>
              <Input
                value={mtModalName}
                onChange={e => setMtModalName(e.target.value)}
                placeholder={mtModalMode === 'max_throughput' ? 'Max Throughput' : 'Lot Size Range'}
              />
            </div>

            {/* Section 3 — Choose Mode */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Choose Mode</Label>
              <RadioGroup value={mtModalMode} onValueChange={(v) => setMtModalMode(v as any)}>
                <div className="flex items-start gap-2">
                  <RadioGroupItem value="max_throughput" id="mt-mode-max" className="mt-0.5" />
                  <Label htmlFor="mt-mode-max" className="text-sm font-normal cursor-pointer">
                    <span className="font-medium">Maximise Production</span>
                    <span className="block text-xs text-muted-foreground">Finds the maximum possible production quantity given current constraints.</span>
                  </Label>
                </div>
                <div className="flex items-start gap-2">
                  <RadioGroupItem value="lot_size_range" id="mt-mode-ls" className="mt-0.5" />
                  <Label htmlFor="mt-mode-ls" className="text-sm font-normal cursor-pointer">
                    <span className="font-medium">Run a Range of Lot Sizes</span>
                    <span className="block text-xs text-muted-foreground">Runs a series of calculations across a range of lot sizes.</span>
                  </Label>
                </div>
              </RadioGroup>

              {mtModalMode === 'lot_size_range' && (
                <div className="ml-6 mt-2 space-y-3 p-3 bg-muted/40 rounded-md border border-border">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">From lot size</Label>
                      <NonNegativeNumericInput value={mtModalLsFrom} onChange={(v) => setMtModalLsFrom(v)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">To lot size</Label>
                      <NonNegativeNumericInput value={mtModalLsTo} onChange={(v) => setMtModalLsTo(v)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Step size</Label>
                      <NonNegativeNumericInput value={mtModalLsStep} onChange={(v) => setMtModalLsStep(v)} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Will run lot sizes: {(() => {
                      const sizes: number[] = [];
                      for (let s = mtModalLsFrom; s <= mtModalLsTo && sizes.length < 5; s += mtModalLsStep) sizes.push(s);
                      return sizes.join(', ') + (mtModalLsTo > (mtModalLsFrom + mtModalLsStep * 4) ? '…' : '') + ' (one What-if per lot size)';
                    })()}
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMtModalOpen(false)}>Cancel</Button>
            <Button
              disabled={!mtModalProduct || advRunning}
              onClick={async () => {
                setMtModalOpen(false);
                if (!model) return;
                const product = model.products.find(p => p.id === mtModalProduct);
                if (!product) return;

                if (mtModalMode === 'max_throughput') {
                  // Inline max throughput logic
                  setAdvRunning(true);
                  let demand = product.demand > 0 ? product.demand : 100;
                  let lastValidDemand = demand;
                  let limitingResource = '';
                  const step = Math.max(1, Math.round(demand * 0.1));
                  let iterations = 0;
                  const maxIter = 200;

                  while (iterations < maxIter) {
                    iterations++;
                    setAdvProgress({ current: iterations, total: maxIter, label: `Testing demand: ${Math.round(demand)}` });
                    const testModel = { ...model, products: model.products.map(p => p.id === mtModalProduct ? { ...p, demand } : p) };
                    const r = await fullCalculate(testModel);
                    if (r.overLimitResources.length > 0) {
                      limitingResource = r.overLimitResources[0];
                      let lo = lastValidDemand, hi = demand;
                      for (let i = 0; i < 20; i++) {
                        const mid = Math.round((lo + hi) / 2);
                        const tr = await fullCalculate({ ...model, products: model.products.map(p => p.id === mtModalProduct ? { ...p, demand: mid } : p) });
                        if (tr.overLimitResources.length > 0) { hi = mid; limitingResource = tr.overLimitResources[0]; }
                        else { lo = mid; lastValidDemand = mid; }
                        if (hi - lo <= 1) break;
                      }
                      break;
                    }
                    lastValidDemand = demand;
                    demand += step;
                    await new Promise(r => setTimeout(r, 0));
                  }

                  const name = mtModalName || `Max Throughput — ${product.name}`;
                  const scenarioId = await createScenario(model.id, name);
                  useScenarioStore.getState().applyScenarioChange(scenarioId, 'Product', mtModalProduct, product.name, 'demand', 'Demand', lastValidDemand);
                  const scenario = useScenarioStore.getState().scenarios.find(s => s.id === scenarioId);
                  if (scenario) {
                    const r = await fullCalculate(model, scenario);
                    setStoreResults(scenarioId, r);
                    useScenarioStore.getState().markCalculated(scenarioId);
                    await scenarioDb.saveResults(scenarioId, r);
                  }
                  setMtResult({ demand: lastValidDemand, limitingResource });
                  setAdvProgress(null);
                  setAdvRunning(false);
                  toast.success(`Max throughput for ${product.name}: ${lastValidDemand} units`);
                } else {
                  // Inline lot size range logic
                  setAdvRunning(true);
                  const steps: number[] = [];
                  for (let ls = mtModalLsFrom; ls <= mtModalLsTo; ls += mtModalLsStep) steps.push(ls);
                  const curResults: {lotSize: number; mct: number}[] = [];

                  for (let i = 0; i < steps.length; i++) {
                    setAdvProgress({ current: i + 1, total: steps.length, label: `Lot size: ${steps[i]}` });
                    const testModel = { ...model, products: model.products.map(p => p.id === mtModalProduct ? { ...p, lot_size: steps[i] } : p) };
                    const r = await fullCalculate(testModel);
                    const pr = r.products.find(p => p.id === mtModalProduct);
                    curResults.push({ lotSize: steps[i], mct: pr?.mct || 0 });

                    const scName = `${mtModalName || product.name} — Lot ${steps[i]}`;
                    const scenarioId = await createScenario(model.id, scName);
                    useScenarioStore.getState().applyScenarioChange(scenarioId, 'Product', mtModalProduct, product.name, 'lot_size', 'Lot Size', steps[i]);
                    const sc = useScenarioStore.getState().scenarios.find(s => s.id === scenarioId);
                    if (sc) {
                      setStoreResults(scenarioId, r);
                      useScenarioStore.getState().markCalculated(scenarioId);
                      await scenarioDb.saveResults(scenarioId, r);
                    }
                    await new Promise(r => setTimeout(r, 0));
                  }
                  setLsrResults(curResults);
                  setAdvProgress(null);
                  setAdvRunning(false);
                  toast.success(`Created ${steps.length} lot size scenarios for ${product.name}`);
                }
              }}
            >
              Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Optimise Lot Sizes Modal ── */}
      <Dialog open={olModalOpen} onOpenChange={setOlModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Optimise Lot Sizes and Transfer Batches</DialogTitle>
            <DialogDescription>MPX will iteratively adjust lot sizes and transfer batches to minimise weighted WIP.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">What-if Name</Label>
              <Input value={olName} onChange={e => setOlName(e.target.value)} placeholder="Optimised Lot Sizes" />
            </div>

            <div className="flex gap-4">
              {/* Product table */}
              <div className="flex-1 border border-border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Product Name</TableHead>
                      <TableHead className="text-xs text-right w-28">Total Unit Value</TableHead>
                      <TableHead className="text-xs text-center w-24">Opt. Lot Size</TableHead>
                      <TableHead className="text-xs text-center w-24">Opt. T-Batch</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {model?.products.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="text-sm py-1.5">{p.name}</TableCell>
                        <TableCell className="py-1.5">
                          <NonNegativeNumericInput
                            allowDecimal
                            className="h-7 text-xs text-right w-24 ml-auto"
                            value={olUnitValues[p.id] ?? 1}
                            onChange={(v) => setOlUnitValues(prev => ({ ...prev, [p.id]: v }))}
                          />
                        </TableCell>
                        <TableCell className="text-center py-1.5">
                          <Checkbox
                            checked={olOptLot.has(p.id)}
                            onCheckedChange={checked => {
                              setOlOptLot(prev => { const n = new Set(prev); if (checked) n.add(p.id); else n.delete(p.id); return n; });
                            }}
                          />
                        </TableCell>
                        <TableCell className="text-center py-1.5">
                          <Checkbox
                            checked={olOptTb.has(p.id)}
                            onCheckedChange={checked => {
                              setOlOptTb(prev => { const n = new Set(prev); if (checked) n.add(p.id); else n.delete(p.id); return n; });
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Right-side buttons */}
              <div className="flex flex-col gap-2 shrink-0 w-44">
                <Button size="sm" variant="outline" className="text-xs justify-start" onClick={() => setOlOptLot(new Set(model?.products.map(p => p.id) || []))}>Select All Lot Sizes</Button>
                <Button size="sm" variant="outline" className="text-xs justify-start" onClick={() => setOlOptLot(new Set())}>Deselect All Lot Sizes</Button>
                <Button size="sm" variant="outline" className="text-xs justify-start mt-2" onClick={() => setOlOptTb(new Set(model?.products.map(p => p.id) || []))}>Select All Transfer Batches</Button>
                <Button size="sm" variant="outline" className="text-xs justify-start" onClick={() => setOlOptTb(new Set())}>Deselect All Transfer Batches</Button>
              </div>
            </div>

            {/* WIP displays */}
            <div className="flex gap-6 text-sm">
              <div><span className="text-muted-foreground">Initial WIP Total Unit Value:</span> <span className="font-mono font-medium">{olInitialWip != null ? olInitialWip.toLocaleString() : '—'}</span></div>
              <div><span className="text-muted-foreground">Current WIP Total Unit Value:</span> <span className="font-mono font-medium">{olCurrentWip != null ? olCurrentWip.toLocaleString() : '—'}</span></div>
            </div>

            <p className="text-xs text-muted-foreground">
              Results will be real numbers. Round up to whole numbers when applying to your model. The function is flat near the optimum so nearby values give similar results.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOlModalOpen(false)}>Cancel</Button>
            <Button
              disabled={advRunning || (olOptLot.size === 0 && olOptTb.size === 0)}
              onClick={async () => {
                setOlModalOpen(false);
                if (!model) return;
                setAdvRunning(true);

                const selectedIds = new Set([...olOptLot, ...olOptTb]);
                const selectedProducts = model.products.filter(p => selectedIds.has(p.id));
                if (selectedProducts.length === 0) { setAdvRunning(false); return; }

                const baseCalc = await fullCalculate(model);
                const weightedWip = (r: CalcResults) => r.products.reduce((s, pr) => s + pr.wip * (olUnitValues[pr.id] || 1), 0);
                let bestWip = weightedWip(baseCalc);

                let bestLots: Record<string, number> = {};
                let bestTBatches: Record<string, number> = {};
                model.products.forEach(p => { bestLots[p.id] = p.lot_size; bestTBatches[p.id] = p.tbatch_size; });

                const maxIter = 60;
                for (let iter = 0; iter < maxIter; iter++) {
                  setAdvProgress({ current: iter + 1, total: maxIter, label: `Weighted WIP: ${Math.round(bestWip)} (iter ${iter + 1})` });
                  setOlCurrentWip(Math.round(bestWip * 100) / 100);
                  let improved = false;

                  for (const p of selectedProducts) {
                    // Try lot size changes
                    if (olOptLot.has(p.id)) {
                      for (const delta of [-Math.max(1, Math.round(bestLots[p.id] * 0.1)), Math.max(1, Math.round(bestLots[p.id] * 0.1))]) {
                        const newLot = Math.max(1, bestLots[p.id] + delta);
                        if (newLot === bestLots[p.id]) continue;
                        const testModel = { ...model, products: model.products.map(pp => ({
                          ...pp,
                          lot_size: pp.id === p.id ? newLot : (bestLots[pp.id] ?? pp.lot_size),
                          tbatch_size: bestTBatches[pp.id] ?? pp.tbatch_size,
                        })) };
                        const r = await fullCalculate(testModel);
                        const w = weightedWip(r);
                        if (w < bestWip && r.overLimitResources.length === 0) {
                          bestLots[p.id] = newLot; bestWip = w; improved = true;
                        }
                      }
                    }
                    // Try transfer batch changes
                    if (olOptTb.has(p.id)) {
                      for (const delta of [-Math.max(1, Math.round(Math.abs(bestTBatches[p.id]) * 0.15)), Math.max(1, Math.round(Math.abs(bestTBatches[p.id]) * 0.15))]) {
                        const newTb = Math.max(1, bestTBatches[p.id] + delta);
                        if (newTb === bestTBatches[p.id]) continue;
                        const testModel = { ...model, products: model.products.map(pp => ({
                          ...pp,
                          lot_size: bestLots[pp.id] ?? pp.lot_size,
                          tbatch_size: pp.id === p.id ? newTb : (bestTBatches[pp.id] ?? pp.tbatch_size),
                        })) };
                        const r = await fullCalculate(testModel);
                        const w = weightedWip(r);
                        if (w < bestWip && r.overLimitResources.length === 0) {
                          bestTBatches[p.id] = newTb; bestWip = w; improved = true;
                        }
                      }
                    }
                  }
                  if (!improved) break;
                  await new Promise(r => setTimeout(r, 0));
                }

                // Save as What-if
                const scenarioId = await createScenario(model.id, olName || 'Optimised Lot Sizes');
                for (const p of selectedProducts) {
                  if (olOptLot.has(p.id) && bestLots[p.id] !== p.lot_size) {
                    useScenarioStore.getState().applyScenarioChange(scenarioId, 'Product', p.id, p.name, 'lot_size', 'Lot Size', bestLots[p.id]);
                  }
                  if (olOptTb.has(p.id) && bestTBatches[p.id] !== p.tbatch_size) {
                    useScenarioStore.getState().applyScenarioChange(scenarioId, 'Product', p.id, p.name, 'tbatch_size', 'Transfer Batch Size', bestTBatches[p.id]);
                  }
                }
                const scenario = useScenarioStore.getState().scenarios.find(s => s.id === scenarioId);
                if (scenario) {
                  const r = await fullCalculate(model, scenario);
                  setStoreResults(scenarioId, r);
                  useScenarioStore.getState().markCalculated(scenarioId);
                  await scenarioDb.saveResults(scenarioId, r);
                }
                setOlCurrentWip(Math.round(bestWip * 100) / 100);
                setAdvProgress(null);
                setAdvRunning(false);
                const reduction = olInitialWip ? Math.round((1 - bestWip / olInitialWip) * 100) : 0;
                toast.success(`Optimisation complete — weighted WIP reduced by ${reduction}%`);
              }}
            >
              Run Optimisation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

/* ─── Util-Only Banner ─── */
function UtilOnlyBanner({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 p-3 mb-4 bg-warning/10 border border-warning/30 rounded-md">
      <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
      <span className="text-sm text-warning font-medium">{message || 'WIP and MCT results require Full Calculate. These results show utilisation data only.'}</span>
    </div>
  );
}

/* ─── IBOM Tab Content ─── */
function IBOMTabContent({ model, results, basecaseResults, isRunning, isUtilOnly, ibomSubTab, setIbomSubTab }: {
  model: Model; results: CalcResults; basecaseResults: CalcResults | undefined; isRunning: boolean; isUtilOnly: boolean;
  ibomSubTab: string; setIbomSubTab: (t: string) => void;
}) {
  const allScenarios = useScenarioStore(s => s.scenarios);
  const modelScenarios = allScenarios.filter(s => s.modelId === model.id);
  const { getResults } = useResultsStore();

  // Find final assemblies
  const finalAssemblies = useMemo(() => {
    const parentIds = new Set(model.ibom.map(e => e.parent_product_id));
    const componentIds = new Set(model.ibom.map(e => e.component_product_id));
    const topLevel = model.products.filter(p => parentIds.has(p.id) && !componentIds.has(p.id));
    return topLevel.length > 0 ? topLevel : model.products.filter(p => parentIds.has(p.id));
  }, [model]);

  const [selectedProductId, setSelectedProductId] = useState(() => finalAssemblies[0]?.id || '');
  const [scenarioId, setScenarioId] = useState('basecase');

  const ibomResults = getResults(scenarioId) || results;
  const scenario = allScenarios.find(s => s.id === scenarioId);
  const scenarioLabel = scenarioId === 'basecase' ? 'Basecase results' : `${scenario?.name || 'What-if'} results`;
  const mctUnit = model.general.mct_time_unit.toLowerCase() + 's';
  const runScenarios = modelScenarios.filter(s => getResults(s.id));

  // No IBOM structure
  if (model.ibom.length === 0 || finalAssemblies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Network className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-base font-medium text-muted-foreground mb-1">No IBOM structure defined</p>
        <p className="text-sm text-muted-foreground/70">Go to Input → IBOM to add component relationships between products.</p>
      </div>
    );
  }

  const hasChildren = model.ibom.some(e => e.parent_product_id === selectedProductId);
  const tree = hasChildren ? buildNodeTree(model, ibomResults, selectedProductId, 0, new Set()) : null;
  const poles = tree ? buildPoles(tree) : [];

  return (
    <div className="flex flex-col h-full">
      {/* Level 2 sub-tab bar */}
      <div className="flex h-8 items-center gap-0 border-b border-border/50 -mx-6 px-6 mb-0 shrink-0">
        {([
          { key: 'tree-chart', label: 'Tree Chart' },
          { key: 'tree-table', label: 'Tree Table' },
          { key: 'poles-chart', label: 'Poles Chart' },
          { key: 'poles-table', label: 'Poles Table' },
        ] as const).map(st => (
          <button
            key={st.key}
            onClick={() => setIbomSubTab(st.key)}
            className={`h-8 px-4 text-[13px] relative transition-colors ${
              ibomSubTab === st.key
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {st.label}
            {ibomSubTab === st.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/60" />
            )}
          </button>
        ))}
      </div>

      {/* Shared IBOM control bar */}
      <div className="flex items-center gap-3 py-3 -mx-6 px-6 border-b border-border/30 mb-4">
        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger className="w-48 h-8 text-xs"><SelectValue placeholder="Select assembly..." /></SelectTrigger>
          <SelectContent>
            {finalAssemblies.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Select value={scenarioId} onValueChange={setScenarioId}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="basecase">Basecase</SelectItem>
            {runScenarios.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <span className="text-sm font-medium text-primary whitespace-nowrap">{scenarioLabel}</span>
      </div>

      {/* Util-only banner for all IBOM sub-tabs */}
      {isUtilOnly && <UtilOnlyBanner message="IBOM MCT results require Full Calculate." />}

      {/* No children for selected product */}
      {!tree ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">This product has no components. Select a product with sub-assemblies to view the IBOM tree.</p>
        </div>
      ) : (
        <>
          {ibomSubTab === 'tree-chart' && (
            <>
              <TreeChart model={model} results={ibomResults} tree={tree} mctUnit={mctUnit} />
              <MCTLegend />
            </>
          )}
          {ibomSubTab === 'tree-table' && (
            <TreeTable model={model} results={ibomResults} tree={tree} mctUnit={mctUnit} />
          )}
          {ibomSubTab === 'poles-chart' && (
            <>
              <PolesChart model={model} poles={poles} mctUnit={mctUnit} />
              <MCTLegend />
            </>
          )}
          {ibomSubTab === 'poles-table' && (
            <PolesTable model={model} poles={poles} mctUnit={mctUnit} />
          )}
        </>
      )}
    </div>
  );
}

const UTIL_ONLY_PRODUCT_COLUMNS = [
  'name',
  'goodMade',
  'goodShipped',
  'scrappedInAssembly',
  'usedInAssembly',
  'scrap',
  'wip',
  'mct',
] as const;

type ProductTableColKey = typeof UTIL_ONLY_PRODUCT_COLUMNS[number] | 'started' | 'timeWaitingEquipment' | 'timeWaitingLabor' | 'timeSetup' | 'timeRun' | 'timeWaitingRestOfLot' | 'outOfAreaTime';

function productColumnLabel(colKey: ProductTableColKey, utilOnly: boolean): string {
  if (!utilOnly) {
    return colKey === 'name' ? 'Product' : colKey === 'goodMade' ? 'Good Made' : colKey === 'goodShipped' ? 'Good Shipped' : colKey === 'started' ? 'Started' : colKey === 'scrap' ? 'Scrap' : colKey === 'scrappedInAssembly' ? 'Scrapped Assy' : colKey === 'usedInAssembly' ? 'Used Assy' : colKey === 'timeWaitingEquipment' ? 'Wait Equip' : colKey === 'timeWaitingLabor' ? 'Wait Labor' : colKey === 'timeSetup' ? 'Setup Time' : colKey === 'timeRun' ? 'Run Time' : colKey === 'timeWaitingRestOfLot' ? 'Wait Lot' : colKey === 'outOfAreaTime' ? 'Out Area' : colKey === 'wip' ? 'WIP' : 'MCT';
  }
  if (colKey === 'name') return 'Product';
  if (colKey === 'goodMade') return 'Total Good Production';
  if (colKey === 'goodShipped') return 'Shipped Production';
  if (colKey === 'scrappedInAssembly') return 'Scrapped In Assembly';
  if (colKey === 'usedInAssembly') return 'Used in Assembly';
  if (colKey === 'scrap') return 'Scrap In Initial Production';
  if (colKey === 'wip') return 'WIP';
  return 'MCT';
}

function formatProductMetricValue(row: any, colKey: ProductTableColKey, isUtilOnly: boolean): string {
  if (colKey === 'name') return row.name;
  if (colKey === 'goodMade') return fmtFixed(row.goodMade, 2);
  if (colKey === 'goodShipped') return fmtFixed(row.goodShipped, 2);
  if (colKey === 'started') return fmtFixed(row.started, 2);
  if (colKey === 'scrap') return fmtFixed(row.scrap, 2);
  if (colKey === 'scrappedInAssembly') return fmtFixed(row.scrappedInAssembly, 2);
  if (colKey === 'usedInAssembly') return fmtFixed(row.usedInAssembly, 2);
  if (colKey === 'timeWaitingEquipment') return fmtFixed(row.timeWaitingEquipment, 2);
  if (colKey === 'timeWaitingLabor') return fmtFixed(row.timeWaitingLabor, 2);
  if (colKey === 'timeSetup') return fmtFixed(row.timeSetup, 2);
  if (colKey === 'timeRun') return fmtFixed(row.timeRun, 2);
  if (colKey === 'timeWaitingRestOfLot') return fmtFixed(row.timeWaitingRestOfLot, 2);
  if (colKey === 'outOfAreaTime') return fmtFixed(row.outOfAreaTime, 2);
  if (colKey === 'wip') return fmtFixed(isUtilOnly ? 0 : row.wip, 3);
  return fmtFixed(isUtilOnly ? 0 : row.mct, 3);
}

function transposeProductCountCap(productCount: number): { minPx: number; maxPx: number; padPx: number } {
  if (productCount <= 4) return { minPx: 52, maxPx: 104, padPx: 14 };
  if (productCount <= 8) return { minPx: 48, maxPx: 88, padPx: 12 };
  if (productCount <= 12) return { minPx: 46, maxPx: 78, padPx: 12 };
  return { minPx: 44, maxPx: 72, padPx: 10 };
}

function computeTransposeProductColWidthsPx(
  products: any[],
  metricColumns: Exclude<ProductTableColKey, 'name'>[],
  isUtilOnly: boolean,
  displayScenarioResults: { id: string; scenario: any; results: CalcResults }[],
): number[] {
  const { minPx, maxPx, padPx } = transposeProductCountCap(products.length);
  return products.map((product) => {
    let maxChars = String(product.name ?? '').length;
    for (const colKey of metricColumns) {
      maxChars = Math.max(maxChars, formatProductMetricValue(product, colKey, isUtilOnly).length);
    }
    for (const sr of displayScenarioResults) {
      const sp = sr.results.products.find((p: any) => p.id === product.id);
      maxChars = Math.max(
        maxChars,
        sp ? fmtFixed(isUtilOnly ? 0 : sp.wip, 3).length : 1,
        sp ? fmtFixed(isUtilOnly ? 0 : sp.mct, 3).length : 1,
      );
    }
    const px = Math.round(maxChars * 6.5 + padPx);
    return Math.min(maxPx, Math.max(minPx, px));
  });
}

function computeTransposeMetricColWidthPx(
  metricColumns: Exclude<ProductTableColKey, 'name'>[],
  isUtilOnly: boolean,
  displayScenarioResults: { id: string; scenario: any; results: CalcResults }[],
): number {
  const labels = [
    'Metric',
    ...metricColumns.map((k) => productColumnLabel(k, isUtilOnly)),
    ...displayScenarioResults.flatMap((sr) => [`WIP ${sr.scenario.name}`, `MCT ${sr.scenario.name}`]),
  ];
  return estimateColMinWidthPx('Metric', labels, 84, 152);
}

/** Content-weighted column % so the table spans full card width (metric + products = 100%). */
function computeTransposeColPercents(metricColWidthPx: number, productColWeightsPx: number[]): number[] {
  const productSum = productColWeightsPx.reduce((sum, w) => sum + w, 0);
  if (productSum <= 0) return [100];
  const total = metricColWidthPx + productSum;
  const metricPercent = (metricColWidthPx / total) * 100;
  const productShare = 100 - metricPercent;
  return [
    metricPercent,
    ...productColWeightsPx.map((w) => (w / productSum) * productShare),
  ];
}

function TransposedProductResults({
  products,
  columnOrder,
  displayScenarioResults,
  isUtilOnly,
  colPercents,
  onResizeProductColumn,
  onMoveMetric,
  onMoveProduct,
}: {
  products: any[];
  columnOrder: ProductTableColKey[];
  displayScenarioResults: { id: string; scenario: any; results: CalcResults }[];
  isUtilOnly: boolean;
  colPercents: number[];
  onResizeProductColumn: (index: number, ev: React.MouseEvent) => void;
  onMoveMetric: (fromKey: string, toKey: string) => void;
  onMoveProduct: (fromId: string, toId: string) => void;
}) {
  const dragMetricRef = useRef<string | null>(null);
  const dragProductRef = useRef<string | null>(null);
  const metricColumns = columnOrder.filter((k): k is Exclude<ProductTableColKey, 'name'> => k !== 'name');
  const hasScenarios = displayScenarioResults.length > 0;
  const scenarioRows = hasScenarios
    ? displayScenarioResults.flatMap(sr => ([
        { key: `${sr.id}-wip`, label: `WIP — ${sr.scenario.name}`, kind: 'wip' as const, scenario: sr },
        { key: `${sr.id}-mct`, label: `MCT — ${sr.scenario.name}`, kind: 'mct' as const, scenario: sr },
      ]))
    : [];

  const metricPercent = colPercents[0] ?? 12;
  const productPercents = colPercents.slice(1);

  return (
    <Table className="w-full table-fixed border-separate border-spacing-0">
      <colgroup>
        <col style={{ width: `${metricPercent}%` }} />
        {products.map((row, i) => (
          <col key={row.id} style={{ width: `${productPercents[i] ?? 100 / Math.max(products.length, 1)}%` }} />
        ))}
      </colgroup>
      <TableHeader>
        <TableRow>
          <TableHead
            className={`font-mono text-xs ${PRODUCT_TABLE_COLUMN_HEAD} ${TRANSPOSE_METRIC_CELL} ${PRODUCT_TABLE_STICKY_TOP_LEFT}`}
          >
            Metric
          </TableHead>
          {products.map((row: any, index: number) => (
            <TableHead
              key={row.id}
              draggable
              className={`font-mono text-xs whitespace-nowrap ${PRODUCT_TABLE_COLUMN_HEAD} ${TRANSPOSE_PRODUCT_HEAD} ${index > 0 ? TRANSPOSE_PRODUCT_COL_DIVIDER : ''} relative cursor-move select-none hover:text-foreground transition-colors ${PRODUCT_TABLE_STICKY_TOP}`}
              onDragStart={() => { dragProductRef.current = row.id; }}
              onDragOver={ev => ev.preventDefault()}
              onDrop={() => {
                if (dragProductRef.current) onMoveProduct(dragProductRef.current, row.id);
                dragProductRef.current = null;
              }}
              onDragEnd={() => { dragProductRef.current = null; }}
            >
              <span className="block" title={row.name}>{row.name}</span>
              {index < products.length - 1 && (
                <span
                  className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-primary/25 transition-colors"
                  onMouseDown={ev => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    onResizeProductColumn(index, ev);
                  }}
                />
              )}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {metricColumns.map(colKey => (
          <TableRow key={colKey}>
            <TableCell
              draggable
              className={`font-mono text-xs font-medium sticky left-0 z-10 bg-background shadow-[2px_0_4px_-2px_hsl(var(--border))] ${TRANSPOSE_METRIC_CELL} cursor-move select-none hover:text-foreground transition-colors`}
              onDragStart={() => { dragMetricRef.current = colKey; }}
              onDragOver={ev => ev.preventDefault()}
              onDrop={() => {
                if (dragMetricRef.current) onMoveMetric(dragMetricRef.current, colKey);
                dragMetricRef.current = null;
              }}
              onDragEnd={() => { dragMetricRef.current = null; }}
            >
              {productColumnLabel(colKey, isUtilOnly)}
            </TableCell>
            {products.map((row: any, index: number) => (
              <TableCell
                key={row.id}
                className={`font-mono text-xs whitespace-nowrap ${TRANSPOSE_PRODUCT_CELL} ${index > 0 ? TRANSPOSE_PRODUCT_COL_DIVIDER : ''} ${colKey === 'mct' ? 'font-medium' : ''}`}
              >
                {formatProductMetricValue(row, colKey, isUtilOnly)}
              </TableCell>
            ))}
          </TableRow>
        ))}
        {scenarioRows.map(({ key, label, kind, scenario: sr }) => (
          <TableRow key={key} className="bg-muted/30">
            <TableCell
              className={`font-mono text-xs font-medium text-primary sticky left-0 z-10 bg-muted/30 shadow-[2px_0_4px_-2px_hsl(var(--border))] ${TRANSPOSE_METRIC_CELL}`}
            >
              {label}
            </TableCell>
            {products.map((row: any, index: number) => {
              const sp = sr.results.products.find((p: any) => p.id === row.id);
              const baseMct = isUtilOnly ? 0 : row.mct;
              if (kind === 'wip') {
                return (
                  <TableCell
                    key={row.id}
                    className={`font-mono text-xs whitespace-nowrap ${TRANSPOSE_PRODUCT_CELL} ${index > 0 ? TRANSPOSE_PRODUCT_COL_DIVIDER : ''}`}
                  >
                    {sp ? fmtFixed(isUtilOnly ? 0 : sp.wip, 3) : '—'}
                  </TableCell>
                );
              }
              return (
                <TableCell
                  key={row.id}
                  className={`font-mono text-xs whitespace-nowrap ${TRANSPOSE_PRODUCT_CELL} ${index > 0 ? TRANSPOSE_PRODUCT_COL_DIVIDER : ''} ${!isUtilOnly && sp && sp.mct < baseMct ? 'text-success' : !isUtilOnly && sp && sp.mct > baseMct ? 'text-destructive' : ''}`}
                >
                  {sp ? fmtFixed(isUtilOnly ? 0 : sp.mct, 3) : '—'}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/* ─── Product Results Table ─── */
function ProductResultsTable({ results, model, displayScenarioResults, isUtilOnly = false }: {
  results: CalcResults; model: any;
  displayScenarioResults: { id: string; scenario: any; results: CalcResults }[];
  isUtilOnly?: boolean;
}) {
  const productRows = useMemo(() => {
    return results.products.map((pr: any) => {
      // Keep Product Results Table consistent with DLL-based Production Chart:
      // Scrapped in Assembly comes from DLL ScrapInAsm mapping, and
      // Used in Assembly = TotalGoodProd - Scrapped in Assembly.
      const anyPr = pr as any;
      const scrappedInAssembly = asNum(
        anyPr.scrappedInAssembly ??
        anyPr.scrapInAssembly ??
        anyPr.ScrapInAsm ??
        anyPr.scrappedInAssy ??
        anyPr.scrapInAssy ??
        anyPr.ScarpInAsm ??
        anyPr.scrapped_in_assembly ??
        anyPr.scrap_in_assembly,
      );
      const totalGoodProd = asNum(anyPr.totalGoodProd ?? anyPr.total_good_prod ?? pr.goodMade);
      const usedInAssembly = Math.max(0, totalGoodProd - scrappedInAssembly);
      const timeWaitingEquipment = asNum(pr.mctQueue);
      const timeWaitingLabor = asNum(pr.mctWaitLabor);
      const timeSetup = asNum(pr.mctSetup);
      const timeRun = asNum(pr.mctRun);
      const timeWaitingRestOfLot = asNum(pr.mctLotWait);
      const outOfAreaTime = asNum(pr.mct) - (timeWaitingEquipment + timeWaitingLabor + timeSetup + timeRun + timeWaitingRestOfLot);
      return {
        ...pr,
        usedInAssembly,
        scrappedInAssembly,
        timeWaitingEquipment,
        timeWaitingLabor,
        timeSetup,
        timeRun,
        timeWaitingRestOfLot,
        outOfAreaTime,
      };
    });
  }, [results.products]);
  const { sorted, sort, handleSort } = useSortableTable(productRows, 'mct', 'desc');
  const productCols = useResizableColumns([10, 6, 6, 6, 5, 8, 8, 8, 8, 5, 5, 9, 8, 4, 4], 4);
  const defaultColumnOrder: ProductTableColKey[] = isUtilOnly
    ? [...UTIL_ONLY_PRODUCT_COLUMNS]
    : ['name', 'goodMade', 'goodShipped', 'started', 'scrap', 'scrappedInAssembly', 'usedInAssembly', 'timeWaitingEquipment', 'timeWaitingLabor', 'timeSetup', 'timeRun', 'timeWaitingRestOfLot', 'outOfAreaTime', 'wip', 'mct'];
  const [columnOrder, setColumnOrder] = useState<ProductTableColKey[]>(defaultColumnOrder);
  useEffect(() => {
    setColumnOrder(
      isUtilOnly
        ? [...UTIL_ONLY_PRODUCT_COLUMNS]
        : ['name', 'goodMade', 'goodShipped', 'started', 'scrap', 'scrappedInAssembly', 'usedInAssembly', 'timeWaitingEquipment', 'timeWaitingLabor', 'timeSetup', 'timeRun', 'timeWaitingRestOfLot', 'outOfAreaTime', 'wip', 'mct'],
    );
  }, [isUtilOnly, results.calculatedAt]);
  const [transposed, setTransposed] = useState(false);
  const [productOrder, setProductOrder] = useState<string[]>([]);
  const dragFromRef = useRef<string | null>(null);
  const hasScenarios = displayScenarioResults.length > 0;

  const syncProductOrderFromSorted = useCallback(() => {
    setProductOrder(sorted.map((p: any) => p.id));
  }, [sorted]);

  useEffect(() => {
    syncProductOrderFromSorted();
  }, [results.calculatedAt, isUtilOnly, syncProductOrderFromSorted]);

  const orderedProducts = useMemo(() => {
    const byId = new Map(sorted.map((p: any) => [p.id, p]));
    const ids = productOrder.length > 0 ? productOrder : sorted.map((p: any) => p.id);
    return ids.map(id => byId.get(id)).filter(Boolean) as any[];
  }, [sorted, productOrder]);

  const transposeMetricColumns = useMemo(
    () => columnOrder.filter((k): k is Exclude<ProductTableColKey, 'name'> => k !== 'name'),
    [columnOrder],
  );

  const defaultTransposeProductColWidthsPx = useMemo(
    () => computeTransposeProductColWidthsPx(orderedProducts, transposeMetricColumns, isUtilOnly, displayScenarioResults),
    [orderedProducts, transposeMetricColumns, isUtilOnly, displayScenarioResults],
  );

  const defaultTransposeMetricColWidthPx = useMemo(
    () => computeTransposeMetricColWidthPx(transposeMetricColumns, isUtilOnly, displayScenarioResults),
    [transposeMetricColumns, isUtilOnly, displayScenarioResults],
  );

  const defaultTransposeColPercents = useMemo(
    () => computeTransposeColPercents(defaultTransposeMetricColWidthPx, defaultTransposeProductColWidthsPx),
    [defaultTransposeMetricColWidthPx, defaultTransposeProductColWidthsPx],
  );

  const [transposeColPercents, setTransposeColPercents] = useState<number[]>([]);

  useEffect(() => {
    setTransposeColPercents(defaultTransposeColPercents);
  }, [defaultTransposeColPercents]);

  const startTransposeProductResize = useCallback((index: number, ev: React.MouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    const colIndex = index + 1;
    if (colIndex < 1 || colIndex >= transposeColPercents.length - 1) return;
    const containerWidth = productCols.containerRef.current?.getBoundingClientRect().width ?? 0;
    if (!containerWidth) return;

    const startX = ev.clientX;
    const startWidths = [...transposeColPercents];
    const minWidthPercent = 4;

    const onMouseMove = (moveEv: MouseEvent) => {
      const deltaPercent = ((moveEv.clientX - startX) / containerWidth) * 100;
      let left = startWidths[colIndex] + deltaPercent;
      let right = startWidths[colIndex + 1] - deltaPercent;

      if (left < minWidthPercent) {
        right -= minWidthPercent - left;
        left = minWidthPercent;
      }
      if (right < minWidthPercent) {
        left -= minWidthPercent - right;
        right = minWidthPercent;
      }

      setTransposeColPercents((prev) => prev.map((w, i) => {
        if (i === colIndex) return left;
        if (i === colIndex + 1) return right;
        return w;
      }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [transposeColPercents, productCols.containerRef]);

  const moveTransposeColPercents = useCallback((fromIndex: number, toIndex: number) => {
    const fromCol = fromIndex + 1;
    const toCol = toIndex + 1;
    if (fromCol === toCol || fromCol < 1 || toCol < 1 || fromCol >= transposeColPercents.length || toCol >= transposeColPercents.length) return;
    setTransposeColPercents((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromCol, 1);
      next.splice(toCol, 0, moved);
      return next;
    });
  }, [transposeColPercents.length]);

  const moveMetricColumn = useCallback((fromKey: string, toKey: string) => {
    const fromIndex = columnOrder.indexOf(fromKey as ProductTableColKey);
    const toIndex = columnOrder.indexOf(toKey as ProductTableColKey);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    setColumnOrder(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next as ProductTableColKey[];
    });
    if (!transposed) productCols.moveColumn(fromIndex, toIndex);
  }, [columnOrder, productCols, transposed]);

  const moveProductColumn = useCallback((fromKey: string, toKey: string) => {
    moveMetricColumn(fromKey, toKey);
  }, [moveMetricColumn]);

  const moveTransposeProduct = useCallback((fromId: string, toId: string) => {
    const fromIndex = productOrder.indexOf(fromId);
    const toIndex = productOrder.indexOf(toId);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    moveTransposeColPercents(fromIndex, toIndex);
    setProductOrder(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, [productOrder, moveTransposeColPercents]);

  const resetColumns = useCallback(() => {
    setColumnOrder(isUtilOnly ? [...UTIL_ONLY_PRODUCT_COLUMNS] : ['name', 'goodMade', 'goodShipped', 'started', 'scrap', 'scrappedInAssembly', 'usedInAssembly', 'timeWaitingEquipment', 'timeWaitingLabor', 'timeSetup', 'timeRun', 'timeWaitingRestOfLot', 'outOfAreaTime', 'wip', 'mct']);
    productCols.resetWidths();
    syncProductOrderFromSorted();
    setTransposeColPercents(defaultTransposeColPercents);
  }, [productCols, isUtilOnly, syncProductOrderFromSorted, defaultTransposeColPercents]);

  const toggleTransposed = useCallback(() => {
    setTransposed(prev => {
      if (!prev) syncProductOrderFromSorted();
      return !prev;
    });
  }, [syncProductOrderFromSorted]);
  const minWidthByKey = useMemo<Record<string, number>>(() => {
    const label = (colKey: ProductTableColKey) => productColumnLabel(colKey, isUtilOnly);
    const numericMin = 52;
    const numericMax = 160;
    return {
      name: estimateColMinWidthPx(label('name'), productRows.map((r: any) => r.name), 96, 260),
      goodMade: estimateColMinWidthPx(label('goodMade'), productRows.map((r: any) => fmtFixed(r.goodMade, 2)), numericMin, numericMax),
      goodShipped: estimateColMinWidthPx(label('goodShipped'), productRows.map((r: any) => fmtFixed(r.goodShipped, 2)), numericMin, numericMax),
      started: estimateColMinWidthPx(label('started'), productRows.map((r: any) => fmtFixed(r.started, 2)), numericMin, numericMax),
      scrap: estimateColMinWidthPx(label('scrap'), productRows.map((r: any) => fmtFixed(r.scrap, 2)), numericMin, numericMax),
      scrappedInAssembly: estimateColMinWidthPx(label('scrappedInAssembly'), productRows.map((r: any) => fmtFixed(r.scrappedInAssembly, 2)), numericMin, numericMax),
      usedInAssembly: estimateColMinWidthPx(label('usedInAssembly'), productRows.map((r: any) => fmtFixed(r.usedInAssembly, 2)), numericMin, numericMax),
      timeWaitingEquipment: estimateColMinWidthPx(label('timeWaitingEquipment'), productRows.map((r: any) => fmtFixed(r.timeWaitingEquipment, 2)), numericMin, numericMax),
      timeWaitingLabor: estimateColMinWidthPx(label('timeWaitingLabor'), productRows.map((r: any) => fmtFixed(r.timeWaitingLabor, 2)), numericMin, numericMax),
      timeSetup: estimateColMinWidthPx(label('timeSetup'), productRows.map((r: any) => fmtFixed(r.timeSetup, 2)), numericMin, numericMax),
      timeRun: estimateColMinWidthPx(label('timeRun'), productRows.map((r: any) => fmtFixed(r.timeRun, 2)), numericMin, numericMax),
      timeWaitingRestOfLot: estimateColMinWidthPx(label('timeWaitingRestOfLot'), productRows.map((r: any) => fmtFixed(r.timeWaitingRestOfLot, 2)), numericMin, numericMax),
      outOfAreaTime: estimateColMinWidthPx(label('outOfAreaTime'), productRows.map((r: any) => fmtFixed(r.outOfAreaTime, 2)), numericMin, numericMax),
      wip: estimateColMinWidthPx(label('wip'), productRows.map((r: any) => fmtFixed(r.wip, 3)), numericMin, numericMax),
      mct: estimateColMinWidthPx(label('mct'), productRows.map((r: any) => fmtFixed(r.mct, 3)), numericMin, numericMax),
    };
  }, [productRows, isUtilOnly]);
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Product Results Table</CardTitle>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant={transposed ? 'secondary' : 'outline'}
              size="sm"
              className="text-xs h-7 gap-1 px-2.5"
              onClick={toggleTransposed}
            >
              <ArrowLeftRight className="h-3 w-3" />
              {transposed ? 'Normal View' : 'Transpose'}
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1 px-2.5" onClick={resetColumns}>
              <RotateCcw className="h-3 w-3" />
              Reset Columns
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent ref={productCols.containerRef} className={`p-0 ${PRODUCT_TABLE_SCROLL_CLASS}`}>
        {transposed ? (
          <TransposedProductResults
            products={orderedProducts}
            columnOrder={columnOrder}
            displayScenarioResults={displayScenarioResults}
            isUtilOnly={isUtilOnly}
            colPercents={transposeColPercents.length > 0 ? transposeColPercents : defaultTransposeColPercents}
            onResizeProductColumn={startTransposeProductResize}
            onMoveMetric={moveMetricColumn}
            onMoveProduct={moveTransposeProduct}
          />
        ) : (
          <Table className="table-auto w-max max-w-full">
            <colgroup>
              {columnOrder.map((colKey, i) => (
                <col
                  key={colKey}
                  style={{
                    width: `${productCols.widths[i]}%`,
                    minWidth: `${minWidthByKey[colKey] ?? 52}px`,
                  }}
                />
              ))}
            </colgroup>
            <TableHeader><TableRow>
              {columnOrder.map((colKey, index) => (
                <SortHead
                  key={colKey}
                  label={productColumnLabel(colKey, isUtilOnly)}
                  sortKey={colKey}
                  current={sort}
                  onSort={handleSort}
                  align={colKey === 'name' ? 'left' : 'right'}
                  compact={colKey !== 'name'}
                  stickyHeader
                  stickyTopLeft={colKey === 'name'}
                  className={`${PRODUCT_TABLE_COLUMN_HEAD} ${colKey !== 'name' ? PRODUCT_TABLE_NUMERIC_HEAD : ''}`}
                  onResizeStart={index < columnOrder.length - 1 ? (ev => productCols.startResize(index, ev)) : undefined}
                  draggable
                  onDragStart={() => { dragFromRef.current = colKey; }}
                  onDragOver={ev => ev.preventDefault()}
                  onDrop={() => {
                    if (dragFromRef.current) moveProductColumn(dragFromRef.current, colKey);
                    dragFromRef.current = null;
                  }}
                  onDragEnd={() => { dragFromRef.current = null; }}
                />
              ))}
              {hasScenarios && displayScenarioResults.map(sr => (
                <React.Fragment key={sr.id}>
                  <TableHead className={`font-mono text-xs text-right whitespace-nowrap !px-2 ${PRODUCT_TABLE_COLUMN_HEAD} ${PRODUCT_TABLE_NUMERIC_HEAD} ${PRODUCT_TABLE_STICKY_TOP}`}>{sr.scenario.name} WIP</TableHead>
                  <TableHead className={`font-mono text-xs text-right whitespace-nowrap !px-2 ${PRODUCT_TABLE_COLUMN_HEAD} ${PRODUCT_TABLE_NUMERIC_HEAD} ${PRODUCT_TABLE_STICKY_TOP}`}>{sr.scenario.name} MCT</TableHead>
                </React.Fragment>
              ))}
            </TableRow></TableHeader>
            <TableBody>
              {sorted.map((row: any) => (
                <TableRow key={row.id}>
                  {columnOrder.map(colKey => {
                    if (colKey === 'name') return <TableCell key={colKey} className="px-2 font-mono font-medium text-left whitespace-nowrap sticky left-0 z-10 bg-background shadow-[2px_0_4px_-2px_hsl(var(--border))]">{row.name}</TableCell>;
                    return (
                      <TableCell
                        key={colKey}
                        className={`!px-2 font-mono text-right whitespace-nowrap tabular-nums ${PRODUCT_TABLE_NUMERIC_CELL} ${colKey === 'mct' ? 'font-medium' : ''}`}
                      >
                        {formatProductMetricValue(row, colKey, isUtilOnly)}
                      </TableCell>
                    );
                  })}
                  {hasScenarios && displayScenarioResults.map(sr => {
                    const sp = sr.results.products.find((p: any) => p.id === row.id);
                    return (
                      <React.Fragment key={sr.id}>
                        <TableCell className={`!px-2 font-mono text-right text-xs whitespace-nowrap tabular-nums ${PRODUCT_TABLE_NUMERIC_CELL}`}>{sp ? fmtFixed(isUtilOnly ? 0 : sp.wip, 3) : '—'}</TableCell>
                        <TableCell className={`!px-2 font-mono text-right text-xs whitespace-nowrap tabular-nums ${PRODUCT_TABLE_NUMERIC_CELL} ${!isUtilOnly && sp && sp.mct < row.mct ? 'text-success' : !isUtilOnly && sp && sp.mct > row.mct ? 'text-destructive' : ''}`}>
                          {sp ? fmtFixed(isUtilOnly ? 0 : sp.mct, 3) : '—'}
                        </TableCell>
                      </React.Fragment>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Product Oper Details (for Products tab sub-tab) ─── */
function ProductOperDetails({ model, results }: { model: Model; results: CalcResults }) {
  const [selectedId, setSelectedId] = useState('');
  const [showTimeUnits, setShowTimeUnits] = useState(false);

  const g = model.general;
  const conv1 = Math.max(g.conv1, 0.001);
  const conv2 = Math.max(g.conv2, 0.001);
  const opsPerPeriod = conv1 * conv2;

  const allMetrics = useMemo(() => {
    return (results.operations || []).map((opr: any) => {
      const productId = String(opr?.product_id ?? '');
      const opNumber = asNum(opr?.op_number);
      const opName = String(opr?.op_name ?? opr?.operation ?? '');
      const op = model.operations.find((mo: any) =>
        String(mo.product_id) === productId &&
        ((opNumber > 0 && asNum(mo.op_number) === opNumber) || String(mo.op_name) === opName)
      );
      if (!op) return null;
      const eq = model.equipment.find(e => e.id === op.equip_id);
      const prod = model.products.find(p => p.id === op.product_id);
      const er = eq ? results.equipment.find(e => e.id === eq.id) : null;
      const lab = eq ? model.labor.find(l => l.id === eq.labor_group_id) : null;
      if (!prod || !eq) return null;

      const eqSetupTime = asNum(opr?.ueset);
      const eqRunTime = asNum(opr?.uerun);
      const labSetupTime = asNum(opr?.ulset);
      const labRunTime = asNum(opr?.ulrun);
      const eqSetupUtil = eqSetupTime;
      const eqRunUtil = eqRunTime;
      const labSetupUtil = labSetupTime;
      const labRunUtil = labRunTime;
      const timeWaitingEquipment = asNum(opr?.w_equip);
      const timeWaitingLabor = asNum(opr?.w_labor);
      const timeInSetup = asNum(opr?.w_setup);
      const timeInRun = asNum(opr?.w_run);
      const timeWaitingRestOfLot = asNum(opr?.w_lot);
      const visitsPer100 = asNum(opr?.visits_per_100 ?? asNum(opr?.visit_prob) * 100);
      const visitsPerGoodPiece = asNum(opr?.visits_per_good ?? opr?.vpergood);
      const noOfSetups = asNum(opr?.n_setups);
      const avgLotSize = asNum(opr?.avg_lot_size);
      const wipShare = asNum(opr?.qpoper);
      const mctAtOp = asNum(opr?.flowtime);
      return {
        opId: op.id, opName: op.op_name, opNumber: op.op_number,
        productName: prod.name, productId: prod.id,
        equipName: eq.name, equipId: eq.id,
        laborName: lab?.name || '—', laborId: lab?.id || '',
        pctAssigned: op.pct_assigned,
        eqSetupUtil: eqSetupUtil,
        eqRunUtil: eqRunUtil,
        eqSetupTime: eqSetupTime,
        eqRunTime: eqRunTime,
        waitLaborUtil: er?.waitLaborUtil || 0,
        labSetupUtil: labSetupUtil,
        labRunUtil: labRunUtil,
        labSetupTime: labSetupTime,
        labRunTime: labRunTime,
        timeWaitingEquipment: timeWaitingEquipment,
        timeWaitingLabor: timeWaitingLabor,
        timeInSetup: timeInSetup,
        timeInRun: timeInRun,
        timeWaitingRestOfLot: timeWaitingRestOfLot,
        visitsPer100: visitsPer100,
        visitsPerGoodPiece: visitsPerGoodPiece,
        noOfSetups: noOfSetups,
        avgLotSize: avgLotSize,
        wip: wipShare,
        mctAtOp: mctAtOp,
      };
    }).filter(Boolean) as any[];
  }, [model, results, conv1, opsPerPeriod]);

  const minFactor = (asNum(g.conv1) * asNum(g.conv2)) / 100;
  const fmtVal = (pct: number) => fmtFixed(showTimeUnits ? pct * minFactor : pct, 2);
  const unitSuffix = showTimeUnits ? ` (${g.ops_time_unit})` : ' %';

  const prodOps = useMemo(() => allMetrics.filter((m: any) => m.productId === selectedId), [allMetrics, selectedId]);
  const prodSort = useSortableTable(prodOps, 'opNumber', 'asc');
  const productOperCols = useResizableColumns([6, 8, 8, 8, 5, 5, 5, 5, 5, 6, 6, 5, 5, 6, 5, 6, 5, 5, 3, 4], 5);
  const [columnOrder, setColumnOrder] = useState<Array<'opNumber' | 'opName' | 'equipName' | 'laborName' | 'pctAssigned' | 'eqSetupUtil' | 'eqRunUtil' | 'labSetupUtil' | 'labRunUtil' | 'timeWaitingEquipment' | 'timeWaitingLabor' | 'timeInSetup' | 'timeInRun' | 'timeWaitingRestOfLot' | 'visitsPer100' | 'visitsPerGoodPiece' | 'noOfSetups' | 'avgLotSize' | 'wip' | 'mctAtOp'>>(
    ['opNumber', 'opName', 'equipName', 'laborName', 'pctAssigned', 'eqSetupUtil', 'eqRunUtil', 'labSetupUtil', 'labRunUtil', 'timeWaitingEquipment', 'timeWaitingLabor', 'timeInSetup', 'timeInRun', 'timeWaitingRestOfLot', 'visitsPer100', 'visitsPerGoodPiece', 'noOfSetups', 'avgLotSize', 'wip', 'mctAtOp'],
  );
  const dragFromRef = useRef<string | null>(null);
  const moveColumn = useCallback((fromKey: string, toKey: string) => {
    const fromIndex = columnOrder.indexOf(fromKey as any);
    const toIndex = columnOrder.indexOf(toKey as any);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    setColumnOrder(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next as any;
    });
    productOperCols.moveColumn(fromIndex, toIndex);
  }, [columnOrder, productOperCols]);
  const resetColumns = useCallback(() => {
    setColumnOrder(['opNumber', 'opName', 'equipName', 'laborName', 'pctAssigned', 'eqSetupUtil', 'eqRunUtil', 'labSetupUtil', 'labRunUtil', 'timeWaitingEquipment', 'timeWaitingLabor', 'timeInSetup', 'timeInRun', 'timeWaitingRestOfLot', 'visitsPer100', 'visitsPerGoodPiece', 'noOfSetups', 'avgLotSize', 'wip', 'mctAtOp']);
    productOperCols.resetWidths();
  }, [productOperCols]);
  const minWidthByKey = useMemo<Record<string, number>>(() => ({
    opNumber: estimateColMinWidthPx('OP No', prodOps.map((m: any) => fmtFixed(m.opNumber, 2))),
    opName: estimateColMinWidthPx('Operation', prodOps.map((m: any) => m.opName)),
    equipName: estimateColMinWidthPx('Equipment', prodOps.map((m: any) => m.equipName)),
    laborName: estimateColMinWidthPx('Labor', prodOps.map((m: any) => m.laborName)),
    pctAssigned: estimateColMinWidthPx('% Assign', prodOps.map((m: any) => fmtFixed(m.pctAssigned, 2))),
    eqSetupUtil: estimateColMinWidthPx(`Eq Setup${unitSuffix}`, prodOps.map((m: any) => fmtVal(m.eqSetupUtil))),
    eqRunUtil: estimateColMinWidthPx(`Eq Run${unitSuffix}`, prodOps.map((m: any) => fmtVal(m.eqRunUtil))),
    labSetupUtil: estimateColMinWidthPx(`Lab Setup${unitSuffix}`, prodOps.map((m: any) => fmtVal(m.labSetupUtil))),
    labRunUtil: estimateColMinWidthPx(`Lab Run${unitSuffix}`, prodOps.map((m: any) => fmtVal(m.labRunUtil))),
    timeWaitingEquipment: estimateColMinWidthPx('Time Waiting for Equip', prodOps.map((m: any) => fmtFixed(m.timeWaitingEquipment, 2)), 90, 190),
    timeWaitingLabor: estimateColMinWidthPx('Time Waiting for Labor', prodOps.map((m: any) => fmtFixed(m.timeWaitingLabor, 2)), 90, 190),
    timeInSetup: estimateColMinWidthPx('Time in setup', prodOps.map((m: any) => fmtFixed(m.timeInSetup, 2))),
    timeInRun: estimateColMinWidthPx('Time in run', prodOps.map((m: any) => fmtFixed(m.timeInRun, 2))),
    timeWaitingRestOfLot: estimateColMinWidthPx('Time Waiting for Rest of Lot', prodOps.map((m: any) => fmtFixed(m.timeWaitingRestOfLot, 2)), 90, 190),
    visitsPer100: estimateColMinWidthPx('Visits per 100', prodOps.map((m: any) => fmtFixed(m.visitsPer100, 2))),
    visitsPerGoodPiece: estimateColMinWidthPx('Visits for 1 Good Piece', prodOps.map((m: any) => fmtFixed(m.visitsPerGoodPiece, 2)), 90, 180),
    noOfSetups: estimateColMinWidthPx('no. of setups', prodOps.map((m: any) => fmtFixed(m.noOfSetups, 2))),
    avgLotSize: estimateColMinWidthPx('Avg lot size', prodOps.map((m: any) => fmtFixed(m.avgLotSize, 2))),
    wip: estimateColMinWidthPx('WIP', prodOps.map((m: any) => fmtFixed(m.wip, 2))),
    mctAtOp: estimateColMinWidthPx('MCT at Op', prodOps.map((m: any) => fmtFixed(m.mctAtOp, 2))),
  }), [prodOps, unitSuffix, fmtVal]);

  const prod = model.products.find((p: any) => p.id === selectedId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Oper Details — By Product</CardTitle>
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={resetColumns}>
            <RotateCcw className="h-3 w-3" />
            Reset Columns
          </Button>
        </div>
      </CardHeader>
      <CardContent ref={productOperCols.containerRef}>
        <div className="flex items-center gap-3 mb-4">
          <Select value={selectedId || undefined} onValueChange={setSelectedId}>
            <SelectTrigger className="w-56 h-8 text-xs"><SelectValue placeholder="Select product…" /></SelectTrigger>
            <SelectContent>
              {model.products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant={showTimeUnits ? 'secondary' : 'outline'} size="sm" className="text-xs gap-1 h-7" onClick={() => setShowTimeUnits(!showTimeUnits)}>
            <Clock className="h-3 w-3" />
            {showTimeUnits ? `Time (${g.ops_time_unit})` : '% Time'}
          </Button>
        </div>
        {!prod ? (
          <p className="text-sm text-muted-foreground text-center py-8">Select a product to view operation details.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="table-auto">
              <colgroup>
                {columnOrder.map((colKey, i) => (
                  <col key={colKey} style={{ width: `${productOperCols.widths[i]}%`, minWidth: `${minWidthByKey[colKey] ?? 90}px` }} />
                ))}
              </colgroup>
              <TableHeader><TableRow>
                {columnOrder.map((colKey, index) => (
                  <SortHead
                    key={colKey}
                    label={colKey === 'opNumber' ? 'OP No' : colKey === 'opName' ? 'Operation' : colKey === 'equipName' ? 'Equipment' : colKey === 'laborName' ? 'Labor' : colKey === 'pctAssigned' ? '% Assign' : colKey === 'eqSetupUtil' ? `Eq Setup${unitSuffix}` : colKey === 'eqRunUtil' ? `Eq Run${unitSuffix}` : colKey === 'labSetupUtil' ? `Lab Setup${unitSuffix}` : colKey === 'labRunUtil' ? `Lab Run${unitSuffix}` : colKey === 'timeWaitingEquipment' ? 'Time Waiting for Equip' : colKey === 'timeWaitingLabor' ? 'Time Waiting for Labor' : colKey === 'timeInSetup' ? 'Time in Setup' : colKey === 'timeInRun' ? 'Time in Run' : colKey === 'timeWaitingRestOfLot' ? 'Time Waiting for Rest of Lot' : colKey === 'visitsPer100' ? 'Visits per 100' : colKey === 'visitsPerGoodPiece' ? 'Visits for 1 Good Piece' : colKey === 'noOfSetups' ? 'No. of Setups' : colKey === 'avgLotSize' ? 'Avg Lot Size' : colKey === 'wip' ? 'WIP' : 'MCT at Op'}
                    sortKey={colKey}
                    current={prodSort.sort}
                    onSort={prodSort.handleSort}
                    align={colKey === 'opName' || colKey === 'equipName' || colKey === 'laborName' ? 'left' : 'right'}
                    onResizeStart={index < columnOrder.length - 1 ? (ev => productOperCols.startResize(index, ev)) : undefined}
                    draggable
                    onDragStart={() => { dragFromRef.current = colKey; }}
                    onDragOver={ev => ev.preventDefault()}
                    onDrop={() => {
                      if (dragFromRef.current) moveColumn(dragFromRef.current, colKey);
                      dragFromRef.current = null;
                    }}
                    onDragEnd={() => { dragFromRef.current = null; }}
                  />
                ))}
              </TableRow></TableHeader>
              <TableBody>
                {prodSort.sorted.map((m: any) => (
                  <TableRow key={m.opId}>
                    {columnOrder.map(colKey => {
                      if (colKey === 'opNumber') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.opNumber, 2)}</TableCell>;
                      if (colKey === 'opName') return <TableCell key={colKey} className="font-mono text-xs font-medium text-left whitespace-nowrap">{m.opName}</TableCell>;
                      if (colKey === 'equipName') return <TableCell key={colKey} className="font-mono text-xs text-left whitespace-nowrap">{m.equipName}</TableCell>;
                      if (colKey === 'laborName') return <TableCell key={colKey} className="font-mono text-xs text-left whitespace-nowrap">{m.laborName}</TableCell>;
                      if (colKey === 'pctAssigned') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.pctAssigned, 2)}</TableCell>;
                      if (colKey === 'eqSetupUtil') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtVal(m.eqSetupUtil)}</TableCell>;
                      if (colKey === 'eqRunUtil') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtVal(m.eqRunUtil)}</TableCell>;
                      if (colKey === 'labSetupUtil') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtVal(m.labSetupUtil)}</TableCell>;
                      if (colKey === 'labRunUtil') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtVal(m.labRunUtil)}</TableCell>;
                      if (colKey === 'timeWaitingEquipment') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.timeWaitingEquipment, 2)}</TableCell>;
                      if (colKey === 'timeWaitingLabor') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.timeWaitingLabor, 2)}</TableCell>;
                      if (colKey === 'timeInSetup') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.timeInSetup, 2)}</TableCell>;
                      if (colKey === 'timeInRun') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.timeInRun, 2)}</TableCell>;
                      if (colKey === 'timeWaitingRestOfLot') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.timeWaitingRestOfLot, 2)}</TableCell>;
                      if (colKey === 'visitsPer100') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.visitsPer100, 2)}</TableCell>;
                      if (colKey === 'visitsPerGoodPiece') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.visitsPerGoodPiece, 2)}</TableCell>;
                      if (colKey === 'noOfSetups') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.noOfSetups, 2)}</TableCell>;
                      if (colKey === 'avgLotSize') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.avgLotSize, 2)}</TableCell>;
                      if (colKey === 'wip') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.wip, 2)}</TableCell>;
                      return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.mctAtOp, 2)}</TableCell>;
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Shared sub-components ─── */

function NoResultsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <BarChart3 className="h-10 w-10 text-foreground/70 mb-3" />
      <p className="text-base font-medium text-foreground mb-1">No results yet</p>
      <p className="text-sm text-muted-foreground">Run Full Calculate to see results.</p>
    </div>
  );
}

function QuickStatCard({ label, value, metric }: { label: string; value: string; metric: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-5 min-w-0 overflow-hidden">
      <p className="text-lg lg:text-xl font-bold text-foreground leading-tight truncate" title={value}>{value}</p>
      {metric && <p className="text-sm font-mono text-muted-foreground mt-0.5 truncate" title={metric}>{metric}</p>}
      <p className="text-xs text-muted-foreground mt-1.5 truncate" title={label}>{label}</p>
    </div>
  );
}

/* ─── Summary sub-components ─── */

function NormalSummary({ results, model, scenarioResults, isUtilOnly = false }: {
  results: CalcResults; model: any;
  scenarioResults: { id: string; scenario: any; results: CalcResults }[];
  isUtilOnly?: boolean;
}) {
  const hasScenarios = scenarioResults.length > 0;
  const showWip = (wip: number) => fmtFixed(isUtilOnly ? 0 : wip, 2);
  const showMct = (mct: number) => fmtFixed(isUtilOnly ? 0 : mct, 2);

  // Group products by dept_code for subtotals
  const groups = useMemo(() => {
    const map = new Map<string, ProductResult[]>();
    results.products.forEach(pr => {
      const prod = model.products.find((p: any) => p.id === pr.id);
      const group = prod?.dept_code || '';
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(pr);
    });
    return map;
  }, [results, model]);
  const hasGroups = [...groups.keys()].some(k => k !== '');

  const renderProductRow = (row: ProductResult) => (
    <TableRow key={row.id}>
      <TableCell className="font-mono font-medium">{row.name}</TableCell>
      <TableCell className="font-mono text-right">{fmtFixed(row.goodMade, 2)}</TableCell>
      <TableCell className="font-mono text-right">{fmtFixed(row.goodShipped, 2)}</TableCell>
      <TableCell className="font-mono text-right">{fmtFixed(row.started, 2)}</TableCell>
      <TableCell className="font-mono text-right">{fmtFixed(row.scrap, 2)}</TableCell>
      <TableCell className="font-mono text-right">{showWip(row.wip)}</TableCell>
      <TableCell className="font-mono text-right font-medium">{showMct(row.mct)}</TableCell>
      {hasScenarios && scenarioResults.map(sr => {
        const sp = sr.results.products.find(p => p.id === row.id);
        const baseMct = isUtilOnly ? 0 : row.mct;
        return (
          <React.Fragment key={sr.id}>
            <TableCell className="font-mono text-right text-xs">{sp ? showWip(sp.wip) : '—'}</TableCell>
            <TableCell className={`font-mono text-right text-xs ${!isUtilOnly && sp && sp.mct < baseMct ? 'text-success' : !isUtilOnly && sp && sp.mct > baseMct ? 'text-destructive' : ''}`}>
              {sp ? showMct(sp.mct) : '—'}
              {!isUtilOnly && sp && sp.mct !== baseMct && <span className="ml-1 text-[10px]">({(sp.mct - baseMct) > 0 ? '+' : ''}{fmtFixed(sp.mct - baseMct, 2)})</span>}
            </TableCell>
          </React.Fragment>
        );
      })}
    </TableRow>
  );

  const renderSubtotal = (label: string, products: ProductResult[]) => (
    <TableRow key={`sub-${label}`} className="bg-[#EAEFEF] font-medium">
      <TableCell className="font-mono text-xs">{label} subtotal</TableCell>
      <TableCell className="font-mono text-right text-xs">{fmtFixed(products.reduce((s, r) => s + r.goodMade, 0), 2)}</TableCell>
      <TableCell className="font-mono text-right text-xs">{fmtFixed(products.reduce((s, r) => s + r.goodShipped, 0), 2)}</TableCell>
      <TableCell className="font-mono text-right text-xs">{fmtFixed(products.reduce((s, r) => s + r.started, 0), 2)}</TableCell>
      <TableCell className="font-mono text-right text-xs">{fmtFixed(products.reduce((s, r) => s + r.scrap, 0), 2)}</TableCell>
      <TableCell className="font-mono text-right text-xs">{isUtilOnly ? '0.00' : fmtFixed(products.reduce((s, r) => s + r.wip, 0), 2)}</TableCell>
      <TableCell className="font-mono text-right text-xs">{isUtilOnly ? '0.00' : `${fmtFixed(Math.min(...products.map(p => p.mct)), 2)}–${fmtFixed(Math.max(...products.map(p => p.mct)), 2)}`}</TableCell>
      {hasScenarios && scenarioResults.map(sr => <React.Fragment key={sr.id}><TableCell /><TableCell /></React.Fragment>)}
    </TableRow>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-mono text-xs">Product</TableHead>
          <TableHead className="font-mono text-xs text-right">Good Made</TableHead>
          <TableHead className="font-mono text-xs text-right">Good Shipped</TableHead>
          <TableHead className="font-mono text-xs text-right">Started</TableHead>
          <TableHead className="font-mono text-xs text-right">Scrap</TableHead>
          <TableHead className="font-mono text-xs text-right">WIP</TableHead>
          <TableHead className="font-mono text-xs text-right">MCT ({model.general.mct_time_unit})</TableHead>
          {hasScenarios && scenarioResults.map(sr => (
            <React.Fragment key={sr.id}>
              <TableHead className="font-mono text-xs text-right text-primary">WIP {sr.scenario.name}</TableHead>
              <TableHead className="font-mono text-xs text-right text-primary">MCT {sr.scenario.name}</TableHead>
            </React.Fragment>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {hasGroups ? (
          [...groups.entries()].map(([group, products]) => (
            <React.Fragment key={`grp-${group}`}>{products.map(renderProductRow)}{group && renderSubtotal(group, products)}</React.Fragment>
          ))
        ) : (
          results.products.map(renderProductRow)
        )}
        <TableRow className="border-t-2 font-medium">
          <TableCell className="font-mono">TOTAL</TableCell>
          <TableCell className="font-mono text-right">{fmtFixed(results.products.reduce((s, r) => s + r.goodMade, 0), 2)}</TableCell>
          <TableCell className="font-mono text-right">{fmtFixed(results.products.reduce((s, r) => s + r.goodShipped, 0), 2)}</TableCell>
          <TableCell className="font-mono text-right">{fmtFixed(results.products.reduce((s, r) => s + r.started, 0), 2)}</TableCell>
          <TableCell className="font-mono text-right">{fmtFixed(results.products.reduce((s, r) => s + r.scrap, 0), 2)}</TableCell>
          <TableCell className="font-mono text-right">{isUtilOnly ? '0.00' : fmtFixed(results.products.reduce((s, r) => s + r.wip, 0), 2)}</TableCell>
          <TableCell className="font-mono text-right">{isUtilOnly ? '0.00' : '—'}</TableCell>
          {hasScenarios && scenarioResults.map(sr => <React.Fragment key={sr.id}><TableCell /><TableCell /></React.Fragment>)}
        </TableRow>
      </TableBody>
    </Table>
  );
}

function TransposedSummary({ results, model, scenarioResults, isUtilOnly = false }: {
  results: CalcResults; model: any;
  scenarioResults: { id: string; scenario: any; results: CalcResults }[];
  isUtilOnly?: boolean;
}) {
  const fields = [
    { key: 'demand', label: 'Demand', fmt: (v: number) => fmtFixed(v, 2) },
    { key: 'lotSize', label: 'Lot Size', fmt: (v: number) => fmtFixed(v, 2) },
    { key: 'goodMade', label: 'Good Made', fmt: (v: number) => fmtFixed(v, 2) },
    { key: 'started', label: 'Started', fmt: (v: number) => fmtFixed(v, 2) },
    { key: 'scrap', label: 'Scrap', fmt: (v: number) => fmtFixed(v, 2) },
    { key: 'wip', label: 'WIP', fmt: (v: number) => fmtFixed(isUtilOnly ? 0 : v, 2) },
    { key: 'mct', label: `MCT (${model.general.mct_time_unit})`, fmt: (v: number) => fmtFixed(isUtilOnly ? 0 : v, 2) },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-mono text-xs">Metric</TableHead>
          {results.products.map(p => (
            <TableHead key={p.id} className="font-mono text-xs text-right">{p.name}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map(f => (
          <TableRow key={f.key}>
            <TableCell className="font-mono font-medium text-xs">{f.label}</TableCell>
            {results.products.map(p => (
              <TableCell key={p.id} className="font-mono text-right text-xs">
                {f.fmt((p as any)[f.key])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/* Old IBOM sub-components removed — now in src/components/IBOMOutput.tsx */

/* ─── Equipment WIP Chart ─── */
function EquipmentWIPChart({ results, model, isMultiScenario, chartScenarios }: {
  results: CalcResults; model: Model; isMultiScenario: boolean; chartScenarios: ScenarioEntry[];
}) {
  const [showTable, setShowTable] = useState(false);

  // Use backend-calculated equipment WIP (process / queue / total)
  const wipData = useMemo(() => {
    return results.equipment
      .map(er => {
        const anyEr: any = er as any;
        const inProcess = asNum(anyEr.wip_process ?? anyEr.wipProcess ?? 0);
        const waiting = asNum(anyEr.wip_queue ?? anyEr.wipQueue ?? 0);
        const total = asNum(anyEr.wip_total ?? anyEr.wipTotal ?? inProcess + waiting);
        return {
          name: er.name,
          inProcess: Math.round(inProcess * 10) / 10,
          waiting: Math.round(waiting * 10) / 10,
          total: Math.round(total * 10) / 10,
        };
      })
      .filter(e => e.inProcess > 0 || e.waiting > 0);
  }, [results]);

  if (wipData.length === 0) return (
    <Card><CardContent className="py-12 text-center"><BarChart3 className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" /><p className="text-sm text-muted-foreground">Run the model to see Equipment WIP results.</p></CardContent></Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Equipment WIP</CardTitle>
        <CardDescription>Work-in-progress at each equipment group</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <ChartScenarioLabel />
        {showTable ? (
          <Table>
            <TableHeader><TableRow>
              <TableHead className="font-mono text-xs">Equipment</TableHead>
              <TableHead className="font-mono text-xs text-right">In-Process</TableHead>
              <TableHead className="font-mono text-xs text-right">Waiting</TableHead>
              <TableHead className="font-mono text-xs text-right">Total WIP</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {wipData.map(e => (
                <TableRow key={e.name}>
                  <TableCell className="font-mono font-medium">{e.name}</TableCell>
                  <TableCell className="font-mono text-right">{e.inProcess}</TableCell>
                  <TableCell className="font-mono text-right">{e.waiting}</TableCell>
                  <TableCell className="font-mono text-right font-medium">{e.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wipData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={axisStyle} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: 'WIP (units)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
              <Tooltip content={<RechartsTooltipWithTotal />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="inProcess" fill="hsl(270, 50%, 60%)" name="In Process" />
              <Bar dataKey="waiting" fill="hsl(38, 92%, 50%)" name="Waiting" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Labor Equipment Wait Chart ─── */
function LaborWaitChart({ results, model }: { results: CalcResults; model: Model }) {
  const [showTable, setShowTable] = useState(false);

  const waitData = useMemo(() => {
    // Backend now provides the final values; frontend only renders.
    return (results?.labor ?? []).map(lr => ({
      name: lr.name,
      tended: lr.machinesTended ?? 0,
      waiting: lr.machinesWaiting ?? 0,
      waitLaborUtil: lr.avgWaitLaborUtil ?? 0,
      idle: lr.idle ?? 0,
    })).filter(d => d.tended > 0 || d.waiting > 0);
  }, [results]);

  if (waitData.length === 0) return (
    <Card><CardContent className="py-12 text-center"><BarChart3 className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" /><p className="text-sm text-muted-foreground">Run the model to see Equipment Wait results.</p></CardContent></Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Equipment Wait Chart</CardTitle>
        <CardDescription>High 'Waiting' bars indicate a labor shortage — machines are idle waiting for operators.</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <ChartScenarioLabel />
        {showTable ? (
          <Table>
            <TableHeader><TableRow>
              <TableHead className="font-mono text-xs">Labor Group</TableHead>
              <TableHead className="font-mono text-xs text-right">Avg Machines Tended</TableHead>
              <TableHead className="font-mono text-xs text-right">Avg Machines Waiting</TableHead>
              <TableHead className="font-mono text-xs text-right">Wait Labor %</TableHead>
              <TableHead className="font-mono text-xs text-right">Idle %</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {waitData.map(d => (
                <TableRow key={d.name}>
                  <TableCell className="font-mono font-medium">{d.name}</TableCell>
                  <TableCell className="font-mono text-right">{d.tended}</TableCell>
                  <TableCell className="font-mono text-right">{d.waiting}</TableCell>
                  <TableCell className="font-mono text-right">{Math.round(d.waitLaborUtil * 10) / 10}</TableCell>
                  <TableCell className="font-mono text-right text-muted-foreground">{d.idle}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={waitData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={axisStyle} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: 'Machines', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
              <Tooltip content={<RechartsTooltipWithTotal />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="tended" fill="hsl(142, 71%, 45%)" name="Avg Machines Tended" />
              <Bar dataKey="waiting" fill="hsl(0, 72%, 51%)" name="Avg Machines Waiting" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Oper Details Tab ─── */
function OperDetailsTab({ model, results }: { model: Model; results: CalcResults }) {
  const [subTab, setSubTab] = useState<'equipment' | 'labor' | 'product'>('equipment');
  const [selectedId, setSelectedId] = useState('');
  const [showTimeUnits, setShowTimeUnits] = useState(false);

  const g = model.general;
  const conv1 = Math.max(g.conv1, 0.001);
  const conv2 = Math.max(g.conv2, 0.001);
  const opsPerPeriod = conv1 * conv2;

  // Compute per-operation metrics
  const allMetrics = useMemo(() => {
    return model.operations.map(op => {
      const eq = model.equipment.find(e => e.id === op.equip_id);
      const prod = model.products.find(p => p.id === op.product_id);
      const pr = results.products.find(p => p.id === op.product_id);
      const er = eq ? results.equipment.find(e => e.id === eq.id) : null;
      const lab = eq ? model.labor.find(l => l.id === eq.labor_group_id) : null;
      if (!prod || !eq) return null;
      const demand = pr?.demand ?? prod.demand ?? 0;
      const lotSize = Math.max(1, prod.lot_size * prod.lot_factor);
      const tbatchSize = prod.tbatch_size === -1 ? lotSize : Math.max(1, prod.tbatch_size);
      const numTbatches = Math.ceil(lotSize / tbatchSize);
      const assignFrac = op.pct_assigned / 100;
      const numLots = demand > 0 ? (demand / lotSize) * assignFrac : 0;
      const prodSetupFactor = prod.setup_factor || 1;
      const eqSetupTimeCalc = numLots * (op.equip_setup_lot + op.equip_setup_piece * lotSize + op.equip_setup_tbatch * numTbatches) * eq.setup_factor * prodSetupFactor;
      const eqRunTimeCalc = numLots * (op.equip_run_piece * lotSize + op.equip_run_lot + op.equip_run_tbatch * numTbatches) * eq.run_factor;
      const eqCount = eq.count > 0 ? eq.count : 1;
      const eqAvail = eqCount * (1 + eq.overtime_pct / 100) * (1 - (eq.unavail_pct || 0) / 100) * opsPerPeriod;
      let repairFrac = 0;
      if (eq.mttf > 0 && eq.mttr > 0) repairFrac = eq.mttr / (eq.mttf + eq.mttr);
      const eqEffAvail = eqAvail * (1 - repairFrac);
      const eqSetupUtilCalc = eqEffAvail > 0 ? (eqSetupTimeCalc / eqEffAvail) * 100 : 0;
      const eqRunUtilCalc = eqEffAvail > 0 ? (eqRunTimeCalc / eqEffAvail) * 100 : 0;
      const labSetupTimeCalc = lab ? numLots * (op.labor_setup_lot + op.labor_setup_piece * lotSize + op.labor_setup_tbatch * numTbatches) * lab.setup_factor * prodSetupFactor : 0;
      const labRunTimeCalc = lab ? numLots * (op.labor_run_piece * lotSize + op.labor_run_lot + op.labor_run_tbatch * numTbatches) * lab.run_factor : 0;
      const labAvail = lab ? lab.count * (1 + lab.overtime_pct / 100) * (1 - lab.unavail_pct / 100) * opsPerPeriod : 0;
      const labSetupUtilCalc = labAvail > 0 ? (labSetupTimeCalc / labAvail) * 100 : 0;
      const labRunUtilCalc = labAvail > 0 ? (labRunTimeCalc / labAvail) * 100 : 0;
      const opr = opResultFor(results, op) as any;
      const eqSetupTime = asNum(opr?.ueset) || eqSetupTimeCalc;
      const eqRunTime = asNum(opr?.uerun) || eqRunTimeCalc;
      const labSetupTime = asNum(opr?.ulset) || labSetupTimeCalc;
      const labRunTime = asNum(opr?.ulrun) || labRunTimeCalc;
      const eqSetupUtil = asNum(opr?.ueset) || Math.round(eqSetupUtilCalc * 10) / 10;
      const eqRunUtil = asNum(opr?.uerun) || Math.round(eqRunUtilCalc * 10) / 10;
      const labSetupUtil = asNum(opr?.ulset) || Math.round(labSetupUtilCalc * 10) / 10;
      const labRunUtil = asNum(opr?.ulrun) || Math.round(labRunUtilCalc * 10) / 10;
      const timeWaitingEquipment = asNum(opr?.w_equip);
      const timeWaitingLabor = asNum(opr?.w_labor);
      const timeInSetup = asNum(opr?.w_setup);
      const timeInRun = asNum(opr?.w_run);
      const timeWaitingRestOfLot = asNum(opr?.w_lot);
      const visitsPerGoodPiece = asNum(opr?.visits_per_good ?? opr?.vpergood);
      const noOfSetups = asNum(opr?.n_setups);
      const avgLotSize = asNum(opr?.avg_lot_size);
      const allOpsForProd = model.operations.filter(o => o.product_id === op.product_id);
      const wipShare = asNum(opr?.qpoper) || ((pr?.wip ?? 0) / Math.max(1, allOpsForProd.length));
      const perPieceSetup = numLots > 0 ? (eqSetupTime / numLots) / lotSize : 0;
      const perPieceRun = numLots > 0 ? (eqRunTime / numLots) / lotSize : 0;
      const mctAtOp = asNum(opr?.flowtime) || (timeWaitingEquipment + timeWaitingLabor + timeInSetup + timeInRun + timeWaitingRestOfLot) || (((perPieceSetup + perPieceRun) / conv1) * assignFrac);
      const visits = asNum(opr?.visits_per_100 ?? asNum(opr?.visit_prob) * 100) || (demand > 0 ? (numLots * lotSize / demand) * 100 : 100);
      return {
        opId: op.id, opName: op.op_name, opNumber: op.op_number,
        productName: prod.name, productId: prod.id,
        equipName: eq.name, equipId: eq.id,
        laborName: lab?.name || '—', laborId: lab?.id || '',
        pctAssigned: op.pct_assigned,
        eqSetupUtil: eqSetupUtil,
        eqRunUtil: eqRunUtil,
        eqSetupTime: Math.round(eqSetupTime * 1000) / 1000,
        eqRunTime: Math.round(eqRunTime * 1000) / 1000,
        waitLaborUtil: er?.waitLaborUtil || 0,
        repairUtil: er?.repairUtil || 0,
        labSetupUtil: labSetupUtil,
        labRunUtil: labRunUtil,
        labSetupTime: Math.round(labSetupTime * 1000) / 1000,
        labRunTime: Math.round(labRunTime * 1000) / 1000,
        timeWaitingEquipment: timeWaitingEquipment,
        timeWaitingLabor: timeWaitingLabor,
        timeInSetup: timeInSetup,
        timeInRun: timeInRun,
        timeWaitingRestOfLot: timeWaitingRestOfLot,
        visitsPerGoodPiece: visitsPerGoodPiece,
        noOfSetups: noOfSetups,
        avgLotSize: avgLotSize,
        wip: Math.round(wipShare * 10) / 10,
        mctAtOp: mctAtOp,
        visits: Math.round(visits * 10) / 10,
      };
    }).filter(Boolean) as any[];
  }, [model, results, conv1, opsPerPeriod]);

  const minFactor = (asNum(g.conv1) * asNum(g.conv2)) / 100;
  const fmtVal = (pct: number) => fmtFixed(showTimeUnits ? pct * minFactor : pct, 2);
  const unitSuffix = showTimeUnits ? ` (${g.ops_time_unit})` : ' %';

  // Sort hooks must be called before render functions that use them
  const eqOps = useMemo(() => allMetrics.filter((m: any) => m.equipId === selectedId), [allMetrics, selectedId]);
  const labOps = useMemo(() => allMetrics.filter((m: any) => m.laborId === selectedId), [allMetrics, selectedId]);
  const prodOps = useMemo(() => allMetrics.filter((m: any) => m.productId === selectedId), [allMetrics, selectedId]);
  const eqSort = useSortableTable(eqOps, 'opNumber', 'asc');
  const labSort = useSortableTable(labOps, 'opNumber', 'asc');
  const prodSort = useSortableTable(prodOps, 'opNumber', 'asc');

  const renderByEquipment = () => {
    const eq = model.equipment.find(e => e.id === selectedId);
    if (!eq) return <p className="text-sm text-muted-foreground text-center py-8">Select an equipment group to view operation details.</p>;
    return (
      <div className="overflow-x-auto">
      <Table>
        <TableHeader><TableRow>
          <SortHead label="Product" sortKey="productName" current={eqSort.sort} onSort={eqSort.handleSort} align="left" />
          <SortHead label="Operation" sortKey="opName" current={eqSort.sort} onSort={eqSort.handleSort} align="left" />
          <SortHead label="Op #" sortKey="opNumber" current={eqSort.sort} onSort={eqSort.handleSort} />
          <SortHead label="% Assign" sortKey="pctAssigned" current={eqSort.sort} onSort={eqSort.handleSort} />
          <SortHead label={`Eq Setup${unitSuffix}`} sortKey="eqSetupUtil" current={eqSort.sort} onSort={eqSort.handleSort} />
          <SortHead label={`Eq Run${unitSuffix}`} sortKey="eqRunUtil" current={eqSort.sort} onSort={eqSort.handleSort} />
          <SortHead label={`Lab Setup${unitSuffix}`} sortKey="labSetupUtil" current={eqSort.sort} onSort={eqSort.handleSort} />
          <SortHead label={`Lab Run${unitSuffix}`} sortKey="labRunUtil" current={eqSort.sort} onSort={eqSort.handleSort} />
          <SortHead label="Time Waiting for Equip" sortKey="timeWaitingEquipment" current={eqSort.sort} onSort={eqSort.handleSort} />
          <SortHead label="Time Waiting for Labor" sortKey="timeWaitingLabor" current={eqSort.sort} onSort={eqSort.handleSort} />
          <SortHead label="Time in setup" sortKey="timeInSetup" current={eqSort.sort} onSort={eqSort.handleSort} />
          <SortHead label="Time in run" sortKey="timeInRun" current={eqSort.sort} onSort={eqSort.handleSort} />
          <SortHead label="Time Waiting for Rest of Lot" sortKey="timeWaitingRestOfLot" current={eqSort.sort} onSort={eqSort.handleSort} />
          <SortHead label="Visits for 1 Good Piece" sortKey="visitsPerGoodPiece" current={eqSort.sort} onSort={eqSort.handleSort} />
          <SortHead label="no. of setups" sortKey="noOfSetups" current={eqSort.sort} onSort={eqSort.handleSort} />
          <SortHead label="Avg lot size" sortKey="avgLotSize" current={eqSort.sort} onSort={eqSort.handleSort} />
          <SortHead label="WIP" sortKey="wip" current={eqSort.sort} onSort={eqSort.handleSort} />
          <SortHead label="MCT at Op" sortKey="mctAtOp" current={eqSort.sort} onSort={eqSort.handleSort} />
          <SortHead label="Visits/100" sortKey="visits" current={eqSort.sort} onSort={eqSort.handleSort} />
        </TableRow></TableHeader>
        <TableBody>
          {eqSort.sorted.map((m: any) => (
            <TableRow key={m.opId}>
              <TableCell className="font-mono text-xs">{m.productName}</TableCell>
              <TableCell className="font-mono text-xs font-medium">{m.opName}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.opNumber, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.pctAssigned, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtVal(m.eqSetupUtil)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtVal(m.eqRunUtil)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtVal(m.labSetupUtil)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtVal(m.labRunUtil)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.timeWaitingEquipment, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.timeWaitingLabor, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.timeInSetup, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.timeInRun, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.timeWaitingRestOfLot, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.visitsPerGoodPiece, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.noOfSetups, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.avgLotSize, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.wip, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.mctAtOp, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.visits, 2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    );
  };

  const renderByLabor = () => {
    const lab = model.labor.find(l => l.id === selectedId);
    if (!lab) return <p className="text-sm text-muted-foreground text-center py-8">Select a labor group to view operation details.</p>;
    return (
      <Table>
        <TableHeader><TableRow>
          <SortHead label="Product" sortKey="productName" current={labSort.sort} onSort={labSort.handleSort} align="left" />
          <SortHead label="Operation" sortKey="opName" current={labSort.sort} onSort={labSort.handleSort} align="left" />
          <SortHead label="Equipment" sortKey="equipName" current={labSort.sort} onSort={labSort.handleSort} align="left" />
          <SortHead label="Op #" sortKey="opNumber" current={labSort.sort} onSort={labSort.handleSort} />
          <SortHead label="% Assign" sortKey="pctAssigned" current={labSort.sort} onSort={labSort.handleSort} />
          <SortHead label={`Eq Setup${unitSuffix}`} sortKey="eqSetupUtil" current={labSort.sort} onSort={labSort.handleSort} />
          <SortHead label={`Eq Run${unitSuffix}`} sortKey="eqRunUtil" current={labSort.sort} onSort={labSort.handleSort} />
          <SortHead label={`Lab Setup${unitSuffix}`} sortKey="labSetupUtil" current={labSort.sort} onSort={labSort.handleSort} />
          <SortHead label={`Lab Run${unitSuffix}`} sortKey="labRunUtil" current={labSort.sort} onSort={labSort.handleSort} />
          <SortHead label="Time Waiting for Equip" sortKey="timeWaitingEquipment" current={labSort.sort} onSort={labSort.handleSort} />
          <SortHead label="Time Waiting for Labor" sortKey="timeWaitingLabor" current={labSort.sort} onSort={labSort.handleSort} />
          <SortHead label="Time in setup" sortKey="timeInSetup" current={labSort.sort} onSort={labSort.handleSort} />
          <SortHead label="Time in run" sortKey="timeInRun" current={labSort.sort} onSort={labSort.handleSort} />
          <SortHead label="Time Waiting for Rest of Lot" sortKey="timeWaitingRestOfLot" current={labSort.sort} onSort={labSort.handleSort} />
          <SortHead label="Visits for 1 Good Piece" sortKey="visitsPerGoodPiece" current={labSort.sort} onSort={labSort.handleSort} />
          <SortHead label="Visits/100 Made" sortKey="visits" current={labSort.sort} onSort={labSort.handleSort} />
          <SortHead label="no. of setups" sortKey="noOfSetups" current={labSort.sort} onSort={labSort.handleSort} />
          <SortHead label="Avg lot size" sortKey="avgLotSize" current={labSort.sort} onSort={labSort.handleSort} />
          <SortHead label="WIP" sortKey="wip" current={labSort.sort} onSort={labSort.handleSort} />
          <SortHead label="MCT at Op" sortKey="mctAtOp" current={labSort.sort} onSort={labSort.handleSort} />
        </TableRow></TableHeader>
        <TableBody>
          {labSort.sorted.map((m: any) => {
            return (
              <TableRow key={m.opId}>
                <TableCell className="font-mono text-xs">{m.productName}</TableCell>
                <TableCell className="font-mono text-xs font-medium">{m.opName}</TableCell>
                <TableCell className="font-mono text-xs">{m.equipName}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtFixed(m.opNumber, 2)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtFixed(m.pctAssigned, 2)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtVal(m.eqSetupUtil)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtVal(m.eqRunUtil)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtVal(m.labSetupUtil)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtVal(m.labRunUtil)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtFixed(m.timeWaitingEquipment, 2)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtFixed(m.timeWaitingLabor, 2)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtFixed(m.timeInSetup, 2)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtFixed(m.timeInRun, 2)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtFixed(m.timeWaitingRestOfLot, 2)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtFixed(m.visitsPerGoodPiece, 2)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtFixed(m.visits, 2)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtFixed(m.noOfSetups, 2)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtFixed(m.avgLotSize, 2)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtFixed(m.wip, 2)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtFixed(m.mctAtOp, 2)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const renderByProduct = () => {
    const prod = model.products.find(p => p.id === selectedId);
    if (!prod) return <p className="text-sm text-muted-foreground text-center py-8">Select a product to view operation details.</p>;
    return (
      <Table>
        <TableHeader><TableRow>
          <SortHead label="Operation" sortKey="opName" current={prodSort.sort} onSort={prodSort.handleSort} align="left" />
          <SortHead label="Equipment" sortKey="equipName" current={prodSort.sort} onSort={prodSort.handleSort} align="left" />
          <SortHead label="Labor" sortKey="laborName" current={prodSort.sort} onSort={prodSort.handleSort} align="left" />
          <SortHead label="% Assign" sortKey="pctAssigned" current={prodSort.sort} onSort={prodSort.handleSort} />
          <SortHead label={`Eq Setup${unitSuffix}`} sortKey="eqSetupUtil" current={prodSort.sort} onSort={prodSort.handleSort} />
          <SortHead label={`Eq Run${unitSuffix}`} sortKey="eqRunUtil" current={prodSort.sort} onSort={prodSort.handleSort} />
          <SortHead label={`Lab Setup${unitSuffix}`} sortKey="labSetupUtil" current={prodSort.sort} onSort={prodSort.handleSort} />
          <SortHead label={`Lab Run${unitSuffix}`} sortKey="labRunUtil" current={prodSort.sort} onSort={prodSort.handleSort} />
          <SortHead label="Time Waiting for Equip" sortKey="timeWaitingEquipment" current={prodSort.sort} onSort={prodSort.handleSort} />
          <SortHead label="Time Waiting for Labor" sortKey="timeWaitingLabor" current={prodSort.sort} onSort={prodSort.handleSort} />
          <SortHead label="Time in setup" sortKey="timeInSetup" current={prodSort.sort} onSort={prodSort.handleSort} />
          <SortHead label="Time in run" sortKey="timeInRun" current={prodSort.sort} onSort={prodSort.handleSort} />
          <SortHead label="Time Waiting for Rest of Lot" sortKey="timeWaitingRestOfLot" current={prodSort.sort} onSort={prodSort.handleSort} />
          <SortHead label="Visits for 1 Good Piece" sortKey="visitsPerGoodPiece" current={prodSort.sort} onSort={prodSort.handleSort} />
          <SortHead label="no. of setups" sortKey="noOfSetups" current={prodSort.sort} onSort={prodSort.handleSort} />
          <SortHead label="Avg lot size" sortKey="avgLotSize" current={prodSort.sort} onSort={prodSort.handleSort} />
          <SortHead label="WIP" sortKey="wip" current={prodSort.sort} onSort={prodSort.handleSort} />
          <SortHead label="MCT at Op" sortKey="mctAtOp" current={prodSort.sort} onSort={prodSort.handleSort} />
        </TableRow></TableHeader>
        <TableBody>
          {prodSort.sorted.map((m: any) => (
            <TableRow key={m.opId}>
              <TableCell className="font-mono text-xs font-medium">{m.opName}</TableCell>
              <TableCell className="font-mono text-xs">{m.equipName}</TableCell>
              <TableCell className="font-mono text-xs">{m.laborName}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.pctAssigned, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtVal(m.eqSetupUtil)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtVal(m.eqRunUtil)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtVal(m.labSetupUtil)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtVal(m.labRunUtil)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.timeWaitingEquipment, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.timeWaitingLabor, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.timeInSetup, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.timeInRun, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.timeWaitingRestOfLot, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.visitsPerGoodPiece, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.noOfSetups, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.avgLotSize, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.wip, 2)}</TableCell>
              <TableCell className="font-mono text-xs text-right">{fmtFixed(m.mctAtOp, 2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Oper Details</CardTitle>
        <CardDescription>Per-operation breakdown by resource or product</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={subTab} onValueChange={(v) => { setSubTab(v as any); setSelectedId(''); eqSort.reset(); labSort.reset(); prodSort.reset(); }}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="h-8">
              <TabsTrigger value="equipment" className="text-xs h-6">By Equipment</TabsTrigger>
              <TabsTrigger value="labor" className="text-xs h-6">By Labor</TabsTrigger>
              <TabsTrigger value="product" className="text-xs h-6">By Product</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-3">
              <Button
                variant={showTimeUnits ? 'secondary' : 'outline'}
                size="sm"
                className="text-xs gap-1 h-7"
                onClick={() => setShowTimeUnits(!showTimeUnits)}
              >
                <Clock className="h-3 w-3" />
                {showTimeUnits ? `Time (${g.ops_time_unit})` : '% Time'}
              </Button>
              <Select value={selectedId || undefined} onValueChange={setSelectedId}>
                <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder={`Select ${subTab}...`} /></SelectTrigger>
                <SelectContent>
                  {subTab === 'equipment' && model.equipment.map(eq => <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>)}
                  {subTab === 'labor' && model.labor.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                  {subTab === 'product' && model.products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <TabsContent value="equipment" className="p-0 overflow-x-auto">{renderByEquipment()}</TabsContent>
          <TabsContent value="labor" className="p-0 overflow-x-auto">{renderByLabor()}</TabsContent>
          <TabsContent value="product" className="p-0 overflow-x-auto">{renderByProduct()}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function useRunDescriptionLabel(): string {
  const selectedRunScenarioId = useResultsStore((s) => s.selectedRunScenarioId);
  const scenarios = useScenarioStore((s) => s.scenarios);
  return useMemo(() => {
    if (!selectedRunScenarioId || selectedRunScenarioId === 'basecase') return 'Basecase';
    return scenarios.find((s) => s.id === selectedRunScenarioId)?.name ?? 'Basecase';
  }, [selectedRunScenarioId, scenarios]);
}

/* ─── Equipment Oper Details (for Equipment tab sub-tab) ─── */
function EquipOperDetails({ model, results }: { model: Model; results: CalcResults }) {
  const [selectedId, setSelectedId] = useState('');
  const [showTimeUnits, setShowTimeUnits] = useState(false);
  const runDescription = useRunDescriptionLabel();

  const g = model.general;
  const conv1 = Math.max(g.conv1, 0.001);
  const conv2 = Math.max(g.conv2, 0.001);
  const opsPerPeriod = conv1 * conv2;

  const allMetrics = useMemo(() => {
    return model.operations.map(op => {
      const eq = model.equipment.find(e => e.id === op.equip_id);
      const prod = model.products.find(p => p.id === op.product_id);
      const pr = results.products.find(p => p.id === op.product_id);
      const er = eq ? results.equipment.find(e => e.id === eq.id) : null;
      const lab = eq ? model.labor.find(l => l.id === eq.labor_group_id) : null;
      if (!prod || !eq) return null;
      const demand = pr?.demand ?? prod.demand ?? 0;
      const lotSize = Math.max(1, prod.lot_size * prod.lot_factor);
      const tbatchSize = prod.tbatch_size === -1 ? lotSize : Math.max(1, prod.tbatch_size);
      const numTbatches = Math.ceil(lotSize / tbatchSize);
      const assignFrac = op.pct_assigned / 100;
      const numLots = demand > 0 ? (demand / lotSize) * assignFrac : 0;
      const prodSetupFactor = prod.setup_factor || 1;
      const eqSetupTimeCalc = numLots * (op.equip_setup_lot + op.equip_setup_piece * lotSize + op.equip_setup_tbatch * numTbatches) * eq.setup_factor * prodSetupFactor;
      const eqRunTimeCalc = numLots * (op.equip_run_piece * lotSize + op.equip_run_lot + op.equip_run_tbatch * numTbatches) * eq.run_factor;
      const eqCount = eq.count > 0 ? eq.count : 1;
      const eqAvail = eqCount * (1 + eq.overtime_pct / 100) * (1 - (eq.unavail_pct || 0) / 100) * opsPerPeriod;
      let repairFrac = 0;
      if (eq.mttf > 0 && eq.mttr > 0) repairFrac = eq.mttr / (eq.mttf + eq.mttr);
      const eqEffAvail = eqAvail * (1 - repairFrac);
      const eqSetupUtilCalc = eqEffAvail > 0 ? (eqSetupTimeCalc / eqEffAvail) * 100 : 0;
      const eqRunUtilCalc = eqEffAvail > 0 ? (eqRunTimeCalc / eqEffAvail) * 100 : 0;
      const labSetupTimeCalc = lab ? numLots * (op.labor_setup_lot + op.labor_setup_piece * lotSize + op.labor_setup_tbatch * numTbatches) * lab.setup_factor * prodSetupFactor : 0;
      const labRunTimeCalc = lab ? numLots * (op.labor_run_piece * lotSize + op.labor_run_lot + op.labor_run_tbatch * numTbatches) * lab.run_factor : 0;
      const labAvail = lab ? lab.count * (1 + lab.overtime_pct / 100) * (1 - lab.unavail_pct / 100) * opsPerPeriod : 0;
      const labSetupUtilCalc = labAvail > 0 ? (labSetupTimeCalc / labAvail) * 100 : 0;
      const labRunUtilCalc = labAvail > 0 ? (labRunTimeCalc / labAvail) * 100 : 0;
      const opr = opResultFor(results, op) as any;
      const eqSetupTime = asNum(opr?.ueset) || eqSetupTimeCalc;
      const eqRunTime = asNum(opr?.uerun) || eqRunTimeCalc;
      const labSetupTime = asNum(opr?.ulset) || labSetupTimeCalc;
      const labRunTime = asNum(opr?.ulrun) || labRunTimeCalc;
      const eqSetupUtil = asNum(opr?.ueset) || Math.round(eqSetupUtilCalc * 10) / 10;
      const eqRunUtil = asNum(opr?.uerun) || Math.round(eqRunUtilCalc * 10) / 10;
      const labSetupUtil = asNum(opr?.ulset) || Math.round(labSetupUtilCalc * 10) / 10;
      const labRunUtil = asNum(opr?.ulrun) || Math.round(labRunUtilCalc * 10) / 10;
      const timeWaitingEquipment = asNum(opr?.w_equip);
      const timeWaitingLabor = asNum(opr?.w_labor);
      const timeInSetup = asNum(opr?.w_setup);
      const timeInRun = asNum(opr?.w_run);
      const timeWaitingRestOfLot = asNum(opr?.w_lot);
      const visitsPerGoodPiece = asNum(opr?.visits_per_good ?? opr?.vpergood);
      const noOfSetups = asNum(opr?.n_setups);
      const avgLotSize = asNum(opr?.avg_lot_size);
      const allOpsForProd = model.operations.filter(o => o.product_id === op.product_id);
      const wipShare = asNum(opr?.qpoper) || ((pr?.wip ?? 0) / Math.max(1, allOpsForProd.length));
      const perPieceSetup = numLots > 0 ? (eqSetupTime / numLots) / lotSize : 0;
      const perPieceRun = numLots > 0 ? (eqRunTime / numLots) / lotSize : 0;
      const mctAtOp = asNum(opr?.flowtime) || (timeWaitingEquipment + timeWaitingLabor + timeInSetup + timeInRun + timeWaitingRestOfLot) || (((perPieceSetup + perPieceRun) / conv1) * assignFrac);
      const visits = asNum(opr?.visits_per_100 ?? asNum(opr?.visit_prob) * 100) || (demand > 0 ? (numLots * lotSize / demand) * 100 : 100);
      return {
        opId: op.id, opName: op.op_name, opNumber: op.op_number,
        productName: prod.name, productId: prod.id,
        equipName: eq.name, equipId: eq.id,
        laborName: lab?.name || '—', laborId: lab?.id || '',
        pctAssigned: op.pct_assigned,
        eqSetupUtil: eqSetupUtil,
        eqRunUtil: eqRunUtil,
        eqSetupTime: Math.round(eqSetupTime * 1000) / 1000,
        eqRunTime: Math.round(eqRunTime * 1000) / 1000,
        waitLaborUtil: er?.waitLaborUtil || 0,
        repairUtil: er?.repairUtil || 0,
        labSetupUtil: labSetupUtil,
        labRunUtil: labRunUtil,
        labSetupTime: Math.round(labSetupTime * 1000) / 1000,
        labRunTime: Math.round(labRunTime * 1000) / 1000,
        timeWaitingEquipment: timeWaitingEquipment,
        timeWaitingLabor: timeWaitingLabor,
        timeInSetup: timeInSetup,
        timeInRun: timeInRun,
        timeWaitingRestOfLot: timeWaitingRestOfLot,
        visitsPerGoodPiece: visitsPerGoodPiece,
        noOfSetups: noOfSetups,
        avgLotSize: avgLotSize,
        wip: Math.round(wipShare * 10) / 10,
        mctAtOp: mctAtOp,
        visits: Math.round(visits * 10) / 10,
      };
    }).filter(Boolean) as any[];
  }, [model, results, conv1, opsPerPeriod]);

  const minFactor = (asNum(g.conv1) * asNum(g.conv2)) / 100;
  const fmtVal = (pct: number) => fmtFixed(showTimeUnits ? pct * minFactor : pct, 2);
  const unitSuffix = showTimeUnits ? ` (${g.ops_time_unit})` : ' %';

  const eqOps = useMemo(() => allMetrics.filter((m: any) => m.equipId === selectedId), [allMetrics, selectedId]);
  const eqSort = useSortableTable(eqOps, 'opNumber', 'asc');
  const equipOperCols = useResizableColumns([8, 8, 8, 4, 5, 5, 5, 5, 5, 6, 6, 5, 5, 6, 6, 4, 5, 3, 4, 5], 5);
  const [columnOrder, setColumnOrder] = useState<Array<'productName' | 'opName' | 'laborName' | 'opNumber' | 'pctAssigned' | 'eqSetupUtil' | 'eqRunUtil' | 'labSetupUtil' | 'labRunUtil' | 'timeWaitingEquipment' | 'timeWaitingLabor' | 'timeInSetup' | 'timeInRun' | 'timeWaitingRestOfLot' | 'visitsPerGoodPiece' | 'noOfSetups' | 'avgLotSize' | 'wip' | 'mctAtOp' | 'visits'>>(
    ['productName', 'opName', 'laborName', 'opNumber', 'pctAssigned', 'eqSetupUtil', 'eqRunUtil', 'labSetupUtil', 'labRunUtil', 'timeWaitingEquipment', 'timeWaitingLabor', 'timeInSetup', 'timeInRun', 'timeWaitingRestOfLot', 'visitsPerGoodPiece', 'noOfSetups', 'avgLotSize', 'wip', 'mctAtOp', 'visits'],
  );
  const dragFromRef = useRef<string | null>(null);
  const moveColumn = useCallback((fromKey: string, toKey: string) => {
    const fromIndex = columnOrder.indexOf(fromKey as any);
    const toIndex = columnOrder.indexOf(toKey as any);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    setColumnOrder(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next as any;
    });
    equipOperCols.moveColumn(fromIndex, toIndex);
  }, [columnOrder, equipOperCols]);
  const resetColumns = useCallback(() => {
    setColumnOrder(['productName', 'opName', 'laborName', 'opNumber', 'pctAssigned', 'eqSetupUtil', 'eqRunUtil', 'labSetupUtil', 'labRunUtil', 'timeWaitingEquipment', 'timeWaitingLabor', 'timeInSetup', 'timeInRun', 'timeWaitingRestOfLot', 'visitsPerGoodPiece', 'noOfSetups', 'avgLotSize', 'wip', 'mctAtOp', 'visits']);
    equipOperCols.resetWidths();
  }, [equipOperCols]);
  const minWidthByKey = useMemo<Record<string, number>>(() => ({
    productName: estimateColMinWidthPx('Product', eqOps.map((m: any) => m.productName)),
    opName: estimateColMinWidthPx('Operation', eqOps.map((m: any) => m.opName)),
    laborName: estimateColMinWidthPx('Labor Name', eqOps.map((m: any) => m.laborName)),
    opNumber: estimateColMinWidthPx('Op #', eqOps.map((m: any) => fmtFixed(m.opNumber, 2))),
    pctAssigned: estimateColMinWidthPx('% Assign', eqOps.map((m: any) => fmtFixed(m.pctAssigned, 2))),
    eqSetupUtil: estimateColMinWidthPx(`Eq Setup${unitSuffix}`, eqOps.map((m: any) => fmtVal(m.eqSetupUtil))),
    eqRunUtil: estimateColMinWidthPx(`Eq Run${unitSuffix}`, eqOps.map((m: any) => fmtVal(m.eqRunUtil))),
    labSetupUtil: estimateColMinWidthPx(`Lab Setup${unitSuffix}`, eqOps.map((m: any) => fmtVal(m.labSetupUtil))),
    labRunUtil: estimateColMinWidthPx(`Lab Run${unitSuffix}`, eqOps.map((m: any) => fmtVal(m.labRunUtil))),
    timeWaitingEquipment: estimateColMinWidthPx('Time Waiting for Equip', eqOps.map((m: any) => fmtFixed(m.timeWaitingEquipment, 2)), 90, 190),
    timeWaitingLabor: estimateColMinWidthPx('Time Waiting for Labor', eqOps.map((m: any) => fmtFixed(m.timeWaitingLabor, 2)), 90, 190),
    timeInSetup: estimateColMinWidthPx('Time in setup', eqOps.map((m: any) => fmtFixed(m.timeInSetup, 2))),
    timeInRun: estimateColMinWidthPx('Time in run', eqOps.map((m: any) => fmtFixed(m.timeInRun, 2))),
    timeWaitingRestOfLot: estimateColMinWidthPx('Time Waiting for Rest of Lot', eqOps.map((m: any) => fmtFixed(m.timeWaitingRestOfLot, 2)), 90, 190),
    visitsPerGoodPiece: estimateColMinWidthPx('Visits for 1 Good Piece', eqOps.map((m: any) => fmtFixed(m.visitsPerGoodPiece, 2)), 90, 180),
    noOfSetups: estimateColMinWidthPx('no. of setups', eqOps.map((m: any) => fmtFixed(m.noOfSetups, 2))),
    avgLotSize: estimateColMinWidthPx('Avg lot size', eqOps.map((m: any) => fmtFixed(m.avgLotSize, 2))),
    wip: estimateColMinWidthPx('WIP', eqOps.map((m: any) => fmtFixed(m.wip, 2))),
    mctAtOp: estimateColMinWidthPx('MCT at Op', eqOps.map((m: any) => fmtFixed(m.mctAtOp, 2))),
    visits: estimateColMinWidthPx('Visits/100', eqOps.map((m: any) => fmtFixed(m.visits, 2))),
  }), [eqOps, unitSuffix, fmtVal]);

  const eq = model.equipment.find(e => e.id === selectedId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Oper Details — By Equipment</CardTitle>
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={resetColumns}>
            <RotateCcw className="h-3 w-3" />
            Reset Columns
          </Button>
        </div>
      </CardHeader>
      <CardContent ref={equipOperCols.containerRef}>
        <div className="flex items-center gap-3 mb-4">
          <Select value={selectedId || undefined} onValueChange={setSelectedId}>
            <SelectTrigger className="w-56 h-8 text-xs"><SelectValue placeholder="Select equipment group…" /></SelectTrigger>
            <SelectContent>
              {model.equipment.map(eq => <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant={showTimeUnits ? 'secondary' : 'outline'} size="sm" className="text-xs gap-1 h-7" onClick={() => setShowTimeUnits(!showTimeUnits)}>
            <Clock className="h-3 w-3" />
            {showTimeUnits ? `Time (${g.ops_time_unit})` : '% Time'}
          </Button>
        </div>
        {!eq ? (
          <p className="text-sm text-muted-foreground text-center py-8">Select an equipment group to view operation details.</p>
        ) : (
          <>
          <div className="overflow-x-auto">
            <Table className="table-auto">
              <colgroup>
                {columnOrder.map((colKey, i) => (
                  <col key={colKey} style={{ width: `${equipOperCols.widths[i]}%`, minWidth: `${minWidthByKey[colKey] ?? 90}px` }} />
                ))}
              </colgroup>
              <TableHeader><TableRow>
                {columnOrder.map((colKey, index) => (
                  <SortHead
                    key={colKey}
                    label={colKey === 'productName' ? 'Product' : colKey === 'opName' ? 'Operation' : colKey === 'laborName' ? 'Labor Name' : colKey === 'opNumber' ? 'Op #' : colKey === 'pctAssigned' ? '% Assign' : colKey === 'eqSetupUtil' ? `Eq Setup${unitSuffix}` : colKey === 'eqRunUtil' ? `Eq Run${unitSuffix}` : colKey === 'labSetupUtil' ? `Lab Setup${unitSuffix}` : colKey === 'labRunUtil' ? `Lab Run${unitSuffix}` : colKey === 'timeWaitingEquipment' ? 'Time Waiting for Equip' : colKey === 'timeWaitingLabor' ? 'Time Waiting for Labor' : colKey === 'timeInSetup' ? 'Time in Setup' : colKey === 'timeInRun' ? 'Time in Run' : colKey === 'timeWaitingRestOfLot' ? 'Time Waiting for Rest of Lot' : colKey === 'visitsPerGoodPiece' ? 'Visits for 1 Good Piece' : colKey === 'noOfSetups' ? 'No. of Setups' : colKey === 'avgLotSize' ? 'Avg Lot Size' : colKey === 'wip' ? 'WIP' : colKey === 'mctAtOp' ? 'MCT at Op' : 'Visits/100'}
                    sortKey={colKey}
                    current={eqSort.sort}
                    onSort={eqSort.handleSort}
                    align={colKey === 'productName' || colKey === 'opName' || colKey === 'laborName' ? 'left' : 'right'}
                    onResizeStart={index < columnOrder.length - 1 ? (ev => equipOperCols.startResize(index, ev)) : undefined}
                    draggable
                    onDragStart={() => { dragFromRef.current = colKey; }}
                    onDragOver={ev => ev.preventDefault()}
                    onDrop={() => {
                      if (dragFromRef.current) moveColumn(dragFromRef.current, colKey);
                      dragFromRef.current = null;
                    }}
                    onDragEnd={() => { dragFromRef.current = null; }}
                  />
                ))}
              </TableRow></TableHeader>
              <TableBody>
                {eqSort.sorted.map((m: any) => (
                  <TableRow key={m.opId}>
                    {columnOrder.map(colKey => {
                      if (colKey === 'productName') return <TableCell key={colKey} className="font-mono text-xs text-left whitespace-nowrap">{m.productName}</TableCell>;
                      if (colKey === 'opName') return <TableCell key={colKey} className="font-mono text-xs font-medium text-left whitespace-nowrap">{m.opName}</TableCell>;
                      if (colKey === 'laborName') return <TableCell key={colKey} className="font-mono text-xs text-left whitespace-nowrap">{m.laborName}</TableCell>;
                      if (colKey === 'opNumber') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.opNumber, 2)}</TableCell>;
                      if (colKey === 'pctAssigned') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.pctAssigned, 2)}</TableCell>;
                      if (colKey === 'eqSetupUtil') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtVal(m.eqSetupUtil)}</TableCell>;
                      if (colKey === 'eqRunUtil') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtVal(m.eqRunUtil)}</TableCell>;
                      if (colKey === 'labSetupUtil') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtVal(m.labSetupUtil)}</TableCell>;
                      if (colKey === 'labRunUtil') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtVal(m.labRunUtil)}</TableCell>;
                      if (colKey === 'timeWaitingEquipment') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.timeWaitingEquipment, 2)}</TableCell>;
                      if (colKey === 'timeWaitingLabor') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.timeWaitingLabor, 2)}</TableCell>;
                      if (colKey === 'timeInSetup') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.timeInSetup, 2)}</TableCell>;
                      if (colKey === 'timeInRun') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.timeInRun, 2)}</TableCell>;
                      if (colKey === 'timeWaitingRestOfLot') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.timeWaitingRestOfLot, 2)}</TableCell>;
                      if (colKey === 'visitsPerGoodPiece') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.visitsPerGoodPiece, 2)}</TableCell>;
                      if (colKey === 'noOfSetups') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.noOfSetups, 2)}</TableCell>;
                      if (colKey === 'avgLotSize') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.avgLotSize, 2)}</TableCell>;
                      if (colKey === 'wip') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.wip, 2)}</TableCell>;
                      if (colKey === 'mctAtOp') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.mctAtOp, 2)}</TableCell>;
                      return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.visits, 2)}</TableCell>;
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ProductGroupSummaryTable
            metrics={eqOps}
            model={model}
            description={runDescription}
            showTimeUnits={showTimeUnits}
            timeUnitLabel={g.ops_time_unit}
          />
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Labor Oper Details (for Labor tab sub-tab) ─── */
function LaborOperDetails({ model, results }: { model: Model; results: CalcResults }) {
  const [selectedId, setSelectedId] = useState('');
  const [showTimeUnits, setShowTimeUnits] = useState(false);
  const runDescription = useRunDescriptionLabel();

  const g = model.general;
  const conv1 = Math.max(g.conv1, 0.001);
  const conv2 = Math.max(g.conv2, 0.001);
  const opsPerPeriod = conv1 * conv2;

  const allMetrics = useMemo(() => {
    return model.operations.map(op => {
      const eq = model.equipment.find(e => e.id === op.equip_id);
      const prod = model.products.find(p => p.id === op.product_id);
      const pr = results.products.find(p => p.id === op.product_id);
      const er = eq ? results.equipment.find(e => e.id === eq.id) : null;
      const lab = eq ? model.labor.find(l => l.id === eq.labor_group_id) : null;
      if (!prod || !eq || !lab) return null;
      const demand = pr?.demand ?? prod.demand ?? 0;
      const lotSize = Math.max(1, prod.lot_size * prod.lot_factor);
      const tbatchSize = prod.tbatch_size === -1 ? lotSize : Math.max(1, prod.tbatch_size);
      const numTbatches = Math.ceil(lotSize / tbatchSize);
      const assignFrac = op.pct_assigned / 100;
      const numLots = demand > 0 ? (demand / lotSize) * assignFrac : 0;
      const prodSetupFactor = prod.setup_factor || 1;
      const eqSetupTimeCalc = numLots * (op.equip_setup_lot + op.equip_setup_piece * lotSize + op.equip_setup_tbatch * numTbatches) * eq.setup_factor * prodSetupFactor;
      const eqRunTimeCalc = numLots * (op.equip_run_piece * lotSize + op.equip_run_lot + op.equip_run_tbatch * numTbatches) * eq.run_factor;
      const eqEffAvail = eq.count * (1 + eq.overtime_pct / 100) * (1 - eq.unavail_pct / 100) * (1 - asNum((eq as any).repair_pct) / 100) * opsPerPeriod;
      const eqSetupUtilCalc = eqEffAvail > 0 ? (eqSetupTimeCalc / eqEffAvail) * 100 : 0;
      const eqRunUtilCalc = eqEffAvail > 0 ? (eqRunTimeCalc / eqEffAvail) * 100 : 0;
      const labSetupTimeCalc = numLots * (op.labor_setup_lot + op.labor_setup_piece * lotSize + op.labor_setup_tbatch * numTbatches) * lab.setup_factor * prodSetupFactor;
      const labRunTimeCalc = numLots * (op.labor_run_piece * lotSize + op.labor_run_lot + op.labor_run_tbatch * numTbatches) * lab.run_factor;
      const labAvail = lab.count * (1 + lab.overtime_pct / 100) * (1 - lab.unavail_pct / 100) * opsPerPeriod;
      const labSetupUtilCalc = labAvail > 0 ? (labSetupTimeCalc / labAvail) * 100 : 0;
      const labRunUtilCalc = labAvail > 0 ? (labRunTimeCalc / labAvail) * 100 : 0;
      const opr = opResultFor(results, op) as any;
      const eqSetupUtil = asNum(opr?.ueset) || Math.round(eqSetupUtilCalc * 10) / 10;
      const eqRunUtil = asNum(opr?.uerun) || Math.round(eqRunUtilCalc * 10) / 10;
      const labSetupTime = asNum(opr?.ulset) || labSetupTimeCalc;
      const labRunTime = asNum(opr?.ulrun) || labRunTimeCalc;
      const labSetupUtil = asNum(opr?.ulset) || Math.round(labSetupUtilCalc * 10) / 10;
      const labRunUtil = asNum(opr?.ulrun) || Math.round(labRunUtilCalc * 10) / 10;
      const timeWaitingEquipment = asNum(opr?.w_equip);
      const timeWaitingLabor = asNum(opr?.w_labor);
      const timeInSetup = asNum(opr?.w_setup);
      const timeInRun = asNum(opr?.w_run);
      const timeWaitingRestOfLot = asNum(opr?.w_lot);
      const visitsPerGoodPiece = asNum(opr?.visits_per_good ?? opr?.vpergood);
      const visits = asNum(opr?.visits_per_100 ?? asNum(opr?.visit_prob) * 100) || (demand > 0 ? (numLots * lotSize / demand) * 100 : 100);
      const noOfSetups = asNum(opr?.n_setups);
      const avgLotSize = asNum(opr?.avg_lot_size);
      const allOpsForProd = model.operations.filter(o => o.product_id === op.product_id);
      const wipShare = asNum(opr?.qpoper) || ((pr?.wip ?? 0) / Math.max(1, allOpsForProd.length));
      const perPieceSetup = numLots > 0 ? ((numLots * (op.equip_setup_lot + op.equip_setup_piece * lotSize + op.equip_setup_tbatch * numTbatches) * eq.setup_factor * prodSetupFactor) / numLots) / lotSize : 0;
      const perPieceRun = numLots > 0 ? ((numLots * (op.equip_run_piece * lotSize + op.equip_run_lot + op.equip_run_tbatch * numTbatches) * eq.run_factor) / numLots) / lotSize : 0;
      const mctAtOp = asNum(opr?.flowtime) || (timeWaitingEquipment + timeWaitingLabor + timeInSetup + timeInRun + timeWaitingRestOfLot) || (((perPieceSetup + perPieceRun) / conv1) * assignFrac);
      return {
        opId: op.id, opName: op.op_name, opNumber: op.op_number,
        productName: prod.name, productId: prod.id,
        equipName: eq.name, equipId: eq.id,
        laborName: lab.name, laborId: lab.id,
        pctAssigned: op.pct_assigned,
        eqSetupUtil: eqSetupUtil,
        eqRunUtil: eqRunUtil,
        labSetupUtil: labSetupUtil,
        labRunUtil: labRunUtil,
        labSetupTime: Math.round(labSetupTime * 1000) / 1000,
        labRunTime: Math.round(labRunTime * 1000) / 1000,
        timeWaitingEquipment: timeWaitingEquipment,
        timeWaitingLabor: timeWaitingLabor,
        timeInSetup: timeInSetup,
        timeInRun: timeInRun,
        timeWaitingRestOfLot: timeWaitingRestOfLot,
        visitsPerGoodPiece: visitsPerGoodPiece,
        visits: Math.round(visits * 10) / 10,
        noOfSetups: noOfSetups,
        avgLotSize: avgLotSize,
        wip: Math.round(wipShare * 10) / 10,
        mctAtOp: mctAtOp,
      };
    }).filter(Boolean) as any[];
  }, [model, results, conv1, opsPerPeriod]);

  const minFactor = (asNum(g.conv1) * asNum(g.conv2)) / 100;
  const fmtVal = (pct: number) => fmtFixed(showTimeUnits ? pct * minFactor : pct, 2);
  const unitSuffix = showTimeUnits ? ` (${g.ops_time_unit})` : ' %';

  const labOps = useMemo(() => allMetrics.filter((m: any) => m.laborId === selectedId), [allMetrics, selectedId]);
  const labSort = useSortableTable(labOps, 'opNumber', 'asc');
  const laborOperCols = useResizableColumns([8, 8, 8, 4, 5, 5, 5, 5, 6, 6, 5, 5, 6, 6, 5, 4, 5, 2, 5, 5], 5);
  const [columnOrder, setColumnOrder] = useState<Array<'productName' | 'opName' | 'equipName' | 'opNumber' | 'pctAssigned' | 'eqSetupUtil' | 'eqRunUtil' | 'labSetupUtil' | 'labRunUtil' | 'timeWaitingEquipment' | 'timeWaitingLabor' | 'timeInSetup' | 'timeInRun' | 'timeWaitingRestOfLot' | 'visitsPerGoodPiece' | 'visits' | 'noOfSetups' | 'avgLotSize' | 'wip' | 'mctAtOp'>>(
    ['productName', 'opName', 'equipName', 'opNumber', 'pctAssigned', 'eqSetupUtil', 'eqRunUtil', 'labSetupUtil', 'labRunUtil', 'timeWaitingEquipment', 'timeWaitingLabor', 'timeInSetup', 'timeInRun', 'timeWaitingRestOfLot', 'visitsPerGoodPiece', 'visits', 'noOfSetups', 'avgLotSize', 'wip', 'mctAtOp'],
  );
  const dragFromRef = useRef<string | null>(null);
  const moveColumn = useCallback((fromKey: string, toKey: string) => {
    const fromIndex = columnOrder.indexOf(fromKey as any);
    const toIndex = columnOrder.indexOf(toKey as any);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    setColumnOrder(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next as any;
    });
    laborOperCols.moveColumn(fromIndex, toIndex);
  }, [columnOrder, laborOperCols]);
  const resetColumns = useCallback(() => {
    setColumnOrder(['productName', 'opName', 'equipName', 'opNumber', 'pctAssigned', 'eqSetupUtil', 'eqRunUtil', 'labSetupUtil', 'labRunUtil', 'timeWaitingEquipment', 'timeWaitingLabor', 'timeInSetup', 'timeInRun', 'timeWaitingRestOfLot', 'visitsPerGoodPiece', 'visits', 'noOfSetups', 'avgLotSize', 'wip', 'mctAtOp']);
    laborOperCols.resetWidths();
  }, [laborOperCols]);
  const minWidthByKey = useMemo<Record<string, number>>(() => ({
    productName: estimateColMinWidthPx('Product', labOps.map((m: any) => m.productName)),
    opName: estimateColMinWidthPx('Operation', labOps.map((m: any) => m.opName)),
    equipName: estimateColMinWidthPx('Equipment', labOps.map((m: any) => m.equipName)),
    opNumber: estimateColMinWidthPx('Op #', labOps.map((m: any) => fmtFixed(m.opNumber, 2))),
    pctAssigned: estimateColMinWidthPx('% Assign', labOps.map((m: any) => fmtFixed(m.pctAssigned, 2))),
    eqSetupUtil: estimateColMinWidthPx(`Eq Setup${unitSuffix}`, labOps.map((m: any) => fmtVal(m.eqSetupUtil))),
    eqRunUtil: estimateColMinWidthPx(`Eq Run${unitSuffix}`, labOps.map((m: any) => fmtVal(m.eqRunUtil))),
    labSetupUtil: estimateColMinWidthPx(`Lab Setup${unitSuffix}`, labOps.map((m: any) => fmtVal(m.labSetupUtil))),
    labRunUtil: estimateColMinWidthPx(`Lab Run${unitSuffix}`, labOps.map((m: any) => fmtVal(m.labRunUtil))),
    timeWaitingEquipment: estimateColMinWidthPx('Time Waiting for Equip', labOps.map((m: any) => fmtFixed(m.timeWaitingEquipment, 2)), 90, 190),
    timeWaitingLabor: estimateColMinWidthPx('Time Waiting for Labor', labOps.map((m: any) => fmtFixed(m.timeWaitingLabor, 2)), 90, 190),
    timeInSetup: estimateColMinWidthPx('Time in setup', labOps.map((m: any) => fmtFixed(m.timeInSetup, 2))),
    timeInRun: estimateColMinWidthPx('Time in run', labOps.map((m: any) => fmtFixed(m.timeInRun, 2))),
    timeWaitingRestOfLot: estimateColMinWidthPx('Time Waiting for Rest of Lot', labOps.map((m: any) => fmtFixed(m.timeWaitingRestOfLot, 2)), 90, 190),
    visitsPerGoodPiece: estimateColMinWidthPx('Visits for 1 Good Piece', labOps.map((m: any) => fmtFixed(m.visitsPerGoodPiece, 2)), 90, 180),
    visits: estimateColMinWidthPx('Visits/100 Made', labOps.map((m: any) => fmtFixed(m.visits, 2))),
    noOfSetups: estimateColMinWidthPx('no. of setups', labOps.map((m: any) => fmtFixed(m.noOfSetups, 2))),
    avgLotSize: estimateColMinWidthPx('Avg lot size', labOps.map((m: any) => fmtFixed(m.avgLotSize, 2))),
    wip: estimateColMinWidthPx('WIP', labOps.map((m: any) => fmtFixed(m.wip, 2))),
    mctAtOp: estimateColMinWidthPx('MCT at Op', labOps.map((m: any) => fmtFixed(m.mctAtOp, 2))),
  }), [labOps, unitSuffix, fmtVal]);

  const lab = model.labor.find(l => l.id === selectedId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Oper Details — By Labor</CardTitle>
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={resetColumns}>
            <RotateCcw className="h-3 w-3" />
            Reset Columns
          </Button>
        </div>
      </CardHeader>
      <CardContent ref={laborOperCols.containerRef}>
        <div className="flex items-center gap-3 mb-4">
          <Select value={selectedId || undefined} onValueChange={setSelectedId}>
            <SelectTrigger className="w-56 h-8 text-xs"><SelectValue placeholder="Select labor group…" /></SelectTrigger>
            <SelectContent>
              {model.labor.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant={showTimeUnits ? 'secondary' : 'outline'} size="sm" className="text-xs gap-1 h-7" onClick={() => setShowTimeUnits(!showTimeUnits)}>
            <Clock className="h-3 w-3" />
            {showTimeUnits ? `Time (${g.ops_time_unit})` : '% Time'}
          </Button>
        </div>
        {!lab ? (
          <p className="text-sm text-muted-foreground text-center py-8">Select a labor group to view operation details.</p>
        ) : (
          <>
          <div className="overflow-x-auto">
            <Table className="table-auto">
              <colgroup>
                {columnOrder.map((colKey, i) => (
                  <col key={colKey} style={{ width: `${laborOperCols.widths[i]}%`, minWidth: `${minWidthByKey[colKey] ?? 90}px` }} />
                ))}
              </colgroup>
              <TableHeader><TableRow>
                {columnOrder.map((colKey, index) => (
                  <SortHead
                    key={colKey}
                    label={colKey === 'productName' ? 'Product' : colKey === 'opName' ? 'Operation' : colKey === 'equipName' ? 'Equipment' : colKey === 'opNumber' ? 'Op #' : colKey === 'pctAssigned' ? '% Assign' : colKey === 'eqSetupUtil' ? `Eq Setup${unitSuffix}` : colKey === 'eqRunUtil' ? `Eq Run${unitSuffix}` : colKey === 'labSetupUtil' ? `Lab Setup${unitSuffix}` : colKey === 'labRunUtil' ? `Lab Run${unitSuffix}` : colKey === 'timeWaitingEquipment' ? 'Time Waiting for Equip' : colKey === 'timeWaitingLabor' ? 'Time Waiting for Labor' : colKey === 'timeInSetup' ? 'Time in Setup' : colKey === 'timeInRun' ? 'Time in Run' : colKey === 'timeWaitingRestOfLot' ? 'Time Waiting for Rest of Lot' : colKey === 'visitsPerGoodPiece' ? 'Visits for 1 Good Piece' : colKey === 'visits' ? 'Visits/100 Made' : colKey === 'noOfSetups' ? 'No. of Setups' : colKey === 'avgLotSize' ? 'Avg Lot Size' : colKey === 'wip' ? 'WIP' : 'MCT at Op'}
                    sortKey={colKey}
                    current={labSort.sort}
                    onSort={labSort.handleSort}
                    align={colKey === 'productName' || colKey === 'opName' || colKey === 'equipName' ? 'left' : 'right'}
                    onResizeStart={index < columnOrder.length - 1 ? (ev => laborOperCols.startResize(index, ev)) : undefined}
                    draggable
                    onDragStart={() => { dragFromRef.current = colKey; }}
                    onDragOver={ev => ev.preventDefault()}
                    onDrop={() => {
                      if (dragFromRef.current) moveColumn(dragFromRef.current, colKey);
                      dragFromRef.current = null;
                    }}
                    onDragEnd={() => { dragFromRef.current = null; }}
                  />
                ))}
              </TableRow></TableHeader>
              <TableBody>
                {labSort.sorted.map((m: any) => (
                  <TableRow key={m.opId}>
                    {columnOrder.map(colKey => {
                      if (colKey === 'productName') return <TableCell key={colKey} className="font-mono text-xs text-left whitespace-nowrap">{m.productName}</TableCell>;
                      if (colKey === 'opName') return <TableCell key={colKey} className="font-mono text-xs font-medium text-left whitespace-nowrap">{m.opName}</TableCell>;
                      if (colKey === 'equipName') return <TableCell key={colKey} className="font-mono text-xs text-left whitespace-nowrap">{m.equipName}</TableCell>;
                      if (colKey === 'opNumber') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.opNumber, 2)}</TableCell>;
                      if (colKey === 'pctAssigned') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.pctAssigned, 2)}</TableCell>;
                      if (colKey === 'eqSetupUtil') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtVal(m.eqSetupUtil)}</TableCell>;
                      if (colKey === 'eqRunUtil') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtVal(m.eqRunUtil)}</TableCell>;
                      if (colKey === 'labSetupUtil') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtVal(m.labSetupUtil)}</TableCell>;
                      if (colKey === 'labRunUtil') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtVal(m.labRunUtil)}</TableCell>;
                      if (colKey === 'timeWaitingEquipment') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.timeWaitingEquipment, 2)}</TableCell>;
                      if (colKey === 'timeWaitingLabor') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.timeWaitingLabor, 2)}</TableCell>;
                      if (colKey === 'timeInSetup') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.timeInSetup, 2)}</TableCell>;
                      if (colKey === 'timeInRun') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.timeInRun, 2)}</TableCell>;
                      if (colKey === 'timeWaitingRestOfLot') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.timeWaitingRestOfLot, 2)}</TableCell>;
                      if (colKey === 'visitsPerGoodPiece') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.visitsPerGoodPiece, 2)}</TableCell>;
                      if (colKey === 'visits') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.visits, 2)}</TableCell>;
                      if (colKey === 'noOfSetups') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.noOfSetups, 2)}</TableCell>;
                      if (colKey === 'avgLotSize') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.avgLotSize, 2)}</TableCell>;
                      if (colKey === 'wip') return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.wip, 2)}</TableCell>;
                      return <TableCell key={colKey} className="font-mono text-xs text-right whitespace-nowrap tabular-nums">{fmtFixed(m.mctAtOp, 2)}</TableCell>;
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ProductGroupSummaryTable
            metrics={labOps}
            model={model}
            description={runDescription}
            showTimeUnits={showTimeUnits}
            timeUnitLabel={g.ops_time_unit}
          />
          </>
        )}
      </CardContent>
    </Card>
  );
}


function EquipmentResultsTable({ equipment, utilLimit, model }: { equipment: EquipmentResult[]; utilLimit: number; model: Model }) {
  const equipmentRows = useMemo(() => equipment.map(eq => {
    const anyEq = eq as any;
    const piecesInProcess = asNum(anyEq.wip_process ?? anyEq.wipProcess ?? 0);
    const piecesWaiting = asNum(anyEq.wip_queue ?? anyEq.wipQueue ?? 0);
    const wip = asNum(anyEq.wip_total ?? anyEq.wipTotal ?? (piecesInProcess + piecesWaiting));
    const modelEq = model.equipment.find(me => me.id === eq.id) || model.equipment.find(me => me.name === eq.name);
    const modelLabor =
      (modelEq && model.labor.find(l => l.id === modelEq.labor_group_id)) ||
      (modelEq && model.labor.find(l => l.name === (modelEq as any).labor_group_name));
    const laborName =
      modelLabor?.name ||
      (anyEq.laborName as string) ||
      (eq.laborGroup as string) ||
      '—';
    return { ...eq, piecesInProcess, piecesWaiting, wip, laborName };
  }), [equipment, model]);
  const { sorted, sort, handleSort } = useSortableTable(equipmentRows, 'totalUtil', 'desc');
  const equipmentCols = useResizableColumns([12, 6, 7, 7, 7, 8, 7, 7, 9, 9, 8, 13], 8);
  const [columnOrder, setColumnOrder] = useState<Array<'name' | 'count' | 'setupUtil' | 'runUtil' | 'repairUtil' | 'waitLaborUtil' | 'totalUtil' | 'idle' | 'piecesInProcess' | 'piecesWaiting' | 'wip' | 'laborName'>>(
    ['name', 'count', 'setupUtil', 'runUtil', 'repairUtil', 'waitLaborUtil', 'totalUtil', 'idle', 'piecesInProcess', 'piecesWaiting', 'wip', 'laborName'],
  );
  const dragFromRef = useRef<string | null>(null);
  const moveEquipmentColumn = useCallback((fromKey: string, toKey: string) => {
    const fromIndex = columnOrder.indexOf(fromKey as any);
    const toIndex = columnOrder.indexOf(toKey as any);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    setColumnOrder(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next as any;
    });
    equipmentCols.moveColumn(fromIndex, toIndex);
  }, [columnOrder, equipmentCols]);
  const resetColumns = useCallback(() => {
    setColumnOrder(['name', 'count', 'setupUtil', 'runUtil', 'repairUtil', 'waitLaborUtil', 'totalUtil', 'idle', 'piecesInProcess', 'piecesWaiting', 'wip', 'laborName']);
    equipmentCols.resetWidths();
  }, [equipmentCols]);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Equipment Results Table</CardTitle>
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={resetColumns}>
            <RotateCcw className="h-3 w-3" />
            Reset Columns
          </Button>
        </div>
      </CardHeader>
      <CardContent ref={equipmentCols.containerRef} className="p-0 overflow-x-auto">
        <Table className="table-auto">
          <colgroup>
            {columnOrder.map((colKey, i) => (
                  <col key={colKey} style={{ width: `${equipmentCols.widths[i]}%`, minWidth: colKey === 'name' || colKey === 'laborName' ? '130px' : colKey === 'piecesInProcess' || colKey === 'piecesWaiting' ? '145px' : '90px' }} />
            ))}
          </colgroup>
          <TableHeader><TableRow>
            {columnOrder.map((colKey, index) => (
              <SortHead
                key={colKey}
                label={colKey === 'name' ? 'Equipment' : colKey === 'count' ? 'Count' : colKey === 'setupUtil' ? 'Setup %' : colKey === 'runUtil' ? 'Run %' : colKey === 'repairUtil' ? 'Repair %' : colKey === 'waitLaborUtil' ? 'Wait Labor %' : colKey === 'totalUtil' ? 'Total %' : colKey === 'idle' ? 'Idle %' : colKey === 'piecesInProcess' ? 'Pieces in Process' : colKey === 'piecesWaiting' ? 'Pieces Waiting' : colKey === 'wip' ? 'WIP' : 'Labor Name'}
                sortKey={colKey}
                current={sort}
                onSort={handleSort}
                align={colKey === 'name' || colKey === 'laborName' ? 'left' : 'right'}
                onResizeStart={index < columnOrder.length - 1 ? (ev => equipmentCols.startResize(index, ev)) : undefined}
                draggable
                onDragStart={() => { dragFromRef.current = colKey; }}
                onDragOver={ev => ev.preventDefault()}
                onDrop={() => {
                  if (dragFromRef.current) moveEquipmentColumn(dragFromRef.current, colKey);
                  dragFromRef.current = null;
                }}
                onDragEnd={() => { dragFromRef.current = null; }}
              />
            ))}
          </TableRow></TableHeader>
          <TableBody>
            {sorted.map(eq => (
              <TableRow key={eq.id}>
                {columnOrder.map(colKey => {
                  if (colKey === 'name') return <TableCell key={colKey} className="font-mono font-medium text-left whitespace-nowrap">{eq.name}</TableCell>;
                  if (colKey === 'count') return <TableCell key={colKey} className="font-mono text-right whitespace-nowrap tabular-nums">{fmtFixed(eq.count, 1)}</TableCell>;
                  if (colKey === 'setupUtil') return <TableCell key={colKey} className="font-mono text-right whitespace-nowrap tabular-nums">{fmtFixed(eq.setupUtil, 1)}</TableCell>;
                  if (colKey === 'runUtil') return <TableCell key={colKey} className="font-mono text-right whitespace-nowrap tabular-nums">{fmtFixed(eq.runUtil, 1)}</TableCell>;
                  if (colKey === 'repairUtil') return <TableCell key={colKey} className="font-mono text-right whitespace-nowrap tabular-nums">{fmtFixed(eq.repairUtil, 1)}</TableCell>;
                  if (colKey === 'waitLaborUtil') return <TableCell key={colKey} className="font-mono text-right whitespace-nowrap tabular-nums">{fmtFixed(eq.waitLaborUtil, 1)}</TableCell>;
                  if (colKey === 'totalUtil') return <TableCell key={colKey} className={`font-mono text-right font-medium whitespace-nowrap tabular-nums ${eq.totalUtil > utilLimit ? 'text-destructive' : ''}`}>{fmtFixed(eq.totalUtil, 1)}</TableCell>;
                  if (colKey === 'idle') return <TableCell key={colKey} className="font-mono text-right text-muted-foreground whitespace-nowrap tabular-nums">{fmtFixed(eq.idle, 1)}</TableCell>;
                  if (colKey === 'piecesInProcess') return <TableCell key={colKey} className="font-mono text-right whitespace-nowrap tabular-nums">{fmtFixed((eq as any).piecesInProcess, 2)}</TableCell>;
                  if (colKey === 'piecesWaiting') return <TableCell key={colKey} className="font-mono text-right whitespace-nowrap tabular-nums">{fmtFixed((eq as any).piecesWaiting, 2)}</TableCell>;
                  if (colKey === 'wip') return <TableCell key={colKey} className="font-mono text-right whitespace-nowrap tabular-nums">{fmtFixed((eq as any).wip, 2)}</TableCell>;
                  return <TableCell key={colKey} className="font-mono text-xs text-muted-foreground text-left whitespace-nowrap">{(eq as any).laborName}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ─── Labor Results Table (sortable) ─── */
function LaborResultsTable({ labor, utilLimit }: { labor: LaborResult[]; utilLimit: number }) {
  const laborRows = useMemo(() => labor.map(l => ({
    ...l,
    equipTended: asNum((l as any).machinesTended),
    avgEquipWaiting: asNum((l as any).machinesWaiting),
  })), [labor]);
  const { sorted, sort, handleSort } = useSortableTable(laborRows, 'totalUtil', 'desc');
  const laborCols = useResizableColumns([18, 11, 11, 11, 12, 12, 9, 8, 8], 8);
  const [columnOrder, setColumnOrder] = useState<Array<'name' | 'count' | 'setupUtil' | 'runUtil' | 'equipTended' | 'avgEquipWaiting' | 'unavailPct' | 'totalUtil' | 'idle'>>(
    ['name', 'count', 'setupUtil', 'runUtil', 'equipTended', 'avgEquipWaiting', 'unavailPct', 'totalUtil', 'idle'],
  );
  const dragFromRef = useRef<string | null>(null);
  const moveLaborColumn = useCallback((fromKey: string, toKey: string) => {
    const fromIndex = columnOrder.indexOf(fromKey as any);
    const toIndex = columnOrder.indexOf(toKey as any);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    setColumnOrder(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next as any;
    });
    laborCols.moveColumn(fromIndex, toIndex);
  }, [columnOrder, laborCols]);
  const resetColumns = useCallback(() => {
    setColumnOrder(['name', 'count', 'setupUtil', 'runUtil', 'equipTended', 'avgEquipWaiting', 'unavailPct', 'totalUtil', 'idle']);
    laborCols.resetWidths();
  }, [laborCols]);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Labor Results Table</CardTitle>
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={resetColumns}>
            <RotateCcw className="h-3 w-3" />
            Reset Columns
          </Button>
        </div>
      </CardHeader>
      <CardContent ref={laborCols.containerRef} className="p-0 overflow-x-auto">
        <Table className="table-fixed">
          <colgroup>
            {laborCols.widths.map((w, i) => (
              <col key={i} style={{ width: `${w}%` }} />
            ))}
          </colgroup>
          <TableHeader><TableRow>
            {columnOrder.map((colKey, index) => (
              <SortHead
                key={colKey}
                label={colKey === 'name' ? 'Labor Group' : colKey === 'count' ? 'Count' : colKey === 'setupUtil' ? 'Setup %' : colKey === 'runUtil' ? 'Run %' : colKey === 'equipTended' ? 'Equip Tended' : colKey === 'avgEquipWaiting' ? 'Avg Equip Waiting' : colKey === 'unavailPct' ? 'Unavail %' : colKey === 'totalUtil' ? 'Total %' : 'Idle %'}
                sortKey={colKey}
                current={sort}
                onSort={handleSort}
                align={colKey === 'name' ? 'left' : 'right'}
                onResizeStart={index < columnOrder.length - 1 ? (ev => laborCols.startResize(index, ev)) : undefined}
                draggable
                onDragStart={() => { dragFromRef.current = colKey; }}
                onDragOver={ev => ev.preventDefault()}
                onDrop={() => {
                  if (dragFromRef.current) moveLaborColumn(dragFromRef.current, colKey);
                  dragFromRef.current = null;
                }}
                onDragEnd={() => { dragFromRef.current = null; }}
              />
            ))}
          </TableRow></TableHeader>
          <TableBody>
            {sorted.map(l => (
              <TableRow key={l.id}>
                {columnOrder.map(colKey => {
                  if (colKey === 'name') return <TableCell key={colKey} className="font-mono font-medium text-left whitespace-nowrap">{l.name}</TableCell>;
                  if (colKey === 'count') return <TableCell key={colKey} className="font-mono text-right whitespace-nowrap tabular-nums">{fmtFixed(l.count, 1)}</TableCell>;
                  if (colKey === 'setupUtil') return <TableCell key={colKey} className="font-mono text-right whitespace-nowrap tabular-nums">{fmtFixed(l.setupUtil, 1)}</TableCell>;
                  if (colKey === 'runUtil') return <TableCell key={colKey} className="font-mono text-right whitespace-nowrap tabular-nums">{fmtFixed(l.runUtil, 1)}</TableCell>;
                  if (colKey === 'equipTended') return <TableCell key={colKey} className="font-mono text-right whitespace-nowrap tabular-nums">{fmtFixed((l as any).equipTended, 2)}</TableCell>;
                  if (colKey === 'avgEquipWaiting') return <TableCell key={colKey} className="font-mono text-right whitespace-nowrap tabular-nums">{fmtFixed((l as any).avgEquipWaiting, 2)}</TableCell>;
                  if (colKey === 'unavailPct') return <TableCell key={colKey} className="font-mono text-right whitespace-nowrap tabular-nums">{fmtFixed(l.unavailPct, 1)}</TableCell>;
                  if (colKey === 'totalUtil') return <TableCell key={colKey} className={`font-mono text-right font-medium whitespace-nowrap tabular-nums ${l.totalUtil > utilLimit ? 'text-destructive' : ''}`}>{fmtFixed(l.totalUtil, 1)}</TableCell>;
                  return <TableCell key={colKey} className="font-mono text-right text-muted-foreground whitespace-nowrap tabular-nums">{fmtFixed(l.idle, 1)}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ─── Production Chart (2G) ─── */
const prodChartColors = {
  shipped: 'hsl(217, 91%, 60%)',
  usedInAssembly: 'hsl(142, 71%, 45%)',
  scrappedInAssembly: 'hsl(38, 92%, 50%)',
  scrapInProduction: 'hsl(0, 72%, 51%)',
};

function ProductionChart({ results, model, isMultiScenario, chartScenarios }: {
  results: CalcResults; model: any; isMultiScenario: boolean; chartScenarios: ScenarioEntry[];
}) {
  const [showTable, setShowTable] = useState(false);
  const data = useMemo(() => buildProductionData(results, model), [results, model]);
  const { sorted, sort, handleSort } = useSortableTable(data, 'total', 'desc');

  if (data.length === 0) return (
    <Card><CardContent className="py-12 text-center"><BarChart3 className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" /><p className="text-sm text-muted-foreground">Run the model to see production breakdown.</p></CardContent></Card>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Production Chart</CardTitle>
            <CardDescription>Breakdown of production by disposition</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => setShowTable(!showTable)}>
            {showTable ? 'Show Chart' : 'Show as Table'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <ChartScenarioLabel />
        {showTable ? (
          <Table>
            <TableHeader><TableRow>
              <SortHead label="Product" sortKey="name" current={sort} onSort={handleSort} align="left" />
              <SortHead label="Shipped" sortKey="shipped" current={sort} onSort={handleSort} />
              <SortHead label="Used in Assy" sortKey="usedInAssembly" current={sort} onSort={handleSort} />
              <SortHead label="Scrapped in Assy" sortKey="scrappedInAssembly" current={sort} onSort={handleSort} />
              <SortHead label="Scrap" sortKey="scrapInProduction" current={sort} onSort={handleSort} />
              <SortHead label="Total" sortKey="total" current={sort} onSort={handleSort} />
            </TableRow></TableHeader>
            <TableBody>
              {sorted.map(d => (
                <TableRow key={d.name}>
                  <TableCell className="font-mono font-medium">{d.name}</TableCell>
                  <TableCell className="font-mono text-right">{d.shipped.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-right">{d.usedInAssembly.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-right">{d.scrappedInAssembly.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-right">{d.scrapInProduction.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-right font-medium">{d.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={axisStyle} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: 'Units', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="shipped" stackId="a" fill={prodChartColors.shipped} name="Shipped Production" />
              <Bar dataKey="usedInAssembly" stackId="a" fill={prodChartColors.usedInAssembly} name="Used in Assembly" />
              <Bar dataKey="scrappedInAssembly" stackId="a" fill={prodChartColors.scrappedInAssembly} name="Scrapped in Assembly" />
              <Bar dataKey="scrapInProduction" stackId="a" fill={prodChartColors.scrapInProduction} name="Scrap in Production" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}