import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AdminTableColumn } from '@/lib/admin/runResultsDisplay';

export function AdminReadOnlyDataTable<TRow extends { key?: string }>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'No data',
}: {
  columns: AdminTableColumn<TRow>[];
  rows: TRow[];
  rowKey: (row: TRow, index: number) => string;
  emptyMessage?: string;
}) {
  if (!rows.length) {
    return <p className="text-sm text-muted-foreground py-6 text-center">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table className="table-auto min-w-max">
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={`font-mono text-xs whitespace-nowrap ${col.align === 'left' ? 'text-left' : 'text-right'}`}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={rowKey(row, i)}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={`font-mono text-xs whitespace-nowrap tabular-nums ${
                    col.align === 'left' ? 'text-left font-medium' : 'text-right'
                  }`}
                >
                  {col.get(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
