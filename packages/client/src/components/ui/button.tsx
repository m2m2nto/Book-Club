import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '../../lib/utils';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement>
> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export const Button = ({
  children,
  className,
  variant = 'primary',
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        'pressable inline-flex items-center justify-center rounded-[var(--radius-pill)] border px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition-all duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(29,78,216,0.18)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-canvas-default)] disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary'
          ? 'border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] text-[color:var(--color-text-inverse)] shadow-[var(--shadow-soft)] hover:bg-[color:var(--color-accent-primary-hover)]'
          : variant === 'secondary'
            ? 'border-[color:var(--color-border-strong)] bg-[rgba(255,255,255,0.96)] text-[color:var(--color-text-primary)] hover:border-[color:var(--color-text-primary)] hover:bg-[color:var(--color-canvas-subtle)]'
            : 'border-transparent bg-transparent text-[color:var(--color-text-accent)] hover:bg-[color:var(--color-accent-primary-soft)] hover:text-[color:var(--color-accent-primary-hover)]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
