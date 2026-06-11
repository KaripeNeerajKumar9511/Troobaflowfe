import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useDeptCodes, type DeptCodeSection } from '@/hooks/useDeptCodes';

interface DeptCodeSelectProps {
  modelId: string;
  value: string;
  onChange: (value: string) => void;
  section: DeptCodeSection;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export function DeptCodeSelect({ modelId, value, onChange, section, className, onOpenChange }: DeptCodeSelectProps) {
  const { deptCodes, loading } = useDeptCodes(modelId, section);

  const catalogValues = new Set(deptCodes.map((dc) => dc.value));
  const orphanValue = value.trim() && !catalogValues.has(value) ? value.trim() : null;

  return (
    <Select value={value || '__blank__'} onValueChange={(v) => onChange(v === '__blank__' ? '' : v)} onOpenChange={onOpenChange}>
      <SelectTrigger className={className || 'h-8 w-28'}>
        <SelectValue placeholder={loading ? '…' : '(none)'} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__blank__">(none)</SelectItem>
        {orphanValue && (
          <SelectItem value={orphanValue}>{orphanValue}</SelectItem>
        )}
        {deptCodes.map(dc => (
          <SelectItem key={dc.id} value={dc.value}>{dc.value}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
