"use client";

import { useEffect, useState } from "react";
import { Eye, Lock, Loader2, RefreshCw } from "lucide-react";

import { Panel, StatCard } from "@/components/cards/Card";
import {
  ConfirmDialog,
  Modal,
} from "@/components/modals/Modal";

import { useToast } from "@/components/common/Toast";

import {
  closeDay,
  getReports,
  getReportById,
  type DayEndReport,
} from "@/services/adminservice";

export default function AdminReportsPage() {
  const { show } = useToast();

  const [reports, setReports] = useState<DayEndReport[]>([]);
  const [todayReport, setTodayReport] =
    useState<DayEndReport | null>(null);

  const [confirmClose, setConfirmClose] =
    useState(false);

  const [viewing, setViewing] =
    useState<DayEndReport | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [closing, setClosing] =
    useState(false);

  const [viewLoading, setViewLoading] =
    useState(false);

  // ==========================================
  // LOAD REPORTS
  // ==========================================

  const loadReports = async () => {
    try {
      setLoading(true);

      const response = await getReports();

      if (response?.success) {
        const data = response.data || [];

        setReports(data);

        // Latest report
        if (data.length > 0) {
          setTodayReport(data[0]);
        } else {
          setTodayReport(null);
        }
      }
    } catch (error: any) {
      console.error("Failed to load reports:", error);

      show(
        "error",
        error?.response?.data?.message ||
          "Failed to load day-end reports"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadReports();
  }, []);

  // ==========================================
  // CLOSE DAY
  // ==========================================

  const handleCloseDay = async () => {
    try {
      setClosing(true);

      const response = await closeDay();

      if (response?.success) {
        show(
          "success",
          "Hospital day closed successfully."
        );

        setConfirmClose(false);

        await loadReports();
      }
    } catch (error: any) {
      console.error("Close day error:", error);

      show(
        "error",
        error?.response?.data?.message ||
          "Failed to close hospital day"
      );
    } finally {
      setClosing(false);
    }
  };

  // ==========================================
  // VIEW REPORT
  // ==========================================

  const handleViewReport = async (
    id: number | string
  ) => {
    try {
      setViewLoading(true);

      const response = await getReportById(id);

      if (response?.success) {
        setViewing(response.data);
      }
    } catch (error: any) {
      console.error(
        "Get report details error:",
        error
      );

      show(
        "error",
        error?.response?.data?.message ||
          "Failed to load report"
      );
    } finally {
      setViewLoading(false);
    }
  };

  // ==========================================
  // TODAY STATS
  // ==========================================

  const stats = todayReport
    ? {
        totalPatients: Number(
          todayReport.total_patients || 0
        ),

        totalTokens: Number(
          todayReport.total_tokens || 0
        ),

        completed: Number(
          todayReport.completed_tokens || 0
        ),

        waiting: Number(
          todayReport.waiting_tokens || 0
        ),

        hold: Number(
          todayReport.hold_tokens || 0
        ),

        skipped: Number(
          todayReport.skipped_tokens || 0
        ),

        prescriptions: Number(
          todayReport.total_prescriptions || 0
        ),

        medicinesGiven: Number(
          todayReport.medicines_given || 0
        ),

        medicinesUnavailable: Number(
          todayReport.medicines_unavailable || 0
        ),

        remainingStock: Number(
          todayReport.remaining_stock || 0
        ),
      }
    : {
        totalPatients: 0,
        totalTokens: 0,
        completed: 0,
        waiting: 0,
        hold: 0,
        skipped: 0,
        prescriptions: 0,
        medicinesGiven: 0,
        medicinesUnavailable: 0,
        remainingStock: 0,
      };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Day-end report
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Review today's activity before closing
            the hospital day.
          </p>
        </div>

        <button
          onClick={loadReports}
          disabled={loading}
          className="inline-flex items-center gap-2 border border-line rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />

          Refresh
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <Panel>
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2
              size={20}
              className="animate-spin mr-2"
            />

            Loading reports...
          </div>
        </Panel>
      ) : (
        <>
          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            <StatCard
              label="Total patients"
              value={stats.totalPatients}
            />

            <StatCard
              label="Total tokens"
              value={stats.totalTokens}
            />

            <StatCard
              label="Completed"
              value={stats.completed}
              tone="green"
            />

            <StatCard
              label="Waiting"
              value={stats.waiting}
              tone="amber"
            />

            <StatCard
              label="Hold"
              value={stats.hold}
              tone="amber"
            />

            <StatCard
              label="Skipped"
              value={stats.skipped}
              tone="red"
            />

            <StatCard
              label="Prescriptions"
              value={stats.prescriptions}
            />

            <StatCard
              label="Remaining stock"
              value={stats.remainingStock}
            />

          </div>

          {/* MEDICINES */}
          <Panel title="Medicines summary">

            <div className="grid grid-cols-2 gap-4 mb-5">

              <StatCard
                label="Medicines given"
                value={stats.medicinesGiven}
                tone="green"
              />

              <StatCard
                label="Medicines unavailable"
                value={stats.medicinesUnavailable}
                tone="red"
              />

            </div>

            <button
              onClick={() =>
                setConfirmClose(true)
              }
              disabled={closing}
              className="inline-flex items-center gap-2 bg-teal-800 text-white text-sm font-semibold rounded-lg px-5 py-2.5 hover:bg-teal-900 disabled:opacity-40"
            >
              {closing ? (
                <>
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />

                  Closing...
                </>
              ) : (
                <>
                  <Lock size={15} />

                  Close day
                </>
              )}
            </button>

          </Panel>

          {/* REPORT HISTORY */}
          <Panel
            title="Report history"
            className="!p-0"
          >

            <div className="overflow-x-auto">

              <table className="w-full text-sm min-w-[1000px]">

                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 border-t border-line">

                    <th className="px-5 py-3">
                      Date
                    </th>

                    <th className="px-5 py-3">
                      Patients
                    </th>

                    <th className="px-5 py-3">
                      Tokens
                    </th>

                    <th className="px-5 py-3">
                      Completed
                    </th>

                    <th className="px-5 py-3">
                      Prescriptions
                    </th>

                    <th className="px-5 py-3">
                      Medicines used
                    </th>

                    <th className="px-5 py-3">
                      Remaining stock
                    </th>

                    <th className="px-5 py-3">
                      Closed by
                    </th>

                    <th className="px-5 py-3">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {reports.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-5 py-12 text-center text-slate-400"
                      >
                        No day-end reports found.
                      </td>
                    </tr>
                  ) : (
                    reports.map((r) => (

                      <tr
                        key={String(r.id)}
                        className="border-t border-line hover:bg-teal-50/60"
                      >

                        <td className="px-5 py-3.5 font-medium text-ink whitespace-nowrap">
                          {r.report_date}
                        </td>

                        <td className="px-5 py-3.5 text-slate-600">
                          {r.total_patients}
                        </td>

                        <td className="px-5 py-3.5 text-slate-600">
                          {r.total_tokens}
                        </td>

                        <td className="px-5 py-3.5 text-slate-600">
                          {r.completed_tokens}
                        </td>

                        <td className="px-5 py-3.5 text-slate-600">
                          {r.total_prescriptions}
                        </td>

                        <td className="px-5 py-3.5 text-slate-600">
                          {r.medicines_used}
                        </td>

                        <td className="px-5 py-3.5 text-slate-600">
                          {r.remaining_stock}
                        </td>

                        <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                          {r.closed_by ?? "—"}
                        </td>

                        <td className="px-5 py-3.5">

                          <button
                            onClick={() =>
                              handleViewReport(r.id)
                            }
                            disabled={viewLoading}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 border border-teal-800/25 rounded-lg px-2.5 py-1.5 hover:bg-teal-50 disabled:opacity-50"
                          >
                            {viewLoading ? (
                              <Loader2
                                size={13}
                                className="animate-spin"
                              />
                            ) : (
                              <Eye size={13} />
                            )}

                            View
                          </button>

                        </td>

                      </tr>

                    ))
                  )}

                </tbody>

              </table>

            </div>

          </Panel>
        </>
      )}

      {/* CLOSE DAY CONFIRM */}
      <ConfirmDialog
        open={confirmClose}
        onClose={() =>
          !closing &&
          setConfirmClose(false)
        }
        onConfirm={handleCloseDay}
        title="Close the hospital day?"
        description="This finalizes today's report. Waiting patients should be resolved before closing."
        confirmLabel={
          closing
            ? "Closing..."
            : "Close day"
        }
      />

      {/* REPORT DETAILS */}
      <Modal
        open={!!viewing}
        onClose={() =>
          !viewLoading &&
          setViewing(null)
        }
        title={
          viewing
            ? `Report — ${viewing.report_date}`
            : "Report"
        }
      >

        {viewing && (

          <div className="grid grid-cols-2 gap-3 text-sm">

            {[
              [
                "Total patients",
                viewing.total_patients,
              ],

              [
                "Total tokens",
                viewing.total_tokens,
              ],

              [
                "Completed",
                viewing.completed_tokens,
              ],

              [
                "Waiting",
                viewing.waiting_tokens,
              ],

              [
                "Hold",
                viewing.hold_tokens,
              ],

              [
                "Skipped",
                viewing.skipped_tokens,
              ],

              [
                "Medicine pending tokens",
                viewing.medicine_pending_tokens,
              ],

              [
                "Medicine completed tokens",
                viewing.medicine_completed_tokens,
              ],

              [
                "Prescriptions",
                viewing.total_prescriptions,
              ],

              [
                "Medicines used",
                viewing.medicines_used,
              ],

              [
                "Medicines given",
                viewing.medicines_given,
              ],

              [
                "Medicines unavailable",
                viewing.medicines_unavailable,
              ],

              [
                "Remaining stock",
                viewing.remaining_stock,
              ],

            ].map(([label, value]) => (

              <div
                key={String(label)}
                className="border border-line rounded-lg px-3 py-2.5"
              >

                <p className="text-xs text-slate-400">
                  {label}
                </p>

                <p className="font-display font-bold text-ink">
                  {value}
                </p>

              </div>

            ))}

            <div className="col-span-2 border border-line rounded-lg px-3 py-2.5">

              <p className="text-xs text-slate-400">
                Closed by
              </p>

              <p className="font-display font-bold text-ink">
                {viewing.closed_by ?? "—"}
              </p>

            </div>

            <div className="col-span-2 border border-line rounded-lg px-3 py-2.5">

              <p className="text-xs text-slate-400">
                Closed at
              </p>

              <p className="font-display font-bold text-ink">
                {viewing.closed_at ?? "—"}
              </p>

            </div>

          </div>

        )}

      </Modal>

    </div>
  );
}