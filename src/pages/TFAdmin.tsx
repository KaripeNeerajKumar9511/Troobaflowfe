import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { AdminProtectedRoute } from '@/components/admin/AdminProtectedRoute';
import { AdminWorkspaceLayout } from '@/components/admin/AdminWorkspaceLayout';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminUsersList } from '@/components/admin/AdminUsersList';
import { AdminUserDetail } from '@/components/admin/AdminUserDetail';
import { AdminModelDetail } from '@/components/admin/AdminModelDetail';

export default function TFAdmin() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route index element={<AdminLogin />} />
        <Route
          element={
            <AdminProtectedRoute>
              <AdminWorkspaceLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersList />} />
          <Route path="users/:userId" element={<AdminUserDetail />} />
          <Route path="users/:userId/models/:modelId" element={<AdminModelDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </AdminAuthProvider>
  );
}
