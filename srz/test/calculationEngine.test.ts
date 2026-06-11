import { describe, it, expect, beforeEach } from 'vitest';
import { createDemoModel, type Model } from '@/stores/modelStore';
import { verifyData, getModelValidationMessages, toUtilOnlyResults, getProductOutOfAreaTime, type CalcResults } from '@/lib/calculationEngine';

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

  it('reports MTTF below 1', () => {
    const model = createDemoModel();
    model.equipment[0].mttf = 0;
    const { errors } = verifyData(model);
    expect(errors.some((e) => e.includes('MTTF'))).toBe(true);
  });

  it('run validation matches demo basecase', () => {
    const model = createDemoModel();
    const { errors } = getModelValidationMessages(model);
    expect(errors).toEqual([]);
  });
});

describe('getProductOutOfAreaTime', () => {
  it('matches product results table formula', () => {
    const pr = {
      id: 'p1', name: 'Part', demand: 0, lotSize: 1, goodMade: 0, goodShipped: 0, started: 0, scrap: 0, wip: 0,
      mct: 10, mctQueue: 2, mctWaitLabor: 1, mctSetup: 0.5, mctRun: 3, mctLotWait: 1.5,
    };
    expect(getProductOutOfAreaTime(pr)).toBe(2);
  });
});

describe('toUtilOnlyResults', () => {
  it('clears MCT, WIP, production, and operations while keeping util', () => {
    const full = {
      equipment: [{ id: 'e1', name: 'Press', count: 2, setupUtil: 10, runUtil: 20, repairUtil: 0, waitLaborUtil: 5, totalUtil: 35, idle: 65, laborGroup: 'L1', wip_total: 99 } as CalcResults['equipment'][0] & { wip_total: number }],
      labor: [{ id: 'l1', name: 'Ops', count: 3, setupUtil: 15, runUtil: 25, unavailPct: 0, totalUtil: 40, idle: 60, machinesWaiting: 2.5 }],
      products: [{ id: 'p1', name: 'Part', demand: 100, lotSize: 10, goodMade: 50, goodShipped: 40, started: 55, scrap: 5, wip: 12, mct: 3.5, mctLotWait: 1, mctQueue: 2, mctWaitLabor: 0.5, mctSetup: 0.2, mctRun: 0.8 }],
      operations: [{ op_id: 'o1', w_equip: 2, flowtime: 10 }],
      warnings: [],
      errors: [],
      overLimitResources: [],
      calculatedAt: 't',
    } as CalcResults;
    const util = toUtilOnlyResults(full);
    expect(util.equipment[0].totalUtil).toBe(35);
    expect(util.labor[0].machinesWaiting).toBe(0);
    expect((util.equipment[0] as { wip_total?: number }).wip_total).toBeUndefined();
    expect(util.products[0].mct).toBe(0);
    expect(util.products[0].wip).toBe(0);
    expect(util.products[0].goodMade).toBe(50);
    expect(util.products[0].goodShipped).toBe(40);
    expect(util.operations).toEqual([]);
    expect(util.runMode).toBe('util_only');
  });
});
