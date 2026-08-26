import React from "react";
import type { LucideIcon } from "lucide-react";

export function Panel({
  children,
  className = "",
  title,
  subtitle,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={`bg-panel border border-line rounded-2xl ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-5 pt-5">
          <div>
            {title && <h3 className="font-display font-semibold text-[15px] text-ink">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={title || action ? "p-5" : "p-5"}>{children}</div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "default" | "amber" | "red" | "green";
  hint?: string;
}) {
  const toneClasses: Record<string, string> = {
    default: "bg-teal-100 text-teal-700",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
    green: "bg-green-100 text-green-600",
  };
  return (
    <div className="bg-panel border border-line rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1.5">{value}</p>
        {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      </div>
      {Icon && (
        <span className={`shrink-0 grid place-items-center w-9 h-9 rounded-xl ${toneClasses[tone]}`}>
          <Icon size={18} strokeWidth={2.2} />
        </span>
      )}
    </div>
  );
}
