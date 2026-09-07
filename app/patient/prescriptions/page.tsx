"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Pill,
  RefreshCw,
  XCircle,
} from "lucide-react";

import {
  getMyPrescriptions,
  type PatientPrescriptionSummary,
} from "@/services/patientservice";

import { Panel } from "@/components/cards/Card";
import { EmptyState } from "@/components/common/States";

function getStatusLabel(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Active";

    case "COMPLETED":
      return "Completed";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<
    PatientPrescriptionSummary[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  async function loadPrescriptions() {
    try {
      setLoading(true);
      setError("");

      const response = await getMyPrescriptions();

      setPrescriptions(response?.data ?? []);
    } catch (error: any) {
      console.error("Patient prescriptions error:", error);

      setError(
        error?.response?.data?.message || "Unable to load prescriptions",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrescriptions();
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            My prescriptions
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View your prescriptions and medicine dispensing status.
          </p>
        </div>

        <button
          onClick={loadPrescriptions}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-teal-700 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* LOADING */}

      {loading ? (
        <Panel>
          <div className="py-12 text-center text-sm text-slate-500">
            Loading prescriptions...
          </div>
        </Panel>
      ) : error ? (
        <Panel>
          <div className="py-12 text-center">
            <p className="text-sm text-red-500">{error}</p>

            <button
              onClick={loadPrescriptions}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </Panel>
      ) : prescriptions.length === 0 ? (
        <Panel>
          <EmptyState
            icon={Pill}
            title="No prescriptions yet"
            description="Your prescriptions will appear here after a doctor prescribes medicines."
          />
        </Panel>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => {
            const total = Number(prescription.medicine_count ?? 0);

            const given = Number(prescription.given_medicine_count ?? 0);

            const unavailable = Number(
              prescription.unavailable_medicine_count ?? 0,
            );

            const pending = Number(prescription.pending_medicine_count ?? 0);

            return (
              <Link
                key={String(prescription.prescription_id)}
                href={`/patient/prescriptions/${prescription.prescription_id}`}
                className="block rounded-2xl border border-line bg-panel p-5 transition hover:border-teal-700 hover:shadow-lg hover:shadow-teal-900/5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* LEFT */}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-semibold text-ink">
                        Prescription #{prescription.prescription_id}
                      </span>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                          prescription.prescription_status,
                        )}`}
                      >
                        {getStatusLabel(prescription.prescription_status)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      {" "}
                      {prescription.doctor_name || "Doctor unavailable"}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      {prescription.token_number != null && (
                        <span>
                          Token: T-
                          {prescription.token_number}
                        </span>
                      )}

                      {prescription.room_number != null && (
                        <span>Room {prescription.room_number}</span>
                      )}

                      {prescription.prescribed_at && (
                        <span>
                          {new Date(
                            prescription.prescribed_at,
                          ).toLocaleDateString("en-GB")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* MEDICINE SUMMARY */}

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-[11px] text-slate-500">Total</p>

                      <p className="mt-1 font-semibold text-ink">{total}</p>
                    </div>

                    <div className="rounded-xl bg-emerald-50 px-4 py-3">
                      <p className="text-[11px] text-emerald-600">Given</p>

                      <p className="mt-1 font-semibold text-emerald-700">
                        {given}
                      </p>
                    </div>

                    <div className="rounded-xl bg-red-50 px-4 py-3">
                      <p className="text-[11px] text-red-600">Unavailable</p>

                      <p className="mt-1 font-semibold text-red-700">
                        {unavailable}
                      </p>
                    </div>

                    <div className="rounded-xl bg-amber-50 px-4 py-3">
                      <p className="text-[11px] text-amber-600">Pending</p>

                      <p className="mt-1 font-semibold text-amber-700">
                        {pending}
                      </p>
                    </div>
                  </div>

                  {/* ARROW */}

                  <div className="flex items-center justify-end text-sm font-semibold text-teal-800">
                    View
                    <ArrowRight size={15} className="ml-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
