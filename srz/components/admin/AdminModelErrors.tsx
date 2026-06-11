import { useMemo, useState } from 'react';
import { resolveMessagePair, type IssueBucket } from '@/lib/issueMessageResolver';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export interface AdminIssueRow {
  kind: string;
  dll_message: string;
  raw_line?: string | null;
  scenario_name?: string;
}

type FilterKind = 'all' | IssueBucket;

function kindBadge(kind: IssueBucket) {
  if (kind === 'warning') return <Badge variant="secondary">Warning</Badge>;
  if (kind === 'validation') return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Validation</Badge>;
  if (kind === 'success') return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Success</Badge>;
  return <Badge variant="destructive">Error</Badge>;
}

function IssueTable({
  rows,
}: {
  rows: Array<{
    bucket: IssueBucket;
    dllMessage: string;
    userMessage: string;
    scenario: string;
    id?: string;
  }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Issue log</CardTitle>
        <CardDescription>User-facing message vs DLL / source text</CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead className="w-[120px]">Scenario</TableHead>
              <TableHead>Shown to user</TableHead>
              <TableHead>DLL / source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i} className="align-top">
                <TableCell>{kindBadge(row.bucket)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.scenario}</TableCell>
                <TableCell className="text-sm leading-relaxed max-w-md whitespace-pre-wrap">
                  {row.userMessage}
                  {row.id && (
                    <span className="block text-[10px] text-muted-foreground mt-1 font-mono">{row.id}</span>
                  )}
                </TableCell>
                <TableCell className="text-xs font-mono text-slate-600 leading-relaxed max-w-lg whitespace-pre-wrap bg-slate-50">
                  {row.dllMessage}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function AdminModelErrors({
  issueRows,
  validation,
}: {
  issueRows: AdminIssueRow[];
  validation: { errors: string[]; warnings: string[] };
}) {
  const [filter, setFilter] = useState<FilterKind>('all');

  const rows = useMemo(() => {
    const out: Array<{
      bucket: IssueBucket;
      dllMessage: string;
      userMessage: string;
      scenario: string;
      id?: string;
    }> = [];

    for (const row of issueRows) {
      const dll = row.raw_line?.trim() || row.dll_message;
      const pair = resolveMessagePair(dll);
      const bucket =
        row.kind === 'warning' ? 'warning' : pair.bucket === 'warning' ? 'warning' : pair.bucket;
      out.push({
        bucket: bucket === 'success' ? 'warning' : bucket,
        dllMessage: dll,
        userMessage: pair.userMessage,
        scenario: row.scenario_name || '—',
        id: pair.id,
      });
    }

    for (const line of validation.errors) {
      const pair = resolveMessagePair(line);
      out.push({
        bucket: 'validation',
        dllMessage: line,
        userMessage: pair.userMessage || line,
        scenario: 'Verify Data',
        id: pair.id,
      });
    }
    for (const line of validation.warnings) {
      const pair = resolveMessagePair(line);
      const bucket = pair.bucket === 'validation' ? 'validation' : 'warning';
      out.push({
        bucket,
        dllMessage: line,
        userMessage: pair.userMessage || line,
        scenario: 'Verify Data',
        id: pair.id,
      });
    }

    return out;
  }, [issueRows, validation]);

  const counts = useMemo(() => ({
    error: rows.filter((r) => r.bucket === 'error').length,
    warning: rows.filter((r) => r.bucket === 'warning').length,
    validation: rows.filter((r) => r.bucket === 'validation').length,
  }), [rows]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Compare portal messages shown to the user with raw DLL / validation text.
      </p>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKind)}>
        <TabsList>
          <TabsTrigger value="all">All ({rows.length})</TabsTrigger>
          <TabsTrigger value="error">Errors ({counts.error})</TabsTrigger>
          <TabsTrigger value="warning">Warnings ({counts.warning})</TabsTrigger>
          <TabsTrigger value="validation">Validations ({counts.validation})</TabsTrigger>
        </TabsList>

        {(['all', 'error', 'warning', 'validation'] as const).map((tab) => {
          const tabRows = tab === 'all' ? rows : rows.filter((r) => r.bucket === tab);
          return (
            <TabsContent key={tab} value={tab} className="mt-4">
              {tabRows.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    No {tab === 'all' ? 'issues' : tab} for this model.
                  </CardContent>
                </Card>
              ) : (
                <IssueTable rows={tabRows} />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
