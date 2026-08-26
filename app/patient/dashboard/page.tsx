"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  Ticket,
  Bell,
  ArrowRight,
  MapPin,
  Clock,
} from "lucide-react";

import { Panel } from "@/components/cards/Card";
import { TokenBoard } from "@/components/token/TokenBoard";
import StatusBadge from "@/components/badges/StatusBadge";
import { EmptyState } from "@/components/common/States";

import {
  getPatientDashboard,
  getMyTodayToken,
  getPatientNotifications,
} from "@/services/patientservice";

export default function PatientDashboard() {
  const [patient, setPatient] = useState<any>(null);
  const [myToken, setMyToken] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      // Dashboard + Token + Notifications
      const [
        dashboardResponse,
        tokenResponse,
        notificationResponse,
      ] = await Promise.all([
        getPatientDashboard(),

        getMyTodayToken().catch((error) => {
          // 404 means today's token nahi hai
          if (error?.response?.status === 404) {
            return {
              success: false,
              data: null,
            };
          }

          throw error;
        }),

        getPatientNotifications(),
      ]);

      // =========================
      // PATIENT
      // =========================

      if (dashboardResponse.success) {
        setPatient(dashboardResponse.data.patient);
      }

      // =========================
      // TODAY TOKEN
      // =========================

      if (tokenResponse.success) {
        setMyToken(tokenResponse.data);
      } else {
        setMyToken(null);
      }

      // =========================
      // NOTIFICATIONS
      // =========================

      if (notificationResponse.success) {
        setNotifications(notificationResponse.data || []);
      }
    } catch (error) {
      console.error(
        "Patient dashboard API error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-slate-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  // =========================
  // UNREAD NOTIFICATIONS
  // =========================

  const unread = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================= */}

      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Hello,{" "}
          {patient?.name?.split(" ")[0] ?? "there"} 👋
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Patient ID {patient?.patient_id ?? "—"} · Here's where things
          stand today.
        </p>
      </div>

      {/* =========================
          TOKEN SECTION
      ========================= */}

      {myToken ? (
        <div className="grid lg:grid-cols-[1fr,1.2fr] gap-5">

          {/* TOKEN BOARD */}

          <TokenBoard
            code={`A-${String(myToken.tokenNumber).padStart(3, "0")}`}
            size="md"
          />

          {/* TOKEN DETAILS */}

          <Panel className="flex flex-col justify-center gap-3.5">

            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">
                Your visit today
              </p>

              <StatusBadge status={myToken.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">

              {/* ROOM */}

              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin size={12} />
                  Room
                </p>

                <p className="font-display font-bold text-ink mt-0.5">
                  {myToken.room?.number ?? "—"}
                  {myToken.room?.name
                    ? ` · ${myToken.room.name}`
                    : ""}
                </p>
              </div>

              {/* DOCTOR */}

              <div>
                <p className="text-xs text-slate-400">
                  Doctor
                </p>

                <p className="font-display font-bold text-ink mt-0.5">
                  {myToken.doctor?.name ?? "—"}
                </p>
              </div>

              {/* CURRENTLY SERVING */}

              <div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock size={12} />
                  Currently serving
                </p>

                <p className="font-display font-bold text-ink mt-0.5">
                  {myToken.currentServingToken
                    ? `A-${String(
                        myToken.currentServingToken
                      ).padStart(3, "0")}`
                    : "—"}
                </p>
              </div>

              {/* PATIENTS AHEAD */}

              <div>
                <p className="text-xs text-slate-400">
                  Patients ahead of you
                </p>

                <p className="font-display font-bold text-ink mt-0.5">
                  {myToken.status === "WAITING"
                    ? Math.max(
                        (myToken.tokenNumber || 0) -
                          (myToken.currentServingToken || 0),
                        0
                      )
                    : "—"}
                </p>
              </div>

            </div>

            <Link
              href="/patient/token"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 hover:underline mt-1"
            >
              View full token details
              <ArrowRight size={14} />
            </Link>

          </Panel>
        </div>
      ) : (
        /* NO TOKEN */

        <Panel>
          <EmptyState
            title="No token booked today"
            description="Search a disease or specialization to see available doctors and book your OPD token."
            action={
              <Link
                href="/patient/search"
                className="inline-flex items-center gap-2 bg-teal-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-teal-900"
              >
                <Search size={15} />
                Search disease
              </Link>
            }
          />
        </Panel>
      )}

      {/* =========================
          QUICK ACTIONS
      ========================= */}

      <div className="grid sm:grid-cols-3 gap-4">

        {/* SEARCH */}

        <Link
          href="/patient/search"
          className="bg-panel border border-line rounded-2xl p-5 hover:border-teal-700 transition-colors group"
        >
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-teal-100 text-teal-700 mb-3 group-hover:bg-teal-800 group-hover:text-white transition-colors">
            <Search size={18} />
          </span>

          <p className="font-display font-semibold text-ink">
            Search Disease
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Find the right specialization and doctor
          </p>
        </Link>

        {/* BOOK OPD */}

        <Link
          href="/patient/search"
          className="bg-panel border border-line rounded-2xl p-5 hover:border-teal-700 transition-colors group"
        >
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-teal-100 text-teal-700 mb-3 group-hover:bg-teal-800 group-hover:text-white transition-colors">
            <Ticket size={18} />
          </span>

          <p className="font-display font-semibold text-ink">
            Book OPD
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Choose a room and get your token
          </p>
        </Link>

        {/* NOTIFICATIONS */}

        <Link
          href="/patient/notifications"
          className="bg-panel border border-line rounded-2xl p-5 hover:border-teal-700 transition-colors group relative"
        >
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-teal-100 text-teal-700 mb-3 group-hover:bg-teal-800 group-hover:text-white transition-colors">
            <Bell size={18} />
          </span>

          <p className="font-display font-semibold text-ink">
            Notifications
          </p>

          <p className="text-xs text-slate-500 mt-1">
            {unread > 0
              ? `${unread} unread update${
                  unread > 1 ? "s" : ""
                }`
              : "You're all caught up"}
          </p>
        </Link>

      </div>
    </div>
  );
}