import { useEffect, useRef } from 'react';
import { useOrgCollab, type ModelRefreshedEvent } from '@/contexts/OrgCollabContext';
import type { Model } from '@/stores/modelStore';

/**
 * When another org member saves structural changes, reload drafts from the fresh model.
 */
export function useModelRefreshSync(
  modelId: string | undefined,
  onRefresh: (model: Model, event: ModelRefreshedEvent) => void,
) {
  const collab = useOrgCollab();
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (!modelId) return;
    return collab.onModelRefreshed((event) => {
      if (String(event.model_id) !== modelId) return;
      onRefreshRef.current(event.model, event);
    });
  }, [collab, modelId]);
}
