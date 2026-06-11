import { useEffect } from 'react';
import { useOrgCollab, type CellUpdatedEvent } from '@/contexts/OrgCollabContext';
import type { CollabEntity } from '@/lib/collabEntities';

/** Subscribe to remote cell updates for one entity + model (sync local drafts). */
export function useCollabDraftSync(
  modelId: string | undefined,
  entity: CollabEntity,
  onRemote: (msg: CellUpdatedEvent) => void,
) {
  const collab = useOrgCollab();

  useEffect(() => {
    if (!modelId) return;
    return collab.onCellUpdated((msg) => {
      if ((msg.entity || 'operation') !== entity) return;
      if (String(msg.model_id || '') !== modelId) return;
      collab.beginRemoteApply();
      try {
        onRemote(msg);
      } finally {
        requestAnimationFrame(() => collab.endRemoteApply());
      }
    });
  }, [modelId, entity, collab, onRemote]);
}
