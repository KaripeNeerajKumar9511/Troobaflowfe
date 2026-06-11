import { useState, useEffect } from 'react';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRmctDeviceSupported } from '@/hooks/useRmctDeviceSupported';
import { UnsupportedDeviceScreen } from '@/components/auth/UnsupportedDeviceScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import troobaLogoLight from '@/assets/trooba-logo-light.svg';

const FROZEN_MESSAGE = 'Your account has been frozen. Please contact support.';

export default function Login() {
  const { signIn, user, loading } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [accountFrozen, setAccountFrozen] = useState(false);
  const supported = useRmctDeviceSupported();

  const accountReady = searchParams.get('account') === 'ready';
  const prefilledEmail = searchParams.get('email') || '';

  useEffect(() => { document.title = 'Trooba Flow — Sign In'; return () => { document.title = 'Trooba Flow'; }; }, []);

  useEffect(() => {
    if (prefilledEmail && !email) {
      setEmail(prefilledEmail);
    }
  }, [prefilledEmail, email]);

  const from = (location.state as { from?: string })?.from || '/library';

  if (supported === false) return <UnsupportedDeviceScreen />;
  if (supported === null) {
    return <div className="min-h-screen bg-sidebar flex items-center justify-center p-4" aria-busy="true" />;
  }
  if (loading) return null;
  if (user) return <Navigate to={from} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error, mustChangePassword, accountFrozen: frozen } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      if (frozen) {
        setAccountFrozen(true);
        return;
      }
      toast.error(error.message || 'Invalid email or password');
      return;
    }
    if (mustChangePassword) {
      window.location.replace('/settings');
      return;
    }
    window.location.replace(from);
  };

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-2">
        <CardHeader className="text-center">
          <a href="https://trooba.com" aria-label="Go to trooba.com" className="inline-block mx-auto mb-4">
            <img src={troobaLogoLight} alt="Trooba Flow" style={{ height: '48px', width: 'auto' }} />
          </a>
          {!accountFrozen && (
            <CardDescription className="text-base">Sign in to your account</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {accountReady && !accountFrozen && (
            <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-center">
              <p className="text-sm font-medium text-foreground">
                Your account is ready. Sign in with your email and the password you just created.
              </p>
            </div>
          )}
          {accountFrozen ? (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-center"
              role="alert"
            >
              <p className="text-base font-medium text-foreground leading-relaxed">
                {FROZEN_MESSAGE}
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="h-11 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 text-base"
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-base" disabled={submitting}>
                  {submitting ? 'Signing in…' : 'Sign In'}
                </Button>
              </form>
              <div className="mt-5 text-center text-sm text-muted-foreground space-y-1.5">
                <p>
                  <Link to="/forgot-password" className="text-primary hover:underline">
                    Forgot password?
                  </Link>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
