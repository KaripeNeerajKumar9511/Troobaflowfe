import { useState, useEffect, useRef, type ReactElement } from 'react';
import { useModelStore, displayParamNames, type Model } from '@/stores/modelStore';
import { useScenarioStore } from '@/stores/scenarioStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, FlaskConical } from 'lucide-react';
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
import { generalDraftDirty } from '@/lib/draftDirty';
import { persistGeneralDraft } from '@/lib/pageEditPersist';
import { pageEditCell } from '@/lib/pageEditCell';
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
  const activeScenarioId = useScenarioStore(s => s.activeScenarioId);
  const activeScenario = useScenarioStore(s => s.scenarios.find(sc => sc.id === s.activeScenarioId));
  const applyScenarioChange = useScenarioStore(s => s.applyScenarioChange);
  const { wrapCell } = useCollabCell(model?.id, 'general');
  const collab = useOrgCollab();
  const [draftGeneral, setDraftGeneral] = useState(model?.general);
  const editingRef = useRef(false);
  const { isHolder } = usePageEditLockState(model?.id, 'general');
  const editBaseline = usePageEditBaseline(isHolder, model);

  useEffect(() => {
    if (isHolder) return;
    if (model) setDraftGeneral({ ...model.general });
  }, [model?.id, model?.general, isHolder, model]);

  const isDirty =
    editBaseline && draftGeneral
      ? generalDraftDirty(editBaseline, draftGeneral)
      : model && draftGeneral
        ? generalDraftDirty(model, draftGeneral)
        : false;

  const pageEdit = usePageEditMode({
    modelId: model?.id,
    page: 'general',
    pageLabel: 'General',
    isDirty,
    onDiscard: () => {
      if (editBaseline) setDraftGeneral({ ...editBaseline.general });
      else if (model) setDraftGeneral({ ...model.general });
    },
    onSave: async () => {
      if (!model || !draftGeneral || !editBaseline) return;
      await persistGeneralDraft(model.id, draftGeneral, editBaseline);
      await syncModelToOrg(collab, model.id, 'general');
    },
  });

  editingRef.current = pageEdit.isEditing;

  useModelRefreshSync(model?.id, (fresh) => {
    if (editingRef.current) return;
    setDraftGeneral({ ...fresh.general });
  });

  if (!model || !draftGeneral) return (
    <div className="p-6 max-w-3xl space-y-4">
      <div className="h-7 w-48 bg-muted animate-pulse rounded" />
      <div className="h-4 w-72 bg-muted animate-pulse rounded" />
      <div className="h-48 bg-muted animate-pulse rounded-lg mt-6" />
    </div>
  );

  const g = draftGeneral;
  const pn = displayParamNames(model);

  const update = (data: Partial<typeof g>) => {
    if (!pageEdit.canEditFields) return;
    if (activeScenarioId && activeScenario) {
      Object.entries(data).forEach(([field, value]) => {
        const fieldLabel = FIELD_LABELS[field] || field;
        applyScenarioChange(activeScenarioId, 'General', model.id, 'General', field, fieldLabel, value as string | number);
      });
    }
    setDraftGeneral((prev) => (prev ? { ...prev, ...data } : prev));
  };

  const collabCell = (field: keyof typeof g, child: React.ReactElement) =>
    pageEditCell(pageEdit.canEditFields, child, (c) =>
      wrapCell(model.id, field, c, { getValue: () => draftGeneral[field] }),
    );

  return (
    <>
    <PageEditLeaveGuard
      isEditing={pageEdit.isEditing}
      isDirty={isDirty}
      saving={pageEdit.saving}
      onSave={pageEdit.save}
      onDiscard={pageEdit.discard}
      leaveDescription="You have unsaved general data changes. Save or discard before leaving this page."
      savingSubtitle="Writing general data…"
    />
    <div className="p-6 max-w-3xl animate-fade-in">
      {activeScenarioId && activeScenario && (
        <div className="mb-4 flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-md">
          <FlaskConical className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="text-sm text-amber-700 font-medium">
            Changes are being recorded to <span className="font-semibold">{activeScenario.name}</span>
          </span>
        </div>
      )}
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <h1 className="text-xl font-bold">General Data</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure time settings, variability parameters, and model metadata.</p>
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
          pageLabel="General"
        />
      </div>

      <PageEditLockedShell editorName={pageEdit.editorName} pageLabel="General" dimContent={false} className="mb-6">
      <Tabs defaultValue="time">
        <TabsList>
          <TabsTrigger value="time">Time Settings</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Parameters</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="time" className="mt-4 space-y-4">
          <Card className={activeScenarioId ? 'border-l-[3px] border-l-amber-400' : ''}>
            <CardHeader>
              <CardTitle className="text-base">Time Settings</CardTitle>
              <CardDescription>Define time units and conversion factors for this model.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Model Title</Label>
                {collabCell('model_title', <Input value={g.model_title} onChange={(e) => update({ model_title: e.target.value })} placeholder="Report display name" />)}
              </div>

              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Time Units</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Operations Time Unit</Label>
                    {collabCell('ops_time_unit', (
                      <Select value={g.ops_time_unit} onValueChange={(v) => update({ ops_time_unit: v as typeof g.ops_time_unit })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {OPS_TIME_UNIT_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ))}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">MCT Time Unit</Label>
                    {collabCell('mct_time_unit', (
                      <Select value={g.mct_time_unit} onValueChange={(v) => update({ mct_time_unit: v as typeof g.mct_time_unit })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {MCT_TIME_UNIT_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ))}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Production Period</Label>
                    {collabCell('prod_period_unit', (
                      <Select value={g.prod_period_unit} onValueChange={(v) => update({ prod_period_unit: v as typeof g.prod_period_unit })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PROD_PERIOD_UNIT_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-border" />

              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Factory Calendar</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-[13px] font-medium">
                      MCT Conversion{' '}
                      <span className="text-muted-foreground font-normal">({g.ops_time_unit} per {g.mct_time_unit})</span>
                    </Label>
                    {collabCell('conv1', (
                      <NonNegativeNumericInput
                        allowDecimal
                        value={g.conv1}
                        onChange={(v) => update({ conv1: v })}
                        className={`w-[100px] text-right ${g.conv1 <= 0 ? 'border-destructive' : ''}`}
                      />
                    ))}
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
                    {collabCell('conv2', (
                      <NonNegativeNumericInput
                        allowDecimal
                        value={g.conv2}
                        onChange={(v) => update({ conv2: v })}
                        className={`w-[100px] text-right ${g.conv2 <= 0 ? 'border-destructive' : ''}`}
                      />
                    ))}
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
          <Card className={activeScenarioId ? 'border-l-[3px] border-l-amber-400' : ''}>
            <CardHeader>
              <CardTitle className="text-base">Variability & Limits</CardTitle>
              <CardDescription>Default coefficients of variation for queuing calculations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center">Utilization Limit (%)<InfoTip text="When any equipment or labor group exceeds this utilization, MPX stops calculating and reports that production cannot be achieved. Default 95 is recommended — the 5% buffer accounts for model approximation. Do not use this as an allowance for breakdowns; model those separately." /></Label>
                {collabCell('util_limit', (
                  <NonNegativeNumericInput
                    allowDecimal
                    value={g.util_limit}
                    onChange={(v) => update({ util_limit: v })}
                    className={`mt-1.5 w-full max-w-xl text-right ${g.util_limit < 1 || g.util_limit > 99.9 ? 'border-destructive' : ''}`}
                  />
                ))}
                {(g.util_limit < 1 || g.util_limit > 99.9) && <p className="text-xs text-destructive mt-1">Valid range: 1–99.9</p>}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="flex items-center">Equipment Variability %<InfoTip text="Global coefficient of variation for equipment operation times, expressed as a percentage. 30% is typical for manufacturing. Individual equipment groups can multiply this using their Variability Factor." /></Label>
                  {collabCell('var_equip', <NonNegativeNumericInput allowDecimal value={g.var_equip} onChange={(v) => update({ var_equip: v })} className="mt-1.5 text-right" />)}
                </div>
                <div>
                  <Label className="flex items-center">Labor Variability %<InfoTip text="Global coefficient of variation for labor operation times, expressed as a percentage. 30% is typical for manufacturing. Individual labor groups can multiply this using their Variability Factor." /></Label>
                  {collabCell('var_labor', <NonNegativeNumericInput allowDecimal value={g.var_labor} onChange={(v) => update({ var_labor: v })} className="mt-1.5 text-right" />)}
                </div>
                <div>
                  <Label className="flex items-center">Product Variability %<InfoTip text="Models variability in production scheduling — how consistently lots are released at regular intervals. Higher values model more chaotic shop floor scheduling." /></Label>
                  {collabCell('var_prod', <NonNegativeNumericInput allowDecimal value={g.var_prod} onChange={(v) => update({ var_prod: v })} className="mt-1.5 text-right" />)}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="mt-4 space-y-4">
          <Card className={activeScenarioId ? 'border-l-[3px] border-l-amber-400' : ''}>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Author</Label>
                {collabCell('author', <Input value={g.author} onChange={(e) => update({ author: e.target.value })} />)}
              </div>
              <div>
                <Label>Comments</Label>
                {collabCell('comments', <Textarea rows={6} value={g.comments} onChange={(e) => update({ comments: e.target.value })} placeholder="Notes about this model..." />)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </PageEditLockedShell>
    </div>
    </>
  );
}
