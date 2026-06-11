import { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { ModelTransferOverlay, yieldForOverlayPaint } from '@/components/ModelTransferOverlay';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useModelStore, type OutputViewMode } from '@/stores/modelStore';
import { useResultsStore } from '@/stores/resultsStore';
import {
  db,
  fetchModelVersions,
  buildModelSnapshot,
  createModelCheckpoint,
  patchModelVersionLabel,
  deleteModelVersion,
  restoreModelFromVersion,
  type ModelVersionRow,
} from '@/lib/supabaseData';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Save, Trash2, Archive, Download, RotateCcw, X, Plus, Clock, Pencil, ChevronDown, Lock, LayoutGrid, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDeptCodes } from '@/hooks/useDeptCodes';


export default function ModelSettings() {
  const [searchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') || 'general';
  const initialTab = rawTab === 'params' ? 'general' : rawTab;
  const model = useModelStore(s => s.getActiveModel());
  const renameModel = useModelStore(s => s.renameModel);
  const archiveModel = useModelStore(s => s.archiveModel);
  const deleteModel = useModelStore(s => s.deleteModel);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [versions, setVersions] = useState<ModelVersionRow[]>([]);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [restoreVersionId, setRestoreVersionId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [editingVersionName, setEditingVersionName] = useState('');
  const [deleteVersionId, setDeleteVersionId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!model) return;
    setName(model.name);
    setTitle(model.general.model_title);
    setDescription(model.description);
    setTags(model.tags);
    void loadVersions();
  }, [model?.id]);

  const loadVersions = async () => {
    if (!model) return;
    const rows = await fetchModelVersions(model.id);
    setVersions(rows);
  };

  const handleRenameVersion = async (versionId: string) => {
    if (!editingVersionName.trim()) return;
    const ok = await patchModelVersionLabel(versionId, editingVersionName.trim());
    if (!ok) { toast.error('Failed to rename checkpoint'); return; }
    toast.success('Checkpoint renamed');
    setEditingVersionId(null);
    loadVersions();
  };

  const handleDeleteVersion = async (versionId: string) => {
    const ok = await deleteModelVersion(versionId);
    if (!ok) { toast.error('Failed to delete checkpoint'); return; }
    toast.success('Checkpoint deleted');
    setDeleteVersionId(null);
    loadVersions();
  };

  if (!model) return null;

  const handleSaveName = () => {
    if (!name.trim()) return;
    renameModel(model.id, name.trim());
    toast.success('Model name updated');
  };

  const handleSaveDescription = () => {
    db.updateModel(model.id, { description });
    useModelStore.setState(s => ({
      models: s.models.map(m => m.id === model.id ? { ...m, description } : m),
    }));
    toast.success('Description saved');
  };

  const handleSaveTitle = () => {
    useModelStore.getState().updateGeneral(model.id, { model_title: title });
    toast.success('Report title saved');
  };

  const handleAddTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    const updated = [...tags, newTag.trim()];
    setTags(updated);
    setNewTag('');
    db.updateModel(model.id, { tags: updated });
    useModelStore.setState(s => ({
      models: s.models.map(m => m.id === model.id ? { ...m, tags: updated } : m),
    }));
  };

  const handleRemoveTag = (tag: string) => {
    const updated = tags.filter(t => t !== tag);
    setTags(updated);
    db.updateModel(model.id, { tags: updated });
    useModelStore.setState(s => ({
      models: s.models.map(m => m.id === model.id ? { ...m, tags: updated } : m),
    }));
  };

  const handleSaveCheckpoint = async () => {
    const snapshot = buildModelSnapshot(model);
    const ok = await createModelCheckpoint(model.id, 'Manual Checkpoint', snapshot);
    if (!ok) {
      toast.error('Failed to save checkpoint');
      return;
    }
    toast.success('Checkpoint saved');
    loadVersions();
  };

  const handleRestore = async (versionId: string) => {
    setIsRestoring(true);
    try {
      const result = await restoreModelFromVersion(model.id, versionId);
      if (!result) {
        toast.error('Failed to restore checkpoint');
        return;
      }
      useResultsStore.getState().clearAllForModel();
      await useModelStore.getState().loadModels(true);
      useModelStore.getState().setActiveModel(model.id);
      toast.success(
        result.consumedUndo
          ? 'Model restored from undo checkpoint. That undo slot is cleared — restore another checkpoint to create a new auto-save.'
          : `Model restored. Previous data saved as "${result.rollbackLabel || 'Previous state (auto-saved)'}".`,
        { duration: 6000 },
      );
      loadVersions();
      navigate(`/models/${model.id}/general`);
    } catch (err) {
      console.error('Restore error:', err);
      toast.error('Failed to restore checkpoint');
    } finally {
      setIsRestoring(false);
      setRestoreVersionId(null);
    }
  };

  const handleExport = async () => {
    if (!model || exporting) return;
    flushSync(() => setExporting(true));
    await yieldForOverlayPaint();
    try {
      const exportData = {
        name: model.name,
        description: model.description,
        tags: model.tags,
        general: model.general,
        labor: model.labor,
        equipment: model.equipment,
        products: model.products,
        operations: model.operations,
        routing: model.routing,
        ibom: model.ibom,
        param_names: model.param_names,
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${model.name.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Model exported');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = () => {
    if (deleteConfirm !== model.name) return;
    deleteModel(model.id);
    setShowDelete(false);
    toast.success('Model deleted');
    window.location.href = '/library';
  };

  return (
    <>
      {exporting && <ModelTransferOverlay mode="export" />}
    <div className="p-6 max-w-3xl animate-fade-in">
      <h1 className="text-xl font-bold mb-1">Model Settings</h1>
      <p className="text-sm text-muted-foreground mb-6">Configure model metadata and manage versions.</p>

      <Tabs defaultValue={initialTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="deptcodes">Group/Dept/Area</TabsTrigger>
          <TabsTrigger value="output-settings">Output Settings</TabsTrigger>
          <TabsTrigger value="versions">Version History</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Model Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Model Name (Library)</Label>
                <div className="flex gap-2">
                  <Input value={name} onChange={e => setName(e.target.value)} />
                  <Button size="sm" onClick={handleSaveName} disabled={!name.trim() || name === model.name}>
                    <Save className="h-3.5 w-3.5 mr-1" /> Save
                  </Button>
                </div>
              </div>
              <div>
                <Label>Report Title</Label>
                <div className="flex gap-2">
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title for printed reports" />
                  <Button size="sm" onClick={handleSaveTitle} disabled={title === model.general.model_title}>
                    <Save className="h-3.5 w-3.5 mr-1" /> Save
                  </Button>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <div className="flex gap-2">
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                </div>
                <Button size="sm" className="mt-2" onClick={handleSaveDescription} disabled={description === model.description}>
                  <Save className="h-3.5 w-3.5 mr-1" /> Save Description
                </Button>
              </div>
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map(t => (
                    <Badge key={t} variant="secondary" className="gap-1">
                      {t}
                      <button onClick={() => handleRemoveTag(t)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    className="h-8"
                    onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button size="sm" variant="outline" onClick={handleAddTag} disabled={!newTag.trim()}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deptcodes" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Product Group / Dept / Area</CardTitle>
              <CardDescription>
                Define grouping labels for products. These appear in the Dept/Area column on the Products page and drive MCT summary subtotals by group.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeptCodesSection modelId={model.id} section="product" title="Products" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="output-settings" className="mt-4 space-y-4">
          <OutputSettingsSection modelId={model.id} />
        </TabsContent>

        <TabsContent value="versions" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Version History</CardTitle>
                  <CardDescription>Save and restore model checkpoints. {versions.length > 0 && `${versions.length} checkpoint${versions.length !== 1 ? 's' : ''} saved.`}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {versions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No checkpoints saved yet. Use the Checkpoint button in the context bar to save one.</p>
              ) : (
                <div className="space-y-2">
                  {versions.slice(0, visibleCount).map(v => (
                    <div key={v.id} className="flex items-center justify-between p-3 rounded-md border border-border group">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          {editingVersionId === v.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                className="h-7 text-sm w-48"
                                value={editingVersionName}
                                onChange={e => setEditingVersionName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleRenameVersion(v.id)}
                                autoFocus
                              />
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleRenameVersion(v.id)}>
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingVersionId(null)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <span className={`text-sm font-semibold flex items-center gap-1.5 ${!v.label ? 'italic text-muted-foreground' : ''}`}>
                                {v.version_kind === 'pre_restore' && (
                                  <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">Undo</Badge>
                                )}
                                {v.label || 'Unnamed Checkpoint'}
                              </span>
                              <p className="text-[11px] text-muted-foreground">
                                {v.version_kind === 'pre_restore'
                                  ? 'Restore to return to data before your last restore'
                                  : new Date(v.created_at).toLocaleString()}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      {editingVersionId !== v.id && (
                        <div className="flex items-center gap-1 shrink-0">
                          {v.version_kind !== 'pre_restore' && (
                          <Button
                            size="sm" variant="ghost"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => { setEditingVersionId(v.id); setEditingVersionName(v.label || ''); }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          )}
                          <Button
                            size="sm" variant="ghost"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            onClick={() => setDeleteVersionId(v.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs ml-1" onClick={() => setRestoreVersionId(v.id)}>
                            <RotateCcw className="h-3 w-3 mr-1" /> Restore
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {versions.length > visibleCount && (
                    <Button variant="ghost" className="w-full text-xs" onClick={() => setVisibleCount(c => c + 10)}>
                      <ChevronDown className="h-3.5 w-3.5 mr-1" /> Load more ({versions.length - visibleCount} remaining)
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="mt-4 space-y-4">
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-md border border-border">
                <div>
                  <p className="text-sm font-medium">Archive Model</p>
                  <p className="text-xs text-muted-foreground">Hide from main library. Can be restored.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { archiveModel(model.id); toast.success(model.is_archived ? 'Model restored' : 'Model archived'); }}>
                  <Archive className="h-3.5 w-3.5 mr-1" /> {model.is_archived ? 'Restore' : 'Archive'}
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md border border-border">
                <div>
                  <p className="text-sm font-medium">Export Model</p>
                  <p className="text-xs text-muted-foreground">Download full model data as JSON.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
                  <Download className="h-3.5 w-3.5 mr-1" /> {exporting ? 'Exporting…' : 'Export'}
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md border border-destructive/30 bg-destructive/5">
                <div>
                  <p className="text-sm font-medium text-destructive">Delete Model</p>
                  <p className="text-xs text-muted-foreground">Permanently delete this model and all data.</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Model</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>"{model.name}"</strong> and all its data. Type the model name to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirm}
            onChange={e => setDeleteConfirm(e.target.value)}
            placeholder={model.name}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteConfirm !== model.name}>
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore confirmation dialog */}
      <AlertDialog open={!!restoreVersionId} onOpenChange={(open) => !open && setRestoreVersionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Checkpoint</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const rv = restoreVersionId ? versions.find(v => v.id === restoreVersionId) : null;
                return rv ? (
                  <>
                    Restore to checkpoint: <strong>"{rv.label || 'Unnamed'}"</strong> — saved on{' '}
                    <strong>{new Date(rv.created_at).toLocaleString()}</strong>?
                    <br /><br />
                    This will replace all current model data. Your current data will be saved automatically as &quot;Previous state (auto-saved)&quot; so you can undo from the checkpoint list.
                  </>
                ) : 'Loading…';
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isRestoring}
              onClick={() => restoreVersionId && handleRestore(restoreVersionId)}
            >
              {isRestoring ? 'Restoring…' : 'Restore'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete checkpoint confirmation */}
      <AlertDialog open={!!deleteVersionId} onOpenChange={(open) => !open && setDeleteVersionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Checkpoint</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const dv = deleteVersionId ? versions.find(v => v.id === deleteVersionId) : null;
                return dv ? (
                  <>Delete checkpoint <strong>"{dv.label || 'Unnamed'}"</strong>? This cannot be undone.</>
                ) : 'Loading…';
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteVersionId && handleDeleteVersion(deleteVersionId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </>
  );
}

function OutputSettingsSection({ modelId }: { modelId: string }) {
  const model = useModelStore(s => s.models.find(m => m.id === modelId));
  const viewMode: OutputViewMode = model?.general.output_view_mode ?? 'normal';

  const handleViewModeChange = async (mode: OutputViewMode) => {
    if (!model || mode === viewMode) return;
    try {
      await db.updateGeneral(modelId, { output_view_mode: mode });
      useModelStore.setState(s => ({
        models: s.models.map(m => m.id === modelId ? { ...m, general: { ...m.general, output_view_mode: mode } } : m),
      }));
      toast.success(mode === 'premium' ? 'Premium view enabled for outputs' : 'classic view restored for outputs');
    } catch {
      toast.error('Failed to save output view mode');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Output View Mode</CardTitle>
        <CardDescription>
          Choose how result tables are displayed across Run &amp; Results. More view modes will be added here in the future.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleViewModeChange('normal')}
            className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
              viewMode === 'normal'
                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                : 'border-border hover:border-primary/40 hover:bg-muted/30'
            }`}
          >
            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${viewMode === 'normal' ? 'bg-primary/10 text-primary' : 'bg-secondary/70 text-secondary-foreground'}`}>
              <LayoutGrid className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Classic View</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Standard compact tables with monospace numbers — the classic default layout.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleViewModeChange('premium')}
            className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
              viewMode === 'premium'
                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                : 'border-border hover:border-primary/40 hover:bg-muted/30'
            }`}
          >
            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${viewMode === 'premium' ? 'bg-primary/10 text-primary' : 'bg-secondary/70 text-secondary-foreground'}`}>
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Premium View</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Color-coded columns, Plus Jakarta Sans typography, and formatted numbers — matching the premium report style.
              </p>
            </div>
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Active mode: <span className="font-medium text-foreground">{viewMode === 'premium' ? 'Premium View' : 'Classic View'}</span>.
          Open Run &amp; Results to see the change applied to all output tables.
        </p>
      </CardContent>
    </Card>
  );
}

function DeptCodesSection({ modelId, section, title }: { modelId: string; section: 'product'; title: string }) {
  const { deptCodes, loading, addDeptCode, updateDeptCode, deleteDeptCode } = useDeptCodes(modelId, section);
  const [newValue, setNewValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    if (deptCodes.some(d => d.value.toLowerCase() === newValue.trim().toLowerCase())) {
      toast.error('This value already exists');
      return;
    }
    const result = await addDeptCode(newValue.trim());
    if (result?.error) toast.error(result.error === 'Duplicate' ? 'This value already exists' : 'Failed to add value');
    else { toast.success('Value added'); setNewValue(''); }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingValue.trim()) return;
    if (deptCodes.some(d => d.id !== id && d.value.toLowerCase() === editingValue.trim().toLowerCase())) {
      toast.error('This value already exists');
      return;
    }
    const result = await updateDeptCode(id, editingValue.trim());
    if (result?.error) toast.error('Failed to update');
    else { toast.success('Updated'); setEditingId(null); }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteDeptCode(id);
    if (result?.error) toast.error('Failed to delete');
    else toast.success('Deleted');
  };

  if (loading) {
    return <p className="text-xs text-muted-foreground">Loading groups…</p>;
  }

  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">{title}</h4>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {deptCodes.map(dc => (
          editingId === dc.id ? (
            <div key={dc.id} className="inline-flex items-center gap-1">
              <Input
                className="h-6 w-32 text-xs font-mono px-2"
                value={editingValue}
                onChange={e => setEditingValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(dc.id); if (e.key === 'Escape') setEditingId(null); }}
                autoFocus
              />
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleSaveEdit(dc.id)}>
                <Save className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setEditingId(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Badge key={dc.id} variant="secondary" className="gap-1 font-mono text-xs cursor-default">
              {dc.value}
              {dc.is_default ? (
                <Tooltip><TooltipTrigger asChild><Lock className="h-2.5 w-2.5 text-muted-foreground" /></TooltipTrigger><TooltipContent className="text-xs">Permanent — required for MCT chart coloring</TooltipContent></Tooltip>
              ) : (
                <>
                  <button className="hover:text-foreground text-muted-foreground" onClick={() => { setEditingId(dc.id); setEditingValue(dc.value); }}>
                    <Pencil className="h-2.5 w-2.5" />
                  </button>
                  <button className="hover:text-destructive text-muted-foreground" onClick={() => handleDelete(dc.id)}>
                    <X className="h-2.5 w-2.5" />
                  </button>
                </>
              )}
            </Badge>
          )
        ))}
        {deptCodes.length === 0 && (
          <span className="text-xs text-muted-foreground italic">No values defined yet.</span>
        )}
      </div>

      <div className="flex gap-1.5 items-center">
        <Input
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          placeholder="Add value…"
          className="h-7 w-40 text-xs"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={handleAdd} disabled={!newValue.trim()}>
          <Plus className="h-3 w-3 mr-0.5" /> Add
        </Button>
      </div>
    </div>
  );
}
