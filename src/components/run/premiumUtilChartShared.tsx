import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { premiumCardClass, premiumFmtNum } from '@/lib/premiumOutputTable';

export const Y_AXIS_CHAR_PX = 5.8;
export const Y_AXIS_MIN_WIDTH = 128;
export const Y_AXIS_MAX_WIDTH = 240;
export const Y_AXIS_TRUNCATE_AT = 34;
export const ROW_HEIGHT_PX = 52;

export function fmtPct(v: number, digits = 2): string {
  return premiumFmtNum(v, digits, true);
}

export function truncateResourceName(name: string, maxLen = Y_AXIS_TRUNCATE_AT): string {
  if (name.length <= maxLen) return name;
  return `${name.slice(0, maxLen - 1)}…`;
}

export function estimateYAxisWidth(names: string[]): number {
  const longest = Math.max(...names.map((n) => Math.min(n.length, Y_AXIS_TRUNCATE_AT)), 8);
  return Math.min(Y_AXIS_MAX_WIDTH, Math.max(Y_AXIS_MIN_WIDTH, Math.round(longest * Y_AXIS_CHAR_PX + 20)));
}

export function ResourceYAxisTick({
  x = 0,
  y = 0,
  payload,
  selectedId,
  chartData,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string };
  selectedId: string | null;
  chartData: Array<{ id: string; name: string }>;
}) {
  const name = payload?.value ?? '';
  const entry = chartData.find((d) => d.name === name);
  const isSelected = !!entry && entry.id === selectedId;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-10}
        y={0}
        dy={3}
        textAnchor="end"
        fill={isSelected ? '#0F172A' : '#64748B'}
        fontSize={10}
        fontWeight={isSelected ? 600 : 500}
        style={{ letterSpacing: '0.01em' }}
      >
        {truncateResourceName(name)}
      </text>
      <title>{name}</title>
    </g>
  );
}

export function UtilBarValueLabel({
  x,
  y,
  width,
  height,
  value,
}: {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  value?: number | string;
}) {
  if (x == null || y == null || width == null || height == null || value == null) return null;
  const nx = Number(x);
  const ny = Number(y);
  const nWidth = Number(width);
  const nHeight = Number(height);
  if (!Number.isFinite(nx) || !Number.isFinite(ny)) return null;

  return (
    <text
      x={nx + nWidth + 8}
      y={ny + nHeight / 2}
      dy={4}
      fill="#334155"
      fontSize={11}
      fontWeight={600}
      style={{ pointerEvents: 'none' }}
    >
      {`${fmtPct(Number(value))}%`}
    </text>
  );
}

export type BreakdownSegment<T> = {
  key: keyof T & string;
  label: string;
  color: string;
};

export function PremiumBreakdownNav({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  previousLabel,
  nextLabel,
  badge,
}: {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  previousLabel: string;
  nextLabel: string;
  badge: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="flex items-center overflow-hidden rounded-md border border-[#E2E6EA]">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-none"
          disabled={!hasPrevious}
          onClick={onPrevious}
          aria-label={previousLabel}
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
          aria-label={nextLabel}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      {badge}
    </div>
  );
}

export function computeResourceBarSize(count: number): number {
  if (count <= 2) return 56;
  if (count <= 4) return 48;
  if (count <= 6) return 42;
  if (count <= 10) return 34;
  if (count <= 15) return 28;
  if (count <= 20) return 22;
  if (count <= 28) return 18;
  if (count <= 40) return 14;
  return 10;
}

export function computeCategoryGap(count: number): string {
  if (count > 24) return '6%';
  if (count > 14) return '10%';
  if (count > 8) return '14%';
  return '20%';
}

export function truncateAxisLabel(name: string, maxLen = 18): string {
  if (name.length <= maxLen) return name;
  return `${name.slice(0, maxLen - 1)}…`;
}

export function fmtNum(v: number, digits = 2): string {
  return premiumFmtNum(v, digits, true);
}

export function buildSegmentBreakdown(
  item: object,
  segments: Array<{ key: string; label: string; color: string }>,
) {
  const record = item as Record<string, unknown>;
  const rows = segments.map((seg) => ({
    ...seg,
    value: Number(record[seg.key]) || 0,
  }));
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return rows.map((row) => ({
    ...row,
    pctOfTotal: total > 0 ? (row.value / total) * 100 : 0,
  }));
}

export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  iconClass: string;
}) {
  return (
    <div className={`${premiumCardClass(true)} p-4 min-w-0`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-meta font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground tabular-nums truncate" title={value}>{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={`shrink-0 rounded-lg p-2 ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export function InsightRow({
  icon: Icon,
  iconClass,
  text,
}: {
  icon: React.ElementType;
  iconClass: string;
  text: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className={`shrink-0 rounded-full p-1.5 h-fit ${iconClass}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

export function UtilRiskLegend() {
  return (
    <div className="mt-2 flex flex-wrap gap-2 text-meta text-muted-foreground">
      {[
        { label: '<70%', color: '#16A34A' },
        { label: '70–80%', color: '#84CC16' },
        { label: '80–85%', color: '#F59E0B' },
        { label: '>85%', color: '#EA580C' },
        { label: '>90%', color: '#DC2626' },
      ].map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
