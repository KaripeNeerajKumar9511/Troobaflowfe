import { useCallback, useState } from 'react';

/**
 * Tracks whether THIS browser tab has unsaved draft edits.
 * Only the user who edited should see Save — remote live updates must not flip this on.
 */
export function useLocalUnsavedEdits() {
  const [hasLocalUnsavedEdits, setHasLocalUnsavedEdits] = useState(false);

  const markUnsaved = useCallback(() => setHasLocalUnsavedEdits(true), []);
  const clearUnsaved = useCallback(() => setHasLocalUnsavedEdits(false), []);

  return { hasLocalUnsavedEdits, markUnsaved, clearUnsaved };
}
