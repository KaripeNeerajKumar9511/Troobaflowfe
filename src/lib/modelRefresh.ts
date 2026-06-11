import { fetchModelById } from '@/lib/supabaseData';
import { useModelStore, type Model } from '@/stores/modelStore';

/** Reload one model from API into the zustand store (after local save). */
export async function applySavedModelToStore(modelId: string): Promise<Model | null> {
  const fresh = await fetchModelById(modelId);
  if (!fresh) return null;
  useModelStore.getState().upsertModelFromServer(fresh);
  return fresh;
}
