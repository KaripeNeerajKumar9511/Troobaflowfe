import { useState, useEffect, useCallback } from 'react';
import { useModelStore } from '@/stores/modelStore';
import { useScenarioStore } from '@/stores/scenarioStore';
import { useResultsStore } from '@/stores/resultsStore';
import { useNavigate } from 'react-router-dom';
import { Save, CircleDot, FlaskConical, ChevronDown, RotateCcw, Clock, History } from 'lucide-react';
import troobaLogoDark from '@/assets/trooba-logo-dark.svg';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  fetchModelVersions,
  buildModelSnapshot,
  createModelCheckpoint,
  restoreModelFromVersion,
} from '@/lib/supabaseData';
import { useRunCalculation } from '@/hooks/useRunCalculation';

interface RecentVersion {
  id: string;
  label: string;
  created_at: string;
}

export function ModelContextBar() {
  const model = useModelStore((s) => s.getActiveModel());
  const activeScenario = useScenarioStore((s) => s.getActiveScenario());
  const navigate = useNavigate();
  const { isRunning, handleRun: sharedRun } = useRunCalculation();
  const [showCheckpointDialog, setShowCheckpointDialog] = useState(false);
  const [checkpointName, setCheckpointName] = useState('');
  const [isSavingCheckpoint, setIsSavingCheckpoint] = useState(false);
  const [recentVersions, setRecentVersions] = useState<RecentVersion[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [restoreVersionId, setRestoreVersionId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const loadRecentVersions = useCallback(async () => {
    if (!model) return;
    const rows = await fetchModelVersions(model.id);
    setRecentVersions(rows.slice(0, 5));
  }, [model?.id]);

  useEffect(() => {
    loadRecentVersions();
  }, [loadRecentVersions]);

  if (!model) return null;

  const statusConfig = {
    never_run: { label: 'Never Run', className: 'bg-sidebar-muted/40 text-sidebar-foreground border-sidebar-muted/60' },
    current: { label: 'Results Current', className: 'bg-success/20 text-[#34D399] border-success/40' },
    needs_recalc: { label: 'Recalc Needed', className: 'bg-warning/20 text-[#FBBF24] border-warning/40' },
  };

  const status = statusConfig[model.run_status];
  const isResultsCurrent = model.run_status === 'current';

  const handleRun = () => sharedRun('full');

  // ── Open checkpoint dialog ──────────────────────────────────────
  const handleOpenCheckpointDialog = () => {
    const now = new Date();
    const defaultName = `Checkpoint ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    setCheckpointName(defaultName);
    setShowCheckpointDialog(true);
  };

  // ── Save Checkpoint ─────────────────────────────────────────────
  const handleSaveCheckpoint = async () => {
    if (!checkpointName.trim()) return;
    setIsSavingCheckpoint(true);
    try {
      const snapshot = buildModelSnapshot(model);
      const ok = await createModelCheckpoint(model.id, checkpointName.trim(), snapshot);
      if (!ok) throw new Error('create failed');
      toast.success(`Checkpoint saved: ${checkpointName.trim()}`);
      setShowCheckpointDialog(false);
      loadRecentVersions();
    } catch (err) {
      console.error('Checkpoint error:', err);
      toast.error('Failed to save checkpoint');
    } finally {
      setIsSavingCheckpoint(false);
    }
  };

  // ── Export Model as JSON ────────────────────────────────────────
  const handleExport = async () => {
    const exportData = {
      name: model.name, description: model.description, tags: model.tags,
      general: model.general, labor: model.labor, equipment: model.equipment,
      products: model.products, operations: model.operations, routing: model.routing,
      ibom: model.ibom, param_names: model.param_names,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `${model.name.replace(/\s+/g, '-')}-export-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Model exported as JSON');
  };

  // ── Restore from dropdown ───────────────────────────────────────
  const handleRestore = async (versionId: string) => {
    setIsRestoring(true);
    try {
      const restored = await restoreModelFromVersion(model.id, versionId);
      if (!restored) {
        toast.error('Failed to load version snapshot');
        return;
      }
      useResultsStore.getState().clearAllForModel();
      await useModelStore.getState().loadModels(true);
      useModelStore.getState().setActiveModel(model.id);

      const v = recentVersions.find(rv => rv.id === versionId);
      toast.success(`Restored to: ${v?.label || 'checkpoint'}`);
      setDropdownOpen(false);
    } catch (err) {
      console.error('Restore error:', err);
      toast.error('Failed to restore checkpoint');
    } finally {
      setIsRestoring(false);
      setRestoreVersionId(null);
    }
  };

  // ── Tooltip text ────────────────────────────────────────────────
  const scenarioLabel = activeScenario ? activeScenario.name : 'Basecase';
  const runTooltip = `Quick recalculate — runs Full Calculate on ${scenarioLabel}`;
  const statusTooltip = model.run_status === 'current'
    ? `Last calculated: ${model.last_run_at ? new Date(model.last_run_at).toLocaleString() : 'unknown'}`
    : model.run_status === 'needs_recalc'
      ? `Results are stale — data changed${model.last_run_at ? ` since last run on ${new Date(model.last_run_at).toLocaleString()}` : ''}`
      : 'Model has never been run';
  const checkpointTooltip = 'Save a version checkpoint you can restore later';
  const exportTooltip = 'Download this model as a JSON file';

  const restoreVersion = restoreVersionId ? recentVersions.find(v => v.id === restoreVersionId) : null;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-[52px] bg-context-bar text-context-bar-foreground flex items-center px-2 md:px-5 gap-1.5 md:gap-3 border-b border-[rgba(255,255,255,0.08)] shrink-0 overflow-x-auto">
        {/* Spacer for mobile hamburger */}
        <div className="w-8 shrink-0 md:hidden" />
        <button
          onClick={() => navigate('/library')}
          className="shrink-0"
        >
          <img src={troobaLogoDark} alt="Trooba Flow" style={{ height: '34px', width: 'auto' }} />
        </button>
        <span className="text-sidebar-muted text-sm shrink-0">›</span>
        <span className="text-sm font-medium text-context-bar-foreground truncate max-w-[120px] md:max-w-[200px]">{model.name}</span>

        <div className="h-4 w-px bg-[rgba(255,255,255,0.12)]" />

        {activeScenario ? (
          <button onClick={() => navigate(`/models/${model.id}/whatif`)} className="shrink-0 hidden sm:flex">
            <Badge variant="outline" className="border-amber-400/60 bg-amber-500/10 text-amber-300 text-xs font-medium cursor-pointer hover:bg-amber-500/20 transition-colors">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5" />
              What-if: {activeScenario.name}
            </Badge>
          </button>
        ) : (
          <Badge variant="outline" className="border-primary/40 text-primary text-xs font-mono shrink-0 hidden sm:flex">
            <CircleDot className="h-2.5 w-2.5 mr-1" />
            Basecase
          </Badge>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`text-xs cursor-default ${status.className}`}>
              {status.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs text-xs">{statusTooltip}</TooltipContent>
        </Tooltip>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          {/* Checkpoint button + dropdown */}
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-sidebar-muted hover:text-context-bar-foreground hover:bg-sidebar-accent rounded-r-none" onClick={handleOpenCheckpointDialog}>
                  <Save className="h-3.5 w-3.5 mr-1" /> Checkpoint
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{checkpointTooltip}</TooltipContent>
            </Tooltip>
            <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <PopoverTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 w-6 px-0 text-sidebar-muted hover:text-context-bar-foreground hover:bg-sidebar-accent rounded-l-none border-l border-[rgba(255,255,255,0.12)]">
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="end" sideOffset={6}>
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-xs font-semibold text-muted-foreground">Recent Checkpoints</p>
                </div>
                {recentVersions.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No checkpoints yet</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {recentVersions.map(v => (
                      <div key={v.id} className="flex items-center justify-between px-3 py-2 hover:bg-accent/50 transition-colors group">
                        <div className="min-w-0 flex-1 mr-2">
                          <p className="text-sm font-medium truncate">{v.label || 'Unnamed Checkpoint'}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(v.created_at).toLocaleString()}</p>
                        </div>
                        <Button
                          size="sm" variant="ghost"
                          className="h-6 text-[10px] px-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={() => { setRestoreVersionId(v.id); }}
                        >
                          <RotateCcw className="h-2.5 w-2.5 mr-0.5" /> Restore
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-t border-border px-3 py-2">
                  <button
                    onClick={() => { setDropdownOpen(false); navigate(`/models/${model.id}/settings`); }}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <History className="h-3 w-3" /> View all checkpoints
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

        </div>
      </div>

      {/* Checkpoint Name Dialog */}
      <Dialog open={showCheckpointDialog} onOpenChange={setShowCheckpointDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Checkpoint</DialogTitle>
            <DialogDescription>
              Save a snapshot of the current model state that you can restore later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="checkpoint-name">Checkpoint Name</Label>
              <Input
                id="checkpoint-name"
                value={checkpointName}
                onChange={e => setCheckpointName(e.target.value)}
                placeholder="e.g. Before lot size changes"
                className="mt-1"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleSaveCheckpoint(); }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckpointDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCheckpoint} disabled={isSavingCheckpoint || !checkpointName.trim()}>
              {isSavingCheckpoint ? 'Saving…' : 'Save Checkpoint'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore confirmation */}
      <AlertDialog open={!!restoreVersionId} onOpenChange={() => setRestoreVersionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Checkpoint</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace the current model data with the checkpoint
              {restoreVersion ? ` "${restoreVersion.label}"` : ''}.
              This action cannot be undone. Save a checkpoint first if you want to preserve your current state.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restoreVersionId && handleRestore(restoreVersionId)}
              disabled={isRestoring}
            >
              {isRestoring ? 'Restoring…' : 'Restore'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
