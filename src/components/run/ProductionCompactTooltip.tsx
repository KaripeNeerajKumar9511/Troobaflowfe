import React from 'react';
import { AlertTriangle, Trash2, Truck, Wrench } from 'lucide-react';

export type ProductionChartRow = {
  name: string;
  shipped: number;
  usedInAssembly: number;
  scrappedInAssembly: number;
  scrapInProduction: number;
  total: number;
};

const PRODUCTION_METRICS: Array<{
  key: keyof Pick<
    ProductionChartRow,
    'shipped' | 'usedInAssembly' | 'scrappedInAssembly' | 'scrapInProduction'
  >;
  label: string;
  icon: React.ElementType;
  rowClass: string;
  iconClass: string;
  labelClass: string;
  valueClass: string;
}> = [
  {
    key: 'shipped',
    label: 'Delivered',
    icon: Truck,
    rowClass: 'bg-blue-50/80',
    iconClass: 'bg-[hsl(217,91%,60%)]',
    labelClass: 'text-[hsl(217,91%,40%)]',
    valueClass: 'border-[hsl(217,91%,60%)] bg-blue-50 text-[hsl(217,91%,35%)]',
  },
  {
    key: 'usedInAssembly',
    label: 'Used in Assembly',
    icon: Wrench,
    rowClass: 'bg-emerald-50/80',
    iconClass: 'bg-[hsl(142,71%,45%)]',
    labelClass: 'text-[hsl(142,71%,30%)]',
    valueClass: 'border-[hsl(142,71%,45%)] bg-emerald-50 text-[hsl(142,55%,28%)]',
  },
  {
    key: 'scrappedInAssembly',
    label: 'Scrapped in Assembly',
    icon: Trash2,
    rowClass: 'bg-amber-50/80',
    iconClass: 'bg-[hsl(38,92%,50%)]',
    labelClass: 'text-[hsl(38,92%,35%)]',
    valueClass: 'border-[hsl(38,92%,50%)] bg-amber-50 text-[hsl(38,80%,32%)]',
  },
  {
    key: 'scrapInProduction',
    label: 'Scrap in Production',
    icon: AlertTriangle,
    rowClass: 'bg-red-50/80',
    iconClass: 'bg-[hsl(0,72%,51%)]',
    labelClass: 'text-[hsl(0,72%,40%)]',
    valueClass: 'border-[hsl(0,72%,51%)] bg-red-50 text-[hsl(0,65%,38%)]',
  },
];

export function ProductionCompactTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: ProductionChartRow }>;
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const row = payload[0].payload;

  return (
    <div className="pointer-events-none min-w-[12.5rem] max-w-[14rem] rounded-lg border border-[#E2E6EA] bg-white px-2.5 py-2 shadow-md">
      <p className="mb-1.5 text-xs font-bold tracking-tight text-[#1e3a5f] font-heading">
        {row.name}
      </p>
      <div className="space-y-1">
        {PRODUCTION_METRICS.map((metric) => {
          const Icon = metric.icon;
          const value = row[metric.key];
          return (
            <div
              key={metric.key}
              className={`flex items-center justify-between gap-1.5 rounded-md px-1.5 py-1 ${metric.rowClass}`}
            >
              <div className="flex min-w-0 items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${metric.iconClass}`}
                >
                  <Icon className="h-2.5 w-2.5 text-white" strokeWidth={2.25} />
                </span>
                <span className={`truncate text-[10px] font-medium leading-tight ${metric.labelClass}`}>
                  {metric.label}
                </span>
              </div>
              <span
                className={`shrink-0 rounded-full border px-1.5 py-px text-[10px] font-semibold tabular-nums ${metric.valueClass}`}
              >
                {value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
