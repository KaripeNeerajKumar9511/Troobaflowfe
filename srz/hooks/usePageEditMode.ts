import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrgCollab } from '@/contexts/OrgCollabContext';
import { pageEditBlockedMessage, pageEditScopeKey, type PageEditScope } from '@/lib/pageEditTypes';
import { toast } from 'sonner';

/** Lock holder / viewer state for a page edit scope (use before usePageEditMode for baseline). */
export function usePageEditLockState(
  modelId: string | undefined,
  page: PageEditScope,
  productId?: string | null,
) {
  const { user } = useAuth();
  const collab = useOrgCollab();
  const scopeKey = modelId ? pageEditScopeKey(modelId, page, productId) : '';
  const lock = scopeKey ? collab.getPageEditLock(scopeKey) : null;
  const isHolder = Boolean(
    lock && user?.id != null && String(lock.locked_by) === String(user.id),
  );
  const editorName =
    lock && user?.id != null && String(lock.locked_by) !== String(user.id)
      ? lock.name
      : null;
  return { isHolder, editorName, scopeKey };
}

type UsePageEditModeArgs = {
  modelId: string | undefined;
  page: PageEditScope;
  productId?: string | null;
  pageLabel: string;
  isDirty: boolean;
  onSave: () => Promise<void>;
  onDiscard: () => void;
  enabled?: boolean;
};

export function usePageEditMode({
  modelId,
  page,
  productId,
  pageLabel,
  isDirty,
  onSave,
  onDiscard,
  enabled = true,
}: UsePageEditModeArgs) {
  const { user } = useAuth();
  const collab = useOrgCollab();
  const scopeKey = modelId ? pageEditScopeKey(modelId, page, productId) : '';

  const lock = scopeKey ? collab.getPageEditLock(scopeKey) : null;

  const isHolder = Boolean(
    lock && user?.id != null && String(lock.locked_by) === String(user.id),
  );
  const editorName =
    lock && user?.id != null && String(lock.locked_by) !== String(user.id)
      ? lock.name
      : null;

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return collab.onPageEditDenied((msg) => {
      if (!modelId || msg.scopeKey !== scopeKey) return;
      toast.error(`${msg.name} is editing ${pageLabel}`);
    });
  }, [collab, modelId, pageLabel, scopeKey]);

  const startEdit = useCallback(() => {
    if (!enabled || !modelId) return;
    if (editorName) {
      toast.error(pageEditBlockedMessage(editorName, pageLabel));
      return;
    }
    if (isHolder) return;

    const needsProduct = page === 'operations' || page === 'ibom';
    if (needsProduct && !productId) {
      toast.message(`Select a product before editing ${pageLabel}`);
      return;
    }

    collab.acquirePageEdit(modelId, page, productId ?? undefined);
  }, [collab, editorName, enabled, isHolder, modelId, page, pageLabel, productId]);

  const releaseEdit = useCallback(() => {
    if (!modelId) return;
    collab.releasePageEdit(modelId, page, productId ?? undefined);
  }, [collab, modelId, page, productId]);

  const save = useCallback(async () => {
    if (!isHolder || saving) return;
    setSaving(true);
    try {
      if (isDirty) {
        await onSave();
        toast.success(`${pageLabel} saved`);
      }
      releaseEdit();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to save ${pageLabel}`);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [isDirty, isHolder, onSave, pageLabel, releaseEdit, saving]);

  const discard = useCallback(() => {
    if (!isHolder) return;
    onDiscard();
    releaseEdit();
    toast.message(`Changes to ${pageLabel} discarded`);
  }, [isHolder, onDiscard, pageLabel, releaseEdit]);

  const canEditFields = isHolder;
  const canStartEdit = enabled && Boolean(modelId) && !editorName && !isHolder;

  return useMemo(
    () => ({
      isEditing: isHolder,
      canEditFields,
      editorName,
      acquiring: false,
      saving,
      canStartEdit,
      startEdit,
      save,
      discard,
      releaseEdit,
    }),
    [
      canEditFields,
      canStartEdit,
      discard,
      editorName,
      isHolder,
      releaseEdit,
      save,
      saving,
      startEdit,
    ],
  );
}
