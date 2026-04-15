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
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            className={cn(
              'pointer-events-auto rounded-2xl border p-4 shadow-glow backdrop-blur',
              toast.variant === 'success' &&
                'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
              toast.variant === 'error' &&
                'border-rose-500/30 bg-rose-500/10 text-rose-100',
              toast.variant === 'info' &&
                'border-violet-500/30 bg-slate-900/95 text-slate-100',
            )}
            key={toast.id}
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="font-medium">{toast.title}</p>
                {toast.description ? (
                  <p className="text-sm text-current/80">{toast.description}</p>
                ) : null}
              </div>
              <button
                className="rounded-lg px-2 py-1 text-xs text-current/80 hover:bg-white/10"
                onClick={() => dismissToast(toast.id)}
                type="button"
              >
                Close
              </button>
            </div>
            {toast.actionLabel && toast.onAction ? (
              <button
                className="mt-3 rounded-xl border border-current/20 px-3 py-2 text-sm font-medium hover:bg-white/10"
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
