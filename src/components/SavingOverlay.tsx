import troobaMarkDark from '@/assets/trooba-mark-dark.svg';

/** Full-screen progress UI (same visual language as model duplicate in Model Library). */
export function SavingOverlay() {
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center py-24 text-center px-6">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute h-40 w-40 rounded-full bg-primary/20 blur-2xl animate-pulse" />
          <div className="h-20 w-20 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <img src={troobaMarkDark} alt="" className="absolute h-12 w-12" />
        </div>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]">
          Saving
        </p>
        <p className="mt-1 text-sm text-white/75 animate-pulse drop-shadow-[0_0_6px_rgba(255,255,255,0.25)]">
          Writing your changes…
        </p>
      </div>
    </div>
  );
}
