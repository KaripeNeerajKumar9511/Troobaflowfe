import { describe, expect, it } from 'vitest';
import {
  getUtilizationBarColor,
  getUtilizationQueueRisk,
} from '@/lib/utilizationRisk';

describe('utilizationRisk', () => {
  it('maps utilization to queue risk bands', () => {
    expect(getUtilizationQueueRisk(50)).toBe('Very stable');
    expect(getUtilizationQueueRisk(75)).toBe('Healthy');
    expect(getUtilizationQueueRisk(82)).toBe('Risk rising');
    expect(getUtilizationQueueRisk(87)).toBe('Queue explosion zone');
    expect(getUtilizationQueueRisk(95)).toBe('Chaos');
  });

  it('returns greener colors for lower utilization', () => {
    expect(getUtilizationBarColor(50)).toBe('#16A34A');
    expect(getUtilizationBarColor(95)).toBe('#DC2626');
  });
});
