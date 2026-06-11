import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminModelDetail, apiJson } from '@/lib/api';
import type { Model } from '@/stores/modelStore';
import type { CalcResults } from '@/lib/calculationEngine';
import { useAdminWorkspace } from '@/components/admin/AdminWorkspaceContext';
import { AdminModelInputs } from '@/components/admin/AdminModelInputs';
import { AdminModelOutputs, type AdminScenarioOutput } from '@/components/admin/AdminModelOutputs';
import { AdminModelErrors, type AdminIssueRow } from '@/components/admin/AdminModelErrors';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ModelDetailPayload {
  user: { id: number; email: string; name: string };
  model: { id: string; name: string; run_status: string };
  input: Model;
  outputs: AdminScenarioOutput[];
  issue_rows: AdminIssueRow[];
  validation: { errors: string[]; warnings: string[] };
}

export function AdminModelDetail() {
  const { userId, modelId, orgId } = useParams<{ userId: string; modelId: string; orgId?: string }>();
  const navigate = useNavigate();
  const { setContextTitle, setContextSubtitle, setTitleLink } = useAdminWorkspace();
  const [payload, setPayload] = useState<ModelDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const userBackPath = orgId
    ? `/TF-admin/organizations/${orgId}/members/${userId}`
    : `/TF-admin/users/${userId}`;

  useEffect(() => {
    if (!userId || !modelId) return;
    document.title = 'TF Admin — Model';
    setLoading(true);
    apiJson<ModelDetailPayload>(adminModelDetail(userId, modelId))
      .then((d) => {
        setPayload({
          ...d,
          outputs: (d.outputs || []).map((o) => ({
            ...o,
            results: o.results as CalcResults,
          })),
        });
      })
      .catch(() => setPayload(null))
      .finally(() => setLoading(false));
  }, [userId, modelId]);

  useEffect(() => {
    if (payload && userId) {
      setContextTitle(payload.model.name);
      setContextSubtitle(`${payload.user.email} · ${payload.user.name || payload.user.email}`);
      setTitleLink(userBackPath);
    }
    return () => setTitleLink(null);
  }, [payload, userId, userBackPath, setContextTitle, setContextSubtitle, setTitleLink]);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl space-y-4 animate-fade-in">
        <div className="h-8 w-64 bg-slate-200/80 rounded animate-pulse" />
        <div className="h-96 bg-white border rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!payload) {
    return <div className="p-6 text-sm text-muted-foreground">Model not found.</div>;
  }

  const issueCount =
    payload.issue_rows.length + payload.validation.errors.length + payload.validation.warnings.length;

  return (
    <div className="p-6 max-w-6xl animate-fade-in">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(userBackPath)}
          className="text-xl font-bold text-left hover:text-primary transition-colors"
          title="Back to user models"
        >
          {payload.model.name}
        </button>
        <p className="text-sm text-muted-foreground mt-1">Owner: {payload.user.email}</p>
        <Badge variant="outline" className="mt-2 capitalize">
          {payload.model.run_status.replace('_', ' ')}
        </Badge>
      </div>

      <Tabs defaultValue="inputs">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="inputs">Inputs</TabsTrigger>
          <TabsTrigger value="outputs">Outputs</TabsTrigger>
          <TabsTrigger value="errors">
            Errors
            {issueCount > 0 && (
              <span className="ml-1.5 rounded-full bg-destructive/10 text-destructive px-1.5 text-xs">
                {issueCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inputs" className="mt-6">
          <AdminModelInputs model={payload.input} />
        </TabsContent>
        <TabsContent value="outputs" className="mt-6">
          <AdminModelOutputs outputs={payload.outputs} model={payload.input} />
        </TabsContent>
        <TabsContent value="errors" className="mt-6">
          <AdminModelErrors issueRows={payload.issue_rows} validation={payload.validation} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
