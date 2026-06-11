import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SaveChangesButtonProps = {
  isDirty: boolean;
  saving?: boolean;
  onSave: () => void;
  size?: 'sm' | 'default';
  className?: string;
  label?: string;
};

/** Shown only when there are unsaved structural/draft changes. */
export function SaveChangesButton({
  isDirty,
  saving = false,
  onSave,
  size = 'sm',
  className,
  label = 'Save',
}: SaveChangesButtonProps) {
  if (!isDirty) return null;
  return (
    <Button
      size={size}
      className={className ?? 'gap-1'}
      disabled={saving}
      onClick={() => void onSave()}
    >
      <Save className={size === 'sm' ? 'h-4 w-4' : 'h-4 w-4'} />
      {saving ? 'Saving…' : label}
    </Button>
  );
}
