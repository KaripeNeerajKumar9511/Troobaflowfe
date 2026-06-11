import { describe, expect, it } from 'vitest';
import { normalizeProductOperations } from '@/lib/productOperations';
import type { Operation } from '@/stores/modelStore';

function op(overrides: Partial<Operation> & Pick<Operation, 'id' | 'product_id' | 'op_name' | 'op_number'>): Operation {
  return {
    equip_id: '',
    pct_assigned: 100,
    equip_setup_lot: 0,
    equip_setup_piece: 0,
    equip_setup_tbatch: 0,
    equip_run_piece: 0,
    equip_run_lot: 0,
    equip_run_tbatch: 0,
    labor_setup_lot: 0,
    labor_setup_piece: 0,
    labor_setup_tbatch: 0,
    labor_run_piece: 0,
    labor_run_lot: 0,
    labor_run_tbatch: 0,
    oper1: 0,
    oper2: 0,
    oper3: 0,
    oper4: 0,
    ...overrides,
  };
}

describe('normalizeProductOperations', () => {
  it('keeps a single DOCK and sets op_number to 0', () => {
    const pid = 'p1';
    const result = normalizeProductOperations([
      op({ id: 'd1', product_id: pid, op_name: 'DOCK', op_number: 10 }),
      op({ id: 'u1', product_id: pid, op_name: 'PRINT', op_number: 20 }),
    ]);
    expect(result).toHaveLength(2);
    expect(result.find((o) => o.id === 'd1')?.op_number).toBe(0);
  });

  it('drops duplicate DOCK rows, preferring op_number 0', () => {
    const pid = 'p1';
    const result = normalizeProductOperations([
      op({ id: 'd0', product_id: pid, op_name: 'DOCK', op_number: 0 }),
      op({ id: 'd1', product_id: pid, op_name: 'DOCK', op_number: 170 }),
      op({ id: 'u1', product_id: pid, op_name: 'PRINT', op_number: 10 }),
    ]);
    expect(result.map((o) => o.id)).toEqual(['d0', 'u1']);
    expect(result.find((o) => o.id === 'd0')?.op_number).toBe(0);
  });

  it('does not affect non-DOCK operations', () => {
    const pid = 'p1';
    const result = normalizeProductOperations([
      op({ id: 'u1', product_id: pid, op_name: 'PRINT', op_number: 10 }),
      op({ id: 'u2', product_id: pid, op_name: 'CUT', op_number: 20 }),
    ]);
    expect(result).toHaveLength(2);
  });
});
