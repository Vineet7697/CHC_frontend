"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

const ToastContext = createContext<{ show: (kind: ToastKind, message: string) => void } | null>(null);

const ICON: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-green-600 shrink-0" />,
  error: <XCircle size={18} className="text-red-600 shrink-0" />,
  info: <Info size={18} className="text-blue-600 shrink-0" />,
};

const BORDER: Record<ToastKind, string> = {
  success: "border-l-green-600",
  error: "border-l-red-600",
  info: "border-l-blue-600",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))]">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`bg-panel border border-line ${BORDER[t.kind]} border-l-4 rounded-lg shadow-lg shadow-black/5 px-3.5 py-3 flex items-start gap-2.5 animate-[toast-in_0.2s_ease-out]`}
          >
            {ICON[t.kind]}
            <p className="text-sm text-ink leading-snug flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="text-slate-400 hover:text-ink shrink-0">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
      <style>{`@keyframes toast-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
