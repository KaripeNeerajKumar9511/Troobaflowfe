import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type SignedNumericInputProps = {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  allowDecimal?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  disabled?: boolean;
};

function formatDisplay(value: number, allowDecimal: boolean): string {
  if (!Number.isFinite(value)) return '0';
  if (allowDecimal) return String(value);
  return String(Math.trunc(value));
}

export function sanitizeSignedIntegerInput(value: string): string {
  let s = value.replace(/[^0-9-]/g, '');
  if (s.includes('-')) {
    const isNegative = value.startsWith('-');
    s = s.replace(/-/g, '');
    if (isNegative) {
      s = '-' + s;
    }
  }
  return s;
}

export function sanitizeSignedDecimalInput(value: string): string {
  let s = value.replace(/[^0-9.-]/g, '');
  if (s.includes('-')) {
    const isNegative = value.startsWith('-');
    s = s.replace(/-/g, '');
    if (isNegative) {
      s = '-' + s;
    }
  }
  const dot = s.indexOf('.');
  if (dot !== -1) {
    s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '');
  }
  return s;
}

export function parseSignedInt(value: string, fallback = 0): number {
  const s = sanitizeSignedIntegerInput(value);
  if (s === '' || s === '-') return fallback;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function parseSignedFloat(value: string, fallback = 0): number {
  const s = sanitizeSignedDecimalInput(value);
  if (s === '' || s === '-' || s === '.' || s === '-.') return fallback;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}

export function blockSignedNumericKeys(e: React.KeyboardEvent<HTMLInputElement>): void {
  if (e.key === '+' || e.key === 'e' || e.key === 'E') {
    e.preventDefault();
  }
}

export function SignedNumericInput({
  value,
  onChange,
  className,
  allowDecimal = false,
  onBlur,
  onFocus,
  onMouseDown,
  disabled = false,
}: SignedNumericInputProps) {
  const [text, setText] = useState(() => formatDisplay(value, allowDecimal));

  useEffect(() => {
    const currentNum = allowDecimal ? parseSignedFloat(text) : parseSignedInt(text);
    if (value !== currentNum) {
      setText(formatDisplay(value, allowDecimal));
    }
  }, [value, allowDecimal]);

  const commit = (raw: string) => {
    if (disabled) return;
    const cleaned = allowDecimal
      ? sanitizeSignedDecimalInput(raw)
      : sanitizeSignedIntegerInput(raw);
    setText(cleaned);
    if (cleaned === '' || cleaned === '-' || cleaned === '.' || cleaned === '-.') {
      onChange(0);
      return;
    }
    if (allowDecimal && cleaned.endsWith('.')) return;
    onChange(allowDecimal ? parseSignedFloat(cleaned) : parseSignedInt(cleaned));
  };

  return (
    <Input
      type="text"
      inputMode={allowDecimal ? 'decimal' : 'numeric'}
      className={cn(
        'h-8 w-20 font-mono text-right bg-[#F9FAFB]',
        className,
      )}
      value={text}
      disabled={disabled}
      onMouseDown={onMouseDown}
      onChange={(e) => commit(e.target.value)}
      onFocus={() => onFocus?.()}
      onBlur={() => {
        if (disabled) return;
        const n = allowDecimal ? parseSignedFloat(text) : parseSignedInt(text);
        onChange(n);
        setText(formatDisplay(n, allowDecimal));
        onBlur?.();
      }}
      onKeyDown={blockSignedNumericKeys}
    />
  );
}
