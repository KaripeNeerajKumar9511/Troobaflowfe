import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_USERS, apiJson } from '@/lib/api';
import { useAdminWorkspace } from '@/components/admin/AdminWorkspaceContext';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Users } from 'lucide-react';

export interface AdminUserRow {
  id: number;
  email: string;
  name: string;
  organization_name: string;
  role: string;
  user_level: number;
  model_count: number;
  created_at: string;
}

export function AdminUsersList() {
  const navigate = useNavigate();
  const { setContextTitle, setContextSubtitle, setTitleLink } = useAdminWorkspace();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setContextTitle('Users');
    setContextSubtitle(null);
    setTitleLink(null);
    document.title = 'TF Admin — Users';
  }, [setContextTitle, setContextSubtitle, setTitleLink]);

  useEffect(() => {
    apiJson<AdminUserRow[]>(ADMIN_USERS)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl animate-fade-in">
      <div className="mb-6 flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Users</h1>
        {!loading && <Badge variant="secondary">{users.length}</Badge>}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-slate-200/60 animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-normal text-muted-foreground">No users found</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <Card
              key={u.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/TF-admin/users/${u.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/TF-admin/users/${u.id}`)}
            >
              <CardHeader className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{u.name || u.email}</CardTitle>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{u.email}</p>
                    {u.organization_name && (
                      <p className="text-xs text-slate-500 mt-1">{u.organization_name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="outline">{u.model_count} models</Badge>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
