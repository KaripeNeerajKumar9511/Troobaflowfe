import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { createDemoModel } from '@/stores/modelStore';
import { buildMasterCatalog } from '@/lib/factorUpload/masterCatalog';
import { parseWorkbookArrayBuffer } from '@/lib/factorUpload/parseWorkbook';
import { validateParsedData, filterValidRows } from '@/lib/factorUpload/validate';
import { calculateFactors } from '@/lib/factorUpload/calculateFactors';
import { coefficientOfVariation, ratioLatestToAverage } from '@/lib/factorUpload/stats';
import {
  PRODUCT_HISTORY_SHEET,
  OPERATION_HISTORY_SHEET,
} from '@/lib/factorUpload/types';

function buildSampleWorkbook(): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet([
      { Product: 'HUB1', Date: '2024-01-01', 'Demand Qty': 100, 'Lot Size': 40 },
      { Product: 'HUB1', Date: '2024-06-01', 'Demand Qty': 200, 'Lot Size': 50 },
      { Product: 'HUB99', Date: '2024-01-01', 'Demand Qty': 10, 'Lot Size': 5 },
    ]),
    PRODUCT_HISTORY_SHEET
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet([
      {
        Product: 'HUB1',
        Operation: 'OP1',
        Equipment: 'VT_LATHE',
        'Labor Group': 'MACHINST',
        Date: '2024-01-01',
        'Equipment Setup Time': 10,
        'Equipment Run Time': 20,
        'Labor Setup Time': 5,
        'Labor Run Time': 15,
      },
      {
        Product: 'HUB1',
        Operation: 'OP2',
        Equipment: 'CNC99',
        'Labor Group': 'OPERATOR_A',
        Date: '2024-02-01',
        'Equipment Setup Time': 8,
        'Equipment Run Time': 12,
        'Labor Setup Time': 4,
        'Labor Run Time': 8,
      },
    ]),
    OPERATION_HISTORY_SHEET
  );
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
}

describe('factorUpload stats', () => {
  it('computes CV and latest/average ratio', () => {
    expect(coefficientOfVariation([10, 20, 30])).toBeCloseTo(0.4082, 3);
    expect(ratioLatestToAverage([100, 200], 200)).toBeCloseTo(1.3333, 3);
  });
});

describe('factorUpload parse and validate', () => {
  it('parses required sheets and flags unknown master records', async () => {
    const buffer = buildSampleWorkbook();
    const { structureErrors, data } = parseWorkbookArrayBuffer(buffer);
    expect(structureErrors).toHaveLength(0);
    expect(data).not.toBeNull();

    const model = createDemoModel();
    const catalog = buildMasterCatalog(model);
    const result = await validateParsedData(data!, catalog);

    expect(result.summary.rowsProcessed).toBe(5);
    expect(result.errors.some((e) => e.value === 'HUB99')).toBe(true);
    expect(result.errors.some((e) => e.value === 'CNC99')).toBe(true);
    expect(result.summary.productMatching.find((p) => p.name === 'HUB1')?.matched).toBe(true);
  });
});

describe('factorUpload calculateFactors', () => {
  it('only runs on valid rows after filter', async () => {
    const buffer = buildSampleWorkbook();
    const { data } = parseWorkbookArrayBuffer(buffer);
    const model = createDemoModel();
    const catalog = buildMasterCatalog(model);
    const validation = await validateParsedData(data!, catalog);
    const validOnly = filterValidRows(validation.data);
    const factors = calculateFactors(validOnly);

    expect(factors.products.some((p) => p.product === 'HUB1')).toBe(true);
    expect(factors.products.find((p) => p.product === 'HUB99')).toBeUndefined();
    expect(factors.products.find((p) => p.product === 'HUB1')?.demandFactor).toBeGreaterThan(0);
  });
});
