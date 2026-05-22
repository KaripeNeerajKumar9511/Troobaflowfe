'use client';

import { useEffect, useState } from 'react';
import troobaMarkDark from '@/assets/trooba-mark-dark.svg';
import { cn } from '@/lib/utils';

type TroobaLogoAnimationProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'once' | 'loop';

  /**
   * Optional helper text below the logo.
   * Example: "Preparing your workspace..."
   */
  label?: string;
};

const SIZES = {
  sm: {
    container: 'h-16 w-16',
    blur: 'h-24 w-24',
    ring: 'h-14 w-14',
    mark: 'h-8 w-8',
    label: 'text-xs',
  },
  md: {
    container: 'h-24 w-24',
    blur: 'h-36 w-36',
    ring: 'h-20 w-20',
    mark: 'h-12 w-12',
    label: 'text-sm',
  },
  lg: {
    container: 'h-28 w-28',
    blur: 'h-44 w-44',
    ring: 'h-24 w-24',
    mark: 'h-14 w-14',
    label: 'text-sm',
  },
} as const;

const SPIN_DURATION_MS = 900;
const SETTLE_DURATION_MS = 700;

type OncePhase = 'spin' | 'settle' | 'done';

export function TroobaLogoAnimation({
  className,
  size = 'md',
  variant = 'once',
  label,
}: TroobaLogoAnimationProps) {
  const s = SIZES[size];
  const isLoop = variant === 'loop';

  const [phase, setPhase] = useState<OncePhase>('spin');

  useEffect(() => {
    if (isLoop) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      setPhase('done');
      return;
    }

    const settleTimer = window.setTimeout(() => {
      setPhase('settle');
    }, SPIN_DURATION_MS);

    const doneTimer = window.setTimeout(() => {
      setPhase('done');
    }, SPIN_DURATION_MS + SETTLE_DURATION_MS);

    return () => {
      window.clearTimeout(settleTimer);
      window.clearTimeout(doneTimer);
    };
  }, [isLoop]);

  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-4', className)}
      role={label ? 'status' : undefined}
      aria-live={label ? 'polite' : undefined}
      aria-label={label}
    >
      <div className={cn('relative flex items-center justify-center', s.container)}>
        {/* Glow */}
        <div
          className={cn(
            'absolute rounded-full bg-primary/20 blur-2xl transition-opacity duration-700 ease-out',
            s.blur,
            isLoop && 'animate-pulse',
            !isLoop && phase === 'spin' && 'animate-pulse opacity-100',
            !isLoop && phase === 'settle' && 'opacity-40',
            !isLoop && phase === 'done' && 'opacity-30',
          )}
        />

        {/* Outer ring */}
        <div
          className={cn(
            'rounded-full border-2 transition-all ease-out',
            s.ring,

            isLoop &&
              'border-primary/25 border-t-primary animate-spin motion-safe:[animation-duration:900ms]',

            !isLoop &&
              phase === 'spin' &&
              'border-primary/25 border-t-primary animate-spin motion-safe:[animation-duration:900ms] motion-safe:[animation-iteration-count:1] motion-safe:[animation-fill-mode:forwards]',

            !isLoop &&
              phase === 'settle' &&
              'scale-105 border-primary/70 shadow-[0_0_28px_rgba(16,207,195,0.28)] duration-700',

            !isLoop &&
              phase === 'done' &&
              'scale-100 border-primary/80 shadow-[0_0_18px_rgba(16,207,195,0.18)] duration-500',
          )}
        />

        {/* Inner soft ring */}
        <div
          className={cn(
            'absolute rounded-full border border-primary/10 transition-all duration-700',
            size === 'sm' && 'h-10 w-10',
            size === 'md' && 'h-14 w-14',
            size === 'lg' && 'h-16 w-16',
            !isLoop && phase === 'done' && 'border-primary/20',
          )}
        />

        {/* Logo mark */}
        <img
          src={troobaMarkDark}
          alt=""
          className={cn(
            'absolute transition-transform duration-700 ease-out',
            s.mark,
            !isLoop && phase === 'settle' && 'scale-105',
            !isLoop && phase === 'done' && 'scale-100',
          )}
        />
      </div>

      {label && (
        <p
          className={cn(
            'max-w-[220px] text-center font-medium text-muted-foreground',
            s.label,
          )}
        >
          {label}
        </p>
      )}
    </div>
  );
}