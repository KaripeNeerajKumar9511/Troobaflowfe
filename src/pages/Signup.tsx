import { useState, useEffect, useMemo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { seedDemoModelToDB } from '@/lib/supabaseData';
import { Check, X } from 'lucide-react';
import troobaLogoLight from '@/assets/trooba-logo-light.svg';

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {met ? <Check className="h-3.5 w-3.5 text-primary" /> : <X className="h-3.5 w-3.5 text-destructive" />}
      <span className={met ? 'text-primary' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}

export default function Signup() {
  const { signUp, signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { document.title = 'Trooba Flow — Create Account'; return () => { document.title = 'Trooba Flow'; }; }, []);

  const pwChecks = useMemo(() => ({
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
  }), [password]);

  const passwordValid = pwChecks.minLength && pwChecks.hasUppercase && pwChecks.hasNumber;

  if (loading) return null;
  if (user) return <Navigate to="/library" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) { toast.error('Please meet all password requirements'); return; }
    setSubmitting(true);
    const { error } = await signUp(email, password, fullName);
    if (error) {
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        toast.error('An account with this email already exists');
      } else if (error.message?.toLowerCase().includes('leaked') || error.message?.toLowerCase().includes('pwned') || error.message?.toLowerCase().includes('breach')) {
        toast.error('This password has been found in a data breach. Please choose a different password.');
      } else {
        toast.error(error.message || 'Sign up failed');
      }
      setSubmitting(false);
      return;
    }
    const loginRes = await signIn(email, password);
    if (loginRes.error) {
      toast.success('Account created — please sign in');
      navigate('/login');
      setSubmitting(false);
      return;
    }
    try {
      await seedDemoModelToDB();
      const { useModelStore } = await import('@/stores/modelStore');
      await useModelStore.getState().loadModels(true);
      toast.success('Welcome to Trooba Flow!');
    } catch (err) {
      console.error('Demo seed error:', err);
      toast.success('Welcome to Trooba Flow!');
    }
    navigate('trooba.com/request-access');
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-2">
        <CardHeader className="text-center">
          <img src={troobaLogoLight} alt="Trooba Flow" style={{ height: '48px', width: 'auto' }} className="mx-auto mb-4" />
          <CardTitle className="text-xl font-bold tracking-tight">Create Account</CardTitle>
          <CardDescription className="text-base">Get started with Trooba Flow</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm">Full Name</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoFocus className="h-11 text-base" />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 text-base" />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 text-base" />
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <PasswordRequirement met={pwChecks.minLength} label="At least 8 characters" />
                  <PasswordRequirement met={pwChecks.hasUppercase} label="At least one uppercase letter" />
                  <PasswordRequirement met={pwChecks.hasNumber} label="At least one number" />
                </div>
              )}
            </div>
            <Button type="submit" className="w-full h-11 text-base" disabled={submitting || !passwordValid}>
              {submitting ? 'Creating account…' : 'Sign Up'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
