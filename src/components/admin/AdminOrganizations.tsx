import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ADMIN_ORGS,
  ADMIN_ORG_CREATE,
  adminOrgActivate,
  adminOrgDeactivate,
  adminOrgDelete,
  apiJson,
  apiFetch,
} from '@/lib/api';
import { useAdminWorkspace } from '@/components/admin/AdminWorkspaceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

type OrgRow = {
  id: string;
  name: string;
  organization_code: string;
  slug: string;
  status: number;
  is_frozen?: boolean;
  owner_id: number | null;
  owner_email?: string;
  member_count?: number;
  created_by_admin_email?: string | null;
  created_at?: string;
};

type PendingAction =
  | { kind: 'deactivate'; org: OrgRow }
  | { kind: 'activate'; org: OrgRow }
  | { kind: 'delete'; org: OrgRow };

export function AdminOrganizations() {
  const navigate = useNavigate();
  const { setContextTitle, setContextSubtitle, setTitleLink } = useAdminWorkspace();
  const [rows, setRows] = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [acting, setActing] = useState(false);

  const [orgName, setOrgName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  useEffect(() => {
    setContextTitle('Organizations');
    setContextSubtitle('Create and manage organizations');
    setTitleLink(null);
    document.title = 'TF Admin — Organizations';
  }, [setContextTitle, setContextSubtitle, setTitleLink]);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await apiJson<OrgRow[]>(ADMIN_ORGS);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const canCreate = useMemo(() => {
    return orgName.trim() && ownerName.trim() && ownerEmail.trim() && tempPassword.trim().length >= 8;
  }, [orgName, ownerName, ownerEmail, tempPassword]);

  const createOrg = async () => {
    if (!canCreate) return;
    try {
      const res = await apiFetch(ADMIN_ORG_CREATE, {
        method: 'POST',
        body: JSON.stringify({
          organization_name: orgName.trim(),
          owner_name: ownerName.trim(),
          owner_email: ownerEmail.trim().toLowerCase(),
          temporary_password: tempPassword,
          login_url: window.location.origin + '/login',
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Create organization failed');
      }
      toast.success('Organization created');
      setOpen(false);
      setOrgName('');
      setOwnerName('');
      setOwnerEmail('');
      setTempPassword('');
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Create organization failed');
    }
  };

  const confirmAction = async () => {
    if (!pending) return;
    setActing(true);
    try {
      const { org, kind } = pending;
      if (kind === 'delete') {
        const res = await apiFetch(adminOrgDelete(org.id), { method: 'DELETE' });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error((j as { error?: string }).error || 'Delete failed');
        }
        toast.success('Organization deleted permanently');
      } else if (kind === 'deactivate') {
        await apiJson(adminOrgDeactivate(org.id), { method: 'POST', body: '{}' });
        toast.success('Organization deactivated — members cannot sign in');
      } else {
        await apiJson(adminOrgActivate(org.id), { method: 'POST', body: '{}' });
        toast.success('Organization activated');
      }
      setPending(null);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActing(false);
    }
  };

  const statusBadge = (org: OrgRow) => {
    if (org.is_frozen || org.status === 0) {
      return <Badge variant="destructive">Frozen</Badge>;
    }
    return <Badge variant="secondary">Active</Badge>;
  };

  return (
    <div className="p-6 max-w-6xl animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold mb-1">Organizations</h1>
          <p className="text-sm text-muted-foreground">Manage organization workspaces and owners.</p>
        </div>
        <Button onClick={() => setOpen(true)}>Create Organization</Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">All Organizations</CardTitle>
          <CardDescription>{loading ? 'Loading…' : `${rows.length} organizations`}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell
                    className="font-medium cursor-pointer hover:text-primary"
                    onClick={() => navigate(`/TF-admin/organizations/${r.id}/members`)}
                  >
                    {r.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{r.organization_code}</TableCell>
                  <TableCell className="text-xs">{r.owner_email || '—'}</TableCell>
                  <TableCell className="text-xs">{r.member_count ?? '—'}</TableCell>
                  <TableCell>{statusBadge(r)}</TableCell>
                  <TableCell className="text-xs">{r.created_at || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/TF-admin/organizations/${r.id}/members`)}
                      >
                        Open
                      </Button>
                      {r.is_frozen || r.status === 0 ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setPending({ kind: 'activate', org: r })}
                        >
                          Activate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setPending({ kind: 'deactivate', org: r })}
                        >
                          Deactivate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setPending({ kind: 'delete', org: r })}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">
                    No organizations yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Organization name</Label>
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Acme Inc" />
            </div>
            <div>
              <Label>Owner name</Label>
              <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <Label>Owner email</Label>
              <Input value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="owner@acme.com" />
            </div>
            <div>
              <Label>Temporary password</Label>
              <Input value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} placeholder="Min 8 characters" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={createOrg} disabled={!canCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.kind === 'delete' && 'Delete organization permanently?'}
              {pending?.kind === 'deactivate' && 'Deactivate organization?'}
              {pending?.kind === 'activate' && 'Activate organization?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.kind === 'delete' && (
                <>
                  This will permanently delete <strong>{pending.org.name}</strong>, all members, models, and related
                  data from the database. This cannot be undone.
                </>
              )}
              {pending?.kind === 'deactivate' && (
                <>
                  Members of <strong>{pending?.org.name}</strong> will see &quot;Your account has been frozen. Please
                  contact support.&quot; when they try to sign in. All data is kept, but login and API access are blocked.
                </>
              )}
              {pending?.kind === 'activate' && (
                <>
                  Restore access for all members of <strong>{pending?.org.name}</strong>.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={acting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={acting}
              onClick={(e) => {
                e.preventDefault();
                void confirmAction();
              }}
              className={pending?.kind === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {acting ? 'Working…' : pending?.kind === 'delete' ? 'Delete permanently' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
