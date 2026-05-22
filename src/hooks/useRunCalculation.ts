import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import { useModelStore } from '@/stores/modelStore';
import { useScenarioStore } from '@/stores/scenarioStore';
import { useResultsStore } from '@/stores/resultsStore';
import { fullCalculate, verifyModel } from '@/lib/simulationApi';
import {
  getModelValidationMessages,
  mergeValidationMessages,
  toUtilOnlyResults,
  type CalcResults,
} from '@/lib/calculationEngine';
import { toast } from 'sonner';

export type RunMode = 'full' | 'verify' | 'util_only';

export interface RunLogEntry {
  id: string;
  timestamp: string;
  mode: RunMode;
  scenarioName: string;
  durationMs: number;
  status: 'success' | 'warning' | 'error';
}

export type VerifyMessages = {
  errors: string[];
  warnings: string[];
  verifiedOk?: boolean;
};

interface UseRunCalculationReturn {
  isRunning: boolean;
  runLog: RunLogEntry[];
  verifyMessages: VerifyMessages | null;
  /** True when issue / validation banners should be visible (verify, util-only, or full calculate). */
  showIssueBanners: boolean;
  handleRun: (mode: RunMode) => Promise<void>;
  clearVerifyMessages: () => void;
}

let _runLog: RunLogEntry[] = [];
let _runLogListeners: Set<() => void> = new Set();
function notifyRunLog() {
  _runLogListeners.forEach((fn) => fn());
}
function subscribeRunLog(cb: () => void) {
  _runLogListeners.add(cb);
  return () => {
    _runLogListeners.delete(cb);
  };
}
function getRunLogSnapshot() {
  return _runLog;
}

let _isRunning = false;
let _isRunningListeners: Set<() => void> = new Set();
function notifyIsRunning() {
  _isRunningListeners.forEach((fn) => fn());
}
function subscribeIsRunning(cb: () => void) {
  _isRunningListeners.add(cb);
  return () => {
    _isRunningListeners.delete(cb);
  };
}
function getIsRunningSnapshot() {
  return _isRunning;
}
function setGlobalIsRunning(v: boolean) {
  _isRunning = v;
  notifyIsRunning();
}

export function useRunCalculation(): UseRunCalculationReturn {
  const model = useModelStore((s) => s.getActiveModel());
  const setRunStatus = useModelStore((s) => s.setRunStatus);
  const allScenarios = useScenarioStore((s) => s.scenarios);
  const activeScenario = useScenarioStore((s) => s.getActiveScenario());
  const markCalculated = useScenarioStore((s) => s.markCalculated);
  const { setResults } = useResultsStore();
  const selectedRunScenarioId = useResultsStore((s) => s.selectedRunScenarioId);

  const runScenario =
    selectedRunScenarioId && selectedRunScenarioId !== 'basecase'
      ? allScenarios.find((s) => s.id === selectedRunScenarioId) || activeScenario
      : activeScenario;

  const [verifyMessages, setVerifyMessages] = useState<VerifyMessages | null>(null);
  const [showIssueBanners, setShowIssueBanners] = useState(false);

  useEffect(() => {
    setShowIssueBanners(false);
    setVerifyMessages(null);
  }, [model?.id]);

  const runLog = useSyncExternalStore(subscribeRunLog, getRunLogSnapshot);
  const isRunning = useSyncExternalStore(subscribeIsRunning, getIsRunningSnapshot);

  const handleRun = useCallback(
    async (mode: RunMode) => {
      if (!model || _isRunning) return;

      if (mode === 'verify') {
        const startTime = Date.now();
        const local = getModelValidationMessages(model);
        let remote = { errors: [] as string[], warnings: [] as string[] };
        try {
          remote = await verifyModel(model);
        } catch (e) {
          console.error(e);
          toast.error('Could not reach the verification service — showing checks performed in your browser.');
        }
        const msgs = mergeValidationMessages(local, remote);
        const ok = msgs.errors.length === 0 && msgs.warnings.length === 0;
        setVerifyMessages(ok ? { errors: [], warnings: [], verifiedOk: true } : msgs);
        setShowIssueBanners(true);
        const entry: RunLogEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          mode: 'verify',
          scenarioName: runScenario?.name || 'Basecase',
          durationMs: Date.now() - startTime,
          status:
            msgs.errors.length > 0 ? 'error' : msgs.warnings.length > 0 ? 'warning' : 'success',
        };
        _runLog = [entry, ..._runLog].slice(0, 5);
        notifyRunLog();
        return;
      }

      const localPre = getModelValidationMessages(model);
      let remotePre = { errors: [] as string[], warnings: [] as string[] };
      try {
        remotePre = await verifyModel(model);
      } catch (e) {
        console.error(e);
      }
      const mergedPre = mergeValidationMessages(localPre, remotePre);
      setVerifyMessages(
        mergedPre.errors.length > 0 || mergedPre.warnings.length > 0 ? mergedPre : null,
      );

      if (mergedPre.errors.length > 0) {
        setShowIssueBanners(true);
        if (mode === 'util_only') {
          toast.error('Fix validation errors before calculating utilization.');
        }
        return;
      }

      if (mode === 'full') setShowIssueBanners(false);

      setGlobalIsRunning(true);
      const startTime = Date.now();
      const resultKey = runScenario ? runScenario.id : 'basecase';
      let calcSucceeded = false;

      try {
        let calcResults: CalcResults = await fullCalculate(model, runScenario ?? null);
        calcSucceeded = true;
        if (mode === 'util_only') {
          calcResults = toUtilOnlyResults(calcResults);
        } else {
          calcResults = { ...calcResults, runMode: 'full' };
        }
        if (mode === 'full') {
          console.log('[Full Calculate] frontend received data:', calcResults);
        }
        setResults(resultKey, calcResults);
        setRunStatus(model.id, 'current');
        if (runScenario) markCalculated(runScenario.id);
        // Keep non-blocking validation warnings visible above calculation messages; clear if none.
        setVerifyMessages(
          mergedPre.warnings.length > 0 ? { errors: [], warnings: mergedPre.warnings } : null,
        );

        const durationMs = Date.now() - startTime;
        const hasErrors = calcResults.errors.length > 0;
        const hasWarnings = calcResults.overLimitResources.length > 0;

        const entry: RunLogEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          mode,
          scenarioName: runScenario?.name || 'Basecase',
          durationMs,
          status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'success',
        };
        _runLog = [entry, ..._runLog].slice(0, 5);
        notifyRunLog();

        const { scenarioDb } = await import('@/lib/scenarioDb');
        try {
          if (runScenario) {
            await scenarioDb.saveResults(runScenario.id, calcResults);
          } else {
            await scenarioDb.saveBasecaseResults(model.id, calcResults);
          }
        } catch (persistErr) {
          console.error('Failed to persist run results:', persistErr);
        }
        const { db } = await import('@/lib/supabaseData');
        await db.updateModel(model.id, {
          run_status: 'current',
          last_run_at: new Date().toISOString(),
        });

      } catch (e) {
        console.error(e);
        const message = e instanceof Error ? e.message : 'Calculation failed';
        toast.error(mode === 'util_only' ? `Utilization calculate failed: ${message}` : `Calculate failed: ${message}`);
        setShowIssueBanners(true);
      } finally {
        setGlobalIsRunning(false);
        if (mode === 'full' || mode === 'util_only') setShowIssueBanners(true);
        if (mode === 'util_only' && calcSucceeded) {
          toast.success('Utilization calculated — equipment and labor tabs are updated.');
        }
      }
    },
    [model, runScenario, setResults, setRunStatus, markCalculated],
  );

  return {
    isRunning,
    runLog,
    verifyMessages,
    showIssueBanners,
    handleRun,
    clearVerifyMessages: () => setVerifyMessages(null),
  };
}

export function getRunLog(): RunLogEntry[] {
  return _runLog;
}
