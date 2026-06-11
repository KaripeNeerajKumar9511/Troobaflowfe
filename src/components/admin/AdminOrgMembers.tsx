import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  adminOrgMembers,
  adminOrgMemberCreate,
  adminOrgDelete,
  adminOrgDeactivate,
  adminOrgActivate,
  adminOrgMemberDelete,
  adminOrgMemberDeactivate,
  adminOrgMemberActivate,
  apiJson,
  apiFetch,
} from '@/lib/api';
import { useAdminWorkspace } from '@/components/admin/AdminWorkspaceContext';
import type { AdminUserRow } from '@/components/admin/AdminUsersList';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { ChevronRight, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';

interface OrgSummary {
  id: string;
  name: string;
  organization_code: string;
  owner_email?: string;
  owner_id?: number | null;
  member_count?: number;
  is_frozen?: boolean;
  status?: number;
}

interface MembersResponse {
  organization: OrgSummary;
  members: AdminUserRow[];
}

type PendingAction =
  | { kind: 'deactivate-org' }
  | { kind: 'activate-org' }
  | { kind: 'delete-org' }
  | { kind: 'deactivate-member'; member: AdminUserRow }
  | { kind: 'activate-member'; member: AdminUserRow }
  | { kind: 'delete-member'; member: AdminUserRow };

export function AdminOrgMembers() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { setContextTitle, setContextSubtitle, setTitleLink } = useAdminWorkspace();
  const [data, setData] = useState<MembersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [acting, setActing] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const reload = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await apiJson<MembersResponse>(adminOrgMembers(orgId));
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [orgId]);

  useEffect(() => {
    if (data?.organization) {
      setContextTitle(data.organization.name);
      setContextSubtitle(`${data.members.length} members`);
      setTitleLink('/TF-admin/organizations');
      document.title = `TF Admin — ${data.organization.name}`;
    }
    return () => setTitleLink(null);
  }, [data, setContextTitle, setContextSubtitle, setTitleLink]);

  const canCreate = useMemo(() => {
    return memberName.trim() && memberEmail.trim() && tempPassword.trim().length >= 8;
  }, [memberName, memberEmail, tempPassword]);

  const createMember = async () => {
    if (!orgId || !canCreate) return;
    try {
      const res = await apiFetch(adminOrgMemberCreate(orgId), {
        method: 'POST',
        body: JSON.stringify({
          member_name: memberName.trim(),
          member_email: memberEmail.trim().toLowerCase(),
          temporary_password: tempPassword,
          login_url: window.location.origin + '/login',
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Create member failed');
      }
      toast.success('Member created');
      setOpen(false);
      setMemberName('');
      setMemberEmail('');
      setTempPassword('');
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Create member failed');
    }
  };

  const confirmAction = async () => {
    if (!orgId || !pending) return;
    setActing(true);
    try {
      if (pending.kind === 'delete-org') {
        const res = await apiFetch(adminOrgDelete(orgId), { method: 'DELETE' });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error((j as { error?: string }).error || 'Delete failed');
        }
        toast.success('Organization deleted permanently');
        navigate('/TF-admin/organizations');
        return;
      }
      if (pending.kind === 'deactivate-org') {
        await apiJson(adminOrgDeactivate(orgId), { method: 'POST', body: '{}' });
        toast.success('Organization deactivated');
      } else if (pending.kind === 'activate-org') {
        await apiJson(adminOrgActivate(orgId), { method: 'POST', body: '{}' });
        toast.success('Organization activated');
      } else if (pending.kind === 'delete-member') {
        const res = await apiFetch(adminOrgMemberDelete(orgId, pending.member.id), { method: 'DELETE' });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error((j as { error?: string }).error || 'Delete failed');
        }
        toast.success('Member deleted permanently');
      } else if (pending.kind === 'deactivate-member') {
        await apiJson(adminOrgMemberDeactivate(orgId, pending.member.id), { method: 'POST', body: '{}' });
        toast.success('Member deactivated');
      } else if (pending.kind === 'activate-member') {
        await apiJson(adminOrgMemberActivate(orgId, pending.member.id), { method: 'POST', body: '{}' });
        toast.success('Member activated');
      }
      setPending(null);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActing(false);
    }
  };

  const memberPath = (userId: number) =>
    `/TF-admin/organizations/${orgId}/members/${userId}`;

  const orgFrozen = Boolean(data?.organization?.is_frozen || data?.organization?.status === 0);

  const dialogCopy = () => {
    if (!pending || !data) return { title: '', description: '' };
    const orgName = data.organization.name;
    switch (pending.kind) {
      case 'delete-org':
        return {
          title: 'Delete organization permanently?',
          description: `This will permanently delete ${orgName}, all members, models, and related data. This cannot be undone.`,
        };
      case 'deactivate-org':
        return {
          title: 'Deactivate organization?',
          description: `Members will see "Your account has been frozen. Please contact support." when signing in. Data is kept but access is blocked.`,
        };
      case 'activate-org':
        return {
          title: 'Activate organization?',
          description: `Restore sign-in and API access for all members of ${orgName}.`,
        };
      case 'delete-member':
        return {
          title: 'Delete member permanently?',
          description: `Permanently delete ${pending.member.email} and their account from the database. This cannot be undone.`,
        };
      case 'deactivate-member':
        return {
          title: 'Deactivate member?',
          description: `${pending.member.email} will be frozen and cannot sign in or access data. Their records are kept.`,
        };
      case 'activate-member':
        return {
          title: 'Activate member?',
          description: `Restore access for ${pending.member.email}.`,
        };
      default:
        return { title: '', description: '' };
    }
  };

  const { title: dialogTitle, description: dialogDescription } = dialogCopy();
  const isDelete = pending?.kind === 'delete-org' || pending?.kind === 'delete-member';

  if (loading) {
    return (
      <div className="p-6 max-w-5xl space-y-4 animate-fade-in">
        <div className="h-8 w-48 bg-slate-200/80 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-slate-200/60 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 text-sm text-muted-foreground">Organization not found.</div>;
  }

  const { organization, members } = data;

  return (
    <div className="p-6 max-w-5xl animate-fade-in space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <button
            type="button"
            onClick={() => navigate('/TF-admin/organizations')}
            className="text-xl font-bold text-left hover:text-primary transition-colors"
          >
            {organization.name}
          </button>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
            <span>
              {organization.organization_code}
              {organization.owner_email && ` · Owner: ${organization.owner_email}`}
            </span>
            {orgFrozen ? (
              <Badge variant="destructive">Frozen</Badge>
            ) : (
              <Badge variant="secondary">Active</Badge>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {orgFrozen ? (
            <Button variant="secondary" onClick={() => setPending({ kind: 'activate-org' })}>
              Activate Org
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setPending({ kind: 'deactivate-org' })}>
              Deactivate Org
            </Button>
          )}
          <Button variant="destructive" onClick={() => setPending({ kind: 'delete-org' })}>
            Delete Org
          </Button>
          <Button onClick={() => setOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Create Member
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Members</h2>
        <Badge variant="secondary">{members.length}</Badge>
      </div>

      {members.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-normal text-muted-foreground">
              No members in this organization yet.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((m) => {
            const isOwner = organization.owner_id === m.id;
            const memberFrozen = !m.is_active;
            return (
              <Card key={m.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => navigate(memberPath(m.id))}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && navigate(memberPath(m.id))}
                    >
                      <CardTitle className="text-base truncate flex items-center gap-2 flex-wrap">
                        {m.name || m.email}
                        <Badge variant="outline" className="text-xs font-normal">
                          {m.role}
                        </Badge>
                        {memberFrozen && <Badge variant="destructive">Frozen</Badge>}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{m.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <Badge variant="outline">{m.model_count} models</Badge>
                      {memberFrozen ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={orgFrozen}
                          onClick={() => setPending({ kind: 'activate-member', member: m })}
                        >
                          Activate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setPending({ kind: 'deactivate-member', member: m })}
                        >
                          Deactivate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isOwner}
                        title={isOwner ? 'Delete the organization to remove the owner' : undefined}
                        onClick={() => setPending({ kind: 'delete-member', member: m })}
                      >
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(memberPath(m.id))}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Member — {organization.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Member name</Label>
              <Input
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="John Smith"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="member@company.com"
              />
            </div>
            <div>
              <Label>Temporary password</Label>
              <Input
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="Min 8 characters"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={createMember} disabled={!canCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={acting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={acting}
              onClick={(e) => {
                e.preventDefault();
                void confirmAction();
              }}
              className={isDelete ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {acting ? 'Working…' : isDelete ? 'Delete permanently' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
