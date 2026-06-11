import {
  OPERATION_HISTORY_SHEET,
  PRODUCT_HISTORY_SHEET,
  type MasterCatalog,
  type MatchingEntry,
  type OperationHistoryRow,
  type ParsedExcelData,
  type ProductHistoryRow,
  type RowStatus,
  type ValidationIssue,
  type ValidationResult,
  type ValidationSummary,
  type FactorUploadScope,
} from './types';
import { isInCatalog, normalizeKey } from './masterCatalog';
import { CHUNK_SIZE, forEachChunk } from './parseWorkbook';
import { median } from './stats';

const HIGH_TIME_MULTIPLIER = 5;
const HIGH_TIME_ABSOLUTE = 10000;
const OUTLIER_SIGMA = 3;

export async function validateParsedData(
  data: ParsedExcelData,
  catalog: MasterCatalog,
  onProgress?: (pct: number) => void,
  scope: FactorUploadScope = 'full'
): Promise<ValidationResult> {
  const productDupKeys = new Map<string, number[]>();
  const operationDupKeys = new Map<string, number[]>();

  const equipSetupMed = median(
    data.operationHistory
      .map((r) => r.equipmentSetupTime)
      .filter((v): v is number => v != null)
  );
  const equipRunMed = median(
    data.operationHistory
      .map((r) => r.equipmentRunTime)
      .filter((v): v is number => v != null)
  );
  const laborSetupMed = median(
    data.operationHistory
      .map((r) => r.laborSetupTime)
      .filter((v): v is number => v != null)
  );
  const laborRunMed = median(
    data.operationHistory
      .map((r) => r.laborRunTime)
      .filter((v): v is number => v != null)
  );

  const totalRows =
    (scope === 'product' || scope === 'full' ? data.productHistory.length : 0) +
    (scope === 'operation' || scope === 'full' ? data.operationHistory.length : 0);
  let processed = 0;

  if (scope === 'product' || scope === 'full') {
    await forEachChunk(data.productHistory, CHUNK_SIZE, (chunk) => {
      for (const row of chunk) {
        validateProductRow(row, catalog, productDupKeys);
        processed++;
      }
      if (totalRows > 0) onProgress?.(Math.round((processed / totalRows) * 100));
    });
    detectDuplicateWarnings(data.productHistory, productDupKeys);
  }

  if (scope === 'operation' || scope === 'full') {
    await forEachChunk(data.operationHistory, CHUNK_SIZE, (chunk) => {
      for (const row of chunk) {
        validateOperationRow(row, catalog, operationDupKeys, {
          equipSetupMed,
          equipRunMed,
          laborSetupMed,
          laborRunMed,
        });
        processed++;
      }
      if (totalRows > 0) onProgress?.(Math.round((processed / totalRows) * 100));
    });
    detectDuplicateWarnings(data.operationHistory, operationDupKeys);
    applyOutlierWarnings(data.operationHistory);
  }

  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const rowsToScan =
    scope === 'product'
      ? data.productHistory
      : scope === 'operation'
        ? data.operationHistory
        : [...data.productHistory, ...data.operationHistory];

  for (const row of rowsToScan) {
    for (const issue of row.issues) {
      if (issue.status === 'ERROR') errors.push(issue);
      else warnings.push(issue);
    }
  }

  const summary = buildSummary(data, catalog, scope);

  return { summary, errors, warnings, data };
}

function validateProductRow(
  row: ProductHistoryRow,
  catalog: MasterCatalog,
  dupKeys: Map<string, number[]>
): void {
  const issues: ValidationIssue[] = [];

  if (!row.product) {
    issues.push(issue(PRODUCT_HISTORY_SHEET, row.rowIndex, 'Product', '', 'Product is required'));
  } else if (!isInCatalog(catalog.products, row.product)) {
    issues.push(
      issue(
        PRODUCT_HISTORY_SHEET,
        row.rowIndex,
        'Product',
        row.product,
        'Product not found in RMCT model'
      )
    );
  }

  if (row.date == null) {
    issues.push(issue(PRODUCT_HISTORY_SHEET, row.rowIndex, 'Date', '', 'Invalid date'));
  }

  if (row.demandQty == null) {
    issues.push(issue(PRODUCT_HISTORY_SHEET, row.rowIndex, 'Demand Qty', '', 'Invalid numeric value'));
  } else if (row.demandQty < 0) {
    issues.push(issue(PRODUCT_HISTORY_SHEET, row.rowIndex, 'Demand Qty', String(row.demandQty), 'Negative value'));
  }

  if (row.lotSize == null) {
    issues.push(issue(PRODUCT_HISTORY_SHEET, row.rowIndex, 'Lot Size', '', 'Invalid numeric value'));
  } else if (row.lotSize < 0) {
    issues.push(issue(PRODUCT_HISTORY_SHEET, row.rowIndex, 'Lot Size', String(row.lotSize), 'Negative value'));
  }

  trackDuplicate(dupKeys, productRowKey(row), row.rowIndex);
  row.issues = issues;
  row.status = rowStatus(issues);
}

function validateOperationRow(
  row: OperationHistoryRow,
  catalog: MasterCatalog,
  dupKeys: Map<string, number[]>,
  medians: {
    equipSetupMed: number;
    equipRunMed: number;
    laborSetupMed: number;
    laborRunMed: number;
  }
): void {
  const issues: ValidationIssue[] = [];

  if (!row.product) {
    issues.push(issue(OPERATION_HISTORY_SHEET, row.rowIndex, 'Product', '', 'Product is required'));
  } else if (!isInCatalog(catalog.products, row.product)) {
    issues.push(
      issue(
        OPERATION_HISTORY_SHEET,
        row.rowIndex,
        'Product',
        row.product,
        'Product not found in RMCT model'
      )
    );
  }

  if (!row.equipment) {
    issues.push(issue(OPERATION_HISTORY_SHEET, row.rowIndex, 'Equipment', '', 'Equipment is required'));
  } else if (!isInCatalog(catalog.equipment, row.equipment)) {
    issues.push(
      issue(
        OPERATION_HISTORY_SHEET,
        row.rowIndex,
        'Equipment',
        row.equipment,
        'Equipment not found in RMCT model'
      )
    );
  }

  if (!row.laborGroup) {
    issues.push(issue(OPERATION_HISTORY_SHEET, row.rowIndex, 'Labor Group', '', 'Labor Group is required'));
  } else if (!isInCatalog(catalog.laborGroups, row.laborGroup)) {
    issues.push(
      issue(
        OPERATION_HISTORY_SHEET,
        row.rowIndex,
        'Labor Group',
        row.laborGroup,
        'Labor Group not found in RMCT model'
      )
    );
  }

  if (row.date == null) {
    issues.push(issue(OPERATION_HISTORY_SHEET, row.rowIndex, 'Date', '', 'Invalid date'));
  }

  const timeFields: { key: keyof OperationHistoryRow; label: string; med: number }[] = [
    { key: 'equipmentSetupTime', label: 'Equipment Setup Time', med: medians.equipSetupMed },
    { key: 'equipmentRunTime', label: 'Equipment Run Time', med: medians.equipRunMed },
    { key: 'laborSetupTime', label: 'Labor Setup Time', med: medians.laborSetupMed },
    { key: 'laborRunTime', label: 'Labor Run Time', med: medians.laborRunMed },
  ];

  for (const { key, label, med } of timeFields) {
    const val = row[key] as number | null;
    if (val == null) {
      issues.push(issue(OPERATION_HISTORY_SHEET, row.rowIndex, label, '', 'Invalid numeric value'));
    } else if (val < 0) {
      issues.push(issue(OPERATION_HISTORY_SHEET, row.rowIndex, label, String(val), 'Negative time'));
    } else if (isVeryHighTime(val, med)) {
      issues.push(
        warn(OPERATION_HISTORY_SHEET, row.rowIndex, label, String(val), `Very high ${label.toLowerCase()}`)
      );
    }
  }

  trackDuplicate(dupKeys, operationRowKey(row), row.rowIndex);
  row.issues = issues;
  row.status = rowStatus(issues);
}

function isVeryHighTime(value: number, sheetMedian: number): boolean {
  if (value >= HIGH_TIME_ABSOLUTE) return true;
  if (sheetMedian > 0 && value > sheetMedian * HIGH_TIME_MULTIPLIER) return true;
  return false;
}

function applyOutlierWarnings(rows: OperationHistoryRow[]): void {
  const totals = rows
    .map((r) => {
      if (
        r.equipmentSetupTime == null ||
        r.equipmentRunTime == null ||
        r.status === 'ERROR'
      ) {
        return null;
      }
      return r.equipmentSetupTime + r.equipmentRunTime;
    })
    .filter((v): v is number => v != null);

  if (totals.length < 10) return;

  const m = totals.reduce((a, b) => a + b, 0) / totals.length;
  const variance = totals.reduce((acc, v) => acc + (v - m) ** 2, 0) / totals.length;
  const sd = Math.sqrt(variance);
  if (sd === 0) return;

  for (const row of rows) {
    if (row.status === 'ERROR') continue;
    if (row.equipmentSetupTime == null || row.equipmentRunTime == null) continue;
    const total = row.equipmentSetupTime + row.equipmentRunTime;
    if (Math.abs(total - m) > OUTLIER_SIGMA * sd) {
      row.issues.push(
        warn(
          OPERATION_HISTORY_SHEET,
          row.rowIndex,
          'Equipment Time',
          String(total),
          'Outlier detected (equipment setup + run time)'
        )
      );
      row.status = rowStatus(row.issues);
    }
  }
}

function detectDuplicateWarnings(
  rows: (ProductHistoryRow | OperationHistoryRow)[],
  dupMap: Map<string, number[]>
): void {
  for (const [, indices] of dupMap) {
    if (indices.length < 2) continue;
    for (const rowIndex of indices) {
      const row = rows.find((r) => r.rowIndex === rowIndex);
      if (!row || row.status === 'ERROR') continue;
      row.issues.push(
        warn(row.sheet, rowIndex, 'Row', '', 'Duplicate row detected')
      );
      row.status = rowStatus(row.issues);
    }
  }
}

function trackDuplicate(map: Map<string, number[]>, key: string, rowIndex: number): void {
  const list = map.get(key) ?? [];
  list.push(rowIndex);
  map.set(key, list);
}

function productRowKey(row: ProductHistoryRow): string {
  return [
    row.product,
    row.date?.toISOString() ?? '',
    row.demandQty ?? '',
    row.lotSize ?? '',
  ].join('|');
}

function operationRowKey(row: OperationHistoryRow): string {
  return [
    row.product,
    row.operation,
    row.equipment,
    row.laborGroup,
    row.date?.toISOString() ?? '',
    row.equipmentSetupTime ?? '',
    row.equipmentRunTime ?? '',
    row.laborSetupTime ?? '',
    row.laborRunTime ?? '',
  ].join('|');
}

function buildSummary(
  data: ParsedExcelData,
  catalog: MasterCatalog,
  scope: FactorUploadScope = 'full'
): ValidationSummary {
  const allRows =
    scope === 'product'
      ? data.productHistory
      : scope === 'operation'
        ? data.operationHistory
        : [...data.productHistory, ...data.operationHistory];
  const productsInExcel = new Set<string>();
  const equipmentInExcel = new Set<string>();
  const laborInExcel = new Set<string>();

  for (const r of data.productHistory) {
    if (r.product) productsInExcel.add(r.product);
  }
  for (const r of data.operationHistory) {
    if (r.product) productsInExcel.add(r.product);
    if (r.equipment) equipmentInExcel.add(r.equipment);
    if (r.laborGroup) laborInExcel.add(r.laborGroup);
  }

  const productMatching = [...productsInExcel]
    .sort((a, b) => a.localeCompare(b))
    .map((name): MatchingEntry => ({
      name,
      matched: isInCatalog(catalog.products, name),
    }));

  const equipmentMatching = [...equipmentInExcel]
    .sort((a, b) => a.localeCompare(b))
    .map((name): MatchingEntry => ({
      name,
      matched: isInCatalog(catalog.equipment, name),
    }));

  const laborMatching = [...laborInExcel]
    .sort((a, b) => a.localeCompare(b))
    .map((name): MatchingEntry => ({
      name,
      matched: isInCatalog(catalog.laborGroups, name),
    }));

  let validRows = 0;
  let warnings = 0;
  let errors = 0;

  for (const row of allRows) {
    if (row.status === 'VALID') validRows++;
    else if (row.status === 'WARNING') {
      warnings++;
      validRows++;
    } else errors++;
  }

  return {
    productsFound: productsInExcel.size,
    equipmentFound: equipmentInExcel.size,
    laborGroupsFound: laborInExcel.size,
    rowsProcessed: allRows.length,
    validRows,
    warnings,
    errors,
    productMatching,
    equipmentMatching,
    laborMatching,
  };
}

function issue(
  sheet: string,
  row: number,
  field: string,
  value: string,
  message: string
): ValidationIssue {
  return { sheet, row, field, value, message, status: 'ERROR' };
}

function warn(
  sheet: string,
  row: number,
  field: string,
  value: string,
  message: string
): ValidationIssue {
  return { sheet, row, field, value, message, status: 'WARNING' };
}

function rowStatus(issues: ValidationIssue[]): RowStatus {
  if (issues.some((i) => i.status === 'ERROR')) return 'ERROR';
  if (issues.some((i) => i.status === 'WARNING')) return 'WARNING';
  return 'VALID';
}

export function filterValidRows(data: ParsedExcelData): ParsedExcelData {
  return {
    productHistory: data.productHistory.filter((r) => r.status !== 'ERROR'),
    operationHistory: data.operationHistory.filter((r) => r.status !== 'ERROR'),
  };
}

export function displayNameFromKey(catalogNames: string[], excelName: string): string {
  const key = normalizeKey(excelName);
  return catalogNames.find((n) => normalizeKey(n) === key) ?? excelName;
}
