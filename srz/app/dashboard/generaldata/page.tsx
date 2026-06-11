"use client";

import { useState } from 'react';
import { useModelStore, displayParamNames } from '@/stores/modelStore';
import { useScenarioStore } from '@/stores/scenarioStore';
import { saveFullModelToDB } from '@/lib/supabaseData';
import { Input } from '../../../components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, FlaskConical, Loader2 } from 'lucide-react';
import { NoModelSelected } from '@/components/NoModelSelected';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';
import { NonNegativeNumericInput } from '@/components/NonNegativeNumericInput';
import {
  MCT_TIME_UNIT_OPTIONS,
  OPS_TIME_UNIT_OPTIONS,
  PROD_PERIOD_UNIT_OPTIONS,
  UNIT_LABELS,
  UNIT_SINGULAR,
} from '@/lib/timeUnits';

const FIELD_LABELS: Record<string, string> = {
  model_title: 'Model Title', ops_time_unit: 'Ops Time Unit', mct_time_unit: 'MCT Time Unit',
  prod_period_unit: 'Prod Period', conv1: 'MCT Conversion', conv2: 'Prod Conversion',
  util_limit: 'Util Limit', var_equip: 'Equipment Variability', var_labor: 'Labor Variability',
  var_prod: 'Product Variability', gen1: 'Gen1', gen2: 'Gen2', gen3: 'Gen3', gen4: 'Gen4',
  author: 'Author', comments: 'Comments',
};

function InfoTip({ text }: { text: string }) {
  return (
    <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground inline-block ml-1 cursor-help" /></TooltipTrigger><TooltipContent className="max-w-[280px] text-xs">{text}</TooltipContent></Tooltip></TooltipProvider>
  );
}

export default function GeneralData() {
  const model = useModelStore((s) => s.getActiveModel());
  const updateGeneral = useModelStore((s) => s.updateGeneral);
  const [saving, setSaving] = useState(false);
  const activeScenarioId = useScenarioStore(s => s.activeScenarioId);
  const activeScenario = useScenarioStore(s => s.scenarios.find(sc => sc.id === s.activeScenarioId));
  const applyScenarioChange = useScenarioStore(s => s.applyScenarioChange);

  if (!model) return <NoModelSelected />;

  const g = model.general;
  const pn = displayParamNames(model);
  const update = (data: Partial<typeof g>) => {
    if (activeScenarioId && activeScenario) {
      Object.entries(data).forEach(([field, value]) => {
        const fieldLabel = FIELD_LABELS[field] || field;
        applyScenarioChange(activeScenarioId, 'General', model.id, 'General', field, fieldLabel, value as string | number);
      });
    }
    updateGeneral(model.id, data);
  };

  const handleSave = async () => {
    if (!model) return;
    setSaving(true);
    try {
      await saveFullModelToDB(model);
      toast.success('Model general data saved');
    } catch (e) {
      console.error('Save general data error:', e);
      toast.error('Failed to save model general data');
    } finally {
      setSaving(false);
    }
  };

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
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">General Data</h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Configure time settings, variability parameters, and model metadata.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="h-8 rounded-md border-slate-200 bg-slate-50 px-4 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            {saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving</> : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="max-w-4xl">
          <Tabs defaultValue="time">
            <TabsList className="bg-slate-100 rounded-md h-9 px-1 mb-4">
              <TabsTrigger value="time" className="px-3 text-xs">
                Time Settings
              </TabsTrigger>
              <TabsTrigger value="advanced" className="px-3 text-xs">
                Advanced Parameters
              </TabsTrigger>
              <TabsTrigger value="comments" className="px-3 text-xs">
                Comments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="time" className="mt-0 space-y-4">
          <Card className={activeScenarioId ? 'border-0 border-l-[3px] border-l-amber-400 bg-white shadow-sm' : 'border-0 bg-white shadow-sm'}>
            <CardHeader>
              <CardTitle className="text-base">Time Settings</CardTitle>
              <CardDescription>Define time units and conversion factors for this model.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Model Title</Label>
                <Input value={g.model_title} onChange={(e) => update({ model_title: e.target.value })} placeholder="Report display name" />
              </div>

              {/* Group 1 — Time Units */}
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Time Units</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Operations Time Unit</Label>
                    <Select value={g.ops_time_unit} onValueChange={(v) => update({ ops_time_unit: v as typeof g.ops_time_unit })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {OPS_TIME_UNIT_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">MCT Time Unit</Label>
                    <Select value={g.mct_time_unit} onValueChange={(v) => update({ mct_time_unit: v as typeof g.mct_time_unit })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MCT_TIME_UNIT_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Production Period</Label>
                    <Select value={g.prod_period_unit} onValueChange={(v) => update({ prod_period_unit: v as typeof g.prod_period_unit })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PROD_PERIOD_UNIT_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Group 2 — Factory Calendar */}
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Factory Calendar</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-[13px] font-medium">
                      MCT Conversion{' '}
                      <span className="text-muted-foreground font-normal">({g.ops_time_unit} per {g.mct_time_unit})</span>
                    </Label>
                    <NonNegativeNumericInput
                      allowDecimal
                      value={g.conv1}
                      onChange={(v) => update({ conv1: v })}
                      className={`w-[100px] text-right ${g.conv1 <= 0 ? 'border-destructive' : ''}`}
                    />
                    {g.conv1 <= 0 && <p className="text-xs text-destructive mt-1">Must be greater than 0</p>}
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Working {UNIT_LABELS[g.ops_time_unit] ?? g.ops_time_unit} per {UNIT_SINGULAR[g.mct_time_unit] ?? g.mct_time_unit}
                    </p>
                  </div>
                  <div>
                    <Label className="text-[13px] font-medium">
                      Prod. Period Conversion{' '}
                      <span className="text-muted-foreground font-normal">({g.mct_time_unit} per {g.prod_period_unit})</span>
                    </Label>
                    <NonNegativeNumericInput
                      allowDecimal
                      value={g.conv2}
                      onChange={(v) => update({ conv2: v })}
                      className={`w-[100px] text-right ${g.conv2 <= 0 ? 'border-destructive' : ''}`}
                    />
                    {g.conv2 <= 0 && <p className="text-xs text-destructive mt-1">Must be greater than 0</p>}
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Working {UNIT_LABELS[g.mct_time_unit] ?? g.mct_time_unit} per {UNIT_SINGULAR[g.prod_period_unit] ?? g.prod_period_unit}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="mt-0 space-y-4">
          <Card className={activeScenarioId ? 'border-0 border-l-[3px] border-l-amber-400 bg-white shadow-sm' : 'border-0 bg-white shadow-sm'}>
            <CardHeader>
              <CardTitle className="text-base">Variability & Limits</CardTitle>
              <CardDescription>Default coefficients of variation for queuing calculations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center">Utilization Limit (%)<InfoTip text="When any equipment or labor group exceeds this utilization, MPX stops calculating and reports that production cannot be achieved. Default 95 is recommended — the 5% buffer accounts for model approximation. Do not use this as an allowance for breakdowns; model those separately." /></Label>
                <NonNegativeNumericInput
                  allowDecimal
                  value={g.util_limit}
                  onChange={(v) => update({ util_limit: v })}
                  className={`mt-1.5 w-full max-w-xl text-right ${g.util_limit < 1 || g.util_limit > 99.9 ? 'border-destructive' : ''}`}
                />
                {(g.util_limit < 1 || g.util_limit > 99.9) && <p className="text-xs text-destructive mt-1">Valid range: 1–99.9</p>}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="flex items-center">Equipment Variability %<InfoTip text="Global coefficient of variation for equipment operation times, expressed as a percentage. 30% is typical for manufacturing. Individual equipment groups can multiply this using their Variability Factor." /></Label>
                  <NonNegativeNumericInput allowDecimal className="mt-1.5 text-right" value={g.var_equip} onChange={(v) => update({ var_equip: v })} />
                </div>
                <div>
                  <Label className="flex items-center">Labor Variability %<InfoTip text="Global coefficient of variation for labor operation times, expressed as a percentage. 30% is typical for manufacturing. Individual labor groups can multiply this using their Variability Factor." /></Label>
                  <NonNegativeNumericInput allowDecimal className="mt-1.5 text-right" value={g.var_labor} onChange={(v) => update({ var_labor: v })} />
                </div>
                <div>
                  <Label className="flex items-center">Product Variability %<InfoTip text="Models variability in production scheduling — how consistently lots are released at regular intervals. Higher values model more chaotic shop floor scheduling." /></Label>
                  <NonNegativeNumericInput allowDecimal className="mt-1.5 text-right" value={g.var_prod} onChange={(v) => update({ var_prod: v })} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={activeScenarioId ? 'border-0 border-l-[3px] border-l-amber-400 bg-white shadow-sm' : 'border-0 bg-white shadow-sm'}>
            <CardHeader>
              <CardTitle className="text-base">Global Parameters</CardTitle>
              <CardDescription>Global variables that can be referenced in operation time formulas.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {(['gen1', 'gen2', 'gen3', 'gen4'] as const).map(key => (
                  <div key={key}>
                    <Label className="text-xs flex items-center">{pn[`${key}_name` as keyof typeof pn]}<InfoTip text="Custom variable — rename using the Display Name field. The renamed label will appear throughout the app and can be used in the Formula Builder." /></Label>
                    <NonNegativeNumericInput className="mt-1.5 h-8 font-mono text-right" value={g[key]} onChange={(v) => update({ [key]: v })} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="mt-0 space-y-4">
          <Card className={activeScenarioId ? 'border-0 border-l-[3px] border-l-amber-400 bg-white shadow-sm' : 'border-0 bg-white shadow-sm'}>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Author</Label>
                <Input value={g.author} onChange={(e) => update({ author: e.target.value })} />
              </div>
              <div>
                <Label>Comments</Label>
                <Textarea rows={6} value={g.comments} onChange={(e) => update({ comments: e.target.value })} placeholder="Notes about this model..." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}