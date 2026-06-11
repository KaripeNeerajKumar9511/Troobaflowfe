import type {
  EquipmentGroup,
  LaborGroup,
  Model,
  Product,
} from '@/stores/modelStore';
import { useModelStore } from '@/stores/modelStore';
import { db } from '@/lib/supabaseData';
import { normalizeKey } from './masterCatalog';
import type { FactorResults, FactorUploadScope } from './types';

type TableScope = Extract<FactorUploadScope, 'product' | 'operation'>;

export interface ApplyFactorsHandlers {
  updateProduct: (modelId: string, productId: string, data: Partial<Product>) => void;
  updateEquipment: (modelId: string, eqId: string, data: Partial<EquipmentGroup>) => void;
  updateLabor: (modelId: string, laborId: string, data: Partial<LaborGroup>) => void;
}

export interface ApplyFactorsResult {
  applied: number;
  skipped: number;
}

/** @deprecated Prefer applyFactorsToModelAsync for persisted + collab sync. */
export function applyFactorsToModel(
  model: Model,
  scope: TableScope,
  factors: FactorResults,
  handlers: ApplyFactorsHandlers
): ApplyFactorsResult {
  let applied = 0;
  let skipped = 0;

  if (scope === 'product') {
    for (const row of factors.products) {
      const product = model.products.find(
        (p) => normalizeKey(p.name) === normalizeKey(row.product)
      );
      if (!product) {
        skipped++;
        continue;
      }
      handlers.updateProduct(model.id, product.id, {
        demand_factor: row.demandFactor,
        lot_factor: row.lotFactor,
        var_factor: row.variabilityFactor,
      });
      applied++;
    }
    return { applied, skipped };
  }

  for (const row of factors.equipment) {
    const eq = model.equipment.find(
      (e) => normalizeKey(e.name) === normalizeKey(row.equipment)
    );
    if (!eq) {
      skipped++;
      continue;
    }
    handlers.updateEquipment(model.id, eq.id, {
      setup_factor: row.setupFactor,
      run_factor: row.runFactor,
      var_factor: row.variabilityFactor,
    });
    applied++;
  }

  for (const row of factors.labor) {
    const labor = model.labor.find(
      (l) => normalizeKey(l.name) === normalizeKey(row.laborGroup)
    );
    if (!labor) {
      skipped++;
      continue;
    }
    handlers.updateLabor(model.id, labor.id, {
      setup_factor: row.setupFactor,
      run_factor: row.runFactor,
      var_factor: row.variabilityFactor,
    });
    applied++;
  }

  return { applied, skipped };
}

type ProductPatch = { id: string; data: Partial<Product>; row: Product };
type EquipmentPatch = { id: string; data: Partial<EquipmentGroup>; row: EquipmentGroup };
type LaborPatch = { id: string; data: Partial<LaborGroup>; row: LaborGroup };

function collectPatches(
  model: Model,
  scope: TableScope,
  factors: FactorResults
): {
  productPatches: ProductPatch[];
  equipmentPatches: EquipmentPatch[];
  laborPatches: LaborPatch[];
  applied: number;
  skipped: number;
} {
  const productPatches: ProductPatch[] = [];
  const equipmentPatches: EquipmentPatch[] = [];
  const laborPatches: LaborPatch[] = [];
  let applied = 0;
  let skipped = 0;

  if (scope === 'product') {
    for (const row of factors.products) {
      const product = model.products.find(
        (p) => normalizeKey(p.name) === normalizeKey(row.product)
      );
      if (!product) {
        skipped++;
        continue;
      }
      const data = {
        demand_factor: row.demandFactor,
        lot_factor: row.lotFactor,
        var_factor: row.variabilityFactor,
      };
      productPatches.push({ id: product.id, data, row: product });
      applied++;
    }
    return { productPatches, equipmentPatches, laborPatches, applied, skipped };
  }

  for (const row of factors.equipment) {
    const eq = model.equipment.find(
      (e) => normalizeKey(e.name) === normalizeKey(row.equipment)
    );
    if (!eq) {
      skipped++;
      continue;
    }
    equipmentPatches.push({
      id: eq.id,
      data: {
        setup_factor: row.setupFactor,
        run_factor: row.runFactor,
        var_factor: row.variabilityFactor,
      },
      row: eq,
    });
    applied++;
  }

  for (const row of factors.labor) {
    const labor = model.labor.find(
      (l) => normalizeKey(l.name) === normalizeKey(row.laborGroup)
    );
    if (!labor) {
      skipped++;
      continue;
    }
    laborPatches.push({
      id: labor.id,
      data: {
        setup_factor: row.setupFactor,
        run_factor: row.runFactor,
        var_factor: row.variabilityFactor,
      },
      row: labor,
    });
    applied++;
  }

  return { productPatches, equipmentPatches, laborPatches, applied, skipped };
}

function applyPatchesToStore(
  modelId: string,
  productPatches: ProductPatch[],
  equipmentPatches: EquipmentPatch[],
  laborPatches: LaborPatch[]
): void {
  useModelStore.setState((s) => ({
    models: s.models.map((m) => {
      if (m.id !== modelId) return m;
      let products = m.products;
      let equipment = m.equipment;
      let labor = m.labor;

      if (productPatches.length > 0) {
        const byId = new Map(productPatches.map((p) => [p.id, p.data]));
        products = products.map((p) =>
          byId.has(p.id) ? { ...p, ...byId.get(p.id)! } : p
        );
      }
      if (equipmentPatches.length > 0) {
        const byId = new Map(equipmentPatches.map((p) => [p.id, p.data]));
        equipment = equipment.map((e) =>
          byId.has(e.id) ? { ...e, ...byId.get(e.id)! } : e
        );
      }
      if (laborPatches.length > 0) {
        const byId = new Map(laborPatches.map((p) => [p.id, p.data]));
        labor = labor.map((l) => (byId.has(l.id) ? { ...l, ...byId.get(l.id)! } : l));
      }

      return {
        ...m,
        products,
        equipment,
        labor,
        updated_at: new Date().toISOString(),
        run_status: 'needs_recalc' as const,
      };
    }),
  }));
}

/** Persist factor updates, then caller should refresh store + notify org (collab). */
export async function applyFactorsToModelAsync(
  model: Model,
  scope: TableScope,
  factors: FactorResults
): Promise<ApplyFactorsResult> {
  const { productPatches, equipmentPatches, laborPatches, applied, skipped } =
    collectPatches(model, scope, factors);

  if (applied === 0) {
    return { applied, skipped };
  }

  applyPatchesToStore(model.id, productPatches, equipmentPatches, laborPatches);

  const writes: Promise<void>[] = [
    ...productPatches.map((p) =>
      db.updateProduct(model.id, p.id, p.data, p.row)
    ),
    ...equipmentPatches.map((p) =>
      db.updateEquipment(model.id, p.id, p.data, p.row)
    ),
    ...laborPatches.map((p) => db.updateLabor(model.id, p.id, p.data, p.row)),
  ];

  await Promise.all(writes);
  await db.updateModel(model.id, { run_status: 'needs_recalc' });

  return { applied, skipped };
}

export function mergeProductFactorFields(
  draft: Product[],
  fresh: Model
): Product[] {
  return draft.map((p) => {
    const src = fresh.products.find((x) => x.id === p.id);
    return src
      ? {
          ...p,
          demand_factor: src.demand_factor,
          lot_factor: src.lot_factor,
          var_factor: src.var_factor,
        }
      : p;
  });
}

export function mergeEquipmentFactorFields(
  draft: EquipmentGroup[],
  fresh: Model
): EquipmentGroup[] {
  return draft.map((e) => {
    const src = fresh.equipment.find((x) => x.id === e.id);
    return src
      ? {
          ...e,
          setup_factor: src.setup_factor,
          run_factor: src.run_factor,
          var_factor: src.var_factor,
        }
      : e;
  });
}

export function mergeLaborFactorFields(
  draft: LaborGroup[],
  fresh: Model
): LaborGroup[] {
  return draft.map((l) => {
    const src = fresh.labor.find((x) => x.id === l.id);
    return src
      ? {
          ...l,
          setup_factor: src.setup_factor,
          run_factor: src.run_factor,
          var_factor: src.var_factor,
        }
      : l;
  });
}
