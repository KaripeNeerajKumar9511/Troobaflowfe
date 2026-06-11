import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  ADMIN_LOGIN,
  ADMIN_LOGOUT,
  ADMIN_ME,
  apiFetch,
  resolveApiUrl,
} from '@/lib/api';

export interface AdminUser {
  email: string;
  role: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAdmin = useCallback(async () => {
    try {
      const res = await fetch(resolveApiUrl(ADMIN_ME), { credentials: 'include' });
      if (!res.ok) {
        setAdmin(null);
        return;
      }
      const d = await res.json();
      if (!d.authenticated || !d.email) {
        setAdmin(null);
        return;
      }
      setAdmin({ email: d.email, role: d.role || 'admin' });
    } catch {
      setAdmin(null);
    }
  }, []);

  useEffect(() => {
    refreshAdmin().finally(() => setLoading(false));
  }, [refreshAdmin]);

  const signIn = async (email: string, password: string) => {
    const res = await fetch(resolveApiUrl(ADMIN_LOGIN), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return { error: new Error(j.error || 'Admin login failed') };
    }
    await refreshAdmin();
    return { error: null };
  };

  const signOut = async () => {
    await apiFetch(ADMIN_LOGOUT, { method: 'POST', body: '{}' });
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, signIn, signOut, refreshAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
