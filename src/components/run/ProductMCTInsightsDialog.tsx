import type { ReactNode } from 'react';
import { AlertTriangle, Info, Sparkles } from 'lucide-react';
import type { ProductResult } from '@/lib/calculationEngine';
import { ChartInsightsPopover } from '@/components/run/ChartInsightsPopover';
import { fmtNum, InsightRow } from '@/components/run/premiumUtilChartShared';

export function ProductMCTInsightsDialog({
  open,
  onOpenChange,
  trigger,
  products,
  overallMct,
  mctUnit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  products: ProductResult[];
  overallMct: number;
  mctUnit: string;
}) {
  const sorted = [...products].sort((a, b) => b.mct - a.mct);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];

  return (
    <ChartInsightsPopover
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={
        <>
          <Sparkles className="h-4 w-4 text-violet-600 shrink-0" />
          Product MCT Insights
        </>
      }
      description="Key patterns from manufacturing cycle time results"
    >
      <InsightRow
        icon={Info}
        iconClass="bg-blue-100 text-blue-700"
        text={
          <>
            Average MCT across {products.length} product{products.length !== 1 ? 's' : ''} is{' '}
            <strong>
              {fmtNum(overallMct)} {mctUnit}
            </strong>
            .
          </>
        }
      />
      {highest && (
        <InsightRow
          icon={AlertTriangle}
          iconClass="bg-amber-100 text-amber-700"
          text={
            <>
              Longest MCT: <strong>{highest.name}</strong> at {fmtNum(highest.mct)} {mctUnit}.
            </>
          }
        />
      )}
      {lowest && products.length > 1 && (
        <InsightRow
          icon={Info}
          iconClass="bg-emerald-100 text-emerald-700"
          text={
            <>
              Shortest MCT: <strong>{lowest.name}</strong> at {fmtNum(lowest.mct)} {mctUnit}.
            </>
          }
        />
      )}
    </ChartInsightsPopover>
  );
}
