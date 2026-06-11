import { usePageEditLeaveGuard } from '@/hooks/usePageEditLeaveGuard';
import { SavingOverlay } from '@/components/SavingOverlay';

type PageEditLeaveGuardProps = {
  isEditing: boolean;
  isDirty: boolean;
  saving?: boolean;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
  leaveDescription?: string;
  savingTitle?: string;
  savingSubtitle?: string;
};

/** Blocks navigation while page edit mode is active; shows portal saving overlay while persisting. */
export function PageEditLeaveGuard({
  isEditing,
  isDirty,
  saving,
  onSave,
  onDiscard,
  leaveDescription,
  savingTitle,
  savingSubtitle,
}: PageEditLeaveGuardProps) {
  const { leaveDialog } = usePageEditLeaveGuard({
    isEditing,
    isDirty,
    saving,
    onSave,
    onDiscard,
    leaveDescription,
  });

  return (
    <>
      {saving && <SavingOverlay title={savingTitle} subtitle={savingSubtitle} />}
      {isEditing ? leaveDialog : null}
    </>
  );
}

/** Saving overlay only — for pages that use `usePageEditLeaveGuard` directly (Operations, IBOM). */
export function PageSavingOverlay({
  saving,
  title,
  subtitle,
}: {
  saving?: boolean;
  title?: string;
  subtitle?: string;
}) {
  if (!saving) return null;
  return <SavingOverlay title={title} subtitle={subtitle} />;
}
