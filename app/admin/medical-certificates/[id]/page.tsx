"use client";

import React, { useEffect, useState } from "react";

import Link from "next/link";

import { useParams, useRouter } from "next/navigation";
import medicalCertificateService, {
  AdminMedicalCertificateDetail,
} from "@/services/medicalservices";
// ======================================================
// TYPES
// ======================================================

type CertificateStatus =
  | "PENDING_REVIEW"
  | "RETURNED"
  | "APPROVED"
  | "REJECTED";

interface Patient {
  patientId: string;
  name: string;
  age: number;
  gender: string;
  dob: string;
  mobile: string;
  address: string;
  bloodGroup: string;
}

interface DoctorCertificateData {
  id: string;

  certificateType: string;

  purpose: string;

  departmentName: string;

  doctorName: string;

  requestedAt: string;

  submittedAt: string;

  status: CertificateStatus;

  additionalNotes: string;

  patient: Patient;

  examinationDate: string;

  examinationFindings: string;

  diagnosis: string;

  medicalCondition: string;

  fitnessStatus: "FIT" | "UNFIT" | "FIT_WITH_RESTRICTIONS";

  restRequired: boolean;

  restFrom: string | null;

  restTo: string | null;

  medicalAdvice: string;

  doctorRemarks: string;

  certificateValidity: string;

  medicalReport: string | null;

  prescription: string | null;

  idProof: string | null;
}

// ======================================================
// INPUT LABEL
// ======================================================

const InputLabel = ({ children }: { children: React.ReactNode }) => {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-600">
      {children}
    </label>
  );
};

// ======================================================
// INFO ITEM
// ======================================================

const InfoItem = ({ label, value }: { label: string; value: string }) => {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>

      <p className="mt-1 text-sm font-medium text-slate-700">{value || "-"}</p>
    </div>
  );
};

// ======================================================
// SECTION
// ======================================================

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>

        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>

      <div className="p-5">{children}</div>
    </div>
  );
};

// ======================================================
// DOCUMENT
// ======================================================

const DocumentCard = ({
  label,
  file,
}: {
  label: string;
  file: string | null;
}) => {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
          📄
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-700">{label}</p>

          <p className="mt-0.5 truncate text-xs text-slate-400">
            {file || "Not uploaded"}
          </p>
        </div>
      </div>

      {file && (
        <button
          type="button"
          onClick={() => alert(`Open document: ${file}`)}
          className="ml-3 shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          View
        </button>
      )}
    </div>
  );
};

// ======================================================
// MAIN PAGE
// ======================================================

export default function AdminMedicalCertificateReviewPage() {
  const params = useParams();

  const router = useRouter();

  const certificateId = String(params?.id ?? "");

  const [certificate, setCertificate] = useState<DoctorCertificateData | null>(
    null,
  );

  // ====================================================
  // STATE
  // ====================================================

  const [officerRemarks, setOfficerRemarks] = useState<string>("");

  const [correctionReason, setCorrectionReason] = useState<string>("");

  const [rejectReason, setRejectReason] = useState<string>("");

  const [showPreview, setShowPreview] = useState<boolean>(true);

  const [showReturnModal, setShowReturnModal] = useState<boolean>(false);

  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);

  const [processing, setProcessing] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string>("");

  // ====================================================
  // API DATA MAPPER
  // ====================================================

  const mapApiCertificate = (
    data: AdminMedicalCertificateDetail,
  ): DoctorCertificateData => ({
    id: String(data.id),
    certificateType: data.certificateType || "-",
    purpose: data.purpose || "-",
    departmentName: data.departmentName || "-",
    doctorName: data.doctorName || "-",
    requestedAt: data.requestedAt
      ? new Date(data.requestedAt).toLocaleString("en-IN")
      : "-",
    submittedAt: data.submittedAt
      ? new Date(data.submittedAt).toLocaleString("en-IN")
      : "-",
    status:
      data.status === "SUBMITTED_FOR_APPROVAL" ? "PENDING_REVIEW" : data.status,
    additionalNotes: data.additionalNotes || "-",
    patient: {
      patientId: String(
        data.patient?.hospitalPatientId || data.patient?.patientId || "-",
      ),
      name: data.patient?.name || "-",
      age: data.patient?.age ?? 0,
      gender: data.patient?.gender || "-",
      dob: data.patient?.dob || "-",
      mobile: data.patient?.mobile || "-",
      address: data.patient?.address || "-",
      bloodGroup: data.patient?.bloodGroup || "-",
    },
    examinationDate: data.doctorAssessment?.examinationDate || "-",
    examinationFindings: data.doctorAssessment?.examinationFindings || "-",
    diagnosis: data.doctorAssessment?.diagnosis || "-",
    medicalCondition: data.doctorAssessment?.medicalCondition || "-",
    fitnessStatus: data.doctorAssessment?.fitnessStatus || "FIT",
    restRequired: Boolean(data.doctorAssessment?.restRequired),
    restFrom: data.doctorAssessment?.restFrom || null,
    restTo: data.doctorAssessment?.restTo || null,
    medicalAdvice: data.doctorAssessment?.medicalAdvice || "-",
    doctorRemarks: data.doctorAssessment?.doctorRemarks || "-",
    certificateValidity: data.doctorAssessment?.certificateValidity || "-",
    medicalReport: data.medicalReport || null,
    prescription: data.prescription || null,
    idProof: data.idProof || null,
  });

  // ====================================================
  // LOAD CERTIFICATE
  // ====================================================

  const loadCertificate = async () => {
    if (!certificateId) {
      setError("Certificate ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await medicalCertificateService.getMedicalOfficerCertificateDetails(
          certificateId,
        );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Unable to load certificate details.",
        );
      }

      const mapped = mapApiCertificate(response.data);

      setCertificate(mapped);

      // Existing server remarks/reasons can be displayed in the review fields.
      setOfficerRemarks(response.data.medicalOfficer?.remarks || "");
      setCorrectionReason(response.data.correctionReason || "");
      setRejectReason(response.data.rejectionReason || "");
    } catch (err: any) {
      console.error("Medical certificate detail error:", err);

      setError(err?.message || "Unable to load medical certificate details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificate();
  }, [certificateId]);

  // ====================================================
  // APPROVE
  // ====================================================

  const handleApprove = async () => {
    if (!certificate) return;

    if (
      !window.confirm(
        "Are you sure you want to approve this medical certificate?",
      )
    ) {
      return;
    }

    try {
      setProcessing(true);

      const response =
        await medicalCertificateService.approveMedicalCertificate(
          certificateId,
          officerRemarks,
        );

      if (!response.success) {
        throw new Error(response.message || "Unable to approve certificate.");
      }

      alert(response.message || "Medical certificate approved successfully.");

      router.push("/admin/medical-certificates");
      router.refresh();
    } catch (error: any) {
      console.error("Approval error:", error);

      alert(error?.message || "Unable to approve certificate.");
    } finally {
      setProcessing(false);
    }
  };

  // ====================================================
  // RETURN
  // ====================================================

  const handleReturn = async () => {
    if (!certificate) return;

    if (!correctionReason.trim()) {
      alert("Please enter the reason for returning the certificate.");
      return;
    }

    try {
      setProcessing(true);

      const response = await medicalCertificateService.returnMedicalCertificate(
        certificateId,
        correctionReason.trim(),
        officerRemarks,
      );

      if (!response.success) {
        throw new Error(response.message || "Unable to return certificate.");
      }

      alert(
        response.message || "Certificate returned to doctor for correction.",
      );

      router.push("/admin/medical-certificates");
      router.refresh();
    } catch (error: any) {
      console.error("Return certificate error:", error);

      alert(error?.message || "Unable to return certificate.");
    } finally {
      setProcessing(false);
      setShowReturnModal(false);
    }
  };

  // ====================================================
  // REJECT
  // ====================================================

  const handleReject = async () => {
    if (!certificate) return;

    if (!rejectReason.trim()) {
      alert("Please enter the reason for rejection.");
      return;
    }

    try {
      setProcessing(true);

      const response = await medicalCertificateService.rejectMedicalCertificate(
        certificateId,
        rejectReason.trim(),
        officerRemarks,
      );

      if (!response.success) {
        throw new Error(response.message || "Unable to reject certificate.");
      }

      alert(response.message || "Medical certificate rejected.");

      router.push("/admin/medical-certificates");
      router.refresh();
    } catch (error: any) {
      console.error("Reject certificate error:", error);

      alert(error?.message || "Unable to reject certificate.");
    } finally {
      setProcessing(false);
      setShowRejectModal(false);
    }
  };

  // ====================================================
  // FITNESS LABEL
  // ====================================================

  const getFitnessLabel = () => {
    if (!certificate) return "-";
    switch (certificate.fitnessStatus) {
      case "FIT":
        return "Fit";

      case "UNFIT":
        return "Unfit";

      case "FIT_WITH_RESTRICTIONS":
        return "Fit with Restrictions";

      default:
        return "-";
    }
  };

  // ====================================================
  // JSX
  // ====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Loading medical certificate...
          </p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            Unable to load certificate
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error || "Certificate not found."}
          </p>

          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={loadCertificate}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Retry
            </button>

            <Link
              href="/admin/medical-certificates"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6">
          <Link
            href="/admin/medical-certificates"
            className="mb-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Medical Certificates
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Medical Certificate Verification
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Certificate ID:{" "}
                <span className="font-semibold text-slate-700">
                  {certificate.id}
                </span>
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs text-amber-600">Current Status</p>

              <p className="mt-0.5 text-sm font-semibold text-amber-800">
                {certificate.status === "PENDING_REVIEW"
                  ? "Pending Medical Officer Review"
                  : certificate.status === "RETURNED"
                    ? "Returned for Correction"
                    : certificate.status === "APPROVED"
                      ? "Approved"
                      : "Rejected"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* ==================================================
              PATIENT
          ================================================== */}

          <Section
            title="Patient Information"
            description="Verify patient information against hospital records."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem label="Patient Name" value={certificate.patient.name} />

              <InfoItem
                label="UHID / Patient ID"
                value={certificate.patient.patientId}
              />

              <InfoItem
                label="Age"
                value={`${certificate.patient.age} years`}
              />

              <InfoItem label="Gender" value={certificate.patient.gender} />

              {/* <InfoItem
                label="Date of Birth"
                value={
                  certificate.patient.dob
                }
              /> */}

              <InfoItem label="Mobile" value={certificate.patient.mobile} />

              <InfoItem label="Department" value={certificate.departmentName} />

              <InfoItem label="Address" value={certificate.patient.address} />
            </div>
          </Section>

          {/* ==================================================
              REQUEST
          ================================================== */}

          <Section
            title="Certificate Request"
            description="Details originally submitted by the patient."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                label="Certificate Type"
                value={certificate.certificateType}
              />

              <InfoItem label="Purpose" value={certificate.purpose} />

              <InfoItem label="Department" value={certificate.departmentName} />

              <InfoItem label="Doctor" value={certificate.doctorName} />

              <InfoItem label="Requested At" value={certificate.requestedAt} />

              <InfoItem
                label="Doctor Submitted At"
                value={certificate.submittedAt}
              />

              <div className="sm:col-span-2">
                <InfoItem
                  label="Patient Additional Notes"
                  value={certificate.additionalNotes}
                />
              </div>
            </div>
          </Section>

          {/* ==================================================
              DOCUMENTS
          ================================================== */}

          <Section
            title="Uploaded Documents"
            description="Review documents attached to the certificate request."
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <DocumentCard
                label="Medical Report"
                file={certificate.medicalReport}
              />

              <DocumentCard
                label="Previous Prescription"
                file={certificate.prescription}
              />

              <DocumentCard label="Government ID" file={certificate.idProof} />
            </div>
          </Section>

          {/* ==================================================
              DOCTOR MEDICAL ASSESSMENT
          ================================================== */}

          <Section
            title="Doctor's Medical Assessment"
            description="Medical information submitted by the attending doctor."
          >
            <div className="space-y-6">
              {/* EXAMINATION */}

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  Examination
                </p>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InfoItem
                      label="Examination Date"
                      value={certificate.examinationDate}
                    />

                    <InfoItem
                      label="Medical Condition"
                      value={certificate.medicalCondition}
                    />
                  </div>

                  <div className="mt-4">
                    <InfoItem
                      label="Examination Findings"
                      value={certificate.examinationFindings}
                    />
                  </div>
                </div>
              </div>

              {/* DIAGNOSIS */}

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  Diagnosis
                </p>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                    {certificate.diagnosis}
                  </p>
                </div>
              </div>

              {/* FITNESS */}

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  Fitness Assessment
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <InfoItem label="Fitness Status" value={getFitnessLabel()} />

                  <InfoItem
                    label="Rest Required"
                    value={certificate.restRequired ? "Yes" : "No"}
                  />

                  <InfoItem
                    label="Rest Period"
                    value={
                      certificate.restRequired
                        ? `${certificate.restFrom || "-"} to ${certificate.restTo || "-"}`
                        : "Not Applicable"
                    }
                  />
                </div>
              </div>

              {/* ADVICE */}

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  Medical Advice
                </p>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                    {certificate.medicalAdvice}
                  </p>
                </div>
              </div>

              {/* DOCTOR REMARKS */}

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  Doctor Remarks
                </p>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                    {certificate.doctorRemarks}
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* ==================================================
              CERTIFICATE PREVIEW
          ================================================== */}

          <Section
            title="Certificate Preview"
            description="Final certificate document for verification."
          >
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              {showPreview
                ? "Hide Certificate Preview"
                : "Show Certificate Preview"}
            </button>

            {showPreview && (
              <div className="rounded-xl border-2 border-slate-200 bg-white p-6 sm:p-8">
                {/* HOSPITAL HEADER */}

                <div className="border-b-2 border-slate-800 pb-5 text-center">
                  <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                    Government / District Hospital
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-800">
                    MEDICAL CERTIFICATE
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Medical Certificate Verification Copy
                  </p>
                </div>

                {/* CERTIFICATE NUMBER */}

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Certificate No:
                    <span className="ml-2 font-semibold text-slate-800">
                      To be generated on approval
                    </span>
                  </p>

                  <p className="text-sm text-slate-500">
                    Issue Date:
                    <span className="ml-2 font-semibold text-slate-800">
                      To be generated on approval
                    </span>
                  </p>
                </div>

                {/* PATIENT */}

                <div className="mt-7">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
                    Patient Details
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoItem label="Name" value={certificate.patient.name} />

                    <InfoItem
                      label="UHID"
                      value={certificate.patient.patientId}
                    />

                    <InfoItem
                      label="Age / Gender"
                      value={`${certificate.patient.age} / ${certificate.patient.gender}`}
                    />

                    {/* <InfoItem
                      label="Date of Birth"
                      value={certificate.patient.dob}
                    /> */}

                    <InfoItem
                      label="Certificate Type"
                      value={certificate.certificateType}
                    />

                    <InfoItem label="Purpose" value={certificate.purpose} />
                  </div>
                </div>

                {/* MEDICAL CONTENT */}

                <div className="mt-7 space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Examination Findings
                    </p>

                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {certificate.examinationFindings}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Diagnosis
                    </p>

                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {certificate.diagnosis}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Fitness Status
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {getFitnessLabel()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Rest Period
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {certificate.restRequired
                        ? `${certificate.restFrom || "-"} to ${certificate.restTo || "-"}`
                        : "No rest required"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Medical Advice
                    </p>

                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {certificate.medicalAdvice}
                    </p>
                  </div>
                </div>

                {/* DOCTOR */}

                <div className="mt-10 border-t border-slate-200 pt-6">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Department</p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {certificate.departmentName}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-sm font-semibold text-slate-800">
                        {certificate.doctorName}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Attending Doctor
                      </p>
                    </div>
                  </div>
                </div>

                {/* APPROVAL */}

                <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-800">
                    Approval Status
                  </p>

                  <p className="mt-1 text-sm leading-6 text-amber-700">
                    {certificate.status === "APPROVED"
                      ? "This certificate has been approved by the Medical Officer."
                      : certificate.status === "RETURNED"
                        ? "This certificate has been returned to the doctor for correction."
                        : certificate.status === "REJECTED"
                          ? "This certificate has been rejected by the Medical Officer."
                          : "This certificate has been prepared by the attending doctor and is awaiting final verification by the Medical Officer."}
                  </p>
                </div>
              </div>
            )}
          </Section>

          {/* ==================================================
              MEDICAL OFFICER REMARKS
          ================================================== */}

          <Section
            title="Medical Officer Review"
            description="Add remarks before approving, returning or rejecting the certificate."
          >
            <div>
              <InputLabel>Medical Officer Remarks</InputLabel>

              <textarea
                value={officerRemarks}
                onChange={(e) => setOfficerRemarks(e.target.value)}
                rows={5}
                placeholder="Enter verification remarks..."
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </Section>

          {/* ==================================================
              ACTION BAR
          ================================================== */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-800">
                Verification Decision
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Select the appropriate action after reviewing the complete
                certificate.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* RETURN */}

              <button
                type="button"
                disabled={processing || certificate.status !== "PENDING_REVIEW"}
                onClick={() => setShowReturnModal(true)}
                className="rounded-lg border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ↩ Return for Correction
              </button>

              {/* REJECT */}

              <button
                type="button"
                disabled={processing || certificate.status !== "PENDING_REVIEW"}
                onClick={() => setShowRejectModal(true)}
                className="rounded-lg border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ✕ Reject Certificate
              </button>

              {/* APPROVE */}

              <button
                type="button"
                disabled={processing || certificate.status !== "PENDING_REVIEW"}
                onClick={handleApprove}
                className="rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? "Processing..." : "✓ Approve Certificate"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          RETURN MODAL
      ================================================== */}

      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Return for Correction
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Tell the doctor what needs to be corrected.
              </p>
            </div>

            <div className="p-5">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Correction Reason
                <span className="ml-1 text-red-500">*</span>
              </label>

              <textarea
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                rows={5}
                placeholder="Example: Please correct the examination findings and rest period."
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={processing || certificate.status !== "PENDING_REVIEW"}
                onClick={handleReturn}
                className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
              >
                Return to Doctor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          REJECT MODAL
      ================================================== */}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Reject Medical Certificate
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Enter the reason for rejecting this certificate.
              </p>
            </div>

            <div className="p-5">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Rejection Reason
                <span className="ml-1 text-red-500">*</span>
              </label>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={5}
                placeholder="Enter rejection reason..."
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={processing || certificate.status !== "PENDING_REVIEW"}
                onClick={handleReject}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Reject Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
