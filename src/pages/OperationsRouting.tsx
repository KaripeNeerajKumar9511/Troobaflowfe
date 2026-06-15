import { useState, useMemo, useRef, useEffect, useCallback, type ReactElement } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useModelStore, displayParamNames, SHOW_PARAM_VARIABLE_FIELDS_IN_UI, type Operation, type RoutingEntry, type Model } from '@/stores/modelStore';
import { apiFetch } from '@/lib/api';
import { db, fetchModelById } from '@/lib/supabaseData';
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';
import { DeleteConfirmInline } from '@/components/DeleteConfirmInline';
import { useScenarioStore } from '@/stores/scenarioStore';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useUserLevelStore, isVisible } from '@/hooks/useUserLevel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Trash2, Wand2, AlertTriangle, SortAsc, FlaskConical, Calculator, FunctionSquare, Lock, Zap, CheckCircle, Package, GitBranch, Table2, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';
import { buildCombinedRouting } from '@/lib/autoRoutingCombine';
import { FormulaBuilder } from '@/components/FormulaBuilder';
import { InterpolateCalculator } from '@/components/InterpolateCalculator';
import { ProductSelectorBar } from '@/components/ProductSelectorBar';
import { OperationsEmptyState } from '@/components/OperationsEmptyState';
import { OperationEquipTimeInput } from '@/components/OperationEquipTimeInput';
import { NonNegativeNumericInput } from '@/components/NonNegativeNumericInput';
import { canEditOperationEquipField, isPureLaborOperation } from '@/lib/pureLaborOperations';
import { useCollabCell } from '@/hooks/useCollabCell';
import { useModelRefreshSync } from '@/hooks/useModelRefreshSync';
import { useOrgCollab } from '@/contexts/OrgCollabContext';
import { syncModelToOrg } from '@/lib/collabSync';
import { cloneProductDraftFromModel, operationsNeedSave } from '@/lib/draftDirty';
import {
  mergeProductDraftIntoModel,
  normalizeProductOperations,
  productOperationsNeedDockCleanup,
} from '@/lib/productOperations';
import { persistOperationsProductDraft } from '@/lib/pageEditPersist';
import { usePageEditMode, usePageEditLockState } from '@/hooks/usePageEditMode';
import { usePageEditBaseline } from '@/hooks/usePageEditBaseline';
import { PageEditActions } from '@/components/PageEditActions';
import { PageEditLockedShell } from '@/components/PageEditLockedShell';
import { usePageEditLeaveGuard } from '@/hooks/usePageEditLeaveGuard';
import { PageSavingOverlay } from '@/components/PageEditLeaveGuard';
import { pageEditCell } from '@/lib/pageEditCell';
import { DoubleClickEditableName } from '@/components/DoubleClickEditableName';
import { HoverValueTooltip } from '@/components/HoverValueTooltip';

import { InlineRoutingEditor } from '@/components/InlineRoutingEditor';
import { RoutingFlowGraph, type RoutingFlowGraphHandle } from '@/components/RoutingFlowGraph';
import { AutoRoutingDialog } from '@/components/AutoRoutingDialog';

const SYSTEM_OPS = ['DOCK', 'STOCK', 'SCRAP'];



export default function OperationsRouting() {
  usePageTitle('Operations & Routing');
  const navigate = useNavigate();
  const model = useModelStore((s) => s.getActiveModel());

  const activeScenarioId = useScenarioStore(s => s.activeScenarioId);
  const activeScenario = useScenarioStore(s => s.scenarios.find(sc => sc.id === s.activeScenarioId));
  const applyScenarioChange = useScenarioStore(s => s.applyScenarioChange);

  const { userLevel } = useUserLevelStore();
  const showFormulaBuilder = isVisible('formula_builder', userLevel);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProductId = searchParams.get('product') || '';
  const [showAddOp, setShowAddOp] = useState(false);
  const [newOpName, setNewOpName] = useState('');
  const [newOpNumber, setNewOpNumber] = useState(10);
  const [newOpEquip, setNewOpEquip] = useState('');
  const [showAdvancedTimes, setShowAdvancedTimes] = useState(false);
  const [expandedRoutingOp, setExpandedRoutingOp] = useState<string | null>(null);
  const [showRoutingGraph, setShowRoutingGraph] = useState(false);
  const [graphHasMoved, setGraphHasMoved] = useState(false);
  const [showAutoRouting, setShowAutoRouting] = useState(false);
  const [editingOpNameId, setEditingOpNameId] = useState<string | null>(null);
  const { pendingDeleteId, requestDelete, cancelDelete, confirmDelete } = useDeleteConfirmation();

  const newOpNameRef = useRef<HTMLInputElement>(null);
  const graphRef = useRef<RoutingFlowGraphHandle>(null);

  // Formula Builder state
  const [formulaTarget, setFormulaTarget] = useState<{ op: Operation; field: string; label: string; value: number } | null>(null);
  const [showInterpolator, setShowInterpolator] = useState(false);
  const [draftOps, setDraftOps] = useState<Operation[]>([]);
  const [draftRouting, setDraftRouting] = useState<RoutingEntry[]>([]);
  const [syncing, setSyncing] = useState(false);
  const editingRef = useRef(false);
  const lastProductRef = useRef<string | null>(null);
  const effectiveProductIdRef = useRef('');
  const draftOpsRef = useRef(draftOps);
  const draftRoutingRef = useRef(draftRouting);
  draftOpsRef.current = draftOps;
  draftRoutingRef.current = draftRouting;
  const collab = useOrgCollab();
  const { wrapCell: wrapOpCell } = useCollabCell(model?.id, 'operation');
  const { wrapCell: wrapRouteCell } = useCollabCell(model?.id, 'routing');

  // Auto-select first product if none selected
  const effectiveProductId = selectedProductId && model?.products.find(p => p.id === selectedProductId)
    ? selectedProductId
    : model?.products[0]?.id || '';

  effectiveProductIdRef.current = effectiveProductId;
  const effectiveProduct = model?.products.find(p => p.id === effectiveProductId);
  const productLabel = effectiveProduct?.name || 'this product';

  const applyProductDraft = useCallback((source: Model, productId: string) => {
    const rawOps = (source.operations ?? []).filter(
      (o) => o.product_id === productId && o.op_name !== 'STOCK' && o.op_name !== 'SCRAP',
    );
    const { ops, routing } = cloneProductDraftFromModel(source, productId);
    if (productOperationsNeedDockCleanup(rawOps)) {
      toast.info('Duplicate DOCK removed. Save operations to update the server.');
    }
    draftOpsRef.current = ops;
    draftRoutingRef.current = routing;
    setDraftOps(ops);
    setDraftRouting(routing);
    lastProductRef.current = productId;
  }, []);

  const { isHolder } = usePageEditLockState(model?.id, 'operations', effectiveProductId);
  const editBaseline = usePageEditBaseline(isHolder, model);
  const compareModel = editBaseline ?? model;
  const isDirty =
    compareModel && effectiveProductId
      ? operationsNeedSave(compareModel, effectiveProductId, draftOps, draftRouting)
      : false;

  const pageEdit = usePageEditMode({
    modelId: model?.id,
    page: 'operations',
    productId: effectiveProductId || undefined,
    pageLabel: `Operations for ${productLabel}`,
    isDirty,
    onDiscard: () => {
      if (editBaseline && effectiveProductId) applyProductDraft(editBaseline, effectiveProductId);
      else if (model && effectiveProductId) applyProductDraft(model, effectiveProductId);
      setEditingOpNameId(null);
    },
    onSave: async () => {
      if (!model || !effectiveProductId) {
        throw new Error('No product selected');
      }
      if (!editBaseline) {
        throw new Error('Edit session not ready — try again');
      }
      setSyncing(true);
      try {
        const opsNorm = normalizeProductOperations(draftOpsRef.current);
        const routing = draftRoutingRef.current;
        await persistOperationsProductDraft(
          model.id,
          effectiveProductId,
          opsNorm,
          routing,
          editBaseline,
        );
        useModelStore.getState().upsertModelFromServer(
          mergeProductDraftIntoModel(model, effectiveProductId, opsNorm, routing),
        );
        const fresh = await syncModelToOrg(collab, model.id, 'operations');
        if (fresh) applyProductDraft(fresh, effectiveProductId);
        else applyProductDraft(
          mergeProductDraftIntoModel(model, effectiveProductId, opsNorm, routing),
          effectiveProductId,
        );
        setEditingOpNameId(null);
      } finally {
        setSyncing(false);
      }
    },
  });

  editingRef.current = pageEdit.isEditing;

  const { confirmLeave, leaveDialog } = usePageEditLeaveGuard({
    isEditing: pageEdit.isEditing,
    isDirty,
    saving: pageEdit.saving || syncing,
    leaveDescription: `You have unsaved changes for ${productLabel}. Save before switching products or leaving this page?`,
    onSave: pageEdit.save,
    onDiscard: pageEdit.discard,
  });

  useModelRefreshSync(model?.id, (fresh) => {
    if (editingRef.current) return;
    const pid = effectiveProductIdRef.current;
    if (!pid) return;
    applyProductDraft(fresh, pid);
  });

  useEffect(() => {
    if (!model?.id) return;
    const onMerged = (ev: Event) => {
      const e = ev as CustomEvent<{
        modelId: string;
        fromId: string;
        toId: string;
        field: string;
        value: unknown;
      }>;
      if (e.detail?.modelId !== model.id) return;
      const { fromId, toId, field, value } = e.detail;
      setDraftRouting((prev) =>
        prev
          .filter((r) => r.id !== fromId)
          .map((r) => (r.id === toId ? { ...r, [field]: value } as RoutingEntry : r)),
      );
    };
    window.addEventListener('rmct-routing-merged', onMerged);
    return () => window.removeEventListener('rmct-routing-merged', onMerged);
  }, [model?.id]);

  const pruneNotice = useModelStore((s) => s.autoRoutingNotices[effectiveProductId]);
  const clearAutoRoutingNotice = useModelStore((s) => s.clearAutoRoutingNotice);
  const deleteProductLocal = useModelStore((s) => s.deleteProductLocal);
  const addProductLocal = useModelStore((s) => s.addProductLocal);
  const addOperationLocal = useModelStore((s) => s.addOperationLocal);
  const setRoutingLocal = useModelStore((s) => s.setRoutingLocal);

  // Reload draft from server when product changes or model updates (same pattern as IBOM).
  useEffect(() => {
    if (!model || !effectiveProductId) return;
    if (isHolder) return;
    applyProductDraft(model, effectiveProductId);
  }, [model, effectiveProductId, applyProductDraft, isHolder]);

  // Filter out STOCK/SCRAP from operations display — they are routing-only destinations
  const productOps = useMemo(
    () => [...draftOps].sort((a, b) => a.op_number - b.op_number),
    [draftOps],
  );

  // User-added operations = everything except DOCK
  const userOps = useMemo(() => productOps.filter(o => o.op_name !== 'DOCK'), [productOps]);
  const hasUserOps = userOps.length > 0;
  const showEmptyState = !hasUserOps;

  // Clean up orphaned DOCK-only state (e.g. from removed "Direct to Stock" feature) — local draft until Save
  useEffect(() => {
    if (!effectiveProductId || hasUserOps) return;
    const dockOp = productOps.find(o => o.op_name === 'DOCK');
    if (!dockOp) return;
    setDraftOps((prev) => prev.filter((o) => o.id !== dockOp.id));
    setDraftRouting((prev) => prev.filter((r) => r.product_id !== effectiveProductId));
  }, [effectiveProductId, hasUserOps, productOps]);

  const productRouting = useMemo(
    () => draftRouting.filter((r) => String(r.product_id) === String(effectiveProductId)),
    [draftRouting, effectiveProductId],
  );

  const operationsForProductBar = useMemo(() => {
    if (!model) return [];
    if (!effectiveProductId) return model.operations ?? [];
    const stockScrap = (model.operations ?? []).filter(
      (o) => o.product_id === effectiveProductId && (o.op_name === 'STOCK' || o.op_name === 'SCRAP'),
    );
    const rest = (model.operations ?? []).filter((o) => o.product_id !== effectiveProductId);
    return [...rest, ...draftOps, ...stockScrap];
  }, [model, effectiveProductId, draftOps]);

  // All user op names (for routing destination dropdowns)
  const userOpNames = useMemo(() => productOps.map(o => o.op_name).filter(n => n !== 'DOCK'), [productOps]);

  // Get routes for a specific op
  const getRoutesForOp = (opName: string) => productRouting.filter(r => r.from_op_name === opName);

  const productRoutes = useMemo(() => {
    const routesMap: Record<string, RoutingEntry[]> = {};
    productOps.forEach((op) => {
      routesMap[op.op_name] = getRoutesForOp(op.op_name);
    });
    return routesMap;
  }, [productOps, productRouting]);
  // ── Routing completeness ────────────────────────────────────
  // ── Dead-end / unreachable detection ─────────────────────────
  const { deadEndOps, unreachableOps } = useMemo(() => {
    const deadEnds = new Set<string>();
    const unreachable = new Set<string>();
    const allUserOpNames = userOps.map(o => o.op_name);
    if (allUserOpNames.length === 0) return { deadEndOps: deadEnds, unreachableOps: unreachable };

    // Build set of ops that receive incoming routes from other ops
    const opsWithIncoming = new Set<string>();
    for (const r of productRouting) {
      if (r.to_op_name !== 'STOCK' && r.to_op_name !== 'SCRAP') {
        opsWithIncoming.add(r.to_op_name);
      }
    }
    // Find ops whose outgoing routes ALL go to STOCK/SCRAP (fully terminal)
    for (const opName of allUserOpNames) {
      const routes = productRouting.filter(r => r.from_op_name === opName);
      if (routes.length === 0) continue;
      const allTerminal = routes.every(r => r.to_op_name === 'STOCK' || r.to_op_name === 'SCRAP');
      if (allTerminal) {
        // Check if there are user ops that become unreachable because of this termination
        // An op is unreachable if nothing routes to it (except DOCK which gets incoming from outside)
        // Only flag as dead-end if there are unreachable ops that exist
        deadEnds.add(opName);
      }
    }

   

    // Find unreachable user ops: no incoming route from any other op, and not DOCK
    for (const opName of allUserOpNames) {
      if (!opsWithIncoming.has(opName)) {
        unreachable.add(opName);
      }
    }

    // Only flag dead-ends if there are actually unreachable ops
    // And only flag if dead-end + unreachable coexist
    if (unreachable.size === 0) {
      deadEnds.clear();
    }
    // If all user ops are unreachable (e.g. DOCK routes to STOCK), keep dead-end flags
    // But if no dead-ends exist, don't flag unreachable (they may just have no routing yet)
    if (deadEnds.size === 0) {
      unreachable.clear();
    }

    return { deadEndOps: deadEnds, unreachableOps: unreachable };
  }, [userOps, productRouting]);

  const routingStatus = useMemo(() => {
    // Only user ops (not DOCK) need routing
    const opsNeedingRouting = productOps.filter(o => o.op_name !== 'DOCK');
    // Plus DOCK itself needs outgoing routing
    const allFromOps = ['DOCK', ...opsNeedingRouting.map(o => o.op_name)];

    if (allFromOps.length <= 1 && productOps.length <= 1) return 'empty';

    let complete = true;

    // Condition D: No operation has % Assign > 100
    for (const op of opsNeedingRouting) {
      if (op.pct_assigned > 100) { complete = false; break; }
    }

    for (const opName of allFromOps) {
      if (opName === 'DOCK' && productOps.length <= 1) continue;
      const routes = productRouting.filter(r => r.from_op_name === opName);
      // Condition A: every op has at least one outgoing path
      if (routes.length === 0) { complete = false; break; }
      // Condition B: sum of % Routed must be exactly 100 (integer check)
      const total = routes.reduce((s, r) => s + r.pct_routed, 0);
      if (total !== 100) { complete = false; break; }
      // Condition C: no duplicate destinations
      const destSet = new Set(routes.map(r => r.to_op_name));
      if (destSet.size !== routes.length) { complete = false; break; }
    }

    // Check all paths reach STOCK or SCRAP (dead-end check)
    if (complete) {
      const opsWithOutgoing = new Set(productRouting.map(r => r.from_op_name));
      const allTargets = new Set(productRouting.map(r => r.to_op_name));
      allTargets.forEach(name => {
        if (name === 'STOCK' || name === 'SCRAP') return;
        if (!opsWithOutgoing.has(name)) complete = false;
      });
    }

    // Condition E: no dead-ends or unreachable ops
    if (complete && (deadEndOps.size > 0 || unreachableOps.size > 0)) {
      complete = false;
    }

    return complete ? 'complete' : 'incomplete';
  }, [productOps, productRouting, deadEndOps, unreachableOps]);

  const hasAnyRouting = productRouting.length > 0;
  const [showAutoRouteConfirm, setShowAutoRouteConfirm] = useState(false);
  const [showClearRoutingConfirm, setShowClearRoutingConfirm] = useState(false);

  // ── Handlers (auto-save + org broadcast) ─────────────────────
  const handleAddFirstOps = () => {
    setNewOpNumber(10);
    setShowAddOp(true);
  };

  const handleAddOp = () => {
    if (!model || !newOpName.trim() || !pageEdit.canEditFields) return;
    const newName = newOpName.trim().toUpperCase();
    if (SYSTEM_OPS.includes(newName)) {
      toast.error(`"${newName}" is a reserved system operation`);
      return;
    }
    if (productOps.some((o) => o.op_name.toUpperCase() === newName)) {
      toast.error('An operation with this name already exists in this product');
      return;
    }
    const hasDock = productOps.some(o => o.op_name === 'DOCK');
    let nextOps = [...draftOps];
    if (!hasDock) {
      nextOps.push({
        id: crypto.randomUUID(), product_id: effectiveProductId,
        op_name: 'DOCK', op_number: 0,
        equip_id: '', pct_assigned: 100,
        equip_setup_lot: 0, equip_setup_piece: 0, equip_setup_tbatch: 0,
        equip_run_piece: 0, equip_run_lot: 0, equip_run_tbatch: 0,
        labor_setup_lot: 0, labor_setup_piece: 0, labor_setup_tbatch: 0,
        labor_run_piece: 0, labor_run_lot: 0, labor_run_tbatch: 0,
        oper1: 0, oper2: 0, oper3: 0, oper4: 0,
      });
    }
    const newOpId = crypto.randomUUID();
    nextOps.push({
      id: newOpId, product_id: effectiveProductId,
      op_name: newName, op_number: newOpNumber,
      equip_id: newOpEquip, pct_assigned: 100,
      equip_setup_lot: 0, equip_setup_piece: 0, equip_setup_tbatch: 0,
      equip_run_piece: 0, equip_run_lot: 0, equip_run_tbatch: 0,
      labor_setup_lot: 0, labor_setup_piece: 0, labor_setup_tbatch: 0,
      labor_run_piece: 0, labor_run_lot: 0, labor_run_tbatch: 0,
      oper1: 0, oper2: 0, oper3: 0, oper4: 0,
    });
    const opsNorm = normalizeProductOperations(nextOps);
    draftOpsRef.current = opsNorm;
    setDraftOps(opsNorm);

    const currentRouting = draftRouting.filter(r => r.product_id === effectiveProductId);
    if (currentRouting.length > 0) {
      const allUserOpsWithNew = [
        ...userOps,
        { op_name: newName, op_number: newOpNumber } as Operation,
      ].sort((a, b) => a.op_number - b.op_number);

      const allOpsChain = [
        { op_name: 'DOCK', op_number: -Infinity } as Operation,
        ...allUserOpsWithNew,
      ];

      const newIdx = allOpsChain.findIndex(o => o.op_name === newName);
      const predecessor = allOpsChain[newIdx - 1];
      const successor = newIdx < allOpsChain.length - 1 ? allOpsChain[newIdx + 1] : null;
      const successorName = successor ? successor.op_name : 'STOCK';

      let nextRouting = [...draftRouting];
      const predRouteToSuccessor = currentRouting.find(
        r => r.from_op_name === predecessor.op_name && r.to_op_name === successorName
      );
      if (predRouteToSuccessor) {
        nextRouting = nextRouting.filter(r => r.id !== predRouteToSuccessor.id);
      }
      nextRouting.push({
        id: crypto.randomUUID(), product_id: effectiveProductId,
        from_op_name: predecessor.op_name, to_op_name: newName, pct_routed: 100,
      });
      nextRouting.push({
        id: crypto.randomUUID(), product_id: effectiveProductId,
        from_op_name: newName, to_op_name: successorName, pct_routed: 100,
      });
      setDraftRouting(nextRouting);
      setExpandedRoutingOp(newName);
    }

    setNewOpNumber(newOpNumber + 10);
    setNewOpName('');
    setNewOpEquip('');
    setShowAddOp(false);
    toast.success('Operation added');
  };

  const handleAutoRoute = () => {
    if (!model) return;
    const sorted = productOps.filter(o => o.op_name !== 'DOCK').sort((a, b) => a.op_number - b.op_number);
    const entries: RoutingEntry[] = [];
    if (sorted.length === 0) {
      entries.push({ id: crypto.randomUUID(), product_id: effectiveProductId, from_op_name: 'DOCK', to_op_name: 'STOCK', pct_routed: 100 });
    } else {
      entries.push({ id: crypto.randomUUID(), product_id: effectiveProductId, from_op_name: 'DOCK', to_op_name: sorted[0].op_name, pct_routed: 100 });
      for (let i = 0; i < sorted.length - 1; i++) {
        entries.push({ id: crypto.randomUUID(), product_id: effectiveProductId, from_op_name: sorted[i].op_name, to_op_name: sorted[i + 1].op_name, pct_routed: 100 });
      }
      entries.push({ id: crypto.randomUUID(), product_id: effectiveProductId, from_op_name: sorted[sorted.length - 1].op_name, to_op_name: 'STOCK', pct_routed: 100 });
    }
    setDraftRouting((prev) => [...prev.filter(r => r.product_id !== effectiveProductId), ...entries]);
    setShowAutoRouteConfirm(false);
    toast.success('Routing generated');
  };

  const handleAutoGenerateClick = () => {
    if (!hasUserOps) {
      toast.error('Add at least one operation before generating routing.');
      return;
    }
    if (hasAnyRouting) {
      setShowAutoRouteConfirm(true);
    } else {
      handleAutoRoute();
    }
  };

  const handleResort = () => {
    if (!pageEdit.canEditFields) return;
    const nonDock = productOps.filter(o => o.op_name !== 'DOCK');
    const idToNum = new Map(nonDock.map((op, i) => [op.id, (i + 1) * 10]));
    setDraftOps((prev) => prev.map((o) => {
      const n = idToNum.get(o.id);
      return n != null ? { ...o, op_number: n } : o;
    }));
    toast.success('Operations re-sorted');
  };

  const handleDeleteOperation = (opId: string) => {
    if (!pageEdit.canEditFields) return;
    const op = productOps.find(o => o.id === opId);
    if (!op || op.op_name === 'DOCK') return;

    const remainingUserOps = userOps.filter(o => o.id !== opId);
    if (remainingUserOps.length === 0) {
      const dockOp = productOps.find(o => o.op_name === 'DOCK');
      setDraftOps((prev) => prev.filter(o => o.id !== opId && o.id !== dockOp?.id));
      setDraftRouting((prev) => prev.filter(r => r.product_id !== effectiveProductId));
      setExpandedRoutingOp(null);
      toast.success(`All operations cleared. ${effectiveProduct?.name} has no operations defined.`);
    } else {
      setDraftOps((prev) => prev.filter(o => o.id !== opId));
      setDraftRouting((prev) => prev.filter(r =>
        !(r.product_id === effectiveProductId && (r.from_op_name === op.op_name || r.to_op_name === op.op_name)),
      ));
    }
  };

  const tryCommitOpName = (opId: string, raw: string): boolean => {
    if (!pageEdit.canEditFields) return false;
    const next = raw.trim().toUpperCase();
    if (!next) return false;
    const op = draftOps.find((o) => o.id === opId);
    if (!op || op.op_name === 'DOCK') return false;
    if (op.op_name === next) return true;
    if (SYSTEM_OPS.includes(next)) {
      toast.error(`"${next}" is a reserved system operation`);
      return false;
    }
    const siblings = draftOps.filter((o) => o.product_id === op.product_id);
    if (siblings.some((o) => o.id !== opId && o.op_name.toUpperCase() === next)) {
      toast.error('Another operation in this product already uses this name');
      return false;
    }
    const oldName = op.op_name;
    setDraftOps((prev) => {
      const updated = normalizeProductOperations(
        prev.map((o) => (o.id === opId ? { ...o, op_name: next } : o)),
      );
      draftOpsRef.current = updated;
      return updated;
    });
    setDraftRouting((prev) => {
      const updated = prev.map((r) => {
        if (r.product_id !== op.product_id) return r;
        return {
          ...r,
          from_op_name: r.from_op_name === oldName ? next : r.from_op_name,
          to_op_name: r.to_op_name === oldName ? next : r.to_op_name,
        };
      });
      draftRoutingRef.current = updated;
      return updated;
    });
    if (expandedRoutingOp === oldName) setExpandedRoutingOp(next);
    return true;
  };

  const equipmentGroupLabel = (equipId: string) =>
    equipId ? (model?.equipment.find((e) => e.id === equipId)?.name ?? 'None') : 'None';

  const handleOpFieldChange = (op: Operation, field: string, value: number | string | boolean) => {
    if (!pageEdit.canEditFields) return;
    if (model && !canEditOperationEquipField(op, field, model.equipment)) return;
    if (model && activeScenarioId && activeScenario) {
      const productName = model.products.find(p => p.id === op.product_id)?.name || '';
      const entityName = `${productName}: ${op.op_name}`;
      applyScenarioChange(activeScenarioId, 'Routing', op.id, entityName, field, field, value as string | number);
    }
    setDraftOps((prev) => {
      const next = normalizeProductOperations(
        prev.map((o) => (o.id === op.id ? { ...o, [field]: value } : o)),
      );
      draftOpsRef.current = next;
      return next;
    });
  };

  const collabWrap = (op: Operation, field: string, input: React.ReactElement) =>
    pageEditCell(pageEdit.canEditFields, input, (c) => wrapOpCell(op.id, field, c));

  const requestProductSwitch = (id: string) => {
    if (id === effectiveProductId) return;
    confirmLeave(() => {
      setSearchParams({ product: id });
      setExpandedRoutingOp(null);
    });
  };

  const collabRouteWrap = (
    routeId: string,
    field: 'pct_routed' | 'to_op_name',
    input: React.ReactElement,
  ) => pageEditCell(pageEdit.canEditFields, input, (c) => wrapRouteCell(routeId, field, c));

  const handleAddInlineRoute = (fromOpName: string, toOpName: string, pct: number) => {
    if (!effectiveProductId || !pageEdit.canEditFields) return;
    const entry: RoutingEntry = {
      id: crypto.randomUUID(),
      product_id: effectiveProductId,
      from_op_name: fromOpName,
      to_op_name: toOpName,
      pct_routed: pct,
    };
    setDraftRouting((prev) => {
      const next = [...prev, entry];
      draftRoutingRef.current = next;
      return next;
    });
  };

  const handleUpdateInlineRoute = (routeId: string, data: Partial<RoutingEntry>) => {
    if (!pageEdit.canEditFields) return;
    if (model && activeScenarioId && activeScenario && data.pct_routed !== undefined) {
      const route = productRouting.find(r => r.id === routeId);
      if (route) {
        const entityName = `${effectiveProduct?.name}: ${route.from_op_name}→${route.to_op_name}`;
        applyScenarioChange(activeScenarioId, 'Routing', routeId, entityName, 'pct_routed', 'Routing %', data.pct_routed);
      }
    }
    setDraftRouting((prev) => {
      const next = prev.map((r) => (r.id === routeId ? { ...r, ...data } : r));
      draftRoutingRef.current = next;
      return next;
    });
  };

  const handleDeleteInlineRoute = (routeId: string) => {
    if (!pageEdit.canEditFields) return;
    setDraftRouting((prev) => {
      const next = prev.filter((r) => r.id !== routeId);
      draftRoutingRef.current = next;
      return next;
    });
  };

  const openFormulaBuilder = (op: Operation, field: string, label: string) => {
    setFormulaTarget({ op, field, label, value: (op as unknown as Record<string, number>)[field] || 0 });
  };

  const handleFormulaApply = (value: number, _formula: string) => {
    if (!formulaTarget) return;
    handleOpFieldChange(formulaTarget.op, formulaTarget.field, value);
    toast.success(`Formula applied: ${formulaTarget.label} = ${value}`);
  };

  if (!model) return null;

  const pn = displayParamNames(model);

  const timeFields = [
    { field: 'equip_setup_lot', label: 'E.Setup/Lot' },
    { field: 'equip_run_piece', label: 'E.Run/Pc' },
    { field: 'labor_setup_lot', label: 'L.Setup/Lot' },
    { field: 'labor_run_piece', label: 'L.Run/Pc' },
  ];

  // Calculate total columns for inline editor colSpan
  const baseColCount = 9; // lock/# + op# + name + equip + 4 times + routing (%assign hidden)
  const operParamColCount = SHOW_PARAM_VARIABLE_FIELDS_IN_UI ? 4 : 0;
  const advancedTimeColCount = 8;
  const advancedColCount = showAdvancedTimes ? advancedTimeColCount + operParamColCount : 0;
  // const formulaColCount = showFormulaBuilder && showAdvancedTimes ? 1 : 0;
  const formulaColCount = 0; // ƒ column hidden on operations & routing page
  const deleteColCount = 1;
  const totalCols = baseColCount + advancedColCount + formulaColCount + deleteColCount;

  // Routing completeness pill — only show when user ops exist
  const routingPill = hasUserOps ? (
    routingStatus === 'complete' ? (
      <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 border-emerald-300 font-mono text-[11px] gap-1">
        <CheckCircle className="h-3 w-3" /> Routing complete
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-amber-500/15 text-amber-700 border-amber-300 font-mono text-[11px] gap-1">
        <AlertTriangle className="h-3 w-3" /> Routing incomplete
      </Badge>
    )
  ) : null;

  const pruneIcon = pruneNotice ? (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2 gap-1.5 text-[11px]">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          {pruneNotice.removed.length}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <div className="text-sm font-semibold">Unreachable operations removed</div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => clearAutoRoutingNotice(pruneNotice.productId)}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-3 py-2 text-xs text-muted-foreground">
          Some routing paths rounded to 0%, so those operations were not created.
        </div>
        <div className="px-3 pb-3 space-y-1.5">
          {pruneNotice.removed.slice(0, 4).map((r) => (
            <div key={`${r.from}->${r.to}`} className="flex items-center justify-between gap-2 text-xs">
              <div className="truncate">
                <span className="font-medium">{r.to}</span>
              </div>
              <div className="text-muted-foreground tabular-nums shrink-0">
                {r.exactPct.toFixed(4)}%
              </div>
            </div>
          ))}
          {pruneNotice.removed.length > 4 && (
            <div className="text-xs text-muted-foreground">
              +{pruneNotice.removed.length - 4} more
            </div>
          )}
          <Button
            className="w-full mt-2"
            size="sm"
            onClick={() => {
              try {
                const exact = buildCombinedRouting(pruneNotice.source.rows, pruneNotice.source.legend, pruneNotice.source.terminal, { rounding: 'exact' });
                deleteProductLocal(model.id, pruneNotice.productId);
                addProductLocal(model.id, {
                  id: exact.productId,
                  name: exact.productName,
                  demand: exact.totalDemand,
                  lot_size: 1,
                  tbatch_size: -1,
                  demand_factor: 1,
                  lot_factor: 1,
                  var_factor: 1,
                  setup_factor: 1,
                  make_to_stock: false,
                  gather_tbatches: true,
                  dept_code: '',
                  prod1: 0,
                  prod2: 0,
                  prod3: 0,
                  prod4: 0,
                  comments: '',
                });
                exact.operations.forEach((op) => addOperationLocal(model.id, op));
                setRoutingLocal(model.id, exact.productId, exact.routing);
                clearAutoRoutingNotice(pruneNotice.productId);
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set('product', exact.productId);
                  return next;
                });
                toast.success('Kept tiny routes (no rounding).');
              } catch (e) {
                console.error(e);
                toast.error('Failed to keep tiny routes.');
              }
            }}
          >
            Keep (no rounding)
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ) : null;

  const statusPill = routingPill || pruneIcon ? (
    <div className="flex items-center gap-2">
      {routingPill}
      {pruneIcon}
    </div>
  ) : null;

  return (
    <>
    <PageSavingOverlay
      saving={pageEdit.saving || syncing}
      title="Saving"
      subtitle="Writing operations and routing…"
    />
    {leaveDialog}
    <div className="p-6 animate-fade-in">
      {activeScenarioId && activeScenario && (
        <div className="mb-4 flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-md">
          <FlaskConical className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="text-sm text-amber-700 font-medium">
            Changes are being recorded to <span className="font-semibold">{activeScenario.name}</span>
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Operations & Routing</h1>
          <p className="text-sm text-muted-foreground">Define operations and routing flow per product</p>
        </div>
        <div className="flex items-center gap-2">
          <>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => setShowAutoRouting(true)}
              disabled={!pageEdit.canEditFields}
              title={!pageEdit.canEditFields ? 'Start Edit to generate routing' : undefined}
            >
              <Wand2 className="h-4 w-4" /> Auto Routing
            </Button>
            <AutoRoutingDialog
              open={showAutoRouting}
              onOpenChange={setShowAutoRouting}
              canEdit={pageEdit.canEditFields}
            />
          </>
          {showFormulaBuilder && showAdvancedTimes && (
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setShowInterpolator(true)}>
              <Calculator className="h-3.5 w-3.5" /> Interpolate
            </Button>
          )}
        </div>
      </div>

      {/* Product Selector Bar with routing status pill */}
      <ProductSelectorBar
        products={model.products}
        operations={operationsForProductBar}
        selectedProductId={effectiveProductId}
        onSelect={requestProductSwitch}
        statusPill={statusPill}
      />

      {!effectiveProduct ? (
        <Card className="mt-6">
          <CardContent className="py-16 text-center flex flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-primary p-5">
            <Package className="h-10 w-10 mx-auto text-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">No products defined</p>
            <p className="text-sm mt-1">Add products in the Products tab first.</p>
            <Button onClick={() => model && navigate(`/models/${model.id}/products`)} className="gap-2 mt-4">Go to Products</Button>
          </CardContent>
        </Card>
      ) : showEmptyState ? (
        <Card className="mt-6">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-end">
              <PageEditActions
                isEditing={pageEdit.isEditing}
                isDirty={isDirty}
                saving={pageEdit.saving || syncing}
                canStartEdit={pageEdit.canStartEdit && Boolean(effectiveProductId)}
                editorName={pageEdit.editorName}
                onStartEdit={pageEdit.startEdit}
                onSave={() => void pageEdit.save()}
                onDiscard={pageEdit.discard}
                pageLabel={`Operations for ${productLabel}`}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <OperationsEmptyState
              productName={effectiveProduct.name}
              onAddOperations={handleAddFirstOps}
              disabled={!pageEdit.canEditFields}
            />
          </CardContent>
        </Card>
      ) : (
        <PageEditLockedShell
          editorName={pageEdit.editorName}
          pageLabel={effectiveProductId ? `Operations for ${productLabel}` : 'Operations'}
          dimContent={false}
          className="space-y-4 mt-4"
        >
          {/* Reset product confirmation */}
          {showClearRoutingConfirm && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-md bg-red-500/10 border border-red-500/30">
              <span className="text-sm text-red-700">Reset <strong>{effectiveProduct?.name}</strong>? This will delete all operations and routing for this product. This cannot be undone.</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowClearRoutingConfirm(false)}>Cancel</Button>
                <Button variant="destructive" size="sm" onClick={async () => {
                  if (!pageEdit.canEditFields) return;
                  setShowClearRoutingConfirm(false);
                  try {
                    const res = await apiFetch(
                      `/api/models/${model.id}/products/${effectiveProductId}/operations-and-routing/`,
                      { method: 'DELETE' },
                    );
                    if (!res.ok) throw new Error('clear failed');
                    await apiFetch(`/api/models/${model.id}/patch/`, {
                      method: 'PATCH',
                      body: JSON.stringify({ run_status: 'needs_recalc' }),
                    });
                    const opsToRemove = productOps.map(o => o.id);
                    opsToRemove.forEach(id => {
                      useModelStore.setState(state => ({
                        models: state.models.map(mo => mo.id === model.id ? {
                          ...mo,
                          operations: mo.operations.filter(o => o.id !== id),
                        } : mo),
                      }));
                    });
                    useModelStore.setState(state => ({
                      models: state.models.map(mo => mo.id === model.id ? {
                        ...mo,
                        routing: mo.routing.filter(r => r.product_id !== effectiveProductId),
                        run_status: 'needs_recalc',
                        updated_at: new Date().toISOString(),
                      } : mo),
                    }));
                    const mAfter = useModelStore.getState().getActiveModel();
                    if (mAfter && effectiveProductId) {
                      const { ops, routing } = cloneProductDraftFromModel(mAfter, effectiveProductId);
                      setDraftOps(ops);
                      setDraftRouting(routing);
                    }
                    setExpandedRoutingOp(null);
                    await syncModelToOrg(collab, model.id, 'operations');
                    toast.success(`Reset complete for ${effectiveProduct?.name}`);
                  } catch (err) {
                    console.error('Reset failed:', err);
                    toast.error('Reset failed — please try again');
                  }
                }}>Reset Product</Button>
              </div>
            </div>
          )}

          {/* Auto-generate confirmation */}
          {showAutoRouteConfirm && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-md bg-amber-500/10 border border-amber-500/30">
              <span className="text-sm text-amber-700">This will replace all existing routing. Continue?</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowAutoRouteConfirm(false)}>Cancel</Button>
                <Button variant="destructive" size="sm" onClick={handleAutoRoute}>Replace</Button>
              </div>
            </div>
          )}

          {/* Unified Operations + Routing Table */}
          <Card className={activeScenarioId ? 'border-l-[3px] border-l-amber-400' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Operations for <span className="font-mono text-primary">{effectiveProduct.name}</span>
                  </CardTitle>
                  <CardDescription>{userOps.length} operations defined</CardDescription>
                </div>
                <div className="flex gap-2 items-center flex-wrap justify-end">
                  <PageEditActions
                    isEditing={pageEdit.isEditing}
                    isDirty={isDirty}
                    saving={pageEdit.saving || syncing}
                    canStartEdit={pageEdit.canStartEdit && Boolean(effectiveProductId)}
                    editorName={pageEdit.editorName}
                    onStartEdit={pageEdit.startEdit}
                    onSave={() => void pageEdit.save()}
                    onDiscard={pageEdit.discard}
                    pageLabel={`Operations for ${productLabel}`}
                  />
                  <Button
                    variant={showRoutingGraph ? 'default' : 'outline'}
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => setShowRoutingGraph(!showRoutingGraph)}
                  >
                    {showRoutingGraph ? (
                      <><Table2 className="h-3.5 w-3.5" /> Back to Table</>
                    ) : (
                      <><GitBranch className="h-3.5 w-3.5" /> Routing Graph</>
                    )}
                  </Button>
                  {showRoutingGraph && graphHasMoved && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => {
                        graphRef.current?.reset();
                        setGraphHasMoved(false);
                      }}
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reset Layout
                    </Button>
                  )}
                  {!showRoutingGraph && (
                    <>
                    <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setShowAdvancedTimes(!showAdvancedTimes)}>
                      {showAdvancedTimes ? 'Hide Advanced' : 'Show Advanced'}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={handleResort} disabled={productOps.length <= 1 || !pageEdit.canEditFields}>
                      <SortAsc className="h-3.5 w-3.5" /> Re-sort
                    </Button>
                    {hasUserOps && (
                      <Button variant="outline" size="sm" className="gap-1 text-xs text-red-600 border-red-200 hover:bg-red-50" disabled={!pageEdit.canEditFields} onClick={() => { if (!pageEdit.canEditFields) return; setShowClearRoutingConfirm(true); }}>
                        <Trash2 className="h-3.5 w-3.5" /> Reset Product
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={handleAutoGenerateClick}>
                      <Zap className="h-3.5 w-3.5" /> Auto-Generate
                    </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {showRoutingGraph ? (
                <RoutingFlowGraph
                  ref={graphRef}
                  operations={productOps}
                  routing={productRouting}
                  onLayoutChange={setGraphHasMoved}
                />
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-mono text-xs w-10"></TableHead>
                    <TableHead className="font-mono text-xs w-16">Op #</TableHead>
                    <TableHead className="font-mono text-xs">Op Name</TableHead>
                    <TableHead className="font-mono text-xs">Equipment</TableHead>
                    {/* <TableHead className="font-mono text-xs w-20">% Assign</TableHead> */}
                    <TableHead className="font-mono text-xs">E.Setup/Lot</TableHead>
                    <TableHead className="font-mono text-xs">E.Run/Pc</TableHead>
                    <TableHead className="font-mono text-xs">L.Setup/Lot</TableHead>
                    <TableHead className="font-mono text-xs">L.Run/Pc</TableHead>
                    {showAdvancedTimes && (
                      <>
                        <TableHead className="font-mono text-xs">E.Setup/Pc</TableHead>
                        <TableHead className="font-mono text-xs">E.Setup/TB</TableHead>
                        <TableHead className="font-mono text-xs">E.Run/Lot</TableHead>
                        <TableHead className="font-mono text-xs">E.Run/TB</TableHead>
                        <TableHead className="font-mono text-xs">L.Setup/Pc</TableHead>
                        <TableHead className="font-mono text-xs">L.Setup/TB</TableHead>
                        <TableHead className="font-mono text-xs">L.Run/Lot</TableHead>
                        <TableHead className="font-mono text-xs">L.Run/TB</TableHead>
                        {SHOW_PARAM_VARIABLE_FIELDS_IN_UI && <>
                          <TableHead className="font-mono text-xs">{pn.oper1_name}</TableHead>
                          <TableHead className="font-mono text-xs">{pn.oper2_name}</TableHead>
                          <TableHead className="font-mono text-xs">{pn.oper3_name}</TableHead>
                          <TableHead className="font-mono text-xs">{pn.oper4_name}</TableHead>
                        </>}
                      </>
                    )}
                    <TableHead className="font-mono text-xs">Routing</TableHead>
                    {/* {showFormulaBuilder && showAdvancedTimes && <TableHead className="font-mono text-xs w-10">ƒ</TableHead>} */}
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productOps.map((op) => {
                    const isDock = op.op_name === 'DOCK';
                    const isPureOp = !isDock && isPureLaborOperation(op, model.equipment);
                    const opRoutes = productRoutes[op.op_name] || [];
                    const hasIncomingRoute = Object.entries(productRoutes).some(
                      ([fromOp, routes]) =>
                        fromOp !== op.op_name &&
                        routes.some((r) => r.to_op_name === op.op_name)
                    );
                    const isExpanded = expandedRoutingOp === op.op_name;
                    const isConfirming = !isDock && pendingDeleteId === op.id;

                    return (
                      <>
                        <TableRow key={op.id} className={`${isConfirming ? 'bg-destructive/10' : isPureOp ? 'bg-slate-50/80' : ''} [&>td]:pt-6`}>
                          {isConfirming ? (
                            <TableCell colSpan={totalCols}>
                              <DeleteConfirmInline
                                message={`Delete operation ${op.op_name}?`}
                                onConfirm={() => confirmDelete(op.id, () => handleDeleteOperation(op.id))}
                                onCancel={cancelDelete}
                              />
                            </TableCell>
                          ) : (<>
                          {/* Lock / row indicator */}
                          <TableCell className="w-10 text-center">
                            {isDock && <Lock className="h-3 w-3 text-muted-foreground inline-block" />}
                          </TableCell>
                          {/* Op # */}
                          <TableCell>
                            {isDock ? (
                              <span className="font-mono text-xs text-muted-foreground">0</span>
                            ) : (
                              collabWrap(
                                op,
                                'op_number',
                                <NonNegativeNumericInput
                                  value={op.op_number}
                                  onChange={(v) => handleOpFieldChange(op, 'op_number', v)}
                                />,
                              )
                            )}
                          </TableCell>
                          {/* Op Name */}
                          <TableCell className={`font-mono font-medium ${isDock ? 'text-muted-foreground' : ''}`}>
                            {isDock ? (
                              op.op_name
                            ) : (
                              collabWrap(
                                op,
                                'op_name',
                                <DoubleClickEditableName
                                  value={op.op_name}
                                  isEditing={editingOpNameId === op.id}
                                  readOnly={!pageEdit.canEditFields}
                                  onRequestEdit={() => setEditingOpNameId(op.id)}
                                  onCommit={(t) => tryCommitOpName(op.id, t)}
                                  onCancelEdit={() => setEditingOpNameId(null)}
                                />,
                              )
                            )}
                          </TableCell>
                          {/* Equipment */}
                          <TableCell>
                            {isDock ? (
                              <span className="font-mono text-xs text-muted-foreground">—</span>
                            ) : (
                              <HoverValueTooltip label={equipmentGroupLabel(op.equip_id)}>
                                {collabWrap(
                                  op,
                                  'equip_id',
                                  <Select
                                    value={op.equip_id || 'none'}
                                    onValueChange={(v) => {
                                      const next = v === 'none' ? '' : v;
                                      handleOpFieldChange(op, 'equip_id', next);
                                    }}
                                  >
                                    <SelectTrigger className="h-8 w-32 font-mono text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">None</SelectItem>
                                      {model.equipment.map((eq) => (
                                        <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>,
                                )}
                              </HoverValueTooltip>
                            )}
                          </TableCell>
                          {/* % Assign — hidden on operations & routing page
                          <TableCell>
                            {isDock ? (
                              <span className="font-mono text-xs text-muted-foreground">—</span>
                            ) : (
                              collabWrap(
                                op,
                                'pct_assigned',
                                <NonNegativeNumericInput
                                  value={op.pct_assigned}
                                  onChange={(v) => handleOpFieldChange(op, 'pct_assigned', v)}
                                />,
                              )
                            )}
                          </TableCell>
                          */}

                          {/* Main time fields */}
                          {isDock ? (
                            <>
                              <TableCell className="font-mono text-xs text-muted-foreground">—</TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">—</TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">—</TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">—</TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>
                                {collabWrap(
                                  op,
                                  'equip_setup_lot',
                                  <OperationEquipTimeInput
                                    op={op}
                                    field="equip_setup_lot"
                                    equipment={model.equipment}
                                    value={op.equip_setup_lot}
                                    step="0.1"
                                    onChange={(v) => handleOpFieldChange(op, 'equip_setup_lot', v)}
                                  />,
                                )}
                              </TableCell>
                              <TableCell>
                                {collabWrap(
                                  op,
                                  'equip_run_piece',
                                  <OperationEquipTimeInput
                                    op={op}
                                    field="equip_run_piece"
                                    equipment={model.equipment}
                                    value={op.equip_run_piece}
                                    step="0.01"
                                    onChange={(v) => handleOpFieldChange(op, 'equip_run_piece', v)}
                                  />,
                                )}
                              </TableCell>
                              <TableCell>
                                {collabWrap(
                                  op,
                                  'labor_setup_lot',
                                  <NonNegativeNumericInput
                                    allowDecimal
                                    value={op.labor_setup_lot}
                                    onChange={(v) => handleOpFieldChange(op, 'labor_setup_lot', v)}
                                  />,
                                )}
                              </TableCell>
                              <TableCell>
                                {collabWrap(
                                  op,
                                  'labor_run_piece',
                                  <NonNegativeNumericInput
                                    allowDecimal
                                    value={op.labor_run_piece}
                                    onChange={(v) => handleOpFieldChange(op, 'labor_run_piece', v)}
                                  />,
                                )}
                              </TableCell>
                            </>
                          )}

                          {/* Advanced time fields */}
                          {showAdvancedTimes && (
                            isDock ? (
                              <>
                                {Array.from({ length: advancedTimeColCount + operParamColCount }).map((_, i) => (
                                  <TableCell key={i} className="font-mono text-xs text-muted-foreground">—</TableCell>
                                ))}
                              </>
                            ) : (
                              <>
                                <TableCell>{collabWrap(op, 'equip_setup_piece', <OperationEquipTimeInput op={op} field="equip_setup_piece" equipment={model.equipment} value={op.equip_setup_piece} step="0.01" onChange={(v) => handleOpFieldChange(op, 'equip_setup_piece', v)} />)}</TableCell>
                                <TableCell>{collabWrap(op, 'equip_setup_tbatch', <OperationEquipTimeInput op={op} field="equip_setup_tbatch" equipment={model.equipment} value={op.equip_setup_tbatch} step="0.1" onChange={(v) => handleOpFieldChange(op, 'equip_setup_tbatch', v)} />)}</TableCell>
                                <TableCell>{collabWrap(op, 'equip_run_lot', <OperationEquipTimeInput op={op} field="equip_run_lot" equipment={model.equipment} value={op.equip_run_lot} step="0.1" onChange={(v) => handleOpFieldChange(op, 'equip_run_lot', v)} />)}</TableCell>
                                <TableCell>{collabWrap(op, 'equip_run_tbatch', <OperationEquipTimeInput op={op} field="equip_run_tbatch" equipment={model.equipment} value={op.equip_run_tbatch} step="0.01" onChange={(v) => handleOpFieldChange(op, 'equip_run_tbatch', v)} />)}</TableCell>
                                <TableCell>{collabWrap(op, 'labor_setup_piece', <NonNegativeNumericInput allowDecimal value={op.labor_setup_piece} onChange={(v) => handleOpFieldChange(op, 'labor_setup_piece', v)} />)}</TableCell>
                                <TableCell>{collabWrap(op, 'labor_setup_tbatch', <NonNegativeNumericInput allowDecimal value={op.labor_setup_tbatch} onChange={(v) => handleOpFieldChange(op, 'labor_setup_tbatch', v)} />)}</TableCell>
                                <TableCell>{collabWrap(op, 'labor_run_lot', <NonNegativeNumericInput allowDecimal value={op.labor_run_lot} onChange={(v) => handleOpFieldChange(op, 'labor_run_lot', v)} />)}</TableCell>
                                <TableCell>{collabWrap(op, 'labor_run_tbatch', <NonNegativeNumericInput allowDecimal value={op.labor_run_tbatch} onChange={(v) => handleOpFieldChange(op, 'labor_run_tbatch', v)} />)}</TableCell>
                                {SHOW_PARAM_VARIABLE_FIELDS_IN_UI && <>
                                  <TableCell>{collabWrap(op, 'oper1', <NonNegativeNumericInput allowDecimal value={op.oper1} onChange={(v) => handleOpFieldChange(op, 'oper1', v)} />)}</TableCell>
                                  <TableCell>{collabWrap(op, 'oper2', <NonNegativeNumericInput allowDecimal value={op.oper2} onChange={(v) => handleOpFieldChange(op, 'oper2', v)} />)}</TableCell>
                                  <TableCell>{collabWrap(op, 'oper3', <NonNegativeNumericInput allowDecimal value={op.oper3} onChange={(v) => handleOpFieldChange(op, 'oper3', v)} />)}</TableCell>
                                  <TableCell>{collabWrap(op, 'oper4', <NonNegativeNumericInput allowDecimal value={op.oper4} onChange={(v) => handleOpFieldChange(op, 'oper4', v)} />)}</TableCell>
                                </>}
                              </>
                            )
                          )}

                          <TableCell className="py-0">
                            {(() => {
                              // Determine routing text and color
                              if (!isDock && op.pct_assigned > 100) {
                                return (
                                  <span
                                    className="text-sm text-red-600 whitespace-nowrap block truncate cursor-pointer"
                                    onClick={() => setExpandedRoutingOp(isExpanded ? null : op.op_name)}
                                  >
                                    ⚠ % Assign &gt; 100
                                  </span>
                                );
                              }
                              // Dead-end / unreachable checks
                              if ( !isDock &&
                                deadEndOps.has(op.op_name) &&
                                !hasIncomingRoute ) {
                                return (
                                  <span
                                    className="text-sm text-red-600 whitespace-nowrap block truncate cursor-pointer"
                                    onClick={() => setExpandedRoutingOp(isExpanded ? null : op.op_name)}
                                  >
                                    ⚠ Dead end
                                  </span>
                                );
                              }
                              if (!isDock && unreachableOps.has(op.op_name)) {
                                return (
                                  <span
                                    className="text-sm text-red-600 whitespace-nowrap block truncate cursor-pointer"
                                    onClick={() => setExpandedRoutingOp(isExpanded ? null : op.op_name)}
                                  >
                                    ⚠ Unreachable
                                  </span>
                                );
                              }
                              const total = opRoutes.reduce((s, r) => s + r.pct_routed, 0);
                              const hasSumError = opRoutes.length > 0 && total !== 100;
                              let text: string;
                              let colorClass: string;
                              if (opRoutes.length === 0) {
                                text = '⚠ No routing';
                                colorClass = 'text-amber-600';
                              } else if (hasSumError) {
                                text = `⚠ ${total}% — must be 100%`;
                                colorClass = 'text-red-600';
                              } else if (opRoutes.length === 1) {
                                text = `→ ${opRoutes[0].to_op_name}`;
                                colorClass = 'text-gray-500';
                              } else {
                                text = `→ ${opRoutes.length} paths`;
                                colorClass = 'text-gray-500';
                              }
                              return (
                                <span
                                  className={`text-sm whitespace-nowrap block truncate ${colorClass} ${isExpanded ? 'font-medium' : ''} cursor-pointer`}
                                  onClick={() => setExpandedRoutingOp(isExpanded ? null : op.op_name)}
                                >
                                  {text}
                                </span>
                              );
                            })()}
                          </TableCell>

                          {/* Formula Builder trigger — ƒ column hidden on operations & routing page
                          {showFormulaBuilder && showAdvancedTimes && (
                            <TableCell>
                              {!isDock && (
                                <Select onValueChange={(field) => {
                                  const tf = timeFields.find(f => f.field === field);
                                  if (tf) openFormulaBuilder(op, tf.field, tf.label);
                                }}>
                                  <SelectTrigger className="h-7 w-9 px-1 border-none">
                                    <FunctionSquare className="h-3.5 w-3.5 text-muted-foreground" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {timeFields
                                      .filter((f) => canEditOperationEquipField(op, f.field, model.equipment))
                                      .map(f => (
                                      <SelectItem key={f.field} value={f.field} className="text-xs">{f.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                          )}
                          */}

                          {/* Delete */}
                          <TableCell>
                            {!isDock && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                disabled={!pageEdit.canEditFields}
                                onClick={() => {
                                  if (!pageEdit.canEditFields) return;
                                  setEditingOpNameId((cur) => (cur === op.id ? null : cur));
                                  requestDelete(op.id);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </TableCell>
                          </>)}
                        </TableRow>

                        {/* Inline routing editor */}
                        {isExpanded && (
                          <InlineRoutingEditor
                            key={`route-${op.op_name}`}
                            opName={op.op_name}
                            routes={opRoutes}
                            allOpNames={userOpNames}
                            onAddRoute={(to, pct) => handleAddInlineRoute(op.op_name, to, pct)}
                            onUpdateRoute={handleUpdateInlineRoute}
                            onDeleteRoute={(id) => void handleDeleteInlineRoute(id)}
                            wrapRouteCell={collabRouteWrap}
                            colSpan={totalCols}
                            hideDelete={false}
                            canEdit={pageEdit.canEditFields}
                          />
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
              )}

              {/* + Add Operation button below table */}
              <div className="px-4 py-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  disabled={!pageEdit.canEditFields}
                  onClick={() => {
                    if (!pageEdit.canEditFields) return;
                    setNewOpNumber(productOps.length > 0 ? productOps[productOps.length - 1].op_number + 10 : 10);
                    setShowAddOp(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Operation
                </Button>
              </div>
            </CardContent>
          </Card>
        </PageEditLockedShell>
      )}

      {/* Add Operation Dialog */}
      <Dialog open={showAddOp} onOpenChange={setShowAddOp}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Operation</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Operation Name</Label><Input ref={newOpNameRef} value={newOpName} onChange={(e) => setNewOpName(e.target.value)} placeholder="e.g., RFTURN" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAddOp()} /></div>
              <div><Label>Op Number</Label><NonNegativeNumericInput value={newOpNumber} onChange={(v) => setNewOpNumber(v)} /></div>
            </div>
            <div>
              <Label>Equipment Group</Label>
              <Select value={newOpEquip || 'none'} onValueChange={(v) => setNewOpEquip(v === 'none' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Select equipment" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {model.equipment.map(eq => <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddOp(false)}>Cancel</Button>
            <Button onClick={handleAddOp} disabled={!newOpName.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Formula Builder Modal */}
      {formulaTarget && (
        <FormulaBuilder
          open={!!formulaTarget}
          onClose={() => setFormulaTarget(null)}
          model={model}
          operation={formulaTarget.op}
          field={formulaTarget.field}
          fieldLabel={formulaTarget.label}
          currentValue={formulaTarget.value}
          onApply={handleFormulaApply}
        />
      )}

      {/* Interpolate Calculator */}
      <InterpolateCalculator
        open={showInterpolator}
        onClose={() => setShowInterpolator(false)}
        onApply={(value) => toast.success(`Interpolated value: ${value} — use it in a time field`)}
      />
    </div>
    </>
  );
}
