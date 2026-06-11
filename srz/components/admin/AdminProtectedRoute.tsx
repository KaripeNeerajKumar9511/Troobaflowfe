import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-sidebar">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/TF-admin" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
