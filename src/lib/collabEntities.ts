import { opFieldToBackendColumn } from '@/lib/modelCollab';

export type CollabEntity =
  | 'operation'
  | 'product'
  | 'equipment'
  | 'labor'
  | 'general'
  | 'routing'
  | 'ibom';

/** Wire column name sent over WebSocket (matches backend collab_service). */
export function collabWireColumn(entity: CollabEntity, field: string): string | null {
  if (entity === 'operation') {
    return opFieldToBackendColumn(field);
  }
  return field;
}
