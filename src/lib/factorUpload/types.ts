export const PRODUCT_HISTORY_SHEET = 'Product History';
export const OPERATION_HISTORY_SHEET = 'Operation History';

export const REQUIRED_SHEETS = [PRODUCT_HISTORY_SHEET, OPERATION_HISTORY_SHEET] as const;

export const PRODUCT_HISTORY_COLUMNS = [
  'Product',
  'Date',
  'Demand Qty',
  'Lot Size',
] as const;

export const OPERATION_HISTORY_COLUMNS = [
  'Product',
  'Operation',
  'Equipment',
  'Labor Group',
  'Date',
  'Equipment Setup Time',
  'Equipment Run Time',
  'Labor Setup Time',
  'Labor Run Time',
] as const;

export type RowStatus = 'VALID' | 'WARNING' | 'ERROR';

export interface ValidationIssue {
  sheet: string;
  row: number;
  field: string;
  value: string;
  message: string;
  status: 'ERROR' | 'WARNING';
}

export interface ProductHistoryRow {
  product: string;
  date: Date | null;
  demandQty: number | null;
  lotSize: number | null;
  sheet: typeof PRODUCT_HISTORY_SHEET;
  rowIndex: number;
  status: RowStatus;
  issues: ValidationIssue[];
}

export interface OperationHistoryRow {
  product: string;
  operation: string;
  equipment: string;
  laborGroup: string;
  date: Date | null;
  equipmentSetupTime: number | null;
  equipmentRunTime: number | null;
  laborSetupTime: number | null;
  laborRunTime: number | null;
  sheet: typeof OPERATION_HISTORY_SHEET;
  rowIndex: number;
  status: RowStatus;
  issues: ValidationIssue[];
}

export type ParsedExcelData = {
  productHistory: ProductHistoryRow[];
  operationHistory: OperationHistoryRow[];
};

export interface MasterCatalog {
  products: Set<string>;
  equipment: Set<string>;
  laborGroups: Set<string>;
}

export interface MatchingEntry {
  name: string;
  matched: boolean;
}

export interface ValidationSummary {
  productsFound: number;
  equipmentFound: number;
  laborGroupsFound: number;
  rowsProcessed: number;
  validRows: number;
  warnings: number;
  errors: number;
  productMatching: MatchingEntry[];
  equipmentMatching: MatchingEntry[];
  laborMatching: MatchingEntry[];
}

export interface ValidationResult {
  summary: ValidationSummary;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  data: ParsedExcelData;
}

export interface ProductFactorRow {
  product: string;
  demandFactor: number;
  lotFactor: number;
  variabilityFactor: number;
  recordCount: number;
}

export interface EquipmentFactorRow {
  equipment: string;
  setupFactor: number;
  runFactor: number;
  variabilityFactor: number;
  recordCount: number;
}

export interface LaborFactorRow {
  laborGroup: string;
  setupFactor: number;
  runFactor: number;
  variabilityFactor: number;
  recordCount: number;
}

export interface FactorResults {
  products: ProductFactorRow[];
  equipment: EquipmentFactorRow[];
  labor: LaborFactorRow[];
}

export type FactorUploadPhase =
  | 'idle'
  | 'parsing'
  | 'preview'
  | 'calculating'
  | 'complete';

/** product | operation = single sheet; full = both sheets (Factor Upload page). */
export type FactorUploadScope = 'product' | 'operation' | 'full';

export interface RmctMasterNames {
  products: string[];
  equipment: string[];
  laborGroups: string[];
}
