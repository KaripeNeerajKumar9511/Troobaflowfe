/** Stored value meaning "use lot size" for the engine; UI shows 0. */
export const TBATCH_USE_LOT_SIZE = -1;

/** Map stored tbatch_size to the value shown in the UI. */
export function displayTbatchSize(stored: number): number {
  return stored === TBATCH_USE_LOT_SIZE ? 0 : Math.max(0, stored);
}

/** Map UI input to stored tbatch_size (0 → use lot size / -1). */
export function parseTbatchSizeInput(input: number): number {
  if (!Number.isFinite(input) || input <= 0) return TBATCH_USE_LOT_SIZE;
  return input;
}
