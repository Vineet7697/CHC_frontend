"use client";

import React, { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative bg-panel rounded-t-2xl sm:rounded-2xl border border-line shadow-2xl w-full ${width} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-4 border-b border-line sticky top-0 bg-panel">
          <div>
            <h3 id="modal-title" className="font-display font-semibold text-lg text-ink">
              {title}
            </h3>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close dialog" className="text-slate-400 hover:text-ink shrink-0 mt-0.5">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 sm:px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  danger = true,
  requireReason = false,
  reasonPlaceholder = "Add a reason...",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  requireReason?: boolean;
  reasonPlaceholder?: string;
}) {
  const [reason, setReason] = React.useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div role="alertdialog" aria-modal="true" className="relative bg-panel rounded-2xl border border-line shadow-2xl w-full max-w-sm p-6">
        <span className={`grid place-items-center w-10 h-10 rounded-full mb-3.5 ${danger ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
          <AlertTriangle size={18} />
        </span>
        <h3 className="font-display font-semibold text-ink text-base">{title}</h3>
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>
        {requireReason && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={reasonPlaceholder}
            rows={2}
            className="w-full mt-3 text-sm border border-line rounded-lg px-3 py-2 outline-none focus:border-teal-700 resize-none"
          />
        )}
        <div className="flex gap-2.5 mt-5">
          <button
            onClick={onClose}
            className="flex-1 text-sm font-semibold border border-line rounded-lg py-2.5 text-slate-600 hover:bg-teal-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason || undefined)}
            disabled={requireReason && !reason.trim()}
            className={`flex-1 text-sm font-semibold rounded-lg py-2.5 text-white disabled:opacity-40 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-teal-800 hover:bg-teal-900"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
