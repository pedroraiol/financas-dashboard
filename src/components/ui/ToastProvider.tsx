import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import clsx from "../../utils/clsx";

interface ToastEntry {
  id: string;
  tone: "success" | "error";
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 3500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (tone: ToastEntry["tone"], message: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((current) => [...current, { id, tone, message }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), AUTO_DISMISS_MS),
      );
    },
    [dismiss],
  );

  const value: ToastContextValue = {
    success: (message) => push("success", message),
    error: (message) => push("error", message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end"
        role="region"
        aria-label="Notificações"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={clsx(
              "pointer-events-auto flex w-[calc(100vw-2rem)] max-w-sm items-center gap-2.5 rounded-card border bg-surface-light dark:bg-surface-dark p-3.5 text-sm shadow-xl",
              toast.tone === "success" ? "border-status-good/30" : "border-status-critical/30",
            )}
          >
            {toast.tone === "success" ? (
              <CheckCircle2 size={18} className="shrink-0 text-status-good" />
            ) : (
              <XCircle size={18} className="shrink-0 text-status-critical" />
            )}
            <p className="flex-1 font-medium text-ink-primary-light dark:text-ink-primary-dark">
              {toast.message}
            </p>
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Fechar notificação"
              className="shrink-0 rounded-full p-1 text-ink-muted hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  return ctx;
}
