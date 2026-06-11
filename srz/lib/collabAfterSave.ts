import { applySavedModelToStore } from '@/lib/modelRefresh';
import type { Model } from '@/stores/modelStore';

type CollabNotify = {
  notifyModelSaved: (modelId: string, scope?: string) => void;
};

/** Reload model from API, update store, and tell other org users to refresh. */
export async function finishModelSaveAndNotify(
  collab: CollabNotify,
  modelId: string,
  scope = 'full',
): Promise<Model | null> {
  const fresh = await applySavedModelToStore(modelId);
  collab.notifyModelSaved(modelId, scope);
  return fresh;
}
