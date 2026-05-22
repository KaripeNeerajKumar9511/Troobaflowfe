import type { CSSProperties, ReactElement } from 'react';

const boxStyle: CSSProperties = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 6,
  fontSize: 12,
  padding: '8px 12px',
};

function formatTooltipValue(v: unknown): string {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(4).replace(/\.?0+$/, '');
}

/** Recharts tooltip: same rows as default, plus a **Total** line (sum of numeric payload values). */
export function RechartsTooltipWithTotal(props: {
  active?: boolean;
  payload?: ReadonlyArray<{ name?: string; value?: unknown; color?: string }>;
  label?: unknown;
}): ReactElement | null {
  const { active, payload, label } = props;
  if (!active || !payload?.length) return null;

  let total = 0;
  const rows = payload.map((entry, i) => {
    const raw = entry.value;
    const n = typeof raw === 'number' ? raw : Number(raw);
    if (Number.isFinite(n)) total += n;
    const display = formatTooltipValue(raw);
    const name = entry.name ?? '';
    return (
      <div key={i} style={{ color: entry.color }} className="leading-snug">
        {`${name} : ${display}`}
      </div>
    );
  });

  return (
    <div style={boxStyle}>
      {label != null && label !== '' && (
        <div className="font-medium mb-1.5 pb-1 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          {String(label)}
        </div>
      )}
      {rows}
      <div
        className="mt-1.5 pt-1.5 font-medium border-t"
        style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
      >
        {`Total : ${formatTooltipValue(total)}`}
      </div>
    </div>
  );
}
