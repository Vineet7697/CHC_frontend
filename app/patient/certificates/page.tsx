"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import medicalCertificateService, {
  MedicalCertificateListItem,
  MedicalCertificateStatus,
} from "@/services/medicalservices";

// ======================================================
// STATUS CONFIG
// ======================================================

const statusConfig: Record<
  MedicalCertificateStatus,
  {
    label: string;
    className: string;
    dotClass: string;
  }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dotClass: "bg-amber-500",
  },

  IN_REVIEW: {
    label: "Under Review",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dotClass: "bg-blue-500",
  },

  SUBMITTED_FOR_APPROVAL: {
    label: "Approval Pending",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    dotClass: "bg-purple-500",
  },

  APPROVED: {
    label: "Approved",
    className: "bg-green-50 text-green-700 border-green-200",
    dotClass: "bg-green-500",
  },

  RETURNED: {
    label: "Returned",
    className: "bg-orange-50 text-orange-700 border-orange-200",
    dotClass: "bg-orange-500",
  },

  REJECTED: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
    dotClass: "bg-red-500",
  },
};

// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({ status }: { status: MedicalCertificateStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.className}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />

      {config.label}
    </span>
  );
}

// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  title,
  value,
  description,
  icon,
  iconClass,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>

          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ======================================================
// MAIN PAGE
// ======================================================

export default function PatientMedicalCertificatesPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | MedicalCertificateStatus
  >("ALL");

  const [certificateRequests, setCertificateRequests] = useState<
    MedicalCertificateListItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ====================================================
  // LOAD CERTIFICATES
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const loadCertificates = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await medicalCertificateService.getMyCertificates();

        if (!mounted) return;

        if (!response?.success) {
          throw new Error(
            response?.message || "Unable to load medical certificates",
          );
        }

        setCertificateRequests(response.data || []);
      } catch (err: any) {
        console.error("Medical certificates load error:", err);

        if (mounted) {
          setCertificateRequests([]);
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load medical certificates",
          );
        }
      } finally {
        if (mounted) setLoading(false);
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

  const filteredCertificates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return certificateRequests.filter((certificate) => {
      const matchesSearch =
        !query ||
        String(certificate.id).toLowerCase().includes(query) ||
        certificate.certificateType.toLowerCase().includes(query) ||
        certificate.departmentName.toLowerCase().includes(query) ||
        certificate.doctorName.toLowerCase().includes(query) ||
        certificate.purpose.toLowerCase().includes(query) ||
        certificate.certificateNumber?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || certificate.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [certificateRequests, search, statusFilter]);

  // ====================================================
  // STATS
  // ====================================================

  const total = certificateRequests.length;

  const pending = certificateRequests.filter(
    (item) => item.status === "PENDING",
  ).length;

  const underReview = certificateRequests.filter(
    (item) => item.status === "IN_REVIEW",
  ).length;

  const approvalPending = certificateRequests.filter(
    (item) => item.status === "SUBMITTED_FOR_APPROVAL",
  ).length;

  const approved = certificateRequests.filter(
    (item) => item.status === "APPROVED",
  ).length;

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
  // DOWNLOAD
  // ====================================================

  const handleDownload = async (certificate: MedicalCertificateListItem) => {
    if (certificate.status !== "APPROVED") return;

    try {
      const blob = await medicalCertificateService.downloadCertificate(
        certificate.id,
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${certificate.certificateNumber || certificate.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Certificate download error:", error);
      alert(
        error?.response?.data?.message || "Unable to download certificate.",
      );
    }
  };

  // ====================================================
  // VIEW
  // ====================================================

  const handleView = (id: string | number) => {
    router.push(`/patient/certificates/${id}`);
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                My Medical Certificates
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Track your certificate requests and download approved
                certificates.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/patient/certificates/apply")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <span className="text-lg">+</span>
              Apply for Certificate
            </button>
          </div>
        </div>

        {/* ==================================================
            INFO
        ================================================== */}

        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              i
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-900">
                Certificate Status
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-700">
                Your request is first reviewed by the assigned doctor. After the
                doctor submits it, the authorized Medical Officer reviews and
                approves the certificate. Only approved certificates are
                available for download.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              Unable to load medical certificates
            </p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
            <p className="mt-3 text-sm text-slate-500">
              Loading your medical certificates...
            </p>
          </div>
        )}

        {/* ==================================================
            STAT CARDS
        ================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total"
            value={total}
            description="All requests"
            icon={<span className="text-xl">📄</span>}
            iconClass="bg-slate-100"
          />

          <StatCard
            title="Pending"
            value={pending}
            description="Doctor review"
            icon={<span className="text-xl">⏳</span>}
            iconClass="bg-amber-100"
          />

          <StatCard
            title="Under Review"
            value={underReview}
            description="Doctor reviewing"
            icon={<span className="text-xl">🔍</span>}
            iconClass="bg-blue-100"
          />

          <StatCard
            title="Approval"
            value={approvalPending}
            description="Officer review"
            icon={<span className="text-xl">🛡️</span>}
            iconClass="bg-purple-100"
          />

          <StatCard
            title="Approved"
            value={approved}
            description="Ready to download"
            icon={<span className="text-xl">✓</span>}
            iconClass="bg-green-100"
          />
        </div>

        {/* ==================================================
            FILTER CARD
        ================================================== */}

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* SEARCH */}

            <div className="relative w-full lg:max-w-md">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search certificate, doctor, department..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* FILTER */}

            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-medium text-slate-500 sm:block">
                Status
              </span>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "ALL" | MedicalCertificateStatus,
                  )
                }
                className="h-11 min-w-[190px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_REVIEW">Under Review</option>
                <option value="SUBMITTED_FOR_APPROVAL">Approval Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="RETURNED">Returned</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* ==================================================
            DESKTOP TABLE
        ================================================== */}

        <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
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
                    Requested
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
                {filteredCertificates.map((certificate) => (
                  <tr
                    key={certificate.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    {/* CERTIFICATE */}

                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {certificate.certificateType}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {certificate.id}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {certificate.purpose}
                        </p>
                      </div>
                    </td>

                    {/* DOCTOR */}

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {certificate.doctorName}
                      </p>
                    </td>

                    {/* DEPARTMENT */}

                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-600">
                        {certificate.departmentName}
                      </p>
                    </td>

                    {/* DATE */}

                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-600">
                        {formatDate(certificate.requestedAt)}
                      </p>

                      {certificate.issuedDate && (
                        <p className="mt-1 text-xs text-green-600">
                          Issued: {formatDate(certificate.issuedDate)}
                        </p>
                      )}
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <StatusBadge status={certificate.status} />
                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleView(certificate.id)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          View
                        </button>

                        {certificate.status === "APPROVED" && (
                          <button
                            type="button"
                            onClick={() => handleDownload(certificate)}
                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                          >
                            Download PDF
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ==================================================
            MOBILE / TABLET CARDS
        ================================================== */}

        <div className="space-y-4 lg:hidden">
          {filteredCertificates.map((certificate) => (
            <div
              key={certificate.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              {/* TOP */}

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-slate-800">
                    {certificate.certificateType}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {certificate.id}
                  </p>
                </div>

                <StatusBadge status={certificate.status} />
              </div>

              {/* DETAILS */}

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-400">Doctor</p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {certificate.doctorName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Department</p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {certificate.departmentName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Purpose</p>

                  <p className="mt-1 text-sm text-slate-700">
                    {certificate.purpose}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Requested</p>

                  <p className="mt-1 text-sm text-slate-700">
                    {formatDate(certificate.requestedAt)}
                  </p>
                </div>
              </div>

              {/* APPROVED INFO */}

              {certificate.status === "APPROVED" && (
                <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">
                  <p className="text-xs font-medium text-green-600">
                    Certificate Number
                  </p>

                  <p className="mt-1 text-sm font-bold text-green-800">
                    {certificate.certificateNumber}
                  </p>

                  <p className="mt-2 text-xs text-green-600">
                    Issued on {formatDate(certificate.issuedDate)}
                  </p>
                </div>
              )}

              {/* RETURNED REASON */}

              {certificate.status === "RETURNED" &&
                certificate.correctionReason && (
                  <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50 p-4">
                    <p className="text-xs font-semibold text-orange-700">
                      Correction Required
                    </p>

                    <p className="mt-1 text-sm leading-6 text-orange-700">
                      {certificate.correctionReason}
                    </p>
                  </div>
                )}

              {/* REJECTED REASON */}

              {certificate.status === "REJECTED" &&
                certificate.rejectionReason && (
                  <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                    <p className="text-xs font-semibold text-red-700">
                      Rejection Reason
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-700">
                      {certificate.rejectionReason}
                    </p>
                  </div>
                )}

              {/* ACTIONS */}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => handleView(certificate.id)}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  View Details
                </button>

                {certificate.status === "APPROVED" && (
                  <button
                    type="button"
                    onClick={() => handleDownload(certificate)}
                    className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    Download PDF
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {filteredCertificates.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
              📄
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              No certificates found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              No medical certificate request matches your current search or
              status filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
              className="mt-5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
