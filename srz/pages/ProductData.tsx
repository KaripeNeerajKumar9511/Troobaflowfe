import { useState, useLayoutEffect, useRef, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModelStore, displayParamNames, SHOW_PARAM_VARIABLE_FIELDS_IN_UI, type Product, type Model } from '@/stores/modelStore';
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';
import { DeleteConfirmInline } from '@/components/DeleteConfirmInline';
import { useScenarioStore } from '@/stores/scenarioStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Trash2, LayoutGrid, List, Copy, GitBranch, Network, ChevronDown, ChevronUp, Info, FlaskConical, Package } from 'lucide-react';
import { toast } from 'sonner';
import { DoubleClickEditableName } from '@/components/DoubleClickEditableName';
import { DeptCodeSelect } from '@/components/DeptCodeSelect';
import { ProductTbatchInput } from '@/components/ProductTbatchInput';
import { NonNegativeNumericInput } from '@/components/NonNegativeNumericInput';
import { useCollabCell } from '@/hooks/useCollabCell';
import { useModelRefreshSync } from '@/hooks/useModelRefreshSync';
import { useOrgCollab } from '@/contexts/OrgCollabContext';
import { syncModelToOrg } from '@/lib/collabSync';
import { usePageEditMode, usePageEditLockState } from '@/hooks/usePageEditMode';
import { usePageEditBaseline } from '@/hooks/usePageEditBaseline';
import { PageEditActions } from '@/components/PageEditActions';
import { PageEditLockedShell } from '@/components/PageEditLockedShell';
import { PageEditLeaveGuard } from '@/components/PageEditLeaveGuard';
import { productsDraftDirty } from '@/lib/draftDirty';
import { persistProductsDraft } from '@/lib/pageEditPersist';
import { pageEditCell } from '@/lib/pageEditCell';

const FIELD_LABELS: Record<string, string> = {
  name: 'Name', demand: 'End Demand', lot_size: 'Lot Size', tbatch_size: 'TBatch Size',
  demand_factor: 'Demand Factor', lot_factor: 'Lot Factor', var_factor: 'Var Factor',
  setup_factor: 'Setup Factor', make_to_stock: 'Make to Stock', gather_tbatches: 'Gather TBatches',
  dept_code: 'Dept/Area', prod1: 'Prod1', prod2: 'Prod2', prod3: 'Prod3', prod4: 'Prod4', comments: 'Comments',
};

function cloneProductsFromModel(model: Model): Product[] {
  return (model.products ?? []).map((p) => ({ ...p }));
}

function InfoTip({ text }: { text: string }) {
  return (
    <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent className="max-w-[280px] text-xs">{text}</TooltipContent></Tooltip></TooltipProvider>
  );
}

export default function ProductData() {
  const model = useModelStore((s) => s.getActiveModel());
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'form'>('table');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [draftProducts, setDraftProducts] = useState<Product[]>([]);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const lastModelIdRef = useRef<string | null>(null);
  const { pendingDeleteId, requestDelete, cancelDelete, confirmDelete } = useDeleteConfirmation();
  const activeScenarioId = useScenarioStore(s => s.activeScenarioId);
  const activeScenario = useScenarioStore(s => s.scenarios.find(sc => sc.id === s.activeScenarioId));
  const applyScenarioChange = useScenarioStore(s => s.applyScenarioChange);
  const { wrapCell } = useCollabCell(model?.id, 'product');
  const collab = useOrgCollab();
  const editingRef = useRef(false);
  const { isHolder } = usePageEditLockState(model?.id, 'products');
  const editBaseline = usePageEditBaseline(isHolder, model);
  const compareModel = editBaseline ?? model;
  const isDirty = compareModel ? productsDraftDirty(compareModel, draftProducts) : false;

  const pageEdit = usePageEditMode({
    modelId: model?.id,
    page: 'products',
    pageLabel: 'Products',
    isDirty,
    onDiscard: () => {
      if (editBaseline) setDraftProducts(cloneProductsFromModel(editBaseline));
      else if (model) setDraftProducts(cloneProductsFromModel(model));
      setEditingNameId(null);
    },
    onSave: async () => {
      if (!model || !editBaseline) return;
      await persistProductsDraft(model.id, draftProducts, editBaseline);
      const fresh = await syncModelToOrg(collab, model.id, 'products');
      if (fresh) setDraftProducts(cloneProductsFromModel(fresh));
      setEditingNameId(null);
    },
  });

  editingRef.current = pageEdit.isEditing;

  useModelRefreshSync(model?.id, (fresh) => {
    if (editingRef.current) return;
    setDraftProducts(cloneProductsFromModel(fresh));
    setEditingNameId(null);
  });

  useLayoutEffect(() => {
    if (!model) return;
    if (lastModelIdRef.current === model.id) return;
    lastModelIdRef.current = model.id;
    setDraftProducts(cloneProductsFromModel(model));
    setEditingNameId(null);
  }, [model?.id, model]);

  const tryCommitProductName = (id: string, raw: string): boolean => {
    const next = raw.toUpperCase();
    const row = draftProducts.find((o) => o.id === id);
    if (row?.name === next) return true;
    if (draftProducts.some((o) => o.id !== id && o.name.toLowerCase() === next.toLowerCase())) {
      toast.error('A product with this name already exists');
      return false;
    }
    handleCellChange(id, 'name', next);
    return true;
  };

  const handleAdd = () => {
    if (!model || !newName.trim() || !pageEdit.canEditFields) return;
    if (draftProducts.some((p) => p.name.toLowerCase() === newName.trim().toLowerCase())) {
      toast.error('A product with this name already exists');
      return;
    }
    const p: Product = {
      id: crypto.randomUUID(), name: newName.trim().toUpperCase(), demand: 0, lot_size: 1,
      tbatch_size: -1, demand_factor: 1, lot_factor: 1, var_factor: 1, setup_factor: 1,
      make_to_stock: false, gather_tbatches: true, dept_code: '',
      prod1: 0, prod2: 0, prod3: 0, prod4: 0, comments: '',
    };
    setDraftProducts((prev) => [...prev, p]);
    toast.success(`Product "${p.name}" added (save to persist)`);
    setNewName('');
    setShowAdd(false);
  };

  const handleCopy = (p: Product) => {
    if (!model || !pageEdit.canEditFields) return;
    const newP: Product = { ...p, id: crypto.randomUUID(), name: `${p.name}_COPY` };
    setDraftProducts((prev) => [...prev, newP]);
    toast.success(`Product "${newP.name}" added (save to persist)`);
  };

  const handleCellChange = (id: string, field: keyof Product, value: unknown) => {
    if (!pageEdit.canEditFields) return;
    if (model && activeScenarioId && activeScenario) {
      const prod = draftProducts.find(pr => pr.id === id);
      const entityName = prod?.name || id;
      const fieldLabel = FIELD_LABELS[field] || field;
      applyScenarioChange(activeScenarioId, 'Product', id, entityName, field, fieldLabel, value as string | number);
    }
    setDraftProducts((prev) => prev.map((pr) => (pr.id === id ? { ...pr, [field]: value } : pr)));
  };

  const collabCell = (id: string, field: keyof Product, child: ReactElement) =>
    pageEditCell(pageEdit.canEditFields, child, (c) =>
      wrapCell(id, field, c, () => draftProducts.find((p) => p.id === id)?.[field]),
    );

  const handleDeleteProduct = (id: string) => {
    if (!model || !pageEdit.canEditFields) return;
    setEditingNameId((cur) => (cur === id ? null : cur));
    setDraftProducts((prev) => prev.filter((p) => p.id !== id));
  };

  if (!model) return (
    <div className="p-6 space-y-4">
      <div className="h-7 w-48 bg-muted animate-pulse rounded" />
      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      <div className="h-64 bg-muted animate-pulse rounded-lg" />
    </div>
  );

  const goToOps = (productId: string) => {
    navigate(`/models/${model.id}/operations?product=${productId}`);
  };

  const opsCount = (productId: string) => model.operations.filter((o) => o.product_id === productId).length;
  const ibomCount = (productId: string) => model.ibom.filter(e => e.parent_product_id === productId).length;
  const pn = displayParamNames(model);
  return (
    <>
    <PageEditLeaveGuard
      isEditing={pageEdit.isEditing}
      isDirty={isDirty}
      saving={pageEdit.saving}
      onSave={pageEdit.save}
      onDiscard={pageEdit.discard}
      leaveDescription="You have unsaved product changes. Save or discard before leaving this page."
      savingSubtitle="Writing products…"
    />
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
          <h1 className="text-xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{draftProducts.length} products defined</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)} className="gap-1 text-xs">
            {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </Button>
          <div className="flex border rounded-md overflow-hidden">
            <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-none" onClick={() => setViewMode('table')}><List className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'form' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-none" onClick={() => setViewMode('form')}><LayoutGrid className="h-4 w-4" /></Button>
          </div>
          <PageEditActions
            isEditing={pageEdit.isEditing}
            isDirty={isDirty}
            saving={pageEdit.saving}
            canStartEdit={pageEdit.canStartEdit}
            editorName={pageEdit.editorName}
            onStartEdit={pageEdit.startEdit}
            onSave={() => void pageEdit.save()}
            onDiscard={pageEdit.discard}
            pageLabel="Products"
          />
          <Button onClick={() => setShowAdd(true)} size="sm" className="gap-1" disabled={!pageEdit.canEditFields}><Plus className="h-4 w-4" /> Add Product</Button>
        </div>
      </div>

      <PageEditLockedShell editorName={pageEdit.editorName} pageLabel="Products" dimContent={false}>
      {draftProducts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center flex flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-primary p-5">
            <Package className="h-10 w-10 mx-auto text-foreground" />
            </div>
            <p className="text-foreground font-medium mb-1">No products defined</p>
            <p className="text-sm text-muted-foreground/70 mb-4">Add products to define demand, lot sizes, and IBOM structures.</p>
            <Button onClick={() => setShowAdd(true)} className="gap-1" disabled={!pageEdit.canEditFields}><Plus className="h-4 w-4" /> Add First Product</Button>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <Card className={activeScenarioId ? 'border-l-[3px] border-l-amber-400' : ''}>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-xs">Name</TableHead>
                  <TableHead className="font-mono text-xs">
                    <TooltipProvider delayDuration={400}><Tooltip><TooltipTrigger asChild><span className="cursor-help">End Demand</span></TooltipTrigger><TooltipContent className="max-w-[260px] text-xs">Quantity shipped directly to customers. Set to 0 for components used only within assemblies; their production quantity will be calculated automatically from the IBOM.</TooltipContent></Tooltip></TooltipProvider>
                  </TableHead>
                  <TableHead className="font-mono text-xs">Lot Size</TableHead>
                  {showAdvanced && <>
                    <TableHead className="font-mono text-xs">TBatch</TableHead>
                    <TableHead className="font-mono text-xs">Dept/Area</TableHead>
                    <TableHead className="font-mono text-xs">Demand Fac</TableHead>
                    <TableHead className="font-mono text-xs">Lot Fac</TableHead>
                    <TableHead className="font-mono text-xs">Var Fac</TableHead>

                    <TableHead className="font-mono text-xs">MTS</TableHead>
                    <TableHead className="font-mono text-xs">Gather</TableHead>
                    {SHOW_PARAM_VARIABLE_FIELDS_IN_UI && <>
                      <TableHead className="font-mono text-xs">{pn.prod1_name}</TableHead>
                      <TableHead className="font-mono text-xs">{pn.prod2_name}</TableHead>
                      <TableHead className="font-mono text-xs">{pn.prod3_name}</TableHead>
                      <TableHead className="font-mono text-xs">{pn.prod4_name}</TableHead>
                    </>}
                  </>}
                  <TableHead className="font-mono text-xs">Ops</TableHead>
                  <TableHead className="font-mono text-xs">IBOM</TableHead>
                  <TableHead className="font-mono text-xs">Comments</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draftProducts.map((p) => {
                  const isConfirming = pendingDeleteId === p.id;
                  return (
                  <TableRow key={p.id} className={isConfirming ? 'bg-destructive/10' : ''}>
                    {isConfirming ? (
                      <TableCell colSpan={showAdvanced ? (SHOW_PARAM_VARIABLE_FIELDS_IN_UI ? 18 : 14) : 8}>
                        <DeleteConfirmInline
                          message={`Delete ${p.name}? This will remove its operations and IBOM data.`}
                          onConfirm={() => confirmDelete(p.id, () => handleDeleteProduct(p.id))}
                          onCancel={cancelDelete}
                        />
                      </TableCell>
                    ) : (<>
                    <TableCell className="font-mono font-medium max-w-[220px]">
                      {collabCell(p.id, 'name', (
                        <DoubleClickEditableName
                          value={p.name}
                          isEditing={editingNameId === p.id}
                          onRequestEdit={() => setEditingNameId(p.id)}
                          onCommit={(t) => tryCommitProductName(p.id, t)}
                          onCancelEdit={() => setEditingNameId(null)}
                        />
                      ))}
                    </TableCell>
                    <TableCell>{collabCell(p.id, 'demand', <NonNegativeNumericInput value={p.demand} onChange={(v) => handleCellChange(p.id, 'demand', v)} />)}</TableCell>
                    <TableCell>
                      {collabCell(p.id, 'lot_size', <NonNegativeNumericInput value={p.lot_size} onChange={(v) => handleCellChange(p.id, 'lot_size', v)} />)}
                      {p.lot_size < 1 && <span className="text-[10px] text-destructive">≥ 1</span>}
                    </TableCell>
                    {showAdvanced && <>
                      <TableCell>
                        {collabCell(p.id, 'tbatch_size', (
                          <ProductTbatchInput
                            tbatchSize={p.tbatch_size}
                            className="h-8 w-20 font-mono"
                            onChange={(v) => handleCellChange(p.id, 'tbatch_size', v)}
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        {collabCell(p.id, 'dept_code', (
                          <DeptCodeSelect modelId={model.id} value={p.dept_code} onChange={(v) => handleCellChange(p.id, 'dept_code', v)} section="product" className="h-8 w-28" />
                        ))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {collabCell(p.id, 'demand_factor', <NonNegativeNumericInput allowDecimal value={p.demand_factor} onChange={(v) => handleCellChange(p.id, 'demand_factor', v)} />)}
                          <InfoTip text="Scales the product demand without changing the stored demand value. Set to 0 to effectively exclude this product from calculations while keeping its data." />
                        </div>
                      </TableCell>
                      <TableCell>{collabCell(p.id, 'lot_factor', <NonNegativeNumericInput allowDecimal value={p.lot_factor} onChange={(v) => handleCellChange(p.id, 'lot_factor', v)} />)}</TableCell>
                      <TableCell>{collabCell(p.id, 'var_factor', <NonNegativeNumericInput allowDecimal value={p.var_factor} onChange={(v) => handleCellChange(p.id, 'var_factor', v)} />)}</TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          {collabCell(p.id, 'make_to_stock', <Switch checked={p.make_to_stock} onCheckedChange={(v) => handleCellChange(p.id, 'make_to_stock', v)} />)}
                          <InfoTip text="When checked, this component is assumed to be held in stock. Its MCT does not add to the parent assembly MCT. Use for Assemble-to-Order scenarios." />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {collabCell(p.id, 'gather_tbatches', <Switch checked={p.gather_tbatches} onCheckedChange={(v) => handleCellChange(p.id, 'gather_tbatches', v)} />)}
                          <InfoTip text="When checked, the first transfer batch waits for the full lot before moving to stock. Uncheck if transfer batches are sent forward immediately as completed." />
                        </div>
                      </TableCell>
                      {SHOW_PARAM_VARIABLE_FIELDS_IN_UI && <>
                        <TableCell>{collabCell(p.id, 'prod1', <NonNegativeNumericInput value={p.prod1} onChange={(v) => handleCellChange(p.id, 'prod1', v)} />)}</TableCell>
                        <TableCell>{collabCell(p.id, 'prod2', <NonNegativeNumericInput value={p.prod2} onChange={(v) => handleCellChange(p.id, 'prod2', v)} />)}</TableCell>
                        <TableCell>{collabCell(p.id, 'prod3', <NonNegativeNumericInput value={p.prod3} onChange={(v) => handleCellChange(p.id, 'prod3', v)} />)}</TableCell>
                        <TableCell>{collabCell(p.id, 'prod4', <NonNegativeNumericInput value={p.prod4} onChange={(v) => handleCellChange(p.id, 'prod4', v)} />)}</TableCell>
                      </>}
                    </>}
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs font-mono" onClick={() => goToOps(p.id)}>
                        <GitBranch className="h-3 w-3" />{opsCount(p.id)}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider delayDuration={400}><Tooltip><TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className={`h-7 gap-1 text-xs font-mono ${ibomCount(p.id) === 0 ? 'text-muted-foreground' : ''}`} onClick={() => navigate(`/models/${model.id}/ibom?product=${p.id}`)}>
                          <Network className="h-3 w-3" />{ibomCount(p.id)}
                        </Button>
                      </TooltipTrigger><TooltipContent className="text-xs">View IBOM for {p.name}</TooltipContent></Tooltip></TooltipProvider>
                    </TableCell>
                    <TableCell>{collabCell(p.id, 'comments', <Input className="h-8 w-32" value={p.comments} onChange={(e) => handleCellChange(p.id, 'comments', e.target.value)} />)}</TableCell>
                    <TableCell>
                      <div className="flex gap-0.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!pageEdit.canEditFields} onClick={() => handleCopy(p)} title="Duplicate"><Copy className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" disabled={!pageEdit.canEditFields} onClick={() => { setEditingNameId((cur) => (cur === p.id ? null : cur)); requestDelete(p.id); }} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                    </>)}
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {draftProducts.map((p) => (
            <Card key={p.id} className={activeScenarioId ? 'border-l-[3px] border-l-amber-400' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-mono min-h-8 flex items-center flex-1 min-w-0">
                    {collabCell(p.id, 'name', (
                      <DoubleClickEditableName
                        value={p.name}
                        isEditing={editingNameId === p.id}
                        onRequestEdit={() => setEditingNameId(p.id)}
                        onCommit={(t) => tryCommitProductName(p.id, t)}
                        onCancelEdit={() => setEditingNameId(null)}
                        spanClassName="text-base"
                        inputClassName="h-9 text-base"
                      />
                    ))}
                  </CardTitle>
                  <div className="flex gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!pageEdit.canEditFields} onClick={() => handleCopy(p)}><Copy className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" disabled={!pageEdit.canEditFields} onClick={() => { if (confirm(`Delete ${p.name}? This will remove its operations and IBOM data.`)) { setEditingNameId((cur) => (cur === p.id ? null : cur)); handleDeleteProduct(p.id); } }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <TooltipProvider delayDuration={400}><Tooltip><TooltipTrigger asChild><Label className="text-xs cursor-help">End Demand</Label></TooltipTrigger><TooltipContent className="max-w-[260px] text-xs">Quantity shipped directly to customers. Set to 0 for components used only within assemblies; their production quantity will be calculated automatically from the IBOM.</TooltipContent></Tooltip></TooltipProvider>
                      {collabCell(p.id, 'demand', <NonNegativeNumericInput value={p.demand} onChange={(v) => handleCellChange(p.id, 'demand', v)} />)}
                    </div>
                    <div><Label className="text-xs">Lot Size</Label>{collabCell(p.id, 'lot_size', <NonNegativeNumericInput value={p.lot_size} onChange={(v) => handleCellChange(p.id, 'lot_size', v)} />)}</div>
                  </div>
                  <div><Label className="text-xs">Comments</Label>{collabCell(p.id, 'comments', <Input className="h-8" value={p.comments} onChange={(e) => handleCellChange(p.id, 'comments', e.target.value)} />)}</div>
                  <Button variant="outline" size="sm" className="w-full gap-1 text-xs" onClick={() => goToOps(p.id)}>
                    <GitBranch className="h-3.5 w-3.5" /> Operations ({opsCount(p.id)})
                  </Button>
                  <Button variant="outline" size="sm" className="w-full gap-1 text-xs" onClick={() => navigate(`/models/${model.id}/ibom?product=${p.id}`)}>
                    <Network className="h-3.5 w-3.5" /> IBOM ({ibomCount(p.id)})
                  </Button>

                  {showAdvanced && (
                    <div className="pt-3 border-t border-border space-y-3">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Advanced Parameters</Label>
                      <div className="grid grid-cols-2 gap-3">
                         <div>
                            <Label className="text-xs">Transfer Batch</Label>
                            {collabCell(p.id, 'tbatch_size', (
                              <ProductTbatchInput
                                tbatchSize={p.tbatch_size}
                                className="h-8 font-mono"
                                onChange={(v) => handleCellChange(p.id, 'tbatch_size', v)}
                              />
                            ))}
                          </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <Label className="text-xs">Demand Factor</Label>
                            <InfoTip text="Scales the product demand without changing the stored demand value. Set to 0 to effectively exclude this product from calculations while keeping its data." />
                          </div>
                          {collabCell(p.id, 'demand_factor', <NonNegativeNumericInput allowDecimal value={p.demand_factor} onChange={(v) => handleCellChange(p.id, 'demand_factor', v)} />)}
                        </div>
                        <div><Label className="text-xs">Lot Factor</Label>{collabCell(p.id, 'lot_factor', <NonNegativeNumericInput allowDecimal value={p.lot_factor} onChange={(v) => handleCellChange(p.id, 'lot_factor', v)} />)}</div>
                        <div><Label className="text-xs">Var Factor</Label>{collabCell(p.id, 'var_factor', <NonNegativeNumericInput allowDecimal value={p.var_factor} onChange={(v) => handleCellChange(p.id, 'var_factor', v)} />)}</div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Label className="text-xs">Make to Stock</Label>
                          <InfoTip text="When checked, this component is assumed to be held in stock. Its MCT does not add to the parent assembly MCT. Use for Assemble-to-Order scenarios." />
                        </div>
                        {collabCell(p.id, 'make_to_stock', <Switch checked={p.make_to_stock} onCheckedChange={(v) => handleCellChange(p.id, 'make_to_stock', v)} />)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Label className="text-xs">Gather Transfer Batches</Label>
                          <InfoTip text="When checked, the first transfer batch waits for the full lot before moving to stock. Uncheck if transfer batches are sent forward immediately as completed." />
                        </div>
                        {collabCell(p.id, 'gather_tbatches', <Switch checked={p.gather_tbatches} onCheckedChange={(v) => handleCellChange(p.id, 'gather_tbatches', v)} />)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <Label className="text-xs">Group / Dept / Area</Label>
                          <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger><TooltipContent className="max-w-[200px] text-xs">Products with the same Group label will be subtotalled together in the Output Summary.</TooltipContent></Tooltip></TooltipProvider>
                        </div>
                        {collabCell(p.id, 'dept_code', (
                          <DeptCodeSelect modelId={model.id} value={p.dept_code} onChange={(v) => handleCellChange(p.id, 'dept_code', v)} section="product" className="h-8" />
                        ))}
                      </div>
                      {SHOW_PARAM_VARIABLE_FIELDS_IN_UI && (
                      <div className="pt-2 border-t border-border">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">Parameter Variables <InfoTip text="Use Display Name to rename the variable. The new label appears across the app and in the Formula Builder." /></Label>
                        <div className="grid grid-cols-4 gap-3 mt-1.5">
                          {(['prod1', 'prod2', 'prod3', 'prod4'] as const).map((key) => (
                            <div key={key}>
                              <Label className="text-xs">{pn[`${key}_name` as keyof typeof pn]}</Label>
                              {collabCell(p.id, key, <NonNegativeNumericInput value={p[key]} onChange={(v) => handleCellChange(p.id, key, v)} />)}
                            </div>
                          ))}
                        </div>
                      </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </PageEditLockedShell>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
          <div><Label>Product Name</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., HUB1" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAdd()} /></div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!newName.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}