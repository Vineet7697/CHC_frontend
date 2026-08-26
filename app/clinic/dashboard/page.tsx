"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Pill,
  CheckCircle2,
  XCircle,
  Users,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import {
  clinicService,
  type PendingPrescription,
  type PrescriptionDetails,
} from "@/services/clinicservice";

import { StatCard, Panel } from "@/components/cards/Card";
import { MiniTokenChip } from "@/components/token/TokenBoard";
import StatusBadge from "@/components/badges/StatusBadge";
import { EmptyState } from "@/components/common/States";

export default function ClinicDashboard() {
  const [prescriptions, setPrescriptions] = useState<PendingPrescription[]>([]);

  const [prescriptionDetails, setPrescriptionDetails] = useState<
    Record<string, PrescriptionDetails>
  >({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // LOAD DASHBOARD
  // ========================================

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await clinicService.getPendingPrescriptions();

      console.log("Clinic pending prescriptions:", response);

      const pendingPrescriptions = response?.data ?? [];

      setPrescriptions(pendingPrescriptions);

      // ----------------------------------------
      // Load details for active prescriptions
      // ----------------------------------------
      //
      // Pending API only returns medicine_count.
      // Actual medicine dispensing status comes
      // from the details API.
      //

      const detailsResults = await Promise.all(
        pendingPrescriptions.map(async (rx) => {
          try {
            const result = await clinicService.getPrescriptionDetails(
              rx.prescription_id,
            );

            return {
              id: String(rx.prescription_id),
              data: result?.data,
            };
          } catch (detailError) {
            console.error(
              `Unable to load prescription ${rx.prescription_id}`,
              detailError,
            );

            return {
              id: String(rx.prescription_id),
              data: undefined,
            };
          }
        }),
      );

      const detailsMap: Record<string, PrescriptionDetails> = {};

      detailsResults.forEach((result) => {
        if (result.data) {
          detailsMap[result.id] = result.data;
        }
      });

      setPrescriptionDetails(detailsMap);
    } catch (error: any) {
      console.error("Clinic dashboard API error:", error);

      setError(
        error?.response?.data?.message || "Unable to load clinic prescriptions",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // ========================================
  // ACTIVE PRESCRIPTIONS
  // ========================================

  const pending = Array.from(
    new Map(
      prescriptions
        .filter((rx) => rx.prescription_status === "ACTIVE")
        .map((rx) => [String(rx.prescription_id), rx]),
    ).values(),
  );

  // ========================================
  // PATIENTS WAITING
  // ========================================

  const patientsWaiting = pending.length;

  // ========================================
  // MEDICINES TO DISPENSE
  // ========================================

  const medicinesToDispense = pending.reduce((sum, rx) => {
    const details = prescriptionDetails[String(rx.prescription_id)];

    const medicines = details?.medicines ?? [];

    const pendingMedicines = medicines.filter(
      (medicine) => medicine.dispensing_status === "PENDING",
    ).length;

    // If details are not loaded yet,
    // use medicine_count from pending API.
    if (!details) {
      return sum + Number(rx.medicine_count ?? 0);
    }

    return sum + pendingMedicines;
  }, 0);

  // ========================================
  // GIVEN TODAY
  // ========================================
  //
  // Current pending API only returns ACTIVE
  // prescriptions.
  //
  // Therefore this counts GIVEN medicines
  // from currently loaded prescriptions.
  //
  // For exact "today" statistics including
  // completed prescriptions, backend should
  // provide a dedicated stats endpoint.
  //

  const givenToday = Object.values(prescriptionDetails).reduce(
    (sum, details) => {
      return (
        sum +
        details.medicines.filter(
          (medicine) => medicine.dispensing_status === "GIVEN",
        ).length
      );
    },
    0,
  );

  // ========================================
  // UNAVAILABLE TODAY
  // ========================================

  const unavailableToday = Object.values(prescriptionDetails).reduce(
    (sum, details) => {
      return (
        sum +
        details.medicines.filter(
          (medicine) => medicine.dispensing_status === "UNAVAILABLE",
        ).length
      );
    },
    0,
  );

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Medical Shop
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Loading prescriptions...
          </p>
        </div>

        <Panel>
          <div className="py-10 text-center text-sm text-slate-500">
            Loading medical shop data...
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
            Medical Shop
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Prescription dispensing dashboard.
          </p>
        </div>

        <Panel>
          <div className="py-10 text-center">
            <p className="text-sm text-red-500">{error}</p>

            <button
              onClick={loadDashboard}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
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
  // DASHBOARD
  // ========================================

  return (
    <div className="space-y-6">
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Medical Shop
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Prescriptions sent by doctors, ready to dispense.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-teal-700"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* ======================================
          STATISTICS
      ====================================== */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Pending prescriptions"
          value={pending.length}
          icon={ClipboardList}
        />

        <StatCard
          label="Patients waiting"
          value={patientsWaiting}
          icon={Users}
          tone="amber"
        />

        <StatCard
          label="Medicines to dispense"
          value={medicinesToDispense}
          icon={Pill}
        />

        <StatCard
          label="Given today"
          value={givenToday}
          icon={CheckCircle2}
          tone="green"
        />

        <StatCard
          label="Unavailable today"
          value={unavailableToday}
          icon={XCircle}
          tone="red"
        />
      </div>

      {/* ======================================
          PENDING PRESCRIPTIONS
      ====================================== */}

      <Panel
        title="Pending prescriptions"
        subtitle="Waiting to be reviewed and dispensed"
        action={
          <Link
            href="/clinic/prescriptions"
            className="flex items-center gap-1 text-xs font-semibold text-teal-800 hover:underline"
          >
            View all
            <ArrowRight size={13} />
          </Link>
        }
      >
        {pending.length === 0 ? (
          <EmptyState
            title="Nothing pending"
            description="No active prescriptions are waiting at the medical shop."
          />
        ) : (
          <div className="space-y-2.5">
            {pending.slice(0, 5).map((rx) => {
              // --------------------------------
              // TOKEN
              // --------------------------------

              const tokenCode =
                rx.token_number != null
                  ? `T-${rx.token_number}`
                  : rx.token_id != null
                    ? `T-${rx.token_id}`
                    : null;

              // --------------------------------
              // DETAILS
              // --------------------------------

              const details = prescriptionDetails[String(rx.prescription_id)];

              const medicines = details?.medicines ?? [];

              // --------------------------------
              // MEDICINE COUNTS
              // --------------------------------

              const totalMedicines = details
                ? medicines.length
                : Number(rx.medicine_count ?? 0);

              const resolvedMedicines = details
                ? medicines.filter(
                    (medicine) => medicine.dispensing_status !== "PENDING",
                  ).length
                : 0;

              const progress =
                totalMedicines > 0
                  ? (resolvedMedicines / totalMedicines) * 100
                  : 0;

              return (
                <Link
                  key={String(rx.prescription_id)}
                  href={`/clinic/prescriptions/${rx.prescription_id}`}
                  className="flex flex-col gap-3 rounded-xl border border-line p-3.5 transition-colors hover:border-teal-700 sm:flex-row sm:items-center"
                >
                  {/* TOKEN */}

                  {tokenCode && <MiniTokenChip code={tokenCode} />}

                  {/* PATIENT */}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {rx.patient_name ?? "Unknown patient"}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {rx.doctor_name ? rx.doctor_name : "Unknown doctor"}

                      {rx.room_number != null
                        ? ` · Room ${rx.room_number}`
                        : ""}

                      {rx.prescribed_at ? ` · ${rx.prescribed_at}` : ""}
                    </p>
                  </div>

                  {/* MEDICINE COUNT */}

                  <div className="hidden text-right sm:block">
                    <p className="text-xs font-semibold text-slate-600">
                      {totalMedicines}{" "}
                      {totalMedicines === 1 ? "medicine" : "medicines"}
                    </p>

                    {details && (
                      <p className="text-[11px] text-slate-400">
                        {resolvedMedicines}/{totalMedicines} resolved
                      </p>
                    )}
                  </div>

                  {/* STATUS */}

                  <StatusBadge status={rx.prescription_status} />
                </Link>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
