import { useMemo } from 'react';
import type { Model } from '@/stores/modelStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  isPremiumOutputView,
  outputTableFixedClass,
  premiumColStyleForKey,
  premiumFmtNum,
  premiumHeadClass,
  premiumLabelCellClass,
  premiumNameCellClass,
  premiumNumericCellClass,
  premiumRowClass,
  premiumTableWrapperClass,
} from '@/lib/premiumOutputTable';

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

const SUMMARY_COLUMNS = [
  { key: 'productGroup', label: 'Product Group (Dept)', align: 'left' as const },
  { key: 'description', label: 'Description', align: 'left' as const },
  { key: 'eqSetupUtil', label: 'Equip Setup Util', align: 'right' as const },
  { key: 'eqRunUtil', label: 'Equip Run Util', align: 'right' as const },
  { key: 'labSetupUtil', label: 'Labor Setup Util', align: 'right' as const },
  { key: 'labRunUtil', label: 'Labor Run Util', align: 'right' as const },
];

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
  const isPremium = isPremiumOutputView(model);
  const rows = useMemo(
    () => buildProductGroupSummaryRows(metrics, model, description, showTimeUnits),
    [metrics, model, description, showTimeUnits],
  );

  const unitSuffix = showTimeUnits && timeUnitLabel ? ` (${timeUnitLabel})` : ' %';
  const fmtCell = (n: number) => {
    if (!Number.isFinite(n)) return '—';
    return isPremium ? premiumFmtNum(n, 2, true) : (Math.round(n * 100) / 100).toFixed(2);
  };

  if (!metrics.length) return null;

  const columnLabels: Record<string, string> = {
    productGroup: 'Product Group (Dept)',
    description: 'Description',
    eqSetupUtil: `Equip Setup Util${unitSuffix}`,
    eqRunUtil: `Equip Run Util${unitSuffix}`,
    labSetupUtil: `Labor Setup Util${unitSuffix}`,
    labRunUtil: `Labor Run Util${unitSuffix}`,
  };

  return (
    <div className={`mt-6 pt-6 border-t border-[#E2E6EA] ${isPremium ? '' : 'border-border'}`}>
      <h3 className={`mb-3 ${isPremium ? 'text-base font-semibold text-foreground' : 'text-base font-medium'}`}>
        Group/Dept/Area Summary
      </h3>

      <div className={`${isPremium ? outputTableFixedClass() : 'overflow-x-auto'} ${premiumTableWrapperClass(isPremium)}`}>
        <Table className={`${isPremium ? 'w-full table-fixed' : ''} ${premiumTableWrapperClass(isPremium)}`}>
          <TableHeader>
            <TableRow className={premiumRowClass(isPremium)}>
              {SUMMARY_COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className={
                    isPremium
                      ? premiumHeadClass(isPremium, col.align)
                      : `font-mono text-xs ${col.align === 'left' ? 'text-left' : 'text-right'}`
                  }
                  style={premiumColStyleForKey('groupSummary', col.key, isPremium)}
                >
                  {columnLabels[col.key]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.productGroup} className={premiumRowClass(isPremium)}>
                {SUMMARY_COLUMNS.map((col) => {
                  const value = row[col.key as keyof ProductGroupSummaryRow];
                  const isLabelCol = col.key === 'productGroup' || col.key === 'description';
                  return (
                    <TableCell
                      key={col.key}
                      className={
                        isPremium
                          ? isLabelCol
                            ? col.key === 'productGroup'
                              ? premiumNameCellClass(isPremium, true)
                              : premiumLabelCellClass(isPremium)
                            : premiumNumericCellClass(isPremium)
                          : `font-mono text-xs ${col.align === 'right' ? 'text-right' : ''}`
                      }
                      style={premiumColStyleForKey('groupSummary', col.key, isPremium)}
                    >
                      {isLabelCol ? String(value) : fmtCell(value as number)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
