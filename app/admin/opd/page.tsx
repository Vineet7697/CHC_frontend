"use client";

import { useEffect, useState } from "react";

import {
  Play,
  Square,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { Panel } from "@/components/cards/Card";
import StatusBadge from "@/components/badges/StatusBadge";
import {
  ConfirmDialog,
} from "@/components/modals/Modal";

import { useToast } from "@/components/common/Toast";

import {
  getTodayOpd,
  startOpd,
  endOpd,
  type AdminOpdRoom,
} from "@/services/adminservice";

export default function AdminOpdPage() {
  const { show } = useToast();

  const [rooms, setRooms] =
    useState<AdminOpdRoom[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [confirming, setConfirming] =
    useState<{
      room: AdminOpdRoom;
      action: "start" | "end";
    } | null>(null);

  // ========================================
  // LOAD TODAY OPD
  // ========================================

  const loadTodayOpd = async (
    silent = false
  ) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response =
        await getTodayOpd();

      setRooms(
        response?.data || []
      );
    } catch (error: any) {
      console.error(
        "Load OPD error:",
        error
      );

      show(
        "error",
        error?.response?.data?.message ||
          "Failed to load today's OPD."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadTodayOpd();
  }, []);

  // ========================================
  // START / END
  // ========================================

  const handleConfirm = async () => {
    if (!confirming) return;

    const {
      room,
      action,
    } = confirming;

    if (!room.opdSessionId) {
      show(
        "error",
        "Today's OPD session is not available."
      );

      setConfirming(null);

      return;
    }

    try {
      setActionLoading(true);

      if (action === "start") {
        await startOpd(
          room.opdSessionId
        );

        show(
          "success",
          `OPD started in Room ${room.number}.`
        );
      } else {
        await endOpd(
          room.opdSessionId
        );

        show(
          "success",
          `OPD ended in Room ${room.number}.`
        );
      }

      // DB se latest state
      await loadTodayOpd(true);

    } catch (error: any) {
      console.error(
        "OPD action error:",
        error
      );

      show(
        "error",
        error?.response?.data?.message ||
          "Unable to update OPD."
      );
    } finally {
      setActionLoading(false);
      setConfirming(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex items-start justify-between gap-4">

        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            OPD management
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage today&apos;s OPD sessions
            dynamically.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            loadTodayOpd(true)
          }
          disabled={refreshing}
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            border
            border-line
            px-3
            py-2
            text-sm
            font-semibold
            text-slate-700
            hover:bg-slate-50
            disabled:opacity-50
          "
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* ======================================
          TABLE
      ====================================== */}

      <Panel className="!p-0">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[950px] text-sm">

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
                  Room
                </th>

                <th className="px-5 py-3">
                  Doctor
                </th>

                <th className="px-5 py-3">
                  Specialization
                </th>

                <th className="px-5 py-3">
                  Status
                </th>

                <th className="px-5 py-3">
                  Current token
                </th>

                <th className="px-5 py-3">
                  Total patients
                </th>

                <th className="px-5 py-3">
                  Action
                </th>

              </tr>
            </thead>

            <tbody>

              {/* LOADING */}

              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="
                      px-5
                      py-12
                      text-center
                    "
                  >
                    <Loader2
                      size={26}
                      className="
                        mx-auto
                        animate-spin
                        text-teal-700
                      "
                    />
                  </td>
                </tr>
              ) : rooms.length === 0 ? (

                /* EMPTY */

                <tr>
                  <td
                    colSpan={7}
                    className="
                      px-5
                      py-12
                      text-center
                      text-slate-500
                    "
                  >
                    No OPD sessions
                    available for today.
                  </td>
                </tr>

              ) : (

                /* DATA */

                rooms.map((room) => (

                  <tr
                    key={room.id}
                    className="
                      border-t
                      border-line
                      hover:bg-teal-50/60
                    "
                  >

                    {/* ROOM */}

                    <td className="
                      px-5
                      py-3.5
                      font-display
                      font-bold
                      text-ink
                    ">
                      Room {room.number}

                      {room.roomName && (
                        <div className="
                          text-xs
                          font-normal
                          text-slate-400
                          mt-0.5
                        ">
                          {room.roomName}
                        </div>
                      )}
                    </td>

                    {/* DOCTOR */}

                    <td className="
                      px-5
                      py-3.5
                      text-slate-600
                    ">
                      {room.doctorName ||
                        "Unassigned"}
                    </td>

                    {/* SPECIALIZATION */}

                    <td className="
                      px-5
                      py-3.5
                      text-slate-600
                    ">
                      {room.specialization ||
                        "—"}
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-3.5">
                      <StatusBadge
                        status={
                          room.status ||
                          "NOT_STARTED"
                        }
                      />
                    </td>

                    {/* CURRENT TOKEN */}

                    <td className="
                      px-5
                      py-3.5
                      font-semibold
                      text-slate-700
                    ">
                      {room.currentToken ||
                        "—"}
                    </td>

                    {/* TOTAL */}

                    <td className="
                      px-5
                      py-3.5
                      text-slate-600
                    ">
                      {room.totalPatients}
                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-3.5">

                      {room.status ===
                      "RUNNING" ? (

                        <button
                          type="button"
                          disabled={
                            actionLoading
                          }
                          onClick={() =>
                            setConfirming({
                              room,
                              action: "end",
                            })
                          }
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-lg
                            border
                            border-line
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-red-600
                            hover:bg-red-50
                            disabled:opacity-40
                          "
                        >
                          <Square size={12} />
                          End OPD
                        </button>

                      ) : room.status ===
                        "NOT_STARTED" ? (

                        <button
                          type="button"
                          disabled={
                            actionLoading ||
                            !room.opdSessionId
                          }
                          onClick={() =>
                            setConfirming({
                              room,
                              action: "start",
                            })
                          }
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-lg
                            bg-teal-800
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-white
                            hover:bg-teal-900
                            disabled:opacity-40
                          "
                        >
                          <Play size={12} />
                          Start OPD
                        </button>

                      ) : (

                        <span className="
                          text-xs
                          text-slate-400
                        ">
                          No action
                        </span>

                      )}

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </Panel>

      {/* ======================================
          CONFIRM DIALOG
      ====================================== */}

      <ConfirmDialog

        open={!!confirming}

        onClose={() => {
          if (!actionLoading) {
            setConfirming(null);
          }
        }}

        onConfirm={handleConfirm}

        title={
          confirming?.action === "start"
            ? "Start OPD session?"
            : "End OPD session?"
        }

        description={
          confirming?.action === "start"
            ? `Room ${confirming?.room.number} will open for token bookings and consultations.`
            : `Room ${confirming?.room.number} will stop accepting new tokens for today.`
        }

        confirmLabel={
          actionLoading
            ? "Processing..."
            : confirming?.action === "start"
            ? "Start OPD"
            : "End OPD"
        }

        danger={
          confirming?.action === "end"
        }

      />

    </div>
  );
}