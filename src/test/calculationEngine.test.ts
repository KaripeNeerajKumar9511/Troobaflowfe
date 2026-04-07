import { describe, it, expect, beforeEach } from 'vitest';
import { createDemoModel, type Model } from '@/stores/modelStore';
import { verifyData } from '@/lib/calculationEngine';

describe('Demo model structure', () => {
  let model: Model;

  beforeEach(() => {
    model = createDemoModel();
    expect(model).toBeDefined();
    expect(model.is_demo).toBe(true);
  });

  it('should have operations seeded for all products', () => {
    expect(model.operations.length).toBeGreaterThan(0);
    const hub1Ops = model.operations.filter(o => o.product_id === model.products.find(p => p.name === 'HUB1')!.id);
    expect(hub1Ops.length).toBe(8);
  });

  it('should have routing seeded for hub products', () => {
    const hub1 = model.products.find(p => p.name === 'HUB1')!;
    const hub1Routes = model.routing.filter(r => r.product_id === hub1.id);
    expect(hub1Routes.length).toBe(11);
    const inspectRoutes = hub1Routes.filter(r => r.from_op_name === 'INSPECT');
    expect(inspectRoutes.reduce((s, r) => s + r.pct_routed, 0)).toBe(100);
  });
});

describe('verifyData (structural checks, no simulation)', () => {
  it('reports errors when products are missing', () => {
    const model = createDemoModel();
    const { errors } = verifyData({ ...model, products: [] });
    expect(errors.some(e => e.includes('No products'))).toBe(true);
  });

  it('passes for complete demo model', () => {
    const model = createDemoModel();
    const { errors } = verifyData(model);
    expect(errors).toEqual([]);
  });
});
