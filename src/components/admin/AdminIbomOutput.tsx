import { useMemo, useState } from 'react';
import type { Model } from '@/stores/modelStore';
import type { CalcResults } from '@/lib/calculationEngine';
import { buildNodeTree, TreeTable } from '@/components/IBOMOutput';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

/** Read-only IBOM run results (tree table — same as Run & Results → IBOM). */
export function AdminIbomOutput({ model, results }: { model: Model; results: CalcResults }) {
  const mctUnit = model.general.mct_time_unit;

  const assemblyOptions = useMemo(() => {
    const parentIds = new Set(model.ibom.map((e) => e.parent_product_id));
    const componentIds = new Set(model.ibom.map((e) => e.component_product_id));
    return model.products.filter(
      (p) => parentIds.has(p.id) && !componentIds.has(p.id),
    );
  }, [model]);

  const [selectedId, setSelectedId] = useState('');

  const effectiveId = selectedId || assemblyOptions[0]?.id || '';
  const hasChildren = model.ibom.some((e) => e.parent_product_id === effectiveId);
  const tree = useMemo(() => {
    if (!effectiveId || !hasChildren) return null;
    return buildNodeTree(model, results, effectiveId, 0, new Set());
  }, [model, results, effectiveId, hasChildren]);

  if (model.ibom.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No IBOM structure defined for this model.
        </CardContent>
      </Card>
    );
  }

  if (assemblyOptions.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          IBOM entries exist but no final assembly product was found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">IBOM Tree Table</CardTitle>
        <CardDescription>
          MCT breakdown by assembly level (read-only — same view as Run &amp; Results → IBOM → Tree Table)
        </CardDescription>
        <div className="pt-2">
          <Select value={effectiveId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-full max-w-sm h-9">
              <SelectValue placeholder="Select final assembly…" />
            </SelectTrigger>
            <SelectContent>
              {assemblyOptions.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {!hasChildren || !tree ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            This product has no IBOM components. Select another final assembly.
          </p>
        ) : (
          <TreeTable model={model} results={results} tree={tree} mctUnit={mctUnit} />
        )}
      </CardContent>
    </Card>
  );
}
