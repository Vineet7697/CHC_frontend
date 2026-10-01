import api from "@/lib/api";

// ======================================================
// TYPES
// ======================================================

export interface MedicalCertificatePatientProfile {
  patientId: number | string;
  hospitalPatientId: string;
  name: string;
  abhaNumber: string;
  dob: string;
  age: string;
  gender: "Male" | "Female" | "Other" | "";
  mobile: string;
  address: string;
}

// ======================================================
// DEPARTMENT
// ======================================================

export interface MedicalCertificateDepartment {
  id: number | string;
  name: string;
}

// ======================================================
// DOCTOR
// ======================================================

export interface MedicalCertificateDoctor {
  id: number | string;
  name: string;
  specialization: string;
}

// ======================================================
// CREATE REQUEST RESPONSE
// ======================================================

export interface MedicalCertificateRequestResponse {
  requestId: number | string;
  status: string;
}

// ======================================================
// CREATE REQUEST PAYLOAD
// ======================================================

export interface CreateMedicalCertificateRequestPayload {
  certificateType: string;
  departmentId: string | number;
  doctorId: string | number;
  purpose: string;
  additionalNotes?: string;
}

// ======================================================
// DOCTOR SUBMIT PAYLOAD
// ======================================================

export interface SubmitDoctorCertificatePayload {
  examinationDate: string;

  examinationFindings: string;

  diagnosis: string;

  medicalCondition: string | null;

  fitnessStatus: "FIT" | "UNFIT" | "FIT_WITH_RESTRICTIONS";

  restRequired: "YES" | "NO";

  restFrom: string | null;

  restTo: string | null;

  medicalAdvice: string;

  doctorRemarks: string | null;

  certificateValidity: string | null;
}

// ======================================================
// API RESPONSE
// ======================================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// ======================================================
// CERTIFICATE STATUS
// ======================================================

export type MedicalCertificateStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "SUBMITTED_FOR_APPROVAL"
  | "APPROVED"
  | "RETURNED"
  | "REJECTED";

// ======================================================
// PATIENT CERTIFICATE LIST ITEM
// ======================================================

export interface MedicalCertificateListItem {
  id: string | number;

  certificateNumber?: string;

  certificateType: string;

  departmentId: string | number;
  departmentName: string;

  doctorId: string | number;
  doctorName: string;

  purpose: string;

  additionalNotes: string;

  requestedAt: string;

  updatedAt: string;

  issuedDate?: string;

  status: MedicalCertificateStatus;

  correctionReason?: string;

  rejectionReason?: string;
}

// ======================================================
// PATIENT CERTIFICATE DETAILS
// ======================================================

export interface MedicalCertificateDetails {
  id: string | number;

  certificateNumber?: string;

  certificateType: string;

  purpose: string;

  departmentName: string;

  doctorName: string;

  requestedAt: string;

  updatedAt?: string;

  examinationDate?: string;

  issuedDate?: string;

  status: MedicalCertificateStatus;

  patient: {
    patientId: string | number;

    abhaNumber: string;

    name: string;

    age: number;

    gender: string;

    dob: string;

    mobile: string;

    address: string;

    bloodGroup: string;
  };

  doctorAssessment?: {
    examinationDate?: string;

    examinationFindings: string;

    diagnosis: string;

    medicalCondition: string;

    fitnessStatus: "FIT" | "UNFIT" | "FIT_WITH_RESTRICTIONS" | "";

    restRequired: boolean;

    restFrom?: string;

    restTo?: string;

    medicalAdvice: string;

    doctorRemarks?: string;

    certificateValidity?: string;

    doctorSubmittedAt?: string;
  } | null;

  // Future Medical Officer fields
  medicalOfficer?: {
    name: string;
    designation: string;
    reviewedAt: string;
    remarks?: string;
  };

  correctionReason?: string;

  rejectionReason?: string;

  // Documents
  documents: {
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
  }[];
}

// ======================================================
// DOCTOR CERTIFICATE LIST
// ======================================================

export interface DoctorMedicalCertificateRequest {
  id: string | number;

  patientId: string | number;

  patientName: string;

  age: number;

  gender: string;

  certificateType: string;

  departmentId: string | number;

  departmentName: string;

  purpose: string;

  additionalNotes: string;

  requestedAt: string;

  status: MedicalCertificateStatus;
}

// ======================================================
// DOCTOR CERTIFICATE DETAIL
// ======================================================

export interface DoctorMedicalCertificateDetail {
  id: string | number;

  certificateType: string;

  purpose: string;

  departmentName: string;

  doctorName: string;

  additionalNotes: string;

  requestedAt: string;

  updatedAt?: string;

  status: MedicalCertificateStatus;

  patient: {
    patientId: string | number;

    abhaNumber?: string;

    name: string;

    age: number;

    gender: string;

    dob: string;

    mobile: string;

    address: string;

    bloodGroup: string;
  };

  doctorAssessment?: {
    examinationDate?: string;

    examinationFindings: string;

    diagnosis: string;

    medicalCondition: string;

    fitnessStatus: "FIT" | "UNFIT" | "FIT_WITH_RESTRICTIONS" | "";

    restRequired: boolean;

    restFrom?: string;

    restTo?: string;

    medicalAdvice: string;

    doctorRemarks?: string;

    certificateValidity?: string;

    doctorSubmittedAt?: string;
  } | null;

  medicalReport: string | null;

  prescription: string | null;

  idProof: string | null;
}

// ======================================================
// DOWNLOAD CERTIFICATE RESPONSE DATA
// ======================================================

export interface DownloadMedicalCertificateData {
  id: string | number;

  certificate_type: string;

  patient_name: string;

  patient_age: number | null;

  patient_gender: string | null;

  patient_mobile: string | null;

  patient_address: string | null;

  department_name: string;

  doctor_name: string;

  purpose: string;

  examination_date: string | null;

  examination_findings: string | null;

  diagnosis: string | null;

  medical_condition: string | null;

  fitness_status: "FIT" | "UNFIT" | "FIT_WITH_RESTRICTIONS" | null;

  rest_required: number;

  rest_from: string | null;

  rest_to: string | null;

  medical_advice: string | null;

  doctor_remarks: string | null;

  certificate_validity: string | null;

  status: string;

  created_at: string;

  updated_at: string;
}


// ======================================================
// MEDICAL OFFICER / ADMIN
// ======================================================

export interface AdminMedicalCertificateListItem {
  id: string | number;

  patientId: string | number;
  patientHospitalId?: string;

  patientName: string;
  age: number | null;
  gender: string;

  certificateType: string;
  departmentName: string;
  doctorName: string;

  purpose: string;

  submittedAt: string;
  status:
    | "SUBMITTED_FOR_APPROVAL"
    | "RETURNED"
    | "APPROVED"
    | "REJECTED";
}

export interface AdminMedicalCertificateDetail {
  id: string | number;

  certificateType: string;
  purpose: string;
  departmentName: string;
  doctorName: string;

  requestedAt: string;
  submittedAt: string | null;
  additionalNotes: string;

  status:
    | "SUBMITTED_FOR_APPROVAL"
    | "RETURNED"
    | "APPROVED"
    | "REJECTED";

  patient: {
    patientId: string | number;
    hospitalPatientId?: string;
    name: string;
    age: number | null;
    gender: string;
    dob?: string | null;
    mobile?: string | null;
    address?: string | null;
    bloodGroup?: string | null;
  };

  doctorAssessment: {
    examinationDate: string | null;
    examinationFindings: string | null;
    diagnosis: string | null;
    medicalCondition: string | null;
    fitnessStatus:
      | "FIT"
      | "UNFIT"
      | "FIT_WITH_RESTRICTIONS"
      | null;
    restRequired: boolean;
    restFrom: string | null;
    restTo: string | null;
    medicalAdvice: string | null;
    doctorRemarks: string | null;
    certificateValidity: string | null;
  } | null;

  medicalReport: string | null;
  prescription: string | null;
  idProof: string | null;

  certificateNumber?: string | null;
  issuedDate?: string | null;

  medicalOfficer?: {
    name: string | null;
    designation: string | null;
    reviewedAt: string | null;
    remarks: string | null;
  } | null;

  correctionReason?: string | null;
  rejectionReason?: string | null;
}

export interface MedicalOfficerActionResponse {
  id: string | number;
  status:
    | "APPROVED"
    | "RETURNED"
    | "REJECTED";
  certificateNumber?: string;
}


// ======================================================
// MEDICAL CERTIFICATE SERVICE
// ======================================================

const medicalCertificateService = {
  // ====================================================
  // PATIENT
  // GET PATIENT PROFILE
  // GET /certificates/profile
  // ====================================================

  async getPatientProfile(): Promise<MedicalCertificatePatientProfile> {
    const response = await api.get<
      ApiResponse<MedicalCertificatePatientProfile>
    >("/certificates/profile");

    if (!response.data?.success || !response.data?.data) {
      throw new Error(response.data?.message || "Patient profile not found");
    }

    return response.data.data;
  },

  // ====================================================
  // PATIENT
  // GET DEPARTMENTS
  // GET /certificates/departments
  // ====================================================

  async getDepartments(): Promise<MedicalCertificateDepartment[]> {
    const response = await api.get<ApiResponse<MedicalCertificateDepartment[]>>(
      "/certificates/departments",
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Unable to load departments");
    }

    return response.data.data || [];
  },

  // ====================================================
  // PATIENT
  // GET DOCTORS
  // GET /certificates/doctors?departmentId=1
  // ====================================================

  async getDoctors(
    departmentId: string | number,
  ): Promise<MedicalCertificateDoctor[]> {
    if (!departmentId) {
      return [];
    }

    const response = await api.get<ApiResponse<MedicalCertificateDoctor[]>>(
      "/certificates/doctors",
      {
        params: {
          departmentId,
        },
      },
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Unable to load doctors");
    }

    return response.data.data || [];
  },

  // ====================================================
  // PATIENT
  // CREATE MEDICAL CERTIFICATE REQUEST
  // POST /certificates
  // ====================================================

  async createRequest(
    payload: CreateMedicalCertificateRequestPayload,
  ): Promise<MedicalCertificateRequestResponse> {
    const response = await api.post<
      ApiResponse<MedicalCertificateRequestResponse>
    >("/certificates", payload);

    if (!response.data?.success || !response.data?.data) {
      throw new Error(
        response.data?.message ||
          "Failed to submit medical certificate request",
      );
    }

    return response.data.data;
  },

  // ====================================================
  // PATIENT
  // GET MY MEDICAL CERTIFICATES
  // GET /certificates
  // ====================================================

  async getMyCertificates(): Promise<
    ApiResponse<MedicalCertificateListItem[]>
  > {
    const response =
      await api.get<ApiResponse<MedicalCertificateListItem[]>>("/certificates");

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || "Unable to load medical certificates",
      );
    }

    return response.data;
  },

  // ====================================================
  // PATIENT
  // GET CERTIFICATE DETAILS
  // GET /certificates/:id
  // ====================================================

  async getCertificateDetails(
    certificateId: string | number,
  ): Promise<ApiResponse<MedicalCertificateDetails>> {
    const response = await api.get<ApiResponse<MedicalCertificateDetails>>(
      `/certificates/${certificateId}`,
    );

    if (!response.data?.success || !response.data?.data) {
      throw new Error(
        response.data?.message || "Unable to load certificate details",
      );
    }

    return response.data;
  },

  // ====================================================
  // PATIENT
  // DOWNLOAD MEDICAL CERTIFICATE
  // GET /certificates/:id/download
  // ====================================================

  async downloadCertificate(certificateId: string | number) {
    const response = await api.get(`/certificates/${certificateId}/download`, {
      responseType: "blob",
    });

    return response.data;
  },

  // ====================================================
  // DOCTOR
  // GET MEDICAL CERTIFICATE REQUESTS
  // GET /certificates/doctor
  // ====================================================

  async getDoctorCertificates(): Promise<
    ApiResponse<DoctorMedicalCertificateRequest[]>
  > {
    const response = await api.get<
      ApiResponse<DoctorMedicalCertificateRequest[]>
    >("/certificates/doctor");

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || "Unable to load doctor medical certificates",
      );
    }

    return response.data;
  },

  // ====================================================
  // DOCTOR
  // GET CERTIFICATE REQUEST DETAILS
  // GET /certificates/doctor/:id
  // ====================================================

  async getDoctorCertificateDetails(
    requestId: string | number,
  ): Promise<ApiResponse<DoctorMedicalCertificateDetail>> {
    const response = await api.get<ApiResponse<DoctorMedicalCertificateDetail>>(
      `/certificates/doctor/${requestId}`,
    );

    if (!response.data?.success || !response.data?.data) {
      throw new Error(
        response.data?.message || "Unable to load medical certificate request",
      );
    }

    return response.data;
  },

  // ====================================================
  // DOCTOR
  // SUBMIT MEDICAL CERTIFICATE
  // POST /certificates/doctor/:id/submit
  // ====================================================

  async submitDoctorCertificate(
    requestId: string | number,
    payload: SubmitDoctorCertificatePayload,
  ): Promise<
    ApiResponse<{
      id: string | number;
      status: "SUBMITTED_FOR_APPROVAL";
    }>
  > {
    const response = await api.post<
      ApiResponse<{
        id: string | number;
        status: "SUBMITTED_FOR_APPROVAL";
      }>
    >(`/certificates/doctor/${requestId}/submit`, payload);

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || "Unable to submit medical certificate",
      );
    }

    return response.data;
  },

  // ======================================================
  // MEDICAL OFFICER / ADMIN
  // ======================================================

  async getMedicalOfficerCertificates(): Promise<
    ApiResponse<AdminMedicalCertificateListItem[]>
  > {
    const response = await api.get<
      ApiResponse<AdminMedicalCertificateListItem[]>
    >("/certificates/medical-officer");

    if (!response.data?.success) {
      throw new Error(
        response.data?.message ||
          "Unable to load medical certificates",
      );
    }

    return response.data;
  },

  async getMedicalOfficerCertificateDetails(
    certificateId: string | number,
  ): Promise<ApiResponse<AdminMedicalCertificateDetail>> {
    const response =
      await api.get<ApiResponse<AdminMedicalCertificateDetail>>(
        `/certificates/medical-officer/${certificateId}`,
      );

    if (!response.data?.success || !response.data?.data) {
      throw new Error(
        response.data?.message ||
          "Unable to load certificate details",
      );
    }

    return response.data;
  },

  async approveMedicalCertificate(
    certificateId: string | number,
    officerRemarks: string,
  ): Promise<ApiResponse<MedicalOfficerActionResponse>> {
    const response =
      await api.post<ApiResponse<MedicalOfficerActionResponse>>(
        `/certificates/medical-officer/${certificateId}/approve`,
        {
          officerRemarks,
        },
      );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message ||
          "Unable to approve certificate",
      );
    }

    return response.data;
  },

  async returnMedicalCertificate(
    certificateId: string | number,
    correctionReason: string,
    officerRemarks: string,
  ): Promise<ApiResponse<MedicalOfficerActionResponse>> {
    const response =
      await api.post<ApiResponse<MedicalOfficerActionResponse>>(
        `/certificates/medical-officer/${certificateId}/return`,
        {
          correctionReason,
          officerRemarks,
        },
      );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message ||
          "Unable to return certificate",
      );
    }

    return response.data;
  },

  async rejectMedicalCertificate(
    certificateId: string | number,
    rejectionReason: string,
    officerRemarks: string,
  ): Promise<ApiResponse<MedicalOfficerActionResponse>> {
    const response =
      await api.post<ApiResponse<MedicalOfficerActionResponse>>(
        `/certificates/medical-officer/${certificateId}/reject`,
        {
          rejectionReason,
          officerRemarks,
        },
      );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message ||
          "Unable to reject certificate",
      );
    }

    return response.data;
  },
};
// ======================================================
// DEFAULT EXPORT
// ======================================================

export default medicalCertificateService;
