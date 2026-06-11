import { Switch } from '@/components/ui/switch';

type PureLaborToggleProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  laborName: string;
};

/** Pure labor on/off control (same Switch as other labor columns). */
export function PureLaborToggle({ checked, onCheckedChange, laborName }: PureLaborToggleProps) {
  return (
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={`Pure labor for ${laborName}`}
    />
  );
}

/** @deprecated Use PureLaborToggle */
export const PureLaborCheckbox = PureLaborToggle;
