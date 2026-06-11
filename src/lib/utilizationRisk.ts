/** Queue-risk bands for equipment/labor utilization (percent). */
export type UtilizationQueueRisk =
  | 'Very stable'
  | 'Healthy'
  | 'Risk rising'
  | 'Queue explosion zone'
  | 'Chaos';

export function getUtilizationQueueRisk(util: number): UtilizationQueueRisk {
  if (util > 90) return 'Chaos';
  if (util > 85) return 'Queue explosion zone';
  if (util >= 80) return 'Risk rising';
  if (util >= 70) return 'Healthy';
  return 'Very stable';
}

/** Bar fill color — green (low util) → red (high util). */
export function getUtilizationBarColor(util: number): string {
  if (util > 90) return '#DC2626';
  if (util > 85) return '#EA580C';
  if (util >= 80) return '#F59E0B';
  if (util >= 70) return '#84CC16';
  return '#16A34A';
}

export function getUtilizationRiskBadgeClass(util: number): string {
  if (util > 90) return 'bg-red-100 text-red-800 border-red-200';
  if (util > 85) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (util >= 80) return 'bg-amber-100 text-amber-800 border-amber-200';
  if (util >= 70) return 'bg-lime-100 text-lime-800 border-lime-200';
  return 'bg-emerald-100 text-emerald-800 border-emerald-200';
}
