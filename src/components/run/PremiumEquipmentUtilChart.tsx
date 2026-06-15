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
  ReferenceLine,
} from 'recharts';
import { Info, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalcResults, EquipmentResult } from '@/lib/calculationEngine';
import type { Model } from '@/stores/modelStore';
import { MCT_COLORS } from '@/components/IBOMOutput';
import { premiumCardClass } from '@/lib/premiumOutputTable';
import {
  getUtilizationBarColor,
  getUtilizationQueueRisk,
  getUtilizationRiskBadgeClass,
} from '@/lib/utilizationRisk';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ChartScenarioLabel from '@/components/ChartScenarioLabel';
import { EquipmentUtilInsightsDialog } from '@/components/run/EquipmentUtilInsightsDialog';
import { Button } from '@/components/ui/button';
import {
  UtilRiskLegend,
  buildSegmentBreakdown,
  fmtPct,
} from '@/components/run/premiumUtilChartShared';

const EQUIP_BREAKDOWN_SEGMENTS = [
  { key: 'setupUtil' as const, label: 'Setup', color: MCT_COLORS.setup },
  { key: 'runUtil' as const, label: 'Run', color: MCT_COLORS.run },
  { key: 'repairUtil' as const, label: 'Repair', color: 'hsl(0, 72%, 51%)' },
  { key: 'waitLaborUtil' as const, label: 'Wait for Labor', color: MCT_COLORS.waitLabor },
];

const axisTickStyle = { fontSize: 10, fill: '#64748B' };

function truncateAxisLabel(name: string, maxLen = 18): string {
  if (name.length <= maxLen) return name;
  return `${name.slice(0, maxLen - 1)}…`;
}

type ChartRow = {
  id: string;
  name: string;
  totalUtil: number;
  fill: string;
};

function computeBarSize(equipmentCount: number): number {
  if (equipmentCount <= 2) return 56;
  if (equipmentCount <= 4) return 48;
  if (equipmentCount <= 6) return 42;
  if (equipmentCount <= 10) return 34;
  if (equipmentCount <= 15) return 28;
  if (equipmentCount <= 20) return 22;
  if (equipmentCount <= 28) return 18;
  if (equipmentCount <= 40) return 14;
  return 10;
}

function computeCategoryGap(equipmentCount: number): string {
  if (equipmentCount > 24) return '6%';
  if (equipmentCount > 14) return '10%';
  if (equipmentCount > 8) return '14%';
  return '20%';
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: ChartRow }>;
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-md border bg-card px-3 py-2 text-xs shadow-md max-w-xs pointer-events-none">
      <p className="font-semibold">{row.name}</p>
      <p className="tabular-nums">{fmtPct(row.totalUtil)}% utilization</p>
      <p className="text-muted-foreground">{getUtilizationQueueRisk(row.totalUtil)}</p>
      <p className="text-muted-foreground mt-1 italic">Click bar for breakdown</p>
    </div>
  );
}

export function PremiumEquipmentUtilChart({
  results,
  model,
  insightsOpen,
  onInsightsOpenChange,
}: {
  results: CalcResults;
  model: Model;
  insightsOpen: boolean;
  onInsightsOpenChange: (open: boolean) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const breakdownRef = useRef<HTMLDivElement>(null);
  const utilLimit = model.general.util_limit;

  const equipment = useMemo(
    () => [...results.equipment].sort((a, b) => b.totalUtil - a.totalUtil),
    [results.equipment],
  );

  const chartData = useMemo<ChartRow[]>(
    () =>
      equipment.map((eq) => ({
        id: eq.id,
        name: eq.name,
        totalUtil: eq.totalUtil,
        fill: getUtilizationBarColor(eq.totalUtil),
      })),
    [equipment],
  );

  const overallUtil = useMemo(() => {
    if (equipment.length === 0) return 0;
    return equipment.reduce((s, e) => s + e.totalUtil, 0) / equipment.length;
  }, [equipment]);

  const selected = useMemo(
    () => equipment.find((e) => e.id === selectedId) ?? null,
    [equipment, selectedId],
  );

  const breakdown = useMemo(
    () => (selected ? buildSegmentBreakdown(selected, EQUIP_BREAKDOWN_SEGMENTS) : []),
    [selected],
  );

  const selectedIndex = useMemo(
    () => (selectedId ? equipment.findIndex((e) => e.id === selectedId) : -1),
    [equipment, selectedId],
  );

  const barSize = useMemo(() => computeBarSize(chartData.length), [chartData.length]);
  const categoryGap = useMemo(() => computeCategoryGap(chartData.length), [chartData.length]);

  const handleBarSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const goToPreviousEquipment = useCallback(() => {
    if (selectedIndex > 0) {
      setSelectedId(equipment[selectedIndex - 1].id);
    }
  }, [equipment, selectedIndex]);

  const goToNextEquipment = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < equipment.length - 1) {
      setSelectedId(equipment[selectedIndex + 1].id);
    }
  }, [equipment, selectedIndex]);

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

  if (equipment.length === 0) {
    return (
      <Card className={premiumCardClass(true)}>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No equipment utilization data available.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card
        ref={chartRef}
        className={`${premiumCardClass(true)} transition-all duration-300 ${selectedId ? 'ring-1 ring-slate-200' : ''}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="font-semibold">
                Equipment Utilization by Equipment
              </CardTitle>
              <CardDescription>
                Click a bar to view that equipment&apos;s utilization breakdown below.
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <EquipmentUtilInsightsDialog
                open={insightsOpen}
                onOpenChange={onInsightsOpenChange}
                equipment={equipment}
                overallUtil={overallUtil}
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 data-[state=open]:bg-violet-100"
                    aria-label="View key insights"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                }
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="shrink-0 text-muted-foreground hover:text-foreground" aria-label="Chart info">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs text-xs">
                    Bar colors reflect queue risk: green (stable) → red (chaos). Thresholds: &lt;70% Very stable, 70–80% Healthy,
                    80–85% Risk rising, &gt;85% Queue explosion zone, &gt;90% Chaos.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative pt-0">
          <ChartScenarioLabel />
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={chartData}
              margin={{ top: 16, right: 24, bottom: 88, left: 8 }}
              barCategoryGap={categoryGap}
            >
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
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: '% Utilization',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 11, fill: '#64748B' },
                }}
              />
              <ReferenceLine
                y={utilLimit}
                stroke="hsl(0, 72%, 51%)"
                strokeDasharray="5 5"
                label={{
                  value: `Limit ${utilLimit}%`,
                  position: 'right',
                  style: { fontSize: 10, fill: 'hsl(0, 72%, 51%)' },
                }}
              />
              <RechartsTooltip content={<ChartTooltip />} />
              <Bar
                dataKey="totalUtil"
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
          <UtilRiskLegend />
        </CardContent>
      </Card>

      {selected && (
        <EquipBreakdownCard
          ref={breakdownRef}
          selected={selected}
          breakdown={breakdown}
          hasPrevious={selectedIndex > 0}
          hasNext={selectedIndex >= 0 && selectedIndex < equipment.length - 1}
          onPrevious={goToPreviousEquipment}
          onNext={goToNextEquipment}
        />
      )}

      <Card className={premiumCardClass(true)}>
        <CardHeader className="pb-3">
          <CardTitle className="font-semibold">
            Equipment Utilization Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E6EA] hover:bg-transparent">
                <TableHead className="text-xs font-semibold pl-4">Equipment</TableHead>
                <TableHead className="text-xs font-semibold text-right">Utilization</TableHead>
                <TableHead className="text-xs font-semibold text-right pr-4">Queue Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((eq) => (
                <TableRow
                  key={eq.id}
                  className={`border-[#E2E6EA] ${selectedId === eq.id ? 'bg-slate-50' : ''}`}
                >
                  <TableCell className="py-2.5 pl-4 text-xs font-medium">{eq.name}</TableCell>
                  <TableCell className="py-2.5 text-xs text-right tabular-nums">{fmtPct(eq.totalUtil)}%</TableCell>
                  <TableCell className="py-2.5 pr-4 text-right">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-meta font-medium ${getUtilizationRiskBadgeClass(eq.totalUtil)}`}
                    >
                      {getUtilizationQueueRisk(eq.totalUtil)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-[#E2E6EA] bg-muted/20 font-semibold">
                <TableCell className="py-2.5 pl-4 text-xs">TOTAL</TableCell>
                <TableCell className="py-2.5 text-xs text-right tabular-nums">{fmtPct(overallUtil)}%</TableCell>
                <TableCell className="py-2.5 pr-4 text-right text-meta text-muted-foreground">Overall</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

const EquipBreakdownCard = React.forwardRef<
  HTMLDivElement,
  {
    selected: EquipmentResult;
    breakdown: ReturnType<typeof buildSegmentBreakdown>;
    hasPrevious: boolean;
    hasNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
  }
>(function EquipBreakdownCard(
  { selected, breakdown, hasPrevious, hasNext, onPrevious, onNext },
  ref,
) {
  return (
    <Card
      ref={ref}
      className={`${premiumCardClass(true)} animate-in fade-in slide-in-from-top-2 duration-200`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="font-semibold">
              {selected.name} Equipment Utilization Breakdown
            </CardTitle>
            <CardDescription>Component utilization from calculation results</CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center overflow-hidden rounded-md border border-[#E2E6EA]">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                disabled={!hasPrevious}
                onClick={onPrevious}
                aria-label="Previous equipment breakdown"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none border-l border-[#E2E6EA]"
                disabled={!hasNext}
                onClick={onNext}
                aria-label="Next equipment breakdown"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <span
              className={`rounded-md border px-2 py-1 text-xs font-semibold tabular-nums ${getUtilizationRiskBadgeClass(selected.totalUtil)}`}
            >
              {fmtPct(selected.totalUtil)}%
            </span>
          </div>
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
                            {fmtPct(selected.totalUtil)}%
                          </tspan>
                          <tspan x={cx} y={cy + 12} className="fill-muted-foreground text-meta">
                            Utilization
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
                <TableHead className="text-xs font-semibold text-right">Utilization</TableHead>
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
                  <TableCell className="py-2 text-xs text-right tabular-nums">{fmtPct(row.value)}</TableCell>
                  <TableCell className="py-2 text-xs text-right tabular-nums">{fmtPct(row.pctOfTotal, 1)}%</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-[#E2E6EA] bg-muted/20 font-medium">
                <TableCell className="py-2 text-xs">Total</TableCell>
                <TableCell className="py-2 text-xs text-right tabular-nums">
                  {fmtPct(breakdown.reduce((s, r) => s + r.value, 0))}
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
