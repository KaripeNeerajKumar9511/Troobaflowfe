import { NonNegativeNumericInput } from '@/components/NonNegativeNumericInput';
import { displayTbatchSize, parseTbatchSizeInput } from '@/lib/productTbatchSize';

type ProductTbatchInputProps = {
  tbatchSize: number;
  onChange: (tbatchSize: number) => void;
  className?: string;
};

/** TBatch defaults to -1 (lot size) in DB; UI shows 0 until the user enters a positive value. */
export function ProductTbatchInput({ tbatchSize, onChange, className }: ProductTbatchInputProps) {
  return (
    <NonNegativeNumericInput
      className={className}
      value={displayTbatchSize(tbatchSize)}
      onChange={(v) => onChange(parseTbatchSizeInput(v))}
    />
  );
}
