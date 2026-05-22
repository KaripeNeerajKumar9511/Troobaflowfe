import { describe, it, expect } from 'vitest';
import { createDemoModel } from '@/stores/modelStore';
import { hasAnyIssueMessages } from '@/components/run/RunResultsIssueBanners';
import {
  buildIssueMessages,
  extractResultsErrMessage,
  partitionCalcResults,
  resolveLine,
  resolveValidationInput,
  VERIFY_DATA_SUCCESS_MESSAGE,
} from '@/lib/issueMessageResolver';
import type { CalcResults } from '@/lib/calculationEngine';

describe('issueMessageResolver', () => {
  it('maps validation raw text to V ids', () => {
    const validations = resolveValidationInput({
      errors: ['No products defined.'],
      warnings: ['No labor groups defined.'],
    });
    expect(validations).toContain('(V1) No products defined.');
    expect(validations).toContain('(V16) No labor groups defined.');
  });

  it('puts E110 over-limit equipment in errors bucket', () => {
    const { errors, warnings } = partitionCalcResults({
      equipment: [],
      labor: [],
      products: [],
      operations: [],
      errors: [],
      warnings: [],
      overLimitResources: ['Equipment: Press A (98%)'],
      calculatedAt: '',
    } as CalcResults);
    expect(errors.some((e) => e.startsWith('(E110)'))).toBe(true);
    expect(warnings.length).toBe(0);
  });

  it('puts W19 util warning in warnings bucket', () => {
    const { warnings, errors } = partitionCalcResults({
      equipment: [],
      labor: [],
      products: [],
      operations: [],
      errors: [],
      warnings: ['Equipment "Press A" util (98%) > limit (95%)'],
      overLimitResources: [],
      calculatedAt: '',
    } as CalcResults);
    expect(warnings.some((w) => w.startsWith('(W19)'))).toBe(true);
    expect(errors.length).toBe(0);
  });

  it('maps R4 success message', () => {
    const { bucket, userMessage } = resolveLine(
      'Value Stream Modeling EVALUATION IS COMPLETED\n However the resouce utilization is very high and the Manufacturing Cycle Time numbers are not as accurate.',
    );
    expect(bucket).toBe('success');
    expect(userMessage).toContain('Evaluation completed');
  });

  it('parses raw results.err CSV into mapped W12 warning', () => {
    const raw =
      '1,,In Calculations,WARNING: #(80)- Equipment Time=0.0 and Labor Time>0.0 for an operation - Please check operation time data , 1,2,5,1,1-5,,';
    const { warnings, errors } = partitionCalcResults({
      equipment: [],
      labor: [],
      products: [],
      operations: [],
      errors: [raw],
      warnings: [],
      overLimitResources: [],
      calculatedAt: '',
    } as CalcResults);
    expect(warnings.some((w) => w.startsWith('(W12)'))).toBe(true);
    expect(warnings.some((w) => w.includes('In Calculations'))).toBe(false);
    expect(errors.length).toBe(0);
  });

  it('parses raw results.err CSV into mapped W13 warning', () => {
    const raw =
      '1,,In Calculations,WARNING: #(83)- Equipment Time setup 0.000000 run 0.000000 is less than Labor Time setup 0.000000 run 720.000000 for an operation. Be sure you want more than 1 operation. , 1,2,5,1,1-5,,';
    const { warnings } = partitionCalcResults({
      equipment: [],
      labor: [],
      products: [],
      operations: [],
      errors: [raw],
      warnings: [],
      overLimitResources: [],
      calculatedAt: '',
    } as CalcResults);
    expect(warnings.some((w) => w.startsWith('(W13)'))).toBe(true);
  });

  it('extracts clean text from results.err row', () => {
    const msg = extractResultsErrMessage(
      '1,,In Calculations,after count_op A 6 For PART 3 The following operations are not visited - , 1,,,3,3-23,,',
    );
    expect(msg).toContain('operations are not visited');
    expect(msg).not.toContain('In Calculations');
  });

  it('hasAnyIssueMessages ignores calc results when validationOnly', () => {
    const calcResults = {
      equipment: [],
      labor: [],
      products: [],
      operations: [],
      errors: ['Equipment over limit'],
      warnings: ['Some warning'],
      overLimitResources: [],
      calculatedAt: '',
    } as CalcResults;
    expect(
      hasAnyIssueMessages(calcResults, { errors: [], warnings: [], verifiedOk: true }, {
        validationOnly: true,
      }),
    ).toBe(true);
    const buckets = buildIssueMessages(
      undefined,
      { errors: [], warnings: [], verifiedOk: true },
    );
    expect(buckets.errors.length).toBe(0);
    expect(buckets.warnings.length).toBe(0);
  });

  it('shows verify success message in validations bucket when verifiedOk', () => {
    const buckets = buildIssueMessages(undefined, {
      errors: [],
      warnings: [],
      verifiedOk: true,
    });
    expect(buckets.validations[0]).toBe(VERIFY_DATA_SUCCESS_MESSAGE);
  });

  it('keeps validations separate from calc errors for demo model pre-check', () => {
    const model = createDemoModel();
    model.products = [];
    const buckets = buildIssueMessages(undefined, {
      errors: ['No products defined.'],
      warnings: [],
    });
    expect(buckets.validations.some((v) => v.startsWith('(V1)'))).toBe(true);
    expect(buckets.errors.length).toBe(0);
  });
});
