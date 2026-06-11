import { useEffect, useState } from 'react';
import type { Model } from '@/stores/modelStore';

/**
 * Snapshot model once per edit session when the page lock is acquired.
 */
export function usePageEditBaseline(isEditing: boolean, model: Model | undefined | null): Model | null {
  const [baseline, setBaseline] = useState<Model | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setBaseline(null);
      return;
    }
    if (!model) return;
    setBaseline((prev) => prev ?? (structuredClone(model) as Model));
  }, [isEditing, model]);

  return baseline;
}
