import { useState, useLayoutEffect, useRef } from 'react';
import { useModelStore, displayParamNames, SHOW_PARAM_VARIABLE_FIELDS_IN_UI, type EquipmentGroup, type Model } from '@/stores/modelStore';
import { db, fetchModelById } from '@/lib/supabaseData';
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';
import { DeleteConfirmInline } from '@/components/DeleteConfirmInline';
import { useScenarioStore } from '@/stores/scenarioStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Plus, Trash2, LayoutGrid, List, Cpu, Info, ChevronDown, ChevronUp, FlaskConical, Save, Check } from 'lucide-react';
import { toast } from 'sonner';
import { UnsavedChangesGuard } from '@/components/UnsavedChangesGuard';
import { SavingOverlay } from '@/components/SavingOverlay';
import { DoubleClickEditableName } from '@/components/DoubleClickEditableName';
import { DeptCodeSelect } from '@/components/DeptCodeSelect';
import { EquipmentCountInput } from '@/components/EquipmentCountInput';
import { applyEquipmentEquipTypeChange } from '@/lib/equipmentEquipType';
import {
  canEditPureLaborField,
  equipmentToApiPayload,
  PURE_LABOR_MTTF,
  PURE_LABOR_MTTR,
  PURE_LABOR_TYPE_TOOLTIP,
} from '@/lib/pureLabor';
import { PureLaborNaField } from '@/components/PureLaborNaField';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NonNegativeNumericInput } from '@/components/NonNegativeNumericInput';

const FIELD_LABELS: Record<string, string> = {
  name: 'Name', count: 'Count', equip_type: 'Type', mttf: 'MTTF', mttr: 'MTTR',
  labor_group_id: 'Labor Group', dept_code: 'Dept/Area',
  out_of_area: 'Out of Area', overtime_pct: 'Overtime %',
  setup_factor: 'Setup Factor', run_factor: 'Run Factor', var_factor: 'Var Factor',
  eq1: 'Eq1', eq2: 'Eq2', eq3: 'Eq3', eq4: 'Eq4', comments: 'Comments',
};

const EQUIP_PATCH_KEYS: (keyof EquipmentGroup)[] = [
  'name', 'equip_type', 'count', 'mttf', 'mttr', 'overtime_pct', 'labor_group_id', 'dept_code',
  'out_of_area', 'setup_factor', 'run_factor', 'var_factor',
  'eq1', 'eq2', 'eq3', 'eq4', 'comments',
];

function cloneEquipmentFromModel(model: Model): EquipmentGroup[] {
  return (model.equipment ?? []).map((e) => ({ ...e }));
}

function buildEquipmentPatch(
  prev: EquipmentGroup,
  next: EquipmentGroup,
  labor: Model['labor'],
): Partial<EquipmentGroup> | null {
  const apiPrev = equipmentToApiPayload(prev, labor);
  const apiNext = equipmentToApiPayload(next, labor);
  const patch: Partial<EquipmentGroup> = {};
  for (const k of EQUIP_PATCH_KEYS) {
    if (k === 'equip_type') {
      if (prev.equip_type !== next.equip_type) patch.equip_type = next.equip_type;
      continue;
    }
    if (apiPrev[k] !== apiNext[k]) (patch as Record<string, unknown>)[k] = next[k];
  }
  if (next.equip_type === 'pure_labor' && prev.equip_type !== 'pure_labor') {
    patch.mttf = PURE_LABOR_MTTF;
    patch.mttr = PURE_LABOR_MTTR;
  }
  return Object.keys(patch).length > 0 ? patch : null;
}

async function persistEquipmentDraft(modelId: string, draft: EquipmentGroup[], baseline: Model): Promise<void> {
  const server = baseline.equipment ?? [];
  const serverById = new Map(server.map((e) => [e.id, e]));
  const draftIds = new Set(draft.map((e) => e.id));

  for (const e of draft) {
    if (!serverById.has(e.id)) await db.insertEquipment(modelId, e, baseline.labor);
  }
  for (const e of draft) {
    const prev = serverById.get(e.id);
    if (!prev) continue;
    const patch = buildEquipmentPatch(prev, e, baseline.labor);
    if (patch) await db.updateEquipment(modelId, e.id, patch);
  }
  for (const s of server) {
    if (!draftIds.has(s.id)) await db.deleteEquipment(modelId, s.id);
  }
  await db.updateModel(modelId, { run_status: 'needs_recalc' });
}

function InfoTip({ text }: { text: string }) {
  return (
    <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent className="max-w-[280px] text-xs">{text}</TooltipContent></Tooltip></TooltipProvider>
  );
}

export default function EquipmentData() {
  const model = useModelStore((s) => s.getActiveModel());
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'form'>('table');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftEquipment, setDraftEquipment] = useState<EquipmentGroup[]>([]);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const lastModelIdRef = useRef<string | null>(null);
  const { pendingDeleteId, requestDelete, cancelDelete, confirmDelete } = useDeleteConfirmation();
  const activeScenarioId = useScenarioStore(s => s.activeScenarioId);
  const activeScenario = useScenarioStore(s => s.scenarios.find(sc => sc.id === s.activeScenarioId));
  const applyScenarioChange = useScenarioStore(s => s.applyScenarioChange);

  useLayoutEffect(() => {
    if (!model) return;
    if (lastModelIdRef.current !== model.id) {
      lastModelIdRef.current = model.id;
      setDraftEquipment(cloneEquipmentFromModel(model));
      setIsDirty(false);
      setEditingNameId(null);
      return;
    }
    if (isDirty) return;
    setDraftEquipment(cloneEquipmentFromModel(model));
  }, [model, isDirty, model?.updated_at, model?.equipment]);

  const handleDiscardDraft = () => {
    if (!model) return;
    setDraftEquipment(cloneEquipmentFromModel(model));
    setIsDirty(false);
    setJustSaved(false);
    setEditingNameId(null);
  };

  const tryCommitEquipmentName = (id: string, raw: string): boolean => {
    const next = raw.toUpperCase();
    const row = draftEquipment.find((o) => o.id === id);
    if (row?.name === next) return true;
    if (draftEquipment.some((o) => o.id !== id && o.name.toLowerCase() === next.toLowerCase())) {
      toast.error('Another equipment group already uses this name');
      return false;
    }
    handleCellChange(id, 'name', next);
    return true;
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    setDraftEquipment((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(), name: newName.trim().toUpperCase(), equip_type: 'standard', count: 1,
        mttf: 1, mttr: 0, overtime_pct: 0, labor_group_id: '', dept_code: '',
        out_of_area: false, unavail_pct: 0,
        setup_factor: 1, run_factor: 1, var_factor: 1,
        eq1: 0, eq2: 0, eq3: 0, eq4: 0, comments: '',
      },
    ]);
    setNewName('');
    setShowAdd(false);
    setIsDirty(true);
    setJustSaved(false);
  };

  const applyEquipmentFieldUpdate = (current: EquipmentGroup, field: keyof EquipmentGroup, value: unknown): Partial<EquipmentGroup> => {
    if (field === 'equip_type') {
      return applyEquipmentEquipTypeChange(current, value as EquipmentGroup['equip_type']);
    }
    if (field === 'dept_code') {
      const isOutOfArea = typeof value === 'string' && value.toLowerCase() === 'out of area';
      return { [field]: value, out_of_area: isOutOfArea } as Partial<EquipmentGroup>;
    }
    return { [field]: value } as Partial<EquipmentGroup>;
  };

  const handleCellChange = (id: string, field: keyof EquipmentGroup, value: unknown) => {
    const eq = draftEquipment.find((e) => e.id === id);
    if (!eq) return;
    if (eq.equip_type === 'pure_labor' && !canEditPureLaborField(field)) return;
    if (model && activeScenarioId && activeScenario) {
      const entityName = eq.name || id;
      const fieldLabel = FIELD_LABELS[field] || field;
      applyScenarioChange(activeScenarioId, 'Equipment', id, entityName, field, fieldLabel, value as string | number);
    }
    const partial = applyEquipmentFieldUpdate(eq, field, value);
    setDraftEquipment((prev) => prev.map((e) => (e.id === id ? { ...e, ...partial } : e)));
    setIsDirty(true);
    setJustSaved(false);
  };

  const handleDeleteEquipment = (id: string) => {
    setEditingNameId((cur) => (cur === id ? null : cur));
    setDraftEquipment((prev) => prev.filter((e) => e.id !== id));
    setIsDirty(true);
    setJustSaved(false);
  };

  const handleSave = async () => {
    if (!model || saving || !isDirty) return;
    setSaving(true);
    try {
      await persistEquipmentDraft(model.id, draftEquipment, model);
      const fresh = await fetchModelById(model.id);
      if (!fresh) throw new Error('Could not reload model after save');
      useModelStore.setState((s) => ({
        models: s.models.map((m) => (m.id === fresh.id ? fresh : m)),
      }));
      setIsDirty(false);
      setJustSaved(true);
      toast.success('Saved');
      setTimeout(() => setJustSaved(false), 2000);
    } catch (err) {
      console.error(err);
      toast.error('Save failed — please try again');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  if (!model) return (
    <div className="p-6 space-y-4">
      <div className="h-7 w-48 bg-muted animate-pulse rounded" />
      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      <div className="h-64 bg-muted animate-pulse rounded-lg" />
    </div>
  );

  const opsTimeUnit = model.general.ops_time_unit || 'MIN';
  const pn = displayParamNames(model);

  return (
    <>
    <UnsavedChangesGuard isDirty={isDirty} onSave={handleSave} onDiscard={handleDiscardDraft} />
    {saving && <SavingOverlay />}
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
          <h1 className="text-xl font-bold">Equipment Groups</h1>
          <p className="text-sm text-muted-foreground">{draftEquipment.length} groups defined</p>
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
          <Button onClick={() => setShowAdd(true)} size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add Equipment</Button>
          <Button size="sm" className="gap-1" variant={isDirty ? 'default' : 'outline'} disabled={saving || (!isDirty && !justSaved)} onClick={() => void handleSave()}>
            {justSaved ? <><Check className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save</>}
          </Button>
        </div>
      </div>

      {draftEquipment.length === 0 ? (
        <Card><CardContent className="py-16 text-center flex flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-primary p-5">
            <Cpu className="h-10 w-10 mx-auto text-foreground" />
            </div>
        <p className="text-foreground font-medium mb-1">No equipment groups defined</p><p className="text-sm text-muted-foreground/70 mb-4">Add equipment groups to define workstations and machines.</p>
        <Button onClick={() => setShowAdd(true)} className="gap-1"><Plus className="h-4 w-4" /> Add First Equipment</Button></CardContent></Card>
      ) : viewMode === 'table' ? (
        <Card className={activeScenarioId ? 'border-l-[3px] border-l-amber-400' : ''}>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono text-xs">Name</TableHead>
                  <TableHead className="font-mono text-xs">
                    <div className="flex items-center gap-1">Type <InfoTip text={`Standard: normal equipment with capacity and queue. Delay: use for operations where capacity is not a constraint (e.g. transit, heat treat). Setting to Delay disables No. in Group. ${PURE_LABOR_TYPE_TOOLTIP}`} /></div>
                  </TableHead>
                  <TableHead className="font-mono text-xs">Count</TableHead>
                  <TableHead className="font-mono text-xs">MTTF ({opsTimeUnit})</TableHead>
                  <TableHead className="font-mono text-xs">MTTR ({opsTimeUnit})</TableHead>
                  <TableHead className="font-mono text-xs">Overtime %</TableHead>
                   <TableHead className="font-mono text-xs">Labor</TableHead>
                   <TableHead className="font-mono text-xs">Comments</TableHead>
                  {showAdvanced && <>
                     <TableHead className="font-mono text-xs">Dept/Area</TableHead>
                    <TableHead className="font-mono text-xs">Setup Fac</TableHead>
                    <TableHead className="font-mono text-xs">Run Fac</TableHead>
                    <TableHead className="font-mono text-xs">Var Fac</TableHead>
                    {SHOW_PARAM_VARIABLE_FIELDS_IN_UI && <>
                      <TableHead className="font-mono text-xs">{pn.eq1_name}</TableHead>
                      <TableHead className="font-mono text-xs">{pn.eq2_name}</TableHead>
                      <TableHead className="font-mono text-xs">{pn.eq3_name}</TableHead>
                      <TableHead className="font-mono text-xs">{pn.eq4_name}</TableHead>
                    </>}
                  </>}
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draftEquipment.map((eq) => {
                  const isConfirming = pendingDeleteId === eq.id;
                  const isPure = eq.equip_type === 'pure_labor';
                  return (
                  <TableRow key={eq.id} className={isConfirming ? 'bg-destructive/10' : isPure ? 'bg-slate-50/80' : ''}>
                    {isConfirming ? (
                      <TableCell colSpan={showAdvanced ? (SHOW_PARAM_VARIABLE_FIELDS_IN_UI ? 17 : 13) : 9}>
                        <DeleteConfirmInline
                          message={`Delete ${eq.name}? This will remove its operations and labor assignments.`}
                          onConfirm={() => confirmDelete(eq.id, () => handleDeleteEquipment(eq.id))}
                          onCancel={cancelDelete}
                        />
                      </TableCell>
                    ) : (<>
                    <TableCell className="font-mono font-medium max-w-[220px]">
                      <DoubleClickEditableName
                        value={eq.name}
                        isEditing={editingNameId === eq.id}
                        onRequestEdit={() => setEditingNameId(eq.id)}
                        onCommit={(t) => tryCommitEquipmentName(eq.id, t)}
                        onCancelEdit={() => setEditingNameId(null)}
                      />
                    </TableCell>
                    <TableCell>
                      <Select value={eq.equip_type} onValueChange={(v) => handleCellChange(eq.id, 'equip_type', v)}>
                        <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="delay">Delay</SelectItem>
                          <SelectItem value="pure_labor">Pure Labor</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {isPure ? (
                        <NonNegativeNumericInput className="h-8 w-16 font-mono" value={eq.count} onChange={(v) => handleCellChange(eq.id, 'count', v)} />
                      ) : (
                        <EquipmentCountInput equipType={eq.equip_type} count={eq.count} className="h-8 w-16 font-mono" onChange={(v) => handleCellChange(eq.id, 'count', v)} />
                      )}
                    </TableCell>
                    <TableCell>
                      {isPure ? <PureLaborNaField className="w-20" /> : (
                      <NonNegativeNumericInput className="h-8 w-20 font-mono" value={eq.mttf} onChange={(v) => handleCellChange(eq.id, 'mttf', v)} />
                      )}
                    </TableCell>
                    <TableCell>
                      {isPure ? <PureLaborNaField className="w-20" /> : (
                      <NonNegativeNumericInput className="h-8 w-20 font-mono" value={eq.mttr} onChange={(v) => handleCellChange(eq.id, 'mttr', v)} />
                      )}
                    </TableCell>
                    <TableCell>
                      {isPure ? <PureLaborNaField className="w-20" /> : (
                      <NonNegativeNumericInput className="h-8 w-20 font-mono" value={eq.overtime_pct} onChange={(v) => handleCellChange(eq.id, 'overtime_pct', v)} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Select value={eq.labor_group_id || 'none'} onValueChange={(v) => handleCellChange(eq.id, 'labor_group_id', v === 'none' ? '' : v)}>
                        <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {model.labor.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {isPure ? <PureLaborNaField className="min-w-[8rem]" /> : (
                      <Input className="h-8 w-32" value={eq.comments} onChange={(e) => handleCellChange(eq.id, 'comments', e.target.value)} placeholder="Notes…" />
                      )}
                    </TableCell>
                    {showAdvanced && <>
                      <TableCell>
                        {isPure ? <PureLaborNaField className="w-28" /> : (
                        <DeptCodeSelect modelId={model.id} value={eq.dept_code} onChange={(v) => handleCellChange(eq.id, 'dept_code', v)} section="equipment" className="h-8 w-28" />
                        )}
                      </TableCell>
                      <TableCell>
                        {isPure ? <PureLaborNaField className="w-20" /> : (
                        <NonNegativeNumericInput allowDecimal className="h-8 w-20 font-mono" value={eq.setup_factor} onChange={(v) => handleCellChange(eq.id, 'setup_factor', v)} />
                        )}
                      </TableCell>
                      <TableCell>
                        {isPure ? <PureLaborNaField className="w-20" /> : (
                        <NonNegativeNumericInput allowDecimal className="h-8 w-20 font-mono" value={eq.run_factor} onChange={(v) => handleCellChange(eq.id, 'run_factor', v)} />
                        )}
                      </TableCell>
                      <TableCell>
                        {isPure ? <PureLaborNaField className="w-20" /> : (
                        <NonNegativeNumericInput allowDecimal className="h-8 w-20 font-mono" value={eq.var_factor} onChange={(v) => handleCellChange(eq.id, 'var_factor', v)} />
                        )}
                      </TableCell>
                      {SHOW_PARAM_VARIABLE_FIELDS_IN_UI && <>
                        <TableCell>{isPure ? <PureLaborNaField className="w-20" /> : <NonNegativeNumericInput className="h-8 w-20 font-mono" value={eq.eq1} onChange={(v) => handleCellChange(eq.id, 'eq1', v)} />}</TableCell>
                        <TableCell>{isPure ? <PureLaborNaField className="w-20" /> : <NonNegativeNumericInput className="h-8 w-20 font-mono" value={eq.eq2} onChange={(v) => handleCellChange(eq.id, 'eq2', v)} />}</TableCell>
                        <TableCell>{isPure ? <PureLaborNaField className="w-20" /> : <NonNegativeNumericInput className="h-8 w-20 font-mono" value={eq.eq3} onChange={(v) => handleCellChange(eq.id, 'eq3', v)} />}</TableCell>
                        <TableCell>{isPure ? <PureLaborNaField className="w-20" /> : <NonNegativeNumericInput className="h-8 w-20 font-mono" value={eq.eq4} onChange={(v) => handleCellChange(eq.id, 'eq4', v)} />}</TableCell>
                      </>}
                    </>}
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setEditingNameId((cur) => (cur === eq.id ? null : cur)); requestDelete(eq.id); }}><Trash2 className="h-4 w-4" /></Button>
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
          {draftEquipment.map((eq) => {
            const isPureForm = eq.equip_type === 'pure_labor';
            return (
            <Card key={eq.id} className={`${activeScenarioId ? 'border-l-[3px] border-l-amber-400' : ''} ${isPureForm ? 'bg-slate-50/80' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-mono min-h-8 flex items-center flex-1 min-w-0">
                    <DoubleClickEditableName
                      value={eq.name}
                      isEditing={editingNameId === eq.id}
                      onRequestEdit={() => setEditingNameId(eq.id)}
                      onCommit={(t) => tryCommitEquipmentName(eq.id, t)}
                      onCancelEdit={() => setEditingNameId(null)}
                      spanClassName="text-base"
                      inputClassName="h-9 text-base"
                    />
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => { if (confirm(`Delete ${eq.name}? This will remove its operations and labor assignments.`)) { setEditingNameId((cur) => (cur === eq.id ? null : cur)); handleDeleteEquipment(eq.id); } }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <fieldset className="border-0 p-0 m-0 min-w-0">
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div><Label className="text-xs">Count</Label><EquipmentCountInput equipType={eq.equip_type} count={eq.count} className="h-8 font-mono" onChange={(v) => handleCellChange(eq.id, 'count', v)} /></div>
                  <div>
                    <Label className="text-xs">MTTF ({opsTimeUnit})</Label>
                    {isPureForm ? <PureLaborNaField className="h-8" /> : (
                    <>
                    <NonNegativeNumericInput allowDecimal value={eq.mttf} onChange={(v) => handleCellChange(eq.id, 'mttf', v)} />
                    {eq.mttf < 1 && <p className="text-[11px] text-destructive mt-1">Must be at least 1</p>}
                    </>
                    )}
                  </div>
                  <div><Label className="text-xs">MTTR ({opsTimeUnit})</Label>{isPureForm ? <PureLaborNaField className="h-8" /> : <NonNegativeNumericInput value={eq.mttr} onChange={(v) => handleCellChange(eq.id, 'mttr', v)} />}</div>
                  <div><Label className="text-xs">Overtime %</Label>{isPureForm ? <PureLaborNaField className="h-8" /> : <NonNegativeNumericInput value={eq.overtime_pct} onChange={(v) => handleCellChange(eq.id, 'overtime_pct', v)} />}</div>
                </div>
                <div>
                    <Label className="text-xs">Labor Group</Label>
                    <Select value={eq.labor_group_id || 'none'} onValueChange={(v) => handleCellChange(eq.id, 'labor_group_id', v === 'none' ? '' : v)}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {model.labor.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                </div>
                <div>
                  <Label className="text-xs">Comments</Label>
                  {isPureForm ? <PureLaborNaField className="h-8" /> : (
                  <Textarea rows={3} className="text-sm" value={eq.comments} onChange={(e) => handleCellChange(eq.id, 'comments', e.target.value)} placeholder="Add notes about this equipment group…" />
                  )}
                </div>
                {showAdvanced && (
                  <>
                    <div className="pt-2 border-t border-border space-y-3">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Advanced Parameters</Label>
                      <div>
                        <div className="flex items-center gap-1">
                          <Label className="text-xs">Equipment Type</Label>
                          <InfoTip text={`Standard: normal equipment with capacity and queue. Delay: use for operations where capacity is not a constraint (e.g. transit, heat treat). Setting to Delay disables No. in Group. ${PURE_LABOR_TYPE_TOOLTIP}`} />
                        </div>
                        <Select value={eq.equip_type} onValueChange={(v) => handleCellChange(eq.id, 'equip_type', v)}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="delay">Delay Station</SelectItem>
                            <SelectItem value="pure_labor">Pure Labor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Scaling Factors</Label>
                      <div className="grid grid-cols-3 gap-3 mt-1.5">
                        <div><Label className="text-xs">Setup</Label>{isPureForm ? <PureLaborNaField className="h-8" /> : (<><NonNegativeNumericInput allowDecimal value={eq.setup_factor} onChange={(v) => handleCellChange(eq.id, 'setup_factor', v)} /><span className="text-[10px] text-muted-foreground">× {eq.setup_factor} = {Math.round(eq.setup_factor * 100)}%</span></>)}</div>
                        <div><Label className="text-xs">Run</Label>{isPureForm ? <PureLaborNaField className="h-8" /> : (<><NonNegativeNumericInput allowDecimal value={eq.run_factor} onChange={(v) => handleCellChange(eq.id, 'run_factor', v)} /><span className="text-[10px] text-muted-foreground">× {eq.run_factor} = {Math.round(eq.run_factor * 100)}%</span></>)}</div>
                        <div>
                          <Label className="text-xs">Variability</Label>
                          {isPureForm ? <PureLaborNaField className="h-8" /> : (
                          <>
                          <NonNegativeNumericInput allowDecimal className="h-8 w-20 font-mono" value={eq.var_factor} onChange={(v) => handleCellChange(eq.id, 'var_factor', v)} />
                          <span className="text-[10px] text-muted-foreground">Effective: {model.general.var_equip}% × {eq.var_factor} = {(model.general.var_equip * eq.var_factor).toFixed(1)}%</span>
                          </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border space-y-3">
                      <div>
                        <Label className="text-xs">Group / Dept / Area</Label>
                        {isPureForm ? <PureLaborNaField className="h-8" /> : (
                        <DeptCodeSelect modelId={model.id} value={eq.dept_code} onChange={(v) => handleCellChange(eq.id, 'dept_code', v)} section="equipment" className="h-8" />
                        )}
                      </div>
                    </div>
                    {SHOW_PARAM_VARIABLE_FIELDS_IN_UI && (
                    <div className="pt-2 border-t border-border">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">Parameter Variables <InfoTip text="Use Display Name to rename the variable. The new label appears across the app and in the Formula Builder." /></Label>
                      <div className="grid grid-cols-4 gap-3 mt-1.5">
                        {(['eq1', 'eq2', 'eq3', 'eq4'] as const).map((key) => (
                          <div key={key}>
                            <Label className="text-xs">{pn[`${key}_name` as keyof typeof pn]}</Label>
                            {isPureForm ? <PureLaborNaField className="h-8" /> : <NonNegativeNumericInput value={eq[key]} onChange={(v) => handleCellChange(eq.id, key, v)} />}
                          </div>
                        ))}
                      </div>
                    </div>
                    )}
                  </>
                )}
              </CardContent>
              </fieldset>
            </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Equipment Group</DialogTitle></DialogHeader>
          <div><Label>Equipment Group Name</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., VT_LATHE" autoFocus /></div>
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