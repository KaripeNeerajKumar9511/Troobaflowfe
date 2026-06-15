import type { ReactNode } from 'react';
import { AlertTriangle, Info, Sparkles } from 'lucide-react';
import type { LaborResult } from '@/lib/calculationEngine';
import { ChartInsightsPopover } from '@/components/run/ChartInsightsPopover';
import { fmtPct, InsightRow } from '@/components/run/premiumUtilChartShared';
import { getUtilizationQueueRisk } from '@/lib/utilizationRisk';

export function LaborUtilInsightsDialog({
  open,
  onOpenChange,
  trigger,
  labor,
  overallUtil,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  labor: LaborResult[];
  overallUtil: number;
}) {
  const sorted = [...labor].sort((a, b) => b.totalUtil - a.totalUtil);
  const highest = sorted[0];
  const chaosCount = labor.filter((l) => l.totalUtil > 90).length;
  const highRiskCount = labor.filter((l) => l.totalUtil > 85).length;

  return (
    <ChartInsightsPopover
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={
        <>
          <Sparkles className="h-4 w-4 text-violet-600 shrink-0" />
          Labor Insights
        </>
      }
      description="Key patterns from labor utilization results"
    >
      <InsightRow
        icon={Info}
        iconClass="bg-blue-100 text-blue-700"
        text={
          <>
            Average utilization across {labor.length} labor group
            {labor.length !== 1 ? 's' : ''} is <strong>{fmtPct(overallUtil)}%</strong> (
            {getUtilizationQueueRisk(overallUtil)}).
          </>
        }
      />
      {highest && (
        <InsightRow
          icon={AlertTriangle}
          iconClass="bg-amber-100 text-amber-700"
          text={
            <>
              Highest utilization: <strong>{highest.name}</strong> at {fmtPct(highest.totalUtil)}% (
              {getUtilizationQueueRisk(highest.totalUtil)}).
            </>
          }
        />
      )}
      {chaosCount > 0 && (
        <InsightRow
          icon={AlertTriangle}
          iconClass="bg-red-100 text-red-700"
          text={
            <>
              {chaosCount} labor group{chaosCount !== 1 ? 's are' : ' is'} in the chaos zone
              (&gt;90% utilization).
            </>
          }
        />
      )}
      {highRiskCount > 0 && chaosCount === 0 && (
        <InsightRow
          icon={AlertTriangle}
          iconClass="bg-orange-100 text-orange-700"
          text={
            <>
              {highRiskCount} labor group{highRiskCount !== 1 ? 's are' : ' is'} above 85%
              utilization.
            </>
          }
        />
      )}
    </ChartInsightsPopover>
  );
}
