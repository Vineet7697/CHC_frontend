"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  PauseCircle,
  Play,
  RefreshCw,
  SkipForward,
  Users,
} from "lucide-react";
import { doctorService, type DoctorPatient } from "@/services/doctorservice";
import { Panel, StatCard } from "@/components/cards/Card";
import { MiniTokenChip } from "@/components/token/TokenBoard";
import StatusBadge from "@/components/badges/StatusBadge";

const COMPLETED_STATUSES = [
  "COMPLETED",
  "MEDICINE_PENDING",
  "MEDICINE_COMPLETED",
];

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await doctorService.getPatients();
      setPatients(response?.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Unable to load patient queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const waiting = useMemo(
    () => patients.filter((p) => p.status === "WAITING"),
    [patients],
  );
  const current = useMemo(
    () => patients.find((p) => p.status === "IN_CONSULTATION"),
    [patients],
  );

  const filtered = useMemo(() => {
    if (filter === "ALL") return patients;
    if (filter === "COMPLETED")
      return patients.filter((p) => COMPLETED_STATUSES.includes(p.status));
    return patients.filter((p) => p.status === filter);
  }, [patients, filter]);

  async function callNext() {
    if (current) {
      setError("Complete the current consultation first.");
      return;
    }
    if (waiting.length === 0) {
      setError("No waiting patients.");
      return;
    }

    try {
      setActionLoading("call-next");
      setError("");
      await doctorService.callNext();
      await loadPatients();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Unable to call next patient");
    } finally {
      setActionLoading(null);
    }
  }

  async function action(key: string, fn: () => Promise<any>) {
    try {
      setActionLoading(key);
      setError("");
      await fn();
      await loadPatients();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Patient queue
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage today&apos;s OPD patients.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => action("refresh", loadPatients)}
            disabled={actionLoading !== null}
            className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={actionLoading === "refresh" ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            onClick={callNext}
            disabled={
              actionLoading !== null || waiting.length === 0 || !!current
            }
            className="inline-flex items-center gap-2 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play size={15} />
            {actionLoading === "call-next" ? "Calling..." : "Call next"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Waiting" value={waiting.length} icon={Clock3} />
        <StatCard
          label="In consultation"
          value={current ? 1 : 0}
          icon={Users}
        />
        <StatCard
          label="Hold"
          value={patients.filter((p) => p.status === "HOLD").length}
          icon={PauseCircle}
        />
        <StatCard
          label="Completed"
          value={
            patients.filter((p) => COMPLETED_STATUSES.includes(p.status)).length
          }
          icon={CheckCircle2}
        />
      </div>

      {current && (
        <Panel>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <MiniTokenChip code={`T-${current.token_number}`} />
            <div className="flex-1">
              <p className="font-display font-semibold text-ink">
                {current.patient_name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {current.patient_id} · {current.age} yrs · {current.gender}
              </p>
            </div>
            <a
              href={`/doctor/consultation?tokenId=${current.token_id}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
            >
              Continue consultation
            </a>
          </div>
        </Panel>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          "ALL",
          "WAITING",
          "IN_CONSULTATION",
          "HOLD",
          "SKIPPED",
          "COMPLETED",
        ].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              filter === item
                ? "border-teal-800 bg-teal-800 text-white"
                : "border-line bg-white text-slate-600"
            }`}
          >
            {item.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      <Panel>
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Loading patient queue...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            No patients found.
          </div>
        ) : (
          <div className="divide-y divide-line">
            {filtered.map((patient) => (
              <div
                key={patient.token_id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"
              >
                <MiniTokenChip code={`T-${patient.token_number}`} />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-semibold text-ink">
                    {patient.patient_name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {patient.patient_id} · {patient.age} yrs · {patient.gender}
                  </p>
                </div>

                <StatusBadge status={patient.status} />

                {(patient.status === "HOLD" ||
                  patient.status === "SKIPPED") && (
                  <button
                    onClick={() =>
                      action(`recall-${patient.token_id}`, () =>
                        doctorService.recallPatient(patient.token_id),
                      )
                    }
                    disabled={actionLoading !== null}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink disabled:opacity-50"
                  >
                    <RefreshCw
                      size={13}
                      className={
                        actionLoading === `recall-${patient.token_id}`
                          ? "animate-spin"
                          : ""
                      }
                    />
                    Recall
                  </button>
                )}
                {patient.status === "WAITING" && !current && (
                  <>
                    <button
                      onClick={() =>
                        action(`hold-${patient.token_id}`, () =>
                          doctorService.holdPatient(patient.token_id),
                        )
                      }
                      disabled={actionLoading !== null}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink disabled:opacity-50"
                    >
                      <PauseCircle size={13} />
                      Hold
                    </button>

                    <button
                      onClick={() =>
                        action(`skip-${patient.token_id}`, () =>
                          doctorService.skipPatient(patient.token_id),
                        )
                      }
                      disabled={actionLoading !== null}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink disabled:opacity-50"
                    >
                      <SkipForward size={13} />
                      Skip
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
