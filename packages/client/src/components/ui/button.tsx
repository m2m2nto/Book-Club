import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '../../lib/utils';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement>
> & {
  variant?: 'primary' | 'secondary';
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
        'inline-flex items-center justify-center rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm font-medium transition-all duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-primary)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-canvas-default)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary'
          ? 'border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] text-[color:var(--color-text-inverse)] shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-primary-hover)] hover:shadow-[var(--shadow-lifted)]'
          : 'border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-base)] text-[color:var(--color-text-primary)] shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-canvas-subtle)]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
