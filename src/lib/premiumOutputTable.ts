import type { CSSProperties } from 'react';
import type { Model } from '@/stores/modelStore';

export type OutputViewMode = 'normal' | 'premium';

const PREMIUM_DATA_COLORS = ['#E6F4EA', '#E8F0FE', '#F3E8FF', '#FCE8E6', '#FFF7E0'] as const;
const PREMIUM_LABEL_COLOR = '#FFFFFF';

export type PremiumPastelColor = 'label' | 'green' | 'blue' | 'purple' | 'brown' | 'yellow';

export const PREMIUM_PASTEL_BY_ROLE: Record<PremiumPastelColor, string> = {
  label: PREMIUM_LABEL_COLOR,
  green: PREMIUM_DATA_COLORS[0],
  blue: PREMIUM_DATA_COLORS[1],
  purple: PREMIUM_DATA_COLORS[2],
  brown: PREMIUM_DATA_COLORS[3],
  yellow: PREMIUM_DATA_COLORS[4],
};

export type PremiumTableKind =
  | 'laborOper'
  | 'productOper'
  | 'equipOper'
  | 'equipment'
  | 'product'
  | 'labor'
  | 'groupSummary'
  | 'productionChart';

const PREMIUM_COLUMN_COLOR_ROLES: Record<PremiumTableKind, Record<string, PremiumPastelColor>> = {
  laborOper: {
    productName: 'label',
    opName: 'green',
    equipName: 'blue',
    opNumber: 'purple',
    pctAssigned: 'brown',
    eqSetupUtil: 'yellow',
    eqRunUtil: 'green',
    labSetupUtil: 'blue',
    labRunUtil: 'purple',
    visitsPerGoodPiece: 'brown',
    visits: 'yellow',
    noOfSetups: 'green',
    avgLotSize: 'blue',
    wip: 'purple',
    mctAtOp: 'brown',
    timeWaitingEquipment: 'brown',
    timeWaitingLabor: 'brown',
    timeInSetup: 'brown',
    timeInRun: 'brown',
    timeWaitingRestOfLot: 'brown',
  },
  productOper: {
    opNumber: 'label',
    opName: 'green',
    equipName: 'blue',
    laborName: 'purple',
    pctAssigned: 'brown',
    eqSetupUtil: 'yellow',
    eqRunUtil: 'green',
    labSetupUtil: 'blue',
    labRunUtil: 'purple',
    visitsPer100: 'brown',
    visitsPerGoodPiece: 'yellow',
    noOfSetups: 'green',
    avgLotSize: 'blue',
    wip: 'purple',
    mctAtOp: 'brown',
    timeWaitingEquipment: 'brown',
    timeWaitingLabor: 'brown',
    timeInSetup: 'brown',
    timeInRun: 'brown',
    timeWaitingRestOfLot: 'brown',
  },
  equipOper: {
    productName: 'label',
    opName: 'green',
    laborName: 'blue',
    opNumber: 'purple',
    pctAssigned: 'brown',
    eqSetupUtil: 'yellow',
    eqRunUtil: 'green',
    labSetupUtil: 'blue',
    labRunUtil: 'purple',
    visitsPerGoodPiece: 'brown',
    noOfSetups: 'yellow',
    avgLotSize: 'green',
    wip: 'blue',
    mctAtOp: 'brown',
    timeWaitingEquipment: 'brown',
    timeWaitingLabor: 'brown',
    timeInSetup: 'brown',
    timeInRun: 'brown',
    timeWaitingRestOfLot: 'brown',
    visits: 'purple',
  },
  equipment: {
    name: 'label',
    count: 'green',
    setupUtil: 'blue',
    runUtil: 'purple',
    repairUtil: 'brown',
    waitLaborUtil: 'yellow',
    totalUtil: 'green',
    idle: 'blue',
    wip: 'purple',
    piecesInProcess: 'purple',
    piecesWaiting: 'purple',
    laborName: 'brown',
  },
  product: {
    name: 'label',
    goodShipped: 'green',
    started: 'blue',
    goodMade: 'blue',
    scrap: 'blue',
    scrappedInAssembly: 'purple',
    usedInAssembly: 'brown',
    outOfAreaTime: 'yellow',
    wip: 'green',
    mct: 'brown',
    timeWaitingEquipment: 'brown',
    timeWaitingLabor: 'brown',
    timeSetup: 'brown',
    timeRun: 'brown',
    timeWaitingRestOfLot: 'brown',
  },
  labor: {
    name: 'label',
    count: 'green',
    setupUtil: 'blue',
    runUtil: 'purple',
    unavailPct: 'brown',
    totalUtil: 'yellow',
    idle: 'green',
    equipTended: 'blue',
    avgEquipWaiting: 'purple',
  },
  groupSummary: {
    productGroup: 'label',
    description: 'blue',
    eqSetupUtil: 'yellow',
    eqRunUtil: 'green',
    labSetupUtil: 'blue',
    labRunUtil: 'purple',
  },
  productionChart: {
    name: 'label',
    shipped: 'green',
    usedInAssembly: 'brown',
    scrappedInAssembly: 'purple',
    scrapInProduction: 'blue',
  },
};

export function isPremiumOutputView(model: Pick<Model, 'general'> | null | undefined): boolean {
  return model?.general?.output_view_mode === 'premium';
}

export function getPremiumColumnColor(colIndex: number): string {
  if (colIndex === 0) return PREMIUM_LABEL_COLOR;
  return PREMIUM_DATA_COLORS[(colIndex - 1) % PREMIUM_DATA_COLORS.length];
}

export function getPremiumColumnColorForKey(tableKind: PremiumTableKind, colKey: string): string {
  const role = PREMIUM_COLUMN_COLOR_ROLES[tableKind][colKey];
  return PREMIUM_PASTEL_BY_ROLE[role ?? 'label'];
}

export function premiumColStyleForKey(
  tableKind: PremiumTableKind,
  colKey: string,
  isPremium: boolean,
): CSSProperties | undefined {
  if (!isPremium) return undefined;
  return { backgroundColor: getPremiumColumnColorForKey(tableKind, colKey) };
}

export function premiumColStyle(colIndex: number, isPremium: boolean): CSSProperties | undefined {
  if (!isPremium) return undefined;
  return { backgroundColor: getPremiumColumnColor(colIndex) };
}

export function premiumTableWrapperClass(isPremium: boolean): string {
  return isPremium ? 'premium-output-table' : '';
}

export function premiumCardClass(isPremium: boolean): string {
  return isPremium ? 'rounded-xl border border-[#E2E6EA] shadow-sm bg-white' : '';
}

/** Horizontal scroll on table hosts; page width stays fixed. */
export function outputTableHScrollClass(): string {
  return 'output-table-h-scroll';
}

/** Fixed-width table — no horizontal scroll (e.g. Group/Dept/Area Summary). */
export function outputTableFixedClass(): string {
  return 'output-table-fixed';
}

export function premiumHeadClass(isPremium: boolean, align: 'left' | 'right' = 'right'): string {
  if (!isPremium) return '';
  return `!font-semibold !text-[13px] !px-4 !py-3.5 !border-b !border-[#E2E6EA] ${align === 'left' ? '!text-left' : '!text-right'} !tracking-normal !normal-case !text-foreground !font-sans`;
}

/** Sticky header for the first (label) column in premium tables. */
export function premiumStickyHeadClass(isPremium: boolean, stickyTopLeft: boolean, stickyHeader: boolean): string {
  if (!isPremium) return '';
  if (stickyTopLeft) return 'premium-sticky-col-head sticky top-0 left-0 z-30';
  if (stickyHeader) return 'sticky top-0 z-20';
  return '';
}

/** Sticky body cell for the first (label) column in premium tables. */
export function premiumStickyCellClass(isPremium: boolean, sticky: boolean): string {
  if (!isPremium || !sticky) return '';
  return 'premium-sticky-col-cell sticky left-0 z-10';
}

/** Title case for long entity names (equipment, product, labor) in premium tables. */
export function formatPremiumDisplayName(value: unknown): string {
  const s = String(value ?? '').trim();
  if (!s) return '—';
  return s
    .split(/\s+/)
    .map((word) =>
      word
        .split(/([+/\-])/)
        .map((part) => {
          if (!part || /^[+/\-]$/.test(part)) return part;
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join(''),
    )
    .join(' ');
}

export function formatPremiumDisplayValue(value: unknown, isPremium: boolean): string {
  if (!isPremium) return String(value ?? '');
  return formatPremiumDisplayName(value);
}

export function premiumLabelCellClass(isPremium: boolean, sticky = false): string {
  if (!isPremium) {
    return sticky
      ? 'px-2 font-mono font-medium text-left whitespace-nowrap sticky left-0 z-10 bg-background shadow-[2px_0_4px_-2px_hsl(var(--border))]'
      : 'font-mono font-medium text-left whitespace-nowrap';
  }
  return `font-semibold uppercase text-left !px-4 !py-3 text-[13px] text-foreground whitespace-nowrap min-w-[6.5rem]${premiumStickyCellClass(isPremium, sticky)}`;
}

/** Inner span for wrapped label text — keep line-clamp off the &lt;td&gt; to preserve table layout. */
export const premiumCellTextWrapClass = 'block line-clamp-2 leading-snug break-words';

/** Primary name column: title case; wrap text inside &lt;span&gt; with premiumCellTextWrapClass. */
export function premiumNameCellClass(isPremium: boolean, sticky = false): string {
  if (!isPremium) {
    return sticky
      ? 'px-2 font-mono font-medium text-left align-top sticky left-0 z-10 bg-background shadow-[2px_0_4px_-2px_hsl(var(--border))]'
      : 'font-mono font-medium text-left align-top';
  }
  return `font-medium normal-case text-left !px-4 !py-3 text-[13px] text-foreground align-top min-w-[8rem]${premiumStickyCellClass(isPremium, sticky)}`;
}

/** Secondary text columns (e.g. labor group on equipment rows). */
export function premiumSecondaryNameCellClass(isPremium: boolean): string {
  if (!isPremium) {
    return 'font-mono text-xs text-muted-foreground align-top';
  }
  return 'font-normal normal-case text-left !px-4 !py-3 text-[13px] text-foreground align-top';
}

export function premiumNumericCellClass(isPremium: boolean, extra = ''): string {
  if (!isPremium) return `!px-2 font-mono text-right whitespace-nowrap tabular-nums ${extra}`.trim();
  return `text-right !px-4 !py-3 text-[13px] tabular-nums font-normal whitespace-nowrap ${extra}`.trim();
}

export function premiumRowClass(isPremium: boolean): string {
  return isPremium ? 'premium-output-row hover:brightness-[0.99]' : '';
}

export function premiumFmtNum(v: unknown, digits: number, isPremium: boolean): string {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return '—';
  if (!isPremium) return n.toFixed(digits);
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
