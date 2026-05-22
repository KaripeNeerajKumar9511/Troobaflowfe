import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_STATS, apiJson } from '@/lib/api';
import { useAdminWorkspace } from '@/components/admin/AdminWorkspaceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Database, ArrowRight } from 'lucide-react';

interface AdminStats {
  total_users: number;
  total_models: number;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { setContextTitle, setContextSubtitle, setTitleLink } = useAdminWorkspace();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setContextTitle('Dashboard');
    setContextSubtitle(null);
    setTitleLink(null);
    document.title = 'TF Admin — Dashboard';
  }, [setContextTitle, setContextSubtitle, setTitleLink]);

  useEffect(() => {
    apiJson<AdminStats>(ADMIN_STATS)
      .then(setStats)
      .catch(() => setStats({ total_users: 0, total_models: 0 }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl animate-fade-in">
      <h1 className="text-xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">Platform overview and quick access to users.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          className="cursor-pointer transition-shadow hover:shadow-md border-primary/20"
          onClick={() => navigate('/TF-admin/users')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/TF-admin/users')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{loading ? '—' : stats?.total_users ?? 0}</p>
            <CardDescription className="mt-2 flex items-center gap-1">
              View all users
              <ArrowRight className="h-3.5 w-3.5" />
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Total Models</CardTitle>
            <Database className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{loading ? '—' : stats?.total_models ?? 0}</p>
            <CardDescription className="mt-2">Across all user workspaces</CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
