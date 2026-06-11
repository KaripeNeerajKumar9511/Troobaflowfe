import type {
  FactorResults,
  FactorUploadScope,
  OperationHistoryRow,
  ParsedExcelData,
  ProductHistoryRow,
} from './types';
import {
  coefficientOfVariation,
  latestByDate,
  mean,
  ratioLatestToAverage,
} from './stats';
import { normalizeKey } from './masterCatalog';

export function calculateFactors(
  data: ParsedExcelData,
  scope: FactorUploadScope = 'full'
): FactorResults {
  const products =
    scope === 'operation'
      ? []
      : [...groupByKey(data.productHistory, (r) => normalizeKey(r.product)).entries()]
          .map(([key, rows]) => computeProductFactors(key, rows))
          .filter((r): r is NonNullable<typeof r> => r != null)
          .sort((a, b) => a.product.localeCompare(b.product));

  const equipment =
    scope === 'product'
      ? []
      : [...groupByKey(
          data.operationHistory.filter((r) => r.equipment),
          (r) => normalizeKey(r.equipment)
        ).entries()]
          .map(([key, rows]) => computeEquipmentFactors(key, rows))
          .filter((r): r is NonNullable<typeof r> => r != null)
          .sort((a, b) => a.equipment.localeCompare(b.equipment));

  const labor =
    scope === 'product'
      ? []
      : [...groupByKey(
          data.operationHistory.filter((r) => r.laborGroup),
          (r) => normalizeKey(r.laborGroup)
        ).entries()]
          .map(([key, rows]) => computeLaborFactors(key, rows))
          .filter((r): r is NonNullable<typeof r> => r != null)
          .sort((a, b) => a.laborGroup.localeCompare(b.laborGroup));

  return { products, equipment, labor };
}

function groupByKey<T>(rows: T[], keyFn: (row: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const k = keyFn(row);
    if (!k) continue;
    const list = map.get(k) ?? [];
    list.push(row);
    map.set(k, list);
  }
  return map;
}

function computeProductFactors(key: string, rows: ProductHistoryRow[]) {
  const demands = rows.map((r) => r.demandQty).filter((v): v is number => v != null);
  const lots = rows.map((r) => r.lotSize).filter((v): v is number => v != null);
  if (demands.length === 0 && lots.length === 0) return null;

  const displayName = rows[0]?.product || key;
  const latestDemand = latestByDate(rows, (r) => r.demandQty);
  const latestLot = latestByDate(rows, (r) => r.lotSize);

  return {
    product: displayName,
    demandFactor: round(ratioLatestToAverage(demands, latestDemand)),
    lotFactor: round(ratioLatestToAverage(lots, latestLot)),
    variabilityFactor: round(coefficientOfVariation(demands)),
    recordCount: rows.length,
  };
}

function computeEquipmentFactors(key: string, rows: OperationHistoryRow[]) {
  const setups = rows
    .map((r) => r.equipmentSetupTime)
    .filter((v): v is number => v != null);
  const runs = rows.map((r) => r.equipmentRunTime).filter((v): v is number => v != null);
  const combined = rows
    .filter((r) => r.equipmentSetupTime != null && r.equipmentRunTime != null)
    .map((r) => r.equipmentSetupTime! + r.equipmentRunTime!);

  if (setups.length === 0 && runs.length === 0) return null;

  const displayName = rows[0]?.equipment || key;
  const latestSetup = latestByDate(rows, (r) => r.equipmentSetupTime);
  const latestRun = latestByDate(rows, (r) => r.equipmentRunTime);

  return {
    equipment: displayName,
    setupFactor: round(ratioLatestToAverage(setups, latestSetup)),
    runFactor: round(ratioLatestToAverage(runs, latestRun)),
    variabilityFactor: round(coefficientOfVariation(combined)),
    recordCount: rows.length,
  };
}

function computeLaborFactors(key: string, rows: OperationHistoryRow[]) {
  const setups = rows.map((r) => r.laborSetupTime).filter((v): v is number => v != null);
  const runs = rows.map((r) => r.laborRunTime).filter((v): v is number => v != null);
  const combined = rows
    .filter((r) => r.laborSetupTime != null && r.laborRunTime != null)
    .map((r) => r.laborSetupTime! + r.laborRunTime!);

  if (setups.length === 0 && runs.length === 0) return null;

  const displayName = rows[0]?.laborGroup || key;
  const latestSetup = latestByDate(rows, (r) => r.laborSetupTime);
  const latestRun = latestByDate(rows, (r) => r.laborRunTime);

  return {
    laborGroup: displayName,
    setupFactor: round(ratioLatestToAverage(setups, latestSetup)),
    runFactor: round(ratioLatestToAverage(runs, latestRun)),
    variabilityFactor: round(coefficientOfVariation(combined)),
    recordCount: rows.length,
  };
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/** Expose mean for tests */
export { mean };
