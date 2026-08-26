"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  ArrowRight,
  Users,
} from "lucide-react";

import {
  doctorService,
  getMedicines,
  type CurrentPatient,
} from "@/services/doctorservice";

import { Panel } from "@/components/cards/Card";
import { MiniTokenChip } from "@/components/token/TokenBoard";

import {
  SelectField,
  TextField,
  TextAreaField,
} from "@/components/forms/Field";

import { EmptyState } from "@/components/common/States";
import { useToast } from "@/components/common/Toast";

const FREQUENCIES = [
  "Once daily",
  "Twice daily",
  "3 times daily",
  "4 times daily",
  "Once at night",
  "As needed (SOS)",
];

interface Medicine {
  id: number;
  name: string;
  generic_name?: string | null;
  unit?: string | null;
  stock_quantity: number;
  is_active: boolean;
}

interface DraftItem {
  id: string;
  medicineId: string;
  medicineName: string;
  dose: string;
  frequency: string;
  duration: string;
  quantity: number;
}

export default function DoctorPrescriptionPage() {
  const { show } = useToast();

  // ========================================
  // STATE
  // ========================================

  const [current, setCurrent] = useState<CurrentPatient | null>(null);

  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [loading, setLoading] = useState(true);

  const [medicinesLoading, setMedicinesLoading] = useState(false);

  const [items, setItems] = useState<DraftItem[]>([]);

  const [advice, setAdvice] = useState("");

  const [draft, setDraft] = useState({
    medicineId: "",
    dose: "",
    frequency: "",
    duration: "",
    quantity: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [submitted, setSubmitted] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // ========================================
  // GET CURRENT PATIENT
  // ========================================

  async function loadCurrentPatient() {
    try {
      setLoading(true);

      const response = await doctorService.getCurrentPatient();

      if (response?.success === false) {
        setCurrent(null);
        return;
      }

      setCurrent(response?.data ?? null);
    } catch (error: any) {
      console.error(
        "GET /doctor/current-patient error:",
        error?.response?.data || error,
      );

      setCurrent(null);

      show(
        "error",
        error?.response?.data?.message || "Unable to load current patient",
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // GET MEDICINES
  // ========================================

  async function loadMedicines() {
    try {
      setMedicinesLoading(true);

      const response = await getMedicines();

      if (!response?.success) {
        setMedicines([]);
        return;
      }

      const data = Array.isArray(response.data) ? response.data : [];

      setMedicines(data);
    } catch (error: any) {
      console.error(
        "GET /doctor/medicines error:",
        error?.response?.data || error,
      );

      setMedicines([]);

      show(
        "error",
        error?.response?.data?.message || "Unable to load medicines",
      );
    } finally {
      setMedicinesLoading(false);
    }
  }

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadCurrentPatient();
    loadMedicines();
  }, []);

  // ========================================
  // ADD MEDICINE
  // ========================================

  function addMedicine() {
    const next: Record<string, string> = {};

    if (!draft.medicineId) {
      next.medicineId = "Select a medicine";
    }

    if (!draft.dose.trim()) {
      next.dose = "Enter a dose";
    }

    if (!draft.frequency) {
      next.frequency = "Select frequency";
    }

    if (!draft.duration.trim()) {
      next.duration = "Enter duration";
    }

    if (!draft.quantity || Number(draft.quantity) <= 0) {
      next.quantity = "Enter a valid quantity";
    }

    setErrors(next);

    if (Object.keys(next).length > 0) {
      return;
    }

    // ========================================
    // FIND MEDICINE
    // ========================================

    const med = medicines.find(
      (m) => String(m.id) === draft.medicineId && Boolean(Number(m.is_active)),
    );
    if (!med) {
      show("error", "Medicine not found or inactive.");
      return;
    }

    // ========================================
    // STOCK CHECK
    // ========================================

    const requestedQuantity = Number(draft.quantity);

    const availableStock = Number(med.stock_quantity);

    if (availableStock <= 0) {
      show("error", `${med.name} is currently out of stock.`);
      return;
    }

    if (requestedQuantity > availableStock) {
      show(
        "error",
        `Only ${availableStock} ${med.unit || ""} available for ${med.name}.`,
      );
      return;
    }

    // ========================================
    // ADD ITEM
    // ========================================

    setItems((prev) => [
      ...prev,
      {
        id: `d${Date.now()}`,
        medicineId: String(med.id),
        medicineName: med.name,
        dose: draft.dose.trim(),
        frequency: draft.frequency,
        duration: draft.duration.trim(),
        quantity: requestedQuantity,
      },
    ]);

    // ========================================
    // RESET FORM
    // ========================================

    setDraft({
      medicineId: "",
      dose: "",
      frequency: "",
      duration: "",
      quantity: "",
    });

    setErrors({});
  }

  // ========================================
  // REMOVE MEDICINE
  // ========================================

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  // ========================================
  // SUBMIT PRESCRIPTION
  // ========================================

  async function handlePrescribe() {
    if (items.length === 0) {
      show("error", "Add at least one medicine before prescribing.");
      return;
    }

    if (!current) {
      show("error", "No patient is currently in consultation.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await doctorService.createPrescription({
        tokenId: current.token_id,

        advice: advice.trim() || undefined,

        medicines: items.map((item) => ({
          medicineId: item.medicineId,
          dose: item.dose,
          frequency: item.frequency,
          duration: item.duration,
          quantity: item.quantity,
        })),
      });

      if (response?.success === false) {
        throw new Error(
          response?.message || "Prescription could not be created",
        );
      }

      show(
        "success",
        response?.message || "Prescription created successfully.",
      );

      setSubmitted(true);
    } catch (error: any) {
      console.error(
        "POST /doctor/prescriptions error:",
        error?.response?.data || error,
      );

      show(
        "error",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to create prescription",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <Panel>
        <div className="py-10 text-center text-sm text-slate-500">
          Loading current patient...
        </div>
      </Panel>
    );
  }

  // ========================================
  // NO CURRENT PATIENT
  // ========================================

  if (!current) {
    return (
      <Panel>
        <EmptyState
          icon={Users}
          title="No patient in consultation"
          description="Call the next patient before writing a prescription."
          action={
            <Link
              href="/doctor/patients"
              className="inline-flex items-center gap-1.5 bg-teal-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-teal-900"
            >
              Go to patient queue
              <ArrowRight size={14} />
            </Link>
          }
        />
      </Panel>
    );
  }

  // ========================================
  // SUCCESS
  // ========================================

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-14">
        <span className="grid place-items-center w-14 h-14 rounded-full bg-green-100 text-green-600 mx-auto mb-4">
          <CheckCircle2 size={24} />
        </span>

        <h1 className="font-display text-xl font-bold text-ink">
          Prescription submitted successfully
        </h1>

        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          {current.name}&apos;s prescription has moved to the Clinic / Medical
          Shop queue for dispensing.
        </p>

        <Link
          href="/doctor/patients"
          className="inline-flex items-center gap-1.5 mt-6 bg-teal-800 text-white text-sm font-semibold rounded-lg px-5 py-2.5 hover:bg-teal-900"
        >
          Back to patient queue
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ========================================
          CURRENT PATIENT
      ======================================== */}

      <div className="flex items-center gap-3">
        <MiniTokenChip code={`T-${current.token_number}`} />

        <div>
          <h1 className="font-display text-xl font-bold text-ink">
            Prescription — {current.name}
          </h1>

          <p className="text-xs text-slate-500">
            {current.patient_id} · {current.age} yrs · {current.gender}
          </p>
        </div>
      </div>

      {/* ========================================
          ADD MEDICINE
      ======================================== */}

      <Panel title="Add medicine">
        {medicinesLoading && (
          <p className="text-xs text-slate-400 mb-3">Loading medicines...</p>
        )}

        {!medicinesLoading && medicines.length === 0 && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
            <p className="text-xs text-amber-700">
              No active medicines are available.
            </p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-x-3">
          {/* MEDICINE */}

          <SelectField
            id="medicineId"
            label="Medicine"
            value={draft.medicineId}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                medicineId: e.target.value,
              }))
            }
            error={errors.medicineId}
            required
            options={medicines
              .filter(
                (m) => Boolean(m.is_active) && Number(m.stock_quantity) > 0,
              )
              .map((m) => ({
                value: String(m.id),
                label: `${m.name}  `,
              }))}
          />

          {/* DOSE */}

          <TextField
            id="dose"
            label="Dose"
            placeholder="e.g. 500 mg"
            value={draft.dose}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                dose: e.target.value,
              }))
            }
            error={errors.dose}
            required
          />

          {/* FREQUENCY */}

          <SelectField
            id="frequency"
            label="Frequency"
            value={draft.frequency}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                frequency: e.target.value,
              }))
            }
            error={errors.frequency}
            required
            options={FREQUENCIES.map((frequency) => ({
              value: frequency,
              label: frequency,
            }))}
          />

          {/* DURATION */}

          <TextField
            id="duration"
            label="Duration"
            placeholder="e.g. 3 days"
            value={draft.duration}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                duration: e.target.value,
              }))
            }
            error={errors.duration}
            required
          />

          {/* QUANTITY */}

          <TextField
            id="quantity"
            label="Quantity"
            placeholder="e.g. 10"
            inputMode="numeric"
            value={draft.quantity}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                quantity: e.target.value,
              }))
            }
            error={errors.quantity}
            required
          />
        </div>

        {/* ADD BUTTON */}

        <button
          onClick={addMedicine}
          disabled={medicinesLoading || medicines.length === 0}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 border border-teal-800/30 rounded-lg px-4 py-2.5 hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={15} />
          Add medicine
        </button>
      </Panel>

      {/* ========================================
          PRESCRIBED MEDICINES
      ======================================== */}

      <Panel
        title="Prescribed medicines"
        subtitle={`${items.length} medicine${
          items.length !== 1 ? "s" : ""
        } added`}
      >
        {items.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">
            No medicines added yet. Use the form above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-line">
                  <th className="py-2 pr-3">Medicine</th>

                  <th className="py-2 pr-3">Dose</th>

                  <th className="py-2 pr-3">Frequency</th>

                  <th className="py-2 pr-3">Duration</th>

                  <th className="py-2 pr-3">Qty</th>

                  <th className="py-2"></th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-line last:border-0"
                  >
                    <td className="py-2.5 pr-3 font-medium text-ink">
                      {item.medicineName}
                    </td>

                    <td className="py-2.5 pr-3 text-slate-600">{item.dose}</td>

                    <td className="py-2.5 pr-3 text-slate-600">
                      {item.frequency}
                    </td>

                    <td className="py-2.5 pr-3 text-slate-600">
                      {item.duration}
                    </td>

                    <td className="py-2.5 pr-3 text-slate-600">
                      {item.quantity}
                    </td>

                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.medicineName}`}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* ========================================
          ADVICE
      ======================================== */}

      <Panel title="Advice">
        <TextAreaField
          id="advice"
          label="Advice for patient"
          rows={3}
          value={advice}
          onChange={(e) => setAdvice(e.target.value)}
          placeholder="e.g. Apply sunscreen daily, review after 5 days..."
        />

        <button
          onClick={handlePrescribe}
          disabled={submitting || items.length === 0}
          className="inline-flex items-center gap-2 bg-teal-800 text-white text-sm font-semibold rounded-lg px-5 py-2.5 hover:bg-teal-900 disabled:opacity-50"
        >
          <Send size={15} />

          {submitting ? "Prescribing..." : "Prescribe"}
        </button>
      </Panel>
    </div>
  );
}
