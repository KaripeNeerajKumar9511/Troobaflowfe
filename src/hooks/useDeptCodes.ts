import { useState, useEffect, useCallback } from 'react';
import { apiFetch, apiJson } from '@/lib/api';

export type DeptCodeSection = 'labor' | 'equipment' | 'product';

export interface DeptCode {
  id: string;
  model_id: string;
  value: string;
  is_default: boolean;
  section: DeptCodeSection;
}

const DEFAULT_VALUE = 'out of area';

type Catalog = Record<string, DeptCode[]>;

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

export function useDeptCodes(modelId: string | undefined, section: DeptCodeSection) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);

  const persist = useCallback(
    async (next: Catalog) => {
      if (!modelId) return;
      setCatalog(next);
      await apiFetch(`/api/models/${modelId}/dept-codes/save/`, {
        method: 'PUT',
        body: JSON.stringify(next),
      });
    },
    [modelId],
  );

  const load = useCallback(async () => {
    if (!modelId) return;
    setLoading(true);
    try {
      let data = (await apiJson<Catalog>(`/api/models/${modelId}/dept-codes/`)) || {};
      if (!data.labor) data.labor = [];
      if (!data.product) data.product = [];
      if (!data.equipment) data.equipment = [];
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
      setCatalog(data);
    } catch {
      setCatalog(emptyCatalog(modelId));
    } finally {
      setLoading(false);
    }
  }, [modelId, section]);

  useEffect(() => {
    load();
  }, [load]);

  const deptCodes = catalog?.[section] || [];

  const addDeptCode = async (value: string) => {
    if (!modelId || !value.trim() || !catalog) return;
    const trimmed = value.trim();
    if (deptCodes.some((d) => d.value.toLowerCase() === trimmed.toLowerCase())) return;
    const row: DeptCode = {
      id: crypto.randomUUID(),
      model_id: modelId,
      value: trimmed,
      is_default: false,
      section,
    };
    const next = { ...catalog, [section]: [...deptCodes, row] };
    await persist(next);
    return { data: row, error: null };
  };

  const updateDeptCode = async (id: string, newValue: string) => {
    if (!newValue.trim() || !catalog) return;
    const next = {
      ...catalog,
      [section]: deptCodes.map((d) => (d.id === id ? { ...d, value: newValue.trim() } : d)),
    };
    await persist(next);
    return { error: null };
  };

  const deleteDeptCode = async (id: string) => {
    if (!catalog) return;
    const next = {
      ...catalog,
      [section]: deptCodes.filter((d) => d.id !== id),
    };
    await persist(next);
    return { error: null };
  };

  return { deptCodes, loading, reload: load, addDeptCode, updateDeptCode, deleteDeptCode };
}
