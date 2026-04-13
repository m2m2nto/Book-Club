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
        'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        variant === 'primary'
          ? 'bg-accent text-white hover:bg-violet-500'
          : 'border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
