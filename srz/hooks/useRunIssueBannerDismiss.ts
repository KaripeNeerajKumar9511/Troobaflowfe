import { useCallback, useEffect, useRef, useState } from 'react';
import type { RunLogEntry } from '@/hooks/useRunCalculation';
import type { IssueBannerDismissKey } from '@/components/run/RunResultsIssueBanners';

export type IssueBannerKey = IssueBannerDismissKey;

export type RunIssueDismissPersist = {
  modelId: string;
  resultKey: string;
  /** Uniquely identifies this results snapshot (new run → new stamp → dismiss resets). */
  resultsStamp: string;
};

const STORAGE_NS = 'rmct:issueDismiss:v6';

function storageKey(modelId: string, resultKey: string) {
  return `${STORAGE_NS}:${modelId}:${resultKey}`;
}

const emptyDismissed = (): Record<IssueBannerKey, boolean> => ({
  errors: false,
  warnings: false,
  validations: false,
  success: false,
});

/**
 * Remembers whether the user dismissed Run & Results issue banners.
 * Persists in sessionStorage until results change or a new Full Calculate completes.
 */
export function useRunIssueBannerDismiss(
  runLog: RunLogEntry[],
  persist: RunIssueDismissPersist | null,
) {
  const [dismissed, setDismissed] = useState<Record<IssueBannerKey, boolean>>(emptyDismissed);

  const lastSeenFullRunId = useRef<string | null>(null);

  useEffect(() => {
    if (!persist?.modelId || !persist.resultsStamp) return;

    const key = storageKey(persist.modelId, persist.resultKey);
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) {
        setDismissed(emptyDismissed());
        return;
      }
      const parsed = JSON.parse(raw) as {
        stamp: string;
        dismissed: Record<string, boolean>;
      };
      if (parsed.stamp === persist.resultsStamp && parsed.dismissed) {
        const d = parsed.dismissed;
        setDismissed({
          errors: !!d.errors,
          warnings: !!d.warnings,
          validations: !!(d.validations ?? d.validation),
          success: !!d.success,
        });
        return;
      }

      const curPending = persist.resultsStamp.startsWith('pending:');
      const storedPending = typeof parsed.stamp === 'string' && parsed.stamp.startsWith('pending:');

      if (curPending || storedPending) {
        return;
      }

      setDismissed(emptyDismissed());
      sessionStorage.removeItem(key);
    } catch {
      setDismissed(emptyDismissed());
    }
  }, [persist?.modelId, persist?.resultKey, persist?.resultsStamp]);

  useEffect(() => {
    if (runLog.length === 0) return;
    const top = runLog[0];
    if (top.mode !== 'full' && top.mode !== 'verify' && top.mode !== 'util_only') return;

    if (lastSeenFullRunId.current === null) {
      lastSeenFullRunId.current = top.id;
      return;
    }
    if (lastSeenFullRunId.current !== top.id) {
      lastSeenFullRunId.current = top.id;
      setDismissed(emptyDismissed());
      if (persist?.modelId) {
        try {
          sessionStorage.removeItem(storageKey(persist.modelId, persist.resultKey));
        } catch {
          /* ignore */
        }
      }
    }
  }, [runLog, persist?.modelId, persist?.resultKey]);

  const dismiss = useCallback(
    (bannerKey: IssueBannerKey) => {
      setDismissed((d) => {
        const next = { ...d, [bannerKey]: true };
        if (persist?.modelId && persist.resultsStamp) {
          try {
            sessionStorage.setItem(
              storageKey(persist.modelId, persist.resultKey),
              JSON.stringify({ stamp: persist.resultsStamp, dismissed: next }),
            );
          } catch {
            /* ignore quota / private mode */
          }
        }
        return next;
      });
    },
    [persist?.modelId, persist?.resultKey, persist?.resultsStamp],
  );

  const clearDismiss = useCallback(
    (bannerKey?: IssueBannerKey) => {
      setDismissed((d) => {
        const next = bannerKey ? { ...d, [bannerKey]: false } : emptyDismissed();
        if (persist?.modelId && persist.resultsStamp) {
          try {
            sessionStorage.setItem(
              storageKey(persist.modelId, persist.resultKey),
              JSON.stringify({ stamp: persist.resultsStamp, dismissed: next }),
            );
          } catch {
            /* ignore */
          }
        }
        return next;
      });
    },
    [persist?.modelId, persist?.resultKey, persist?.resultsStamp],
  );

  return { dismissed, dismiss, clearDismiss };
}
