import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  isEditing: boolean;
  onRequestEdit: () => void;
  /** Return true if the name was applied; false keeps edit mode (e.g. duplicate). */
  onCommit: (trimmed: string) => boolean;
  onCancelEdit: () => void;
  inputClassName?: string;
  spanClassName?: string;
};

export function DoubleClickEditableName({
  value,
  isEditing,
  onRequestEdit,
  onCommit,
  onCancelEdit,
  inputClassName,
  spanClassName,
}: Props) {
  const [buffer, setBuffer] = useState(value);
  const skipBlurCommitRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setBuffer(value);
      skipBlurCommitRef.current = false;
    }
  }, [isEditing, value]);

  const tryCommit = () => {
    const t = buffer.trim();
    if (!t) {
      onCancelEdit();
      return;
    }
    const ok = onCommit(t);
    if (ok) onCancelEdit();
    else requestAnimationFrame(() => inputRef.current?.focus());
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        autoFocus
        className={cn('h-8 font-mono', inputClassName)}
        value={buffer}
        onChange={(e) => setBuffer(e.target.value)}
        onBlur={() => {
          if (skipBlurCommitRef.current) {
            skipBlurCommitRef.current = false;
            return;
          }
          tryCommit();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            skipBlurCommitRef.current = true;
            onCancelEdit();
          }
        }}
      />
    );
  }

  return (
    <span
      title="Double-click to edit name"
      className={cn(
        'cursor-text underline-offset-2 hover:underline decoration-dotted font-mono font-medium',
        spanClassName,
      )}
      onDoubleClick={(e) => {
        e.preventDefault();
        onRequestEdit();
      }}
    >
      {value}
    </span>
  );
}
