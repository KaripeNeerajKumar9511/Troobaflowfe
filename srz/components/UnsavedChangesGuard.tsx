import { PageEditLeaveGuard } from '@/components/PageEditLeaveGuard';

interface UnsavedChangesGuardProps {
  isEditing?: boolean;
  isDirty: boolean;
  onSave: () => void | Promise<void>;
  onDiscard?: () => void;
  saving?: boolean;
  leaveDescription?: string;
}

/** @deprecated Prefer `PageEditLeaveGuard` — kept for existing imports. */
export function UnsavedChangesGuard({
  isEditing = true,
  isDirty,
  onSave,
  onDiscard,
  saving,
  leaveDescription,
}: UnsavedChangesGuardProps) {
  return (
    <PageEditLeaveGuard
      isEditing={isEditing}
      isDirty={isDirty}
      saving={saving}
      onSave={onSave}
      onDiscard={onDiscard ?? (() => {})}
      leaveDescription={leaveDescription}
    />
  );
}
