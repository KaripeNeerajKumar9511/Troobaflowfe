import * as XLSX from 'xlsx';
import type { Model } from '@/stores/modelStore';
import type { FactorResults, FactorUploadScope, ValidationIssue } from './types';
import {
  OPERATION_HISTORY_COLUMNS,
  OPERATION_HISTORY_SHEET,
  PRODUCT_HISTORY_COLUMNS,
  PRODUCT_HISTORY_SHEET,
} from './types';

export function downloadValidationReport(
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  const wb = XLSX.utils.book_new();
  const toRows = (issues: ValidationIssue[]) =>
    issues.map((i) => ({
      Sheet: i.sheet,
      Row: i.row,
      Field: i.field,
      Value: i.value,
      Error: i.message,
      Status: i.status,
    }));

  if (errors.length > 0) {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(toRows(errors)),
      'Errors'
    );
  }
  if (warnings.length > 0) {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(toRows(warnings)),
      'Warnings'
    );
  }
  if (errors.length === 0 && warnings.length === 0) {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([{ Message: 'No validation issues' }]),
      'Summary'
    );
  }

  XLSX.writeFile(wb, 'Validation_Report.xlsx');
}

export function downloadFactorsWorkbook(factors: FactorResults): void {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      factors.products.map((p) => ({
        Product: p.product,
        'Demand Factor': p.demandFactor,
        'Lot Factor': p.lotFactor,
        'Variability Factor': p.variabilityFactor,
        'Record Count': p.recordCount,
      }))
    ),
    'Product Factors'
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      factors.equipment.map((e) => ({
        Equipment: e.equipment,
        'Setup Factor': e.setupFactor,
        'Run Factor': e.runFactor,
        'Variability Factor': e.variabilityFactor,
        'Record Count': e.recordCount,
      }))
    ),
    'Equipment Factors'
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      factors.labor.map((l) => ({
        'Labor Group': l.laborGroup,
        'Setup Factor': l.setupFactor,
        'Run Factor': l.runFactor,
        'Variability Factor': l.variabilityFactor,
        'Record Count': l.recordCount,
      }))
    ),
    'Labor Factors'
  );

  XLSX.writeFile(wb, 'Factors.xlsx');
}

/** Empty workbook template with required sheets, columns, and optional example rows from the model. */
export function downloadFactorUploadTemplate(model: Model): void {
  const wb = XLSX.utils.book_new();

  const product = model.products[0];
  const productExampleRow: (string | number)[] = product
    ? [product.name, '2024-01-01', product.demand, product.lot_size]
    : ['', '', '', ''];

  const productSheet = XLSX.utils.aoa_to_sheet([
    [...PRODUCT_HISTORY_COLUMNS],
    productExampleRow,
  ]);
  XLSX.utils.book_append_sheet(wb, productSheet, PRODUCT_HISTORY_SHEET);

  const equipment = model.equipment[0];
  const labor =
    model.labor.find((l) => l.id === equipment?.labor_group_id) ?? model.labor[0];
  const operation = product
    ? model.operations.find((o) => o.product_id === product.id)
    : model.operations[0];

  const operationExampleRow: (string | number)[] = [
    product?.name ?? '',
    operation?.op_name ?? '',
    equipment?.name ?? '',
    labor?.name ?? '',
    '2024-01-01',
    0,
    0,
    0,
    0,
  ];

  const operationSheet = XLSX.utils.aoa_to_sheet([
    [...OPERATION_HISTORY_COLUMNS],
    operationExampleRow,
  ]);
  XLSX.utils.book_append_sheet(wb, operationSheet, OPERATION_HISTORY_SHEET);

  XLSX.writeFile(wb, 'Factor_Upload_Template.xlsx');
}

export interface OperationHistoryTemplateContext {
  product?: string;
  equipment?: string;
  laborGroup?: string;
}

function resolveOperationExampleRow(
  model: Model,
  ctx: OperationHistoryTemplateContext
): (string | number)[] {
  const productName =
    ctx.product ?? model.products.find((p) => p.name)?.name ?? '';
  const product = model.products.find((p) => p.name === productName);
  const operation = product
    ? model.operations.find((o) => o.product_id === product.id)
    : model.operations[0];

  const equipmentName =
    ctx.equipment ??
    model.equipment.find((e) => e.id === operation?.equip_id)?.name ??
    model.equipment[0]?.name ??
    '';

  const equip = model.equipment.find((e) => e.name === equipmentName);
  const laborName =
    ctx.laborGroup ??
    model.labor.find((l) => l.id === equip?.labor_group_id)?.name ??
    model.labor[0]?.name ??
    '';

  return [
    productName,
    operation?.op_name ?? '',
    equipmentName,
    laborName,
    '2024-01-01',
    0,
    0,
    0,
    0,
  ];
}

/** Template for table header upload (product or operation scope). */
export function downloadScopedFactorTemplate(model: Model, scope: FactorUploadScope): void {
  if (scope === 'product') {
    const wb = XLSX.utils.book_new();
    const product = model.products[0];
    const row: (string | number)[] = product
      ? [product.name, '2024-01-01', product.demand, product.lot_size]
      : ['', '', '', ''];
    const sheet = XLSX.utils.aoa_to_sheet([[...PRODUCT_HISTORY_COLUMNS], row]);
    XLSX.utils.book_append_sheet(wb, sheet, PRODUCT_HISTORY_SHEET);
    XLSX.writeFile(wb, 'Product_History_Template.xlsx');
    return;
  }

  if (scope === 'operation') {
    const wb = XLSX.utils.book_new();
    const row = resolveOperationExampleRow(model, {});
    const sheet = XLSX.utils.aoa_to_sheet([[...OPERATION_HISTORY_COLUMNS], row]);
    XLSX.utils.book_append_sheet(wb, sheet, OPERATION_HISTORY_SHEET);
    XLSX.writeFile(wb, 'Operation_History_Template.xlsx');
    return;
  }

  downloadFactorUploadTemplate(model);
}

/** Single-sheet workbook: Product History only. */
export function downloadProductHistorySheet(model: Model, productName: string): void {
  const wb = XLSX.utils.book_new();
  const product = model.products.find((p) => p.name === productName);
  const row: (string | number)[] = product
    ? [product.name, '2024-01-01', product.demand, product.lot_size]
    : [productName, '2024-01-01', 0, 0];

  const sheet = XLSX.utils.aoa_to_sheet([[...PRODUCT_HISTORY_COLUMNS], row]);
  XLSX.utils.book_append_sheet(wb, sheet, PRODUCT_HISTORY_SHEET);
  const safe = productName.replace(/[^\w.-]+/g, '_');
  XLSX.writeFile(wb, `Product_History_${safe}.xlsx`);
}

/** Single-sheet workbook: Operation History only (labor or equipment context). */
export function downloadOperationHistorySheet(
  model: Model,
  ctx: OperationHistoryTemplateContext
): void {
  const wb = XLSX.utils.book_new();
  const row = resolveOperationExampleRow(model, ctx);
  const sheet = XLSX.utils.aoa_to_sheet([[...OPERATION_HISTORY_COLUMNS], row]);
  XLSX.utils.book_append_sheet(wb, sheet, OPERATION_HISTORY_SHEET);

  const label = ctx.laborGroup ?? ctx.equipment ?? ctx.product ?? 'History';
  const safe = label.replace(/[^\w.-]+/g, '_');
  XLSX.writeFile(wb, `Operation_History_${safe}.xlsx`);
}
