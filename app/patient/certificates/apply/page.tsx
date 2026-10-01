"use client";
import { useRouter } from "next/dist/client/components/navigation";
import React, { ChangeEvent, ReactNode, useEffect, useState } from "react";
import medicalCertificateService, {
  CreateMedicalCertificateRequestPayload,
} from "@/services/medicalservices";

// ======================================================
// TYPES
// ======================================================

type CertificateTypeValue =
  | "MEDICAL_FITNESS"
  | "SICK_LEAVE"
  | "MEDICAL_EXAMINATION"
  | "VACCINATION"
  | "OTHER";

type Gender = "Male" | "Female" | "Other" | "";

interface CertificateType {
  value: CertificateTypeValue;
  label: string;
}

interface Department {
  id: string;
  name: string;
}

interface Doctor {
  id: string;
  name: string;
  departmentId: string;
  specialization: string;
}

interface FormData {
  certificateType: CertificateTypeValue | "";

  departmentId: string;
  departmentName: string;

  doctorId: string;
  doctorName: string;

  purpose: string;
  additionalNotes: string;

  name: string;
  abhaNumber: string;
  dob: string;
  age: string;
  gender: Gender;
  mobile: string;
  address: string;

  medicalReport: File | null;
  prescription: File | null;
  idProof: File | null;
}

interface StepIndicatorProps {
  currentStep: number;
}

interface InputLabelProps {
  children: ReactNode;
  required?: boolean;
}

interface TextInputProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

interface SelectInputProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  disabled?: boolean;
}

interface FileUploadProps {
  label: string;
  required?: boolean;
  file: File | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  description?: string;
}

interface ReviewFileProps {
  label: string;
  file: File | null;
}

// ======================================================
// CONSTANTS
// ======================================================

const certificateTypes: CertificateType[] = [
  {
    value: "MEDICAL_FITNESS",
    label: "Medical Fitness",
  },
  {
    value: "SICK_LEAVE",
    label: "Sick Leave",
  },
  {
    value: "MEDICAL_EXAMINATION",
    label: "Medical Examination",
  },
  {
    value: "VACCINATION",
    label: "Vaccination Certificate",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

const purposes: string[] = [
  "Office / Employment",
  "School / College",
  "Sports",
  "Leave",
  "Government Purpose",
  "Other",
];

// ======================================================
// STEP INDICATOR
// ======================================================

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  const steps = [
    {
      number: 1,
      label: "Request",
    },
    {
      number: 2,
      label: "Patient Details",
    },
    {
      number: 3,
      label: "Documents",
    },
    {
      number: 4,
      label: "Review",
    },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex min-w-[600px] items-center justify-center px-4 py-5">
        {steps.map((step, index) => {
          const completed = currentStep > step.number;
          const active = currentStep === step.number;

          return (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${
                    completed
                      ? "border-blue-600 bg-blue-600 text-white"
                      : active
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {completed ? "✓" : step.number}
                </div>

                <span
                  className={`ml-2 whitespace-nowrap text-sm font-medium ${
                    active || completed ? "text-blue-600" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index !== steps.length - 1 && (
                <div
                  className={`mx-3 h-[2px] w-10 sm:w-20 ${
                    completed ? "bg-blue-600" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ======================================================
// INPUT LABEL
// ======================================================

const InputLabel = ({ children, required = false }: InputLabelProps) => {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}

      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
};

// ======================================================
// TEXT INPUT
// ======================================================

const TextInput = ({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: TextInputProps) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
    />
  );
};

// ======================================================
// SELECT INPUT
// ======================================================

const SelectInput = ({
  value,
  onChange,
  children,
  disabled = false,
}: SelectInputProps) => {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
    >
      {children}
    </select>
  );
};

// ======================================================
// FILE UPLOAD
// ======================================================

const FileUpload = ({
  label,
  required = false,
  file,
  onChange,
  accept = ".pdf,.jpg,.jpeg,.png",
  description = "PDF, JPG or PNG (Max 5 MB)",
}: FileUploadProps) => {
  return (
    <div>
      <InputLabel required={required}>{label}</InputLabel>

      <label
        className={`flex min-h-[105px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 transition ${
          file
            ? "border-green-300 bg-green-50"
            : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50"
        }`}
      >
        <input
          type="file"
          accept={accept}
          onChange={onChange}
          className="hidden"
        />

        {file ? (
          <>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              ✓
            </div>

            <p className="max-w-full truncate text-sm font-medium text-green-700">
              {file.name}
            </p>

            <p className="mt-1 text-xs text-green-600">File selected</p>
          </>
        ) : (
          <>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              ↑
            </div>

            <p className="text-sm font-medium text-slate-700">
              Click to upload
            </p>

            <p className="mt-1 text-xs text-slate-400">{description}</p>
          </>
        )}
      </label>
    </div>
  );
};

// ======================================================
// REVIEW FILE
// ======================================================

const ReviewFile = ({ label, file }: ReviewFileProps) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-700">{label}</p>

        <p className="mt-0.5 truncate text-xs text-slate-400">
          {file ? file.name : "Not uploaded"}
        </p>
      </div>

      <span
        className={`ml-3 shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
          file ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
        }`}
      >
        {file ? "Uploaded" : "Optional"}
      </span>
    </div>
  );
};

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function MedicalCertificateRegistration() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const router = useRouter();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    certificateType: "",

    departmentId: "",
    departmentName: "",

    doctorId: "",
    doctorName: "",

    purpose: "",
    additionalNotes: "",

    // ------------------------------------------------
    // PATIENT DATA
    // Hospital profile API se auto-fill hoga
    // ------------------------------------------------

    name: "",
    abhaNumber: "",
    dob: "",
    age: "",
    gender: "",
    mobile: "",
    address: "",

    medicalReport: null,
    prescription: null,
    idProof: null,
  });

  // ====================================================
  // UPDATE FIELD
  // ====================================================

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ====================================================
  // CERTIFICATE TYPE
  // ====================================================

  const getCertificateLabel = (): string => {
    const found = certificateTypes.find(
      (item) => item.value === formData.certificateType,
    );

    return found?.label ?? "-";
  };

  // ====================================================
  // LOAD PATIENT PROFILE + DEPARTMENTS
  // ====================================================

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingProfile(true);
        setLoadingDepartments(true);

        const [profile, departmentList] = await Promise.all([
          medicalCertificateService.getPatientProfile(),
          medicalCertificateService.getDepartments(),
        ]);

        setFormData((prev) => ({
          ...prev,
          name: profile.name || "",
          abhaNumber: profile.abhaNumber || "",
          dob: profile.dob || "",
          age: profile.age || "",
          gender: profile.gender || "",
          mobile: profile.mobile || "",
          address: profile.address || "",
        }));

        setDepartments(
          departmentList.map((department) => ({
            id: String(department.id),
            name: department.name,
          })),
        );
      } catch (error: unknown) {
        console.error("Medical certificate initial data error:", error);

        const message =
          error instanceof Error
            ? error.message
            : "Unable to load patient details.";

        alert(message);
      } finally {
        setLoadingProfile(false);
        setLoadingDepartments(false);
      }
    };

    loadInitialData();
  }, []);

  // ====================================================
  // DEPARTMENT CHANGE
  // ====================================================

  const handleDepartmentChange = async (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const departmentId = event.target.value;

    const department = departments.find(
      (item) => String(item.id) === departmentId,
    );

    setFormData((prev) => ({
      ...prev,
      departmentId,
      departmentName: department?.name || "",
      doctorId: "",
      doctorName: "",
    }));

    setDoctors([]);

    if (!departmentId) {
      return;
    }

    try {
      setLoadingDoctors(true);

      const doctorList =
        await medicalCertificateService.getDoctors(departmentId);

      setDoctors(
        doctorList.map((doctor) => ({
          id: String(doctor.id),
          name: doctor.name,
          specialization: doctor.specialization || "",
          departmentId,
        })),
      );
    } catch (error: unknown) {
      console.error("Medical certificate doctors error:", error);

      setDoctors([]);

      const message =
        error instanceof Error ? error.message : "Unable to load doctors.";

      alert(message);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // ====================================================
  // DOCTOR CHANGE
  // ====================================================

  const handleDoctorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const doctorId = event.target.value;

    const doctor = doctors.find((item) => String(item.id) === doctorId);

    setFormData((prev) => ({
      ...prev,
      doctorId,
      doctorName: doctor?.name || "",
    }));
  };

  // ====================================================
  // FILE CHANGE
  // ====================================================

  const handleFileChange = (
    field: "medicalReport" | "prescription" | "idProof",
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, JPG and PNG files are allowed.");
      event.target.value = "";
      return;
    }

    updateField(field, file);
  };

  // ====================================================
  // VALIDATE STEP
  // ====================================================

  const validateStep = (): boolean => {
    if (currentStep === 1) {
      if (!formData.certificateType) {
        alert("Please select certificate type.");
        return false;
      }

      if (!formData.departmentId) {
        alert("Please select department.");
        return false;
      }

      if (!formData.doctorId) {
        alert("Please select doctor.");
        return false;
      }

      if (!formData.purpose) {
        alert("Please select purpose.");
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.name.trim()) {
        alert("Patient name is required.");
        return false;
      }

      if (!formData.abhaNumber.trim()) {
        alert("ABHA number is required.");
        return false;
      }

      if (!formData.dob) {
        alert("Date of birth is required.");
        return false;
      }

      if (!formData.gender) {
        alert("Gender is required.");
        return false;
      }

      if (!formData.mobile.trim()) {
        alert("Mobile number is required.");
        return false;
      }
    }

    return true;
  };

  // ====================================================
  // NEXT
  // ====================================================

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  // ====================================================
  // BACK
  // ====================================================

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // ====================================================
  // SUBMIT
  // ====================================================

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    if (!declarationAccepted) {
      alert("Please accept the declaration before submitting the request.");
      return;
    }

    try {
      setSubmitting(true);

      // Backend (createMedicalCertificateRequest) reads a plain
      // JSON body via express.json() — there's no multer/file
      // upload handling on this route, and the uploaded files
      // (medicalReport, prescription, idProof) aren't persisted
      // anywhere in the current controller/table. So we send only
      // the fields the backend actually accepts, as JSON — not
      // FormData. The file inputs stay in the UI for now; wiring
      // them up needs a multer middleware + storage + columns on
      // the backend first.

      const payload: CreateMedicalCertificateRequestPayload = {
        certificateType: formData.certificateType,
        departmentId: formData.departmentId,
        doctorId: formData.doctorId,
        purpose: formData.purpose,
        additionalNotes: formData.additionalNotes || undefined,
      };

      const result = await medicalCertificateService.createRequest(payload);

      console.log("Medical certificate request created:", result);

      alert("Medical certificate request submitted successfully.");

      router.push("/patient/certificates");
    } catch (error: unknown) {
      console.error("Medical certificate submit error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting the request.";

      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ====================================================
  // JSX
  // ====================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* ==================================================
            HEADER
        ================================================== */}

        <button
          type="button"
          onClick={() => router.push("/patient/certificates")}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <span>←</span> Back to Certificates
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Apply for Medical Certificate
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Submit your certificate request to the hospital.
          </p>
        </div>

        {/* ==================================================
            STEPPER
        ================================================== */}

        <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* ==================================================
            MAIN CARD
        ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* ==================================================
              STEP 1
          ================================================== */}

          {currentStep === 1 && (
            <div>
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-lg font-semibold text-slate-800">
                  Step 1 — Certificate Request
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select certificate type, department and doctor.
                </p>
              </div>

              <div className="space-y-6 p-6">
                {/* ==========================================
                    CERTIFICATE TYPE
                ========================================== */}

                <div>
                  <InputLabel required>Certificate Type</InputLabel>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {certificateTypes.map((type) => {
                      const selected = formData.certificateType === type.value;

                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            updateField("certificateType", type.value)
                          }
                          className={`rounded-xl border p-4 text-left transition ${
                            selected
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                              : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-800">
                              {type.label}
                            </span>

                            {selected && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                                ✓
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ==========================================
                    DEPARTMENT
                ========================================== */}

                <div>
                  <InputLabel required>Department</InputLabel>

                  <SelectInput
                    value={formData.departmentId}
                    onChange={handleDepartmentChange}
                    disabled={loadingDepartments || submitting}
                  >
                    <option value="">
                      {loadingDepartments
                        ? "Loading departments..."
                        : "Select Department"}
                    </option>

                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </SelectInput>

                  <p className="mt-1.5 text-xs text-slate-400">
                    Select the hospital department related to your certificate
                    request.
                  </p>
                </div>

                {/* ==========================================
                    DOCTOR
                ========================================== */}

                <div>
                  <InputLabel required>Doctor</InputLabel>

                  <SelectInput
                    value={formData.doctorId}
                    onChange={handleDoctorChange}
                    disabled={
                      !formData.departmentId || loadingDoctors || submitting
                    }
                  >
                    <option value="">
                      {!formData.departmentId
                        ? "First select department"
                        : loadingDoctors
                          ? "Loading doctors..."
                          : doctors.length === 0
                            ? "No doctor available"
                            : "Select Doctor"}
                    </option>

                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} — {doctor.specialization}
                      </option>
                    ))}
                  </SelectInput>

                  <p className="mt-1.5 text-xs text-slate-400">
                    Your request will be sent to the selected doctor.
                  </p>
                </div>

                {/* ==========================================
                    SELECTED DOCTOR PREVIEW
                ========================================== */}

                {formData.doctorId && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        Dr
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          {formData.doctorName}
                        </p>

                        <p className="mt-0.5 text-xs text-blue-700">
                          {formData.departmentName}
                        </p>

                        <p className="mt-1 text-xs text-blue-600">
                          Your certificate request will be assigned to this
                          doctor.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ==========================================
                    PURPOSE
                ========================================== */}

                <div>
                  <InputLabel required>Purpose of Certificate</InputLabel>

                  <SelectInput
                    value={formData.purpose}
                    onChange={(e) => updateField("purpose", e.target.value)}
                  >
                    <option value="">Select Purpose</option>

                    {purposes.map((purpose) => (
                      <option key={purpose} value={purpose}>
                        {purpose}
                      </option>
                    ))}
                  </SelectInput>
                </div>

                {/* ==========================================
                    NOTES
                ========================================== */}

                <div>
                  <InputLabel>Additional Notes</InputLabel>

                  <textarea
                    value={formData.additionalNotes}
                    onChange={(e) =>
                      updateField("additionalNotes", e.target.value)
                    }
                    rows={4}
                    placeholder="Any specific request or information for the doctor..."
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* ==========================================
                  FOOTER
              ========================================== */}

              <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* ==================================================
              STEP 2
          ================================================== */}

          {currentStep === 2 && (
            <div>
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-lg font-semibold text-slate-800">
                  Step 2 — Patient Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your registered hospital information is shown below.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                {/* NAME */}

                <div>
                  <InputLabel required>Full Name</InputLabel>

                  <TextInput
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Full name"
                  />
                </div>

                {/* UHID */}

                <div>
                  <InputLabel>ABHA Number</InputLabel>

                  <TextInput
                    value={formData.abhaNumber}
                    onChange={(e) => updateField("abhaNumber", e.target.value)}
                    disabled
                  />
                </div>

                {/* DOB */}

                <div>
                  <InputLabel required>Date of Birth</InputLabel>

                  <TextInput
                    type="date"
                    value={formData.dob}
                    onChange={(e) => updateField("dob", e.target.value)}
                  />
                </div>

                {/* AGE */}

                <div>
                  <InputLabel>Age</InputLabel>

                  <TextInput
                    value={formData.age}
                    onChange={(e) => updateField("age", e.target.value)}
                    placeholder="Age"
                  />
                </div>

                {/* GENDER */}

                <div>
                  <InputLabel required>Gender</InputLabel>

                  <SelectInput
                    value={formData.gender}
                    onChange={(e) =>
                      updateField("gender", e.target.value as Gender)
                    }
                  >
                    <option value="">Select Gender</option>

                    <option value="Male">Male</option>

                    <option value="Female">Female</option>

                    <option value="Other">Other</option>
                  </SelectInput>
                </div>

                {/* MOBILE */}

                <div>
                  <InputLabel>Mobile Number</InputLabel>

                  <TextInput
                    value={formData.mobile}
                    onChange={(e) => updateField("mobile", e.target.value)}
                    placeholder="Mobile number"
                  />
                </div>

                {/* ADDRESS */}

                <div className="md:col-span-2">
                  <InputLabel>Address</InputLabel>

                  <textarea
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* INFO */}

                <div className="md:col-span-2">
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <p className="text-sm leading-6 text-blue-700">
                      Patient details are loaded from hospital registration /
                      UHID. Please verify them before continuing.
                    </p>
                  </div>
                </div>
              </div>

              {/* FOOTER */}

              <div className="flex justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* ==================================================
              STEP 3
          ================================================== */}

          {currentStep === 3 && (
            <div>
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-lg font-semibold text-slate-800">
                  Step 3 — Upload Documents
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Upload only the documents required for your certificate.
                </p>
              </div>

              <div className="space-y-5 p-6">
                {/* MEDICAL REPORT */}

                <FileUpload
                  label="Relevant Medical Report"
                  file={formData.medicalReport}
                  onChange={(e) => handleFileChange("medicalReport", e)}
                />

                {/* PRESCRIPTION */}

                <FileUpload
                  label="Previous Prescription"
                  file={formData.prescription}
                  onChange={(e) => handleFileChange("prescription", e)}
                />

                {/* ID PROOF */}

                <FileUpload
                  label="Government ID Proof"
                  file={formData.idProof}
                  onChange={(e) => handleFileChange("idProof", e)}
                  description="Aadhaar, PAN or Passport (Max 5 MB)"
                />

                {/* INFORMATION */}

                <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <p className="text-sm leading-6 text-amber-700">
                    Upload only relevant documents. Documents may be reviewed by
                    authorized hospital staff.
                  </p>
                </div>
              </div>

              {/* FOOTER */}

              <div className="flex justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* ==================================================
              STEP 4
          ================================================== */}

          {currentStep === 4 && (
            <div>
              <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-lg font-semibold text-slate-800">
                  Step 4 — Review & Submit
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review your request before submitting it to the selected
                  doctor.
                </p>
              </div>

              <div className="space-y-5 p-6">
                {/* ==================================================
                    CERTIFICATE REQUEST
                ================================================== */}

                <div className="rounded-xl border border-slate-200">
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Certificate Request
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                    {/* CERTIFICATE TYPE */}

                    <div>
                      <p className="text-xs text-slate-400">Certificate Type</p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {getCertificateLabel()}
                      </p>
                    </div>

                    {/* PURPOSE */}

                    <div>
                      <p className="text-xs text-slate-400">Purpose</p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formData.purpose || "-"}
                      </p>
                    </div>

                    {/* DEPARTMENT */}

                    <div>
                      <p className="text-xs text-slate-400">Department</p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formData.departmentName || "-"}
                      </p>
                    </div>

                    {/* DOCTOR */}

                    <div>
                      <p className="text-xs text-slate-400">Assigned Doctor</p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formData.doctorName || "-"}
                      </p>
                    </div>

                    {/* NOTES */}

                    <div className="sm:col-span-2">
                      <p className="text-xs text-slate-400">Additional Notes</p>

                      <p className="mt-1 text-sm text-slate-700">
                        {formData.additionalNotes || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    ASSIGNED DOCTOR
                ================================================== */}

                <div className="rounded-xl border border-blue-100 bg-blue-50">
                  <div className="flex items-start gap-3 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      Dr
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Request will be sent to
                      </p>

                      <p className="mt-1 text-base font-semibold text-blue-800">
                        {formData.doctorName || "-"}
                      </p>

                      <p className="mt-0.5 text-sm text-blue-700">
                        {formData.departmentName || "-"}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-blue-600">
                        The selected doctor will examine the request and prepare
                        the medical certificate based on the patient's medical
                        assessment.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    PATIENT DETAILS
                ================================================== */}

                <div className="rounded-xl border border-slate-200">
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Patient Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* NAME */}

                    <div>
                      <p className="text-xs text-slate-400">Name</p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formData.name || "-"}
                      </p>
                    </div>

                    {/* UHID */}

                    <div>
                      <p className="text-xs text-slate-400">UHID</p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formData.abhaNumber || "-"}
                      </p>
                    </div>

                    {/* DOB */}

                    <div>
                      <p className="text-xs text-slate-400">Date of Birth</p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formData.dob || "-"}
                      </p>
                    </div>

                    {/* AGE */}

                    <div>
                      <p className="text-xs text-slate-400">Age</p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formData.age || "-"}
                      </p>
                    </div>

                    {/* GENDER */}

                    <div>
                      <p className="text-xs text-slate-400">Gender</p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formData.gender || "-"}
                      </p>
                    </div>

                    {/* MOBILE */}

                    <div>
                      <p className="text-xs text-slate-400">Mobile</p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formData.mobile || "-"}
                      </p>
                    </div>

                    {/* ADDRESS */}

                    <div className="sm:col-span-2 lg:col-span-3">
                      <p className="text-xs text-slate-400">Address</p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {formData.address || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    DOCUMENTS
                ================================================== */}

                <div className="rounded-xl border border-slate-200">
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Documents
                    </h3>
                  </div>

                  <div className="space-y-3 p-4">
                    <ReviewFile
                      label="Medical Report"
                      file={formData.medicalReport}
                    />

                    <ReviewFile
                      label="Previous Prescription"
                      file={formData.prescription}
                    />

                    <ReviewFile label="Government ID" file={formData.idProof} />
                  </div>
                </div>

                {/* ==================================================
                    SUBMISSION INFORMATION
                ================================================== */}

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      i
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-blue-800">
                        What happens after submission?
                      </p>

                      <p className="mt-1 text-sm leading-6 text-blue-700">
                        Your request will be sent to the selected doctor. The
                        doctor will review your request, examine the patient if
                        required, and prepare the medical certificate.
                      </p>

                      <p className="mt-2 text-sm leading-6 text-blue-700">
                        The certificate may then be reviewed and approved by the
                        authorized Medical Officer before it becomes available
                        for download.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    DECLARATION
                ================================================== */}

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex gap-3">
                    <input
                      type="checkbox"
                      id="certificateDeclaration"
                      checked={declarationAccepted}
                      onChange={(e) => setDeclarationAccepted(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />

                    <label
                      htmlFor="certificateDeclaration"
                      className="cursor-pointer text-sm leading-6 text-slate-600"
                    >
                      I confirm that the information provided above is correct
                      and that the uploaded documents belong to me / the
                      patient. I understand that the medical certificate will be
                      issued only after examination and approval by the
                      authorized hospital staff.
                    </label>
                  </div>
                </div>
              </div>

              {/* ==================================================
                  FOOTER
              ================================================== */}

              <div className="flex justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Request ✓"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}