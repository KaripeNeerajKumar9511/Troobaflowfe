import { useMemo } from 'react';
import type { Model } from '@/stores/modelStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CardDescription, CardTitle } from '../ui/card';

export interface OperMetricForSummary {
  productId: string;
  eqSetupUtil: number;
  eqRunUtil: number;
  labSetupUtil: number;
  labRunUtil: number;
  eqSetupTime?: number;
  eqRunTime?: number;
  labSetupTime?: number;
  labRunTime?: number;
}

export interface ProductGroupSummaryRow {
  productGroup: string;
  description: string;
  eqSetupUtil: number;
  eqRunUtil: number;
  labSetupUtil: number;
  labRunUtil: number;
}

export function buildProductGroupSummaryRows(
  metrics: OperMetricForSummary[],
  model: Model,
  description: string,
  showTimeUnits: boolean,
): ProductGroupSummaryRow[] {
  const groups = new Map<string, ProductGroupSummaryRow>();

  for (const m of metrics) {
    const prod = model.products.find((p) => p.id === m.productId);
    const group = (prod?.dept_code || '').trim() || '(none)';
    const row = groups.get(group) ?? {
      productGroup: group,
      description,
      eqSetupUtil: 0,
      eqRunUtil: 0,
      labSetupUtil: 0,
      labRunUtil: 0,
    };

    if (showTimeUnits) {
      row.eqSetupUtil += m.eqSetupTime ?? 0;
      row.eqRunUtil += m.eqRunTime ?? 0;
      row.labSetupUtil += m.labSetupTime ?? 0;
      row.labRunUtil += m.labRunTime ?? 0;
    } else {
      row.eqSetupUtil += m.eqSetupUtil;
      row.eqRunUtil += m.eqRunUtil;
      row.labSetupUtil += m.labSetupUtil;
      row.labRunUtil += m.labRunUtil;
    }
    groups.set(group, row);
  }

  return Array.from(groups.values()).sort((a, b) => a.productGroup.localeCompare(b.productGroup));
}

function fmtCell(n: number) {
  return Number.isFinite(n) ? (Math.round(n * 100) / 100).toFixed(2) : '—';
}

interface ProductGroupSummaryTableProps {
  metrics: OperMetricForSummary[];
  model: Model;
  description?: string;
  showTimeUnits?: boolean;
  timeUnitLabel?: string;
}

export function ProductGroupSummaryTable({
  metrics,
  model,
  description = 'Basecase',
  showTimeUnits = false,
  timeUnitLabel = '',
}: ProductGroupSummaryTableProps) {
  const rows = useMemo(
    () => buildProductGroupSummaryRows(metrics, model, description, showTimeUnits),
    [metrics, model, description, showTimeUnits],
  );

  const unitSuffix = showTimeUnits && timeUnitLabel ? ` (${timeUnitLabel})` : ' %';

  if (!metrics.length) return null;

  return (
    <div className="mt-6 pt-6 border-t border-border">
      <CardTitle className="text-base mb-3">Group/Dept/Area Summary</CardTitle>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-mono text-xs text-left">Product Group (Dept)</TableHead>
              <TableHead className="font-mono text-xs text-left">Description</TableHead>
              <TableHead className="font-mono text-xs text-right">Equip Setup Util{unitSuffix}</TableHead>
              <TableHead className="font-mono text-xs text-right">Equip Run Util{unitSuffix}</TableHead>
              <TableHead className="font-mono text-xs text-right">Labor Setup Util{unitSuffix}</TableHead>
              <TableHead className="font-mono text-xs text-right">Labor Run Util{unitSuffix}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.productGroup}>
                <TableCell className="font-mono text-xs">{row.productGroup}</TableCell>
                <TableCell className="font-mono text-xs">{row.description}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtCell(row.eqSetupUtil)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtCell(row.eqRunUtil)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtCell(row.labSetupUtil)}</TableCell>
                <TableCell className="font-mono text-xs text-right">{fmtCell(row.labRunUtil)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <CardDescription className="text-xs text-muted-foreground mt-3"></CardDescription>
      </div>
    </div>
  );
}
