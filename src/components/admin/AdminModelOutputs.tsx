import { useMemo, useState } from 'react';
import type { Model } from '@/stores/modelStore';
import type { CalcResults } from '@/lib/calculationEngine';
import { isUtilOnlyCalcResults } from '@/lib/calculationEngine';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminReadOnlyDataTable } from '@/components/admin/AdminReadOnlyDataTable';
import { AdminIbomOutput } from '@/components/admin/AdminIbomOutput';
import {
  buildProductResultRows,
  buildEquipmentResultRows,
  buildLaborResultRows,
  buildOperationResultRows,
  PRODUCT_RESULT_COLUMNS,
  EQUIPMENT_RESULT_COLUMNS,
  LABOR_RESULT_COLUMNS,
  OPERATION_RESULT_COLUMNS,
} from '@/lib/admin/runResultsDisplay';

export interface AdminScenarioOutput {
  scenario_id: string;
  scenario_name: string;
  is_basecase: boolean;
  calculated_at?: string;
  results: CalcResults;
}

export function AdminModelOutputs({
  outputs,
  model,
}: {
  outputs: AdminScenarioOutput[];
  model: Model;
}) {
  const [scenarioIdx, setScenarioIdx] = useState(0);

  if (outputs.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No run results stored for this model yet.
        </CardContent>
      </Card>
    );
  }

  const active = outputs[scenarioIdx];
  const r = active.results;
  const isUtilOnly = isUtilOnlyCalcResults(r);

  const productRows = useMemo(() => buildProductResultRows(r, isUtilOnly), [r, isUtilOnly]);
  const equipmentRows = useMemo(() => buildEquipmentResultRows(r, model), [r, model]);
  const laborRows = useMemo(() => buildLaborResultRows(r), [r]);
  const operationRows = useMemo(() => buildOperationResultRows(r, model), [r, model]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {outputs.map((o, idx) => (
          <Button
            key={o.scenario_id}
            size="sm"
            variant={idx === scenarioIdx ? 'default' : 'outline'}
            onClick={() => setScenarioIdx(idx)}
            className="gap-1.5"
          >
            {o.scenario_name}
            {o.is_basecase && <Badge variant="secondary" className="text-[10px] px-1">Base</Badge>}
          </Button>
        ))}
      </div>

      {active.calculated_at && (
        <p className="text-xs text-muted-foreground">Calculated: {active.calculated_at}</p>
      )}
      {isUtilOnly && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          Utilization-only run: MCT and WIP are zero until a full calculate is stored.
        </p>
      )}

      <Tabs defaultValue="products">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="labor">Labor</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="ibom">IBOM</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Results Table</CardTitle>
              <CardDescription>All columns shown to users after a full calculate</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminReadOnlyDataTable
                columns={PRODUCT_RESULT_COLUMNS}
                rows={productRows}
                rowKey={(row) => row.id}
                emptyMessage="No product results"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Equipment Results Table</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminReadOnlyDataTable
                columns={EQUIPMENT_RESULT_COLUMNS}
                rows={equipmentRows}
                rowKey={(row) => row.name}
                emptyMessage="No equipment results"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labor" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Labor Results Table</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminReadOnlyDataTable
                columns={LABOR_RESULT_COLUMNS}
                rows={laborRows}
                rowKey={(row) => row.name}
                emptyMessage="No labor results"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Operation Details</CardTitle>
              <CardDescription>Per-operation metrics with product names (read-only)</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminReadOnlyDataTable
                columns={OPERATION_RESULT_COLUMNS}
                rows={operationRows}
                rowKey={(row, i) => `${row.productName}-${row.opName}-${i}`}
                emptyMessage="No operation results"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ibom" className="mt-4">
          <AdminIbomOutput model={model} results={r} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
