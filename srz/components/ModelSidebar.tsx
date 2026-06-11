import { useLocation, useNavigate } from 'react-router-dom';
import { useModelStore } from '@/stores/modelStore';
import { useUserLevelStore, isVisible, type FeatureKey } from '@/hooks/useUserLevel';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Settings2, Users, Cpu, Package, GitBranch,
  Network, Play, Wrench, Menu, X, LogOut, FlaskConical, Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const navItems: { label: string; icon: typeof LayoutDashboard; path: string; feature: FeatureKey | null }[] = [
  { label: 'Overview', icon: LayoutDashboard, path: 'overview', feature: null },
  { label: 'General Data', icon: Settings2, path: 'general', feature: null },
  { label: 'Labor', icon: Users, path: 'labor', feature: null },
  { label: 'Equipment', icon: Cpu, path: 'equipment', feature: null },
  { label: 'Products', icon: Package, path: 'products', feature: null },
  { label: 'Operations', icon: GitBranch, path: 'operations', feature: null },
  { label: 'IBOM', icon: Network, path: 'ibom', feature: null },
  // { label: 'Trooba Intelligence', icon: Sparkles, path: 'intelligence', feature: 'all_operations' },
  { label: 'Run & Results', icon: Play, path: 'run', feature: null },
  // { label: 'What-If Studio', icon: FlaskConical, path: 'whatif', feature: null },
  // { label: 'Reports', icon: FileText, path: 'reports', feature: null },
  { label: 'Model Settings', icon: Wrench, path: 'settings', feature: null },
];

export function ModelSidebar() {
  const model = useModelStore((s) => s.getActiveModel());
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const userLevel = useUserLevelStore((s) => s.userLevel);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (!model) return null;

  const handleLogout = async () => {
    setMobileOpen(false);
    await signOut();
    navigate('/login');
  };

  const basePath = `/models/${model.id}`;
  const visibleItems = navItems.filter(item => !item.feature || isVisible(item.feature, userLevel));

  const sidebarContent = (
    <>
      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)] flex items-center max-md:justify-between lg:justify-between tablet:hidden">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#C0C8D4]">
          Model Workspace
        </div>
        {/* Close button on mobile */}
        <Button variant="ghost" size="icon" className="h-6 w-6 md:hidden text-sidebar-foreground hover:bg-sidebar-accent" onClick={() => setMobileOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto tablet:flex tablet:flex-col tablet:items-center tablet:px-1.5">
        {visibleItems.map((item) => {
          const to = `${basePath}/${item.path}`;
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={item.path}
              to={to}
              title={item.label}
              className={`flex items-center gap-2.5 mx-1.5 px-3 py-[7px] rounded-[5px] text-[13px] font-medium transition-colors tablet:w-11 tablet:h-11 tablet:mx-auto tablet:justify-center tablet:gap-0 tablet:px-0 tablet:py-0 tablet:shrink-0 ${
                isActive
                  ? 'bg-[#1F2937] text-[#FFFFFF] border-l-[3px] border-l-primary tablet:border-l-0 tablet:ring-1 tablet:ring-primary'
                  : 'text-[#CBD5E1] hover:bg-[#1F2937]/60 hover:text-[#FFFFFF]'
              }`}
              activeClassName=""
            >
              <item.icon className="h-4 w-4 shrink-0 tablet:h-[18px] tablet:w-[18px]" />
              <span className="tablet:sr-only lg:not-sr-only">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.08)] flex flex-col gap-2 tablet:px-0 tablet:py-2">
        <div className="text-xs font-mono text-sidebar-muted tablet:hidden">
          {model.products.length} products · {model.equipment.length} equip · {model.labor.length} labor
        </div>

        <button
          type="button"
          title="Logout"
          onClick={handleLogout}
          className={`flex w-full items-center justify-center gap-2 rounded-[5px] px-3 py-2 text-sm font-medium transition-colors
            text-[#CBD5E1] hover:bg-[#1F2937]/60 hover:text-[#FFFFFF]
            tablet:w-11 tablet:h-11 tablet:px-0 tablet:py-0 tablet:rounded-lg`}
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden />
          <span className="tablet:sr-only lg:not-sr-only">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-12 left-2 z-40 h-8 w-8 md:hidden bg-sidebar text-sidebar-foreground border border-[rgba(255,255,255,0.12)] shadow-sm"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.6)]" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar flex flex-col z-50 animate-in slide-in-from-left duration-200"
            onClick={e => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* md+ sidebar: icon rail on tablet only, full width at lg+ */}
      <aside className="hidden md:flex flex-col shrink-0 min-h-0 bg-sidebar border-r border-[rgba(255,255,255,0.08)] tablet:w-[4.25rem] lg:w-56">
        {sidebarContent}
      </aside>
    </>
  );
}
