export type PageEditScope =
  | 'general'
  | 'products'
  | 'labor'
  | 'equipment'
  | 'operations'
  | 'ibom';

export type PageEditLockInfo = {
  locked_by: number | string;
  name: string;
};

export function pageEditScopeKey(
  modelId: string,
  page: PageEditScope,
  productId?: string | null,
): string {
  const pid = productId ? String(productId) : '';
  return pid ? `${modelId}:${page}:${pid}` : `${modelId}:${page}`;
}

/** Toast / banner when another user holds the page edit lock. */
export function pageEditBlockedMessage(editorName: string, pageLabel: string): string {
  return `${editorName} is editing ${pageLabel}, you don't have access to edit this`;
}
