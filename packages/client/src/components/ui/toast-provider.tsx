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
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-[24rem] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            className={cn(
              'pointer-events-auto rounded-[var(--radius-xl)] border p-4 shadow-[var(--shadow-overlay)] backdrop-blur-md transition-all duration-[var(--motion-duration-base)] ease-[var(--motion-ease-emphasized)]',
              toast.variant === 'success' &&
                'border-[color:var(--color-success-base)]/12 bg-[color:var(--color-success-soft)]/95 text-[color:var(--color-success-base)]',
              toast.variant === 'error' &&
                'border-[color:var(--color-error-base)]/12 bg-[color:var(--color-error-soft)]/96 text-[color:var(--color-error-base)]',
              toast.variant === 'info' &&
                'border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-raised)]/96 text-[color:var(--color-info-base)]',
            )}
            key={toast.id}
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <p className="text-sm font-semibold leading-5 text-[color:var(--color-text-primary)]">
                  {toast.title}
                </p>
                {toast.description ? (
                  <p className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                className="rounded-[var(--radius-md)] px-2.5 py-1 text-xs font-medium text-[color:var(--color-text-muted)] hover:bg-black/5 hover:text-[color:var(--color-text-primary)]"
                onClick={() => dismissToast(toast.id)}
                type="button"
              >
                Close
              </button>
            </div>
            {toast.actionLabel && toast.onAction ? (
              <button
                className="mt-4 rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-white/70 px-3 py-2 text-sm font-medium text-[color:var(--color-text-primary)] hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-canvas-subtle)]"
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
