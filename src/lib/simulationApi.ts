import type { Model } from '@/stores/modelStore';
import type { Scenario } from '@/stores/scenarioStore';
import type { CalcResults } from '@/lib/calculationEngine';
import { apiJson } from '@/lib/api';

export function scenarioToApi(scenario: Scenario | null | undefined): Record<string, unknown> | null {
  if (!scenario?.changes?.length) return null;
  return {
    changes: scenario.changes.map((c) => ({
      dataType: c.dataType,
      entityId: c.entityId,
      field: c.field,
      whatIfValue: c.whatIfValue,
    })),
  };
}

function normalizeResults(raw: Record<string, unknown>): CalcResults {
  const r = raw as unknown as CalcResults & { operations?: unknown[] };
  return {
    equipment: (r.equipment || []) as CalcResults['equipment'],
    labor: (r.labor || []) as CalcResults['labor'],
    products: (r.products || []) as CalcResults['products'],
    operations: (r.operations || []) as CalcResults['operations'],
    warnings: (r.warnings || []) as string[],
    errors: (r.errors || []) as string[],
    overLimitResources: (r.overLimitResources || []) as string[],
    calculatedAt: (r.calculatedAt || new Date().toISOString()) as string,
  };
}

export async function fullCalculate(model: Model, scenario?: Scenario | null): Promise<CalcResults> {
  const body: Record<string, unknown> = { model };
  const s = scenarioToApi(scenario ?? undefined);
  if (s) body.scenario = s;
  const data = await apiJson<{ results: Record<string, unknown> }>('/api/simulations/full-calculate', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!data?.results) throw new Error('Invalid calculate response');
  return normalizeResults(data.results);
}

export async function verifyModel(model: Model): Promise<{ errors: string[]; warnings: string[] }> {
  return apiJson<{ errors: string[]; warnings: string[] }>('/api/simulations/verify', {
    method: 'POST',
    body: JSON.stringify({ model }),
  });
}
