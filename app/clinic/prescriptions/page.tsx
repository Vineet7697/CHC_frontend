"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Pill, RefreshCw } from "lucide-react";

import {
  clinicService,
  type PendingPrescription,
} from "@/services/clinicservice";

import { Panel } from "@/components/cards/Card";
import { MiniTokenChip } from "@/components/token/TokenBoard";
import StatusBadge from "@/components/badges/StatusBadge";
import { EmptyState } from "@/components/common/States";

export default function ClinicDispensingPage() {
  const [prescriptions, setPrescriptions] = useState<PendingPrescription[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ========================================
  // LOAD QUEUE
  // ========================================

  async function loadQueue(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await clinicService.getPendingPrescriptions();

      console.log("Dispensing queue:", response);

      setPrescriptions(response?.data ?? []);
    } catch (error: any) {
      console.error("Dispensing queue API error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load dispensing queue",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadQueue();
  }, []);

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
            Active prescriptions currently waiting at the medical shop.
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
            Active prescriptions currently waiting at the medical shop.
          </p>
        </div>

        <Panel>
          <div className="py-10 text-center">
            <p className="text-sm text-red-500">{error}</p>

            <button
              type="button"
              onClick={() => loadQueue()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900"
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
  // PAGE
  // ========================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Dispensing queue
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Active prescriptions currently waiting at the medical shop.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadQueue(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={14}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* EMPTY */}

      {prescriptions.length === 0 ? (
        <Panel>
          <EmptyState
            icon={Pill}
            title="Nothing to dispense"
            description="No active prescriptions are waiting at the medical shop."
          />
        </Panel>
      ) : (
        /* QUEUE */

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prescriptions.map((rx) => {
            const medicineCount = Number(rx.medicine_count ?? 0);

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
                className="flex min-h-[280px] flex-col gap-4 rounded-2xl border border-line bg-panel p-5 transition-all hover:border-teal-700 hover:shadow-lg hover:shadow-teal-900/5"
              >
                {/* TOKEN + STATUS */}

                <div className="flex items-center justify-between gap-3">
                  {tokenCode ? (
                    <MiniTokenChip code={tokenCode} />
                  ) : (
                    <span className="text-xs text-slate-400">
                      No token
                    </span>
                  )}

                  <StatusBadge status={rx.prescription_status} />
                </div>

                {/* PATIENT */}

                <div>
                  <p className="font-display text-base font-semibold text-ink">
                    {rx.patient_name || "Unknown patient"}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {rx.patient_id
                      ? `Patient ID: ${rx.patient_id}`
                      : "Patient ID unavailable"}
                  </p>
                </div>

                {/* DOCTOR / ROOM */}

                <div className="space-y-1">
                  <p className="text-xs text-slate-500">
                    {rx.doctor_name || "Doctor not available"}
                  </p>

                  <p className="text-xs text-slate-500">
                    Room{" "}
                    {rx.room_number != null ? rx.room_number : "—"}
                  </p>
                </div>

                {/* MEDICINE COUNT */}

                <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Pill size={14} />

                    <span>
                      {medicineCount}{" "}
                      {medicineCount === 1 ? "medicine" : "medicines"}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-xs font-semibold text-teal-800">
                    Open
                    <ArrowRight size={12} />
                  </span>
                </div>

                {/* PRESCRIBED TIME */}

                {rx.prescribed_at && (
                  <p className="text-[11px] text-slate-400">
                    Prescribed: {rx.prescribed_at}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}