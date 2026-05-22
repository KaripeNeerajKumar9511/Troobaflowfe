import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  blockSignedNumericKeys,
  parseNonNegativeFloat,
  parseNonNegativeInt,
  sanitizeNonNegativeDecimalInput,
  sanitizeNonNegativeIntegerInput,
} from '@/lib/numericInput';

type NonNegativeNumericInputProps = {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  /** When true, allows digits and a single decimal point (still non-negative). */
  allowDecimal?: boolean;
  onBlur?: () => void;
};

function formatDisplay(value: number, allowDecimal: boolean): string {
  if (!Number.isFinite(value)) return '0';
  if (allowDecimal) return String(value);
  return String(Math.trunc(value));
}

export function NonNegativeNumericInput({
  value,
  onChange,
  className,
  allowDecimal = false,
  onBlur,
}: NonNegativeNumericInputProps) {
  const [text, setText] = useState(() => formatDisplay(value, allowDecimal));

  useEffect(() => {
    setText(formatDisplay(value, allowDecimal));
  }, [value, allowDecimal]);

  const commit = (raw: string) => {
    const cleaned = allowDecimal
      ? sanitizeNonNegativeDecimalInput(raw)
      : sanitizeNonNegativeIntegerInput(raw);
    setText(cleaned);
    if (cleaned === '' || cleaned === '.') {
      onChange(0);
      return;
    }
    if (allowDecimal && cleaned.endsWith('.')) return;
    onChange(allowDecimal ? parseNonNegativeFloat(cleaned) : parseNonNegativeInt(cleaned));
  };

  return (
    <Input
      type="text"
      inputMode={allowDecimal ? 'decimal' : 'numeric'}
      className={cn(
        // Match legacy type="number" table inputs (h-8 w-20); callers can override via className.
        'h-8 w-20 font-mono text-right bg-[#F9FAFB]',
        className,
      )}
      value={text}
      onChange={(e) => commit(e.target.value)}
      onBlur={() => {
        const n = allowDecimal ? parseNonNegativeFloat(text) : parseNonNegativeInt(text);
        onChange(n);
        setText(formatDisplay(n, allowDecimal));
        onBlur?.();
      }}
      onKeyDown={blockSignedNumericKeys}
    />
  );
}
