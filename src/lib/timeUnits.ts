/** Time unit codes stored in DB and sent with the model to full-calculate / DLL (via conv1 & conv2). */

export type OpsTimeUnit = 'SEC' | 'MIN' | 'HR';
export type MctTimeUnit = 'MIN' | 'HR' | 'DAY' | 'WEEK';
export type ProdPeriodUnit = 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';

export const OPS_TIME_UNIT_OPTIONS: { value: OpsTimeUnit; label: string }[] = [
  { value: 'SEC', label: 'Seconds' },
  { value: 'MIN', label: 'Minutes' },
  { value: 'HR', label: 'Hours' },
];

export const MCT_TIME_UNIT_OPTIONS: { value: MctTimeUnit; label: string }[] = [
  { value: 'MIN', label: 'Minutes' },
  { value: 'HR', label: 'Hours' },
  { value: 'DAY', label: 'Days' },
  { value: 'WEEK', label: 'Weeks' },
];

export const PROD_PERIOD_UNIT_OPTIONS: { value: ProdPeriodUnit; label: string }[] = [
  { value: 'DAY', label: 'Day' },
  { value: 'WEEK', label: 'Week' },
  { value: 'MONTH', label: 'Month' },
  { value: 'QUARTER', label: 'Quarter' },
  { value: 'YEAR', label: 'Year' },
];

export const UNIT_LABELS: Record<string, string> = {
  SEC: 'seconds',
  MIN: 'minutes',
  HR: 'hours',
  DAY: 'days',
  WEEK: 'weeks',
  MONTH: 'months',
  QUARTER: 'quarters',
  YEAR: 'years',
};

export const UNIT_SINGULAR: Record<string, string> = {
  SEC: 'second',
  MIN: 'minute',
  HR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
};
