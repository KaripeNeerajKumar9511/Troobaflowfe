import { useModelStore } from '@/stores/modelStore';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

/** Custom parameter-name editing is disabled; see `USE_CUSTOM_PARAM_LABELS_IN_UI` in `modelStore.ts`. */
export default function ParameterNames() {
  const model = useModelStore((s) => s.getActiveModel());

  if (!model) {
    return (
      <div className="p-6 max-w-3xl space-y-4">
        <div className="h-7 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg mt-6" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl animate-fade-in">
      <h1 className="text-xl font-bold mb-2">Parameter Names</h1>
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground flex gap-3">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Custom parameter names are temporarily turned off in the UI. Labels default to Gen1–Gen4, Lab1–Lab4, Eq1–Eq4,
            Prod1–Prod4, and Oper1–Oper4 everywhere. Nothing is written to the server from this screen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
