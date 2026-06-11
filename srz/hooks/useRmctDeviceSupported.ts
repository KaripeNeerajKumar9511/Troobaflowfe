import { useState, useEffect } from 'react';

/**
 * RMCT is intended for tablet, laptop, and desktop viewports only.
 * Returns `null` until the client has evaluated (avoid SSR flash).
 * `true` when viewport is at least 768px wide; `false` for typical phones and narrow layouts.
 */
export function useRmctDeviceSupported(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const evaluate = () => {
      setSupported(window.matchMedia('(min-width: 768px)').matches);
    };
    evaluate();
    const mqWide = window.matchMedia('(min-width: 768px)');
    mqWide.addEventListener('change', evaluate);
    window.addEventListener('resize', evaluate);
    return () => {
      mqWide.removeEventListener('change', evaluate);
      window.removeEventListener('resize', evaluate);
    };
  }, []);

  return supported;
}
