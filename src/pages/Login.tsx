import { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import troobaLogoLight from '@/assets/trooba-logo-light.svg';

export default function Login() {
  const { signIn, user, loading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { document.title = 'Trooba Flow — Sign In'; return () => { document.title = 'Trooba Flow'; }; }, []);

  const from = (location.state as any)?.from || '/library';

  if (loading) return null;
  if (user) return <Navigate to={from} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error('Invalid email or password');
      return;
    }
    // Force a clean app bootstrap after login so user-scoped stores load correct data.
    window.location.replace(from);
  };

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-2">
        <CardHeader className="text-center">
          <img src={troobaLogoLight} alt="Trooba Flow" style={{ height: '48px', width: 'auto' }} className="mx-auto mb-4" />
          <CardDescription className="text-base">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus className="h-11 text-base" />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 text-base" />
            </div>
            <Button type="submit" className="w-full h-11 text-base" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-5 text-center text-sm text-muted-foreground space-y-1.5">
            <p><Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link></p>
            {/* <p>Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link></p> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
