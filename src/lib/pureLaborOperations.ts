import type { EquipmentGroup, Model, Operation } from '@/stores/modelStore';
import { isPureLaborEquipment } from '@/lib/pureLabor';

export const PURE_LABOR_OPERATION_EQUIP_TOOLTIP =
  'This Operation comes under pure labor and it is not editable.';

/** Operation fields that mirror labor times when equipment is pure labor. */
export const OPERATION_EQUIP_TIME_FIELDS = [
  'equip_setup_lot',
  'equip_setup_piece',
  'equip_setup_tbatch',
  'equip_run_piece',
  'equip_run_lot',
  'equip_run_tbatch',
] as const;

export type OperationEquipTimeField = (typeof OPERATION_EQUIP_TIME_FIELDS)[number];

const EQUIP_TO_LABOR: Record<OperationEquipTimeField, keyof Operation> = {
  equip_setup_lot: 'labor_setup_lot',
  equip_setup_piece: 'labor_setup_piece',
  equip_setup_tbatch: 'labor_setup_tbatch',
  equip_run_piece: 'labor_run_piece',
  equip_run_lot: 'labor_run_lot',
  equip_run_tbatch: 'labor_run_tbatch',
};

export function isOperationEquipTimeField(field: string): field is OperationEquipTimeField {
  return (OPERATION_EQUIP_TIME_FIELDS as readonly string[]).includes(field);
}

export function isPureLaborOperation(op: Operation, equipment: EquipmentGroup[]): boolean {
  if (!op.equip_id) return false;
  const eq = equipment.find((e) => e.id === op.equip_id);
  return eq != null && isPureLaborEquipment(eq);
}

export function canEditOperationEquipField(
  op: Operation,
  field: keyof Operation | string,
  equipment: EquipmentGroup[],
): boolean {
  if (!isOperationEquipTimeField(field)) return true;
  return !isPureLaborOperation(op, equipment);
}

/** For solver/API: copy labor operation times into equipment time fields. */
export function resolvePureLaborOperation(op: Operation, equipment: EquipmentGroup[]): Operation {
  if (!isPureLaborOperation(op, equipment)) return op;
  const resolved = { ...op };
  for (const equipField of OPERATION_EQUIP_TIME_FIELDS) {
    const laborField = EQUIP_TO_LABOR[equipField];
    (resolved as Record<string, number>)[equipField] = op[laborField] as number;
  }
  return resolved;
}

export function resolveModelOperationsPureLabor(model: Model): Operation[] {
  const equipment = model.equipment ?? [];
  return (model.operations ?? []).map((op) => resolvePureLaborOperation(op, equipment));
}
