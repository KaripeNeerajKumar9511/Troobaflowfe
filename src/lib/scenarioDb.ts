import { apiFetch, apiJson } from '@/lib/api';
import type { Scenario, ScenarioChange } from '@/stores/scenarioStore';
import type { CalcResults } from '@/lib/calculationEngine';

export async function loadScenariosForModel(modelId: string): Promise<{
  scenarios: Scenario[];
  results: Record<string, CalcResults>;
}> {
  try {
    const data = await apiJson<{ scenarios: Scenario[]; results: Record<string, CalcResults> }>(
      `/api/models/${modelId}/scenarios/`,
    );
    return { scenarios: data.scenarios || [], results: data.results || {} };
  } catch (e) {
    console.error('loadScenariosForModel', e);
    return { scenarios: [], results: {} };
  }
}

export async function loadBasecaseResults(modelId: string): Promise<CalcResults | null> {
  try {
    const res = await apiFetch(`/api/models/${modelId}/scenarios/basecase/results/`);
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text === 'null') return null;
    return JSON.parse(text) as CalcResults;
  } catch {
    return null;
  }
}

export async function ensureBasecaseScenario(modelId: string): Promise<string> {
  try {
    const data = await apiJson<{ id: string }>(`/api/models/${modelId}/scenarios/basecase/`, {
      method: 'POST',
      body: '{}',
    });
    return data.id || '';
  } catch (e) {
    console.error('ensureBasecaseScenario', e);
    return '';
  }
}

export const scenarioDb = {
  async create(modelId: string, name: string, description: string): Promise<string | null> {
    try {
      const data = await apiJson<{ id: string }>(`/api/models/${modelId}/scenarios/`, {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });
      return data.id || null;
    } catch (e) {
      console.error('createScenario', e);
      return null;
    }
  },

  async update(id: string, data: { name?: string; description?: string; status?: string }) {
    const res = await apiFetch(`/api/scenarios/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!res.ok) console.error('updateScenario', res.status);
  },

  async delete(id: string) {
    const res = await apiFetch(`/api/scenarios/${id}/delete/`, { method: 'DELETE' });
    if (!res.ok) console.error('deleteScenario', res.status);
  },

  async upsertChange(scenarioId: string, change: ScenarioChange) {
    await apiFetch(`/api/scenarios/${scenarioId}/changes/`, {
      method: 'PUT',
      body: JSON.stringify({
        id: change.id,
        dataType: change.dataType,
        entityId: change.entityId,
        entityName: change.entityName,
        field: change.field,
        basecaseValue: change.basecaseValue,
        whatIfValue: change.whatIfValue,
      }),
    });
  },

  async removeChange(scenarioId: string, changeId: string) {
    const res = await apiFetch(`/api/scenarios/${scenarioId}/changes/${changeId}/delete/`, {
      method: 'DELETE',
    });
    if (!res.ok) console.error('removeChange', res.status);
  },

  async saveResults(scenarioId: string, results: CalcResults) {
    const res = await apiFetch(`/api/scenarios/${scenarioId}/results/`, {
      method: 'PUT',
      body: JSON.stringify(results),
    });
    if (!res.ok) console.error('saveResults', res.status);
  },

  async saveBasecaseResults(modelId: string, results: CalcResults) {
    const res = await apiFetch(`/api/models/${modelId}/scenarios/basecase/results/`, {
      method: 'PUT',
      body: JSON.stringify(results),
    });
    if (!res.ok) console.error('saveBasecaseResults', res.status);
  },
};
