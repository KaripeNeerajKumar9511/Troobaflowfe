import type { EquipmentGroup } from '@/stores/modelStore';
import { PURE_LABOR_MTTF, PURE_LABOR_MTTR } from '@/lib/pureLabor';

type StashedFields = Pick<
  EquipmentGroup,
  | 'count'
  | 'mttf'
  | 'mttr'
  | 'overtime_pct'
  | 'unavail_pct'
  | 'dept_code'
  | 'out_of_area'
  | 'setup_factor'
  | 'run_factor'
  | 'var_factor'
  | 'eq1'
  | 'eq2'
  | 'eq3'
  | 'eq4'
  | 'comments'
>;

/** Session-only: standard-field snapshot before Delay or Pure Labor. */
const stashedBeforeSpecial = new Map<string, StashedFields>();

/** Session-only: count before switching to Delay. */
const standardCountBeforeDelay = new Map<string, number>();

function stashStandardLikeFields(equipment: EquipmentGroup): void {
  stashedBeforeSpecial.set(equipment.id, {
    count: equipment.count,
    mttf: equipment.mttf,
    mttr: equipment.mttr,
    overtime_pct: equipment.overtime_pct,
    unavail_pct: equipment.unavail_pct,
    dept_code: equipment.dept_code,
    out_of_area: equipment.out_of_area,
    setup_factor: equipment.setup_factor,
    run_factor: equipment.run_factor,
    var_factor: equipment.var_factor,
    eq1: equipment.eq1,
    eq2: equipment.eq2,
    eq3: equipment.eq3,
    eq4: equipment.eq4,
    comments: equipment.comments,
  });
}

function restoreFromStash(equipment: EquipmentGroup): Partial<EquipmentGroup> {
  const stashed = stashedBeforeSpecial.get(equipment.id);
  stashedBeforeSpecial.delete(equipment.id);
  if (stashed) {
    return { equip_type: 'standard', ...stashed };
  }
  return {
    equip_type: 'standard',
    count: equipment.count !== -1 ? equipment.count : 1,
    mttf: equipment.mttf !== PURE_LABOR_MTTF ? equipment.mttf : 1,
    mttr: equipment.mttr !== PURE_LABOR_MTTR ? equipment.mttr : 0,
  };
}

function applyPureLaborType(equipment: EquipmentGroup): Partial<EquipmentGroup> {
  return {
    equip_type: 'pure_labor',
    mttf: PURE_LABOR_MTTF,
    mttr: PURE_LABOR_MTTR,
    count: equipment.count !== -1 ? equipment.count : 1,
  };
}

/**
 * Apply equip_type change for UI/model state.
 * Delay uses count -1; Pure Labor uses fixed MTTF/MTTR; switching back restores stashed values.
 */
export function applyEquipmentEquipTypeChange(
  equipment: EquipmentGroup,
  newType: EquipmentGroup['equip_type'],
): Partial<EquipmentGroup> {
  const current = equipment.equip_type;

  if (newType === current) return {};

  if (newType === 'pure_labor') {
    if (current === 'standard') stashStandardLikeFields(equipment);
    if (current === 'delay') {
      const stashedCount = standardCountBeforeDelay.get(equipment.id);
      standardCountBeforeDelay.delete(equipment.id);
      stashStandardLikeFields({
        ...equipment,
        equip_type: 'standard',
        count: stashedCount !== undefined ? stashedCount : 1,
      });
    }
    return applyPureLaborType(equipment);
  }

  if (newType === 'delay') {
    if (current === 'pure_labor') {
      const restored = restoreFromStash(equipment);
      return applyEquipmentEquipTypeChange(
        { ...equipment, ...restored } as EquipmentGroup,
        'delay',
      );
    }
    if (current === 'standard' && equipment.count !== -1) {
      standardCountBeforeDelay.set(equipment.id, equipment.count);
    }
    return { equip_type: 'delay', count: -1 };
  }

  // newType === 'standard'
  if (current === 'pure_labor') {
    return restoreFromStash(equipment);
  }
  if (current === 'delay') {
    const stashed = standardCountBeforeDelay.get(equipment.id);
    standardCountBeforeDelay.delete(equipment.id);
    const count = stashed !== undefined ? stashed : 0;
    return { equip_type: 'standard', count };
  }

  return { equip_type: 'standard' };
}
