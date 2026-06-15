import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export function ChartInsightsPopover({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  title: ReactNode;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side="left"
        align="start"
        sideOffset={8}
        collisionPadding={16}
        className="w-[min(calc(100vw-2rem),20rem)] max-w-sm p-0 border-violet-200/80 shadow-lg"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-start justify-between gap-2 border-b border-violet-100 bg-violet-50/50 px-3 py-2.5">
          <div className="min-w-0">
            <div className="font-heading text-sm font-semibold flex items-center gap-2">{title}</div>
            {description ? (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground"
            onClick={() => onOpenChange(false)}
            aria-label="Close insights"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="p-3 space-y-3 max-h-[min(60vh,320px)] overflow-y-auto">{children}</div>
      </PopoverContent>
    </Popover>
  );
}
