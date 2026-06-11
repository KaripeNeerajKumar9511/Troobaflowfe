import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PURE_LABOR_EQUIPMENT_TOOLTIP } from '@/lib/pureLabor';
import { cn } from '@/lib/utils';

type PureLaborNaFieldProps = {
  className?: string;
  tooltip?: string;
};

/** Read-only “NA” cell for pure-labor equipment rows (real values stay in the model for the solver). */
export function PureLaborNaField({ className, tooltip }: PureLaborNaFieldProps) {
  const tip = tooltip ?? PURE_LABOR_EQUIPMENT_TOOLTIP;
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex h-8 min-w-[2.5rem] items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-2 font-mono text-sm text-slate-500 cursor-default',
              className,
            )}
          >
            NA
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[280px] text-xs">{tip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
