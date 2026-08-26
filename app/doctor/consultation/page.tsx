"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, RefreshCw, Users } from "lucide-react";
import { doctorService, type CurrentPatient } from "@/services/doctorservice";
import { Panel } from "@/components/cards/Card";
import { MiniTokenChip } from "@/components/token/TokenBoard";
import { TextAreaField } from "@/components/forms/Field";
import { EmptyState } from "@/components/common/States";

export default function DoctorConsultationPage() {
  const [currentPatient, setCurrentPatient] = useState<CurrentPatient | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCurrentPatient = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await doctorService.getCurrentPatient();
      setCurrentPatient(response?.data ?? null);
    } catch (e: any) {
      if (e?.response?.status === 404) {
        setCurrentPatient(null);
        return;
      }
      setError(e?.response?.data?.message || "Unable to load current patient");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentPatient();
  }, [loadCurrentPatient]);

  if (loading) {
    return (
      <Panel>
        <div className="py-10 text-center text-sm text-slate-500">Loading current patient...</div>
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel>
        <div className="py-10 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={loadCurrentPatient}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </Panel>
    );
  }

  if (!currentPatient) {
    return (
      <Panel>
        <EmptyState
          icon={Users}
          title="No patient in consultation"
          description="Call the next patient from the queue to start a consultation."
          action={
            <Link
              href="/doctor/patients"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Go to patient queue
            </Link>
          }
        />
      </Panel>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/doctor/patients" className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink">
          <ArrowLeft size={14} /> Back to queue
        </Link>
        <h1 className="font-display text-2xl font-bold text-ink">Current patient</h1>
        <p className="mt-1 text-sm text-slate-500">Review the patient, add notes, then move to prescription.</p>
      </div>

      <Panel>
        <div className="mb-5 flex items-center gap-4 border-b border-line pb-5">
          <MiniTokenChip code={`T-${currentPatient.token_number}`} />
          <div className="flex-1">
            <p className="font-display text-[15px] font-semibold text-ink">{currentPatient.name}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {currentPatient.patient_id} · {currentPatient.age} yrs · {currentPatient.gender}
            </p>
          </div>
        </div>

        <TextAreaField
          id="notes"
          label="Consultation notes"
          placeholder="Symptoms, observations, diagnosis..."
          rows={5}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          hint="Notes are currently kept in this page until the consultation is submitted."
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/doctor/prescription?tokenId=${currentPatient.token_id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
          >
            <FileText size={15} /> Proceed to prescription
          </Link>
        </div>
      </Panel>
    </div>
  );
}
