import type { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Props = {
  label: string;
  children: ReactNode;
};

/** Shows the full value in a small tooltip on hover (e.g. truncated select labels). */
export function HoverValueTooltip({ label, children }: Props) {
  if (!label) return <>{children}</>;
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="min-w-0 max-w-full">{children}</div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs font-mono">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
