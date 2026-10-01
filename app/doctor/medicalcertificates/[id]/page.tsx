"use client";

import React, { ChangeEvent, useEffect, useState } from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import medicalCertificateService, {
  SubmitDoctorCertificatePayload,
} from "@/services/medicalservices";

// ======================================================
// TYPES
// ======================================================

type FitnessStatus = "" | "FIT" | "UNFIT" | "FIT_WITH_RESTRICTIONS";

interface PatientData {
  patientId: string;
  name: string;
  abhaNumber: string;
  age: number;
  gender: string;
  dob: string;
  mobile: string;
  address: string;
  bloodGroup: string;
}

interface CertificateRequest {
  id: string;

  certificateType: string;
  purpose: string;

  departmentName: string;
  doctorName: string;

  additionalNotes: string;
  requestedAt: string;

  patient: PatientData;

  medicalReport: string | null;
  prescription: string | null;
  idProof: string | null;

  status?: string;
}

// ======================================================
// INPUT LABEL
// ======================================================

const InputLabel = ({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}

      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
};

// ======================================================
// TEXTAREA
// ======================================================

const TextArea = ({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />
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
// DOCUMENT CARD
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
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
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
          className="ml-3 shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          onClick={() => alert(`Open document: ${file}`)}
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

export default function DoctorMedicalCertificateDetailPage() {
  const params = useParams();
  const router = useRouter();

  const requestId = String(params?.id ?? "");

  // ====================================================
  // REQUEST STATE
  // ====================================================

  const [request, setRequest] = useState<CertificateRequest | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ====================================================
  // FORM STATE
  // ====================================================

  const [examinationDate, setExaminationDate] = useState<string>("");

  const [examinationFindings, setExaminationFindings] = useState<string>("");

  const [diagnosis, setDiagnosis] = useState<string>("");

  const [medicalCondition, setMedicalCondition] = useState<string>("");

  const [fitnessStatus, setFitnessStatus] = useState<FitnessStatus>("");

  const [restRequired, setRestRequired] = useState<"YES" | "NO">("NO");

  const [restFrom, setRestFrom] = useState<string>("");

  const [restTo, setRestTo] = useState<string>("");

  const [medicalAdvice, setMedicalAdvice] = useState<string>("");

  const [doctorRemarks, setDoctorRemarks] = useState<string>("");

  const [certificateValidity, setCertificateValidity] = useState<string>("");

  const [showPreview, setShowPreview] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);

  // ====================================================
  // LOAD REQUEST
  // ====================================================

  useEffect(() => {
    if (!requestId) return;

    let mounted = true;

    const loadRequest = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await medicalCertificateService.getDoctorCertificateDetails(
            requestId,
          );

        if (!mounted) return;

        if (!response?.success || !response?.data) {
          throw new Error(
            response?.message || "Unable to load certificate request",
          );
        }

        const data: any = response.data;

        // --------------------------------------------
        // REQUEST
        // --------------------------------------------

        setRequest({
          id: String(data.id ?? requestId),

          certificateType: data.certificateType ?? "-",

          purpose: data.purpose ?? "-",

          departmentName: data.departmentName ?? "-",

          doctorName: data.doctorName ?? "-",

          additionalNotes: data.additionalNotes ?? "",

          requestedAt: data.requestedAt ?? "",

          patient: {
            patientId: String(data.patient?.patientId ?? ""),

            name: data.patient?.name ?? "-",

            abhaNumber: data.patient?.abhaNumber || "-",

            age: Number(data.patient?.age ?? 0),

            gender: data.patient?.gender ?? "-",

            dob: data.patient?.dob ?? "",

            mobile: data.patient?.mobile ?? "",

            address: data.patient?.address ?? "",

            bloodGroup: data.patient?.bloodGroup ?? "",
          },

          medicalReport: data.medicalReport ?? null,

          prescription: data.prescription ?? null,

          idProof: data.idProof ?? null,

          status: data.status ?? "PENDING",
        });

        // --------------------------------------------
        // EXISTING DOCTOR ASSESSMENT
        // --------------------------------------------

        if (data.doctorAssessment) {
          setExaminationDate(
            data.examinationDate ||
              data.doctorAssessment?.examinationDate ||
              "",
          );

          setExaminationFindings(
            data.doctorAssessment?.examinationFindings || "",
          );

          setDiagnosis(data.doctorAssessment?.diagnosis || "");

          setMedicalCondition(data.doctorAssessment?.medicalCondition || "");

          setFitnessStatus(data.doctorAssessment?.fitnessStatus || "");

          setRestRequired(data.doctorAssessment?.restRequired ? "YES" : "NO");

          setRestFrom(data.doctorAssessment?.restFrom || "");

          setRestTo(data.doctorAssessment?.restTo || "");

          setMedicalAdvice(data.doctorAssessment?.medicalAdvice || "");

          setDoctorRemarks(data.doctorAssessment?.doctorRemarks || "");

          setCertificateValidity(
            data.doctorAssessment?.certificateValidity || "",
          );
        }
      } catch (err: any) {
        console.error("Doctor certificate detail load error:", err);

        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load certificate request",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadRequest();

    return () => {
      mounted = false;
    };
  }, [requestId]);

  // ====================================================
  // VALIDATE
  // ====================================================

  const validateForm = (): boolean => {
    if (!examinationDate) {
      alert("Please select examination date.");

      return false;
    }

    if (!examinationFindings.trim()) {
      alert("Please enter examination findings.");

      return false;
    }

    if (!diagnosis.trim()) {
      alert("Please enter diagnosis / medical condition.");

      return false;
    }

    if (!fitnessStatus) {
      alert("Please select fitness status.");

      return false;
    }

    if (restRequired === "YES" && (!restFrom || !restTo)) {
      alert("Please select rest period.");

      return false;
    }

    if (!medicalAdvice.trim()) {
      alert("Please enter medical advice.");

      return false;
    }

    return true;
  };

 const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  // TypeScript narrowing
  if (!fitnessStatus) {
    return;
  }

  try {
    setSubmitting(true);

    const payload: SubmitDoctorCertificatePayload = {
      examinationDate,

      examinationFindings: examinationFindings.trim(),

      diagnosis: diagnosis.trim(),

      medicalCondition: medicalCondition.trim() || null,

      fitnessStatus,

      restRequired,

      restFrom: restRequired === "YES" ? restFrom : null,

      restTo: restRequired === "YES" ? restTo : null,

      medicalAdvice: medicalAdvice.trim(),

      doctorRemarks: doctorRemarks.trim() || null,

      certificateValidity: certificateValidity.trim() || null,
    };

    console.log("Doctor Medical Certificate Payload:", payload);

    const response =
      await medicalCertificateService.submitDoctorCertificate(
        requestId,
        payload
      );

    if (!response?.success) {
      throw new Error(
        response?.message || "Unable to submit medical certificate"
      );
    }

    alert(
      "Medical certificate submitted successfully for Medical Officer approval."
    );

    router.push("/doctor/medicalcertificates");
  } catch (error: any) {
    console.error("Certificate submission error:", error);

    alert(
      error?.response?.data?.message ||
        error?.message ||
        "Unable to submit certificate."
    );
  } finally {
    setSubmitting(false);
  }
};

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading certificate request...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error || !request) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
              ⚠️
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-800">
              Unable to load certificate
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error || "Certificate request not found"}
            </p>

            <button
              type="button"
              onClick={() => router.push("/doctor/medicalcertificates")}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Medical Certificates
            </button>
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
      <div className="mx-auto max-w-6xl">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6">
          <Link
            href="/doctor/medicalcertificates"
            className="mb-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Medical Certificates
          </Link>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Medical Certificate Review
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Request ID:{" "}
                <span className="font-medium text-slate-700">{request.id}</span>
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
              <p className="text-xs font-medium text-amber-700">Status</p>

              <p className="mt-0.5 text-sm font-semibold text-amber-800">
                {request.status === "SUBMITTED_FOR_APPROVAL"
                  ? "Submitted for Medical Officer Approval"
                  : request.status === "RETURNED"
                    ? "Returned for Correction"
                    : request.status === "APPROVED"
                      ? "Approved"
                      : "Pending Doctor Review"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* ==================================================
              PATIENT INFORMATION
          ================================================== */}

          <Section
            title="Patient Information"
            description="Patient information received from the hospital registration system."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem label="Patient Name" value={request.patient.name} />

              <InfoItem
                label="Abha Number"
                value={request.patient.abhaNumber || "-"}
              />

              <InfoItem label="Age" value={`${request.patient.age} years`} />

              <InfoItem label="Gender" value={request.patient.gender} />

              {/* <InfoItem label="Date of Birth" value={request.patient.dob} /> */}

              <InfoItem label="Mobile" value={request.patient.mobile} />

              <InfoItem label="Department" value={request.departmentName} />

              <InfoItem label="Address" value={request.patient.address} />
            </div>
          </Section>

          {/* ==================================================
              REQUEST INFORMATION
          ================================================== */}

          <Section
            title="Certificate Request"
            description="Information submitted by the patient."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                label="Certificate Type"
                value={request.certificateType}
              />

              <InfoItem label="Purpose" value={request.purpose} />

              <InfoItem label="Requested On" value={request.requestedAt} />

              <InfoItem label="Assigned Doctor" value={request.doctorName} />

              <div className="sm:col-span-2 lg:col-span-4">
                <InfoItem
                  label="Patient's Additional Notes"
                  value={request.additionalNotes}
                />
              </div>
            </div>
          </Section>

          {/* ==================================================
              DOCUMENTS
          ================================================== */}

          <Section
            title="Patient Documents"
            description="Review uploaded documents before completing the medical examination."
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <DocumentCard
                label="Medical Report"
                file={request.medicalReport}
              />

              <DocumentCard
                label="Previous Prescription"
                file={request.prescription}
              />

              <DocumentCard label="Government ID" file={request.idProof} />
            </div>
          </Section>

          {/* ==================================================
              MEDICAL EXAMINATION
          ================================================== */}

          <Section
            title="Medical Examination"
            description="Enter findings from the patient's medical examination."
          >
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* EXAMINATION DATE */}

              <div>
                <InputLabel required>Examination Date</InputLabel>

                <input
                  type="date"
                  value={examinationDate}
                  onChange={(e) => setExaminationDate(e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* MEDICAL CONDITION */}

              <div>
                <InputLabel>Medical Condition</InputLabel>

                <input
                  type="text"
                  value={medicalCondition}
                  onChange={(e) => setMedicalCondition(e.target.value)}
                  placeholder="Enter current medical condition"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* FINDINGS */}

              <div className="lg:col-span-2">
                <InputLabel required>Examination Findings</InputLabel>

                <TextArea
                  value={examinationFindings}
                  onChange={(e) => setExaminationFindings(e.target.value)}
                  rows={5}
                  placeholder="Enter clinical examination findings, vital observations and relevant medical findings..."
                />
              </div>

              {/* DIAGNOSIS */}

              <div className="lg:col-span-2">
                <InputLabel required>Diagnosis</InputLabel>

                <TextArea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={4}
                  placeholder="Enter diagnosis / diagnosed medical condition..."
                />
              </div>
            </div>
          </Section>

          {/* ==================================================
              FITNESS
          ================================================== */}

          <Section
            title="Fitness & Rest Period"
            description="Specify the patient's fitness status and recommended rest period."
          >
            <div className="space-y-6">
              {/* FITNESS */}

              <div>
                <InputLabel required>Fitness Status</InputLabel>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {/* FIT */}

                  <button
                    type="button"
                    onClick={() => setFitnessStatus("FIT")}
                    className={`rounded-xl border p-4 text-left transition ${
                      fitnessStatus === "FIT"
                        ? "border-green-500 bg-green-50 ring-2 ring-green-100"
                        : "border-slate-200 bg-white hover:border-green-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-800">Fit</p>

                    <p className="mt-1 text-xs text-slate-500">
                      Patient is medically fit.
                    </p>
                  </button>

                  {/* UNFIT */}

                  <button
                    type="button"
                    onClick={() => setFitnessStatus("UNFIT")}
                    className={`rounded-xl border p-4 text-left transition ${
                      fitnessStatus === "UNFIT"
                        ? "border-red-500 bg-red-50 ring-2 ring-red-100"
                        : "border-slate-200 bg-white hover:border-red-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-800">
                      Unfit
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Patient is medically unfit.
                    </p>
                  </button>

                  {/* RESTRICTIONS */}

                  <button
                    type="button"
                    onClick={() => setFitnessStatus("FIT_WITH_RESTRICTIONS")}
                    className={`rounded-xl border p-4 text-left transition ${
                      fitnessStatus === "FIT_WITH_RESTRICTIONS"
                        ? "border-amber-500 bg-amber-50 ring-2 ring-amber-100"
                        : "border-slate-200 bg-white hover:border-amber-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-800">
                      Fit with Restrictions
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Fit subject to medical restrictions.
                    </p>
                  </button>
                </div>
              </div>

              {/* REST */}

              <div>
                <InputLabel required>Rest Required</InputLabel>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setRestRequired("YES")}
                    className={`rounded-lg border px-5 py-2.5 text-sm font-semibold transition ${
                      restRequired === "YES"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Yes
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRestRequired("NO");

                      setRestFrom("");

                      setRestTo("");
                    }}
                    className={`rounded-lg border px-5 py-2.5 text-sm font-semibold transition ${
                      restRequired === "NO"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* REST PERIOD */}

              {restRequired === "YES" && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <InputLabel required>Rest From</InputLabel>

                    <input
                      type="date"
                      value={restFrom}
                      onChange={(e) => setRestFrom(e.target.value)}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <InputLabel required>Rest To</InputLabel>

                    <input
                      type="date"
                      value={restTo}
                      onChange={(e) => setRestTo(e.target.value)}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* ==================================================
              MEDICAL ADVICE
          ================================================== */}

          <Section
            title="Medical Advice & Remarks"
            description="Provide instructions and additional observations for the certificate."
          >
            <div className="space-y-5">
              <div>
                <InputLabel required>Medical Advice</InputLabel>

                <TextArea
                  value={medicalAdvice}
                  onChange={(e) => setMedicalAdvice(e.target.value)}
                  rows={5}
                  placeholder="Enter medical advice, precautions, restrictions or recommendations..."
                />
              </div>

              <div>
                <InputLabel>Doctor Remarks</InputLabel>

                <TextArea
                  value={doctorRemarks}
                  onChange={(e) => setDoctorRemarks(e.target.value)}
                  rows={4}
                  placeholder="Enter any additional remarks..."
                />
              </div>

              <div>
                <InputLabel>Certificate Validity / Remarks</InputLabel>

                <input
                  type="text"
                  value={certificateValidity}
                  onChange={(e) => setCertificateValidity(e.target.value)}
                  placeholder="Example: Valid for 30 days"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </Section>

          {/* ==================================================
              PREVIEW
          ================================================== */}

          <Section
            title="Certificate Preview"
            description="Review the information that will be sent for Medical Officer approval."
          >
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              {showPreview ? "Hide Preview" : "Show Certificate Preview"}
            </button>

            {showPreview && (
              <div className="rounded-xl border-2 border-slate-200 bg-white p-6">
                {/* HEADER */}

                <div className="border-b-2 border-slate-800 pb-4 text-center">
                  <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                    District Hospital
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-800">
                    MEDICAL CERTIFICATE
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    For Official Use
                  </p>
                </div>

                {/* CERTIFICATE INFO */}

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="Certificate Type"
                    value={request.certificateType}
                  />

                  <InfoItem label="Purpose" value={request.purpose} />

                  <InfoItem label="Patient Name" value={request.patient.name} />

                  <InfoItem
                    label="Abha Number"
                    value={request.patient.abhaNumber}
                  />

                  <InfoItem
                    label="Age / Gender"
                    value={`${request.patient.age} years / ${request.patient.gender}`}
                  />

                  <InfoItem label="Examination Date" value={examinationDate} />
                </div>

                {/* FINDINGS */}

                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Examination Findings
                    </p>

                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {examinationFindings || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Diagnosis
                    </p>

                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {diagnosis || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Medical Condition
                    </p>

                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {medicalCondition || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Fitness Status
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {fitnessStatus === "FIT" && "Fit"}

                      {fitnessStatus === "UNFIT" && "Unfit"}

                      {fitnessStatus === "FIT_WITH_RESTRICTIONS" &&
                        "Fit with Restrictions"}

                      {!fitnessStatus && "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Rest Period
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {restRequired === "YES"
                        ? `${restFrom || "-"} to ${restTo || "-"}`
                        : "No rest required"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Medical Advice
                    </p>

                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {medicalAdvice || "-"}
                    </p>
                  </div>

                  {doctorRemarks && (
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Doctor Remarks
                      </p>

                      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                        {doctorRemarks}
                      </p>
                    </div>
                  )}
                </div>

                {/* DOCTOR */}

                <div className="mt-10 flex justify-between border-t border-slate-200 pt-6">
                  <div>
                    <p className="text-xs text-slate-400">Department</p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {request.departmentName}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">
                      {request.doctorName}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Attending Doctor
                    </p>
                  </div>
                </div>

                {/* APPROVAL NOTE */}

                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs leading-5 text-amber-700">
                    This certificate is a draft prepared by the doctor and is
                    subject to review and approval by the authorized Medical
                    Officer.
                  </p>
                </div>
              </div>
            )}
          </Section>

          {/* ==================================================
              FINAL INFORMATION
          ================================================== */}

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                i
              </div>

              <div>
                <p className="text-sm font-semibold text-blue-800">
                  Before submitting
                </p>

                <p className="mt-1 text-sm leading-6 text-blue-700">
                  Please verify the patient's information, examination findings,
                  diagnosis and fitness status. After submission, the
                  certificate will be forwarded to the Medical Officer for
                  review and approval.
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white py-5 sm:flex-row sm:justify-between">
            <Link
              href="/doctor/medicalcertificates"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="rounded-lg border border-blue-200 bg-blue-50 px-6 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                Preview Certificate
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  request.status === "SUBMITTED_FOR_APPROVAL" ||
                  request.status === "APPROVED"
                }
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting..."
                  : request.status === "SUBMITTED_FOR_APPROVAL"
                    ? "Already Submitted"
                    : request.status === "APPROVED"
                      ? "Certificate Approved"
                      : "Submit for Medical Officer Approval →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
