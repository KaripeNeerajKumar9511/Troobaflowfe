import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminOrgPasswords, adminUserPassword, apiJson, apiFetch } from '@/lib/api';
import { useAdminWorkspace } from '@/components/admin/AdminWorkspaceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, EyeOff, KeyRound, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface OrgSummary {
  id: string;
  name: string;
  organization_code: string;
}

interface PasswordRow {
  user_id: number;
  email: string;
  name: string;
  role: string;
  password: string | null;
  has_stored_password: boolean;
  must_change_password: boolean;
  password_changed: boolean;
}

interface PasswordsResponse {
  organization: OrgSummary;
  passwords: PasswordRow[];
}

export function AdminOrgPasswords() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { setContextTitle, setContextSubtitle, setTitleLink } = useAdminWorkspace();
  const [rows, setRows] = useState<PasswordRow[]>([]);
  const [organization, setOrganization] = useState<OrgSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleIds, setVisibleIds] = useState<Set<number>>(new Set());

  const [changeOpen, setChangeOpen] = useState(false);
  const [changeTarget, setChangeTarget] = useState<PasswordRow | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [changing, setChanging] = useState(false);

  const reload = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await apiJson<PasswordsResponse>(adminOrgPasswords(orgId));
      setOrganization(res.organization);
      setRows(res.passwords ?? []);
    } catch {
      setOrganization(null);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (organization) {
      setContextTitle(organization.name);
      setContextSubtitle('Member passwords');
      setTitleLink('/TF-admin/passwords');
      document.title = `TF Admin — Passwords — ${organization.name}`;
    }
    return () => setTitleLink(null);
  }, [organization, setContextTitle, setContextSubtitle, setTitleLink]);

  const getPassword = (row: PasswordRow) => row.password ?? null;

  const toggleVisibility = (row: PasswordRow) => {
    const pwd = getPassword(row);
    if (!pwd) {
      toast.info('No stored password for this user. Use Change to set a new one.');
      return;
    }
    setVisibleIds((prev) => {
      const next = new Set(prev);
      if (next.has(row.user_id)) next.delete(row.user_id);
      else next.add(row.user_id);
      return next;
    });
  };

  const openChangeDialog = (row: PasswordRow) => {
    setChangeTarget(row);
    setNewPassword('');
    setChangeOpen(true);
  };

  const canSavePassword = useMemo(() => newPassword.trim().length >= 8, [newPassword]);

  const savePassword = async () => {
    if (!changeTarget || !canSavePassword) return;
    setChanging(true);
    try {
      const res = await apiFetch(adminUserPassword(changeTarget.user_id), {
        method: 'POST',
        body: JSON.stringify({
          new_password: newPassword,
          must_change_password: true,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Failed to update password');
      }
      toast.success(`Password updated for ${changeTarget.email}`);
      setRows((prev) =>
        prev.map((r) =>
          r.user_id === changeTarget.user_id
            ? {
                ...r,
                password: newPassword,
                has_stored_password: true,
                must_change_password: true,
                password_changed: false,
              }
            : r,
        ),
      );
      setVisibleIds((prev) => new Set(prev).add(changeTarget.user_id));
      setChangeOpen(false);
      setChangeTarget(null);
      setNewPassword('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update password');
    } finally {
      setChanging(false);
    }
  };

  const displayPassword = (row: PasswordRow) => {
    const pwd = getPassword(row);
    if (!pwd) return '—';
    return visibleIds.has(row.user_id) ? pwd : '••••••••';
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl animate-fade-in">
        <div className="h-8 w-64 bg-slate-200/80 rounded animate-pulse mb-4" />
        <div className="h-48 bg-white border rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!organization) {
    return <div className="p-6 text-sm text-muted-foreground">Organization not found.</div>;
  }

  return (
    <div className="p-6 max-w-5xl animate-fade-in space-y-4">
      <div>
        <button
          type="button"
          onClick={() => navigate('/TF-admin/passwords')}
          className="text-xl font-bold text-left hover:text-primary transition-colors flex items-center gap-2"
        >
          <KeyRound className="h-5 w-5" />
          {organization.name}
        </button>
        <p className="text-sm text-muted-foreground mt-1 font-mono">{organization.organization_code}</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Member Credentials</CardTitle>
          <CardDescription>
            Click the eye icon to reveal a stored password, or use Change to set a new one.
            Older accounts may not have a stored password until you set one.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const isVisible = visibleIds.has(row.user_id);
                const hasPwd = Boolean(getPassword(row));
                return (
                  <TableRow key={row.user_id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-sm">{row.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{row.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-mono text-sm">
                        <span>{displayPassword(row)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          title={isVisible ? 'Hide password' : 'Show password'}
                          disabled={!hasPwd}
                          onClick={() => toggleVisibility(row)}
                        >
                          {isVisible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className={`h-4 w-4 ${!hasPwd ? 'opacity-40' : ''}`} />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {row.has_stored_password ? (
                        row.must_change_password ? (
                          <Badge variant="secondary" className="text-xs">Must change on login</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Stored</Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Changed by user
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5"
                        onClick={() => openChangeDialog(row)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Change
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10">
                    No members in this organization.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={changeOpen} onOpenChange={setChangeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
          </DialogHeader>
          {changeTarget && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Set a new password for <strong>{changeTarget.name}</strong> ({changeTarget.email}).
                The user will be required to change it on next login.
              </p>
              <div>
                <Label htmlFor="admin-new-password">New password</Label>
                <Input
                  id="admin-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeOpen(false)} disabled={changing}>
              Cancel
            </Button>
            <Button onClick={savePassword} disabled={!canSavePassword || changing}>
              {changing ? 'Saving…' : 'Save password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
