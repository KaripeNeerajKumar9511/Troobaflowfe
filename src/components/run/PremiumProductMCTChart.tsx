import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Label,
} from 'recharts';
import { Info, Sparkles } from 'lucide-react';
import type { CalcResults, ProductResult } from '@/lib/calculationEngine';
import type { Model } from '@/stores/modelStore';
import { MCT_COLORS, MCTLegend } from '@/components/IBOMOutput';
import { premiumCardClass } from '@/lib/premiumOutputTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ChartScenarioLabel from '@/components/ChartScenarioLabel';
import { ProductMCTInsightsDialog } from '@/components/run/ProductMCTInsightsDialog';
import { Button } from '@/components/ui/button';
import {
  PremiumBreakdownNav,
  buildSegmentBreakdown,
  computeCategoryGap,
  computeResourceBarSize,
  fmtNum,
  truncateAxisLabel,
} from '@/components/run/premiumUtilChartShared';

const PRODUCT_MCT_BAR_COLOR = '#6366F1';

const PRODUCT_MCT_SEGMENTS = [
  { key: 'mctLotWait', label: 'Wait for Lot', color: MCT_COLORS.lotWait },
  { key: 'mctQueue', label: 'Wait for Equipment', color: MCT_COLORS.waitEquip },
  { key: 'mctWaitLabor', label: 'Wait for Labor', color: MCT_COLORS.waitLabor },
  { key: 'mctSetup', label: 'Setup', color: MCT_COLORS.setup },
  { key: 'mctRun', label: 'Run', color: MCT_COLORS.run },
];

const axisTickStyle = { fontSize: 10, fill: '#64748B' };

type ChartRow = {
  id: string;
  name: string;
  totalMct: number;
  fill: string;
};

function ChartTooltip({
  active,
  payload,
  mctUnit,
}: {
  active?: boolean;
  payload?: Array<{ payload?: ChartRow }>;
  mctUnit: string;
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-md border bg-card px-3 py-2 text-xs shadow-md max-w-xs pointer-events-none">
      <p className="font-semibold">{row.name}</p>
      <p className="tabular-nums">
        {fmtNum(row.totalMct)} {mctUnit} MCT
      </p>
      <p className="text-muted-foreground mt-1 italic">Click bar for breakdown</p>
    </div>
  );
}

export function PremiumProductMCTChart({
  results,
  model,
  insightsOpen,
  onInsightsOpenChange,
  showInsightsIcon,
}: {
  results: CalcResults;
  model: Model;
  insightsOpen: boolean;
  onInsightsOpenChange: (open: boolean) => void;
  showInsightsIcon: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const breakdownRef = useRef<HTMLDivElement>(null);
  const mctUnit = model.general.mct_time_unit;

  const products = useMemo(
    () => [...results.products].sort((a, b) => b.mct - a.mct),
    [results.products],
  );

  const chartData = useMemo<ChartRow[]>(
    () =>
      products.map((p) => ({
        id: p.id,
        name: p.name,
        totalMct: p.mct,
        fill: PRODUCT_MCT_BAR_COLOR,
      })),
    [products],
  );

  const overallMct = useMemo(() => {
    if (products.length === 0) return 0;
    return products.reduce((s, p) => s + p.mct, 0) / products.length;
  }, [products]);

  const yMax = useMemo(() => {
    const peak = Math.max(...chartData.map((d) => d.totalMct), 1);
    return Math.ceil(peak * 1.12 / 5) * 5;
  }, [chartData]);

  const selected = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId],
  );

  const breakdown = useMemo(
    () => (selected ? buildSegmentBreakdown(selected, PRODUCT_MCT_SEGMENTS) : []),
    [selected],
  );

  const selectedIndex = useMemo(
    () => (selectedId ? products.findIndex((p) => p.id === selectedId) : -1),
    [products, selectedId],
  );

  const barSize = useMemo(() => computeResourceBarSize(chartData.length), [chartData.length]);
  const categoryGap = useMemo(() => computeCategoryGap(chartData.length), [chartData.length]);

  const handleBarSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const goToPrevious = useCallback(() => {
    if (selectedIndex > 0) setSelectedId(products[selectedIndex - 1].id);
  }, [products, selectedIndex]);

  const goToNext = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < products.length - 1) {
      setSelectedId(products[selectedIndex + 1].id);
    }
  }, [products, selectedIndex]);

  useEffect(() => {
    if (!selectedId) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (chartRef.current?.contains(target) || breakdownRef.current?.contains(target)) return;
      setSelectedId(null);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [selectedId]);

  if (products.length === 0) {
    return (
      <Card className={premiumCardClass(true)}>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No product MCT data available.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <ProductMCTInsightsDialog
        open={insightsOpen}
        onOpenChange={onInsightsOpenChange}
        products={products}
        overallMct={overallMct}
        mctUnit={mctUnit}
      />
      <Card
        ref={chartRef}
        className={`${premiumCardClass(true)} transition-all duration-300 ${selectedId ? 'ring-1 ring-slate-200' : ''}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="font-semibold">
                Product MCT by Product
              </CardTitle>
              <CardDescription>
                Click a bar to view that product&apos;s MCT breakdown below. Values in {mctUnit}.
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {showInsightsIcon && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100"
                  onClick={() => onInsightsOpenChange(true)}
                  aria-label="View key insights"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="shrink-0 text-muted-foreground hover:text-foreground" aria-label="Chart info">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs text-xs">
                    Bar height shows total manufacturing cycle time (MCT). Segment colors in the breakdown follow the standard MCT
                    component legend — not utilization queue risk bands.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative pt-0">
          <ChartScenarioLabel />
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={chartData} margin={{ top: 16, right: 24, bottom: 88, left: 8 }} barCategoryGap={categoryGap}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                interval={0}
                angle={-40}
                textAnchor="end"
                height={88}
                tick={axisTickStyle}
                tickFormatter={(v) => truncateAxisLabel(String(v))}
              />
              <YAxis
                domain={[0, yMax]}
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: `MCT (${mctUnit})`,
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 11, fill: '#64748B' },
                }}
              />
              <RechartsTooltip content={<ChartTooltip mctUnit={mctUnit} />} />
              <Bar
                dataKey="totalMct"
                barSize={barSize}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
                cursor="pointer"
                onClick={(data) => {
                  const row = data as ChartRow;
                  if (row?.id) handleBarSelect(row.id);
                }}
              >
                {chartData.map((entry) => {
                  const isSelected = selectedId === entry.id;
                  const dimmed = !!selectedId && !isSelected;
                  return (
                    <Cell
                      key={entry.id}
                      fill={entry.fill}
                      fillOpacity={dimmed ? 0.38 : 1}
                      stroke={isSelected ? '#334155' : 'transparent'}
                      strokeWidth={isSelected ? 1.5 : 0}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <MCTLegend />
        </CardContent>
      </Card>

      {selected && (
        <ProductMCTBreakdownCard
          ref={breakdownRef}
          selected={selected}
          breakdown={breakdown}
          mctUnit={mctUnit}
          hasPrevious={selectedIndex > 0}
          hasNext={selectedIndex >= 0 && selectedIndex < products.length - 1}
          onPrevious={goToPrevious}
          onNext={goToNext}
        />
      )}

      <Card className={premiumCardClass(true)}>
        <CardHeader className="pb-3">
          <CardTitle className="font-semibold">
            Product MCT Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E6EA] hover:bg-transparent">
                <TableHead className="text-xs font-semibold pl-4">Product</TableHead>
                <TableHead className="text-xs font-semibold text-right pr-4">
                  MCT ({mctUnit})
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id} className={`border-[#E2E6EA] ${selectedId === p.id ? 'bg-slate-50' : ''}`}>
                  <TableCell className="py-2.5 pl-4 text-xs font-medium">{p.name}</TableCell>
                  <TableCell className="py-2.5 pr-4 text-xs text-right tabular-nums">{fmtNum(p.mct)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-[#E2E6EA] bg-muted/20 font-semibold">
                <TableCell className="py-2.5 pl-4 text-xs">AVERAGE</TableCell>
                <TableCell className="py-2.5 pr-4 text-xs text-right tabular-nums">{fmtNum(overallMct)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

type BreakdownRow = ReturnType<typeof buildSegmentBreakdown>[number];

const ProductMCTBreakdownCard = React.forwardRef<
  HTMLDivElement,
  {
    selected: ProductResult;
    breakdown: BreakdownRow[];
    mctUnit: string;
    hasPrevious: boolean;
    hasNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
  }
>(function ProductMCTBreakdownCard(
  { selected, breakdown, mctUnit, hasPrevious, hasNext, onPrevious, onNext },
  ref,
) {
  return (
    <Card ref={ref} className={`${premiumCardClass(true)} animate-in fade-in slide-in-from-top-2 duration-200`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="font-semibold">
              {selected.name} Product MCT Breakdown
            </CardTitle>
            <CardDescription>MCT component breakdown from calculation results</CardDescription>
          </div>
          <PremiumBreakdownNav
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPrevious={onPrevious}
            onNext={onNext}
            previousLabel="Previous product MCT breakdown"
            nextLabel="Next product MCT breakdown"
            badge={
              <span className="rounded-md border border-[#E2E6EA] bg-slate-50 px-2 py-1 text-xs font-semibold tabular-nums text-foreground">
                {fmtNum(selected.mct)} {mctUnit}
              </span>
            }
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr] gap-4 items-center">
          <div className="h-[140px] w-full mx-auto max-w-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown.filter((d) => d.value > 0)}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={62}
                  paddingAngle={2}
                >
                  {breakdown.map((seg) => (
                    <Cell key={seg.key} fill={seg.color} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !('cx' in viewBox)) return null;
                      const { cx, cy } = viewBox as { cx: number; cy: number };
                      return (
                        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={cx} y={cy - 4} className="fill-foreground text-sm font-semibold">
                            {fmtNum(selected.mct)}
                          </tspan>
                          <tspan x={cx} y={cy + 12} className="fill-muted-foreground text-meta">
                            {mctUnit}
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E6EA] hover:bg-transparent">
                <TableHead className="text-xs font-semibold">Component</TableHead>
                <TableHead className="text-xs font-semibold text-right">MCT</TableHead>
                <TableHead className="text-xs font-semibold text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdown.map((row) => (
                <TableRow key={row.key} className="border-[#E2E6EA]">
                  <TableCell className="py-2 text-xs">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                      {row.label}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 text-xs text-right tabular-nums">{fmtNum(row.value)}</TableCell>
                  <TableCell className="py-2 text-xs text-right tabular-nums">{fmtNum(row.pctOfTotal, 1)}%</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-[#E2E6EA] bg-muted/20 font-medium">
                <TableCell className="py-2 text-xs">Total</TableCell>
                <TableCell className="py-2 text-xs text-right tabular-nums">
                  {fmtNum(breakdown.reduce((s, r) => s + r.value, 0))}
                </TableCell>
                <TableCell className="py-2 text-xs text-right tabular-nums">100.0%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});
