import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Loader2, Pencil } from 'lucide-react';

export type PageEditActionsProps = {
  isEditing: boolean;
  isDirty: boolean;
  saving?: boolean;
  canStartEdit?: boolean;
  pageLabel?: string;
  editorName?: string | null;
  onStartEdit: () => void;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
};

type ConfirmAction = 'save' | 'discard' | null;

export function PageEditActions({
  isEditing,
  isDirty,
  saving,
  canStartEdit = true,
  pageLabel = 'this page',
  editorName,
  onStartEdit,
  onSave,
  onDiscard,
}: PageEditActionsProps) {
  const [confirm, setConfirm] = useState<ConfirmAction>(null);

  const runConfirmed = async () => {
    const action = confirm;
    setConfirm(null);
    if (action === 'save') {
      await Promise.resolve(onSave());
    } else if (action === 'discard') {
      onDiscard();
    }
  };

  if (editorName) {
    return (
      <Button
        size="sm"
        className="gap-1.5"
        disabled
        title={`${editorName} is editing ${pageLabel}`}
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </Button>
    );
  }

  if (!isEditing) {
    return (
      <Button size="sm" className="gap-1.5" onClick={onStartEdit} disabled={!canStartEdit}>
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </Button>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setConfirm('discard')} disabled={saving}>
          Discard
        </Button>
        <Button size="sm" className="gap-1.5 min-w-[68px]" onClick={() => setConfirm('save')} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Save
        </Button>
      </div>

      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === 'save' ? 'Save changes?' : 'Discard changes?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === 'save'
                ? `Save your edits to ${pageLabel}? Other users will see the updated data.`
                : `Discard all unsaved edits on ${pageLabel}? Your changes will be lost and the last saved data will be restored.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirm(null)} disabled={saving}>
              Cancel
            </Button>
            {confirm === 'discard' ? (
              <Button
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => void runConfirmed()}
                disabled={saving}
              >
                Discard
              </Button>
            ) : (
              <Button onClick={() => void runConfirmed()} disabled={saving}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                Save
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
