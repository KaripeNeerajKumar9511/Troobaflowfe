import type { EquipmentGroup, LaborGroup, Model } from '@/stores/modelStore';
import { resolveModelOperationsPureLabor } from '@/lib/pureLaborOperations';

export const PURE_LABOR_MTTF = 999999;
export const PURE_LABOR_MTTR = 0;

export const PURE_LABOR_TYPE_TOOLTIP =
  'Pure labor: no dedicated machines for this equipment group.';

export const PURE_LABOR_EQUIPMENT_TOOLTIP =
  'This equipment comes under pure labor and it is not editable.';

/** UI-only type; persisted to API as standard with fixed MTTF/MTTR. */
export function isPureLaborEquipment(eq: EquipmentGroup): boolean {
  return eq.equip_type === 'pure_labor';
}

/** Fields the user may edit when equip_type is pure_labor. */
export const PURE_LABOR_EDITABLE_FIELDS: (keyof EquipmentGroup)[] = [
  'name',
  'equip_type',
  'labor_group_id',
  'count',
];

export function canEditPureLaborField(field: keyof EquipmentGroup): boolean {
  return PURE_LABOR_EDITABLE_FIELDS.includes(field);
}

export function findLaborForEquipment(
  labor: LaborGroup[] | undefined,
  laborGroupId: string,
): LaborGroup | undefined {
  if (!laborGroupId || !labor?.length) return undefined;
  return labor.find((l) => l.id === laborGroupId);
}

/**
 * Effective equipment row for solver/API: pure labor inherits NA fields from linked labor.
 * Count and name remain on the equipment row; MTTF/MTTR stay at pure-labor solver values.
 */
export function resolvePureLaborEquipment(
  eq: EquipmentGroup,
  labor?: LaborGroup,
): EquipmentGroup {
  if (eq.equip_type !== 'pure_labor') return eq;
  const base = {
    ...eq,
    mttf: PURE_LABOR_MTTF,
    mttr: PURE_LABOR_MTTR,
  };
  if (!labor) return base;
  return {
    ...base,
    overtime_pct: labor.overtime_pct,
    unavail_pct: labor.unavail_pct,
    dept_code: labor.dept_code,
    setup_factor: labor.setup_factor,
    run_factor: labor.run_factor,
    var_factor: labor.var_factor,
    eq1: labor.lab1,
    eq2: labor.lab2,
    eq3: labor.lab3,
    eq4: labor.lab4,
    comments: labor.comments,
  };
}

/** Clone model with pure-labor equipment resolved against labor (for simulation/verify). */
export function modelWithResolvedPureLabor(model: Model): Model {
  const labor = model.labor ?? [];
  const equipment = (model.equipment ?? []).map((eq) =>
    resolvePureLaborEquipment(eq, findLaborForEquipment(labor, eq.labor_group_id)),
  );
  const resolvedModel = { ...model, labor, equipment };
  return {
    ...resolvedModel,
    operations: resolveModelOperationsPureLabor(resolvedModel),
  };
}

/** Legacy mirror rows / signature → pure_labor equip_type on load. */
function isLegacyPureLaborRow(eq: EquipmentGroup, labor?: LaborGroup[]): boolean {
  if (eq.is_pure_labor === true) return true;
  if (eq.mttf !== PURE_LABOR_MTTF || eq.mttr !== PURE_LABOR_MTTR || !eq.labor_group_id) return false;
  const linked = labor?.find((l) => l.id === eq.labor_group_id);
  return linked != null && linked.name === eq.name;
}

function toPureLaborEquipment(eq: EquipmentGroup): EquipmentGroup {
  const { is_pure_labor: _a, pure_labor_labor_id: _b, ...rest } = eq;
  return {
    ...rest,
    equip_type: 'pure_labor',
    mttf: PURE_LABOR_MTTF,
    mttr: PURE_LABOR_MTTR,
  };
}

/** Normalize loaded models: migrate legacy mirrors, strip labor pure_labor flags. */
export function enrichModelPureLabor(model: Model): Model {
  const labor = (model.labor ?? []).map(({ pure_labor: _p, ...l }) => l as LaborGroup);
  const equipment = (model.equipment ?? []).map((e) => {
    const fromApi =
      e.equip_type !== 'delay' &&
      e.mttf === PURE_LABOR_MTTF &&
      e.mttr === PURE_LABOR_MTTR &&
      !!e.labor_group_id;
    if (e.equip_type === 'pure_labor' || isLegacyPureLaborRow(e, labor) || fromApi) {
      return toPureLaborEquipment(e);
    }
    return e;
  });
  return { ...model, labor, equipment };
}

export type EquipmentApiPayload = Omit<EquipmentGroup, 'equip_type' | 'is_pure_labor' | 'pure_labor_labor_id'> & {
  equip_type: 'standard' | 'delay';
};

/** Map frontend equipment to API (pure_labor → standard + fixed MTTF/MTTR + labor-inherited fields). */
export function equipmentToApiPayload(
  eq: EquipmentGroup,
  labor?: LaborGroup[],
): EquipmentApiPayload {
  const linked = findLaborForEquipment(labor, eq.labor_group_id);
  const resolved = resolvePureLaborEquipment(eq, linked);
  const { is_pure_labor: _a, pure_labor_labor_id: _b, equip_type, mttf, mttr, ...rest } = resolved;
  if (eq.equip_type === 'pure_labor') {
    return {
      ...rest,
      equip_type: 'standard',
      mttf: PURE_LABOR_MTTF,
      mttr: PURE_LABOR_MTTR,
    };
  }
  return { ...rest, equip_type, mttf, mttr };
}
