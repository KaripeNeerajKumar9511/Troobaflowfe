import { createContext, useContext, useEffect, useState, useRef, type ReactNode, useCallback } from 'react';
import { apiFetch, resolveApiUrl, AUTH_PROFILE, AUTH_LOGIN, AUTH_SIGNUP, AUTH_LOGOUT } from '@/lib/api';
import { toast } from 'sonner';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  organization_id: string | null;
  organization_name: string | null;
  role: string;
  user_level: number;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const hadUser = useRef(false);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch(resolveApiUrl(AUTH_PROFILE), { credentials: 'include' });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const d = await res.json();
      // Anonymous: { authenticated: false }; logged-in adds email + authenticated true
      if (!d.authenticated || d.error || !d.email) {
        setUser(null);
        return;
      }
      setUser({
        id: d.id ?? 0,
        email: d.email,
        name: d.name || d.email,
        organization_id: d.organization_id ?? null,
        organization_name: d.organization_name ?? null,
        role: d.role || 'user',
        user_level: d.user_level ?? 1,
      });
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshProfile().finally(() => setLoading(false));
  }, [refreshProfile]);

  useEffect(() => {
    if (hadUser.current && !user) {
      toast.error('Your session has expired — please sign in again', { duration: 6000 });
    }
    hadUser.current = !!user;
  }, [user]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const res = await apiFetch(AUTH_SIGNUP, {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        password_confirm: password,
        name: fullName,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return { error: new Error(j.error || 'Signup failed') };
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const emailNorm = email.trim().toLowerCase();
    const res = await fetch(resolveApiUrl(AUTH_LOGIN), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: emailNorm, password }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return { error: new Error(j.error || 'Login failed') };
    }
    await refreshProfile();
    return { error: null };
  };

  const signOut = async () => {
    hadUser.current = false;
    await apiFetch(AUTH_LOGOUT, { method: 'POST', body: '{}' });
    setUser(null);
  };

  const resetPassword = async (_email: string) => {
    return {
      error: new Error(
        'Password reset by email is not configured. Use Settings → Security while signed in, or contact your administrator.',
      ),
    };
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signOut, resetPassword, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
