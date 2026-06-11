import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type PageEditUnsavedDialogProps = {
  open: boolean;
  description?: string;
  saving?: boolean;
  onCancel: () => void;
  onDiscard: () => void;
  onSave: () => void;
};

export function PageEditUnsavedDialog({
  open,
  description = 'You have unsaved changes. Save before continuing?',
  saving,
  onCancel,
  onDiscard,
  onSave,
}: PageEditUnsavedDialogProps) {
  if (!open) return null;

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="outline"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={onDiscard}
            disabled={saving}
          >
            Discard &amp; Continue
          </Button>
          <Button onClick={onSave} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Save &amp; Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
