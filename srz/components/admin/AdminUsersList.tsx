import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_USERS, adminUserDelete, apiFetch, apiJson } from '@/lib/api';
import { useAdminWorkspace } from '@/components/admin/AdminWorkspaceContext';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronRight, Users } from 'lucide-react';
import { toast } from 'sonner';

export interface AdminUserRow {
  id: number;
  email: string;
  name: string;
  organization_name: string;
  role: string;
  user_level: number;
  is_active?: boolean;
  is_org_owner?: boolean;
  model_count: number;
  created_at: string;
}

export function AdminUsersList() {
  const navigate = useNavigate();
  const { setContextTitle, setContextSubtitle, setTitleLink } = useAdminWorkspace();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<AdminUserRow | null>(null);
  const [acting, setActing] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await apiJson<AdminUserRow[]>(ADMIN_USERS);
      setUsers(rows);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setContextTitle('Users');
    setContextSubtitle(null);
    setTitleLink(null);
    document.title = 'TF Admin — Users';
  }, [setContextTitle, setContextSubtitle, setTitleLink]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const confirmDelete = async () => {
    if (!pending) return;
    setActing(true);
    try {
      const res = await apiFetch(adminUserDelete(pending.id), { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || 'Delete failed');
      }
      toast.success('User deleted permanently');
      setPending(null);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setActing(false);
    }
  };

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
          {users.map((u) => {
            const isOwner = Boolean(u.is_org_owner);
            return (
              <Card key={u.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => navigate(`/TF-admin/users/${u.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && navigate(`/TF-admin/users/${u.id}`)}
                    >
                      <CardTitle className="text-base truncate flex items-center gap-2 flex-wrap">
                        {u.name || u.email}
                        {u.role && (
                          <Badge variant="outline" className="text-xs font-normal">
                            {u.role}
                          </Badge>
                        )}
                        {u.is_active === false && <Badge variant="destructive">Frozen</Badge>}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{u.email}</p>
                      {u.organization_name && (
                        <p className="text-xs text-slate-500 mt-1">{u.organization_name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <Badge variant="outline">{u.model_count} models</Badge>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isOwner}
                        title={
                          isOwner
                            ? 'Delete the organization to remove the owner'
                            : undefined
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          setPending(u);
                        }}
                      >
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/TF-admin/users/${u.id}`)}
                      >
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              {pending
                ? `Permanently delete ${pending.email} and their account, models, and related data. This cannot be undone.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={acting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={acting}
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {acting ? 'Working…' : 'Delete permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
