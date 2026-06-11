export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((acc, v) => acc + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function coefficientOfVariation(values: number[]): number {
  const m = mean(values);
  if (m === 0) return 0;
  return stdDev(values) / m;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/** Latest value by date (ties: last occurrence in sorted order). */
export function latestByDate<T extends { date: Date | null }>(
  rows: T[],
  getValue: (row: T) => number | null
): number | null {
  const dated = rows.filter((r) => r.date != null && getValue(r) != null);
  if (dated.length === 0) return null;
  dated.sort((a, b) => a.date!.getTime() - b.date!.getTime());
  const last = dated[dated.length - 1];
  return getValue(last);
}

export function ratioLatestToAverage(
  values: number[],
  latest: number | null
): number {
  if (latest == null || values.length === 0) return 1;
  const avg = mean(values);
  if (avg === 0) return latest === 0 ? 1 : latest;
  return latest / avg;
}
