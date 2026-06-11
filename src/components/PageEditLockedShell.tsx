import type { ReactNode } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pageEditBlockedMessage } from '@/lib/pageEditTypes';

type PageEditLockedShellProps = {
  /** Another user's display name while they hold the page edit lock. */
  editorName: string | null;
  /** Page name in the lock message, e.g. "Equipment" or "IBOM for HUB1". */
  pageLabel: string;
  children: ReactNode;
  className?: string;
  /** @deprecated Use `pageLabel` instead. */
  scopeLabel?: string;
  /** When false, banner + light fade; fields disabled per-control (scroll stays enabled). */
  dimContent?: boolean;
};

/**
 * Wraps table/form content: when someone else is editing, shows a page-wide
 * "{name} is editing …" notice (same style as per-cell collab locks).
 */
export function PageEditLockedShell({
  editorName,
  children,
  className,
  pageLabel: pageLabelProp,
  scopeLabel,
  dimContent = true,
}: PageEditLockedShellProps) {
  const locked = Boolean(editorName);
  const pageLabel = pageLabelProp ?? scopeLabel ?? 'this page';

  return (
    <div className={cn('relative', className)}>
      {locked && editorName && (
        <div
          className="mb-3 flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 shadow-sm"
          role="status"
        >
          <User className="h-4 w-4 shrink-0 text-amber-700" />
          <span className="text-sm font-medium text-amber-900">
            {pageEditBlockedMessage(editorName, pageLabel)}
          </span>
        </div>
      )}
      <div
        className={cn(
          locked && dimContent && 'pointer-events-none select-none opacity-[0.92]',
          locked &&
            !dimContent &&
            'min-h-0 opacity-[0.97] [&_input:disabled]:opacity-100 [&_input:disabled]:text-foreground [&_textarea:disabled]:opacity-100 [&_textarea:disabled]:text-foreground [&_button:disabled]:opacity-100 [&_button:disabled]:text-foreground',
        )}
        aria-disabled={locked && dimContent ? true : undefined}
      >
        {children}
      </div>
    </div>
  );
}
