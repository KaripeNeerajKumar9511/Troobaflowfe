import { AlertTriangle, Info, Sparkles } from 'lucide-react';
import type { ProductResult } from '@/lib/calculationEngine';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { fmtNum, InsightRow } from '@/components/run/premiumUtilChartShared';

export function ProductMCTInsightsDialog({
  open,
  onOpenChange,
  products,
  overallMct,
  mctUnit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ProductResult[];
  overallMct: number;
  mctUnit: string;
}) {
  const sorted = [...products].sort((a, b) => b.mct - a.mct);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <Sparkles className="h-4 w-4 text-violet-600" />
            Product MCT Insights
          </DialogTitle>
          <DialogDescription>Key patterns from manufacturing cycle time results</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
