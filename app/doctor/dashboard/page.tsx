"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Clock,
  SkipForward,
  ArrowRight,
  DoorOpen,
} from "lucide-react";

import { StatCard, Panel } from "@/components/cards/Card";
import StatusBadge from "@/components/badges/StatusBadge";
import { MiniTokenChip } from "@/components/token/TokenBoard";

import {
  doctorService,
  type DoctorOPD,
  type DoctorPatient,
  type CurrentPatient,
} from "@/services/doctorservice";

export default function DoctorDashboard() {
  const [opd, setOpd] = useState<DoctorOPD | null>(null);
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [currentPatient, setCurrentPatient] = useState<CurrentPatient | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [todayResponse, patientsResponse, currentResponse] =
        await Promise.all([
          doctorService.getToday(),
          doctorService.getPatients(),
          doctorService.getCurrentPatient().catch((error) => {
            // 404 means no current patient
            if (error?.response?.status === 404) {
              return {
                success: true,
                data: null,
              };
            }

            throw error;
          }),
        ]);

      setOpd(todayResponse?.data ?? null);
      setPatients(patientsResponse?.data ?? []);
      setCurrentPatient(currentResponse?.data ?? null);
    } catch (error: any) {
      console.error("Doctor dashboard error:", error);

      setError(
        error?.response?.data?.message || "Unable to load doctor dashboard",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const waiting = useMemo(
    () => patients.filter((p) => p.status === "WAITING").length,
    [patients],
  );

  const completed = useMemo(
    () =>
      patients.filter((p) =>
        ["COMPLETED", "MEDICINE_PENDING", "MEDICINE_COMPLETED"].includes(
          p.status,
        ),
      ).length,
    [patients],
  );

  const skipped = useMemo(
    () => patients.filter((p) => p.status === "SKIPPED").length,
    [patients],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Panel>
          <div className="py-10 text-center text-sm text-slate-500">
            Loading doctor dashboard...
          </div>
        </Panel>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Panel>
          <div className="py-10 text-center">
            <p className="text-sm text-red-500">{error}</p>

            <button
              onClick={loadDashboard}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
            >
              Retry
            </button>
          </div>
        </Panel>
      </div>
    );
  }

  if (!opd) {
    return (
      <div className="space-y-6">
        <Panel>
          <div className="py-10 text-center">
            <p className="text-sm text-slate-500">
              No OPD session found for today.
            </p>
          </div>
        </Panel>
      </div>
    );
  }

  const doctorName = opd.doctor_name || "Doctor";

  const doctorInitial = doctorName
    .split(" ")
    .slice(-1)[0]
    .charAt(0)
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Doctor / OPD Header */}
      <Panel className="!p-0 overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-teal-50/60">
          <div className="flex items-center gap-4">
            <span className="grid place-items-center w-14 h-14 rounded-2xl bg-teal-800 text-white text-xl font-bold shrink-0">
              {doctorInitial}
            </span>

            <div>
              <p className="font-display text-lg font-bold text-ink">
                {doctorName}
              </p>

              <p className="text-sm text-slate-500">
                {opd.specializations || "Doctor"}
              </p>

              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <DoorOpen size={13} />
                Room {opd.room_number} · {opd.room_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:self-start">
            <StatusBadge status={opd.status} />
          </div>
        </div>
      </Panel>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total patients" value={patients.length} icon={Users} />

        <StatCard label="Waiting" value={waiting} icon={Clock} tone="amber" />

        <StatCard
          label="Completed"
          value={completed}
          icon={CheckCircle2}
          tone="green"
        />

        <StatCard
          label="Skipped"
          value={skipped}
          icon={SkipForward}
          tone="red"
        />
      </div>

      {/* Current consultation */}
      <Panel title="Current consultation">
        {currentPatient ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <MiniTokenChip code={`T-${currentPatient.token_number}`} />

              <div>
                <p className="font-display font-semibold text-ink">
                  {currentPatient.name}
                </p>

                <p className="text-xs text-slate-500 mt-0.5">
                  {currentPatient.patient_id} · {currentPatient.age} yrs ·{" "}
                  {currentPatient.gender}
                </p>
              </div>
            </div>

            <Link
              href="/doctor/consultation"
              className="inline-flex items-center justify-center gap-1.5 bg-teal-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-teal-900"
            >
              Continue consultation
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              No patient currently in consultation.
            </p>

            <Link
              href="/doctor/patients"
              className="inline-flex items-center justify-center gap-1.5 bg-teal-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-teal-900 shrink-0"
            >
              Go to queue
              <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </Panel>
    </div>
  );
}
