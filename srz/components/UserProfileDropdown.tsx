import { useAuth } from '@/contexts/AuthContext';
// Interface level disabled.
// import { useUserLevelStore, type UserLevel } from '@/hooks/useUserLevel';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Building2, Check, ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PROFILE_ORGS, PROFILE_SET_ACTIVE_ORG, apiJson, apiFetch } from '@/lib/api';

// const LEVELS: { value: UserLevel; label: string; description: string }[] = [
//   { value: 'novice', label: 'Novice', description: 'Simplified view. Core fields only.' },
//   { value: 'standard', label: 'Standard', description: 'Balanced view. Most fields visible.' },
//   { value: 'advanced', label: 'Advanced', description: 'Full view. All parameters and formula columns.' },
// ];

export function UserProfileDropdown() {
  const { user, signOut, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);

  const email = user?.email || '';
  const displayName = user
    ? (() => {
        const n = user.name?.trim();
        if (n && n !== user.email) return n;
        const local = user.email.split('@')[0] ?? '';
        return local
          .replace(/[._]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
      })()
    : '';
  const initial = (displayName || email).charAt(0).toUpperCase();

  const handleSignOut = () => {
    setOpen(false);
    signOut();
  };

  const [orgsOpen, setOrgsOpen] = useState(false);
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);

  const loadOrgs = async () => {
    try {
      const data = await apiJson<{ id: string; name: string }[]>(PROFILE_ORGS);
      setOrgs(Array.isArray(data) ? data : []);
    } catch {
      setOrgs([]);
    }
  };

  const setActiveOrg = async (organization_id: string) => {
    await apiFetch(PROFILE_SET_ACTIVE_ORG, {
      method: 'POST',
      body: JSON.stringify({ organization_id }),
    });
    await refreshProfile();
    toast.success('Organization switched');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-sidebar-accent transition-colors">
          <span className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
            {initial}
          </span>
          <span className="text-sm text-sidebar-muted hidden sm:inline truncate max-w-[160px]">{displayName || email}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-border space-y-0.5">
          <p className="text-sm font-medium truncate">{displayName || email}</p>
          <p className="text-xs text-muted-foreground font-mono truncate" title={email}>
            {email}
          </p>
          {user?.organization_name && (
            <div className="pt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span className="truncate">{user.organization_name}</span>
            </div>
          )}
        </div>

        {/* Organization switcher */}
        {user && (
          <div className="p-3">
            <button
              type="button"
              className="w-full flex items-center justify-between rounded-[6px] border border-border px-3 py-2 hover:bg-muted/30"
              onClick={async () => {
                const next = !orgsOpen;
                setOrgsOpen(next);
                if (next) await loadOrgs();
              }}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Organization</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ChevronDown className="h-4 w-4" />
              </span>
            </button>
            {orgsOpen && (
              <div className="mt-2 space-y-1">
                {orgs.map((o) => {
                  const active = user.organization_id === o.id;
                  return (
                    <button
                      key={o.id}
                      className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-sm border ${
                        active ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
                      }`}
                      onClick={() => setActiveOrg(o.id)}
                      disabled={active}
                    >
                      <span className="truncate">{o.name}</span>
                      {active && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
                {orgs.length === 0 && (
                  <div className="text-xs text-muted-foreground px-3 py-2">No organizations.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Interface level / User Mode selector — disabled */}
        {/*
        <div className="p-3">
          ...
        </div>
        <Separator />
        */}

        {/* Sign out */}
        <div className="p-1.5">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
