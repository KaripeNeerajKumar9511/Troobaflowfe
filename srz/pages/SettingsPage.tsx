import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// Interface level disabled.
// import { useUserLevelStore, type UserLevel } from '@/hooks/useUserLevel';
import { usePageTitle } from '@/hooks/usePageTitle';
import { apiFetch, apiJson, PROFILE_ORGS, PROFILE_SET_ACTIVE_ORG } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Building2,
  KeyRound,
  UserCircle,
  UserPlus,
  Users,
} from 'lucide-react';
import { UserProfileDropdown } from '@/components/UserProfileDropdown';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import troobaLogoDark from '@/assets/trooba-logo-dark.svg';

interface TeamMember {
  user_id?: number | string;
  id?: string;
  email: string;
  full_name: string | null;
  role: string | null;
  user_level: number;
}

type OrgOption = { id: string; name: string };

// Interface level disabled — selector removed from Settings.
// const USER_LEVELS: { value: UserLevel; label: string; description: string }[] = [
//   { value: 'novice', label: 'Novice', description: 'Simplified UI — core features only' },
//   { value: 'standard', label: 'Standard', description: 'Balanced view — most features visible' },
//   { value: 'advanced', label: 'Advanced', description: 'Full view — all parameters and tools' },
// ];

function memberInitial(member: TeamMember): string {
  const name = member.full_name?.trim();
  if (name) return name.charAt(0).toUpperCase();
  return (member.email?.charAt(0) || '?').toUpperCase();
}

function roleLabel(role: string | null): string {
  if (role === 'org_owner') return 'Owner';
  if (role === 'member') return 'Member';
  return role || 'Member';
}

export default function SettingsPage() {
  usePageTitle('Settings');
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgId, setOrgId] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [orgOptions, setOrgOptions] = useState<OrgOption[]>([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userRole, setUserRole] = useState('analyst');
  const [savingName, setSavingName] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [inviting, setInviting] = useState(false);

  const mustChangePassword = Boolean(user?.must_change_password);
  const isOrgOwner = userRole === 'org_owner';
  const canManageOrg = isOrgOwner && !mustChangePassword;

  const displayInitial = useMemo(() => {
    const n = fullName.trim() || user?.name?.trim() || user?.email || '';
    return n.charAt(0).toUpperCase() || '?';
  }, [fullName, user]);

  const reloadMembers = async () => {
    const r = await apiFetch('/api/organizations/members/', { method: 'GET' });
    const team = r.ok ? await r.json() : [];
    setMembers(Array.isArray(team) ? team : []);
  };

  useEffect(() => {
    if (!user) return;
    setFullName(user.name || '');
    setUserRole(user.role || 'analyst');
    setOrgId(user.organization_id || '');
    setOrgName(user.organization_name || '');
    if (mustChangePassword) return;
    if (user.organization_id) {
      void reloadMembers().catch(() => setMembers([]));
    }
    apiJson<OrgOption[]>(PROFILE_ORGS)
      .then((d) => setOrgOptions(Array.isArray(d) ? d : []))
      .catch(() => setOrgOptions([]));
  }, [user, mustChangePassword]);

  const handleSaveName = async () => {
    if (!user) return;
    setSavingName(true);
    try {
      const res = await apiFetch('/api/profile/patch/', {
        method: 'PATCH',
        body: JSON.stringify({ full_name: fullName }),
      });
      if (!res.ok) throw new Error('Could not update name');
      await refreshProfile();
      toast.success('Name updated');
    } catch {
      toast.error('Could not update name');
    } finally {
      setSavingName(false);
    }
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
    setChangingPassword(true);
    try {
      const res = await apiFetch('/api/profile/password/', {
        method: 'POST',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const j = await res.json().catch(() => ({} as { error?: string }));
      if (!res.ok) throw new Error(j.error || 'Could not change password');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed');
      await refreshProfile();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleInvite = async () => {
    const email = inviteEmail.trim();
    if (!email) return;
    setInviting(true);
    try {
      const r = await apiFetch('/api/organizations/invites/', {
        method: 'POST',
        body: JSON.stringify({
          email,
          // Fallback when PUBLIC_APP_URL is unset in backend/.env (local dev only).
          invite_url_base: window.location.origin + '/accept-invite',
        }),
      });
      const t = await r.text();
      let body: {
        error?: string;
        detail?: string;
        email_sent?: boolean;
        email_error?: string;
        invite_url?: string;
      } = {};
      try {
        body = JSON.parse(t);
      } catch {
        body = {};
      }
      if (!r.ok) {
        throw new Error(body?.error || body?.detail || body?.email_error || t || 'Invite failed');
      }
      if (body.email_sent === false) {
        const link = body.invite_url || '';
        toast.warning(
          link
            ? `Invite saved but email failed. Share this link: ${link}`
            : `Invite saved but email could not be sent${body.email_error ? `: ${body.email_error}` : ''}`,
          { duration: 12000 },
        );
      } else {
        toast.success('Invitation sent');
      }
      setInviteEmail('');
      await reloadMembers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invite failed');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    if (!member.user_id) return;
    try {
      const r = await apiFetch('/api/organizations/members/remove/', {
        method: 'POST',
        body: JSON.stringify({ user_id: member.user_id }),
      });
      if (!r.ok) throw new Error(await r.text());
      toast.success('Member removed');
      await reloadMembers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Remove failed');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-[rgba(255,255,255,0.08)] bg-sidebar">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <img src={troobaLogoDark} alt="Trooba Flow" style={{ height: '34px', width: 'auto' }} />
              <p className="subbrand-line mt-1.5 text-[11px] tracking-[0.18em]">Flow Intelligence</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/library')}
                className="text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Library
              </Button>
              <UserProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your profile, security, and organization preferences
          </p>
        </div>

        {mustChangePassword && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3 items-start">
            <KeyRound className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Password change required</p>
              <p className="text-sm text-amber-800/90 mt-0.5">
                Set a new password below before you can access models and organization settings.
              </p>
            </div>
          </div>
        )}

        <Card className="mb-6 border-border/70 shadow-sm overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <span className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-semibold shrink-0">
                {displayInitial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-medium truncate">{fullName || user?.email}</p>
                <p className="text-sm text-muted-foreground font-mono truncate">{user?.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userRole && (
                    <Badge variant="outline" className="text-xs font-normal capitalize">
                      {roleLabel(userRole)}
                    </Badge>
                  )}
                  {orgName && (
                    <Badge variant="outline" className="text-xs font-normal gap-1">
                      <Building2 className="h-3 w-3" />
                      {orgName}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border rounded-none">
            <TabsTrigger value="profile" className="rounded-none mb-[-1px]">
              <UserCircle className="h-4 w-4 mr-1.5" />
              Profile
            </TabsTrigger>
            {canManageOrg && (
              <TabsTrigger value="organization" className="rounded-none mb-[-1px]">
                <Building2 className="h-4 w-4 mr-1.5" />
                Organization
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="mt-0 space-y-6 focus-visible:outline-none">
            <Card className="border-border/70 shadow-sm max-w-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-primary" />
                  Personal information
                </CardTitle>
                <CardDescription>Update how your name appears across Trooba Flow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="h-10 bg-muted/50 text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">Email is managed by your administrator.</p>
                </div>
                <div className="pt-1">
                  <Button
                    size="sm"
                    onClick={handleSaveName}
                    disabled={savingName || !fullName.trim()}
                  >
                    {savingName ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Interface level card disabled — see useUserLevel.ts */}
            {/*
            <Card className="border-border/70 shadow-sm">
              ...
            </Card>
            */}

            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary" />
                  Security
                </CardTitle>
                <CardDescription>Change your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-3xl">
                  <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                    <Label htmlFor="current-password">Current password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoComplete="current-password"
                      className="h-10 max-w-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="h-10"
                    />
                  </div>
                </div>
                <Separator className="my-5" />
                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !newPassword || !currentPassword}
                >
                  {changingPassword ? 'Updating…' : 'Update password'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {canManageOrg && (
            <TabsContent value="organization" className="mt-0 space-y-6 focus-visible:outline-none">
              <Card className="border-border/70 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Organization
                  </CardTitle>
                  <CardDescription>Your workspace and active organization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2 max-w-md">
                    <Label>Organization name</Label>
                    <Input value={orgName} disabled className="h-10 bg-muted/50" />
                    <p className="text-xs text-muted-foreground">
                      Contact support to rename your organization.
                    </p>
                  </div>
                  {orgOptions.length > 1 && (
                    <div className="space-y-2 max-w-md">
                      <Label>Active organization</Label>
                      <Select
                        value={orgId || ''}
                        onValueChange={async (v) => {
                          await apiFetch(PROFILE_SET_ACTIVE_ORG, {
                            method: 'POST',
                            body: JSON.stringify({ organization_id: v }),
                          });
                          await refreshProfile();
                          toast.success('Organization switched');
                        }}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                        <SelectContent>
                          {orgOptions.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {o.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Team members
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {members.length} {members.length === 1 ? 'member' : 'members'} in your organization
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {members.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border py-10 text-center">
                      <Users className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">No team members yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Invite someone using the form below</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {members.map((m) => (
                        <div
                          key={String(m.user_id ?? m.id ?? m.email)}
                          className="flex items-center justify-between gap-4 rounded-lg border border-border/70 px-4 py-3 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                              {memberInitial(m)}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{m.full_name || m.email}</p>
                              <p className="text-xs text-muted-foreground font-mono truncate">{m.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-xs font-normal hidden sm:inline-flex">
                              {roleLabel(m.role)}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive"
                              disabled={!m.user_id || m.role === 'org_owner'}
                              onClick={() => handleRemoveMember(m)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Separator />

                  <div>
                    <Label htmlFor="invite-email" className="text-sm font-medium">
                      Invite a team member
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                      They will receive an email with a link to join your organization.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="h-10"
                      />
                      <Button
                        className="shrink-0 gap-1.5"
                        disabled={!inviteEmail.trim() || inviting}
                        onClick={handleInvite}
                      >
                        <UserPlus className="h-4 w-4" />
                        {inviting ? 'Sending…' : 'Send invite'}
                      </Button>
                    </div>
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
