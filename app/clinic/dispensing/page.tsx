"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Pill, RefreshCw } from "lucide-react";

import {
  clinicService,
  type PendingPrescription,
} from "@/services/clinicservice";

import { Panel } from "@/components/cards/Card";
import { MiniTokenChip } from "@/components/token/TokenBoard";
import StatusBadge from "@/components/badges/StatusBadge";
import { EmptyState } from "@/components/common/States";

export default function ClinicDispensingPage() {
  const [prescriptions, setPrescriptions] = useState<
    PendingPrescription[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // LOAD PRESCRIPTIONS
  // ========================================

  async function loadPrescriptions() {
    try {
      setLoading(true);
      setError("");

      const response =
        await clinicService.getPendingPrescriptions();

      console.log("Dispensing prescriptions:", response);

      setPrescriptions(response?.data ?? []);
    } catch (error: any) {
      console.error("Clinic dispensing API error:", error);

      setError(
        error?.response?.data?.message ||
          "Unable to load dispensing queue",
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadPrescriptions();
  }, []);

  // ========================================
  // SHOW ACTIVE + COMPLETED
  // CANCELLED WILL NOT SHOW
  // ========================================

  const visiblePrescriptions = prescriptions.filter(
    (rx) =>
      rx.prescription_status === "ACTIVE" ||
      rx.prescription_status === "COMPLETED",
  );

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Dispensing queue
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Active and completed prescriptions at the medical shop.
          </p>
        </div>

        <Panel>
          <div className="py-10 text-center text-sm text-slate-500">
            Loading dispensing queue...
          </div>
        </Panel>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Dispensing queue
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Active and completed prescriptions at the medical shop.
          </p>
        </div>

        <Panel>
          <div className="py-10 text-center">
            <p className="text-sm text-red-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadPrescriptions}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </Panel>
      </div>
    );
  }

  // ========================================
  // EMPTY
  // ========================================

  if (visiblePrescriptions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              Dispensing queue
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Active and completed prescriptions at the medical shop.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPrescriptions}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-teal-700"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        <Panel>
          <EmptyState
            icon={Pill}
            title="No prescriptions"
            description="There are no active or completed prescriptions to show."
          />
        </Panel>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="space-y-6">
      {/* ========================================
          HEADER
      ======================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Dispensing queue
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Active and completed prescriptions at the medical shop.
          </p>
        </div>

        <button
          type="button"
          onClick={loadPrescriptions}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-teal-700"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* ========================================
          QUEUE
      ======================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePrescriptions.map((rx) => {
          const medicineCount = Number(
            rx.medicine_count ?? 0,
          );

          const isCompleted =
            rx.prescription_status === "COMPLETED";

          const isActive =
            rx.prescription_status === "ACTIVE";

          const pendingMedicines =
            rx.pending_medicine_count != null
              ? Number(rx.pending_medicine_count)
              : null;

          const resolvedMedicines =
            rx.given_medicine_count != null
              ? Number(rx.given_medicine_count)
              : null;

          const hasMedicineProgress =
            pendingMedicines != null &&
            resolvedMedicines != null &&
            medicineCount > 0;

          const progress = isCompleted
            ? 100
            : hasMedicineProgress
              ? Math.min(
                  100,
                  (resolvedMedicines! / medicineCount) * 100,
                )
              : 0;

          const tokenCode =
            rx.token_number != null
              ? `T-${rx.token_number}`
              : rx.token_id != null
                ? `T-${rx.token_id}`
                : null;

          return (
            <Link
              key={String(rx.prescription_id)}
              href={`/clinic/prescriptions/${rx.prescription_id}`}
              className={`flex min-h-[290px] flex-col gap-4 rounded-2xl border bg-panel p-5 transition-all hover:shadow-lg ${
                isCompleted
                  ? "border-emerald-200 hover:border-emerald-500 hover:shadow-emerald-900/5"
                  : "border-line hover:border-teal-700 hover:shadow-teal-900/5"
              }`}
            >
              {/* ========================================
                  TOKEN + STATUS
              ======================================== */}

              <div className="flex items-center justify-between gap-2">
                {tokenCode ? (
                  <MiniTokenChip code={tokenCode} />
                ) : (
                  <span className="text-xs text-slate-400">
                    No token
                  </span>
                )}

                <StatusBadge
                  status={rx.prescription_status}
                />
              </div>

              {/* ========================================
                  COMPLETED LABEL
              ======================================== */}

              {isCompleted && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={14} />
                  Dispensing completed
                </div>
              )}

              {/* ========================================
                  PATIENT
              ======================================== */}

              <div>
                <p className="font-display font-semibold text-ink">
                  {rx.patient_name ?? "Unknown patient"}
                </p>

                {rx.patient_id && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    Patient ID: {rx.patient_id}
                  </p>
                )}
              </div>

              {/* ========================================
                  DOCTOR / ROOM
              ======================================== */}

              <div>
                <p className="text-xs text-slate-500">
                  {rx.doctor_name ??
                    "Doctor not available"}
                </p>

                <p className="text-xs text-slate-500">
                  Room{" "}
                  {rx.room_number != null
                    ? rx.room_number
                    : "—"}
                </p>
              </div>

              {/* ========================================
                  MEDICINE STATUS
              ======================================== */}

              {isCompleted ? (
                <div className="flex items-center justify-between border-t border-line pt-3 text-xs">
                  <span className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 size={14} />

                    {medicineCount}{" "}
                    {medicineCount === 1
                      ? "medicine"
                      : "medicines"}{" "}
                    completed
                  </span>

                  <span className="font-semibold text-emerald-700">
                    100%
                  </span>
                </div>
              ) : hasMedicineProgress ? (
                <div className="flex items-center justify-between border-t border-line pt-3 text-xs text-slate-500">
                  <span>
                    {resolvedMedicines}/{medicineCount}{" "}
                    medicines resolved
                  </span>

                  <span className="font-semibold text-teal-800">
                    {pendingMedicines} pending
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between border-t border-line pt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-2">
                    <Pill size={14} />

                    {medicineCount}{" "}
                    {medicineCount === 1
                      ? "medicine"
                      : "medicines"}
                  </span>

                  {isActive && (
                    <span className="font-semibold text-amber-700">
                      Pending
                    </span>
                  )}
                </div>
              )}

              {/* ========================================
                  PROGRESS
              ======================================== */}

              <div className="h-1.5 overflow-hidden rounded-full bg-teal-100">
                <div
                  className={`h-full transition-all ${
                    isCompleted
                      ? "bg-emerald-600"
                      : "bg-teal-700"
                  }`}
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              {/* ========================================
                  PRESCRIBED TIME
              ======================================== */}

              {rx.prescribed_at && (
                <p className="text-[11px] text-slate-400">
                  Prescribed: {rx.prescribed_at}
                </p>
              )}

              {/* ========================================
                  OPEN
              ======================================== */}

              <div className="mt-auto flex items-center justify-end">
                <span
                  className={`flex items-center gap-1 text-xs font-semibold ${
                    isCompleted
                      ? "text-emerald-700"
                      : "text-teal-800"
                  }`}
                >
                  {isCompleted
                    ? "View details"
                    : "Open"}

                  <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}