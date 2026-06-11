import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Save } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { fullCalculate } from '@/lib/simulationApi';
import { useScenarioStore } from '@/stores/scenarioStore';
import { toast } from '@/hooks/use-toast';
import type { Model } from '@/stores/modelStore';
import type { CalcResults } from '@/lib/calculationEngine';
import troobaMarkDark from '@/assets/trooba-mark-dark.svg';

interface Props {
  model: Model;
  results: CalcResults | undefined;
}

interface SweepPoint {
  lotSize: number;
  mct: number;
  wip: number;
  maxUtil: number;
}

export function LotSizeExplorer({ model, results }: Props) {
  const productsWithDemand = useMemo(() => model.products.filter(p => p.demand > 0), [model]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(productsWithDemand.map(p => p.id)));

  const createScenario = useScenarioStore(s => s.createScenario);
  const applyChange = useScenarioStore(s => s.applyScenarioChange);

  const toggleProduct = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedKey = useMemo(() => [...selectedIds].sort().join(','), [selectedIds]);
  const [sweepData, setSweepData] = useState<Map<string, { points: SweepPoint[]; optimal: number; rangeMin: number; rangeMax: number }>>(new Map());
  const [sweepLoading, setSweepLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function runSweep() {
      setSweepLoading(true);
      const data = new Map<string, { points: SweepPoint[]; optimal: number; rangeMin: number; rangeMax: number }>();
      try {
        for (const product of productsWithDemand) {
          if (!selectedIds.has(product.id)) continue;
          const currentLot = product.lot_size;
          const minLot = Math.max(1, Math.round(currentLot * 0.25));
          const maxLot = Math.round(currentLot * 3);
          const steps = 16;
          const stepSize = Math.max(1, Math.round((maxLot - minLot) / steps));
          const points: SweepPoint[] = [];
          let bestWip = Infinity;
          let bestLot = currentLot;
          for (let lot = minLot; lot <= maxLot; lot += stepSize) {
            if (cancelled) return;
            const trialModel = {
              ...model,
              products: model.products.map(p => (p.id === product.id ? { ...p, lot_size: lot } : { ...p })),
            };
            const r = await fullCalculate(trialModel);
            const pr = r.products.find(p => p.id === product.id);
            const maxUtil = Math.max(0, ...r.equipment.map(e => e.totalUtil));
            points.push({
              lotSize: lot,
              mct: pr?.mct || 0,
              wip: pr?.wip || 0,
              maxUtil,
            });
            if (pr && pr.wip < bestWip && maxUtil < model.general.util_limit) {
              bestWip = pr.wip;
              bestLot = lot;
            }
          }
          const margin = Math.round(bestLot * 0.15);
          data.set(product.id, {
            points,
            optimal: bestLot,
            rangeMin: Math.max(1, bestLot - margin),
            rangeMax: bestLot + margin,
          });
        }
        if (!cancelled) setSweepData(data);
      } catch (e) {
        console.error(e);
        if (!cancelled) toast({ title: 'Sweep failed', description: e instanceof Error ? e.message : 'Could not load lot sweep', variant: 'destructive' });
      } finally {
        if (!cancelled) setSweepLoading(false);
      }
    }
    void runSweep();
    return () => {
      cancelled = true;
    };
  }, [model, selectedKey, productsWithDemand, model.general.util_limit]);

  const applyAsWhatIf = async () => {
    const scenarioId = await createScenario(model.id, `Lot Size Sweep — ${new Date().toLocaleDateString()}`);
    sweepData.forEach((sweep, prodId) => {
      const product = model.products.find(p => p.id === prodId);
      if (product && sweep.optimal !== product.lot_size) {
        applyChange(scenarioId, 'Product', prodId, product.name, 'lot_size', 'Lot Size', sweep.optimal);
      }
    });
    toast({ title: 'What-If Created', description: 'Selected lot sizes saved as a new What-If scenario.' });
  };

  const mctUnit = model.general.mct_time_unit?.toLowerCase() || 'day';

  if (!results) {
    return <p className="text-muted-foreground italic">Run a calculation first to use the Lot Size Explorer.</p>;
  }

  if (sweepLoading && sweepData.size === 0) {
    return (
      <Card>
        <CardContent className="py-10">
        <div className="flex flex-col items-center justify-center py-24 text-center">

{/* Animated Glow Ring */}
<div className="relative flex items-center justify-center">
  <div className="absolute h-50 w-50 rounded-full bg-primary/20 blur-2xl animate-pulse" />

  {/* Rotating Ring */}
  <div className="h-20 w-20 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />

  {/* Logo */}
  <img
    src={troobaMarkDark}
    alt=""
    className="absolute h-15 w-15"
  />
</div>

{/* Title */}
<p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
  Running Intelligent Optimization
</p>

{/* Animated Thinking Text */}
<p className="mt-1 text-sm text-muted-foreground/70 animate-pulse">
  Computing lot sweep via server...
</p>

{/* Animated Progress Bar */}
<div className="mt-6 w-72">
  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
    <div
      className="absolute h-full w-1/2 rounded-full bg-primary"
      style={{
        animation: "loading 1.2s linear infinite",
      }}
    />
  </div>
</div>

</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Product selector */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Select Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {productsWithDemand.map(p => (
              <label key={p.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <Checkbox
                  checked={selectedIds.has(p.id)}
                  onCheckedChange={() => toggleProduct(p.id)}
                />
                {p.name}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts per product */}
      {productsWithDemand.filter(p => selectedIds.has(p.id)).map(product => {
        const sweep = sweepData.get(product.id);
        if (!sweep) return null;

        return (
          <Card key={product.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {product.name} — Current: {product.lot_size} | Optimal: {sweep.optimal}
                <span className="text-muted-foreground text-xs ml-2">
                  (range: {sweep.rangeMin}–{sweep.rangeMax})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sweep.points} margin={{ top: 5, right: 40, bottom: 20, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="lotSize" label={{ value: 'Lot Size', position: 'insideBottom', offset: -10 }} tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" label={{ value: `MCT (${mctUnit}s)`, angle: -90, position: 'insideLeft' }} tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'WIP', angle: 90, position: 'insideRight' }} tick={{ fontSize: 11 }} />

                    {/* Optimal range highlight */}
                    <ReferenceArea
                      yAxisId="left"
                      x1={sweep.rangeMin}
                      x2={sweep.rangeMax}
                      fill="hsl(var(--success))"
                      fillOpacity={0.1}
                    />

                    {/* Current lot size */}
                    <ReferenceLine
                      yAxisId="left"
                      x={product.lot_size}
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="5 5"
                      label={{ value: 'Current', position: 'top', fontSize: 10 }}
                    />

                    {/* Util limit breach line */}
                    {sweep.points.some(p => p.maxUtil >= model.general.util_limit) && (
                      <ReferenceLine
                        yAxisId="left"
                        x={sweep.points.find(p => p.maxUtil >= model.general.util_limit)?.lotSize}
                        stroke="hsl(var(--destructive))"
                        strokeDasharray="3 3"
                        label={{ value: '⚠ Util Limit', position: 'top', fontSize: 10 }}
                      />
                    )}

                    <Line yAxisId="left" type="monotone" dataKey="mct" stroke="hsl(var(--info))" strokeWidth={2} dot={false} name="MCT" />
                    <Line yAxisId="right" type="monotone" dataKey="wip" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} name="WIP" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[hsl(var(--info))] inline-block" /> MCT</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[hsl(var(--warning))] inline-block" /> WIP</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 border-t border-dashed border-muted-foreground inline-block" /> Current</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[hsl(var(--success))]/10 inline-block rounded-sm" /> Optimal Range</span>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {selectedIds.size > 0 && (
        <div className="flex justify-end">
          <Button onClick={applyAsWhatIf} className="bg-primary text-primary-foreground">
            <Save className="h-4 w-4 mr-1" /> Apply as What-If
          </Button>
        </div>
      )}
    </div>
  );
}
