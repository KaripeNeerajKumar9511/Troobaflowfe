import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { LayoutDashboard, Building2, KeyRound, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mainNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/TF-admin/dashboard' },
  { label: 'Organizations', icon: Building2, path: '/TF-admin/organizations' },
  { label: 'Passwords', icon: KeyRound, path: '/TF-admin/passwords' },
] as const;

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setMobileOpen(false);
    await signOut();
    navigate('/TF-admin');
  };

  const sidebarContent = (
    <>
      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)] flex items-center max-md:justify-between">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#C0C8D4]">
          TF Admin
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 md:hidden text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {mainNav.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === '/TF-admin/organizations' &&
              location.pathname.startsWith('/TF-admin/organizations')) ||
            (item.path === '/TF-admin/passwords' &&
              location.pathname.startsWith('/TF-admin/passwords'));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              className={`flex items-center gap-2.5 mx-1.5 px-3 py-[7px] rounded-[5px] text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-[#1F2937] text-[#FFFFFF] border-l-[3px] border-l-primary'
                  : 'text-[#CBD5E1] hover:bg-[#1F2937]/60 hover:text-[#FFFFFF]'
              }`}
              activeClassName=""
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.08)]">
        <button
          type="button"
          title="Sign out"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-[5px] px-3 py-2 text-sm font-medium text-[#CBD5E1] hover:bg-[#1F2937]/60 hover:text-[#FFFFFF]"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-12 left-2 z-40 h-8 w-8 md:hidden bg-sidebar text-sidebar-foreground border border-[rgba(255,255,255,0.12)] shadow-sm"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.6)]" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar flex flex-col z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      <aside className="hidden md:flex flex-col shrink-0 min-h-0 bg-sidebar border-r border-[rgba(255,255,255,0.08)] w-56">
        {sidebarContent}
      </aside>
    </>
  );
}
