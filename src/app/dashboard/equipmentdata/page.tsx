"use client";

import { useState } from 'react';
import { useModelStore, displayParamNames, SHOW_PARAM_VARIABLE_FIELDS_IN_UI, type EquipmentGroup } from '@/stores/modelStore';
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';
import { DeleteConfirmInline } from '@/components/DeleteConfirmInline';
import { useScenarioStore } from '@/stores/scenarioStore';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DataTable, DataTableBody, DataTableCell, DataTableHead, DataTableHeader, DataTableRow } from '@/components/ui/DataTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Plus, Trash2, LayoutGrid, List, Cpu, Info, ChevronDown, ChevronUp, FlaskConical } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUserLevelStore, isVisible } from '@/hooks/useUserLevel';
import { NoModelSelected } from '@/components/NoModelSelected';
import { EquipmentCountInput } from '@/components/EquipmentCountInput';
import { applyEquipmentEquipTypeChange } from '@/lib/equipmentEquipType';
import { canEditPureLaborField, PURE_LABOR_TYPE_TOOLTIP } from '@/lib/pureLabor';
import { PureLaborNaField } from '@/components/PureLaborNaField';
import { NonNegativeNumericInput } from '@/components/NonNegativeNumericInput';

function InfoTip({ text }: { text: string }) {
  return (
    <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent className="max-w-[280px] text-xs">{text}</TooltipContent></Tooltip></TooltipProvider>
  );
}



const FIELD_LABELS: Record<string, string> = {
  count: 'Count', equip_type: 'Type', mttf: 'MTTF', mttr: 'MTTR',
  labor_group_id: 'Labor Group', dept_code: 'Dept/Area',
  out_of_area: 'Out of Area', unavail_pct: 'Unavail %',
  setup_factor: 'Setup Factor', run_factor: 'Run Factor', var_factor: 'Var Factor',
  eq1: 'Eq1', eq2: 'Eq2', eq3: 'Eq3', eq4: 'Eq4', comments: 'Comments',
};

export default function EquipmentData() {
  const model = useModelStore((s) => s.getActiveModel());
  const addEquipment = useModelStore((s) => s.addEquipment);
  const updateEquipment = useModelStore((s) => s.updateEquipment);
  const deleteEquipment = useModelStore((s) => s.deleteEquipment);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'form'>('table');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { pendingDeleteId, requestDelete, cancelDelete, confirmDelete } = useDeleteConfirmation();
  const { userLevel } = useUserLevelStore();
  const activeScenarioId = useScenarioStore(s => s.activeScenarioId);
  const activeScenario = useScenarioStore(s => s.scenarios.find(sc => sc.id === s.activeScenarioId));
  const applyScenarioChange = useScenarioStore(s => s.applyScenarioChange);

  if (!model) return <NoModelSelected />;

  const pn = displayParamNames(model);

  const opsTimeUnit = model.general.ops_time_unit || 'MIN';

  const handleAdd = () => {
    if (!newName.trim()) return;
    addEquipment(model.id, {
      id: crypto.randomUUID(), name: newName.trim().toUpperCase(), equip_type: 'standard', count: 1,
      mttf: 1, mttr: 0, overtime_pct: 0, labor_group_id: '', dept_code: '',
      out_of_area: false, unavail_pct: 0,
      setup_factor: 1, run_factor: 1, var_factor: 1,
      eq1: 0, eq2: 0, eq3: 0, eq4: 0, comments: '',
    });
    setNewName('');
    setShowAdd(false);
  };

  const handleCellChange = (id: string, field: keyof EquipmentGroup, value: any) => {
    const eqGuard = model.equipment.find((e) => e.id === id);
    if (eqGuard?.equip_type === 'pure_labor' && !canEditPureLaborField(field)) return;

    if (activeScenarioId && activeScenario) {
      const eq = model.equipment.find(e => e.id === id);
      const entityName = eq?.name || id;
      const fieldLabel = FIELD_LABELS[field] || field;
      applyScenarioChange(activeScenarioId, 'Equipment', id, entityName, field, fieldLabel, value as string | number);
    }
    if (field === 'equip_type') {
      const eq = model.equipment.find((e) => e.id === id);
      if (!eq) return;
      updateEquipment(model.id, id, applyEquipmentEquipTypeChange(eq, value));
    } else {
      updateEquipment(model.id, id, { [field]: value });
    }
  };

  const laborName = (id: string) => model.labor.find((l) => l.id === id)?.name || '—';

  const contentCardClass = activeScenarioId
    ? 'border-0 border-l-[3px] border-l-amber-400 bg-white shadow-sm'
    : 'border-0 bg-white shadow-sm';

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-fade-in bg-[#F9FAFB]">
      {activeScenarioId && activeScenario && (
        <div className="mx-6 mt-4 mb-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 shrink-0">
          <FlaskConical className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="text-sm text-slate-800 font-medium">
            Changes recorded to <span className="font-semibold">{activeScenario.name}</span>
          </span>
        </div>
      )}

      {/* Page header */}
      <div className="px-6 pt-4 pb-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Equipment Groups</h1>
            <p className="text-sm text-slate-600 mt-0.5">{model.equipment.length} groups defined</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="h-8 gap-1 rounded-md border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              Show Advanced
            </Button>
            <div className="flex border border-slate-200 rounded-md overflow-hidden bg-white">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-none ${viewMode === 'table' ? 'bg-slate-200 text-slate-800 hover:bg-slate-200' : 'hover:bg-slate-100'}`}
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-none ${viewMode === 'form' ? 'bg-slate-200 text-slate-800 hover:bg-slate-200' : 'hover:bg-slate-100'}`}
                onClick={() => setViewMode('form')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => setShowAdd(true)}
              size="sm"
              className="h-8 gap-1 rounded-md bg-emerald-600 px-4 text-xs font-medium text-white hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" /> Add Equipment
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs font-medium text-slate-700 border-slate-200 bg-white hover:bg-slate-50"
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main content — same wrapper for empty, table, and cards */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="max-w-5xl">
      {model.equipment.length === 0 ? (
        <div className={`rounded-lg p-16 text-center ${contentCardClass}`}>
          <Cpu className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-700 font-medium mb-1">No equipment groups defined</p>
          <p className="text-sm text-slate-500 mb-4">Add equipment groups to define workstations and machines.</p>
          <Button onClick={() => setShowAdd(true)} className="gap-1 bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add First Equipment</Button>
        </div>
      ) : viewMode === 'table' ? (
        <div className={`rounded-lg overflow-hidden ${contentCardClass}`}>
          <div className="overflow-x-auto">
            <DataTable>
              <DataTableHeader>
              <DataTableRow>
                <DataTableHead className="font-mono text-xs">Name</DataTableHead>
                <DataTableHead className="font-mono text-xs">
                  <div className="flex items-center gap-1">
                    Type <InfoTip text={`Standard: normal equipment with capacity and queue. Delay: use for operations where capacity is not a constraint (e.g. transit, heat treat). Setting to Delay disables No. in Group. ${PURE_LABOR_TYPE_TOOLTIP}`} />
                  </div>
                </DataTableHead>
                <DataTableHead className="font-mono text-xs">Count</DataTableHead>
                <DataTableHead className="font-mono text-xs">MTTF ({opsTimeUnit})</DataTableHead>
                <DataTableHead className="font-mono text-xs">MTTR ({opsTimeUnit})</DataTableHead>
                <DataTableHead className="font-mono text-xs">Labor</DataTableHead>
                <DataTableHead className="font-mono text-xs">Comments</DataTableHead>
                {showAdvanced && <>
                  <DataTableHead className="font-mono text-xs">Dept/Area</DataTableHead>
                  <DataTableHead className="font-mono text-xs">Out of Area</DataTableHead>
                  <DataTableHead className="font-mono text-xs">Unavail %</DataTableHead>
                  <DataTableHead className="font-mono text-xs">Setup Fac</DataTableHead>
                  <DataTableHead className="font-mono text-xs">Run Fac</DataTableHead>
                  <DataTableHead className="font-mono text-xs">Var Fac</DataTableHead>
                  {SHOW_PARAM_VARIABLE_FIELDS_IN_UI && <>
                    <DataTableHead className="font-mono text-xs">{pn.eq1_name}</DataTableHead>
                    <DataTableHead className="font-mono text-xs">{pn.eq2_name}</DataTableHead>
                    <DataTableHead className="font-mono text-xs">{pn.eq3_name}</DataTableHead>
                    <DataTableHead className="font-mono text-xs">{pn.eq4_name}</DataTableHead>
                  </>}
                </>}
                <DataTableHead className="w-12"></DataTableHead>
              </DataTableRow>
              </DataTableHeader>
              <DataTableBody>
                {model.equipment.map((eq) => {
                  const isConfirming = pendingDeleteId === eq.id;
                  const isPure = eq.equip_type === 'pure_labor';
                  return (
                  <DataTableRow key={eq.id} className={isConfirming ? 'bg-red-50' : isPure ? 'bg-slate-50/80' : ''}>
                    {isConfirming ? (
                      <DataTableCell colSpan={showAdvanced ? (SHOW_PARAM_VARIABLE_FIELDS_IN_UI ? 19 : 15) : 9}>
                        <DeleteConfirmInline
                          message={`Delete ${eq.name}? This will remove its operations and labor assignments.`}
                          onConfirm={() => confirmDelete(eq.id, () => deleteEquipment(model.id, eq.id))}
                          onCancel={cancelDelete}
                        />
                      </DataTableCell>
                    ) : (<>
                    <DataTableCell className="font-mono font-medium text-slate-900">{eq.name}</DataTableCell>
                    <DataTableCell>
                      <Select value={eq.equip_type} onValueChange={(v) => handleCellChange(eq.id, 'equip_type', v)}>
                        <SelectTrigger className="h-8 w-24 border-slate-200 bg-white text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="delay">Delay</SelectItem>
                          <SelectItem value="pure_labor">Pure Labor</SelectItem>
                        </SelectContent>
                      </Select>
                    </DataTableCell>
                    <DataTableCell>
                      <EquipmentCountInput
                        equipType={eq.equip_type}
                        count={eq.count}
                        className="h-8 w-16 border-slate-200 bg-white text-center text-sm font-mono"
                        onChange={(v) => handleCellChange(eq.id, 'count', v)}
                      />
                    </DataTableCell>
                    <DataTableCell>
                      {isPure ? <PureLaborNaField className="w-20 border-slate-200 bg-white" /> : (
                      <NonNegativeNumericInput allowDecimal value={eq.mttf} onChange={(v) => handleCellChange(eq.id, 'mttf', v)} />
                      )}
                    </DataTableCell>
                    <DataTableCell>
                      {isPure ? <PureLaborNaField className="w-20 border-slate-200 bg-white" /> : (
                      <NonNegativeNumericInput value={eq.mttr} onChange={(v) => handleCellChange(eq.id, 'mttr', v)} />
                      )}
                    </DataTableCell>
                    <DataTableCell>
                      <Select value={eq.labor_group_id || 'none'} onValueChange={(v) => handleCellChange(eq.id, 'labor_group_id', v === 'none' ? '' : v)}>
                        <SelectTrigger className="h-8 min-w-[7rem] border-slate-200 bg-white text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {model.labor.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </DataTableCell>
                    <DataTableCell>
                      {isPure ? <PureLaborNaField className="min-w-[8rem] border-slate-200 bg-white" /> : (
                      <Input className="h-8 min-w-[8rem] border-slate-200 bg-white text-sm" value={eq.comments} onChange={(e) => handleCellChange(eq.id, 'comments', e.target.value)} placeholder="Notes…" />
                      )}
                    </DataTableCell>
                    {showAdvanced && <>
                      <DataTableCell>{isPure ? <PureLaborNaField className="w-24 border-slate-200 bg-white" /> : <Input className="h-8 w-24 border-slate-200 bg-white text-sm" value={eq.dept_code} onChange={(e) => handleCellChange(eq.id, 'dept_code', e.target.value)} />}</DataTableCell>
                      <DataTableCell>
                        {isPure ? <PureLaborNaField className="w-20 border-slate-200 bg-white" /> : (
                        <Checkbox checked={eq.out_of_area} onCheckedChange={(v) => handleCellChange(eq.id, 'out_of_area', !!v)} />
                        )}
                      </DataTableCell>
                      <DataTableCell>{isPure ? <PureLaborNaField className="w-20 border-slate-200 bg-white" /> : <NonNegativeNumericInput value={eq.unavail_pct} onChange={(v) => handleCellChange(eq.id, 'unavail_pct', v)} />}</DataTableCell>
                      <DataTableCell>{isPure ? <PureLaborNaField className="w-20 border-slate-200 bg-white" /> : <NonNegativeNumericInput allowDecimal value={eq.setup_factor} onChange={(v) => handleCellChange(eq.id, 'setup_factor', v)} />}</DataTableCell>
                      <DataTableCell>{isPure ? <PureLaborNaField className="w-20 border-slate-200 bg-white" /> : <NonNegativeNumericInput allowDecimal value={eq.run_factor} onChange={(v) => handleCellChange(eq.id, 'run_factor', v)} />}</DataTableCell>
                      <DataTableCell>{isPure ? <PureLaborNaField className="w-20 border-slate-200 bg-white" /> : <NonNegativeNumericInput allowDecimal value={eq.var_factor} onChange={(v) => handleCellChange(eq.id, 'var_factor', v)} />}</DataTableCell>
                      {SHOW_PARAM_VARIABLE_FIELDS_IN_UI && <>
                        <DataTableCell>{isPure ? <PureLaborNaField className="w-20 border-slate-200 bg-white" /> : <NonNegativeNumericInput value={eq.eq1} onChange={(v) => handleCellChange(eq.id, 'eq1', v)} />}</DataTableCell>
                        <DataTableCell>{isPure ? <PureLaborNaField className="w-20 border-slate-200 bg-white" /> : <NonNegativeNumericInput value={eq.eq2} onChange={(v) => handleCellChange(eq.id, 'eq2', v)} />}</DataTableCell>
                        <DataTableCell>{isPure ? <PureLaborNaField className="w-20 border-slate-200 bg-white" /> : <NonNegativeNumericInput value={eq.eq3} onChange={(v) => handleCellChange(eq.id, 'eq3', v)} />}</DataTableCell>
                        <DataTableCell>{isPure ? <PureLaborNaField className="w-20 border-slate-200 bg-white" /> : <NonNegativeNumericInput value={eq.eq4} onChange={(v) => handleCellChange(eq.id, 'eq4', v)} />}</DataTableCell>
                      </>}
                    </>}
                    <DataTableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => requestDelete(eq.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DataTableCell>
                    </>)}
                  </DataTableRow>
                  );
                })}
              </DataTableBody>
            </DataTable>
          </div>
        </div>
      ) : (
        <div className={`rounded-lg overflow-hidden ${contentCardClass}`}>
          <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {model.equipment.map((eq) => (
            <Card key={eq.id} className="border-0 bg-slate-50/50 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-mono">{eq.name}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (confirm(`Delete ${eq.name}? This will remove its operations and labor assignments.`)) deleteEquipment(model.id, eq.id); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-xs">Count</Label><EquipmentCountInput equipType={eq.equip_type} count={eq.count} className="h-8 font-mono" onChange={(v) => handleCellChange(eq.id, 'count', v)} /></div>
                  <div>
                    <Label className="text-xs">MTTF ({opsTimeUnit})</Label>
                    <NonNegativeNumericInput allowDecimal value={eq.mttf} onChange={(v) => handleCellChange(eq.id, 'mttf', v)} />
                    {eq.mttf < 1 && <p className="text-[11px] text-destructive mt-1">Must be at least 1</p>}
                  </div>
                  <div><Label className="text-xs">MTTR ({opsTimeUnit})</Label><NonNegativeNumericInput value={eq.mttr} onChange={(v) => handleCellChange(eq.id, 'mttr', v)} /></div>
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
                  <Textarea rows={3} className="text-sm" value={eq.comments} onChange={(e) => handleCellChange(eq.id, 'comments', e.target.value)} placeholder="Add notes about this equipment group…" />
                </div>
                {showAdvanced && (
                  <>
                    <div className="pt-2 border-t border-border space-y-3">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Advanced Parameters</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center gap-1">
                            <Label className="text-xs">Equipment Type</Label>
                            <InfoTip text="Standard: normal equipment with capacity and queue. Delay: use for operations where capacity is not a constraint (e.g. transit, heat treat). Setting to Delay disables No. in Group." />
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
                        <div><Label className="text-xs">% Time Unavailable</Label><NonNegativeNumericInput value={eq.unavail_pct} onChange={(v) => handleCellChange(eq.id, 'unavail_pct', v)} /></div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Scaling Factors</Label>
                      <div className="grid grid-cols-3 gap-3 mt-1.5">
                        <div><Label className="text-xs">Setup</Label><NonNegativeNumericInput allowDecimal value={eq.setup_factor} onChange={(v) => handleCellChange(eq.id, 'setup_factor', v)} /><span className="text-[10px] text-muted-foreground">× {eq.setup_factor} = {Math.round(eq.setup_factor * 100)}%</span></div>
                        <div><Label className="text-xs">Run</Label><NonNegativeNumericInput allowDecimal value={eq.run_factor} onChange={(v) => handleCellChange(eq.id, 'run_factor', v)} /><span className="text-[10px] text-muted-foreground">× {eq.run_factor} = {Math.round(eq.run_factor * 100)}%</span></div>
                        <div>
                          <Label className="text-xs">Variability</Label>
                          <NonNegativeNumericInput allowDecimal value={eq.var_factor} onChange={(v) => handleCellChange(eq.id, 'var_factor', v)} />
                          <span className="text-[10px] text-muted-foreground">Effective: {model.general.var_equip}% × {eq.var_factor} = {(model.general.var_equip * eq.var_factor).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border space-y-3">
                      <div>
                        <Label className="text-xs">Group / Dept / Area</Label>
                        <Input className="h-8" value={eq.dept_code} placeholder="e.g. Cell 1" onChange={(e) => handleCellChange(eq.id, 'dept_code', e.target.value)} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`ooa-${eq.id}`}
                          checked={eq.out_of_area}
                          onCheckedChange={(v) => handleCellChange(eq.id, 'out_of_area', !!v)}
                        />
                        <Label htmlFor={`ooa-${eq.id}`} className="text-xs cursor-pointer">Out of Area equipment</Label>
                        <InfoTip text="When checked, this equipment is treated as out-of-area for MCT chart colour coding." />
                      </div>
                    </div>
                    {SHOW_PARAM_VARIABLE_FIELDS_IN_UI && (
                    <div className="pt-2 border-t border-border">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">Parameter Variables <InfoTip text="Use Display Name to rename the variable. The new label appears across the app and in the Formula Builder." /></Label>
                      <div className="grid grid-cols-4 gap-3 mt-1.5">
                        {(['eq1', 'eq2', 'eq3', 'eq4'] as const).map((key, i) => (
                          <div key={key}>
                            <Label className="text-xs">{pn[`${key}_name` as keyof typeof pn]}</Label>
                            <NonNegativeNumericInput value={eq[key]} onChange={(v) => handleCellChange(eq.id, key, v)} />
                          </div>
                        ))}
                      </div>
                    </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
          </div>
        </div>
      )}
        </div>
      </div>

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
  );
}