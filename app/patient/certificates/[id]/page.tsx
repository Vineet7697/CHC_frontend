"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import medicalCertificateService,{
  MedicalCertificateDetails,
  MedicalCertificateStatus,
} from "@/services/medicalservices";


interface CertificateDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
}

// ======================================================
// STATUS CONFIG
// ======================================================

const statusConfig: Record<
  MedicalCertificateStatus,
  {
    label: string;
    description: string;
    className: string;
    icon: string;
  }
> = {
  PENDING: {
    label: "Pending",
    description: "Your request is waiting for doctor review.",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "⏳",
  },

  IN_REVIEW: {
    label: "Under Review",
    description: "The assigned doctor is reviewing your request.",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "🔍",
  },

  SUBMITTED_FOR_APPROVAL: {
    label: "Approval Pending",
    description:
      "The doctor has completed the assessment and submitted the certificate for Medical Officer approval.",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    icon: "🛡️",
  },

  APPROVED: {
    label: "Approved",
    description:
      "Your medical certificate has been approved and is available for download.",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: "✓",
  },

  RETURNED: {
    label: "Returned",
    description: "The request has been returned for correction.",
    className: "bg-orange-50 text-orange-700 border-orange-200",
    icon: "↩",
  },

  REJECTED: {
    label: "Rejected",
    description: "Your certificate request has been rejected.",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: "✕",
  },
};

// ======================================================
// HELPER COMPONENTS
// ======================================================

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>

      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>

      <p className="mt-1 text-sm font-medium text-slate-700">{value || "-"}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: MedicalCertificateStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.className}`}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}

// ======================================================
// MAIN PAGE
// ======================================================

export default function PatientCertificateDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const certificateId = String(params.id);

  const [certificate, setCertificate] = useState<MedicalCertificateDetails | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  // ====================================================
  // LOAD CERTIFICATE DETAILS
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const loadCertificate = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await medicalCertificateService.getCertificateDetails(certificateId);

        if (!mounted) return;

        if (!response?.success || !response?.data) {
          throw new Error(
            response?.message || "Unable to load certificate details",
          );
        }

        setCertificate(response.data);
      } catch (err: any) {
        console.error("Medical certificate details error:", err);

        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load medical certificate",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (certificateId) {
      loadCertificate();
    }

    return () => {
      mounted = false;
    };
  }, [certificateId]);

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
  // DOWNLOAD PDF
  // ====================================================

  const handleDownload = async () => {
    if (!certificate || certificate.status !== "APPROVED") {
      return;
    }

    try {
      setDownloading(true);

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
      console.error("Medical certificate download error:", error);

      alert(
        error?.response?.data?.message || "Unable to download certificate.",
      );
    } finally {
      setDownloading(false);
    }
  };

  // ====================================================
  // OPEN DOCUMENT
  // ====================================================

  const handleDocumentView = (document: CertificateDocument) => {
    // Document URL can be connected here when the backend
    // returns a secure document URL.
    alert(`Document: ${document.name}`);
  };

  // ====================================================
  // LOADING / ERROR STATES
  // ====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading certificate details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={() => router.push("/patient/certificates")}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            ← Back to My Certificates
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl text-red-600">
              !
            </div>

            <h2 className="mt-4 text-lg font-bold text-red-900">
              Unable to load certificate
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error || "Certificate not found."}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // STATUS TIMELINE
  // ====================================================

  const timeline = [
    {
      title: "Request Submitted",
      date: certificate.requestedAt,
      description: "Medical certificate request submitted by patient.",
      completed: true,
    },

    {
      title: "Doctor Review",
      date:
        certificate.status !== "PENDING"
          ? certificate.examinationDate
          : undefined,
      description:
        certificate.status === "PENDING"
          ? "Waiting for the assigned doctor to review the request."
          : "Request reviewed by the assigned doctor.",
      completed: certificate.status !== "PENDING",
    },

    {
      title: "Medical Officer Review",
      date:
        certificate.status === "SUBMITTED_FOR_APPROVAL" ||
        certificate.status === "APPROVED" ||
        certificate.status === "REJECTED"
          ? certificate.issuedDate
          : undefined,
      description:
        certificate.status === "SUBMITTED_FOR_APPROVAL"
          ? "Waiting for Medical Officer approval."
          : certificate.status === "APPROVED"
            ? "Certificate reviewed and approved by Medical Officer."
            : certificate.status === "REJECTED"
              ? "Certificate request was rejected by Medical Officer."
              : "Certificate will be reviewed by Medical Officer after doctor submission.",
      completed:
        certificate.status === "APPROVED" || certificate.status === "REJECTED",
    },

    {
      title: "Certificate Issued",
      date: certificate.issuedDate,
      description:
        certificate.status === "APPROVED"
          ? "Certificate is approved and available for download."
          : "Certificate will become available after approval.",
      completed: certificate.status === "APPROVED",
    },
  ];

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push("/patient/certificates")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            ← Back to My Certificates
          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800">
                  {certificate.certificateType}
                </h1>

                <StatusBadge status={certificate.status} />
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Request ID:{" "}
                <span className="font-medium text-slate-700">
                  {certificateId}
                </span>
              </p>
            </div>

            {certificate.status === "APPROVED" && (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
              >
                ↓ Download PDF
              </button>
            )}
          </div>
        </div>

        {/* ==================================================
            STATUS BANNER
        ================================================== */}

        <div
          className={`mb-6 rounded-2xl border p-5 ${
            statusConfig[certificate.status].className
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
              {statusConfig[certificate.status].icon}
            </div>

            <div>
              <p className="text-base font-semibold">
                {statusConfig[certificate.status].label}
              </p>

              <p className="mt-1 text-sm leading-6">
                {statusConfig[certificate.status].description}
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            APPROVED CERTIFICATE
        ================================================== */}

        {certificate.status === "APPROVED" && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
            <div className="border-b border-green-100 bg-green-50 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-green-900">
                    Certificate Approved
                  </h2>

                  <p className="mt-1 text-sm text-green-700">
                    Your certificate has been officially approved.
                  </p>
                </div>

                <div className="hidden h-11 w-11 items-center justify-center rounded-full bg-green-600 text-xl text-white sm:flex">
                  ✓
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Certificate Number</p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {certificate.certificateNumber}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Issue Date</p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {formatDate(certificate.issuedDate)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Validity</p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {certificate.doctorAssessment?.certificateValidity || "-"}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      District Hospital
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-slate-800">
                      Medical Certificate
                    </h3>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 text-xs font-bold text-slate-500">
                    QR
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="Patient Name"
                    value={certificate.patient.name}
                  />

                  <InfoItem label="Abha Number" value={certificate.patient.abhaNumber} />

                  <InfoItem
                    label="Certificate Type"
                    value={certificate.certificateType}
                  />

                  <InfoItem label="Purpose" value={certificate.purpose} />

                  <InfoItem label="Doctor" value={certificate.doctorName} />

                  <InfoItem
                    label="Department"
                    value={certificate.departmentName}
                  />
                </div>

                <div className="mt-5 rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Medical Assessment
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {certificate.doctorAssessment?.examinationFindings || "-"}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-200 pt-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <p className="text-xs text-slate-400">Approved by</p>

                    <p className="text-sm font-semibold text-slate-700">
                      {certificate.medicalOfficer?.name}
                    </p>
                  </div>

                  <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <p className="text-xs text-slate-400">Designation</p>

                    <p className="text-sm font-medium text-slate-700">
                      {certificate.medicalOfficer?.designation}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/patient/certificates/${certificate.id}/preview`,
                    )
                  }
                  className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View Full Certificate
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            TIMELINE
        ================================================== */}

        <SectionCard title="Request Timeline">
          <div className="space-y-0">
            {timeline.map((item, index) => (
              <div key={item.title} className="relative flex gap-4">
                {/* LINE */}

                {index !== timeline.length - 1 && (
                  <div
                    className={`absolute left-[15px] top-8 h-[calc(100%-8px)] w-[2px] ${
                      item.completed ? "bg-green-300" : "bg-slate-200"
                    }`}
                  />
                )}

                {/* DOT */}

                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    item.completed
                      ? "bg-green-600 text-white"
                      : "border-2 border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {item.completed ? "✓" : index + 1}
                </div>

                {/* CONTENT */}

                <div className="pb-7">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {item.title}
                    </p>

                    {item.date && (
                      <span className="text-xs text-slate-400">
                        {formatDate(item.date)}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ==================================================
            PATIENT DETAILS
        ================================================== */}

        <div className="mt-6">
          <SectionCard title="Patient Details">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem label="Full Name" value={certificate.patient.name} />

              <InfoItem label="Abha Number" value={certificate.patient.abhaNumber} />

              <InfoItem
                label="Date of Birth"
                value={formatDate(certificate.patient.dob)}
              />

              <InfoItem
                label="Age"
                value={`${certificate.patient.age} years`}
              />

              <InfoItem label="Gender" value={certificate.patient.gender} />

              <InfoItem label="Mobile" value={certificate.patient.mobile} />

              <InfoItem
                label="Blood Group"
                value={certificate.patient.bloodGroup}
              />

              <div className="sm:col-span-2 lg:col-span-2">
                <InfoItem label="Address" value={certificate.patient.address} />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ==================================================
            CERTIFICATE REQUEST
        ================================================== */}

        <div className="mt-6">
          <SectionCard title="Certificate Request">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem
                label="Certificate Type"
                value={certificate.certificateType}
              />

              <InfoItem label="Purpose" value={certificate.purpose} />

              <InfoItem label="Department" value={certificate.departmentName} />

              <InfoItem
                label="Assigned Doctor"
                value={certificate.doctorName}
              />

              <InfoItem
                label="Request Date"
                value={formatDate(certificate.requestedAt)}
              />

              <InfoItem
                label="Examination Date"
                value={formatDate(certificate.examinationDate)}
              />
            </div>
          </SectionCard>
        </div>

        {/* ==================================================
            DOCTOR ASSESSMENT
        ================================================== */}

        {certificate.doctorAssessment && (
          <div className="mt-6">
            <SectionCard title="Doctor Medical Assessment">
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Examination Findings
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {certificate.doctorAssessment.examinationFindings}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Diagnosis
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {certificate.doctorAssessment.diagnosis}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Medical Condition
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {certificate.doctorAssessment.medicalCondition}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">Fitness Status</p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {certificate.doctorAssessment.fitnessStatus === "FIT"
                        ? "Fit"
                        : certificate.doctorAssessment.fitnessStatus === "UNFIT"
                          ? "Unfit"
                          : "Fit with Restrictions"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">Rest Required</p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {certificate.doctorAssessment.restRequired ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                {certificate.doctorAssessment.restRequired && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InfoItem
                      label="Rest From"
                      value={formatDate(certificate.doctorAssessment.restFrom)}
                    />

                    <InfoItem
                      label="Rest To"
                      value={formatDate(certificate.doctorAssessment.restTo)}
                    />
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Medical Advice
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {certificate.doctorAssessment.medicalAdvice}
                  </p>
                </div>

                {certificate.doctorAssessment.doctorRemarks && (
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Doctor Remarks
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {certificate.doctorAssessment.doctorRemarks}
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ==================================================
            DOCUMENTS
        ================================================== */}

        <div className="mt-6">
          <SectionCard title="Submitted Documents">
            <div className="space-y-3">
              {certificate.documents.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-sm font-bold text-red-600">
                      PDF
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-700">
                        {document.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {document.type} • Uploaded{" "}
                        {formatDate(document.uploadedAt)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDocumentView(document)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    View Document
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ==================================================
            MEDICAL OFFICER
        ================================================== */}

        {certificate.medicalOfficer && (
          <div className="mt-6">
            <SectionCard title="Medical Officer Review">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InfoItem
                  label="Officer Name"
                  value={certificate.medicalOfficer.name}
                />

                <InfoItem
                  label="Designation"
                  value={certificate.medicalOfficer.designation}
                />

                <InfoItem
                  label="Reviewed On"
                  value={formatDate(certificate.medicalOfficer.reviewedAt)}
                />
              </div>

              {certificate.medicalOfficer.remarks && (
                <div className="mt-5 rounded-xl border border-green-100 bg-green-50 p-4">
                  <p className="text-xs font-semibold text-green-700">
                    Officer Remarks
                  </p>

                  <p className="mt-1 text-sm leading-6 text-green-700">
                    {certificate.medicalOfficer.remarks}
                  </p>
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {/* ==================================================
            RETURNED
        ================================================== */}

        {certificate.status === "RETURNED" && certificate.correctionReason && (
          <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
                !
              </div>

              <div>
                <h3 className="text-sm font-bold text-orange-900">
                  Correction Required
                </h3>

                <p className="mt-1 text-sm leading-6 text-orange-700">
                  {certificate.correctionReason}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push(`/patient/certificates/${certificate.id}`)
                  }
                  className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                >
                  View Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            REJECTED
        ================================================== */}

        {certificate.status === "REJECTED" && certificate.rejectionReason && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                !
              </div>

              <div>
                <h3 className="text-sm font-bold text-red-900">
                  Certificate Request Rejected
                </h3>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {certificate.rejectionReason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            BOTTOM ACTIONS
        ================================================== */}

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => router.push("/patient/certificates")}
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Back to My Certificates
          </button>

          {certificate.status === "APPROVED" && (
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
            >
              ↓ Download Certificate PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
