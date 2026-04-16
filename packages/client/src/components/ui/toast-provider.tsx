import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { cn } from '../../lib/utils';

type ToastVariant = 'success' | 'error' | 'info';

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
};

type ToastRecord = ToastInput & {
  id: number;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextIdRef = useRef(1);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ durationMs = 4000, variant = 'info', ...toast }: ToastInput) => {
      const id = nextIdRef.current++;
      setToasts((current) => [...current, { id, variant, ...toast }]);
      window.setTimeout(() => dismissToast(id), durationMs);
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-[24rem] flex-col gap-3 sm:right-6 sm:top-6">
        {toasts.map((toast) => (
          <div
            className={cn(
              'pointer-events-auto rounded-[var(--radius-xl)] border bg-[rgba(255,255,255,0.96)] p-4 shadow-[var(--shadow-overlay)] backdrop-blur-md',
              toast.variant === 'success' &&
                'border-[color:color-mix(in_srgb,var(--color-success-base)_18%,white)]',
              toast.variant === 'error' &&
                'border-[color:color-mix(in_srgb,var(--color-error-base)_18%,white)]',
              toast.variant === 'info' && 'border-[color:var(--color-border-soft)]',
            )}
            key={toast.id}
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      toast.variant === 'success' &&
                        'bg-[color:var(--color-success-base)]',
                      toast.variant === 'error' &&
                        'bg-[color:var(--color-error-base)]',
                      toast.variant === 'info' &&
                        'bg-[color:var(--color-text-accent)]',
                    )}
                  />
                  <p className="text-sm font-semibold leading-5 text-[color:var(--color-text-primary)]">
                    {toast.title}
                  </p>
                </div>
                {toast.description ? (
                  <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                className="rounded-[var(--radius-md)] px-2.5 py-1 text-xs font-medium text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-canvas-subtle)] hover:text-[color:var(--color-text-primary)]"
                onClick={() => dismissToast(toast.id)}
                type="button"
              >
                Close
              </button>
            </div>
            {toast.actionLabel && toast.onAction ? (
              <button
                className="pressable mt-4 rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2 text-sm font-medium text-[color:var(--color-text-primary)] hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-canvas-subtle)]"
                onClick={() => {
                  toast.onAction?.();
                  dismissToast(toast.id);
                }}
                type="button"
              >
                {toast.actionLabel}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider.');
  }

  return context;
};
