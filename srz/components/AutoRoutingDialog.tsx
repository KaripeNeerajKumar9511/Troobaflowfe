import { useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useModelStore, type Operation, type Product } from '@/stores/modelStore';
import { buildCombinedRouting, buildLinearRoutingSingle, type RoutingInputRow } from '@/lib/autoRoutingCombine';
import { cn } from '@/lib/utils';
import { CheckCircle2, Download, UploadCloud, X } from 'lucide-react';

type RoutingRow = {
  product: string;
  routing: string;
  totalDemand: number;
  /** Same ID (e.g. 1, 2) merges rows into one product with shared DOCK and demand-weighted splits. */
  combinationId: string;
};

type LegendRow = {
  operation: string;
  code: string;
};

type ParsedTemplate = {
  routingRows: RoutingRow[];
  legendRows: LegendRow[];
};

function asNumber(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function normalizeOpName(name: string): string {
  return name.trim();
}

function normHeaderCell(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '');
}

function parseTemplate(arrayBuffer: ArrayBuffer): ParsedTemplate {
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const first = wb.SheetNames[0];
  if (!first) return { routingRows: [], legendRows: [] };
  const ws = wb.Sheets[first];
  const rowsRaw = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, { header: 1, defval: null, raw: true });
  const rowsDisplay = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1, defval: '', raw: false });

  const header = (rowsDisplay[0] ?? []).map((c) => String(c ?? '').trim().toLowerCase());
  const headerNorm = header.map(normHeaderCell);
  const idx = (names: string[], fallback: number) => {
    for (const n of names) {
      const nn = normHeaderCell(n);
      const i = headerNorm.findIndex((h) => h === nn || h.includes(nn));
      if (i >= 0) return i;
    }
    return fallback;
  };

  // Left table indices (defaulting to template layout).
  const productIdx = idx(['product'], 0);
  const routingIdx = idx(['routing'], 1);
  const demandIdx = idx(['total demand', 'totaldemand', 'demand'], 2);
  const combinationIdx = idx(['combination id', 'combinationid', 'combo id', 'comboid'], 3);

  // Right legend: Operation / Operation Code (default columns F–G → 0-based 5–6).
  const operationIdx = idx(['operation'], 5);
  const operationCodeIdx = idx(['operation code', 'operationcode', 'code'], 6);

  // Expected: Product, Routing, Total Demand, Combination ID ; Operation, Operation Code
  const routingRows: RoutingRow[] = [];
  const legendRows: LegendRow[] = [];

  for (let i = 1; i < rowsRaw.length; i++) {
    const r = rowsRaw[i] ?? [];
    const product = normalizeOpName(String(r[productIdx] ?? '')).trim();
    const routing = normalizeCode(String(r[routingIdx] ?? '')).replace(/\s+/g, '');
    const totalDemand = asNumber(r[demandIdx]);
    const combinationId = String(r[combinationIdx] ?? '').trim();

    const opName = normalizeOpName(String(r[operationIdx] ?? '')).trim();
    const opCode = normalizeCode(String(r[operationCodeIdx] ?? '')).trim();

    const leftHas =
      !!product || !!routing || totalDemand !== 0;
    const rightHas = !!opName || !!opCode;

    if (leftHas && product) {
      routingRows.push({ product, routing, totalDemand, combinationId });
    }
    if (rightHas && opName && opCode) {
      legendRows.push({ operation: opName, code: opCode });
    }
  }

  return { routingRows, legendRows };
}

function buildEmptyProduct(id: string, name: string, demand: number): Product {
  return {
    id,
    name,
    demand,
    lot_size: 1,
    tbatch_size: -1,
    demand_factor: 1,
    lot_factor: 1,
    var_factor: 1,
    setup_factor: 1,
    make_to_stock: false,
    gather_tbatches: true,
    dept_code: '',
    prod1: 0,
    prod2: 0,
    prod3: 0,
    prod4: 0,
    comments: '',
  };
}

function buildEmptyOperation(id: string, productId: string, opName: string, opNumber: number): Operation {
  return {
    id,
    product_id: productId,
    op_name: opName,
    op_number: opNumber,
    equip_id: '',
    pct_assigned: 100,
    equip_setup_lot: 0,
    equip_setup_piece: 0,
    equip_setup_tbatch: 0,
    equip_run_piece: 0,
    equip_run_lot: 0,
    equip_run_tbatch: 0,
    labor_setup_lot: 0,
    labor_setup_piece: 0,
    labor_setup_tbatch: 0,
    labor_run_piece: 0,
    labor_run_lot: 0,
    labor_run_tbatch: 0,
    oper1: 0,
    oper2: 0,
    oper3: 0,
    oper4: 0,
  };
}

function StepPill({ step, active, done, label }: { step: 1 | 2 | 3; active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'h-7 w-7 rounded-full border flex items-center justify-center text-xs font-semibold',
          done ? 'bg-emerald-600 border-emerald-600 text-white' : active ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-muted text-muted-foreground',
        )}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : step}
      </div>
      <div className={cn('text-sm font-medium', active || done ? 'text-foreground' : 'text-muted-foreground')}>{label}</div>
    </div>
  );
}

function partitionIntoProductGroups(rows: RoutingRow[]): RoutingRow[][] {
  const byCombo = new Map<string, RoutingRow[]>();
  const groups: RoutingRow[][] = [];
  for (const r of rows) {
    const cid = r.combinationId.trim();
    if (!cid) {
      groups.push([r]);
      continue;
    }
    if (!byCombo.has(cid)) byCombo.set(cid, []);
    byCombo.get(cid)!.push(r);
  }
  for (const g of byCombo.values()) groups.push(g);
  return groups;
}

export function AutoRoutingDialog({
  open,
  onOpenChange,
  canEdit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canEdit: boolean;
}) {
  const model = useModelStore((s) => s.getActiveModel());
  const addProductLocal = useModelStore((s) => s.addProductLocal);
  const addOperationLocal = useModelStore((s) => s.addOperationLocal);
  const setRoutingLocal = useModelStore((s) => s.setRoutingLocal);
  const clearOperationsRoutingLocal = useModelStore((s) => s.clearOperationsRoutingLocal);
  const updateProduct = useModelStore((s) => s.updateProduct);
  const setAutoRoutingNotice = useModelStore((s) => s.setAutoRoutingNotice);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [terminal, setTerminal] = useState<'STOCK' | 'SCRAP'>('STOCK');
  const [parsed, setParsed] = useState<ParsedTemplate | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const codeToOperation = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of parsed?.legendRows ?? []) map.set(normalizeCode(r.code), normalizeOpName(r.operation));
    return map;
  }, [parsed]);

  const validationErrors = useMemo(() => {
    const errs: string[] = [];
    if (!parsed) return errs;
    if (parsed.routingRows.length === 0) {
      errs.push('No routing rows found. Fill the left table (Product/Routing/Total Demand/Combination ID).');
    }
    if (parsed.legendRows.length === 0) errs.push('No operation legend found. Fill the right table (Operation/Operation Code).');

    const codes = new Set(parsed.legendRows.map((l) => normalizeCode(l.code)));
    for (const row of parsed.routingRows) {
      if (!Number.isFinite(row.totalDemand) || row.totalDemand <= 0) {
        errs.push(`Product "${row.product}": Total Demand must be greater than 0.`);
      }
      const raw = normalizeCode(row.routing).replace(/\s+/g, '');
      if (!raw) {
        errs.push(`Product "${row.product}" has empty routing.`);
        continue;
      }
      for (const ch of raw.split('')) {
        if (!codes.has(ch)) errs.push(`Product "${row.product}" routing uses unknown code "${ch}".`);
      }
    }
    return Array.from(new Set(errs));
  }, [parsed]);

  const canGenerate = step === 3 && parsed !== null && validationErrors.length === 0 && !busy;

  const reset = () => {
    setStep(1);
    setTerminal('STOCK');
    setParsed(null);
    setFileName('');
    setBusy(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = (next: boolean) => {
    onOpenChange(next);
    if (!next) reset();
  };

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFile = async (file: File) => {
    try {
      setBusy(true);
      const buf = await file.arrayBuffer();
      const next = parseTemplate(buf);
      setParsed(next);
      setFileName(file.name);
      toast.success('Template parsed successfully.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to read the Excel file. Please verify the template format.');
      setParsed(null);
      setFileName('');
    } finally {
      setBusy(false);
    }
  };

  const handleGenerate = async () => {
    if (!model) return;
    if (!parsed) return;
    if (!canEdit) {
      toast.error('Start Edit to generate routing.');
      return;
    }
    if (validationErrors.length > 0) {
      toast.error('Fix template issues before generating routing.');
      return;
    }

    setBusy(true);
    try {
      const groups = partitionIntoProductGroups(parsed.routingRows);
      const byName = new Map(model.products.map((p) => [p.name.trim().toUpperCase(), p]));

      for (const group of groups) {
        if (group.length === 0) continue;

        const first = group[0]!;
        if (group.length === 1 && !first.combinationId.trim()) {
          const row = first;
          const key = row.product.trim().toUpperCase();
          const existing = byName.get(key);
          const productId = existing?.id ?? crypto.randomUUID();
          if (!existing) {
            addProductLocal(model.id, buildEmptyProduct(productId, row.product, row.totalDemand));
            byName.set(key, { ...buildEmptyProduct(productId, row.product, row.totalDemand) });
          } else {
            // Replace ops/routing for this product, but keep the product row (and IBOM) intact.
            clearOperationsRoutingLocal(model.id, productId);
            updateProduct(model.id, productId, { demand: row.totalDemand });
          }

          const routingCodes = normalizeCode(row.routing).replace(/\s+/g, '').split('').filter(Boolean);
          const opNamesInOrder: string[] = [];
          for (const code of routingCodes) {
            const opName = codeToOperation.get(code);
            if (!opName) continue;
            if (!opNamesInOrder.includes(opName)) opNamesInOrder.push(opName);
          }

          addOperationLocal(model.id, buildEmptyOperation(crypto.randomUUID(), productId, 'DOCK', 0));
          opNamesInOrder.forEach((name, idx) =>
            addOperationLocal(model.id, buildEmptyOperation(crypto.randomUUID(), productId, name, 10 + idx * 10)),
          );

          const entries = buildLinearRoutingSingle(productId, opNamesInOrder, terminal);
          setRoutingLocal(model.id, productId, entries);
        } else {
          const rowsInput: RoutingInputRow[] = group.map((r) => ({
            product: r.product,
            routing: r.routing,
            totalDemand: r.totalDemand,
            combinationId: r.combinationId,
          }));
          const rounded = buildCombinedRouting(
            rowsInput,
            parsed.legendRows,
            terminal,
            { rounding: 'rounded' },
          );
          const key = rounded.productName.trim().toUpperCase();
          const existing = byName.get(key);
          const productId = existing?.id ?? rounded.productId;
          if (!existing) {
            addProductLocal(model.id, buildEmptyProduct(productId, rounded.productName, rounded.totalDemand));
            byName.set(key, { ...buildEmptyProduct(productId, rounded.productName, rounded.totalDemand) });
          } else {
            clearOperationsRoutingLocal(model.id, productId);
            updateProduct(model.id, productId, { demand: rounded.totalDemand });
          }
          for (const op of rounded.operations.map((o) => ({ ...o, id: crypto.randomUUID(), product_id: productId }))) {
            addOperationLocal(model.id, op);
          }
          setRoutingLocal(model.id, productId, rounded.routing.map((r) => ({ ...r, id: crypto.randomUUID(), product_id: productId })));

          if (rounded.removedZeroPctOps.length > 0) {
            setAutoRoutingNotice({
              productId,
              productName: rounded.productName,
              removed: rounded.removedZeroPctOps,
              source: { rows: rowsInput, legend: parsed.legendRows, terminal },
            });
          }
        }
      }

      toast.success('Auto routing generated (not saved yet).');
      handleClose(false);
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : 'Failed to generate auto routing.';
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-lg">Auto Routing</DialogTitle>
              <div className="text-sm text-muted-foreground mt-1">
                Create routing automatically using an Excel template.
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleClose(false)} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
            <StepPill step={1} active={step === 1} done={step > 1} label="Instructions" />
            <div className="h-px flex-1 mx-3 bg-muted" />
            <StepPill step={2} active={step === 2} done={step > 2} label="Download & Upload" />
            <div className="h-px flex-1 mx-3 bg-muted" />
            <StepPill step={3} active={step === 3} done={false} label="Preview Data" />
          </div>
        </div>

        <div className="px-6 pb-6">
          {step === 1 && (
            <Card className="p-5">
              <div className="flex gap-4">
                <div className="h-14 w-14 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <div className="h-8 w-8 rounded-md bg-emerald-600/15 flex items-center justify-center">
                    <UploadCloud className="h-4 w-4 text-emerald-700" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">Follow these steps to prepare your Excel file</div>
                  <ol className="mt-3 space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    <li>Download the Excel template.</li>
                    <li>Fill routing data on the left: Product, Routing, Total Demand, and Combination ID (same ID merges rows into one product with shared DOCK and demand-based splits).</li>
                    <li>Fill operation legend on the right side: Operation and Operation Code.</li>
                    <li>Save the completed Excel file.</li>
                    <li>Upload the file in the next step.</li>
                    <li>Review the parsed data before generating routing.</li>
                  </ol>
                  <div className="mt-4 rounded-md border bg-sky-50 px-3 py-2 text-xs text-sky-800">
                    <span className="font-medium">Tip:</span> Keep routing codes consistent with the operation-code legend.
                    <span className="ml-2">Example: P = Printing → Punching → Pinning.</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">1. Download Excel Template</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Download the template and fill in the routing data. Follow the required columns and format.
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.open('/routing_template.xlsx', '_blank', 'noopener,noreferrer')}
                  >
                    <Download className="h-4 w-4" /> Download Excel Template
                  </Button>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">2. Upload Filled Template</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Upload the completed Excel file. We’ll parse and validate it before preview.
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleFile(f);
                    }}
                  />
                  <Button variant="secondary" className="gap-2" onClick={handlePickFile} disabled={busy}>
                    <UploadCloud className="h-4 w-4" /> {busy ? 'Reading…' : 'Choose File'}
                  </Button>
                </div>

                <div className="mt-4 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  <div className="font-medium text-foreground">Click to upload</div>
                  <div className="text-xs mt-1">.xlsx only (max 10MB recommended)</div>
                  {fileName && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs">
                      <span className="font-medium text-foreground">{fileName}</span>
                      {parsed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Parsed successfully
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Preview Data</div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">End routing at</div>
                  <div className="inline-flex rounded-md border bg-background p-0.5">
                    <button
                      type="button"
                      onClick={() => setTerminal('STOCK')}
                      className={cn('px-2.5 py-1 text-xs rounded', terminal === 'STOCK' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}
                    >
                      STOCK
                    </button>
                    <button
                      type="button"
                      onClick={() => setTerminal('SCRAP')}
                      className={cn('px-2.5 py-1 text-xs rounded', terminal === 'SCRAP' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}
                    >
                      SCRAP
                    </button>
                  </div>
                </div>
              </div>

              {validationErrors.length > 0 && (
                <Card className="p-4 border-amber-200 bg-amber-50">
                  <div className="text-sm font-semibold text-amber-900">Fix these issues</div>
                  <ul className="mt-2 text-xs text-amber-900 list-disc pl-4 space-y-1">
                    {validationErrors.slice(0, 8).map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                    {validationErrors.length > 8 && <li>…and {validationErrors.length - 8} more</li>}
                  </ul>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-0 overflow-hidden">
                  <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 text-xs font-semibold text-emerald-900">
                    Routing Data
                  </div>
                  <div className="max-h-56 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Routing</TableHead>
                          <TableHead className="text-right">Total Demand</TableHead>
                          <TableHead className="text-right w-24">Comb. ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(parsed?.routingRows ?? []).map((r, idx) => (
                          <TableRow key={`${r.product}-${idx}`}>
                            <TableCell className="font-medium">{r.product}</TableCell>
                            <TableCell className="font-mono text-xs">{r.routing}</TableCell>
                            <TableCell className="text-right">{r.totalDemand || ''}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{r.combinationId || '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>

                <Card className="p-0 overflow-hidden">
                  <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 text-xs font-semibold text-amber-900">
                    Operation Legend
                  </div>
                  <div className="max-h-56 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Operation</TableHead>
                          <TableHead className="w-28">Operation Code</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(parsed?.legendRows ?? []).map((r, idx) => (
                          <TableRow key={`${r.code}-${idx}`}>
                            <TableCell className="font-medium">{r.operation}</TableCell>
                            <TableCell className="font-mono">{r.code}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>

              <div className="text-xs text-muted-foreground">
                We’ll create products, operations, and routing for each product row using your legend codes.
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t bg-background px-6 py-4">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep((s) => (s === 3 ? 2 : 1))} disabled={busy}>
                Back
              </Button>
            )}
            {step < 3 && (
              <Button
                onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
                disabled={busy || (step === 2 && parsed === null)}
              >
                Next
              </Button>
            )}
            {step === 3 && (
              <Button onClick={handleGenerate} disabled={!canGenerate} className="gap-2">
                Generate Routing
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

