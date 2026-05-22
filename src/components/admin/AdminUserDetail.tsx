import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminUserDetail, apiJson } from '@/lib/api';
import { useAdminWorkspace } from '@/components/admin/AdminWorkspaceContext';
import type { AdminUserRow } from '@/components/admin/AdminUsersList';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Package, Star } from 'lucide-react';

interface ModelSummary {
  id: string;
  name: string;
  description: string;
  run_status: string;
  updated_at: string;
  last_run_at: string | null;
  is_archived: boolean;
  is_starred: boolean;
}

interface UserDetailResponse {
  user: AdminUserRow;
  models: ModelSummary[];
}

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; className: string }> = {
    never_run: { label: 'Never Run', className: 'bg-muted/20 text-muted-foreground' },
    current: { label: 'Current', className: 'bg-success/15 text-success border-success/30' },
    needs_recalc: { label: 'Recalc Needed', className: 'bg-warning/15 text-warning border-warning/30' },
  };
  const c = map[status] || map.never_run;
  return <Badge variant="outline" className={`text-xs ${c.className}`}>{c.label}</Badge>;
};

export function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { setContextTitle, setContextSubtitle, setTitleLink } = useAdminWorkspace();
  const [data, setData] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    document.title = 'TF Admin — User';
    setLoading(true);
    apiJson<UserDetailResponse>(adminUserDetail(userId))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (data?.user) {
      setContextTitle(data.user.name || data.user.email);
      setContextSubtitle(data.user.email);
      setTitleLink('/TF-admin/users');
    }
    return () => setTitleLink(null);
  }, [data, setContextTitle, setContextSubtitle, setTitleLink]);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl space-y-4 animate-fade-in">
        <div className="h-8 w-48 bg-slate-200/80 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-200/60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-sm text-muted-foreground">User not found.</div>
    );
  }

  const { user, models } = data;

  return (
    <div className="p-6 max-w-5xl animate-fade-in">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/TF-admin/users')}
          className="text-xl font-bold text-left hover:text-primary transition-colors"
          title="Back to users"
        >
          {user.name || user.email}
        </button>
        <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {user.organization_name && <Badge variant="secondary">{user.organization_name}</Badge>}
          <Badge variant="outline">Level {user.user_level}</Badge>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Models</h2>
        <Badge variant="secondary">{models.length}</Badge>
      </div>

      {models.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground font-normal">No models for this user</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((m) => (
            <Card
              key={m.id}
              className="cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => navigate(`/TF-admin/users/${userId}/models/${m.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/TF-admin/users/${userId}/models/${m.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate flex items-center gap-1">
                      {m.is_starred && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                      {m.name}
                    </CardTitle>
                    {m.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.description}</p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary shrink-0" />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {statusBadge(m.run_status)}
                  {m.is_archived && <Badge variant="outline">Archived</Badge>}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
