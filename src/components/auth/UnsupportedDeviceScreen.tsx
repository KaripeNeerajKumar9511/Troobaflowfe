import { MonitorSmartphone } from 'lucide-react';
import { TroobaLogoAnimation } from '@/components/TroobaLogoAnimation';

/** Full-screen message when the app is opened on a device we do not support (e.g. phones). */
export function UnsupportedDeviceScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 px-6 py-12 text-center">
      <TroobaLogoAnimation className="mb-8" size="md" />
      <MonitorSmartphone className="h-14 w-14 text-slate-400 mb-6 shrink-0" aria-hidden />
      <h1 className="text-xl font-semibold tracking-tight text-white max-w-md">
        This device is not supported
      </h1>
      <p className="mt-4 text-sm text-slate-300 max-w-md leading-relaxed">
        Trooba Flow sign-in works on <span className="text-white font-medium">tablet, laptop, or PC</span> browsers
        with a wide enough screen. Please open this page on one of those devices instead.
      </p>
      <p className="mt-6 text-xs text-slate-500 max-w-sm">
        If you are already on a tablet, try rotating to landscape or widening the browser window.
      </p>
    </div>
  );
}
