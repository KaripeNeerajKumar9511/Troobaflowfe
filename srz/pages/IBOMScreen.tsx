import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { useModelStore, type Model } from '@/stores/modelStore';
import { useScenarioStore } from '@/stores/scenarioStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronRight, ChevronDown, Network, FlaskConical, X, Search, Package, PlusCircle, GitBranch, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { NonNegativeNumericInput } from '@/components/NonNegativeNumericInput';
import { useCollabCell } from '@/hooks/useCollabCell';
import { useModelRefreshSync } from '@/hooks/useModelRefreshSync';
import { useOrgCollab } from '@/contexts/OrgCollabContext';
import { syncModelToOrg } from '@/lib/collabSync';
import { usePageEditMode, usePageEditLockState } from '@/hooks/usePageEditMode';
import { usePageEditBaseline } from '@/hooks/usePageEditBaseline';
import { PageEditActions } from '@/components/PageEditActions';
import { PageEditLockedShell } from '@/components/PageEditLockedShell';
import { usePageEditLeaveGuard } from '@/hooks/usePageEditLeaveGuard';
import { PageSavingOverlay } from '@/components/PageEditLeaveGuard';
import { ibomProductDraftDirty } from '@/lib/draftDirty';
import { persistIbomProductDraft } from '@/lib/pageEditPersist';
import { pageEditCell } from '@/lib/pageEditCell';

interface TreeNode {
  productId: string;
  productName: string;
  unitsPerAssy: number;
  children: TreeNode[];
  depth: number;
}

// Draft component entry for local editing
interface DraftComponent {
  id: string;
  component_product_id: string;
  units_per_assy: number;
  isNew?: boolean; // newly added, not yet saved
}

function ibomDraftFromModel(m: Model, parentId: string): DraftComponent[] {
  return m.ibom
    .filter((e) => e.parent_product_id === parentId)
    .map((e) => ({
      id: e.id,
      component_product_id: e.component_product_id,
      units_per_assy: e.units_per_assy,
    }));
}

export default function IBOMScreen() {
  const navigate = useNavigate();
  const { modelId } = useParams<{ modelId: string }>();
  const model = useModelStore((s) => s.getActiveModel());
  const activeScenarioId = useScenarioStore(s => s.activeScenarioId);
  const activeScenario = useScenarioStore(s => s.scenarios.find(sc => sc.id === s.activeScenarioId));

  const [viewAssemblyId, setViewAssemblyId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [checkedAllowable, setCheckedAllowable] = useState<Set<string>>(new Set());
  const [confirmingRemoveId, setConfirmingRemoveId] = useState<string | null>(null);
  const [showRemoveAllDialog, setShowRemoveAllDialog] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [upaErrors, setUpaErrors] = useState<Set<string>>(new Set());
  const [showEmptyPicker, setShowEmptyPicker] = useState(false);

  // ═══ DRAFT STATE ═══
  const [draftComponents, setDraftComponents] = useState<DraftComponent[]>([]);
  const draftComponentsRef = useRef<DraftComponent[]>([]);
  const editingRef = useRef(false);
  draftComponentsRef.current = draftComponents;
  const { wrapCell } = useCollabCell(model?.id, 'ibom');
  const collab = useOrgCollab();
  const editParentIdRef = useRef('');

  const applyIbomDraftFromModel = useCallback((m: Model, parentId: string) => {
    setDraftComponents(ibomDraftFromModel(m, parentId).map((e) => ({ ...e })));
  }, []);

  const changedUpaIds = useMemo(() => new Set<string>(), []);

  // Read product param from URL and pre-select on mount
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current || !model) return;
    const params = new URLSearchParams(window.location.search);
    const productParam = params.get('product');
    if (productParam) {
      const match = model.products.find(p => p.id === productParam || p.name === productParam);
      if (match) {
        setViewAssemblyId(match.id);
        setSelectedProductId(match.id);
        initializedRef.current = true;
      }
    }
  }, [model]);

  // Sync draft when selectedProductId changes (load from model)
  const editParentId = selectedProductId || '';
  editParentIdRef.current = editParentId;
  const editProduct = model?.products.find((p) => p.id === editParentId);
  const productLabel = editProduct?.name || 'this assembly';

  const { isHolder } = usePageEditLockState(model?.id, 'ibom', editParentId);
  const editBaseline = usePageEditBaseline(isHolder, model);
  const compareModel = editBaseline ?? model;
  const isDirty =
    compareModel && editParentId
      ? ibomProductDraftDirty(compareModel, editParentId, draftComponents)
      : false;

  const pageEdit = usePageEditMode({
    modelId: model?.id,
    page: 'ibom',
    productId: editParentId || undefined,
    pageLabel: `IBOM for ${productLabel}`,
    isDirty,
    onDiscard: () => {
      if (editBaseline && editParentId) applyIbomDraftFromModel(editBaseline, editParentId);
      else if (model && editParentId) applyIbomDraftFromModel(model, editParentId);
    },
    onSave: async () => {
      if (!model || !editParentId || !editBaseline) return;
      await persistIbomProductDraft(
        model.id,
        editParentId,
        draftComponentsRef.current,
        editBaseline,
      );
      const fresh = await syncModelToOrg(collab, model.id, 'ibom');
      if (fresh) applyIbomDraftFromModel(fresh, editParentId);
    },
  });

  editingRef.current = pageEdit.isEditing;

  const { confirmLeave, leaveDialog } = usePageEditLeaveGuard({
    isEditing: pageEdit.isEditing,
    isDirty,
    saving: pageEdit.saving,
    leaveDescription: `You have unsaved IBOM changes for ${productLabel}. Save before switching assemblies or leaving this page?`,
    onSave: pageEdit.save,
    onDiscard: pageEdit.discard,
  });

  useModelRefreshSync(model?.id, (fresh) => {
    if (editingRef.current) return;
    const pid = editParentIdRef.current;
    if (!pid) return;
    applyIbomDraftFromModel(fresh, pid);
  });

  useEffect(() => {
    if (!model || !editParentId) {
      setDraftComponents([]);
      return;
    }
    if (isHolder) return;
    applyIbomDraftFromModel(model, editParentId);
    setCheckedAllowable(new Set());
    setConfirmingRemoveId(null);
    setShowEmptyPicker(false);
    setUpaErrors(new Set());
  }, [editParentId, model?.id, applyIbomDraftFromModel, isHolder, model]);

  // Track previous valid values for revert on blur
  const prevUpaValues = useRef<Map<string, number>>(new Map());

  const buildTree = useCallback((parentId: string, depth: number, visited: Set<string>): TreeNode[] => {
    if (!model || visited.has(parentId)) return [];
    const entries = model.ibom.filter((e) => e.parent_product_id === parentId);
    return entries.map((e) => {
      const product = model.products.find((p) => p.id === e.component_product_id);
      const nextVisited = new Set(visited);
      nextVisited.add(parentId);
      return {
        productId: e.component_product_id,
        productName: product?.name || '???',
        unitsPerAssy: e.units_per_assy,
        children: buildTree(e.component_product_id, depth + 1, nextVisited),
        depth,
      };
    });
  }, [model]);

  const getAncestors = useCallback((productId: string, visited: Set<string> = new Set()): Set<string> => {
    if (!model || visited.has(productId)) return visited;
    visited.add(productId);
    const parents = model.ibom.filter((e) => e.component_product_id === productId);
    parents.forEach((p) => getAncestors(p.parent_product_id, visited));
    return visited;
  }, [model]);

  const tree = useMemo(() => {
    if (!viewAssemblyId) return [];
    return buildTree(viewAssemblyId, 0, new Set());
  }, [viewAssemblyId, buildTree]);

  const maxDepth = useMemo(() => {
    function getDepth(nodes: TreeNode[]): number {
      if (nodes.length === 0) return 0;
      return 1 + Math.max(...nodes.map(n => getDepth(n.children)));
    }
    return getDepth(tree);
  }, [tree]);

  const unitsPerFinalAssy = useMemo(() => {
    if (!model || !viewAssemblyId) return new Map<string, number>();
    const result = new Map<string, number>();
    function traverse(parentId: string, multiplier: number, visited: Set<string>) {
      if (visited.has(parentId)) return;
      const nextVisited = new Set(visited);
      nextVisited.add(parentId);
      const entries = model!.ibom.filter(e => e.parent_product_id === parentId);
      entries.forEach(e => {
        const cumulative = multiplier * e.units_per_assy;
        const existing = result.get(e.component_product_id) || 0;
        result.set(e.component_product_id, existing + cumulative);
        traverse(e.component_product_id, cumulative, nextVisited);
      });
    }
    traverse(viewAssemblyId, 1, new Set());
    return result;
  }, [model, viewAssemblyId]);

  const filterTree = useCallback((nodes: TreeNode[], query: string): TreeNode[] => {
    if (!query) return nodes;
    const lq = query.toLowerCase();
    return nodes.reduce<TreeNode[]>((acc, node) => {
      const filteredChildren = filterTree(node.children, query);
      if (node.productName.toLowerCase().includes(lq) || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
      return acc;
    }, []);
  }, []);

  const filteredTree = useMemo(() => filterTree(tree, filterText), [tree, filterText, filterTree]);

  // ═══ DRAFT-AWARE: allowableProducts based on draft, not model ═══
  const allowableProducts = useMemo(() => {
    if (!model || !editParentId) return [];
    const currentCompIds = new Set(draftComponents.map((c) => c.component_product_id));
    const ancestors = getAncestors(editParentId);
    return model.products.filter((p) => {
      if (p.id === editParentId) return false;
      if (currentCompIds.has(p.id)) return false;
      if (ancestors.has(p.id)) return false;
      return true;
    });
  }, [model, editParentId, draftComponents, getAncestors]);

  const isWhatIfTarget = useMemo(() => {
    if (!activeScenario || !editParentId) return false;
    return activeScenario.changes.some(c => c.entityId === editParentId);
  }, [activeScenario, editParentId]);

  // ═══ DRAFT MUTATIONS (auto-save to DB) ═══
  const handleAddChecked = () => {
    if (!editParentId || checkedAllowable.size === 0 || !pageEdit.canEditFields) return;
    const newDrafts: DraftComponent[] = [];
    checkedAllowable.forEach(pId => {
      newDrafts.push({
        id: crypto.randomUUID(),
        component_product_id: pId,
        units_per_assy: 1,
        isNew: true,
      });
    });
    const next = [...draftComponentsRef.current, ...newDrafts];
    setDraftComponents(next);
    toast.info(`${checkedAllowable.size} component(s) added`);
    setCheckedAllowable(new Set());
  };

  const handleAddAll = () => {
    if (!pageEdit.canEditFields) return;
    const newDrafts: DraftComponent[] = allowableProducts.map(p => ({
      id: crypto.randomUUID(),
      component_product_id: p.id,
      units_per_assy: 1,
      isNew: true,
    }));
    const next = [...draftComponentsRef.current, ...newDrafts];
    setDraftComponents(next);
    toast.info(`${allowableProducts.length} component(s) added`);
  };

  const handleRemoveDraft = (draftId: string) => {
    if (!pageEdit.canEditFields) return;
    const next = draftComponentsRef.current.filter((d) => d.id !== draftId);
    setDraftComponents(next);
    setConfirmingRemoveId(null);
  };

  const handleRemoveAll = () => {
    if (!pageEdit.canEditFields) return;
    setDraftComponents([]);
    setShowRemoveAllDialog(false);
  };

  const handleUpaChange = (entryId: string, value: string, currentValid: number) => {
    if (!pageEdit.canEditFields) return;
    const num = Number(value);
    if (!prevUpaValues.current.has(entryId)) {
      prevUpaValues.current.set(entryId, currentValid);
    }
    if (value === '' || num <= 0) {
      setUpaErrors(prev => new Set(prev).add(entryId));
      return;
    }
    setUpaErrors(prev => { const n = new Set(prev); n.delete(entryId); return n; });
    setDraftComponents(prev => prev.map(d => d.id === entryId ? { ...d, units_per_assy: num } : d));
    prevUpaValues.current.set(entryId, num);
  };

  const handleUpaBlur = (entryId: string) => {
    if (upaErrors.has(entryId)) {
      const revert = prevUpaValues.current.get(entryId) || 1;
      setDraftComponents(prev => prev.map(d => d.id === entryId ? { ...d, units_per_assy: revert } : d));
      setUpaErrors(prev => { const n = new Set(prev); n.delete(entryId); return n; });
    }
  };

  const selectProductForEdit = (productId: string) => {
    setSelectedProductId(productId);
    setCheckedAllowable(new Set());
    setConfirmingRemoveId(null);
    setShowEmptyPicker(false);
  };

  const handleSelectRow = (productId: string) => {
    if (productId === selectedProductId) return;
    confirmLeave(() => selectProductForEdit(productId));
  };

  const applyViewAssembly = (assemblyId: string) => {
    setViewAssemblyId(assemblyId);
    setExpandedNodes(new Set());
    setSelectedProductId('');
    setFilterText('');
  };

  const clearViewAssembly = () => {
    setViewAssemblyId('');
    setSelectedProductId('');
    setExpandedNodes(new Set());
    setFilterText('');
  };

  // No products empty state
  if (!model) return null;

  if (model.products.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fade-in gap-4 px-6">
        <div className="rounded-full bg-primary p-6">
          <Package className="h-12 w-12 text-foreground" />
        </div>
        <div className="text-center space-y-1.5">
          <h2 className="text-lg font-semibold">No products defined yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Add products in the Products tab before building your IBOM structure.
          </p>
        </div>
        <Button onClick={() => model && navigate(`/models/${model.id}/products`)} className="gap-2 mt-4">Go to Products</Button>
      </div>
    );
  }

  const prodName = (id: string) => model.products.find((p) => p.id === id)?.name || '???';
  const allProducts = model.products;

  const toggleExpand = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const expandAll = () => {
    const allKeys = new Set<string>();
    const collectKeys = (nodes: TreeNode[], parentKey: string) => {
      nodes.forEach((n, i) => {
        const key = `${parentKey}-${n.productId}-${i}`;
        if (n.children.length > 0) { allKeys.add(key); collectKeys(n.children, key); }
      });
    };
    collectKeys(tree, 'root');
    setExpandedNodes(allKeys);
  };

  const filteredDropdownProducts = filterText
    ? allProducts.filter(p => p.name.toLowerCase().includes(filterText.toLowerCase()))
    : allProducts;

  const renderTreeNode = (node: TreeNode, parentKey: string, index: number) => {
    const key = `${parentKey}-${node.productId}-${index}`;
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(key);
    const isSelected = selectedProductId === node.productId;
    const ufa = unitsPerFinalAssy.get(node.productId);

    return (
      <div key={key}>
        <div
          className={`flex items-center gap-2 h-8 px-2 cursor-pointer text-sm transition-colors ${
            isSelected
              ? 'bg-primary/5 border-l-2 border-l-primary'
              : 'hover:bg-muted/50 border-l-2 border-l-transparent'
          }`}
          style={{ paddingLeft: `${node.depth * 20 + 8}px` }}
          onClick={() => handleSelectRow(node.productId)}
        >
          {hasChildren ? (
            <button
              className="shrink-0 p-0.5 rounded hover:bg-muted"
              onClick={(e) => toggleExpand(key, e)}
            >
              {isExpanded
                ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              }
            </button>
          ) : (
            <span className="w-4.5 shrink-0 text-center text-muted-foreground/40">—</span>
          )}
          <span className={`font-mono text-xs ${hasChildren ? 'font-medium' : 'text-muted-foreground'}`}>
            {node.productName}
          </span>
          <span className="ml-auto font-mono text-xs text-muted-foreground tabular-nums w-16 text-right">
            {node.unitsPerAssy}
          </span>
          <span className="font-mono text-xs text-muted-foreground/60 italic tabular-nums w-20 text-right">
            {ufa !== undefined ? ufa : '—'}
          </span>
        </div>
        {hasChildren && isExpanded && node.children.map((child, i) => renderTreeNode(child, key, i))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden animate-fade-in">
      <PageSavingOverlay
        saving={pageEdit.saving}
        title="Saving"
        subtitle="Writing bill of materials…"
      />
      {leaveDialog}
      {/* Page Header */}
      <div className="px-6 pt-4 pb-2 shrink-0">
        {activeScenarioId && activeScenario && (
          <div className="mb-2 flex items-center gap-2 p-2 bg-warning/10 border border-warning/30 rounded-md">
            <FlaskConical className="h-3.5 w-3.5 text-warning shrink-0" />
            <span className="text-xs text-warning font-medium">
              Changes recorded to <span className="font-semibold">{activeScenario.name}</span>
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Indented Bill of Materials</h1>
            <p className="text-sm text-muted-foreground">Define parent–child relationships between products and their component parts.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Go to:</span>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => confirmLeave(() => navigate(`/models/${modelId}/products`))}>
              Product Form
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => confirmLeave(() => navigate(`/models/${modelId}/operations`))}>
              Operations
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ TOP PANEL — IBOM Structure Tree ═══ */}
      <div className="shrink-0 px-6 pb-2" style={{ height: '45%', minHeight: 200 }}>
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">IBOM Structure</CardTitle>
                {viewAssemblyId && tree.length > 0 && maxDepth > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                    {maxDepth} level{maxDepth !== 1 ? 's' : ''} deep
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Network className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">View assembly:</span>
                <AssemblySelector
                  products={allProducts}
                  ibom={model.ibom}
                  value={viewAssemblyId}
                  onSelect={(v) => confirmLeave(() => applyViewAssembly(v))}
                />
                {viewAssemblyId && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => confirmLeave(clearViewAssembly)}>
                    <X className="h-3 w-3 mr-1" /> Clear
                  </Button>
                )}
              </div>
            </div>
            {viewAssemblyId && (
              <div className="relative mt-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter products…"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="h-7 text-xs pl-7 pr-7"
                />
                {filterText && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setFilterText('')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {!viewAssemblyId ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Select an assembly above to view its structure.
              </div>
            ) : (
              <div className="text-xs">
                {/* Column headers */}
                <div className="flex items-center gap-2 h-7 px-2 border-b border-border bg-muted/30 text-muted-foreground font-medium sticky top-0 z-10">
                  <div className="flex-1 pl-2 flex items-center gap-2">
                    <span>Component</span>
                    <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5 ml-2" onClick={expandAll}>
                      Expand All
                    </Button>
                  </div>
                  <span className="w-16 text-right">Units/Assy</span>
                  <span className="w-20 text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="cursor-help underline decoration-dotted">Units/Final</TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs text-xs">
                          Total units of this component needed per 1 good final assembly across all IBOM levels. Scrap excluded.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                </div>
                {/* Root assembly row */}
                <div
                  className={`flex items-center gap-2 h-8 px-2 cursor-pointer transition-colors ${
                    selectedProductId === viewAssemblyId
                      ? 'bg-primary/5 border-l-2 border-l-primary'
                      : 'hover:bg-muted/50 border-l-2 border-l-transparent'
                  }`}
                  onClick={() => handleSelectRow(viewAssemblyId)}
                >
                  {tree.length > 0 ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <span className="w-3.5 shrink-0 text-center text-muted-foreground/30">—</span>
                  )}
                  <Network className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="font-mono text-xs font-semibold">{prodName(viewAssemblyId)}</span>
                  {tree.length > 0 ? (
                    <Badge variant="outline" className="text-[9px] h-4 px-1">Assembly</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[9px] h-4 px-1 text-muted-foreground">No components yet</Badge>
                  )}
                  <span className="ml-auto w-16 text-right font-mono text-xs text-muted-foreground">—</span>
                  <span className="w-20 text-right font-mono text-xs text-muted-foreground/60">—</span>
                </div>
                {tree.length === 0 && (
                  <div className="pl-10 py-2 text-xs text-muted-foreground">
                    → Click the row above to add components.
                  </div>
                )}
                {filteredTree.map((node, i) => renderTreeNode(node, 'root', i))}
                {filterText && filteredTree.length === 0 && tree.length > 0 && (
                  <div className="flex items-center justify-center py-6 text-muted-foreground text-xs">
                    No matching products found.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══ BOTTOM PANEL — Edit Components ═══ */}
      <div className="flex-1 min-h-0 px-6 pt-2 pb-4 overflow-y-auto" style={{ maxHeight: '50vh' }}>
        <Card className="flex flex-col relative">
          <CardHeader className="py-2 px-4 shrink-0 border-b border-border/80">
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
              <div className="flex items-center gap-2 min-w-0">
                <CardTitle className="text-[13px] font-medium">
                  {editParentId
                    ? <>Components for: <span className="font-mono text-primary">{prodName(editParentId)}</span></>
                    : 'Edit Components'
                  }
                </CardTitle>
                {editParentId && isWhatIfTarget && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-warning/40 text-warning bg-warning/10 shrink-0">
                    ● What-if active
                  </Badge>
                )}
              </div>
              <PageEditActions
                isEditing={pageEdit.isEditing}
                isDirty={isDirty}
                saving={pageEdit.saving}
                canStartEdit={pageEdit.canStartEdit && Boolean(editParentId)}
                editorName={pageEdit.editorName}
                onStartEdit={pageEdit.startEdit}
                onSave={() => void pageEdit.save()}
                onDiscard={pageEdit.discard}
                pageLabel={`IBOM for ${productLabel}`}
              />
            </div>
          </CardHeader>
          <PageEditLockedShell
            editorName={pageEdit.editorName}
            pageLabel={editParentId ? `IBOM for ${productLabel}` : 'IBOM'}
            dimContent={false}
          >
          <CardContent className="p-4 pt-0">
            {!editParentId ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                Click any product in the tree above to edit its components.
              </div>
            ) : draftComponents.length === 0 && !showEmptyPicker ? (
              /* ── Empty state: no components ── */
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="rounded-full bg-muted p-3">
                  <GitBranch className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium">{prodName(editParentId)} has no components yet</p>
                  <p className="text-xs text-muted-foreground">Add components below to define the bill of materials for this product.</p>
                </div>
                <Button
                  size="sm"
                  className="text-xs gap-1"
                  disabled={!pageEdit.canEditFields}
                  onClick={() => setShowEmptyPicker(true)}
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Add Components
                </Button>
              </div>
            ) : draftComponents.length === 0 && showEmptyPicker ? (
              /* ── Empty state with inline picker ── */
              <div className="space-y-3">
                <div className="flex flex-col items-center gap-2 pt-4 pb-2">
                  <p className="text-sm font-medium">{prodName(editParentId)} has no components yet</p>
                  <p className="text-xs text-muted-foreground">Select components to add:</p>
                </div>
                <div className="max-w-md mx-auto">
                  {allProducts.length <= 1 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">No other products exist. Add products in the Products tab first.</p>
                  ) : allowableProducts.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">All valid components have already been added.</p>
                  ) : (
                    <div className="border rounded-md overflow-hidden">
                      <div className="max-h-48 overflow-y-auto">
                        {allowableProducts.map((p, i) => (
                          <label
                            key={p.id}
                            className={cn(
                              'flex items-center gap-2 px-2 text-[13px]',
                              i % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                              pageEdit.canEditFields ? 'cursor-pointer' : 'cursor-default opacity-80',
                            )}
                            style={{ height: 32 }}
                          >
                            <Checkbox
                              className="h-4 w-4"
                              disabled={!pageEdit.canEditFields}
                              checked={checkedAllowable.has(p.id)}
                              onCheckedChange={(checked) => {
                                setCheckedAllowable(prev => { const n = new Set(prev); if (checked) n.add(p.id); else n.delete(p.id); return n; });
                              }}
                            />
                            <span className="flex-1 truncate">{p.name}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-1.5 p-2 border-t border-border bg-muted/30">
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={handleAddChecked}
                          disabled={!pageEdit.canEditFields || checkedAllowable.size === 0}
                        >
                          {checkedAllowable.size > 0 ? `Add ${checkedAllowable.size} Selected` : 'Add Selected'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={handleAddAll}
                          disabled={!pageEdit.canEditFields || allowableProducts.length === 0}
                        >
                          Add All ({allowableProducts.length})
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── Two-column editing layout ── */
              <div className="grid grid-cols-2 gap-4">
                {/* Left: Current Components (from draft) */}
                <div>
                  <p className="text-[13px] font-medium py-2">Current Components</p>
                  <div className="border rounded-md overflow-hidden">
                    {draftComponents.map((c) => {
                      const isConfirming = confirmingRemoveId === c.id;
                      const hasError = upaErrors.has(c.id);
                      const isUpaChanged = changedUpaIds.has(c.id);
                      const isNewlyAdded = !!c.isNew;
                      return (
                        <div
                          key={c.id}
                          className={`flex items-center px-2 border-b border-border/50 last:border-0 ${
                            isConfirming ? 'bg-destructive/10' : ''
                          } ${isUpaChanged ? 'border-l-2 border-l-amber-400' : ''}`}
                          style={{ height: 36 }}
                        >
                          {isConfirming ? (
                            <div className="flex items-center justify-between w-full text-xs">
                              <span className="text-destructive font-medium">Remove {prodName(c.component_product_id)}?</span>
                              <div className="flex gap-1">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-6 text-[11px] px-2"
                                  disabled={!pageEdit.canEditFields}
                                  onClick={() => handleRemoveDraft(c.id)}
                                >
                                  Confirm
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2" onClick={() => setConfirmingRemoveId(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className={`flex-1 text-[13px] truncate ${isNewlyAdded ? 'text-primary font-medium' : ''}`}>
                                {prodName(c.component_product_id)}
                              </span>
                              <div className="shrink-0 ml-2">
                                {pageEditCell(
                                  pageEdit.canEditFields,
                                  <NonNegativeNumericInput
                                    className={`h-7 w-14 text-[13px] font-mono text-center ${hasError ? 'border-destructive focus-visible:ring-destructive' : isUpaChanged ? 'border-amber-400' : ''}`}
                                    value={c.units_per_assy}
                                    key={`${c.id}-${c.units_per_assy}`}
                                    onChange={(v) => handleUpaChange(c.id, String(v), c.units_per_assy)}
                                    onBlur={() => handleUpaBlur(c.id)}
                                  />,
                                  (el) =>
                                    wrapCell(
                                      c.id,
                                      'units_per_assy',
                                      el,
                                      () => draftComponents.find((d) => d.id === c.id)?.units_per_assy,
                                    ),
                                )}
                                {hasError && <p className="text-[9px] text-destructive">{'> 0'}</p>}
                              </div>
                              <button
                                type="button"
                                disabled={!pageEdit.canEditFields}
                                className={cn(
                                  'shrink-0 ml-2 text-destructive transition-colors',
                                  pageEdit.canEditFields
                                    ? 'hover:text-destructive/80'
                                    : 'opacity-40 cursor-not-allowed',
                                )}
                                style={{ width: 24, height: 24 }}
                                onClick={() => pageEdit.canEditFields && setConfirmingRemoveId(c.id)}
                                title="Remove"
                              >
                                <X className="h-3.5 w-3.5 mx-auto" />
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={() => setShowRemoveAllDialog(true)}
                      disabled={!pageEdit.canEditFields || draftComponents.length === 0}
                    >
                      Remove All
                    </Button>
                  </div>
                </div>

                {/* Right: Add Components */}
                <div className="flex flex-col">
                  <p className="text-[13px] font-medium py-2">Available to add:</p>
                  <div className="border rounded-md overflow-hidden flex flex-col">
                    {allProducts.length <= 1 ? (
                      <p className="text-xs text-muted-foreground p-2">No other products exist. Add products in the Products tab first.</p>
                    ) : allowableProducts.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-2">All valid components have already been added.</p>
                    ) : (
                      <>
                        <div className="max-h-48 overflow-y-auto">
                          {allowableProducts.map((p, i) => (
                            <label
                              key={p.id}
                              className={cn(
                                'flex items-center gap-2 px-2 text-[13px]',
                                i % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                                pageEdit.canEditFields ? 'cursor-pointer' : 'cursor-default opacity-80',
                              )}
                              style={{ height: 32 }}
                            >
                              <Checkbox
                                className="h-4 w-4"
                                disabled={!pageEdit.canEditFields}
                                checked={checkedAllowable.has(p.id)}
                                onCheckedChange={(checked) => {
                                  setCheckedAllowable(prev => { const n = new Set(prev); if (checked) n.add(p.id); else n.delete(p.id); return n; });
                                }}
                              />
                              <span className="flex-1 truncate">{p.name}</span>
                            </label>
                          ))}
                        </div>
                        <div className="flex gap-1.5 p-2 border-t border-border bg-muted/30 sticky bottom-0">
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={handleAddChecked}
                            disabled={!pageEdit.canEditFields || checkedAllowable.size === 0}
                          >
                            {checkedAllowable.size > 0 ? `Add ${checkedAllowable.size} Selected` : 'Add Selected'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={handleAddAll}
                            disabled={!pageEdit.canEditFields || allowableProducts.length === 0}
                          >
                            Add All ({allowableProducts.length})
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          </PageEditLockedShell>
        </Card>
      </div>

      {/* Remove All Confirmation Dialog */}
      <Dialog open={showRemoveAllDialog} onOpenChange={setShowRemoveAllDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove All Components</DialogTitle>
            <DialogDescription>
              Remove all {draftComponents.length} components from {editParentId ? prodName(editParentId) : ''}? Save to apply for everyone in your organization.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowRemoveAllDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveAll}>Remove All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function AssemblySelector({ products, ibom, value, onSelect }: {
  products: { id: string; name: string }[];
  ibom: IBOMEntry[];
  value: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = products.find(p => p.id === value);
  const compCount = (pid: string) => ibom.filter(e => e.parent_product_id === pid).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-52 justify-between h-7 font-mono text-xs"
        >
          {selected ? (
            <span className="truncate">
              {selected.name}
              {compCount(selected.id) > 0 && <span className="text-muted-foreground ml-1">({compCount(selected.id)})</span>}
            </span>
          ) : (
            'Select assembly…'
          )}
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search products…" className="h-8" />
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            {products.map(p => {
              const cc = compCount(p.id);
              return (
                <CommandItem
                  key={p.id}
                  value={p.name}
                  onSelect={() => { onSelect(p.id); setOpen(false); }}
                  className="font-mono text-xs flex items-center justify-between"
                >
                  <span>{p.name}</span>
                  {cc > 0 && (
                    <span className="text-muted-foreground text-[10px] ml-2">({cc})</span>
                  )}
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}