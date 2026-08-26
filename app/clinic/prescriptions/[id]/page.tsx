"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Pill,
  RefreshCw,
  TriangleAlert,
  XCircle,
} from "lucide-react";

import {
  clinicService,
  type PrescriptionDetails,
  type PrescriptionItem,
} from "@/services/clinicservice";

import { Panel } from "@/components/cards/Card";
import { MiniTokenChip } from "@/components/token/TokenBoard";
import StatusBadge from "@/components/badges/StatusBadge";

export default function ClinicPrescriptionDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const prescriptionId = String(params?.id ?? "");

  const [details, setDetails] = useState<PrescriptionDetails | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingItemId, setProcessingItemId] = useState<
    string | number | null
  >(null);

  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ========================================
  // LOAD DETAILS
  // ========================================

  async function loadDetails(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setActionError("");

      const response =
        await clinicService.getPrescriptionDetails(prescriptionId);

      console.log("Prescription details:", response);

      if (!response?.data) {
        throw new Error("Prescription details not found");
      }

      setDetails(response.data);
    } catch (error: any) {
      console.error("Prescription details API error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load prescription details",
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
    if (!prescriptionId) {
      setError("Invalid prescription ID");
      setLoading(false);
      return;
    }

    loadDetails();
  }, [prescriptionId]);

  // ========================================
  // MEDICINE STATS
  // ========================================

  const medicineStats = useMemo(() => {
    const medicines = details?.medicines ?? [];

    const total = medicines.length;

    const given = medicines.filter(
      (medicine) => medicine.dispensing_status === "GIVEN",
    ).length;

    const unavailable = medicines.filter(
      (medicine) => medicine.dispensing_status === "UNAVAILABLE",
    ).length;

    const pending = medicines.filter(
      (medicine) => medicine.dispensing_status === "PENDING",
    ).length;

    const resolved = given + unavailable;

    const progress =
      total > 0 ? Math.min(100, (resolved / total) * 100) : 0;

    return {
      total,
      given,
      unavailable,
      pending,
      resolved,
      progress,
    };
  }, [details]);

  // ========================================
  // DISPENSE MEDICINE
  // ========================================

  async function handleDispenseMedicine(
    medicine: PrescriptionItem,
    status: "GIVEN" | "UNAVAILABLE",
  ) {
    if (medicine.dispensing_status !== "PENDING") {
      return;
    }

    try {
      setProcessingItemId(medicine.prescription_item_id);
      setActionError("");
      setSuccessMessage("");

      await clinicService.dispenseMedicine(
        medicine.prescription_item_id,
        status,
      );

      setSuccessMessage(
        status === "GIVEN"
          ? `${medicine.medicine_name} dispensed successfully.`
          : `${medicine.medicine_name} marked as unavailable.`,
      );

      await loadDetails(true);
    } catch (error: any) {
      console.error("Dispense medicine error:", error);

      setActionError(
        error?.response?.data?.message ||
          error?.message ||
          `Unable to process ${medicine.medicine_name}`,
      );
    } finally {
      setProcessingItemId(null);
    }
  }

  // ========================================
  // COMPLETE DISPENSING
  // ========================================

  async function handleCompleteDispensing() {
    if (!details) {
      return;
    }

    if (medicineStats.pending > 0) {
      setActionError(
        "All medicines must be marked GIVEN or UNAVAILABLE first.",
      );
      return;
    }

    try {
      setCompleting(true);
      setActionError("");
      setSuccessMessage("");

      const response = await clinicService.completeDispensing(
        details.prescription.prescription_id,
      );

      console.log("Complete dispensing response:", response);

      setSuccessMessage(
        "Medicine dispensing completed successfully.",
      );

      await loadDetails(true);
    } catch (error: any) {
      console.error("Complete dispensing error:", error);

      setActionError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to complete dispensing",
      );
    } finally {
      setCompleting(false);
    }
  }

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/clinic/dispensing"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-800"
          >
            <ArrowLeft size={15} />
            Back to dispensing queue
          </Link>
        </div>

        <Panel>
          <div className="py-12 text-center text-sm text-slate-500">
            Loading prescription details...
          </div>
        </Panel>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error || !details) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/clinic/dispensing"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-800"
          >
            <ArrowLeft size={15} />
            Back to dispensing queue
          </Link>
        </div>

        <Panel>
          <div className="py-12 text-center">
            <TriangleAlert
              size={28}
              className="mx-auto text-red-500"
            />

            <p className="mt-3 text-sm text-red-500">
              {error || "Prescription details not found"}
            </p>

            <button
              type="button"
              onClick={() => loadDetails()}
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

  const prescription = details.prescription;
  const medicines = details.medicines ?? [];

  const tokenCode =
    prescription.token_number != null
      ? `T-${prescription.token_number}`
      : prescription.token_id != null
        ? `T-${prescription.token_id}`
        : null;

  const isCompleted = prescription.status === "COMPLETED";

  const canComplete =
    medicineStats.total > 0 &&
    medicineStats.pending === 0 &&
    !isCompleted;

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="space-y-6">
      {/* ========================================
          HEADER
      ======================================== */}

      <div className="flex flex-col gap-4">
        <Link
          href="/clinic/dispensing"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-800"
        >
          <ArrowLeft size={15} />
          Back to dispensing queue
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              Prescription details
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review and dispense medicines for this prescription.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadDetails(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* ========================================
          ACTION MESSAGE
      ======================================== */}

      {actionError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <TriangleAlert size={18} className="mt-0.5 shrink-0" />

          <p>{actionError}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0"
          />

          <p>{successMessage}</p>
        </div>
      )}

      {/* ========================================
          PRESCRIPTION HEADER
      ======================================== */}

      <Panel>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                {tokenCode ? (
                  <MiniTokenChip code={tokenCode} />
                ) : (
                  <span className="text-xs text-slate-400">
                    No token
                  </span>
                )}

                <StatusBadge status={prescription.status} />
              </div>

              <h2 className="mt-4 font-display text-xl font-bold text-ink">
                {prescription.patient_name || "Unknown patient"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {prescription.patient_id
                  ? `Patient ID: ${prescription.patient_id}`
                  : "Patient ID unavailable"}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-400">
                Prescription ID
              </p>

              <p className="mt-1 text-sm font-semibold text-ink">
                #{prescription.prescription_id}
              </p>
            </div>
          </div>

          {/* PATIENT / DOCTOR INFORMATION */}

          <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-slate-400">Patient</p>

              <p className="mt-1 text-sm font-semibold text-ink">
                {prescription.patient_name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Age / Gender</p>

              <p className="mt-1 text-sm font-semibold text-ink">
                {prescription.age != null
                  ? `${prescription.age} years`
                  : "Age —"}

                {prescription.gender
                  ? ` / ${prescription.gender}`
                  : ""}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Doctor</p>

              <p className="mt-1 text-sm font-semibold text-ink">
                {prescription.doctor_name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Room</p>

              <p className="mt-1 text-sm font-semibold text-ink">
                {prescription.room_number != null
                  ? prescription.room_number
                  : "—"}
              </p>
            </div>
          </div>

          {/* PRESCRIBED TIME */}

          {prescription.prescribed_at && (
            <div className="flex items-center gap-2 border-t border-line pt-5 text-xs text-slate-500">
              <Clock size={14} />

              <span>
                Prescribed: {prescription.prescribed_at}
              </span>
            </div>
          )}

          {/* ADVICE */}

          {prescription.advice && (
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Doctor advice
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {prescription.advice}
              </p>
            </div>
          )}
        </div>
      </Panel>

      {/* ========================================
          DISPENSING SUMMARY
      ======================================== */}

      <div className="grid gap-4 sm:grid-cols-3">
        <Panel>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5 text-teal-800">
              <Pill size={18} />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Total medicines
              </p>

              <p className="mt-0.5 text-xl font-bold text-ink">
                {medicineStats.total}
              </p>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Resolved
              </p>

              <p className="mt-0.5 text-xl font-bold text-ink">
                {medicineStats.resolved}
              </p>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-700">
              <Clock size={18} />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Pending
              </p>

              <p className="mt-0.5 text-xl font-bold text-ink">
                {medicineStats.pending}
              </p>
            </div>
          </div>
        </Panel>
      </div>

      {/* ========================================
          PROGRESS
      ======================================== */}

      <Panel>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">
                Dispensing progress
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                {medicineStats.resolved} of {medicineStats.total} medicines
                resolved
              </p>
            </div>

            <p className="text-sm font-bold text-teal-800">
              {Math.round(medicineStats.progress)}%
            </p>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-teal-100">
            <div
              className="h-full rounded-full bg-teal-700 transition-all duration-300"
              style={{
                width: `${medicineStats.progress}%`,
              }}
            />
          </div>
        </div>
      </Panel>

      {/* ========================================
          MEDICINES
      ======================================== */}

      <div>
        <div className="mb-4">
          <h2 className="font-display text-lg font-bold text-ink">
            Medicines
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Dispense each prescribed medicine or mark it unavailable.
          </p>
        </div>

        {medicines.length === 0 ? (
          <Panel>
            <div className="py-10 text-center">
              <Pill
                size={28}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-semibold text-ink">
                No medicines found
              </p>

              <p className="mt-1 text-xs text-slate-500">
                This prescription does not contain any medicine items.
              </p>
            </div>
          </Panel>
        ) : (
          <div className="space-y-4">
            {medicines.map((medicine, index) => {
              const isPending =
                medicine.dispensing_status === "PENDING";

              const isGiven =
                medicine.dispensing_status === "GIVEN";

              const isUnavailable =
                medicine.dispensing_status === "UNAVAILABLE";

              const isProcessing =
                processingItemId === medicine.prescription_item_id;

              const requiredQuantity = Number(
                medicine.quantity ?? 0,
              );

              const availableStock = Number(
                medicine.available_stock ?? 0,
              );

              const givenQuantity = Number(
                medicine.given_quantity ?? 0,
              );

              const stockAvailable =
                availableStock >= requiredQuantity;

              return (
                <Panel key={String(medicine.prescription_item_id)}>
                  <div className="space-y-5">
                    {/* MEDICINE HEADER */}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-sm font-bold text-teal-800">
                          {index + 1}
                        </div>

                        <div>
                          <h3 className="font-display text-base font-bold text-ink">
                            {medicine.medicine_name}
                          </h3>

                          {medicine.unit && (
                            <p className="mt-0.5 text-xs text-slate-500">
                              {medicine.unit}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* STATUS */}

                      <MedicineStatus
                        status={medicine.dispensing_status}
                      />
                    </div>

                    {/* PRESCRIPTION DETAILS */}

                    <div className="grid gap-4 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-4">
                      <MedicineInfo
                        label="Dose"
                        value={medicine.dose || "—"}
                      />

                      <MedicineInfo
                        label="Frequency"
                        value={medicine.frequency || "—"}
                      />

                      <MedicineInfo
                        label="Duration"
                        value={medicine.duration || "—"}
                      />

                      <MedicineInfo
                        label="Required quantity"
                        value={String(requiredQuantity)}
                      />
                    </div>

                    {/* STOCK */}

                    <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs text-slate-400">
                          Available stock
                        </p>

                        <p
                          className={`mt-1 text-sm font-bold ${
                            stockAvailable
                              ? "text-emerald-700"
                              : "text-red-600"
                          }`}
                        >
                          {availableStock}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Given quantity
                        </p>

                        <p className="mt-1 text-sm font-bold text-ink">
                          {givenQuantity}
                        </p>
                      </div>

                      {!stockAvailable && isPending && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-red-600">
                          <TriangleAlert size={14} />
                          Insufficient stock
                        </div>
                      )}
                    </div>

                    {/* ACTIONS */}

                    {isPending && (
                      <div className="flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            handleDispenseMedicine(
                              medicine,
                              "UNAVAILABLE",
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle size={15} />

                          {isProcessing
                            ? "Processing..."
                            : "Mark unavailable"}
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing || !stockAvailable}
                          onClick={() =>
                            handleDispenseMedicine(
                              medicine,
                              "GIVEN",
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Check size={15} />

                          {isProcessing
                            ? "Processing..."
                            : "Give medicine"}
                        </button>
                      </div>
                    )}

                    {/* GIVEN */}

                    {isGiven && (
                      <div className="flex items-center gap-2 border-t border-line pt-4 text-sm font-semibold text-emerald-700">
                        <CheckCircle2 size={17} />

                        Medicine dispensed
                        {givenQuantity > 0
                          ? ` — ${givenQuantity} given`
                          : ""}
                      </div>
                    )}

                    {/* UNAVAILABLE */}

                    {isUnavailable && (
                      <div className="flex items-center gap-2 border-t border-line pt-4 text-sm font-semibold text-red-600">
                        <XCircle size={17} />

                        Medicine marked unavailable
                      </div>
                    )}
                  </div>
                </Panel>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================
          COMPLETE DISPENSING
      ======================================== */}

      <Panel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-base font-bold text-ink">
              {isCompleted
                ? "Dispensing completed"
                : medicineStats.pending > 0
                  ? "Dispensing is still pending"
                  : "All medicines have been processed"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {isCompleted
                ? "This prescription has been completed successfully."
                : medicineStats.pending > 0
                  ? `${medicineStats.pending} medicine${
                      medicineStats.pending === 1 ? "" : "s"
                    } still need to be processed.`
                  : "You can now complete the dispensing process."}
            </p>
          </div>

          {isCompleted ? (
            <div className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
              <CheckCircle2 size={16} />
              Completed
            </div>
          ) : (
            <button
              type="button"
              disabled={!canComplete || completing}
              onClick={handleCompleteDispensing}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {completing ? (
                <>
                  <RefreshCw
                    size={15}
                    className="animate-spin"
                  />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  Complete dispensing
                </>
              )}
            </button>
          )}
        </div>
      </Panel>
    </div>
  );
}

// ========================================
// MEDICINE INFO
// ========================================

function MedicineInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>

      <p className="mt-1 text-sm font-semibold text-ink">
        {value}
      </p>
    </div>
  );
}

// ========================================
// MEDICINE STATUS
// ========================================

function MedicineStatus({
  status,
}: {
  status: PrescriptionItem["dispensing_status"];
}) {
  if (status === "GIVEN") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={13} />
        GIVEN
      </span>
    );
  }

  if (status === "UNAVAILABLE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
        <XCircle size={13} />
        UNAVAILABLE
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
      <Clock size={13} />
      PENDING
    </span>
  );
}