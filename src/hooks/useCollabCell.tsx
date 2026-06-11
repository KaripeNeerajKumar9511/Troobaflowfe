import { useCallback, type ReactElement } from 'react';
import { CollabCellShell } from '@/components/CollabCellShell';
import { useOrgCollab } from '@/contexts/OrgCollabContext';
import type { CollabEntity } from '@/lib/collabEntities';

/** Live sync + cell lock wrapper for model workspace tables/forms. */
export function useCollabCell(modelId: string | undefined, entity: CollabEntity) {
  const collab = useOrgCollab();

  const wrapCell = useCallback(
    (
      rowId: string,
      field: string,
      child: ReactElement,
      options?: { getValue?: () => unknown; commitOnChange?: boolean } | (() => unknown),
    ) => {
      if (!modelId) return child;
      const opts =
        typeof options === 'function' ? { getValue: options } : options;
      return (
        <CollabCellShell
          modelId={modelId}
          entity={entity}
          rowId={rowId}
          field={field}
          getValue={opts?.getValue}
          commitOnChange={opts?.commitOnChange}
        >
          {child}
        </CollabCellShell>
      );
    },
    [modelId, entity],
  );

  const pushCellChange = useCallback(
    (rowId: string, field: string, value: unknown) => {
      if (!modelId) return;
      collab.scheduleCellUpdate(modelId, entity, rowId, field, value);
    },
    [collab, entity, modelId],
  );

  const flushCellUpdate = useCallback(
    (rowId: string, field: string, value: unknown) => {
      if (!modelId) return;
      collab.flushCellUpdate(modelId, entity, rowId, field, value);
    },
    [collab, entity, modelId],
  );

  return {
    collab,
    wrapCell,
    pushCellChange,
    flushCellUpdate,
  };
}
