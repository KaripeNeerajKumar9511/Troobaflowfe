import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import troobaLogoLight from '@/assets/trooba-logo-light.svg';
import { Shield } from 'lucide-react';

export function AdminLogin() {
  const { signIn, admin, loading } = useAdminAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Trooba Flow — Admin';
    return () => { document.title = 'Trooba Flow'; };
  }, []);

  const from = (location.state as { from?: string } | null)?.from || '/TF-admin/dashboard';

  if (loading) return null;
  if (admin) return <Navigate to={from} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error('Invalid admin credentials');
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
          <div className="flex items-center justify-center gap-2 text-primary mb-1">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Admin Portal</span>
          </div>
          <CardDescription className="text-base">Sign in with admin credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="admin-email" className="text-sm">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="h-11 text-base"
                placeholder="admin@gmail.com"
              />
            </div>
            <div>
              <Label htmlFor="admin-password" className="text-sm">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 text-base"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Admin Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
