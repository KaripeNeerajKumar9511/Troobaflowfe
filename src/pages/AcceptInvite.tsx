import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch, resolveApiUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import troobaLogoLight from '@/assets/trooba-logo-light.svg';

type InvitePreview = {
  valid: boolean;
  organization_name?: string;
  email?: string;
  expires_at?: string;
  error?: string;
};

export default function AcceptInvite() {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Trooba Flow — Accept Invitation';
    return () => { document.title = 'Trooba Flow'; };
  }, []);

  useEffect(() => {
    if (!token) {
      setPreview({ valid: false, error: 'Missing invite token' });
      setPreviewLoading(false);
      return;
    }
    fetch(`${resolveApiUrl('/api/organizations/invites/preview/')}?token=${encodeURIComponent(token)}`, {
      credentials: 'include',
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setPreview({ valid: false, error: data.error || 'Invalid or expired invite' });
          return;
        }
        setPreview(data as InvitePreview);
      })
      .catch(() => setPreview({ valid: false, error: 'Could not load invitation' }))
      .finally(() => setPreviewLoading(false));
  }, [token]);

  useEffect(() => {
    if (authLoading || previewLoading || !user) return;
    if (preview?.valid) {
      navigate('/library', { replace: true });
    }
  }, [authLoading, previewLoading, user, preview, navigate]);

  const accept = async () => {
    if (!token) {
      toast.error('Missing invite token');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/api/organizations/invites/accept/', {
        method: 'POST',
        body: JSON.stringify({ token, password, name }),
      });
      const body = await res.json().catch(() => ({} as { error?: string; organization_name?: string }));
      if (!res.ok) throw new Error(body.error || 'Invite accept failed');

      await refreshProfile();
      const orgName = body.organization_name || preview?.organization_name;
      toast.success(orgName ? `Welcome to ${orgName}` : 'Welcome to Trooba Flow');
      navigate('/library', { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invite accept failed');
      setLoading(false);
    }
  };

  const invalid = !previewLoading && preview && !preview.valid;
  const alreadyAccepted = invalid && /already accepted/i.test(preview?.error || '');
  const inviteEmail = preview?.email || '';

  if (authLoading || (user && preview?.valid)) {
    return (
      <div className="min-h-screen bg-sidebar flex items-center justify-center p-4" aria-busy="true">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-2">
        <CardHeader className="text-center pb-2">
          <img
            src={troobaLogoLight}
            alt="Trooba Flow"
            className="mx-auto mb-4"
            style={{ height: '48px', width: 'auto' }}
          />
          {previewLoading ? (
            <CardDescription className="flex items-center justify-center gap-2 text-base">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading invitation…
            </CardDescription>
          ) : invalid ? (
            <>
              <CardDescription className="text-base text-destructive">
                {preview?.error || 'This invitation is not valid.'}
              </CardDescription>
              {alreadyAccepted && (
                <Button asChild className="mt-4 w-full h-11" variant="default">
                  <Link
                    to={
                      inviteEmail
                        ? `/login?email=${encodeURIComponent(inviteEmail)}`
                        : '/login'
                    }
                  >
                    Sign in
                  </Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <CardDescription className="text-base">You've been invited to join</CardDescription>
              <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                <Badge variant="secondary" className="gap-1 text-sm font-medium px-3 py-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {preview?.organization_name}
                </Badge>
              </div>
              {preview?.email && (
                <p className="text-sm text-muted-foreground mt-3 font-mono">{preview.email}</p>
              )}
            </>
          )}
        </CardHeader>

        {!previewLoading && !invalid && (
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center -mt-1">
              Set your name and password to join your team. You'll go straight to your model library.
            </p>
            <div className="space-y-2">
              <Label htmlFor="invite-name">Full name</Label>
              <Input
                id="invite-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-password">Password</Label>
              <Input
                id="invite-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-confirm">Confirm password</Label>
              <Input
                id="invite-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className="h-11"
                onKeyDown={(e) => e.key === 'Enter' && !loading && accept()}
              />
            </div>
            <Button className="w-full h-11 text-base" onClick={accept} disabled={loading}>
              {loading ? 'Joining…' : `Join ${preview?.organization_name || 'your team'}`}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
