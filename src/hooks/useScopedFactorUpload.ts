import { useCallback, useRef, useState } from 'react';
import type { Model } from '@/stores/modelStore';
import { getRmctMasterNames } from '@/lib/factorUpload/masterCatalog';
import type {
  FactorResults,
  FactorUploadPhase,
  FactorUploadScope,
  ValidationResult,
} from '@/lib/factorUpload/types';
import type { WorkerRequest, WorkerResponse } from '@/workers/factorUploadWorker';

export function useScopedFactorUpload(model: Model | null, scope: FactorUploadScope) {
  const [phase, setPhase] = useState<FactorUploadPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [factors, setFactors] = useState<FactorResults | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const bufferRef = useRef<ArrayBuffer | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const terminateWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../workers/factorUploadWorker.ts', import.meta.url),
        { type: 'module' }
      );
    }
    return workerRef.current;
  }, []);

  const reset = useCallback(() => {
    terminateWorker();
    bufferRef.current = null;
    setPhase('idle');
    setProgress(0);
    setProgressLabel('');
    setValidation(null);
    setFactors(null);
    setFileName(null);
    setErrorMessage(null);
  }, [terminateWorker]);

  const uploadFile = useCallback(
    (file: File) => {
      if (!model) return;
      setErrorMessage(null);
      setFactors(null);
      setValidation(null);
      setFileName(file.name);
      setPhase('parsing');
      setProgress(0);
      setProgressLabel('Reading file…');

      const reader = new FileReader();
      reader.onload = () => {
        const buffer = reader.result as ArrayBuffer;
        bufferRef.current = buffer;

        const worker = getWorker();
        const master = getRmctMasterNames(model);

        const onMessage = (ev: MessageEvent<WorkerResponse>) => {
          const msg = ev.data;
          if (msg.type === 'progress') {
            setProgress(msg.pct);
            setProgressLabel(msg.stage);
          } else if (msg.type === 'parse_complete') {
            setValidation(msg.validation);
            setPhase('preview');
            setProgress(100);
            worker.removeEventListener('message', onMessage);
          } else if (msg.type === 'error') {
            setErrorMessage(msg.message);
            setPhase('idle');
            worker.removeEventListener('message', onMessage);
          }
        };

        worker.addEventListener('message', onMessage);
        worker.postMessage({
          type: 'parse_and_validate',
          buffer,
          master,
          scope,
        } satisfies WorkerRequest);
      };
      reader.onerror = () => {
        setErrorMessage('Failed to read file');
        setPhase('idle');
      };
      reader.readAsArrayBuffer(file);
    },
    [model, getWorker, scope]
  );

  const continueWithValid = useCallback(() => {
    if (!model || !bufferRef.current) return;
    setPhase('calculating');
    setProgress(0);
    setProgressLabel('Calculating factors…');

    const worker = getWorker();
    const master = getRmctMasterNames(model);

    const onMessage = (ev: MessageEvent<WorkerResponse>) => {
      const msg = ev.data;
      if (msg.type === 'progress') {
        setProgress(msg.pct);
        setProgressLabel(msg.stage);
      } else if (msg.type === 'calculate_complete') {
        setFactors(msg.factors);
        setPhase('complete');
        setProgress(100);
        worker.removeEventListener('message', onMessage);
      } else if (msg.type === 'error') {
        setErrorMessage(msg.message);
        setPhase('preview');
        worker.removeEventListener('message', onMessage);
      }
    };

    worker.addEventListener('message', onMessage);
    worker.postMessage({
      type: 'calculate',
      buffer: bufferRef.current,
      master,
      scope,
    } satisfies WorkerRequest);
  }, [model, getWorker, scope]);

  return {
    phase,
    progress,
    progressLabel,
    validation,
    factors,
    fileName,
    errorMessage,
    uploadFile,
    continueWithValid,
    reset,
  };
}
