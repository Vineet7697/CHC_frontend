"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import medicalCertificateService, {
  AdminMedicalCertificateListItem,
} from "@/services/medicalservices";

// ======================================================
// TYPES
// ======================================================

type CertificateStatus =
  | "PENDING_REVIEW"
  | "RETURNED"
  | "APPROVED"
  | "REJECTED";

interface MedicalCertificateRequest {
  id: string;
  patientId: string;
  patientName: string;
  age: number | null;
  gender: string;
  certificateType: string;
  departmentName: string;
  doctorName: string;
  purpose: string;
  submittedAt: string;
  status: CertificateStatus;
}

// ======================================================
// API MAPPING
// ======================================================

const mapApiCertificate = (
  item: AdminMedicalCertificateListItem,
): MedicalCertificateRequest => ({
  id: String(item.id),
  patientId: String(item.patientHospitalId || item.patientId),
  patientName: item.patientName || "-",
  age: item.age ?? null,
  gender: item.gender || "-",
  certificateType: item.certificateType || "-",
  departmentName: item.departmentName || "-",
  doctorName: item.doctorName || "-",
  purpose: item.purpose || "-",
  submittedAt: item.submittedAt
    ? new Date(item.submittedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-",
  status:
    item.status === "SUBMITTED_FOR_APPROVAL"
      ? "PENDING_REVIEW"
      : item.status,
});

// ======================================================
// STATUS BADGE
// ======================================================

const StatusBadge = ({
  status,
}: {
  status: CertificateStatus;
}) => {
  const config: Record<
    CertificateStatus,
    {
      label: string;
      className: string;
    }
  > = {
    PENDING_REVIEW: {
      label: "Pending Review",
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },

    RETURNED: {
      label: "Returned",
      className:
        "border-orange-200 bg-orange-50 text-orange-700",
    },

    APPROVED: {
      label: "Approved",
      className:
        "border-green-200 bg-green-50 text-green-700",
    },

    REJECTED: {
      label: "Rejected",
      className:
        "border-red-200 bg-red-50 text-red-700",
    },
  };

  const item = config[status];

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

export default function AdminMedicalCertificatesPage() {
  const [search, setSearch] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<"ALL" | CertificateStatus>("ALL");

  const [certificates, setCertificates] = useState<MedicalCertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ====================================================
  // LOAD MEDICAL OFFICER CERTIFICATES
  // ====================================================

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await medicalCertificateService.getMedicalOfficerCertificates();

      if (!response.success) {
        throw new Error(
          response.message || "Unable to load medical certificates",
        );
      }

      setCertificates(
        (response.data || []).map(mapApiCertificate),
      );
    } catch (error: any) {
      console.error("Medical certificate list error:", error);
      setError(
        error?.message || "Unable to load medical certificates.",
      );
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  // ====================================================
  // FILTER
  // ====================================================

  const filteredRequests = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    return certificates.filter(
      (request) => {
        const matchesSearch =
          !value ||
          request.patientName
            .toLowerCase()
            .includes(value) ||
          request.patientId
            .toLowerCase()
            .includes(value) ||
          request.doctorName
            .toLowerCase()
            .includes(value) ||
          request.certificateType
            .toLowerCase()
            .includes(value) ||
          request.departmentName
            .toLowerCase()
            .includes(value);

        const matchesStatus =
          statusFilter === "ALL" ||
          request.status === statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      },
    );
  }, [search, statusFilter,certificates]);

  // ====================================================
  // COUNTS
  // ====================================================

  const pendingCount =
    certificates.filter(
      (item) =>
        item.status ===
        "PENDING_REVIEW",
    ).length;

  const returnedCount =
    certificates.filter(
      (item) =>
        item.status === "RETURNED",
    ).length;

  const approvedCount =
    certificates.filter(
      (item) =>
        item.status === "APPROVED",
    ).length;

  const rejectedCount =
    certificates.filter(
      (item) =>
        item.status === "REJECTED",
    ).length;

  // ====================================================
  // JSX
  // ====================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6">

          <h1 className="text-2xl font-bold text-slate-800">
            Medical Certificate Verification
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review certificates submitted by doctors
            before final approval.
          </p>

        </div>

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* PENDING */}

          <div className="rounded-xl border border-amber-100 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Pending Review
                </p>

                <p className="mt-1 text-2xl font-bold text-amber-600">
                  {pendingCount}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl">
                ⏳
              </div>

            </div>

          </div>

          {/* RETURNED */}

          <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Returned
                </p>

                <p className="mt-1 text-2xl font-bold text-orange-600">
                  {returnedCount}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl">
                ↩
              </div>

            </div>

          </div>

          {/* APPROVED */}

          <div className="rounded-xl border border-green-100 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Approved
                </p>

                <p className="mt-1 text-2xl font-bold text-green-600">
                  {approvedCount}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
                ✓
              </div>

            </div>

          </div>

          {/* REJECTED */}

          <div className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Rejected
                </p>

                <p className="mt-1 text-2xl font-bold text-red-600">
                  {rejectedCount}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl">
                ✕
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
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search patient, UHID, doctor or certificate..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "ALL"
                    | CertificateStatus,
                )
              }
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">
                All Status
              </option>

              <option value="PENDING_REVIEW">
                Pending Review
              </option>

              <option value="RETURNED">
                Returned
              </option>

              <option value="APPROVED">
                Approved
              </option>

              <option value="REJECTED">
                Rejected
              </option>
            </select>

          </div>

        </div>

        {/* ==================================================
            LOADING / ERROR
        ================================================== */}

        {loading && (
          <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Loading medical certificates...
          </div>
        )}

        {!loading && error && (
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={loadCertificates}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* ==================================================
            TABLE
        ================================================== */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {!loading && (

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
                    Doctor
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Department
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Submitted
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

                {filteredRequests.map(
                  (request) => (
                    <tr
                      key={request.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                    >

                      {/* PATIENT */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                            {request.patientName
                              .charAt(0)
                              .toUpperCase()}
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
                          {request.purpose}
                        </p>

                      </td>

                      {/* DOCTOR */}

                      <td className="px-5 py-4">

                        <p className="text-sm text-slate-700">
                          {request.doctorName}
                        </p>

                      </td>

                      {/* DEPARTMENT */}

                      <td className="px-5 py-4">

                        <p className="text-sm text-slate-600">
                          {request.departmentName}
                        </p>

                      </td>

                      {/* DATE */}

                      <td className="px-5 py-4">

                        <p className="text-sm text-slate-600">
                          {request.submittedAt}
                        </p>

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <StatusBadge
                          status={
                            request.status
                          }
                        />

                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4 text-right">

                        <Link
                          href={`/admin/medical-certificates/${request.id}`}
                          className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Review
                        </Link>

                      </td>

                    </tr>
                  ),
                )}

              </tbody>

            </table>

          </div>
          )}

           {/* ==================================================
              MOBILE
          ================================================== */}

          <div className="divide-y divide-slate-100 lg:hidden">

            {filteredRequests.map(
              (request) => (
                <div
                  key={request.id}
                  className="p-4"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                        {request.patientName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <p className="text-sm font-semibold text-slate-800">
                          {request.patientName}
                        </p>

                        <p className="text-xs text-slate-400">
                          {request.patientId}
                        </p>

                      </div>

                    </div>

                    <StatusBadge
                      status={
                        request.status
                      }
                    />

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <div>
                      <p className="text-xs text-slate-400">
                        Certificate
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {request.certificateType}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Doctor
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {request.doctorName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Department
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {request.departmentName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Submitted
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {request.submittedAt}
                      </p>
                    </div>

                  </div>

                  <Link
                    href={`/admin/medical-certificates/${request.id}`}
                    className="mt-4 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Review Certificate →
                  </Link>

                </div>
              ),
            )}

          </div>

          {/* EMPTY */}

          {!loading && filteredRequests.length === 0 && (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                📄
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-800">
                No certificates found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                No certificate matches the selected
                filters.
              </p>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}