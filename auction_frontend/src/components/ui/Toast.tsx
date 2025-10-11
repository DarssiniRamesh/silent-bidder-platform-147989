"use client";

import React from "react";

/**
 * PUBLIC_INTERFACE
 * Toast system: use Toaster at app root and Toast.show to display messages.
 */
export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

type ToastContextType = {
  show: (type: ToastType, message: string, duration?: number) => void;
};

const ToastContext = React.createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <Toaster/>");
  return ctx;
}

export function Toaster({ children }: { children?: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const show = React.useCallback((type: ToastType, message: string, duration = 3000) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { id, type, message, duration };
    setItems((prev) => [...prev, item]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }, Math.max(1200, duration));
  }, []);

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div id="toaster" aria-live="polite" aria-atomic="false">
        {items.map((i) => (
          <div
            key={i.id}
            role="status"
            className={[
              "pointer-events-auto min-w-[280px] max-w-[92vw] surface rounded-[var(--radius-md)] px-3 py-2 shadow-[var(--shadow-md)]",
              i.type === "success" ? "border-l-4 border-[--success]" :
              i.type === "warning" ? "border-l-4 border-[--warning]" :
              i.type === "error" ? "border-l-4 border-[--error]" : "border-l-4 border-[--primary]"
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm">{i.message}</span>
              <button
                className="btn text-sm px-2 py-1 bg-transparent hover:bg-[#f3f4f6] rounded-[8px]"
                aria-label="Dismiss notification"
                onClick={() => remove(i.id)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Helper for one-off usage without hook */
export const Toast = {
  // PUBLIC_INTERFACE
  show(container: HTMLElement | null, type: ToastType, message: string, duration?: number) {
    /** This is a public function. */
    if (!container) return;
    const ev = new CustomEvent("toast", { detail: { type, message, duration } as ToastItem });
    container.dispatchEvent(ev);
  },
};

export default Toaster;
