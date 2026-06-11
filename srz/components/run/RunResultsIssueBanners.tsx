'use client';

import type { CalcResults } from '@/lib/calculationEngine';
import {
  buildIssueMessages,
  hasBlockingValidations,
  MAX_ISSUE_BANNER_EACH,
  MAX_ISSUE_BANNER_SLOTS,
  MAX_VALIDATION_BANNER,
  VERIFY_DATA_SUCCESS_MESSAGE,
  type IssueMessageBuckets,
  type ValidationInput,
} from '@/lib/issueMessageResolver';
import { AlertTriangle, CheckCircle, Shield, X, XCircle, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type IssueBannerDismissKey = 'errors' | 'warnings' | 'validations' | 'success';

export type { ValidationInput } from '@/lib/issueMessageResolver';

/** @deprecated Use IssueMessageBuckets from issueMessageResolver */
export type CalcIssueMessages = { errors: string[]; warnings: string[] };

function warningSimilarityKey(s: string): string {
  const lc = s.trim().toLowerCase();
  const code = lc.match(/#\((\d+)\)/);
  const head = code ? `code:${code[1]}` : 'nocode';
  const body = lc.replace(/\b[0-9a-f]{8}-[0-9a-f-]{10,}\b/gi, '#uuid').replace(/\b[0-9]+(?:\.[0-9]+)?\b/g, '#');
  return `${head}|${body.slice(0, 400)}`;
}

function takeFirstNonSimilar(messages: string[], max: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of messages) {
    const key = warningSimilarityKey(m);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(m);
    if (out.length >= max) break;
  }
  return out;
}

function pickCalcBannerDisplay(messages: Pick<IssueMessageBuckets, 'errors' | 'warnings'>): {
  errors: string[];
  warnings: string[];
} {
  const { errors, warnings } = messages;
  if (warnings.length === 0) {
    return { errors: errors.slice(0, MAX_ISSUE_BANNER_SLOTS), warnings: [] };
  }
  if (errors.length === 0) {
    return { errors: [], warnings: takeFirstNonSimilar(warnings, MAX_ISSUE_BANNER_SLOTS) };
  }
  return {
    errors: errors.slice(0, MAX_ISSUE_BANNER_EACH),
    warnings: takeFirstNonSimilar(warnings, MAX_ISSUE_BANNER_EACH),
  };
}

/** @deprecated Use partitionCalcResults from issueMessageResolver */
export function mergeCalcIssueMessages(results: CalcResults): CalcIssueMessages {
  const { errors, warnings } = buildIssueMessages(results, null);
  return { errors, warnings };
}

export function hasCalcIssueMessages(results: CalcResults | undefined): boolean {
  if (!results) return false;
  const { errors, warnings, success } = buildIssueMessages(results, null);
  return errors.length > 0 || warnings.length > 0 || success.length > 0;
}

export function hasValidationIssueMessages(validation: ValidationInput): boolean {
  if (!validation) return false;
  if (validation.verifiedOk) return true;
  return buildIssueMessages(undefined, validation).validations.length > 0;
}

export function hasAnyIssueMessages(
  results: CalcResults | undefined,
  validation: ValidationInput,
  options?: { validationOnly?: boolean },
): boolean {
  if (options?.validationOnly) {
    return hasValidationIssueMessages(validation);
  }
  const buckets = buildIssueMessages(results, validation ?? undefined);
  return (
    buckets.errors.length > 0 ||
    buckets.warnings.length > 0 ||
    buckets.validations.length > 0 ||
    buckets.success.length > 0
  );
}

/** @deprecated Use buildIssueMessages().validations */
export function flattenValidationMessages(validation: CalcIssueMessages): string[] {
  return buildIssueMessages(undefined, validation).validations;
}

/** @deprecated */
export function pickBannerDisplay(messages: CalcIssueMessages): CalcIssueMessages {
  return pickCalcBannerDisplay(messages);
}

type BannerVariant = 'amber' | 'rose' | 'indigo' | 'emerald';

const bannerStyles: Record<BannerVariant, { shell: string; title: string; icon: string }> = {
  amber: {
    shell: 'bg-[#FFFBEB] border border-[#FDE68A] border-l-4 border-l-[#F59E0B]',
    title: 'text-[#92400E]',
    icon: 'text-[#D97706]',
  },
  rose: {
    shell: 'bg-[#FEF2F2] border border-[#FECACA] border-l-4 border-l-[#EF4444]',
    title: 'text-[#991B1B]',
    icon: 'text-[#DC2626]',
  },
  indigo: {
    shell: 'bg-[#EEF2FF] border border-[#C7D2FE] border-l-4 border-l-[#6366F1]',
    title: 'text-[#3730A3]',
    icon: 'text-[#4F46E5]',
  },
  emerald: {
    shell: 'bg-[#ECFDF5] border border-[#A7F3D0] border-l-4 border-l-[#10B981]',
    title: 'text-[#065F46]',
    icon: 'text-[#059669]',
  },
};

function BannerMessageLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-[#CBD5E1] pl-3 text-xs text-[#1E293B] leading-relaxed">
      {children}
    </div>
  );
}

function BannerTitle({
  variant,
  icon: Icon,
  children,
}: {
  variant: BannerVariant;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  const styles = bannerStyles[variant];
  return (
    <div className={`flex items-center gap-2 mb-2.5 pr-4 ${styles.title}`}>
      <Icon className={`h-4 w-4 shrink-0 ${styles.icon}`} />
      <span className="text-sm font-semibold">{children}</span>
    </div>
  );
}

function BannerChrome({
  variant,
  onClose,
  children,
}: {
  variant: BannerVariant;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const styles = bannerStyles[variant];

  return (
    <div className={`relative mb-4 rounded-lg px-4 py-3 pr-12 shadow-sm ${styles.shell}`}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-7 w-7 rounded-md border border-[#E5E7EB] bg-white text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#334155] shadow-none"
        onClick={onClose}
        aria-label="Dismiss alert"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
      {children}
    </div>
  );
}

function MessageListBanner({
  variant,
  title,
  icon,
  lines,
  onDismiss,
}: {
  variant: BannerVariant;
  title: string;
  icon: LucideIcon;
  lines: string[];
  onDismiss: () => void;
}) {
  if (lines.length === 0) return null;

  return (
    <BannerChrome variant={variant} onClose={onDismiss}>
      <BannerTitle variant={variant} icon={icon}>
        {title}
      </BannerTitle>
      <div className="space-y-2">
        {lines.map((line, i) => (
          <BannerMessageLine key={`${title}-${i}`}>{line}</BannerMessageLine>
        ))}
      </div>
    </BannerChrome>
  );
}

function ValidationsBanner({
  lines,
  verifiedOk,
  onDismiss,
}: {
  lines: string[];
  verifiedOk?: boolean;
  onDismiss: () => void;
}) {
  const shown = lines.slice(0, MAX_VALIDATION_BANNER);
  const variant: BannerVariant = verifiedOk ? 'emerald' : 'indigo';

  return (
    <BannerChrome variant={variant} onClose={onDismiss}>
      <BannerTitle variant={variant} icon={verifiedOk ? CheckCircle : Shield}>
        Validations
      </BannerTitle>
      {verifiedOk ? (
        <BannerMessageLine>{VERIFY_DATA_SUCCESS_MESSAGE}</BannerMessageLine>
      ) : (
        <>
          <p className="text-xs text-[#64748B] mb-2 leading-snug">
            Fix the issues below (each line says where to edit), save your model, then verify or
            calculate again.
          </p>
          <div className="space-y-2">
            {shown.map((line, i) => (
              <BannerMessageLine key={`val-${i}`}>{line}</BannerMessageLine>
            ))}
          </div>
        </>
      )}
    </BannerChrome>
  );
}

function CalcIssueBanners({
  messages,
  dismissed,
  onDismiss,
}: {
  messages: Pick<IssueMessageBuckets, 'errors' | 'warnings' | 'success'>;
  dismissed: Record<IssueBannerDismissKey, boolean>;
  onDismiss: (key: IssueBannerDismissKey) => void;
}) {
  const displayed = pickCalcBannerDisplay(messages);
  const showErrors = messages.errors.length > 0 && !dismissed.errors;
  const showWarnings = messages.warnings.length > 0 && !dismissed.warnings;
  const showSuccess = messages.success.length > 0 && !dismissed.success;

  if (!showErrors && !showWarnings && !showSuccess) return null;

  return (
    <>
      {showErrors && (
        <MessageListBanner
          variant="rose"
          title="Errors"
          icon={XCircle}
          lines={displayed.errors}
          onDismiss={() => onDismiss('errors')}
        />
      )}
      {showWarnings && (
        <MessageListBanner
          variant="amber"
          title="Warnings"
          icon={AlertTriangle}
          lines={displayed.warnings}
          onDismiss={() => onDismiss('warnings')}
        />
      )}
      {showSuccess && (
        <MessageListBanner
          variant="emerald"
          title="Success"
          icon={CheckCircle}
          lines={messages.success.slice(0, MAX_ISSUE_BANNER_SLOTS)}
          onDismiss={() => onDismiss('success')}
        />
      )}
    </>
  );
}

type Props = {
  results: CalcResults | undefined;
  validationMessages?: ValidationInput;
  /** When true (Verify Data run), only show validation messages — not prior calculate E/W/R. */
  validationOnly?: boolean;
  dismissed: Record<IssueBannerDismissKey, boolean>;
  onDismiss: (key: IssueBannerDismissKey) => void;
};

export function RunResultsIssueBanners({
  results,
  validationMessages,
  validationOnly = false,
  dismissed,
  onDismiss,
}: Props) {
  const calcResults = validationOnly ? undefined : results;
  const buckets = buildIssueMessages(calcResults, validationMessages ?? undefined);
  const verifiedOk = !!validationMessages?.verifiedOk;
  const blocking = !verifiedOk && hasBlockingValidations(buckets.validations);

  const showValidations = buckets.validations.length > 0 && !dismissed.validations;
  const showCalc =
    !validationOnly &&
    !blocking &&
    (buckets.errors.length > 0 || buckets.warnings.length > 0 || buckets.success.length > 0);

  if (!showValidations && !showCalc) return null;

  return (
    <>
      {showValidations && (
        <ValidationsBanner
          lines={buckets.validations}
          verifiedOk={verifiedOk}
          onDismiss={() => onDismiss('validations')}
        />
      )}
      {showCalc && (
        <CalcIssueBanners
          messages={{
            errors: buckets.errors,
            warnings: buckets.warnings,
            success: buckets.success,
          }}
          dismissed={dismissed}
          onDismiss={onDismiss}
        />
      )}
    </>
  );
}

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: CalcResults | undefined;
  validationMessages?: ValidationInput;
  validationOnly?: boolean;
};

function DialogSection({
  variant,
  title,
  icon,
  lines,
  hint,
}: {
  variant: BannerVariant;
  title: string;
  icon: LucideIcon;
  lines: string[];
  hint?: string;
}) {
  if (lines.length === 0) return null;

  return (
    <section className={`rounded-lg px-4 py-3 ${bannerStyles[variant].shell}`}>
      <BannerTitle variant={variant} icon={icon}>
        {title}
      </BannerTitle>
      {hint ? <p className="text-xs text-[#64748B] mb-2 leading-snug">{hint}</p> : null}
      <div className="space-y-2">
        {lines.map((line, i) => (
          <BannerMessageLine key={`dlg-${title}-${i}`}>{line}</BannerMessageLine>
        ))}
      </div>
    </section>
  );
}

export function RunResultsIssuesDialog({
  open,
  onOpenChange,
  results,
  validationMessages,
  validationOnly = false,
}: DialogProps) {
  const buckets = buildIssueMessages(
    validationOnly ? undefined : results,
    validationMessages ?? undefined,
  );
  const empty =
    buckets.errors.length === 0 &&
    buckets.warnings.length === 0 &&
    buckets.validations.length === 0 &&
    buckets.success.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Errors, warnings &amp; validations</DialogTitle>
          <DialogDescription>
            Validations (V), calculation errors (E), warnings (W), and success (R) from your
            latest <strong>Verify Data</strong> or <strong>Full Calculate</strong> run.
          </DialogDescription>
        </DialogHeader>
        {empty ? (
          <div className="flex items-center gap-2 py-6 text-sm text-emerald-800/90">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            No issues for the current model.
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <DialogSection
              variant="indigo"
              title="Validations"
              icon={Shield}
              lines={buckets.validations}
              hint="Fix the issues below (each line says where to edit), save your model, then verify or calculate again."
            />
            <DialogSection variant="rose" title="Errors" icon={XCircle} lines={buckets.errors} />
            <DialogSection variant="amber" title="Warnings" icon={AlertTriangle} lines={buckets.warnings} />
            <DialogSection variant="emerald" title="Success" icon={CheckCircle} lines={buckets.success} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
