"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import medicalCertificateService from "@/services/medicalservices";

// ======================================================
// TYPES
// ======================================================

type CertificateStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "SUBMITTED"
  | "SUBMITTED_FOR_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "RETURNED";

interface CertificateRequest {
  id: string;

  patientId: string;
  patientName: string;
  age: number;
  gender: string;

  mobile?: string;
  address?: string;
  abhaNumber?: string;

  certificateType: string;

  departmentId: string;
  departmentName: string;

  purpose: string;
  additionalNotes?: string;

  requestedAt: string;

  status: CertificateStatus;
}

// ======================================================
// STATUS BADGE
// ======================================================

const StatusBadge = ({ status }: { status: CertificateStatus }) => {
  const config: Record<
    CertificateStatus,
    {
      label: string;
      className: string;
    }
  > = {
    PENDING: {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },

    IN_REVIEW: {
      label: "In Review",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },

    SUBMITTED: {
      label: "Submitted",
      className: "bg-purple-50 text-purple-700 border-purple-200",
    },

    SUBMITTED_FOR_APPROVAL: {
      label: "Submitted for Approval",
      className: "bg-purple-50 text-purple-700 border-purple-200",
    },

    APPROVED: {
      label: "Approved",
      className: "bg-green-50 text-green-700 border-green-200",
    },

    REJECTED: {
      label: "Rejected",
      className: "bg-red-50 text-red-700 border-red-200",
    },

    RETURNED: {
      label: "Returned",
      className: "bg-orange-50 text-orange-700 border-orange-200",
    },
  };

  const item = config[status] || {
    label: status,
    className: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${item.className}`}
    >
      {item.label}
    </span>
  );
};

// ======================================================
// MAIN PAGE
// ======================================================

export default function DoctorMedicalCertificatesPage() {
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"ALL" | CertificateStatus>(
    "ALL",
  );

  const [certificateRequests, setCertificateRequests] = useState<
    CertificateRequest[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ====================================================
  // LOAD REQUESTS
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const loadCertificates = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await medicalCertificateService.getDoctorCertificates();

        if (!mounted) return;

        const data = response?.data || [];

const mappedData: CertificateRequest[] = data.map((item: any) => ({
  id: String(item.id ?? ""),

  patientId: String(item.patientId ?? ""),

  patientName: item.patientName ?? "-",

  age: Number(item.age ?? 0),

  gender: item.gender ?? "-",

  mobile: item.mobile ?? "",
  address: item.address ?? "",
  abhaNumber: item.abhaNumber ?? "",

  certificateType: item.certificateType ?? "-",

  departmentId: String(item.departmentId ?? ""),

  departmentName: item.departmentName ?? "-",

  purpose: item.purpose ?? "-",

  additionalNotes: item.additionalNotes ?? "",

  requestedAt: item.requestedAt ?? "",

  status: item.status ?? "PENDING",
}));

        setCertificateRequests(mappedData);
      } catch (err: any) {
        console.error("Doctor medical certificates load error:", err);

        if (!mounted) return;

        setCertificateRequests([]);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load medical certificate requests",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCertificates();

    return () => {
      mounted = false;
    };
  }, []);

  // ====================================================
  // FILTER
  // ====================================================

  const filteredRequests = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return certificateRequests.filter((request) => {
      const matchesSearch =
        !searchValue ||
        String(request.patientName).toLowerCase().includes(searchValue) ||
        String(request.patientId).toLowerCase().includes(searchValue) ||
        String(request.certificateType).toLowerCase().includes(searchValue) ||
        String(request.departmentName).toLowerCase().includes(searchValue) ||
        String(request.purpose).toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, certificateRequests]);

  // ====================================================
  // COUNTS
  // ====================================================

  const pendingCount = certificateRequests.filter(
    (item) => item.status === "PENDING",
  ).length;

  const inReviewCount = certificateRequests.filter(
    (item) => item.status === "IN_REVIEW",
  ).length;

  const submittedCount = certificateRequests.filter(
    (item) =>
      item.status === "SUBMITTED" || item.status === "SUBMITTED_FOR_APPROVAL",
  ).length;

  const totalCount = certificateRequests.length;

  // ====================================================
  // DATE FORMAT
  // ====================================================

  const formatDate = (date?: string) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading medical certificate requests...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // MAIN JSX
  // ====================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Medical Certificates
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review patient requests and prepare medical certificates.
            </p>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* TOTAL */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Requests</p>

                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {totalCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                📄
              </div>
            </div>
          </div>

          {/* PENDING */}

          <div className="rounded-xl border border-amber-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending</p>

                <p className="mt-1 text-2xl font-bold text-amber-600">
                  {pendingCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                ⏳
              </div>
            </div>
          </div>

          {/* IN REVIEW */}

          <div className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">In Review</p>

                <p className="mt-1 text-2xl font-bold text-blue-600">
                  {inReviewCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                🔍
              </div>
            </div>
          </div>

          {/* SUBMITTED */}

          <div className="rounded-xl border border-purple-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Submitted for Approval</p>

                <p className="mt-1 text-2xl font-bold text-purple-600">
                  {submittedCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                ✓
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            FILTER
        ================================================== */}

        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            {/* SEARCH */}

            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient, UHID, certificate or department..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "ALL" | CertificateStatus)
              }
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Status</option>

              <option value="PENDING">Pending</option>

              <option value="IN_REVIEW">In Review</option>

              <option value="SUBMITTED_FOR_APPROVAL">
                Submitted for Approval
              </option>

              <option value="APPROVED">Approved</option>

              <option value="RETURNED">Returned</option>

              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* ==================================================
            REQUESTS
        ================================================== */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* DESKTOP */}

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Patient
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Certificate
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Department
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Purpose
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                  >
                    {/* PATIENT */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                          {request.patientName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {request.patientName}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {request.patientId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CERTIFICATE */}

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {request.certificateType}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {request.age} yrs • {request.gender}
                      </p>
                    </td>

                    {/* DEPARTMENT */}

                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-700">
                        {request.departmentName}
                      </p>
                    </td>

                    {/* PURPOSE */}

                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-600">
                        {request.purpose}
                      </p>
                    </td>

                    {/* DATE */}

                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-600">
                        {formatDate(request.requestedAt)}
                      </p>
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <StatusBadge status={request.status} />
                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/doctor/medicalcertificates/${request.id}`}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}

          <div className="divide-y divide-slate-100 lg:hidden">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                      {request.patientName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {request.patientName}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {request.patientId}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={request.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Certificate</p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {request.certificateType}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Department</p>

                    <p className="mt-1 text-sm text-slate-700">
                      {request.departmentName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Purpose</p>

                    <p className="mt-1 text-sm text-slate-700">
                      {request.purpose}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Requested</p>

                    <p className="mt-1 text-sm text-slate-700">
                      {formatDate(request.requestedAt)}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/doctor/medicalcertificates/${request.id}`}
                  className="mt-4 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Review Request →
                </Link>
              </div>
            ))}
          </div>

          {/* EMPTY */}

          {filteredRequests.length === 0 && !error && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                📄
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-800">
                No certificate requests found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or status filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
