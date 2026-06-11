import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { resolveWsUrl } from '@/lib/ws';
import type { Operation } from '@/stores/modelStore';

export type CollabStatus = 'connecting' | 'open' | 'closed' | 'error';

export type LockedCell = {
  row_id: string;
  column: string;
  locked_by: number | string;
  name?: string;
};

export type PresenceUser = { user_id: number | string; name: string };

export type CollabEvent =
  | { type: 'cell_locked'; row_id: string; column: string; locked_by: number | string; name?: string }
  | { type: 'cell_unlocked'; row_id: string; column: string }
  | { type: 'cell_updated'; row_id: string; column: string; value: unknown; updated_by: number | string; name?: string }
  | { type: 'user_joined'; user_id: number | string; name: string }
  | { type: 'user_left'; user_id: number | string; name: string }
  | { type: 'lock_denied'; row_id: string; column: string; locked_by: number | string }
  | { type: 'update_denied'; reason: string }
  | { type: 'heartbeat_ack' }
  | { type: string; [k: string]: unknown };

/** Frontend Operation field -> backend Operation column */
export function opFieldToBackendColumn(field: string): string | null {
  const map: Record<string, string> = {
    op_number: 'op_number',
    op_name: 'name',
    pct_assigned: 'percent_assign',
    equip_setup_lot: 'equipment_setup_per_lot',
    equip_setup_piece: 'equipment_setup_per_piece',
    equip_setup_tbatch: 'equipment_setup_per_tbatch',
    equip_run_piece: 'equipment_run_per_piece',
    equip_run_lot: 'equipment_run_per_lot',
    equip_run_tbatch: 'equipment_run_per_tbatch',
    labor_setup_lot: 'labor_setup_per_lot',
    labor_setup_piece: 'labor_setup_per_piece',
    labor_setup_tbatch: 'labor_setup_per_tbatch',
    labor_run_piece: 'labor_run_per_piece',
    labor_run_lot: 'labor_run_per_lot',
    labor_run_tbatch: 'labor_run_per_tbatch',
    oper1: 'oper1',
    oper2: 'oper2',
    oper3: 'oper3',
    oper4: 'oper4',
    comments: 'comments',
    equip_id: 'equipment_group_id',
  };
  return map[field] ?? null;
}

export const backendColumnToOpField: Record<string, keyof Operation> = {
  op_number: 'op_number',
  name: 'op_name',
  percent_assign: 'pct_assigned',
  equipment_setup_per_lot: 'equip_setup_lot',
  equipment_setup_per_piece: 'equip_setup_piece',
  equipment_setup_per_tbatch: 'equip_setup_tbatch',
  equipment_run_per_piece: 'equip_run_piece',
  equipment_run_per_lot: 'equip_run_lot',
  equipment_run_per_tbatch: 'equip_run_tbatch',
  labor_setup_per_lot: 'labor_setup_lot',
  labor_setup_per_piece: 'labor_setup_piece',
  labor_setup_per_tbatch: 'labor_setup_tbatch',
  labor_run_per_piece: 'labor_run_piece',
  labor_run_per_lot: 'labor_run_lot',
  labor_run_per_tbatch: 'labor_run_tbatch',
  oper1: 'oper1',
  oper2: 'oper2',
  oper3: 'oper3',
  oper4: 'oper4',
  comments: 'comments',
  equipment_group_id: 'equip_id',
};

function cellKey(rowId: string, column: string) {
  return `${rowId}:${column}`;
}

function parseCollabMessage(raw: string): CollabEvent | null {
  try {
    return JSON.parse(raw) as CollabEvent;
  } catch {
    return null;
  }
}

export function useModelCollab(
  modelId: string | undefined | null,
  enabled: boolean,
  currentUserId?: number | null,
) {
  const [locks, setLocks] = useState<Record<string, LockedCell>>({});
  const [presence, setPresence] = useState<Record<string, PresenceUser>>({});
  const [status, setStatus] = useState<CollabStatus>('closed');
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Set<(msg: CollabEvent) => void>>(new Set());
  const remoteUpdateRef = useRef(false);
  const broadcastTimersRef = useRef<Record<string, number>>({});

  const url = useMemo(() => {
    if (!modelId) return '';
    return resolveWsUrl(`/ws/models/${modelId}/`);
  }, [modelId]);

  const onMessage = useCallback((handler: (msg: CollabEvent) => void) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  const dispatch = useCallback((msg: CollabEvent) => {
    if (msg.type === 'cell_locked') {
      const k = cellKey(String(msg.row_id), String(msg.column));
      setLocks((prev) => ({
        ...prev,
        [k]: {
          row_id: String(msg.row_id),
          column: String(msg.column),
          locked_by: msg.locked_by,
          name: msg.name,
        },
      }));
    } else if (msg.type === 'cell_unlocked') {
      const k = cellKey(String(msg.row_id), String(msg.column));
      setLocks((prev) => {
        const next = { ...prev };
        delete next[k];
        return next;
      });
    } else if (msg.type === 'user_joined') {
      setPresence((prev) => ({
        ...prev,
        [String(msg.user_id)]: { user_id: msg.user_id, name: msg.name },
      }));
    } else if (msg.type === 'user_left') {
      setPresence((prev) => {
        const next = { ...prev };
        delete next[String(msg.user_id)];
        return next;
      });
    }

    for (const h of handlersRef.current) {
      try {
        h(msg);
      } catch {
        // ignore handler errors
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled || !modelId || !url) {
      setStatus('closed');
      return;
    }

    let cancelled = false;
    setStatus('connecting');

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (cancelled) return;
      setStatus('open');
    };

    ws.onerror = () => {
      if (cancelled) return;
      setStatus('error');
    };

    ws.onclose = () => {
      if (cancelled) return;
      setStatus('closed');
    };

    ws.onmessage = (ev) => {
      const msg = parseCollabMessage(String(ev.data));
      if (!msg) return;
      dispatch(msg);
    };

    const heartbeat = window.setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(heartbeat);
      Object.values(broadcastTimersRef.current).forEach((id) => window.clearTimeout(id));
      broadcastTimersRef.current = {};
      try {
        ws.close();
      } catch {
        // ignore
      }
    };
  }, [enabled, modelId, url, dispatch]);

  const send = useCallback((payload: unknown) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify(payload));
    return true;
  }, []);

  const broadcastCellUpdate = useCallback(
    (rowId: string, backendColumn: string, value: unknown) => {
      send({ type: 'update_cell', row_id: rowId, column: backendColumn, value });
    },
    [send],
  );

  const scheduleBroadcast = useCallback(
    (rowId: string, field: string, value: unknown) => {
      const backendCol = opFieldToBackendColumn(field);
      if (!backendCol || remoteUpdateRef.current) return;
      const timerKey = `${rowId}:${backendCol}`;
      const existing = broadcastTimersRef.current[timerKey];
      if (existing) window.clearTimeout(existing);
      broadcastTimersRef.current[timerKey] = window.setTimeout(() => {
        delete broadcastTimersRef.current[timerKey];
        broadcastCellUpdate(rowId, backendCol, value);
      }, 300);
    },
    [broadcastCellUpdate],
  );

  const isLockedByOther = useCallback(
    (rowId: string, backendCol: string) => {
      const lock = locks[cellKey(rowId, backendCol)];
      if (!lock) return false;
      if (currentUserId == null) return true;
      return String(lock.locked_by) !== String(currentUserId);
    },
    [locks, currentUserId],
  );

  return {
    status,
    locks,
    presence: Object.values(presence),
    onMessage,
    scheduleBroadcast,
    isLockedByOther,
    lockCell: (row_id: string, column: string) => send({ type: 'lock_cell', row_id, column }),
    unlockCell: (row_id: string, column: string) => send({ type: 'unlock_cell', row_id, column }),
    updateCell: broadcastCellUpdate,
    beginRemoteApply: () => {
      remoteUpdateRef.current = true;
    },
    endRemoteApply: () => {
      remoteUpdateRef.current = false;
    },
  };
}
