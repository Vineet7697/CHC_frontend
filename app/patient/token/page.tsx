"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Home, RefreshCw } from "lucide-react";

import { TokenBoard } from "@/components/token/TokenBoard";
import StatusBadge from "@/components/badges/StatusBadge";
import { EmptyState } from "@/components/common/States";

import { getMyTodayToken } from "@/services/patientservice";

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-line last:border-b-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="font-display font-semibold text-ink text-sm text-right">
        {value}
      </p>
    </div>
  );
}

export default function PatientTokenPage() {
  const [token, setToken] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // LOAD TOKEN
  // ========================================

  useEffect(() => {
    loadToken();
  }, []);

  async function loadToken() {
    try {
      setLoading(true);
      setError("");

      const response = await getMyTodayToken();

      console.log("TODAY TOKEN RESPONSE:", response);

      if (response?.success && response?.data) {
        setToken(response.data);
      } else {
        setToken(null);
      }
    } catch (error: any) {
      console.error(
        "Patient token API error:",
        error?.response?.data || error
      );

      // No token today
      if (error?.response?.status === 404) {
        setToken(null);
        return;
      }

      setError(
        error?.response?.data?.message ||
          "Unable to load token details."
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-slate-500">
          Loading token details...
        </p>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <EmptyState
          title="Unable to load token"
          description={error}
          action={
            <button
              onClick={loadToken}
              className="inline-flex items-center gap-2 bg-teal-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-teal-900"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          }
        />
      </div>
    );
  }

  // ========================================
  // NO TOKEN
  // ========================================

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <EmptyState
          title="No active token"
          description="You haven't booked an OPD token today. Search a disease or specialization to get started."
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
      </div>
    );
  }

  // ========================================
  // TOKEN CODE
  // ========================================

  const tokenCode = `A-${String(
    token.tokenNumber
  ).padStart(3, "0")}`;

  const currentTokenCode =
    token.currentServingToken
      ? `A-${String(
          token.currentServingToken
        ).padStart(3, "0")}`
      : "—";

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="max-w-md mx-auto space-y-5">

      {/* TITLE */}

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          OPD Token
        </p>

        <p className="text-sm text-slate-500 mt-1">
          Your token for today
        </p>
      </div>

      {/* TOKEN BOARD */}

      <TokenBoard
        code={tokenCode}
        size="lg"
      />

      {/* DETAILS */}

      <div className="bg-panel border border-line rounded-2xl px-5">

        <Row
          label="Patient"
          value={token.patientName || "—"}
        />

        <Row
          label="Patient ID"
          value={token.patientId || "—"}
        />

        <Row
          label="Room"
          value={
            token.room
              ? `${token.room.number || "—"}${
                  token.room.name
                    ? ` · ${token.room.name}`
                    : ""
                }`
              : "—"
          }
        />

        <Row
          label="Specialization"
          value={
            token.specialization?.name || "—"
          }
        />

        <Row
          label="Doctor"
          value={
            token.doctor?.name || "—"
          }
        />

        <Row
          label="Status"
          value={
            <StatusBadge
              status={token.status}
            />
          }
        />

        <Row
          label="Current token"
          value={currentTokenCode}
        />

      </div>

      {/* OPD STATUS */}

      <p className="text-xs text-center text-slate-400">
        OPD Status:{" "}
        <span className="font-semibold">
          {token.opdStatus || "—"}
        </span>
      </p>

      {/* ACTIONS */}

      <div className="flex flex-col sm:flex-row gap-2.5">

        <button
          onClick={loadToken}
          className="flex-1 flex items-center justify-center gap-1.5 border border-line text-sm font-semibold rounded-lg px-4 py-3 text-ink hover:bg-teal-50"
        >
          <RefreshCw size={14} />
          Refresh
        </button>

        <Link
          href="/patient/dashboard"
          className="flex-1 flex items-center justify-center gap-1.5 bg-teal-800 text-white text-sm font-semibold rounded-lg px-4 py-3 hover:bg-teal-900"
        >
          <Home size={14} />
          Dashboard
        </Link>

      </div>

    </div>
  );
}