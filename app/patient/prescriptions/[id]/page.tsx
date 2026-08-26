"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Pill,
  RefreshCw,
  XCircle,
} from "lucide-react";

import {
  getMyPrescriptionDetails,
  type PatientPrescriptionDetails,
  type PatientPrescriptionMedicine,
} from "@/services/patientservice";

import { Panel } from "@/components/cards/Card";

// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({
  status,
}: {
  status: string;
}) {
  switch (status) {
    case "GIVEN":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          <CheckCircle2 size={13} />
          Medicine given
        </span>
      );

    case "UNAVAILABLE":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
          <XCircle size={13} />
          Not available
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
          <Clock3 size={13} />
          Pending
        </span>
      );
  }
}

// ======================================================
// PRESCRIPTION STATUS
// ======================================================

function PrescriptionStatusBadge({
  status,
}: {
  status: string;
}) {
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={14} />
        Completed
      </span>
    );
  }

  if (status === "CANCELLED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
        <XCircle size={14} />
        Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
      <Clock3 size={14} />
      Active
    </span>
  );
}

// ======================================================
// MEDICINE CARD
// ======================================================

function MedicineCard({
  medicine,
}: {
  medicine: PatientPrescriptionMedicine;
}) {
  const isGiven = medicine.dispensing_status === "GIVEN";
  const isUnavailable = medicine.dispensing_status === "UNAVAILABLE";
  const isPending = medicine.dispensing_status === "PENDING";

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      {/* TOP */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
            <Pill size={18} />
          </div>

          <div className="min-w-0">
            <h3 className="font-display font-semibold text-ink">
              {medicine.medicine_name}
            </h3>

            {medicine.unit && (
              <p className="mt-0.5 text-xs text-slate-500">
                {medicine.unit}
              </p>
            )}
          </div>
        </div>

        <StatusBadge status={medicine.dispensing_status} />
      </div>

      {/* MEDICINE DETAILS */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] text-slate-500">Dose</p>

          <p className="mt-1 text-sm font-semibold text-ink">
            {medicine.dose || "—"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] text-slate-500">Frequency</p>

          <p className="mt-1 text-sm font-semibold text-ink">
            {medicine.frequency || "—"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] text-slate-500">Duration</p>

          <p className="mt-1 text-sm font-semibold text-ink">
            {medicine.duration || "—"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] text-slate-500">Quantity</p>

          <p className="mt-1 text-sm font-semibold text-ink">
            {medicine.given_quantity} / {medicine.quantity}
          </p>
        </div>
      </div>

      {/* GIVEN */}
      {isGiven && (
        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <div className="flex items-start gap-2">
            <CheckCircle2
              size={16}
              className="mt-0.5 shrink-0 text-emerald-700"
            />

            <div>
              <p className="text-xs font-semibold text-emerald-700">
                Medicine provided
              </p>

              <p className="mt-0.5 text-xs text-emerald-600">
                {medicine.given_quantity} of {medicine.quantity} units were
                provided by the medical shop.
              </p>

              {medicine.dispensed_at && (
                <p className="mt-1 text-[11px] text-emerald-600">
                  Dispensed: {medicine.dispensed_at}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* UNAVAILABLE */}
      {isUnavailable && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <div className="flex items-start gap-2">
            <XCircle
              size={16}
              className="mt-0.5 shrink-0 text-red-700"
            />

            <div>
              <p className="text-xs font-semibold text-red-700">
                Medicine unavailable
              </p>

              <p className="mt-0.5 text-xs text-red-600">
                This medicine was not available at the medical shop.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PENDING */}
      {isPending && (
        <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
          <div className="flex items-start gap-2">
            <Clock3
              size={16}
              className="mt-0.5 shrink-0 text-amber-700"
            />

            <div>
              <p className="text-xs font-semibold text-amber-700">
                Waiting for dispensing
              </p>

              <p className="mt-0.5 text-xs text-amber-600">
                This medicine has not been processed by the medical shop yet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================================================
// PAGE
// ======================================================

export default function PatientPrescriptionDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  // ====================================================
  // IMPORTANT:
  // Next.js 16 dynamic params are Promise
  // ====================================================

  const { id } = use(params);

  const [data, setData] = useState<PatientPrescriptionDetails | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ====================================================
  // LOAD PRESCRIPTION
  // ====================================================

  async function loadPrescription() {
    try {
      setLoading(true);
      setError("");

      const response = await getMyPrescriptionDetails(id);

      console.log("Patient prescription details:", response);

      setData(response?.data ?? null);

      if (!response?.data) {
        setError("Prescription not found");
      }
    } catch (error: any) {
      console.error("Prescription detail error:", error);

      setData(null);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load prescription",
      );
    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // LOAD ON PAGE OPEN
  // ====================================================

  useEffect(() => {
    loadPrescription();
  }, [id]);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <Panel>
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />

            <p className="mt-4 text-sm text-slate-500">
              Loading prescription...
            </p>
          </div>
        </Panel>
      </div>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Panel>
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-red-500">
              {error || "Prescription not found"}
            </p>

            <button
              onClick={loadPrescription}
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

  const { prescription, summary, medicines } = data;

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <div className="space-y-6">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div>
        <Link
          href="/patient/prescriptions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-teal-800"
        >
          <ArrowLeft size={15} />
          Back to prescriptions
        </Link>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              Prescription #{prescription.prescription_id}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Prescription details and medicine dispensing status.
            </p>
          </div>

          <PrescriptionStatusBadge status={prescription.status} />
        </div>
      </div>

      {/* ==================================================
          DOCTOR / VISIT
      ================================================== */}

      <Panel>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* DOCTOR */}
          <div>
            <p className="text-xs text-slate-500">Doctor</p>

            <p className="mt-1 font-semibold text-ink">
              {prescription.doctor_name
                ? `${prescription.doctor_name}`
                : "Doctor unavailable"}
            </p>
          </div>

          {/* TOKEN */}
          <div>
            <p className="text-xs text-slate-500">Token</p>

            <p className="mt-1 font-semibold text-ink">
              {prescription.token_number != null
                ? `T-${prescription.token_number}`
                : "—"}
            </p>
          </div>

          {/* ROOM */}
          <div>
            <p className="text-xs text-slate-500">Room</p>

            <p className="mt-1 font-semibold text-ink">
              {prescription.room_number ?? "—"}
            </p>
          </div>

          {/* PRESCRIBED */}
          <div>
            <p className="text-xs text-slate-500">Prescribed</p>

            <p className="mt-1 font-semibold text-ink">
              {prescription.prescribed_at || "—"}
            </p>
          </div>
        </div>

        {/* PATIENT */}
        {(prescription.patient_name || prescription.patient_id) && (
          <div className="mt-5 border-t border-line pt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {prescription.patient_name && (
                <div>
                  <p className="text-xs text-slate-500">Patient</p>

                  <p className="mt-1 font-semibold text-ink">
                    {prescription.patient_name}
                  </p>
                </div>
              )}

              {prescription.patient_id && (
                <div>
                  <p className="text-xs text-slate-500">Patient ID</p>

                  <p className="mt-1 font-semibold text-ink">
                    {prescription.patient_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADVICE */}
        {prescription.advice && (
          <div className="mt-5 border-t border-line pt-5">
            <p className="text-xs font-semibold text-slate-500">
              Doctor's advice
            </p>

            <p className="mt-2 text-sm leading-6 text-ink">
              {prescription.advice}
            </p>
          </div>
        )}

        {/* COMPLETED */}
        {prescription.completed_at && (
          <div className="mt-5 border-t border-line pt-5">
            <p className="text-xs text-slate-500">Completed at</p>

            <p className="mt-1 text-sm font-semibold text-emerald-700">
              {prescription.completed_at}
            </p>
          </div>
        )}
      </Panel>

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* TOTAL */}
        <div className="rounded-2xl border border-line bg-panel p-4">
          <p className="text-xs text-slate-500">Total medicines</p>

          <p className="mt-1 text-xl font-bold text-ink">
            {summary.totalMedicines}
          </p>
        </div>

        {/* GIVEN */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-xs text-emerald-600">Given</p>

          <p className="mt-1 text-xl font-bold text-emerald-700">
            {summary.givenMedicines}
          </p>
        </div>

        {/* UNAVAILABLE */}
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-xs text-red-600">Unavailable</p>

          <p className="mt-1 text-xl font-bold text-red-700">
            {summary.unavailableMedicines}
          </p>
        </div>

        {/* PENDING */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-xs text-amber-600">Pending</p>

          <p className="mt-1 text-xl font-bold text-amber-700">
            {summary.pendingMedicines}
          </p>
        </div>
      </div>

      {/* ==================================================
          MEDICINES
      ================================================== */}

      <div>
        <div className="mb-3">
          <h2 className="font-display text-lg font-bold text-ink">
            Medicines
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            See which medicines were prescribed and what was provided by the
            medical shop.
          </p>
        </div>

        {medicines.length === 0 ? (
          <Panel>
            <div className="py-10 text-center">
              <Pill className="mx-auto text-slate-300" size={32} />

              <p className="mt-3 text-sm font-medium text-slate-500">
                No medicines found
              </p>
            </div>
          </Panel>
        ) : (
          <div className="space-y-3">
            {medicines.map((medicine) => (
              <MedicineCard
                key={String(medicine.prescription_item_id)}
                medicine={medicine}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}