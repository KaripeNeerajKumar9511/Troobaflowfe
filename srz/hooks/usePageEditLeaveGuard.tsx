import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageEditUnsavedDialog } from '@/components/PageEditUnsavedDialog';

type UsePageEditLeaveGuardArgs = {
  /** True while this user holds the page edit lock. */
  isEditing: boolean;
  isDirty: boolean;
  saving?: boolean;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
  /** Shown when switching product/assembly (optional). */
  leaveDescription?: string;
};

function locationKey(pathname: string, search: string) {
  return `${pathname}${search}`;
}

/**
 * Blocks in-app navigation and guarded actions (e.g. product switch) while editing.
 * User must save, discard, or cancel before leaving the page or changing product scope.
 */
export function usePageEditLeaveGuard({
  isEditing,
  isDirty,
  saving,
  onSave,
  onDiscard,
  leaveDescription,
}: UsePageEditLeaveGuardArgs) {
  const pendingRef = useRef<(() => void) | null>(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isEditingRef = useRef(isEditing);
  isEditingRef.current = isEditing;

  const cancel = useCallback(() => {
    pendingRef.current = null;
    setOpen(false);
  }, []);

  const discardAndContinue = useCallback(() => {
    const next = pendingRef.current;
    pendingRef.current = null;
    setOpen(false);
    onDiscard();
    next?.();
  }, [onDiscard]);

  const saveAndContinue = useCallback(() => {
    void (async () => {
      try {
        await Promise.resolve(onSave());
        const next = pendingRef.current;
        pendingRef.current = null;
        setOpen(false);
        next?.();
      } catch {
        // Keep dialog open for retry.
      }
    })();
  }, [onSave]);

  /** Run an action after save/discard, or immediately when not editing. */
  const confirmLeave = useCallback(
    (apply: () => void) => {
      if (!isEditing) {
        apply();
        return;
      }
      pendingRef.current = apply;
      setOpen(true);
    },
    [isEditing],
  );

  // Browser tab close / refresh — only when there are unsaved edits.
  useEffect(() => {
    if (!isEditing || !isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isEditing, isDirty]);

  // In-app link navigation (sidebar, header links, etc.).
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!isEditingRef.current) return;
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (href.startsWith('http') && !href.startsWith(window.location.origin)) return;

      let targetPath: string;
      let targetSearch = '';
      try {
        const url = new URL(href, window.location.origin);
        targetPath = url.pathname;
        targetSearch = url.search;
      } catch {
        return;
      }

      const cur = locationKey(location.pathname, location.search);
      const next = locationKey(targetPath, targetSearch);
      if (cur === next) return;

      e.preventDefault();
      e.stopPropagation();
      pendingRef.current = () => navigate({ pathname: targetPath, search: targetSearch });
      setOpen(true);
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [location.pathname, location.search, navigate]);

  // Browser back while editing: stay on page until save/discard.
  useEffect(() => {
    if (!isEditing) return;
    window.history.pushState({ pageEditGuard: true }, '', window.location.href);
    const onPopState = () => {
      if (!isEditingRef.current) return;
      window.history.pushState({ pageEditGuard: true }, '', window.location.href);
      pendingRef.current = () => {
        window.history.back();
      };
      setOpen(true);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isEditing]);

  const description =
    leaveDescription
    ?? (isDirty
      ? 'You have unsaved changes. Save or discard before continuing.'
      : 'You are still editing. Save or discard before continuing.');

  const leaveDialog: ReactNode = (
    <PageEditUnsavedDialog
      open={open}
      description={description}
      saving={saving}
      onCancel={cancel}
      onDiscard={discardAndContinue}
      onSave={saveAndContinue}
    />
  );

  return { confirmLeave, leaveDialog };
}
