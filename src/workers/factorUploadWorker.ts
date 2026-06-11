/// <reference lib="webworker" />
import { parseWorkbookArrayBuffer } from '@/lib/factorUpload/parseWorkbook';
import { calculateFactors } from '@/lib/factorUpload/calculateFactors';
import { filterValidRows, validateParsedData } from '@/lib/factorUpload/validate';
import type { FactorUploadScope, RmctMasterNames } from '@/lib/factorUpload/types';

export type WorkerRequest =
  | {
      type: 'parse_and_validate';
      buffer: ArrayBuffer;
      master: RmctMasterNames;
      scope: FactorUploadScope;
    }
  | {
      type: 'calculate';
      buffer: ArrayBuffer;
      master: RmctMasterNames;
      scope: FactorUploadScope;
    };

export type WorkerResponse =
  | { type: 'progress'; pct: number; stage: string }
  | {
      type: 'parse_complete';
      validation: Awaited<ReturnType<typeof validateParsedData>>;
      structureErrors: string[];
    }
  | { type: 'calculate_complete'; factors: ReturnType<typeof calculateFactors> }
  | { type: 'error'; message: string };

function masterToCatalog(master: RmctMasterNames) {
  const norm = (s: string) => s.trim().toUpperCase();
  return {
    products: new Set(master.products.map(norm)),
    equipment: new Set(master.equipment.map(norm)),
    laborGroups: new Set(master.laborGroups.map(norm)),
  };
}

async function handleParse(
  buffer: ArrayBuffer,
  master: RmctMasterNames,
  scope: FactorUploadScope
) {
  post({ type: 'progress', pct: 5, stage: 'Parsing workbook…' });
  const { structureErrors, data, sheetLevelIssues } = parseWorkbookArrayBuffer(
    buffer,
    scope
  );

  if (structureErrors.length > 0 || !data) {
    post({
      type: 'parse_complete',
      validation: {
        summary: {
          productsFound: 0,
          equipmentFound: 0,
          laborGroupsFound: 0,
          rowsProcessed: 0,
          validRows: 0,
          warnings: 0,
          errors: sheetLevelIssues.length || structureErrors.length,
          productMatching: [],
          equipmentMatching: [],
          laborMatching: [],
        },
        errors: [
          ...sheetLevelIssues,
          ...structureErrors.map((e) => ({
            sheet: 'Workbook',
            row: 0,
            field: e.type === 'sheet' ? 'Sheet' : 'Columns',
            value: '',
            message: e.message,
            status: 'ERROR' as const,
          })),
        ],
        warnings: [],
        data: { productHistory: [], operationHistory: [] },
      },
      structureErrors: structureErrors.map((e) => e.message),
    });
    return;
  }

  post({ type: 'progress', pct: 20, stage: 'Validating rows…' });
  const catalog = masterToCatalog(master);
  const validation = await validateParsedData(data, catalog, (pct) => {
    post({ type: 'progress', pct: 20 + Math.round(pct * 0.75), stage: 'Validating rows…' });
  }, scope);

  post({ type: 'progress', pct: 100, stage: 'Validation complete' });
  post({
    type: 'parse_complete',
    validation,
    structureErrors: [],
  });
}

async function handleCalculate(
  buffer: ArrayBuffer,
  master: RmctMasterNames,
  scope: FactorUploadScope
) {
  post({ type: 'progress', pct: 5, stage: 'Preparing data…' });
  const { data } = parseWorkbookArrayBuffer(buffer, scope);
  if (!data) {
    post({ type: 'error', message: 'Cannot calculate: invalid workbook structure' });
    return;
  }

  const catalog = masterToCatalog(master);
  post({ type: 'progress', pct: 30, stage: 'Re-validating valid rows…' });
  const validation = await validateParsedData(data, catalog, undefined, scope);
  const validOnly = filterValidRows(validation.data);

  post({ type: 'progress', pct: 70, stage: 'Calculating factors…' });
  const factors = calculateFactors(validOnly, scope);

  post({ type: 'progress', pct: 100, stage: 'Complete' });
  post({ type: 'calculate_complete', factors });
}

function post(msg: WorkerResponse) {
  self.postMessage(msg);
}

self.onmessage = async (ev: MessageEvent<WorkerRequest>) => {
  try {
    const req = ev.data;
    if (req.type === 'parse_and_validate') {
      await handleParse(req.buffer, req.master, req.scope);
    } else if (req.type === 'calculate') {
      await handleCalculate(req.buffer, req.master, req.scope);
    }
  } catch (err) {
    post({
      type: 'error',
      message: err instanceof Error ? err.message : 'Worker processing failed',
    });
  }
};
