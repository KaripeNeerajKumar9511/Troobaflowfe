import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserLevelStore, type UserLevel } from '@/hooks/useUserLevel';
import { usePageTitle } from '@/hooks/usePageTitle';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Save, UserCircle, Building2, Trash2, Plus, Mail, LogOut } from 'lucide-react';
import { UserLevelChip } from '@/components/UserLevelChip';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  user_level: number;
}

export default function SettingsPage() {
  usePageTitle('Settings');
  const { user, signOut, refreshProfile } = useAuth();
  const { userLevel, setUserLevel } = useUserLevelStore();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgId, setOrgId] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userRole, setUserRole] = useState('analyst');

  useEffect(() => {
    if (!user) return;
    setFullName(user.name || '');
    setUserRole(user.role || 'analyst');
    setOrgId(user.organization_id || '');
    setOrgName(user.organization_name || '');
    if (user.organization_id) {
      fetch('/api/profile/org-members/', { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : []))
        .then((team: TeamMember[]) => setMembers(Array.isArray(team) ? team : []))
        .catch(() => setMembers([]));
    }
  }, [user]);

  const handleSaveName = async () => {
    if (!user) return;
    const res = await apiFetch('/api/profile/patch/', {
      method: 'PATCH',
      body: JSON.stringify({ full_name: fullName }),
    });
    if (!res.ok) {
      toast.error('Could not update name');
      return;
    }
    await refreshProfile();
    toast.success('Name updated');
  };

  const handleChangeLevel = async (level: UserLevel) => {
    await setUserLevel(level);
    toast.success(`User level changed to ${level}`);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (!currentPassword) {
      toast.error('Enter your current password');
      return;
    }
    const res = await apiFetch('/api/profile/password/', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(j.error || 'Could not change password');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Password changed');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your profile and organization</p>
            </div>
            <div className="flex gap-2 items-center">
              <UserLevelChip />
              <Button variant="outline" size="sm" onClick={() => navigate('/library')}>← Back to Library</Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground gap-1">
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-6">
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile"><UserCircle className="h-4 w-4 mr-1" /> Profile</TabsTrigger>
            {isAdmin && <TabsTrigger value="organization"><Building2 className="h-4 w-4 mr-1" /> Organization</TabsTrigger>}
          </TabsList>

          <TabsContent value="profile" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <div className="flex gap-2">
                    <Input value={fullName} onChange={e => setFullName(e.target.value)} />
                    <Button size="sm" onClick={handleSaveName}><Save className="h-3.5 w-3.5 mr-1" /> Save</Button>
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled className="bg-muted" />
                </div>
                <div>
                  <Label>User Level</Label>
                  <p className="text-xs text-muted-foreground mb-1.5">Controls which features are visible in the interface.</p>
                  <Select value={userLevel} onValueChange={(v) => handleChangeLevel(v as UserLevel)}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novice">Novice — Simplified UI</SelectItem>
                      <SelectItem value="standard">Standard — Most features</SelectItem>
                      <SelectItem value="advanced">Advanced — All features</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Current Password</Label>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
                </div>
                <div>
                  <Label>New Password</Label>
                  <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div>
                  <Label>Confirm New Password</Label>
                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
                <Button size="sm" onClick={handleChangePassword} disabled={!newPassword}>Change Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="organization" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Organization</CardTitle>
                  <CardDescription>Manage your organization settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Organization Name</Label>
                    <Input value={orgName} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground mt-1">Contact support to change your organization name.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Team Members</CardTitle>
                  <CardDescription>{members.length} member(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs">Email</TableHead>
                        <TableHead className="text-xs">Role</TableHead>
                        <TableHead className="text-xs">Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map(m => (
                        <TableRow key={m.id}>
                          <TableCell className="text-sm">{m.full_name || '—'}</TableCell>
                          <TableCell className="text-sm font-mono">{m.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{m.role || 'analyst'}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">{m.user_level ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 flex gap-2">
                    <Input placeholder="Email to invite..." value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="h-8 text-sm" />
                    <Button size="sm" disabled={!inviteEmail.trim()} onClick={() => {
                      toast.info('Team invitations will be available in a future update');
                      setInviteEmail('');
                    }}>
                      <Mail className="h-3.5 w-3.5 mr-1" /> Invite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
