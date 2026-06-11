import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  type FocusEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useOrgCollab } from '@/contexts/OrgCollabContext';
import { collabWireColumn, type CollabEntity } from '@/lib/collabEntities';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

type CollabCellShellProps = {
  modelId: string;
  entity: CollabEntity;
  rowId: string;
  field: string;
  /** Read latest value on blur for final sync */
  getValue?: () => unknown;
  /** When true, parent commits via onChange; do not re-flush stale getValue on close */
  commitOnChange?: boolean;
  children: ReactNode;
  className?: string;
};

type ChildProps = {
  disabled?: boolean;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onOpenChange?: (open: boolean) => void;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
};

/**
 * Wraps an editable control with org-wide cell lock + Canvas-style editor label.
 */
export function CollabCellShell({
  modelId,
  entity,
  rowId,
  field,
  getValue,
  commitOnChange = false,
  children,
  className,
}: CollabCellShellProps) {
  const collab = useOrgCollab();
  const column = collabWireColumn(entity, field);
  const hostRef = useRef<HTMLDivElement>(null);
  const heldLockRef = useRef(false);
  const pendingLockRef = useRef(false);
  const selectOpenRef = useRef(false);

  const lockInfo = column
    ? collab.getCellLock(modelId, entity, rowId, column)
    : { isLockedByOther: false, isLockedBySelf: false, editorName: null as string | null };

  const blocked = lockInfo.isLockedByOther;
  const editorLabel = lockInfo.editorName;

  const blurControl = useCallback(() => {
    const el = hostRef.current?.querySelector('input, textarea, select, button[role="combobox"]');
    if (el instanceof HTMLElement) el.blur();
  }, []);

  const acquireLock = useCallback(() => {
    if (!column || collab.status !== 'open' || blocked) return;
    if (lockInfo.isLockedBySelf) {
      heldLockRef.current = true;
      return;
    }
    pendingLockRef.current = true;
    collab.lockCell(modelId, entity, rowId, column);
  }, [blocked, collab, column, entity, lockInfo.isLockedBySelf, modelId, rowId]);

  const releaseLock = useCallback(() => {
    if (!column || selectOpenRef.current) return;
    pendingLockRef.current = false;
    if (!heldLockRef.current) return;
    if (lockInfo.isLockedBySelf) {
      if (getValue && !commitOnChange) {
        collab.flushCellUpdate(modelId, entity, rowId, field, getValue());
      }
      collab.unlockCell(modelId, entity, rowId, column);
    }
    heldLockRef.current = false;
  }, [collab, column, commitOnChange, field, getValue, lockInfo.isLockedBySelf, modelId, entity, rowId]);

  useEffect(() => {
    if (!pendingLockRef.current) return;
    if (lockInfo.isLockedBySelf) {
      heldLockRef.current = true;
      pendingLockRef.current = false;
      return;
    }
    if (lockInfo.isLockedByOther) {
      pendingLockRef.current = false;
      blurControl();
    }
  }, [lockInfo.isLockedByOther, lockInfo.isLockedBySelf, blurControl]);

  if (!column) {
    return <div className={className}>{children}</div>;
  }

  const editorBadge =
    blocked && editorLabel ? (
      <div
        className="absolute -top-6 left-0 z-30 flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-1.5 py-0.5 shadow-sm whitespace-nowrap pointer-events-none"
        title={`${editorLabel} is editing this cell`}
      >
        <User className="h-3 w-3 text-amber-700 shrink-0" />
        <span className="text-[10px] font-medium text-amber-900 max-w-[140px] truncate">
          {editorLabel} is editing
        </span>
      </div>
    ) : null;

  const wrapHandlers = (child: ReactElement<ChildProps>) =>
    cloneElement(child, {
      disabled: blocked || child.props.disabled,
      className: cn(
        child.props.className,
        blocked && 'bg-amber-50/90 border-amber-300 cursor-not-allowed',
        lockInfo.isLockedBySelf && 'ring-1 ring-primary/40',
      ),
      onMouseDown: (e: React.MouseEvent) => {
        if (blocked) {
          e.preventDefault();
          return;
        }
        acquireLock();
        child.props.onMouseDown?.(e);
      },
      onFocus: (e: FocusEvent) => {
        if (blocked) {
          (e.target as HTMLElement).blur();
          return;
        }
        acquireLock();
        child.props.onFocus?.(e);
      },
      onBlur: (e: FocusEvent) => {
        child.props.onBlur?.(e);
        if (!selectOpenRef.current) releaseLock();
      },
      onOpenChange: (open: boolean) => {
        if (blocked && open) return;
        selectOpenRef.current = open;
        if (open) acquireLock();
        else releaseLock();
        child.props.onOpenChange?.(open);
      },
      onCheckedChange: (checked: boolean) => {
        if (blocked) return;
        acquireLock();
        child.props.onCheckedChange?.(checked);
      },
    });

  if (isValidElement(children)) {
    return (
      <div ref={hostRef} className={cn('relative min-w-0', className)}>
        {editorBadge}
        {wrapHandlers(children as ReactElement<ChildProps>)}
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      className={cn('relative min-w-0', className)}
      onMouseDownCapture={(e) => {
        if (blocked) {
          e.preventDefault();
          e.stopPropagation();
        } else {
          acquireLock();
        }
      }}
      onFocusCapture={(e) => {
        if (blocked) {
          e.preventDefault();
          e.stopPropagation();
          blurControl();
        } else {
          acquireLock();
        }
      }}
      onBlurCapture={(e) => {
        if (!hostRef.current?.contains(e.relatedTarget as Node)) {
          releaseLock();
        }
      }}
    >
      {editorBadge}
      <div className={cn(blocked && 'pointer-events-none opacity-60')}>{children}</div>
    </div>
  );
}
