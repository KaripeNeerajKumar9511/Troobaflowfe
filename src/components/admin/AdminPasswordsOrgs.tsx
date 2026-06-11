import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_PASSWORD_ORGS, apiJson } from '@/lib/api';
import { useAdminWorkspace } from '@/components/admin/AdminWorkspaceContext';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, ChevronRight, KeyRound } from 'lucide-react';

interface PasswordOrgRow {
  id: string;
  name: string;
  organization_code: string;
  owner_email?: string;
  member_count?: number;
  stored_password_count?: number;
}

export function AdminPasswordsOrgs() {
  const navigate = useNavigate();
  const { setContextTitle, setContextSubtitle, setTitleLink } = useAdminWorkspace();
  const [rows, setRows] = useState<PasswordOrgRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setContextTitle('Passwords');
    setContextSubtitle('View provisioned credentials by organization');
    setTitleLink(null);
    document.title = 'TF Admin — Passwords';
  }, [setContextTitle, setContextSubtitle, setTitleLink]);

  useEffect(() => {
    apiJson<PasswordOrgRow[]>(ADMIN_PASSWORD_ORGS)
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl animate-fade-in">
      <div className="mb-6 flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">Passwords</h1>
        {!loading && <Badge variant="secondary">{rows.length} organizations</Badge>}
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Select an organization to view member login credentials provisioned by admin.
      </p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-slate-200/60 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-normal text-muted-foreground">
              No organizations found.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((org) => (
            <Card
              key={org.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/TF-admin/passwords/${org.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === 'Enter' && navigate(`/TF-admin/passwords/${org.id}`)
              }
            >
              <CardHeader className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <CardTitle className="text-base truncate">{org.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5 font-mono text-xs">
                        {org.organization_code}
                      </p>
                      {org.owner_email && (
                        <p className="text-xs text-slate-500 mt-1">Owner: {org.owner_email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="outline">
                      {(org.stored_password_count ?? 0)} stored
                    </Badge>
                    <Badge variant="secondary">{org.member_count ?? 0} members</Badge>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
