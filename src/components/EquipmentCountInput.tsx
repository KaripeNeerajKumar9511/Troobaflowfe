import { Input } from '@/components/ui/input';
import { NonNegativeNumericInput } from '@/components/NonNegativeNumericInput';
import type { EquipmentGroup } from '@/stores/modelStore';

type EquipmentCountInputProps = {
  equipType: EquipmentGroup['equip_type'];
  count: number;
  onChange: (count: number) => void;
  className?: string;
};

/** Count for delay equipment is stored as -1 for the engine; UI shows "NA" instead. Pure labor uses a normal count input. */
export function EquipmentCountInput({ equipType, count, onChange, className }: EquipmentCountInputProps) {
  if (equipType === 'delay') {
    return (
      <Input
        type="text"
        disabled
        aria-label="Count not applicable for delay equipment"
        className={className}
        value="NA"
      />
    );
  }

  return (
    <NonNegativeNumericInput className={className} value={count} onChange={onChange} />
  );
}
