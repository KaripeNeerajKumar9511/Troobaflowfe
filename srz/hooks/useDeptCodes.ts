import { useState, useEffect, useCallback } from 'react';
import { apiFetch, apiJson } from '@/lib/api';
import {
  type Catalog,
  type DeptCode,
  type DeptCodeSection,
  getCatalog,
  setCatalog,
  subscribe,
} from '@/lib/deptCodesCatalog';
import { useModelStore } from '@/stores/modelStore';

export type { DeptCode, DeptCodeSection };

const DEFAULT_VALUE = 'out of area';

function emptyCatalog(modelId: string): Catalog {
  return {
    labor: [],
    equipment: [
      {
        id: crypto.randomUUID(),
        model_id: modelId,
        value: DEFAULT_VALUE,
        is_default: true,
        section: 'equipment',
      },
    ],
    product: [],
  };
}

function normalizeCatalog(raw: Catalog | null | undefined, modelId: string): Catalog {
  const data = raw ? { ...raw } : {};
  if (!data.labor) data.labor = [];
  if (!data.product) data.product = [];
  if (!data.equipment) data.equipment = [];
  return data;
}

/** Merge product dept codes already used on rows into the catalog (product section only). */
function mergeProductDeptCodesInUse(catalog: Catalog, modelId: string): { catalog: Catalog; changed: boolean } {
  const model = useModelStore.getState().models.find((m) => m.id === modelId);
  if (!model?.products?.length) return { catalog, changed: false };

  const existing = new Set(catalog.product.map((d) => d.value.toLowerCase()));
  const additions: DeptCode[] = [];

  for (const p of model.products) {
    const v = (p.dept_code || '').trim();
    if (!v || existing.has(v.toLowerCase())) continue;
    existing.add(v.toLowerCase());
    additions.push({
      id: crypto.randomUUID(),
      model_id: modelId,
      value: v,
      is_default: false,
      section: 'product',
    });
  }

  if (!additions.length) return { catalog, changed: false };
  return {
    catalog: { ...catalog, product: [...catalog.product, ...additions] },
    changed: true,
  };
}

async function fetchCatalog(modelId: string): Promise<Catalog> {
  const raw = (await apiJson<Catalog>(`/api/models/${modelId}/dept-codes/`)) || {};
  return normalizeCatalog(raw, modelId);
}

export function useDeptCodes(modelId: string | undefined, section: DeptCodeSection) {
  const [, bump] = useState(0);
  const loadingKey = modelId ? `${modelId}:loading` : '';
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!modelId) return;
    return subscribe(modelId, () => bump((n) => n + 1));
  }, [modelId]);

  const load = useCallback(async () => {
    if (!modelId) return;
    setLoading(true);
    try {
      let data = await fetchCatalog(modelId);

      if (section === 'equipment' && !data.equipment.some((r) => r.value.toLowerCase() === DEFAULT_VALUE)) {
        data = {
          ...data,
          equipment: [
            {
              id: crypto.randomUUID(),
              model_id: modelId,
              value: DEFAULT_VALUE,
              is_default: true,
              section: 'equipment',
            },
            ...data.equipment,
          ],
        };
        await apiFetch(`/api/models/${modelId}/dept-codes/save/`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      }

      if (section === 'product') {
        const merged = mergeProductDeptCodesInUse(data, modelId);
        if (merged.changed) {
          data = merged.catalog;
          await apiFetch(`/api/models/${modelId}/dept-codes/save/`, {
            method: 'PUT',
            body: JSON.stringify(data),
          });
        }
      }

      setCatalog(modelId, data);
    } catch {
      setCatalog(modelId, emptyCatalog(modelId));
    } finally {
      setLoading(false);
    }
  }, [modelId, section]);

  useEffect(() => {
    if (!modelId) return;
    if (!getCatalog(modelId)) void load();
    else setLoading(false);
  }, [modelId, load]);

  const catalog = modelId ? getCatalog(modelId) : null;
  const deptCodes = catalog?.[section] || [];

  const persist = useCallback(
    async (updater: (current: Catalog) => Catalog) => {
      if (!modelId) return { error: 'No model' as const };
      try {
        const fresh = await fetchCatalog(modelId);
        const next = updater(fresh);
        setCatalog(modelId, next);
        const res = await apiFetch(`/api/models/${modelId}/dept-codes/save/`, {
          method: 'PUT',
          body: JSON.stringify(next),
        });
        if (!res.ok) {
          await load();
          return { error: 'Save failed' as const };
        }
        setCatalog(modelId, next);
        return { error: null };
      } catch {
        await load();
        return { error: 'Save failed' as const };
      }
    },
    [modelId, load],
  );

  const addDeptCode = async (value: string) => {
    if (!modelId || !value.trim()) return { error: 'Invalid value' as const };
    const trimmed = value.trim();
    if (deptCodes.some((d) => d.value.toLowerCase() === trimmed.toLowerCase())) {
      return { error: 'Duplicate' as const };
    }
    const row: DeptCode = {
      id: crypto.randomUUID(),
      model_id: modelId,
      value: trimmed,
      is_default: false,
      section,
    };
    const result = await persist((current) => ({
      ...current,
      [section]: [...(current[section] || []), row],
    }));
    if (result.error) return result;
    return { data: row, error: null };
  };

  const updateDeptCode = async (id: string, newValue: string) => {
    if (!newValue.trim()) return { error: 'Invalid value' as const };
    return persist((current) => ({
      ...current,
      [section]: (current[section] || []).map((d) =>
        d.id === id ? { ...d, value: newValue.trim() } : d,
      ),
    }));
  };

  const deleteDeptCode = async (id: string) => {
    return persist((current) => ({
      ...current,
      [section]: (current[section] || []).filter((d) => d.id !== id),
    }));
  };

  return { deptCodes, loading, reload: load, addDeptCode, updateDeptCode, deleteDeptCode };
}
