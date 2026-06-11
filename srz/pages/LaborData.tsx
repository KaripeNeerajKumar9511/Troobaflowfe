import { useState, useLayoutEffect, useRef, useEffect, type ReactElement } from 'react';
import { useModelStore, displayParamNames, SHOW_PARAM_VARIABLE_FIELDS_IN_UI, type LaborGroup, type Model } from '@/stores/modelStore';
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';
import { DeleteConfirmInline } from '@/components/DeleteConfirmInline';
import { useScenarioStore } from '@/stores/scenarioStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, LayoutGrid, List, Users, Info, ChevronDown, ChevronUp, FlaskConical } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUserLevelStore, isVisible } from '@/hooks/useUserLevel';
import { toast } from 'sonner';
import { DoubleClickEditableName } from '@/components/DoubleClickEditableName';
import { DeptCodeSelect } from '@/components/DeptCodeSelect';
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
import { laborDraftDirty } from '@/lib/draftDirty';
import { persistLaborDraft } from '@/lib/pageEditPersist';
import { pageEditCell } from '@/lib/pageEditCell';

const FIELD_LABELS: Record<string, string> = {
  name: 'Name', count: 'Count', overtime_pct: 'Overtime %', unavail_pct: 'Unavail %',
  dept_code: 'Dept/Area', setup_factor: 'Setup Factor', run_factor: 'Run Factor',
  var_factor: 'Var Factor', prioritize_use: 'Prioritize Use',
  lab1: 'Lab1', lab2: 'Lab2', lab3: 'Lab3', lab4: 'Lab4', comments: 'Comments',
};

function cloneLaborFromModel(model: Model): LaborGroup[] {
  return (model.labor ?? []).map((l) => ({ ...l }));
}

function InfoTip({ text }: { text: string }) {
  return (
    <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent className="max-w-[280px] text-xs">{text}</TooltipContent></Tooltip></TooltipProvider>
  );
}

export default function LaborData() {
  const model = useModelStore((s) => s.getActiveModel());
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'form'>('table');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [draftLabor, setDraftLabor] = useState<LaborGroup[]>([]);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const lastModelIdRef = useRef<string | null>(null);
  const { pendingDeleteId, requestDelete, cancelDelete, confirmDelete } = useDeleteConfirmation();
  const { userLevel } = useUserLevelStore();
  const activeScenarioId = useScenarioStore(s => s.activeScenarioId);
  const activeScenario = useScenarioStore(s => s.scenarios.find(sc => sc.id === s.activeScenarioId));
  const applyScenarioChange = useScenarioStore(s => s.applyScenarioChange);
  const { wrapCell } = useCollabCell(model?.id, 'labor');
  const collab = useOrgCollab();
  const editingRef = useRef(false);
  const { isHolder } = usePageEditLockState(model?.id, 'labor');
  const editBaseline = usePageEditBaseline(isHolder, model);
  const compareModel = editBaseline ?? model;
  const isDirty = compareModel ? laborDraftDirty(compareModel, draftLabor) : false;

  const pageEdit = usePageEditMode({
    modelId: model?.id,
    page: 'labor',
    pageLabel: 'Labor',
    isDirty,
    onDiscard: () => {
      if (editBaseline) setDraftLabor(cloneLaborFromModel(editBaseline));
      else if (model) setDraftLabor(cloneLaborFromModel(model));
      setEditingNameId(null);
    },
    onSave: async () => {
      if (!model || !editBaseline) return;
      await persistLaborDraft(model.id, draftLabor, editBaseline);
      const fresh = await syncModelToOrg(collab, model.id, 'labor');
      if (fresh) setDraftLabor(cloneLaborFromModel(fresh));
      setEditingNameId(null);
    },
  });

  editingRef.current = pageEdit.isEditing;

  useModelRefreshSync(model?.id, (fresh) => {
    if (editingRef.current) return;
    setDraftLabor(cloneLaborFromModel(fresh));
    setEditingNameId(null);
  });

  useLayoutEffect(() => {
    if (!model) return;
    if (lastModelIdRef.current === model.id) return;
    lastModelIdRef.current = model.id;
    setDraftLabor(cloneLaborFromModel(model));
    setEditingNameId(null);
  }, [model?.id, model]);

  const tryCommitLaborName = (id: string, raw: string): boolean => {
    const next = raw.toUpperCase();
    const row = draftLabor.find((o) => o.id === id);
    if (row?.name === next) return true;
    if (draftLabor.some((o) => o.id !== id && o.name.toLowerCase() === next.toLowerCase())) {
      toast.error('Another labor group already uses this name');
      return false;
    }
    handleCellChange(id, 'name', next);
    return true;
  };

  const handleAdd = () => {
    if (!model || !newName.trim() || !pageEdit.canEditFields) return;
    const l: LaborGroup = {
      id: crypto.randomUUID(), name: newName.trim().toUpperCase(), count: 1,
      overtime_pct: 0, unavail_pct: 0, dept_code: '', prioritize_use: false,
      setup_factor: 1, run_factor: 1, var_factor: 1,
      lab1: 0, lab2: 0, lab3: 0, lab4: 0, comments: '',
    };
    setDraftLabor((prev) => [...prev, l]);
    setNewName('');
    setShowAdd(false);
    toast.success(`Labor group "${l.name}" added (save to persist)`);
  };

  const handleCellChange = (id: string, field: keyof LaborGroup, value: string | number | boolean) => {
    if (!pageEdit.canEditFields) return;
    if (model && activeScenarioId && activeScenario) {
      const labor = draftLabor.find(l => l.id === id);
      const entityName = labor?.name || id;
      const fieldLabel = FIELD_LABELS[field] || field;
      applyScenarioChange(activeScenarioId, 'Labor', id, entityName, field, fieldLabel, value as string | number);
    }
    setDraftLabor((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const collabCell = (id: string, field: keyof LaborGroup, child: ReactElement) =>
    pageEditCell(pageEdit.canEditFields, child, (c) =>
      wrapCell(id, field, c, () => draftLabor.find((l) => l.id === id)?.[field]),
    );

  const handleDeleteLabor = (id: string) => {
    if (!model || !pageEdit.canEditFields) return;
    setEditingNameId((cur) => (cur === id ? null : cur));
    setDraftLabor((prev) => prev.filter((l) => l.id !== id));
  };

  if (!model) return (
    <div className="p-6 space-y-4">
      <div className="h-7 w-48 bg-muted animate-pulse rounded" />
      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      <div className="h-64 bg-muted animate-pulse rounded-lg" />
    </div>
  );

  const pn = displayParamNames(model);

  return (
    <>
    <PageEditLeaveGuard
      isEditing={pageEdit.isEditing}
      isDirty={isDirty}
      saving={pageEdit.saving}
      onSave={pageEdit.save}
      onDiscard={pageEdit.discard}
      leaveDescription="You have unsaved labor changes. Save or discard before leaving this page."
      savingSubtitle="Writing labor groups…"
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
          <h1 className="text-xl font-bold">Labor Groups</h1>
          <p className="text-sm text-muted-foreground">{draftLabor.length} groups defined</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)} className="gap-1 text-xs">
            {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </Button>
          <div className="flex border rounded-md overflow-hidden">
            <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-none" onClick={() => setViewMode('table')}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'form' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-none" onClick={() => setViewMode('form')}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
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
            pageLabel="Labor"
          />
          <Button onClick={() => setShowAdd(true)} size="sm" className="gap-1" disabled={!pageEdit.canEditFields}>
            <Plus className="h-4 w-4" /> Add Labor Group
          </Button>
        </div>
      </div>

      <PageEditLockedShell editorName={pageEdit.editorName} pageLabel="Labor" dimContent={false}>
      {draftLabor.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center flex flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-primary p-5">
            <Users className="h-10 w-10 mx-auto text-foreground" />
            </div>
            <p className="text-foreground font-medium mb-1">No labor groups defined</p>
            <p className="text-sm text-muted-foreground/70 mb-4">Add labor groups to define worker pools for your operations.</p>
            <Button onClick={() => setShowAdd(true)} className="gap-1" disabled={!pageEdit.canEditFields}><Plus className="h-4 w-4" /> Add First Labor Group</Button>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <Card className={activeScenarioId ? 'border-l-[3px] border-l-amber-400' : ''}>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-xs">Name</TableHead>
                  <TableHead className="font-mono text-xs">Count</TableHead>
                  <TableHead className="font-mono text-xs">Overtime %</TableHead>
                  <TableHead className="font-mono text-xs">Unavail %</TableHead>
                  {showAdvanced && <>
                    <TableHead className="font-mono text-xs">Dept/Area</TableHead>
                    <TableHead className="font-mono text-xs">Setup Fac</TableHead>
                    <TableHead className="font-mono text-xs">Run Fac</TableHead>
                    <TableHead className="font-mono text-xs">Var Fac</TableHead>
                    <TableHead className="font-mono text-xs">
                      <div className="flex items-center gap-1">Prioritize <InfoTip text="When enabled, MPX shifts labor time toward more heavily utilised equipment groups served by this labor group, reducing wait-for-labor time at bottlenecks." /></div>
                    </TableHead>
                    {SHOW_PARAM_VARIABLE_FIELDS_IN_UI && <>
                      <TableHead className="font-mono text-xs">{pn.lab1_name}</TableHead>
                      <TableHead className="font-mono text-xs">{pn.lab2_name}</TableHead>
                      <TableHead className="font-mono text-xs">{pn.lab3_name}</TableHead>
                      <TableHead className="font-mono text-xs">{pn.lab4_name}</TableHead>
                    </>}
                  </>}
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draftLabor.map((l) => {
                  const isConfirming = pendingDeleteId === l.id;
                  return (
                  <TableRow key={l.id} className={isConfirming ? 'bg-destructive/10' : ''}>
                    {isConfirming ? (
                      <TableCell colSpan={showAdvanced ? (SHOW_PARAM_VARIABLE_FIELDS_IN_UI ? 14 : 10) : 5}>
                        <DeleteConfirmInline
                          message={`Delete ${l.name}? This will remove it from any equipment assignments.`}
                          onConfirm={() => confirmDelete(l.id, () => handleDeleteLabor(l.id))}
                          onCancel={cancelDelete}
                        />
                      </TableCell>
                    ) : (<>
                    <TableCell className="font-mono font-medium max-w-[220px]">
                      {collabCell(l.id, 'name', (
                        <DoubleClickEditableName
                          value={l.name}
                          isEditing={editingNameId === l.id}
                          onRequestEdit={() => setEditingNameId(l.id)}
                          onCommit={(t) => tryCommitLaborName(l.id, t)}
                          onCancelEdit={() => setEditingNameId(null)}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      {collabCell(l.id, 'count', <NonNegativeNumericInput className="h-8 w-20 font-mono" value={l.count} onChange={(v) => handleCellChange(l.id, 'count', v)} />)}
                    </TableCell>
                    <TableCell>
                      {collabCell(l.id, 'overtime_pct', <NonNegativeNumericInput className="h-8 w-20 font-mono" value={l.overtime_pct} onChange={(v) => handleCellChange(l.id, 'overtime_pct', v)} />)}
                    </TableCell>
                    <TableCell>
                      {collabCell(l.id, 'unavail_pct', <NonNegativeNumericInput className="h-8 w-20 font-mono" value={l.unavail_pct} onChange={(v) => handleCellChange(l.id, 'unavail_pct', v)} />)}
                    </TableCell>
                    {showAdvanced && <>
                      <TableCell>
                        {collabCell(l.id, 'dept_code', (
                          <DeptCodeSelect modelId={model.id} value={l.dept_code} onChange={(v) => handleCellChange(l.id, 'dept_code', v)} section="labor" className="h-8 w-28" />
                        ))}
                      </TableCell>
                      <TableCell>{collabCell(l.id, 'setup_factor', <NonNegativeNumericInput allowDecimal className="h-8 w-20 font-mono" value={l.setup_factor} onChange={(v) => handleCellChange(l.id, 'setup_factor', v)} />)}</TableCell>
                      <TableCell>{collabCell(l.id, 'run_factor', <NonNegativeNumericInput allowDecimal className="h-8 w-20 font-mono" value={l.run_factor} onChange={(v) => handleCellChange(l.id, 'run_factor', v)} />)}</TableCell>
                      <TableCell>{collabCell(l.id, 'var_factor', <NonNegativeNumericInput allowDecimal className="h-8 w-20 font-mono" value={l.var_factor} onChange={(v) => handleCellChange(l.id, 'var_factor', v)} />)}</TableCell>
                      <TableCell>{collabCell(l.id, 'prioritize_use', <Switch checked={l.prioritize_use} onCheckedChange={(v) => handleCellChange(l.id, 'prioritize_use', v)} />)}</TableCell>
                      {SHOW_PARAM_VARIABLE_FIELDS_IN_UI && <>
                        <TableCell>{collabCell(l.id, 'lab1', <NonNegativeNumericInput className="h-8 w-20 font-mono" value={l.lab1} onChange={(v) => handleCellChange(l.id, 'lab1', v)} />)}</TableCell>
                        <TableCell>{collabCell(l.id, 'lab2', <NonNegativeNumericInput className="h-8 w-20 font-mono" value={l.lab2} onChange={(v) => handleCellChange(l.id, 'lab2', v)} />)}</TableCell>
                        <TableCell>{collabCell(l.id, 'lab3', <NonNegativeNumericInput className="h-8 w-20 font-mono" value={l.lab3} onChange={(v) => handleCellChange(l.id, 'lab3', v)} />)}</TableCell>
                        <TableCell>{collabCell(l.id, 'lab4', <NonNegativeNumericInput className="h-8 w-20 font-mono" value={l.lab4} onChange={(v) => handleCellChange(l.id, 'lab4', v)} />)}</TableCell>
                      </>}
                    </>}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        disabled={!pageEdit.canEditFields}
                        onClick={() => {
                          setEditingNameId((cur) => (cur === l.id ? null : cur));
                          requestDelete(l.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {draftLabor.map((l) => (
            <Card key={l.id} className={activeScenarioId ? 'border-l-[3px] border-l-amber-400' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-mono min-h-8 flex items-center flex-1 min-w-0">
                    {collabCell(l.id, 'name', (
                      <DoubleClickEditableName
                        value={l.name}
                        isEditing={editingNameId === l.id}
                        onRequestEdit={() => setEditingNameId(l.id)}
                        onCommit={(t) => tryCommitLaborName(l.id, t)}
                        onCancelEdit={() => setEditingNameId(null)}
                        spanClassName="text-base"
                        inputClassName="h-9 text-base"
                      />
                    ))}
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" disabled={!pageEdit.canEditFields} onClick={() => { if (confirm(`Delete ${l.name}? This will remove it from any equipment assignments.`)) { setEditingNameId((cur) => (cur === l.id ? null : cur)); handleDeleteLabor(l.id); } }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Count</Label>{collabCell(l.id, 'count', <NonNegativeNumericInput className="h-8 font-mono" value={l.count} onChange={(v) => handleCellChange(l.id, 'count', v)} />)}</div>
                  <div><Label className="text-xs">Overtime %</Label>{collabCell(l.id, 'overtime_pct', <NonNegativeNumericInput className="h-8 font-mono" value={l.overtime_pct} onChange={(v) => handleCellChange(l.id, 'overtime_pct', v)} />)}</div>
                  <div><Label className="text-xs">Unavail %</Label>{collabCell(l.id, 'unavail_pct', <NonNegativeNumericInput className="h-8 font-mono" value={l.unavail_pct} onChange={(v) => handleCellChange(l.id, 'unavail_pct', v)} />)}</div>
                   <div><Label className="text-xs">Dept Code</Label>
                     {collabCell(l.id, 'dept_code', (
                       <DeptCodeSelect modelId={model.id} value={l.dept_code} onChange={(v) => handleCellChange(l.id, 'dept_code', v)} section="labor" className="h-8" />
                     ))}
                   </div>
                </div>
                <div><Label className="text-xs">Comments</Label>{collabCell(l.id, 'comments', <Input className="h-8" value={l.comments} onChange={(e) => handleCellChange(l.id, 'comments', e.target.value)} />)}</div>
                {showAdvanced && (
                  <div className="pt-2 border-t border-border space-y-3">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Advanced Parameters</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div><Label className="text-xs">Setup Factor</Label>{collabCell(l.id, 'setup_factor', <NonNegativeNumericInput allowDecimal className="h-8 font-mono" value={l.setup_factor} onChange={(v) => handleCellChange(l.id, 'setup_factor', v)} />)}<span className="text-[10px] text-muted-foreground">× {l.setup_factor} = {Math.round(l.setup_factor * 100)}%</span></div>
                      <div><Label className="text-xs">Run Factor</Label>{collabCell(l.id, 'run_factor', <NonNegativeNumericInput allowDecimal className="h-8 font-mono" value={l.run_factor} onChange={(v) => handleCellChange(l.id, 'run_factor', v)} />)}<span className="text-[10px] text-muted-foreground">× {l.run_factor} = {Math.round(l.run_factor * 100)}%</span></div>
                      <div>
                        <Label className="text-xs">Variability</Label>
                        {collabCell(l.id, 'var_factor', <NonNegativeNumericInput allowDecimal className="h-8 font-mono" value={l.var_factor} onChange={(v) => handleCellChange(l.id, 'var_factor', v)} />)}
                        <span className="text-[10px] text-muted-foreground">Effective: {model.general.var_labor}% × {l.var_factor} = {(model.general.var_labor * l.var_factor).toFixed(1)}%</span>
                      </div>
                    </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <Label className="text-xs">Group / Dept / Area</Label>
                          <InfoTip text="Optional organisational label. No direct effect on calculations — provided for reference and model documentation." />
                        </div>
                        {collabCell(l.id, 'dept_code', (
                          <DeptCodeSelect modelId={model.id} value={l.dept_code} onChange={(v) => handleCellChange(l.id, 'dept_code', v)} section="labor" className="h-8" />
                        ))}
                      </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Label className="text-xs">Prioritize Use</Label>
                        <InfoTip text="When enabled, MPX shifts labor time toward more heavily utilised equipment groups served by this labor group, reducing wait-for-labor time at bottlenecks." />
                      </div>
                      {collabCell(l.id, 'prioritize_use', <Switch checked={l.prioritize_use} onCheckedChange={(v) => handleCellChange(l.id, 'prioritize_use', v)} />)}
                    </div>
                    {SHOW_PARAM_VARIABLE_FIELDS_IN_UI && (
                    <div className="pt-2 border-t border-border">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">Parameter Variables <InfoTip text="Use Display Name to rename the variable. The new label appears across the app and in the Formula Builder." /></Label>
                      <div className="grid grid-cols-4 gap-3 mt-1.5">
                        {(['lab1', 'lab2', 'lab3', 'lab4'] as const).map((key) => (
                          <div key={key}>
                            <Label className="text-xs">{pn[`${key}_name` as keyof typeof pn]}</Label>
                            {collabCell(l.id, key, <NonNegativeNumericInput className="h-8 font-mono" value={l[key]} onChange={(v) => handleCellChange(l.id, key, v)} />)}
                          </div>
                        ))}
                      </div>
                    </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </PageEditLockedShell>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Labor Group</DialogTitle></DialogHeader>
          <div><Label>Labor Group Name</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., MACHINST" autoFocus /></div>
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
