import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { AdminProtectedRoute } from '@/components/admin/AdminProtectedRoute';
import { AdminWorkspaceLayout } from '@/components/admin/AdminWorkspaceLayout';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminUsersList } from '@/components/admin/AdminUsersList';
import { AdminUserDetail } from '@/components/admin/AdminUserDetail';
import { AdminModelDetail } from '@/components/admin/AdminModelDetail';
import { AdminOrganizations } from '@/components/admin/AdminOrganizations';
import { AdminOrgMembers } from '@/components/admin/AdminOrgMembers';
import { AdminPasswordsOrgs } from '@/components/admin/AdminPasswordsOrgs';
import { AdminOrgPasswords } from '@/components/admin/AdminOrgPasswords';

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
          <Route path="organizations" element={<AdminOrganizations />} />
          <Route path="organizations/:orgId/members" element={<AdminOrgMembers />} />
          <Route path="organizations/:orgId/members/:userId" element={<AdminUserDetail />} />
          <Route
            path="organizations/:orgId/members/:userId/models/:modelId"
            element={<AdminModelDetail />}
          />
          <Route path="passwords" element={<AdminPasswordsOrgs />} />
          <Route path="passwords/:orgId" element={<AdminOrgPasswords />} />
          {/* Legacy flat user routes */}
          <Route path="users" element={<AdminUsersList />} />
          <Route path="users/:userId" element={<AdminUserDetail />} />
          <Route path="users/:userId/models/:modelId" element={<AdminModelDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </AdminAuthProvider>
  );
}
