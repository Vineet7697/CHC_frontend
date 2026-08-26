import React from "react";

type Tone =
  | "waiting"
  | "active"
  | "hold"
  | "danger"
  | "done"
  | "muted"
  | "pending";

const TONE_CLASSES: Record<Tone, string> = {
  waiting: "bg-blue-100 text-blue-600",
  active: "bg-amber-100 text-amber-600",
  hold: "bg-amber-100 text-amber-600",
  danger: "bg-red-100 text-red-600",
  done: "bg-green-100 text-green-600",
  muted: "bg-teal-100 text-slate-500",
  pending: "bg-teal-100 text-teal-700",
};

const STATUS_MAP: Record<string, { label: string; tone: Tone }> = {
  WAITING: { label: "Waiting", tone: "waiting" },
  CALLED: { label: "Called", tone: "active" },
  IN_CONSULTATION: { label: "In consultation", tone: "active" },
  HOLD: { label: "On hold", tone: "hold" },
  SKIPPED: { label: "Skipped", tone: "danger" },
  COMPLETED: { label: "Completed", tone: "done" },
  MEDICINE_PENDING: { label: "Medicine pending", tone: "pending" },
  MEDICINE_COMPLETED: { label: "Medicine given", tone: "done" },
  PRESCRIPTION_CANCELLED: { label: "Cancelled", tone: "danger" },
  PENDING: { label: "Pending", tone: "pending" },
  PARTIALLY_DISPENSED: { label: "Partially dispensed", tone: "hold" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
  GIVEN: { label: "Given", tone: "done" },
  UNAVAILABLE: { label: "Unavailable", tone: "danger" },
  AVAILABLE: { label: "Available", tone: "done" },
  LOW_STOCK: { label: "Low stock", tone: "hold" },
  OUT_OF_STOCK: { label: "Out of stock", tone: "danger" },
  INACTIVE: { label: "Inactive", tone: "muted" },
  ACTIVE: { label: "Active", tone: "done" },
  IN_SESSION: { label: "In session", tone: "active" },
  CLOSED: { label: "Closed", tone: "muted" },
  SCHEDULED: { label: "Scheduled", tone: "waiting" },
  ENDED: { label: "Ended", tone: "muted" },
};

export default function StatusBadge({
  status,
  className = "",
}: {
  status?: string | null;
  className?: string;
}) {
  const safeStatus = String(status || "UNKNOWN").toUpperCase();

  const cfg = STATUS_MAP[safeStatus] ?? {
    label: safeStatus.replace(/_/g, " "),
    tone: "muted" as Tone,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${className}`}
    >
      {cfg.label}
    </span>
  );
}
