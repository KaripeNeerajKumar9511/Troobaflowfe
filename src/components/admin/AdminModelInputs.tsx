import type { Model } from '@/stores/modelStore';
import { displayParamNames } from '@/stores/modelStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ROInput, ROSelect, ROTextarea, ROCheckbox } from '@/components/admin/readOnlyFields';
import {
  MCT_TIME_UNIT_OPTIONS,
  OPS_TIME_UNIT_OPTIONS,
  PROD_PERIOD_UNIT_OPTIONS,
} from '@/lib/timeUnits';

export function AdminModelInputs({ model }: { model: Model }) {
  const g = model.general;
  const pn = displayParamNames(model);

  return (
    <div className="animate-fade-in">
      <p className="text-sm text-muted-foreground mb-4">
        Read-only view of data as entered in the workspace (General, Labor, Equipment, Products, Operations, Routing, IBOM).
      </p>
      <Tabs defaultValue="general">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="labor">Labor ({model.labor.length})</TabsTrigger>
          <TabsTrigger value="equipment">Equipment ({model.equipment.length})</TabsTrigger>
          <TabsTrigger value="products">Products ({model.products.length})</TabsTrigger>
          <TabsTrigger value="operations">Operations ({model.operations.length})</TabsTrigger>
          <TabsTrigger value="routing">Routing ({model.routing.length})</TabsTrigger>
          <TabsTrigger value="ibom">IBOM ({model.ibom.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Tabs defaultValue="time">
            <TabsList>
              <TabsTrigger value="time">Time Settings</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
            <TabsContent value="time" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Time Settings</CardTitle>
                  <CardDescription>Model time units and calendar conversions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ROInput label="Model Title" value={g.model_title} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ROSelect label="Operations Time Unit" value={g.ops_time_unit} options={OPS_TIME_UNIT_OPTIONS} />
                    <ROSelect label="MCT Time Unit" value={g.mct_time_unit} options={MCT_TIME_UNIT_OPTIONS} />
                    <ROSelect label="Production Period" value={g.prod_period_unit} options={PROD_PERIOD_UNIT_OPTIONS} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <ROInput label="MCT Conversion" value={g.conv1} />
                    <ROInput label="Prod. Period Conversion" value={g.conv2} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="advanced" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Variability & Limits</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <ROInput label="Utilization Limit (%)" value={g.util_limit} />
                  <ROInput label="Equipment Variability %" value={g.var_equip} />
                  <ROInput label="Labor Variability %" value={g.var_labor} />
                  <ROInput label="Product Variability %" value={g.var_prod} />
                  <ROInput label={pn.gen1_name || 'Gen1'} value={g.gen1} />
                  <ROInput label={pn.gen2_name || 'Gen2'} value={g.gen2} />
                  <ROInput label={pn.gen3_name || 'Gen3'} value={g.gen3} />
                  <ROInput label={pn.gen4_name || 'Gen4'} value={g.gen4} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="comments" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <ROInput label="Author" value={g.author} />
                  <ROTextarea label="Comments" value={g.comments} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="labor" className="mt-4">
          {model.labor.length === 0 ? (
            <EmptySection label="No labor groups" />
          ) : (
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Overtime %</TableHead>
                      <TableHead>Unavail %</TableHead>
                      <TableHead>Dept</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {model.labor.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">{l.name}</TableCell>
                        <TableCell className="font-mono text-right">{l.count}</TableCell>
                        <TableCell className="font-mono text-right">{l.overtime_pct}</TableCell>
                        <TableCell className="font-mono text-right">{l.unavail_pct}</TableCell>
                        <TableCell>{l.dept_code || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="equipment" className="mt-4">
          {model.equipment.length === 0 ? (
            <EmptySection label="No equipment groups" />
          ) : (
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>MTTF</TableHead>
                      <TableHead>MTTR</TableHead>
                      <TableHead>Labor Group</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {model.equipment.map((e) => {
                      const laborName = model.labor.find((l) => l.id === e.labor_group_id)?.name ?? e.labor_group_id;
                      return (
                        <TableRow key={e.id}>
                          <TableCell className="font-medium">{e.name}</TableCell>
                          <TableCell>{e.equip_type}</TableCell>
                          <TableCell className="font-mono text-right">{e.count}</TableCell>
                          <TableCell className="font-mono text-right">{e.mttf}</TableCell>
                          <TableCell className="font-mono text-right">{e.mttr}</TableCell>
                          <TableCell>{laborName || '—'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="products" className="mt-4 space-y-4">
          {model.products.length === 0 ? (
            <EmptySection label="No products" />
          ) : (
            model.products.map((p) => (
              <Card key={p.id}>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">{p.name}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4">
                  <ROInput label="Demand" value={p.demand} />
                  <ROInput label="Lot Size" value={p.lot_size} />
                  <ROInput label="T-Batch Size" value={p.tbatch_size} />
                  <ROInput label="Demand Factor" value={p.demand_factor} />
                  <div className="col-span-2 flex flex-wrap gap-4">
                    <ROCheckbox label="Make to Stock" checked={p.make_to_stock} />
                    <ROCheckbox label="Gather T-Batches" checked={p.gather_tbatches} />
                  </div>
                  <ROInput label="Dept Code" value={p.dept_code} />
                  <ROTextarea label="Comments" value={p.comments} className="col-span-2 sm:col-span-4" />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="operations" className="mt-4">
          {model.operations.length === 0 ? (
            <EmptySection label="No operations" />
          ) : (
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Op #</TableHead>
                      <TableHead>Operation</TableHead>
                      <TableHead>Equipment</TableHead>
                      <TableHead>% Assigned</TableHead>
                      <TableHead>Eq Setup Lot</TableHead>
                      <TableHead>Eq Run Piece</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {model.operations.map((op) => {
                      const productName = model.products.find((p) => p.id === op.product_id)?.name ?? '—';
                      const equipName = model.equipment.find((e) => e.id === op.equip_id)?.name ?? '—';
                      return (
                        <TableRow key={op.id}>
                          <TableCell>{productName}</TableCell>
                          <TableCell className="font-mono">{op.op_number}</TableCell>
                          <TableCell className="font-medium">{op.op_name}</TableCell>
                          <TableCell>{equipName}</TableCell>
                          <TableCell className="font-mono text-right">{op.pct_assigned}</TableCell>
                          <TableCell className="font-mono text-right">{op.equip_setup_lot}</TableCell>
                          <TableCell className="font-mono text-right">{op.equip_run_piece}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="routing" className="mt-4">
          {model.routing.length === 0 ? (
            <EmptySection label="No routing rows" />
          ) : (
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>% Routed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {model.routing.map((r) => {
                      const productName = model.products.find((p) => p.id === r.product_id)?.name ?? '—';
                      return (
                        <TableRow key={r.id}>
                          <TableCell>{productName}</TableCell>
                          <TableCell>{r.from_op_name}</TableCell>
                          <TableCell>{r.to_op_name}</TableCell>
                          <TableCell className="font-mono text-right">{r.pct_routed}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ibom" className="mt-4">
          {model.ibom.length === 0 ? (
            <EmptySection label="No IBOM relationships" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">IBOM Structure</CardTitle>
                <CardDescription>Parent assembly → component links and units per assembly</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parent Assembly</TableHead>
                      <TableHead>Component</TableHead>
                      <TableHead className="text-right">Units per Assy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {model.ibom.map((entry) => {
                      const parentName =
                        model.products.find((p) => p.id === entry.parent_product_id)?.name ?? '—';
                      const componentName =
                        model.products.find((p) => p.id === entry.component_product_id)?.name ?? '—';
                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">{parentName}</TableCell>
                          <TableCell>{componentName}</TableCell>
                          <TableCell className="font-mono text-right">{entry.units_per_assy}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptySection({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="py-10 text-center text-sm text-muted-foreground">{label}</CardContent>
    </Card>
  );
}
