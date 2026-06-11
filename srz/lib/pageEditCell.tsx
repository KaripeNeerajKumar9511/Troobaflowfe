import { cloneElement, type ReactElement } from 'react';
import { cn } from '@/lib/utils';

/** Keeps disabled controls fully readable while another user holds the page lock. */
export const PAGE_EDIT_VIEW_ONLY_CLASS =
  'opacity-100 cursor-default disabled:opacity-100 disabled:text-foreground disabled:cursor-default';

/** View-only: disable inputs. Edit mode: optional collab wrapper. */
export function pageEditCell(
  canEdit: boolean,
  child: ReactElement,
  wrapWhenEditing?: (c: ReactElement) => ReactElement,
): ReactElement {
  if (!canEdit) {
    const prev = (child.props as { className?: string }).className;
    return cloneElement(child, {
      disabled: true,
      readOnly: true,
      onCheckedChange: undefined,
      onChange: undefined,
      onValueChange: undefined,
      className: cn(prev, PAGE_EDIT_VIEW_ONLY_CLASS),
    } as Record<string, unknown>);
  }
  return wrapWhenEditing ? wrapWhenEditing(child) : child;
}
