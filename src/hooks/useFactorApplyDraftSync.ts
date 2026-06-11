import { useEffect, useRef } from 'react';
import { useModelStore, type Model } from '@/stores/modelStore';

/**
 * Re-sync page draft state when factor upload applies values to the model store.
 */
export function useFactorApplyDraftSync(
  modelId: string | undefined,
  onSync: (fresh: Model) => void
) {
  const token = useModelStore((s) => s.factorApplySyncToken);
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  useEffect(() => {
    if (!modelId || token === 0) return;
    const fresh = useModelStore.getState().getActiveModel();
    if (fresh?.id === modelId) onSyncRef.current(fresh);
  }, [token, modelId]);
}
