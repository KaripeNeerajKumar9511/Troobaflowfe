import type { Model } from '@/stores/modelStore';
import { useModelStore, displayParamNames } from '@/stores/modelStore';
import type { Scenario, ScenarioChange } from '@/stores/scenarioStore';
import { useScenarioStore } from '@/stores/scenarioStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { NonNegativeNumericInput } from '@/components/NonNegativeNumericInput';
import {
  MCT_TIME_UNIT_OPTIONS,
  OPS_TIME_UNIT_OPTIONS,
  PROD_PERIOD_UNIT_OPTIONS,
  UNIT_LABELS,
  UNIT_SINGULAR,
} from '@/lib/timeUnits';

function InfoTip({ text }: { text: string }) {
  return (
    <TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground inline-block ml-1 cursor-help" /></TooltipTrigger><TooltipContent className="max-w-[280px] text-xs">{text}</TooltipContent></Tooltip></TooltipProvider>
  );
}

const FIELD_LABELS: Record<string, string> = {
  model_title: 'Model Title', ops_time_unit: 'Ops Time Unit', mct_time_unit: 'MCT Time Unit',
  prod_period_unit: 'Prod Period', conv1: 'MCT Conversion', conv2: 'Prod Conversion',
  util_limit: 'Util Limit', var_equip: 'Equipment Variability', var_labor: 'Labor Variability',
  var_prod: 'Product Variability', gen1: 'Gen1', gen2: 'Gen2', gen3: 'Gen3', gen4: 'Gen4',
  author: 'Author', comments: 'Comments',
};

function hasChange(scenario: Scenario, field: string): boolean {
  return scenario.changes.some(c => c.dataType === 'General' && c.field === field);
}

function changedClass(scenario: Scenario, field: string): string {
  return hasChange(scenario, field) ? 'ring-2 ring-amber-400 bg-amber-500/5' : '';
}

export function WhatIfGeneralTab({ model, scenario }: { model: Model; scenario: Scenario }) {
  const applyScenarioChange = useScenarioStore(s => s.applyScenarioChange);
  const updateGeneral = useModelStore(s => s.updateGeneral);

  const g = model.general;
  const pn = displayParamNames(model);

  const update = (data: Partial<typeof g>) => {
    Object.entries(data).forEach(([field, value]) => {
      const fieldLabel = FIELD_LABELS[field] || field;
      applyScenarioChange(scenario.id, 'General', 'general', 'General', field, fieldLabel, value as string | number);
    });
    updateGeneral(model.id, data);
  };

  return (
    <Tabs defaultValue="time">
      <TabsList>
        <TabsTrigger value="time">Time Settings</TabsTrigger>
        <TabsTrigger value="advanced">Advanced Parameters</TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
      </TabsList>

      <TabsContent value="time" className="mt-4 space-y-4">
        <Card className="border-l-[3px] border-l-amber-400">
          <CardHeader>
            <CardTitle className="text-base">Time Settings</CardTitle>
            <CardDescription>Define time units and conversion factors for this model.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Model Title</Label>
              <Input value={g.model_title} onChange={(e) => update({ model_title: e.target.value })} placeholder="Report display name" className={changedClass(scenario, 'model_title')} />
            </div>

            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Time Units</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Operations Time Unit</Label>
                  <Select value={g.ops_time_unit} onValueChange={(v) => update({ ops_time_unit: v as typeof g.ops_time_unit })}>
                    <SelectTrigger className={changedClass(scenario, 'ops_time_unit')}><SelectValue /></SelectTrigger>
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
                    <SelectTrigger className={changedClass(scenario, 'mct_time_unit')}><SelectValue /></SelectTrigger>
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
                    <SelectTrigger className={changedClass(scenario, 'prod_period_unit')}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROD_PERIOD_UNIT_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Factory Calendar</p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-[13px] font-medium">
                    MCT Conversion <span className="text-muted-foreground font-normal">({g.ops_time_unit} per {g.mct_time_unit})</span>
                  </Label>
                  <NonNegativeNumericInput
                    allowDecimal
                    value={g.conv1}
                    onChange={(v) => update({ conv1: v })}
                    className={`w-[100px] text-right ${g.conv1 <= 0 ? 'border-destructive' : ''} ${changedClass(scenario, 'conv1')}`}
                  />
                  {g.conv1 <= 0 && <p className="text-xs text-destructive mt-1">Must be greater than 0</p>}
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Working {UNIT_LABELS[g.ops_time_unit] ?? g.ops_time_unit} per {UNIT_SINGULAR[g.mct_time_unit] ?? g.mct_time_unit}
                  </p>
                </div>
                <div>
                  <Label className="text-[13px] font-medium">
                    Prod. Period Conversion <span className="text-muted-foreground font-normal">({g.mct_time_unit} per {g.prod_period_unit})</span>
                  </Label>
                  <NonNegativeNumericInput
                    allowDecimal
                    value={g.conv2}
                    onChange={(v) => update({ conv2: v })}
                    className={`w-[100px] text-right ${g.conv2 <= 0 ? 'border-destructive' : ''} ${changedClass(scenario, 'conv2')}`}
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

      <TabsContent value="advanced" className="mt-4 space-y-4">
        <Card className="border-l-[3px] border-l-amber-400">
          <CardHeader>
            <CardTitle className="text-base">Variability & Limits</CardTitle>
            <CardDescription>Default coefficients of variation for queuing calculations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="flex items-center">Utilization Limit (%)<InfoTip text="When any equipment or labor group exceeds this utilization, MPX stops calculating and reports that production cannot be achieved." /></Label>
              <NonNegativeNumericInput
                allowDecimal
                value={g.util_limit}
                onChange={(v) => update({ util_limit: v })}
                className={`mt-1.5 w-full max-w-xl text-right ${g.util_limit < 1 || g.util_limit > 99.9 ? 'border-destructive' : ''} ${changedClass(scenario, 'util_limit')}`}
              />
              {(g.util_limit < 1 || g.util_limit > 99.9) && <p className="text-xs text-destructive mt-1">Valid range: 1–99.9</p>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="flex items-center">Equipment Variability %<InfoTip text="Global coefficient of variation for equipment operation times." /></Label>
                <NonNegativeNumericInput allowDecimal className={`mt-1.5 text-right ${changedClass(scenario, 'var_equip')}`} value={g.var_equip} onChange={(v) => update({ var_equip: v })} />
              </div>
              <div>
                <Label className="flex items-center">Labor Variability %<InfoTip text="Global coefficient of variation for labor operation times." /></Label>
                <NonNegativeNumericInput allowDecimal className={`mt-1.5 text-right ${changedClass(scenario, 'var_labor')}`} value={g.var_labor} onChange={(v) => update({ var_labor: v })} />
              </div>
              <div>
                <Label className="flex items-center">Product Variability %<InfoTip text="Models variability in production scheduling." /></Label>
                <NonNegativeNumericInput allowDecimal className={`mt-1.5 text-right ${changedClass(scenario, 'var_prod')}`} value={g.var_prod} onChange={(v) => update({ var_prod: v })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-[3px] border-l-amber-400">
          <CardHeader>
            <CardTitle className="text-base">Global Parameters</CardTitle>
            <CardDescription>Global variables that can be referenced in operation time formulas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {(['gen1', 'gen2', 'gen3', 'gen4'] as const).map(key => (
                <div key={key}>
                  <Label className="text-xs flex items-center">{pn[`${key}_name` as keyof typeof pn]}<InfoTip text="Custom variable for formulas." /></Label>
                  <NonNegativeNumericInput value={g[key]} onChange={(v) => update({ [key]: v })} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="comments" className="mt-4 space-y-4">
        <Card className="border-l-[3px] border-l-amber-400">
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label>Author</Label>
              <Input value={g.author} onChange={(e) => update({ author: e.target.value })} className={changedClass(scenario, 'author')} />
            </div>
            <div>
              <Label>Comments</Label>
              <Textarea rows={6} value={g.comments} onChange={(e) => update({ comments: e.target.value })} placeholder="Notes about this model..." className={changedClass(scenario, 'comments')} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}