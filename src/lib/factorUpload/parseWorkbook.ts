import * as XLSX from 'xlsx';
import {
  OPERATION_HISTORY_COLUMNS,
  OPERATION_HISTORY_SHEET,
  PRODUCT_HISTORY_COLUMNS,
  PRODUCT_HISTORY_SHEET,
  type FactorUploadScope,
  type OperationHistoryRow,
  type ParsedExcelData,
  type ProductHistoryRow,
  type RowStatus,
  type ValidationIssue,
} from './types';

const CHUNK_SIZE = 5000;

export interface SheetStructureError {
  type: 'sheet' | 'column';
  message: string;
}

export function parseWorkbookArrayBuffer(
  buffer: ArrayBuffer,
  scope: FactorUploadScope = 'full'
): {
  structureErrors: SheetStructureError[];
  data: ParsedExcelData | null;
  sheetLevelIssues: ValidationIssue[];
} {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const structureErrors: SheetStructureError[] = [];
  const sheetLevelIssues: ValidationIssue[] = [];

  const needProduct = scope === 'product' || scope === 'full';
  const needOperation = scope === 'operation' || scope === 'full';

  if (needProduct && !wb.SheetNames.some((n) => n.trim() === PRODUCT_HISTORY_SHEET)) {
    structureErrors.push({
      type: 'sheet',
      message: `Missing required sheet: ${PRODUCT_HISTORY_SHEET}`,
    });
  }
  if (needOperation && !wb.SheetNames.some((n) => n.trim() === OPERATION_HISTORY_SHEET)) {
    structureErrors.push({
      type: 'sheet',
      message: `Missing required sheet: ${OPERATION_HISTORY_SHEET}`,
    });
  }

  if (structureErrors.length > 0) {
    return { structureErrors, data: null, sheetLevelIssues };
  }

  let productHistory: ProductHistoryRow[] = [];
  let operationHistory: OperationHistoryRow[] = [];

  if (needProduct) {
    const productSheet = wb.Sheets[PRODUCT_HISTORY_SHEET];
    const productColErrors = validateColumns(
      productSheet,
      PRODUCT_HISTORY_COLUMNS,
      PRODUCT_HISTORY_SHEET
    );
    for (const { sheet, message } of productColErrors) {
      structureErrors.push({ type: 'column', message });
      sheetLevelIssues.push({
        sheet,
        row: 0,
        field: 'Columns',
        value: '',
        message,
        status: 'ERROR',
      });
    }
    if (productColErrors.length === 0) {
      productHistory = parseProductSheet(productSheet);
    }
  }

  if (needOperation) {
    const operationSheet = wb.Sheets[OPERATION_HISTORY_SHEET];
    const operationColErrors = validateColumns(
      operationSheet,
      OPERATION_HISTORY_COLUMNS,
      OPERATION_HISTORY_SHEET
    );
    for (const { sheet, message } of operationColErrors) {
      structureErrors.push({ type: 'column', message });
      sheetLevelIssues.push({
        sheet,
        row: 0,
        field: 'Columns',
        value: '',
        message,
        status: 'ERROR',
      });
    }
    if (operationColErrors.length === 0) {
      operationHistory = parseOperationSheet(operationSheet);
    }
  }

  if (structureErrors.length > 0) {
    return { structureErrors, data: null, sheetLevelIssues };
  }

  return {
    structureErrors: [],
    data: { productHistory, operationHistory },
    sheetLevelIssues,
  };
}

function validateColumns(
  sheet: XLSX.WorkSheet,
  required: readonly string[],
  sheetName: string
): { sheet: string; message: string }[] {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    header: 1,
    defval: '',
    raw: false,
  }) as unknown[][];
  if (rows.length === 0) {
    return [{ sheet: sheetName, message: `${sheetName}: sheet has no header row` }];
  }
  const header = (rows[0] as unknown[]).map((c) => String(c ?? '').trim());
  const missing = required.filter((col) => !header.includes(col));
  if (missing.length === 0) return [];
  return [
    {
      sheet: sheetName,
      message: `${sheetName}: missing required column(s): ${missing.join(', ')}`,
    },
  ];
}

function parseProductSheet(sheet: XLSX.WorkSheet): ProductHistoryRow[] {
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    raw: false,
  });
  return json.map((row, idx) => {
    const rowIndex = idx + 2;
    const product = String(row['Product'] ?? '').trim();
    const date = parseDate(row['Date']);
    const demandQty = parseNumber(row['Demand Qty']);
    const lotSize = parseNumber(row['Lot Size']);
    return {
      product,
      date,
      demandQty,
      lotSize,
      sheet: PRODUCT_HISTORY_SHEET,
      rowIndex,
      status: 'VALID' as RowStatus,
      issues: [] as ValidationIssue[],
    };
  });
}

function parseOperationSheet(sheet: XLSX.WorkSheet): OperationHistoryRow[] {
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    raw: false,
  });
  return json.map((row, idx) => {
    const rowIndex = idx + 2;
    return {
      product: String(row['Product'] ?? '').trim(),
      operation: String(row['Operation'] ?? '').trim(),
      equipment: String(row['Equipment'] ?? '').trim(),
      laborGroup: String(row['Labor Group'] ?? '').trim(),
      date: parseDate(row['Date']),
      equipmentSetupTime: parseNumber(row['Equipment Setup Time']),
      equipmentRunTime: parseNumber(row['Equipment Run Time']),
      laborSetupTime: parseNumber(row['Labor Setup Time']),
      laborRunTime: parseNumber(row['Labor Run Time']),
      sheet: OPERATION_HISTORY_SHEET,
      rowIndex,
      status: 'VALID' as RowStatus,
      issues: [] as ValidationIssue[],
    };
  });
}

export function parseDate(value: unknown): Date | null {
  if (value == null || value === '') return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) return new Date(parsed.y, parsed.m - 1, parsed.d);
  }
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function parseNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** Process rows in chunks (for worker / main thread). */
export async function forEachChunk<T>(
  items: T[],
  chunkSize: number,
  fn: (chunk: T[], startIndex: number) => void | Promise<void>
): Promise<void> {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await fn(chunk, i);
    if (i + chunkSize < items.length) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }
}

export { CHUNK_SIZE };
