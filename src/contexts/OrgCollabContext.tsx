import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CollabSocket, type CollabConnectionStatus } from '@/lib/collabSocket';
import { collabWireColumn, type CollabEntity } from '@/lib/collabEntities';
import { backendColumnToOpField, type CollabEvent } from '@/lib/modelCollab';
import {
  useModelStore,
  type EquipmentGroup,
  type IBOMEntry,
  type LaborGroup,
  type Operation,
  type Product,
  type RoutingEntry,
} from '@/stores/modelStore';
import { toast } from 'sonner';
import { persistCollabCellToDb } from '@/lib/collabPersist';
import { fetchModelById } from '@/lib/supabaseData';
import type { Model } from '@/stores/modelStore';
import {
  pageEditScopeKey,
  type PageEditLockInfo,
  type PageEditScope,
} from '@/lib/pageEditTypes';

export type OrgPresenceUser = { user_id: number | string; name: string };

export type CellUpdatedEvent = CollabEvent & {
  type: 'cell_updated';
  entity?: string;
  model_id?: string;
  row_id?: string;
  column?: string;
  value?: unknown;
  updated_by?: number | string;
};

type CellUpdatedHandler = (event: CellUpdatedEvent) => void;

export type ModelRefreshedEvent = {
  type: 'model_refreshed';
  model_id: string;
  scope?: string;
  updated_by?: number | string;
  name?: string;
  model: Model;
};

type ModelRefreshedHandler = (event: ModelRefreshedEvent) => void;

export type CellLockInfo = {
  isLockedByOther: boolean;
  isLockedBySelf: boolean;
  editorName: string | null;
};

interface OrgCollabContextValue {
  status: CollabConnectionStatus;
  presence: OrgPresenceUser[];
  liveCount: number;
  locks: Record<string, { locked_by: number | string; name?: string }>;
  getCellLock: (
    modelId: string,
    entity: CollabEntity,
    rowId: string,
    column: string,
  ) => CellLockInfo;
  isLockedByOther: (
    modelId: string,
    entity: CollabEntity,
    rowId: string,
    column: string,
  ) => boolean;
  lockCell: (modelId: string, entity: CollabEntity, rowId: string, column: string) => void;
  unlockCell: (modelId: string, entity: CollabEntity, rowId: string, column: string) => void;
  scheduleCellUpdate: (
    modelId: string,
    entity: CollabEntity,
    rowId: string,
    field: string,
    value: unknown,
  ) => void;
  flushCellUpdate: (
    modelId: string,
    entity: CollabEntity,
    rowId: string,
    field: string,
    value: unknown,
  ) => void;
  onCellUpdated: (handler: CellUpdatedHandler) => () => void;
  /** Call after Save (or structural DB change) so other org members reload this model. */
  notifyModelSaved: (modelId: string, scope?: string) => void;
  /** Reload model library list when another user creates/deletes a model. */
  notifyModelLibraryChanged: () => void;
  onModelRefreshed: (handler: ModelRefreshedHandler) => () => void;
  beginRemoteApply: () => void;
  endRemoteApply: () => void;
  pageEditLocks: Record<string, PageEditLockInfo>;
  getPageEditLock: (scopeKey: string) => PageEditLockInfo | null;
  acquirePageEdit: (modelId: string, page: PageEditScope, productId?: string) => void;
  releasePageEdit: (modelId: string, page: PageEditScope, productId?: string) => void;
  onPageEditAcquired: (
    handler: (msg: { scopeKey: string; locked_by: number | string }) => void,
  ) => () => void;
  onPageEditDenied: (
    handler: (msg: { scopeKey: string; name: string }) => void,
  ) => () => void;
}

const OrgCollabContext = createContext<OrgCollabContextValue | null>(null);

function parseEvent(raw: string): CollabEvent | null {
  try {
    return JSON.parse(raw) as CollabEvent;
  } catch {
    return null;
  }
}

function lockKey(entity: string, modelId: string, rowId: string, column: string) {
  return `${entity}:${modelId}:${rowId}:${column}`;
}

function coerceValue(entity: CollabEntity, column: string, raw: unknown): unknown {
  if (entity === 'operation') {
    const f = backendColumnToOpField[column];
    if (!f) return raw;
    if (f === 'op_name' || f === 'equip_id') return raw == null ? '' : String(raw);
    if (typeof raw === 'number') return raw;
    return Number(raw);
  }
  if (entity === 'product') {
    if (column === 'name' || column === 'comments' || column === 'dept_code') return String(raw ?? '');
    if (column === 'make_to_stock' || column === 'gather_tbatches') return Boolean(raw);
    if (typeof raw === 'number') return raw;
    return Number(raw);
  }
  if (entity === 'equipment') {
    if (column === 'name' || column === 'comments' || column === 'dept_code' || column === 'equip_type' || column === 'labor_group_id') {
      return raw == null ? '' : String(raw);
    }
    if (column === 'out_of_area') return Boolean(raw);
    if (typeof raw === 'number') return raw;
    return Number(raw);
  }
  if (entity === 'labor') {
    if (column === 'name' || column === 'comments' || column === 'dept_code') return String(raw ?? '');
    if (column === 'prioritize_use') return Boolean(raw);
    if (typeof raw === 'number') return raw;
    return Number(raw);
  }
  if (entity === 'general') {
    if (column === 'model_title' || column === 'author' || column === 'comments' || column === 'ops_time_unit' || column === 'mct_time_unit' || column === 'prod_period_unit') {
      return String(raw ?? '');
    }
    if (typeof raw === 'number') return raw;
    return Number(raw);
  }
  if (entity === 'routing') {
    if (column === 'to_op_name') return String(raw ?? '');
    if (typeof raw === 'number') return raw;
    return Number(raw);
  }
  if (entity === 'ibom') {
    if (typeof raw === 'number') return raw;
    return Number(raw);
  }
  return raw;
}

function patchFromCollabMessage(
  msg: CellUpdatedEvent,
  userId: number | undefined,
  patchers: {
    patchOperationFromCollab: (m: string, r: string, d: Partial<Operation>) => void;
    patchProductFromCollab: (m: string, r: string, d: Partial<Product>) => void;
    patchEquipmentFromCollab: (m: string, r: string, d: Partial<EquipmentGroup>) => void;
    patchLaborFromCollab: (m: string, r: string, d: Partial<LaborGroup>) => void;
    patchGeneralFromCollab: (m: string, d: Record<string, unknown>) => void;
    patchRoutingFromCollab: (m: string, r: string, d: Partial<RoutingEntry>) => void;
    patchIBOMFromCollab: (m: string, e: string, d: Partial<IBOMEntry>) => void;
  },
) {
  const entity = (msg.entity || 'operation') as CollabEntity;
  const modelId = String(msg.model_id || '');
  const rowId = String(msg.row_id || '');
  const column = String(msg.column || '');
  if (!modelId || !column) return;
  if (userId != null && String(msg.updated_by) === String(userId)) return;

  if (entity === 'operation') {
    const field = backendColumnToOpField[column];
    if (!field) return;
    const value = coerceValue('operation', column, msg.value);
    patchers.patchOperationFromCollab(modelId, rowId, { [field]: value } as Partial<Operation>);
    return;
  }

  if (entity === 'product') {
    const value = coerceValue('product', column, msg.value);
    patchers.patchProductFromCollab(modelId, rowId, { [column]: value } as Partial<Product>);
    return;
  }

  if (entity === 'equipment') {
    const value = coerceValue('equipment', column, msg.value);
    patchers.patchEquipmentFromCollab(modelId, rowId, { [column]: value } as Partial<EquipmentGroup>);
    return;
  }

  if (entity === 'labor') {
    const value = coerceValue('labor', column, msg.value);
    patchers.patchLaborFromCollab(modelId, rowId, { [column]: value } as Partial<LaborGroup>);
    return;
  }

  if (entity === 'general') {
    const value = coerceValue('general', column, msg.value);
    patchers.patchGeneralFromCollab(modelId, { [column]: value });
    return;
  }

  if (entity === 'routing') {
    const field = column as keyof RoutingEntry;
    const value = coerceValue('routing', column, msg.value);
    patchers.patchRoutingFromCollab(modelId, rowId, { [field]: value } as Partial<RoutingEntry>);
    return;
  }

  if (entity === 'ibom') {
    const field = column as keyof IBOMEntry;
    const value = coerceValue('ibom', column, msg.value);
    patchers.patchIBOMFromCollab(modelId, rowId, { [field]: value } as Partial<IBOMEntry>);
  }
}

export function OrgCollabProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const patchOperationFromCollab = useModelStore((s) => s.patchOperationFromCollab);
  const patchProductFromCollab = useModelStore((s) => s.patchProductFromCollab);
  const patchEquipmentFromCollab = useModelStore((s) => s.patchEquipmentFromCollab);
  const patchLaborFromCollab = useModelStore((s) => s.patchLaborFromCollab);
  const patchGeneralFromCollab = useModelStore((s) => s.patchGeneralFromCollab);
  const patchRoutingFromCollab = useModelStore((s) => s.patchRoutingFromCollab);
  const deleteRouting = useModelStore((s) => s.deleteRouting);
  const patchIBOMFromCollab = useModelStore((s) => s.patchIBOMFromCollab);

  const [status, setStatus] = useState<CollabConnectionStatus>('closed');
  const [presence, setPresence] = useState<Record<string, OrgPresenceUser>>({});
  const [locks, setLocks] = useState<Record<string, { locked_by: number | string; name?: string }>>({});
  const [pageEditLocks, setPageEditLocks] = useState<Record<string, PageEditLockInfo>>({});

  const socketRef = useRef(new CollabSocket());
  const pageEditAcquiredHandlersRef = useRef<
    Set<(msg: { scopeKey: string; locked_by: number | string }) => void>
  >(new Set());
  const pageEditDeniedHandlersRef = useRef<Set<(msg: { scopeKey: string; name: string }) => void>>(
    new Set(),
  );
  const remoteApplyRef = useRef(false);
  const broadcastTimersRef = useRef<Record<string, number>>({});
  const cellHandlersRef = useRef<Set<CellUpdatedHandler>>(new Set());
  const modelRefreshHandlersRef = useRef<Set<ModelRefreshedHandler>>(new Set());
  const upsertModelFromServer = useModelStore((s) => s.upsertModelFromServer);
  const loadModels = useModelStore((s) => s.loadModels);

  const enabled = Boolean(user?.id && user.organization_id && !user.must_change_password);

  const patchers = useMemo(
    () => ({
      patchOperationFromCollab,
      patchProductFromCollab,
      patchEquipmentFromCollab,
      patchLaborFromCollab,
      patchGeneralFromCollab,
      patchRoutingFromCollab,
      patchIBOMFromCollab,
    }),
    [
      patchOperationFromCollab,
      patchProductFromCollab,
      patchEquipmentFromCollab,
      patchLaborFromCollab,
      patchGeneralFromCollab,
      patchRoutingFromCollab,
      patchIBOMFromCollab,
    ],
  );

  useEffect(() => {
    const socket = socketRef.current;
    const unsubStatus = socket.onStatus(setStatus);
    const unsubMsg = socket.onMessage((raw) => {
      const msg = parseEvent(raw);
      if (!msg) return;

      if (msg.type === 'presence_snapshot' && Array.isArray((msg as { users?: unknown }).users)) {
        const users = (msg as { users: OrgPresenceUser[] }).users;
        const map: Record<string, OrgPresenceUser> = {};
        for (const u of users) map[String(u.user_id)] = u;
        if (user?.id != null) {
          map[String(user.id)] = { user_id: user.id, name: user.name || user.email };
        }
        setPresence(map);
        return;
      }

      if (msg.type === 'user_joined') {
        setPresence((prev) => ({
          ...prev,
          [String(msg.user_id)]: { user_id: msg.user_id, name: msg.name },
        }));
      } else if (msg.type === 'user_left') {
        const leftId = String(msg.user_id);
        setPresence((prev) => {
          const next = { ...prev };
          delete next[leftId];
          return next;
        });
        setLocks((prev) => {
          const next: typeof prev = {};
          for (const [k, v] of Object.entries(prev)) {
            if (String(v.locked_by) !== leftId) next[k] = v;
          }
          return next;
        });
      } else if (msg.type === 'update_denied') {
        const reason = String((msg as { reason?: string }).reason || 'save_failed');
        if (reason === 'not_lock_owner') {
          toast.message('Another user is editing that cell', { duration: 2500 });
        } else if (reason !== 'row_not_found') {
          toast.error('Could not save that change — try again or use Save');
        }
      } else if (msg.type === 'lock_denied') {
        const entity = String((msg as { entity?: string }).entity || 'operation');
        const modelId = String((msg as { model_id?: string }).model_id || '');
        const rowId = String(msg.row_id || '');
        const column = String(msg.column || '');
        const lockedBy = (msg as { locked_by?: number | string }).locked_by;
        const name = String((msg as { name?: string }).name || 'Another user');
        if (modelId && rowId && column && lockedBy != null) {
          setLocks((prev) => ({
            ...prev,
            [lockKey(entity, modelId, rowId, column)]: {
              locked_by: lockedBy,
              name,
            },
          }));
        }
        toast.message(`${name} is editing that cell`, { duration: 2500 });
      } else if (msg.type === 'cell_locked') {
        const entity = String((msg as { entity?: string }).entity || 'operation');
        const modelId = String((msg as { model_id?: string }).model_id || '');
        const rowId = String(msg.row_id || '');
        const column = String(msg.column || '');
        if (!modelId) return;
        setLocks((prev) => ({
          ...prev,
          [lockKey(entity, modelId, rowId, column)]: {
            locked_by: msg.locked_by,
            name: msg.name,
          },
        }));
      } else if (msg.type === 'cell_unlocked') {
        const entity = String((msg as { entity?: string }).entity || 'operation');
        const modelId = String((msg as { model_id?: string }).model_id || '');
        const rowId = String(msg.row_id || '');
        const column = String(msg.column || '');
        if (!modelId) return;
        setLocks((prev) => {
          const next = { ...prev };
          delete next[lockKey(entity, modelId, rowId, column)];
          return next;
        });
      } else if (msg.type === 'cell_updated') {
        patchFromCollabMessage(msg as CellUpdatedEvent, user?.id, patchers);
        for (const h of cellHandlersRef.current) {
          try {
            h(msg as CellUpdatedEvent);
          } catch {
            // ignore
          }
        }
      } else if (msg.type === 'model_refreshed') {
        const modelId = String((msg as { model_id?: string }).model_id || '');
        const updatedBy = (msg as { updated_by?: number | string }).updated_by;
        if (!modelId) return;
        if (user?.id != null && updatedBy != null && String(updatedBy) === String(user.id)) {
          return;
        }
        const scope = String((msg as { scope?: string }).scope || 'full');
        const editorName = String((msg as { name?: string }).name || 'Another user');
        void fetchModelById(modelId).then((fresh) => {
          if (!fresh) return;
          remoteApplyRef.current = true;
          try {
            upsertModelFromServer(fresh);
            const event: ModelRefreshedEvent = {
              type: 'model_refreshed',
              model_id: modelId,
              scope,
              updated_by: updatedBy,
              name: editorName,
              model: fresh,
            };
            for (const h of modelRefreshHandlersRef.current) {
              try {
                h(event);
              } catch {
                // ignore
              }
            }
            toast.message(`${editorName} updated the model`, { duration: 2500 });
          } finally {
            requestAnimationFrame(() => {
              remoteApplyRef.current = false;
            });
          }
        });
      } else if (msg.type === 'model_library_changed') {
        if (user?.id != null && String((msg as { updated_by?: number | string }).updated_by) === String(user.id)) {
          return;
        }
        void loadModels(true);
      } else if (msg.type === 'page_edit_changed') {
        const modelId = String((msg as { model_id?: string }).model_id || '');
        const page = String((msg as { page?: string }).page || '') as PageEditScope;
        const productId = (msg as { product_id?: string }).product_id;
        const active = Boolean((msg as { active?: boolean }).active);
        if (!modelId || !page) return;
        const scopeKey = pageEditScopeKey(modelId, page, productId ?? null);
        if (active) {
          const lockedBy = (msg as { locked_by?: number | string }).locked_by;
          const name = String((msg as { name?: string }).name || 'Someone');
          if (lockedBy == null) return;
          setPageEditLocks((prev) => ({
            ...prev,
            [scopeKey]: { locked_by: lockedBy, name },
          }));
        } else {
          setPageEditLocks((prev) => {
            const next = { ...prev };
            delete next[scopeKey];
            return next;
          });
        }
      } else if (msg.type === 'page_edit_acquired') {
        const modelId = String((msg as { model_id?: string }).model_id || '');
        const page = String((msg as { page?: string }).page || '') as PageEditScope;
        const productId = (msg as { product_id?: string }).product_id;
        const lockedBy = (msg as { locked_by?: number | string }).locked_by ?? user?.id;
        const name = String((msg as { name?: string }).name || user?.name || user?.email || 'You');
        if (!modelId || !page || lockedBy == null) return;
        const scopeKey = pageEditScopeKey(modelId, page, productId ?? null);
        setPageEditLocks((prev) => ({
          ...prev,
          [scopeKey]: { locked_by: lockedBy, name },
        }));
      } else if (msg.type === 'page_edit_denied') {
        const modelId = String((msg as { model_id?: string }).model_id || '');
        const page = String((msg as { page?: string }).page || '') as PageEditScope;
        const productId = (msg as { product_id?: string }).product_id;
        const name = String((msg as { name?: string }).name || 'Another user');
        const lockedBy = (msg as { locked_by?: number | string }).locked_by;
        if (!modelId || !page) return;
        const scopeKey = pageEditScopeKey(modelId, page, productId ?? null);
        if (lockedBy != null) {
          setPageEditLocks((prev) => ({
            ...prev,
            [scopeKey]: { locked_by: lockedBy, name },
          }));
        } else {
          setPageEditLocks((prev) => {
            const next = { ...prev };
            delete next[scopeKey];
            return next;
          });
        }
        for (const h of pageEditDeniedHandlersRef.current) {
          try {
            h({ scopeKey, name });
          } catch {
            // ignore
          }
        }
      }
    });

    socket.connect('/ws/org/', enabled);

    return () => {
      unsubStatus();
      unsubMsg();
      socket.connect('', false);
      setPresence({});
      setLocks({});
      setPageEditLocks({});
    };
  }, [enabled, user?.id, user?.name, user?.email, patchers, upsertModelFromServer, loadModels]);

  const liveCount = useMemo(() => {
    const n = Object.keys(presence).length;
    return status === 'open' ? Math.max(n, 1) : 0;
  }, [presence, status]);

  const getCellLock = useCallback(
    (modelId: string, entity: CollabEntity, rowId: string, column: string): CellLockInfo => {
      const lock = locks[lockKey(entity, modelId, rowId, column)];
      if (!lock) {
        return { isLockedByOther: false, isLockedBySelf: false, editorName: null };
      }
      const isSelf = user?.id != null && String(lock.locked_by) === String(user.id);
      return {
        isLockedByOther: !isSelf,
        isLockedBySelf: isSelf,
        editorName: lock.name || (isSelf ? null : 'Someone'),
      };
    },
    [locks, user?.id],
  );

  const isLockedByOther = useCallback(
    (modelId: string, entity: CollabEntity, rowId: string, column: string) =>
      getCellLock(modelId, entity, rowId, column).isLockedByOther,
    [getCellLock],
  );

  const applyLocalStorePatch = useCallback(
    (modelId: string, entity: CollabEntity, rowId: string, field: string, value: unknown) => {
      if (entity === 'operation') {
        patchOperationFromCollab(modelId, rowId, { [field]: value } as Partial<Operation>);
      } else if (entity === 'product') {
        patchProductFromCollab(modelId, rowId, { [field]: value } as Partial<Product>);
      } else if (entity === 'equipment') {
        patchEquipmentFromCollab(modelId, rowId, { [field]: value } as Partial<EquipmentGroup>);
      } else if (entity === 'labor') {
        patchLaborFromCollab(modelId, rowId, { [field]: value } as Partial<LaborGroup>);
      } else if (entity === 'general') {
        patchGeneralFromCollab(modelId, { [field]: value });
      } else if (entity === 'routing') {
        patchRoutingFromCollab(modelId, rowId, { [field]: value } as Partial<RoutingEntry>);
      } else if (entity === 'ibom') {
        patchIBOMFromCollab(modelId, rowId, { [field]: value } as Partial<IBOMEntry>);
      }
    },
    [
      patchOperationFromCollab,
      patchProductFromCollab,
      patchEquipmentFromCollab,
      patchLaborFromCollab,
      patchGeneralFromCollab,
      patchRoutingFromCollab,
      patchIBOMFromCollab,
    ],
  );

  const persistAndBroadcast = useCallback(
    async (modelId: string, entity: CollabEntity, rowId: string, field: string, value: unknown) => {
      const column = collabWireColumn(entity, field);
      if (!column) return;
      let canonicalRowId = rowId;
      try {
        const persistResult = await persistCollabCellToDb(
          modelId,
          entity,
          rowId,
          field,
          value,
        );
        if (persistResult?.canonicalRowId) {
          canonicalRowId = persistResult.canonicalRowId;
        }
        if (
          entity === 'routing' &&
          persistResult?.merged &&
          canonicalRowId !== rowId
        ) {
          deleteRouting(modelId, rowId);
          window.dispatchEvent(
            new CustomEvent('rmct-routing-merged', {
              detail: { modelId, fromId: rowId, toId: canonicalRowId, field, value },
            }),
          );
        }
        applyLocalStorePatch(modelId, entity, canonicalRowId, field, value);
      } catch (err) {
        console.error('persistCollabCellToDb', err);
        toast.error('Could not save that change');
        return;
      }
      if (socketRef.current.ready) {
        socketRef.current.send({
          type: 'update_cell',
          entity,
          model_id: modelId,
          row_id: canonicalRowId,
          column,
          value,
        });
      }
    },
    [applyLocalStorePatch, deleteRouting],
  );

  const scheduleCellUpdate = useCallback(
    (modelId: string, entity: CollabEntity, rowId: string, field: string, value: unknown) => {
      if (remoteApplyRef.current) return;
      const column = collabWireColumn(entity, field);
      if (!column) return;
      const timerKey = lockKey(entity, modelId, rowId, column);
      const existing = broadcastTimersRef.current[timerKey];
      if (existing) window.clearTimeout(existing);
      broadcastTimersRef.current[timerKey] = window.setTimeout(() => {
        delete broadcastTimersRef.current[timerKey];
        void persistAndBroadcast(modelId, entity, rowId, field, value);
      }, 200);
    },
    [persistAndBroadcast],
  );

  const flushCellUpdate = useCallback(
    (modelId: string, entity: CollabEntity, rowId: string, field: string, value: unknown) => {
      if (remoteApplyRef.current) return;
      const column = collabWireColumn(entity, field);
      if (!column) return;
      const timerKey = lockKey(entity, modelId, rowId, column);
      const existing = broadcastTimersRef.current[timerKey];
      if (existing) {
        window.clearTimeout(existing);
        delete broadcastTimersRef.current[timerKey];
      }
      void persistAndBroadcast(modelId, entity, rowId, field, value);
    },
    [persistAndBroadcast],
  );

  const lockCell = useCallback(
    (modelId: string, entity: CollabEntity, rowId: string, column: string) => {
      socketRef.current.send({
        type: 'lock_cell',
        entity,
        model_id: modelId,
        row_id: rowId,
        column,
      });
    },
    [],
  );

  const notifyModelSaved = useCallback((modelId: string, scope = 'full') => {
    if (!socketRef.current.ready) return;
    socketRef.current.send({
      type: 'notify_model_saved',
      model_id: modelId,
      scope,
    });
  }, []);

  const notifyModelLibraryChanged = useCallback(() => {
    if (!socketRef.current.ready) return;
    socketRef.current.send({ type: 'notify_model_library_changed' });
  }, []);

  const getPageEditLock = useCallback(
    (scopeKey: string) => pageEditLocks[scopeKey] ?? null,
    [pageEditLocks],
  );

  const acquirePageEdit = useCallback(
    (modelId: string, page: PageEditScope, productId?: string) => {
      if (!socketRef.current.ready) {
        toast.error('Not connected — cannot start editing');
        return;
      }
      const scopeKey = pageEditScopeKey(modelId, page, productId ?? null);
      const displayName = user?.name || user?.email || 'You';
      if (user?.id != null) {
        setPageEditLocks((prev) => {
          const existing = prev[scopeKey];
          if (existing && String(existing.locked_by) !== String(user.id)) {
            return prev;
          }
          return {
            ...prev,
            [scopeKey]: { locked_by: user.id, name: displayName },
          };
        });
      }
      const payload: Record<string, unknown> = {
        type: 'acquire_page_edit',
        model_id: modelId,
        page,
      };
      if (productId) payload.product_id = productId;
      socketRef.current.send(payload);
    },
    [user?.email, user?.id, user?.name],
  );

  const releasePageEdit = useCallback(
    (modelId: string, page: PageEditScope, productId?: string) => {
      const scopeKey = pageEditScopeKey(modelId, page, productId ?? null);
      setPageEditLocks((prev) => {
        const next = { ...prev };
        delete next[scopeKey];
        return next;
      });
      if (!socketRef.current.ready) return;
      const payload: Record<string, unknown> = {
        type: 'release_page_edit',
        model_id: modelId,
        page,
      };
      if (productId) payload.product_id = productId;
      socketRef.current.send(payload);
    },
    [],
  );

  const onPageEditAcquired = useCallback(
    (handler: (msg: { scopeKey: string; locked_by: number | string }) => void) => {
      pageEditAcquiredHandlersRef.current.add(handler);
      return () => pageEditAcquiredHandlersRef.current.delete(handler);
    },
    [],
  );

  const onPageEditDenied = useCallback(
    (handler: (msg: { scopeKey: string; name: string }) => void) => {
      pageEditDeniedHandlersRef.current.add(handler);
      return () => pageEditDeniedHandlersRef.current.delete(handler);
    },
    [],
  );

  const unlockCell = useCallback(
    (modelId: string, entity: CollabEntity, rowId: string, column: string) => {
      setLocks((prev) => {
        const next = { ...prev };
        delete next[lockKey(entity, modelId, rowId, column)];
        return next;
      });
      socketRef.current.send({
        type: 'unlock_cell',
        entity,
        model_id: modelId,
        row_id: rowId,
        column,
      });
    },
    [],
  );

  const value = useMemo<OrgCollabContextValue>(
    () => ({
      status,
      presence: Object.values(presence),
      liveCount,
      locks,
      getCellLock,
      isLockedByOther,
      lockCell,
      unlockCell,
      scheduleCellUpdate,
      flushCellUpdate,
      onCellUpdated: (handler) => {
        cellHandlersRef.current.add(handler);
        return () => cellHandlersRef.current.delete(handler);
      },
      notifyModelSaved,
      notifyModelLibraryChanged,
      onModelRefreshed: (handler) => {
        modelRefreshHandlersRef.current.add(handler);
        return () => modelRefreshHandlersRef.current.delete(handler);
      },
      beginRemoteApply: () => {
        remoteApplyRef.current = true;
      },
      endRemoteApply: () => {
        remoteApplyRef.current = false;
      },
      pageEditLocks,
      getPageEditLock,
      acquirePageEdit,
      releasePageEdit,
      onPageEditAcquired,
      onPageEditDenied,
    }),
    [
      status,
      presence,
      liveCount,
      locks,
      getCellLock,
      isLockedByOther,
      lockCell,
      unlockCell,
      scheduleCellUpdate,
      flushCellUpdate,
      notifyModelSaved,
      notifyModelLibraryChanged,
      pageEditLocks,
      getPageEditLock,
      acquirePageEdit,
      releasePageEdit,
      onPageEditAcquired,
      onPageEditDenied,
    ],
  );

  return <OrgCollabContext.Provider value={value}>{children}</OrgCollabContext.Provider>;
}

export function useOrgCollab() {
  const ctx = useContext(OrgCollabContext);
  if (!ctx) throw new Error('useOrgCollab must be used within OrgCollabProvider');
  return ctx;
}

export function useOrgCollabOptional() {
  return useContext(OrgCollabContext);
}
