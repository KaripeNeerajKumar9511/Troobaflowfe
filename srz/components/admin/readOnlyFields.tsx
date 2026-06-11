import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';

const roClass = 'bg-muted/40 cursor-default opacity-100';

export function ROInput({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={String(value ?? '')} readOnly disabled className={`mt-1 h-9 ${roClass}`} />
    </div>
  );
}

export function ROTextarea({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Textarea value={value ?? ''} readOnly disabled className={`mt-1 min-h-[72px] ${roClass}`} />
    </div>
  );
}

export function ROSelect({
  label,
  value,
  options,
  className = '',
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} disabled>
        <SelectTrigger className={`mt-1 h-9 ${roClass}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ROCheckbox({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox checked={checked} disabled className="opacity-100" />
      <Label className="text-sm font-normal">{label}</Label>
    </div>
  );
}
