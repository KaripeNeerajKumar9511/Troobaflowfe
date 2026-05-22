import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

/** Strip everything except digits (non-negative integers while typing). */
export function sanitizeNonNegativeIntegerInput(value: string): string {
  return value.replace(/\D/g, '');
}

/** Strip invalid chars; keep at most one decimal point; no minus sign. */
export function sanitizeNonNegativeDecimalInput(value: string): string {
  let s = value.replace(/[^0-9.]/g, '');
  const dot = s.indexOf('.');
  if (dot !== -1) {
    s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '');
  }
  return s;
}

export function parseNonNegativeInt(value: string, fallback = 0): number {
  const s = sanitizeNonNegativeIntegerInput(value);
  if (s === '') return fallback;
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function parseNonNegativeFloat(value: string, fallback = 0): number {
  const s = sanitizeNonNegativeDecimalInput(value);
  if (s === '' || s === '.') return fallback;
  const n = parseFloat(s);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function blockSignedNumericKeys(e: ReactKeyboardEvent<HTMLInputElement>): void {
  if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
    e.preventDefault();
  }
}
