import { NonNegativeNumericInput } from '@/components/NonNegativeNumericInput';
import { PureLaborNaField } from '@/components/PureLaborNaField';
import type { EquipmentGroup, Operation } from '@/stores/modelStore';
import {
  isPureLaborOperation,
  PURE_LABOR_OPERATION_EQUIP_TOOLTIP,
  type OperationEquipTimeField,
} from '@/lib/pureLaborOperations';
import { cn } from '@/lib/utils';

type OperationEquipTimeInputProps = {
  op: Operation;
  field: OperationEquipTimeField;
  equipment: EquipmentGroup[];
  value: number;
  onChange: (value: number) => void;
  className?: string;
  inputClassName?: string;
  step?: string | number;
};

export function OperationEquipTimeInput({
  op,
  field: _field,
  equipment,
  value,
  onChange,
  className,
  inputClassName,
  step = '0.1',
}: OperationEquipTimeInputProps) {
  if (isPureLaborOperation(op, equipment)) {
    return <PureLaborNaField className={className} tooltip={PURE_LABOR_OPERATION_EQUIP_TOOLTIP} />;
  }
  return (
    <NonNegativeNumericInput
      allowDecimal
      className={cn('h-8 w-20 font-mono', inputClassName, className)}
      value={value}
      onChange={onChange}
    />
  );
}
