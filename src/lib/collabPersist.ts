import { collabWireColumn, type CollabEntity } from '@/lib/collabEntities';
import { backendColumnToOpField } from '@/lib/modelCollab';
import { db } from '@/lib/supabaseData';
import { useModelStore } from '@/stores/modelStore';
import type { EquipmentGroup, IBOMEntry, LaborGroup, Operation, Product, RoutingEntry } from '@/stores/modelStore';

export type PersistCollabResult = { canonicalRowId: string; merged?: boolean };

function modelSnapshot(modelId: string) {
  return useModelStore.getState().models.find((m) => m.id === modelId);
}

/** Persist one cell to the database via REST (authoritative save). */
export async function persistCollabCellToDb(
  modelId: string,
  entity: CollabEntity,
  rowId: string,
  field: string,
  value: unknown,
): Promise<PersistCollabResult | void> {
  const model = modelSnapshot(modelId);

  if (entity === 'operation') {
    const row = model?.operations.find((o) => o.id === rowId);
    const key = field as keyof Operation;
    await db.updateOperation(modelId, rowId, { [key]: value } as Partial<Operation>, row);
    return;
  }
  if (entity === 'product') {
    const row = model?.products.find((p) => p.id === rowId);
    await db.updateProduct(modelId, rowId, { [field]: value } as Partial<Product>, row);
    return;
  }
  if (entity === 'equipment') {
    const row = model?.equipment.find((e) => e.id === rowId);
    await db.updateEquipment(
      modelId,
      rowId,
      { [field]: value } as Partial<EquipmentGroup>,
      row,
      model?.labor,
    );
    return;
  }
  if (entity === 'labor') {
    const row = model?.labor.find((l) => l.id === rowId);
    await db.updateLabor(modelId, rowId, { [field]: value } as Partial<LaborGroup>, row);
    return;
  }
  if (entity === 'general') {
    await db.updateGeneral(modelId, { [field]: value } as Partial<import('@/stores/modelStore').GeneralData>);
    return;
  }
  if (entity === 'routing') {
    const row = model?.routing.find((r) => r.id === rowId);
    const res = await db.updateRouting(modelId, rowId, { [field]: value } as Partial<RoutingEntry>, row);
    return { canonicalRowId: res.id, merged: res.merged };
  }
  if (entity === 'ibom') {
    const row = model?.ibom.find((e) => e.id === rowId);
    await db.updateIBOM(modelId, rowId, { [field]: value } as Partial<IBOMEntry>, row);
    return;
  }
}

export function collabFieldFromWireMessage(
  entity: CollabEntity,
  column: string,
): string | null {
  if (entity === 'operation') {
    return backendColumnToOpField[column] ?? null;
  }
  return column || null;
}

export function collabWireColumnForField(entity: CollabEntity, field: string): string | null {
  return collabWireColumn(entity, field);
}
