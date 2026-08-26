import React from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox, AlertTriangle, RotateCcw } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <span className="grid place-items-center w-12 h-12 rounded-full bg-teal-100 text-teal-700 mb-3.5">
        <Icon size={20} />
      </span>
      <p className="font-display font-semibold text-ink">{title}</p>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <span className="grid place-items-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-3.5">
        <AlertTriangle size={20} />
      </span>
      <p className="font-display font-semibold text-ink">Something went wrong</p>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">
        {message ?? "We couldn't load this data. Please check your connection and try again."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 border border-teal-800/30 rounded-lg px-3.5 py-2 hover:bg-teal-50"
        >
          <RotateCcw size={14} /> Retry
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-teal-100/70 ${className}`} />;
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="p-5 space-y-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-panel border border-line rounded-2xl p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-16" />
    </div>
  );
}
