import { Outlet } from 'react-router-dom';
import { AdminWorkspaceProvider } from '@/components/admin/AdminWorkspaceContext';
import { AdminContextBar } from '@/components/admin/AdminContextBar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

/** Same shell as ModelWorkspaceLayout: context top bar + dark sidebar + scrollable main. */
export function AdminWorkspaceLayout() {
  return (
    <AdminWorkspaceProvider>
      <div className="h-screen flex flex-col">
        <AdminContextBar />
        <div className="flex flex-1 overflow-hidden">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminWorkspaceProvider>
  );
}
