"use client";

import { useEffect, useState } from "react";
import { Ban, RefreshCw } from "lucide-react";

import { Panel } from "@/components/cards/Card";
import DataTable, { Column } from "@/components/tables/DataTable";
import StatusBadge from "@/components/badges/StatusBadge";
import { MiniTokenChip } from "@/components/token/TokenBoard";
import { ConfirmDialog } from "@/components/modals/Modal";
import { useToast } from "@/components/common/Toast";

import {
  getPrescriptions,
  getCancelledPrescriptions,
  cancelPrescription as cancelPrescriptionApi,
  type AdminPrescription,
} from "@/services/adminservice";

export default function AdminPrescriptionsPage() {
  const { show } = useToast();

  const [tab, setTab] = useState<"all" | "cancelled">("all");

  const [prescriptions, setPrescriptions] = useState<
    AdminPrescription[]
  >([]);

  const [cancelledPrescriptions, setCancelledPrescriptions] = useState<
    AdminPrescription[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [cancelling, setCancelling] =
    useState<AdminPrescription | null>(null);

  // ============================================
  // LOAD PRESCRIPTIONS
  // ============================================
  const loadPrescriptions = async () => {
    try {
      setLoading(true);

      const data = await getPrescriptions();

      setPrescriptions(data);
    } catch (error) {
      console.error("Failed to load prescriptions:", error);

      show(
        "error",
        "Failed to load prescriptions"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOAD CANCELLED
  // ============================================
  const loadCancelled = async () => {
    try {
      setLoading(true);

      const data = await getCancelledPrescriptions();

      setCancelledPrescriptions(data);
    } catch (error) {
      console.error(
        "Failed to load cancelled prescriptions:",
        error
      );

      show(
        "error",
        "Failed to load cancelled prescriptions"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // INITIAL LOAD
  // ============================================
  useEffect(() => {
    loadPrescriptions();
  }, []);

  // ============================================
  // TAB CHANGE
  // ============================================
  useEffect(() => {
    if (tab === "cancelled") {
      loadCancelled();
    }
  }, [tab]);

  // ============================================
  // CANCEL
  // ============================================
  const handleCancel = async (reason?: string) => {
    if (!cancelling) return;

    try {
      await cancelPrescriptionApi(
        cancelling.id,
        reason || "No reason provided"
      );

      show(
        "success",
        "Prescription cancelled successfully."
      );

      setCancelling(null);

      // Refresh active list
      await loadPrescriptions();

      // Refresh cancelled list
      await loadCancelled();

    } catch (error) {
      console.error(
        "Cancel prescription error:",
        error
      );

      show(
        "error",
        "Failed to cancel prescription."
      );
    }
  };

  // ============================================
  // TABLE COLUMNS
  // ============================================
  const columns: Column<AdminPrescription>[] = [
    {
      header: "Token",
      accessor: (rx) =>
        rx.tokenCode ? (
          <MiniTokenChip code={rx.tokenCode} />
        ) : (
          "—"
        ),
    },

    {
      header: "Patient",
      accessor: (rx) =>
        rx.patientName || "—",
    },

    {
      header: "Doctor",
      accessor: (rx) =>
        rx.doctorName || "—",
    },

    {
      header: "Room",
      accessor: (rx) =>
        rx.roomNumber || "—",
    },

    {
      header: "Medicines",
      accessor: (rx) =>
        `${rx.medicineCount} item${
          rx.medicineCount !== 1
            ? "s"
            : ""
        }`,
    },

    {
      header: "Status",
      accessor: (rx) => (
        <StatusBadge status={rx.status} />
      ),
    },

    {
      header: "Action",

      accessor: (rx) =>
        rx.status === "ACTIVE" ? (
          <button
            onClick={() =>
              setCancelling(rx)
            }
            className="
              inline-flex
              items-center
              gap-1.5
              text-xs
              font-semibold
              border
              border-red-200
              text-red-600
              rounded-lg
              px-2.5
              py-1.5
              hover:bg-red-50
            "
          >
            <Ban size={12} />
            Cancel
          </button>
        ) : (
          <span className="text-xs text-slate-400">
            —
          </span>
        ),
    },
  ];

  // ============================================
  // UI
  // ============================================
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-start justify-between">

        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Prescriptions
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Monitor and, when necessary,
            cancel a prescription.
          </p>
        </div>

        <button
          onClick={() => {
            loadPrescriptions();

            if (tab === "cancelled") {
              loadCancelled();
            }
          }}
          disabled={loading}
          className="
            inline-flex
            items-center
            gap-2
            border
            border-line
            rounded-lg
            px-4
            py-2
            text-sm
            font-semibold
            hover:bg-slate-50
            disabled:opacity-50
          "
        >
          <RefreshCw
            size={15}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* TABS */}
      <div className="
        flex
        bg-teal-50
        border
        border-line
        rounded-xl
        p-1
        max-w-xs
      ">

        <button
          onClick={() =>
            setTab("all")
          }
          className={`
            flex-1
            text-sm
            font-semibold
            rounded-lg
            py-2
            transition-colors
            ${
              tab === "all"
                ? "bg-panel text-teal-800 shadow-sm"
                : "text-slate-500"
            }
          `}
        >
          Active prescriptions
        </button>

        <button
          onClick={() =>
            setTab("cancelled")
          }
          className={`
            flex-1
            text-sm
            font-semibold
            rounded-lg
            py-2
            transition-colors
            ${
              tab === "cancelled"
                ? "bg-panel text-teal-800 shadow-sm"
                : "text-slate-500"
            }
          `}
        >
          Cancelled
        </button>

      </div>

      {/* ACTIVE */}
      {tab === "all" && (
        <Panel className="!p-0">

          <DataTable
            rows={prescriptions.filter(
              (rx) =>
                rx.status !== "CANCELLED"
            )}
             rowKey={(rx) => String(rx.id)}
            columns={columns}
            searchKeys={(rx) =>
              `
                ${rx.patientName ?? ""}
                ${rx.doctorName ?? ""}
                ${rx.tokenCode ?? ""}
              `
            }
            searchPlaceholder="Search by patient, doctor or token"
            emptyTitle={
              loading
                ? "Loading prescriptions..."
                : "No prescriptions yet"
            }
          />

        </Panel>
      )}

      {/* CANCELLED */}
      {tab === "cancelled" && (
        <Panel className="!p-0">

          <div className="overflow-x-auto">

            <table className="
              w-full
              text-sm
              min-w-[900px]
            ">

              <thead>

                <tr className="
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-slate-500
                  border-t
                  border-line
                ">

                  <th className="px-5 py-3">
                    Prescription ID
                  </th>

                  <th className="px-5 py-3">
                    Token
                  </th>

                  <th className="px-5 py-3">
                    Patient
                  </th>

                  <th className="px-5 py-3">
                    Doctor
                  </th>

                  <th className="px-5 py-3">
                    Reason
                  </th>

                  <th className="px-5 py-3">
                    Cancelled By
                  </th>

                  <th className="px-5 py-3">
                    Cancelled At
                  </th>

                </tr>

              </thead>

              <tbody>

                {cancelledPrescriptions.map(
                  (rx) => (

                    <tr
                      key={rx.id}
                      className="
                        border-t
                        border-line
                        hover:bg-teal-50/60
                      "
                    >

                      <td className="
                        px-5
                        py-3.5
                        font-mono
                        text-xs
                        text-slate-500
                      ">
                        #{rx.id}
                      </td>

                      <td className="px-5 py-3.5">

                        {rx.tokenCode ? (
                          <MiniTokenChip
                            code={
                              rx.tokenCode
                            }
                          />
                        ) : (
                          "—"
                        )}

                      </td>

                      <td className="
                        px-5
                        py-3.5
                        font-medium
                        text-ink
                      ">
                        {rx.patientName ||
                          "—"}
                      </td>

                      <td className="
                        px-5
                        py-3.5
                        text-slate-600
                      ">
                        {rx.doctorName ||
                          "—"}
                      </td>

                      <td className="
                        px-5
                        py-3.5
                        text-slate-500
                        max-w-xs
                      ">
                        {rx.cancelReason ||
                          "—"}
                      </td>

                      <td className="
                        px-5
                        py-3.5
                        text-slate-500
                      ">
                        {rx.cancelledBy ||
                          "Admin"}
                      </td>

                      <td className="
                        px-5
                        py-3.5
                        text-slate-500
                      ">
                        {rx.cancelledAt
                          ? new Date(
                              rx.cancelledAt
                            ).toLocaleString()
                          : "—"}
                      </td>

                    </tr>

                  )
                )}

                {!loading &&
                  cancelledPrescriptions.length ===
                    0 && (
                    <tr>

                      <td
                        colSpan={7}
                        className="
                          text-center
                          py-10
                          text-slate-500
                        "
                      >
                        No cancelled
                        prescriptions found.
                      </td>

                    </tr>
                  )}

              </tbody>

            </table>

          </div>

        </Panel>
      )}

      {/* CANCEL DIALOG */}
      <ConfirmDialog

        open={!!cancelling}

        onClose={() =>
          setCancelling(null)
        }

        onConfirm={handleCancel}

        title="Cancel this prescription?"

        description="
          The original record and cancellation
          reason will be preserved for audit
          purposes. This cannot be undone.
        "

        confirmLabel="Cancel prescription"

        requireReason

        reasonPlaceholder="
          Reason for cancellation...
        "
      />

    </div>
  );
}