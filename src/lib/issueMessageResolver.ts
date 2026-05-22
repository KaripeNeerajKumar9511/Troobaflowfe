import type { CalcResults } from '@/lib/calculationEngine';
import {
  ALL_DLL_MESSAGE_MAPPINGS,
  DLL_ERROR_MESSAGES,
  DLL_SUCCESS_MESSAGES,
  DLL_WARNING_MESSAGES,
  VALIDATION_MESSAGES,
  type DllMessageMapping,
} from '@/lib/dllMessageMappings';

export type IssueBucket = 'error' | 'warning' | 'validation' | 'success';

export type IssueMessageBuckets = {
  errors: string[];
  warnings: string[];
  validations: string[];
  success: string[];
};

/** Shown in the validations panel when Verify Data finds no issues. */
export const VERIFY_DATA_SUCCESS_MESSAGE =
  'data is validated and you can go with full calculate';

export type ValidationInput = {
  errors: string[];
  warnings: string[];
  /** Set after a successful Verify Data run with no validation issues. */
  verifiedOk?: boolean;
} | null;

const BLOCKING_VALIDATION_IDS = new Set(
  VALIDATION_MESSAGES.filter((_, i) => i < 15).map((m) => m.id),
);

/** Extract message text from a raw results.err CSV row (defense when API returns unparsed rows). */
export function extractResultsErrMessage(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (!/in calculations/i.test(trimmed)) return null;

  const parts = trimmed.split(',').map((p) => p.trim());
  const idx = parts.findIndex((p) => p.toLowerCase() === 'in calculations');
  if (idx >= 0 && idx + 1 < parts.length) {
    const msg = parts[idx + 1].replace(/\s*-\s*$/, '').trim();
    if (msg) return msg;
  }

  const match = trimmed.match(/In Calculations,\s*(.+?)(?:,\s*\d+\s*,|$)/i);
  if (match?.[1]) {
    return match[1].replace(/\s*-\s*$/, '').trim();
  }

  return null;
}

function normalizeDllMessageText(s: string): string {
  return s
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .replace(/#\(\s*(\d+[a-z]?)\s*\)\s*-/gi, '#($1) ')
    .trim();
}

function extractDllErrorCode(text: string): string | null {
  const m = text.match(/#\(\s*(\d+[a-z]?)\s*\)/i);
  return m ? m[1].toLowerCase() : null;
}

function normalizeText(s: string): string {
  return normalizeDllMessageText(s).toLowerCase();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function templateToRegex(template: string): RegExp {
  const parts = template.split(/\{[^}]+\}/g);
  const placeholders = template.match(/\{[^}]+\}/g) ?? [];
  let body = '';
  for (let i = 0; i < parts.length; i++) {
    body += escapeRegex(parts[i]);
    if (i < placeholders.length) body += '.+?';
  }
  return new RegExp(`^${body}$`, 'is');
}

function bucketFromMappingId(id: string): IssueBucket {
  if (id.startsWith('V')) return 'validation';
  if (id.startsWith('W')) return 'warning';
  if (id.startsWith('R')) return 'success';
  return 'error';
}

function extractIdPrefix(line: string): string | null {
  const m = line.trim().match(/^\(([EWVR]\w*)\)\s+/i);
  return m ? m[1].toUpperCase() : null;
}

function prepareLineForMatch(line: string): string {
  const extracted = extractResultsErrMessage(line);
  return normalizeDllMessageText(extracted ?? line);
}

function findMapping(line: string, mappings: readonly DllMessageMapping[]): DllMessageMapping | null {
  const trimmed = prepareLineForMatch(line);
  if (!trimmed) return null;

  const norm = trimmed.toLowerCase();

  const code = extractDllErrorCode(trimmed);
  if (code) {
    const byCode = mappings.find((m) => (m.errorCode ?? '').toLowerCase() === code);
    if (byCode) return byCode;
  }

  for (const m of mappings) {
    const dllNorm = normalizeText(m.dllMessage);
    const userNorm = normalizeText(m.userMessage);
    if (dllNorm === norm || userNorm === norm) {
      return m;
    }
  }

  for (const m of mappings) {
    if (m.dllMessage.includes('{')) {
      try {
        if (templateToRegex(normalizeDllMessageText(m.dllMessage)).test(trimmed)) return m;
      } catch {
        /* ignore bad pattern */
      }
    }
  }

  for (const m of mappings) {
    const dllNorm = normalizeText(m.dllMessage);
    if (dllNorm.length >= 16 && (norm.includes(dllNorm) || dllNorm.includes(norm))) {
      return m;
    }
  }

  if (/operations are not visited/i.test(trimmed)) {
    return (
      mappings.find((m) => /routing/i.test(m.userMessage) && m.id.startsWith('E')) ??
      DLL_ERROR_MESSAGES.find((m) => m.id === 'E21') ??
      null
    );
  }

  return null;
}

/** Admin / support: paired DLL text vs portal user-facing message. */
export function resolveMessagePair(
  line: string,
  mappings: readonly DllMessageMapping[] = ALL_DLL_MESSAGE_MAPPINGS,
): { dllMessage: string; userMessage: string; bucket: IssueBucket; id?: string } {
  const prepared = prepareLineForMatch(line);
  const dllMessage = prepared || line.trim();
  const resolved = resolveLine(line, mappings);
  return {
    dllMessage,
    userMessage: resolved.userMessage || dllMessage,
    bucket: resolved.bucket,
    id: resolved.id,
  };
}

export function resolveLine(
  line: string,
  mappings: readonly DllMessageMapping[] = ALL_DLL_MESSAGE_MAPPINGS,
): { userMessage: string; bucket: IssueBucket; id?: string } {
  const prepared = prepareLineForMatch(line);
  if (!prepared) {
    return { userMessage: '', bucket: 'error' };
  }

  const existingId = extractIdPrefix(line);
  if (existingId) {
    const mapping = mappings.find((m) => m.id === existingId);
    if (mapping) {
      return {
        userMessage: mapping.userMessage,
        bucket: bucketFromMappingId(mapping.id),
        id: mapping.id,
      };
    }
    return {
      userMessage: prepared,
      bucket: bucketFromMappingId(existingId),
      id: existingId,
    };
  }

  const hit = findMapping(line, mappings);
  if (hit) {
    return {
      userMessage: hit.userMessage,
      bucket: bucketFromMappingId(hit.id),
      id: hit.id,
    };
  }

  if (/warning/i.test(prepared)) {
    return {
      userMessage: prepared,
      bucket: 'warning',
    };
  }

  return {
    userMessage: prepared,
    bucket: 'error',
  };
}

function pushUnique(bucket: string[], message: string) {
  const t = message.trim();
  if (!t || bucket.includes(t)) return;
  bucket.push(t);
}

export function resolveValidationInput(raw: {
  errors: string[];
  warnings: string[];
}): string[] {
  const out: string[] = [];
  for (const line of [...raw.errors, ...raw.warnings]) {
    const hit = findMapping(line, VALIDATION_MESSAGES);
    if (hit) {
      pushUnique(out, hit.userMessage);
      continue;
    }
    const resolved = resolveLine(line, VALIDATION_MESSAGES);
    pushUnique(out, resolved.userMessage);
  }
  return out;
}

export function hasBlockingValidations(validations: string[]): boolean {
  return validations.some((line) => {
    const id = extractIdPrefix(line);
    return id != null && BLOCKING_VALIDATION_IDS.has(id);
  });
}

export function partitionCalcResults(results: CalcResults): Omit<IssueMessageBuckets, 'validations'> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const success: string[] = [];

  const calcMappings = [
    ...DLL_ERROR_MESSAGES,
    ...DLL_WARNING_MESSAGES,
    ...DLL_SUCCESS_MESSAGES,
  ] as const;

  const lines = [
    ...results.errors,
    ...(results.warnings ?? []),
    ...results.overLimitResources,
  ];

  for (const line of lines) {
    const { userMessage, bucket } = resolveLine(line, calcMappings);
    if (!userMessage.trim()) continue;

    if (bucket === 'success') pushUnique(success, userMessage);
    else if (bucket === 'warning') pushUnique(warnings, userMessage);
    else pushUnique(errors, userMessage);
  }

  return { errors, warnings, success };
}

export function buildIssueMessages(
  results: CalcResults | undefined,
  validationInput: ValidationInput | undefined,
): IssueMessageBuckets {
  const validations = validationInput?.verifiedOk
    ? [VERIFY_DATA_SUCCESS_MESSAGE]
    : validationInput
      ? resolveValidationInput(validationInput)
      : [];
  const calc = results ? partitionCalcResults(results) : { errors: [], warnings: [], success: [] };

  return {
    errors: calc.errors,
    warnings: calc.warnings,
    validations,
    success: calc.success,
  };
}

export const MAX_VALIDATION_BANNER = 4;
export const MAX_ISSUE_BANNER_EACH = 2;
export const MAX_ISSUE_BANNER_SLOTS = 4;
