import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useAdminWorkspace } from '@/components/admin/AdminWorkspaceContext';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import troobaLogoDark from '@/assets/trooba-logo-dark.svg';

export function AdminContextBar() {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const { contextTitle, contextSubtitle, titleLink } = useAdminWorkspace();

  const displayTitle = contextTitle || 'TF Admin';
  const subtitle = contextSubtitle || admin?.email;
  const titleIsLink = Boolean(titleLink && contextTitle && contextTitle !== 'TF Admin');

  return (
    <div className="h-[52px] bg-context-bar text-context-bar-foreground flex items-center px-2 md:px-5 gap-1.5 md:gap-3 border-b border-[rgba(255,255,255,0.08)] shrink-0 overflow-x-auto">
      <div className="w-8 shrink-0 md:hidden" />
      <button type="button" onClick={() => navigate('/TF-admin/dashboard')} className="shrink-0">
        <img src={troobaLogoDark} alt="Trooba Flow" style={{ height: '34px', width: 'auto' }} />
      </button>
      <span className="text-sidebar-muted text-sm shrink-0">›</span>
      <button
        type="button"
        onClick={() => navigate('/TF-admin/dashboard')}
        className="text-sm text-sidebar-muted hover:text-context-bar-foreground shrink-0 hidden sm:inline"
      >
        TF Admin
      </button>
      {contextTitle && contextTitle !== 'TF Admin' && (
        <>
          <span className="text-sidebar-muted text-sm shrink-0 hidden sm:inline">›</span>
          {titleIsLink ? (
            <button
              type="button"
              onClick={() => navigate(titleLink!)}
              className="text-sm font-medium text-context-bar-foreground truncate max-w-[140px] md:max-w-[280px] hover:text-primary transition-colors text-left"
              title="Back to user models"
            >
              {displayTitle}
            </button>
          ) : (
            <span className="text-sm font-medium text-context-bar-foreground truncate max-w-[140px] md:max-w-[280px]">
              {displayTitle}
            </span>
          )}
        </>
      )}

      <div className="h-4 w-px bg-[rgba(255,255,255,0.12)] hidden sm:block" />

      <Badge
        variant="outline"
        className="border-primary/40 text-primary text-xs font-mono shrink-0 hidden sm:flex gap-1"
      >
        <Shield className="h-2.5 w-2.5" />
        Admin
      </Badge>

      <div className="flex-1" />

      {subtitle && (
        <span className="text-xs text-sidebar-muted truncate max-w-[200px] hidden md:inline">
          {subtitle}
        </span>
      )}
    </div>
  );
}
