import { finishModelSaveAndNotify } from '@/lib/collabAfterSave';
import type { Model } from '@/stores/modelStore';

type CollabNotify = {
  notifyModelSaved: (modelId: string, scope?: string) => void;
};

/** After a structural DB change, reload the model and notify other org users. */
export async function syncModelToOrg(
  collab: CollabNotify,
  modelId: string,
  scope = 'full',
): Promise<Model | null> {
  return finishModelSaveAndNotify(collab, modelId, scope);
}
