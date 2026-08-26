import api from "@/lib/api";

// ======================================================
// TYPES
// ======================================================

export type TokenStatus =
  | "WAITING"
  | "CALLED"
  | "IN_PROGRESS"
  | "IN_CONSULTATION"
  | "MEDICINE_PENDING"
  | "MEDICINE_COMPLETED"
  | "COMPLETED"
  | "CANCELLED"
  | "SKIPPED"
  | string;

export type PrescriptionStatus = "ACTIVE" | "COMPLETED" | "CANCELLED" | string;

export type DispensingStatus = "PENDING" | "GIVEN" | "UNAVAILABLE";

// ======================================================
// PATIENT
// ======================================================

export interface Patient {
  id: number | string;
  patientId: string;
  name: string;
  mobile?: string | null;
  age?: number | null;
  gender?: string | null;
}

// ======================================================
// TOKEN
// ======================================================

export interface PatientToken {
  tokenId: number | string;
  tokenNumber: number;

  patientId: string;
  patientName: string;

  room: {
    id: number | string;
    number: string | number;
    name?: string | null;
  };

  doctor: {
    id: number | string;
    name: string;
  };

  specialization?: {
    id: number | string;
    name: string;
  };

  status: TokenStatus;

  currentServingToken?: number | null;

  opdStatus?: string | null;

  opdSessionId?: number | string;

  tokenDate?: string;
}

// ======================================================
// PRESCRIPTION SUMMARY
// ======================================================

export interface PatientPrescriptionSummary {
  prescription_id: number | string;

  token_id?: number | string | null;
  token_number?: number | null;

  doctor_id?: number | string | null;
  doctor_name?: string | null;

  room_number?: string | number | null;

  advice?: string | null;

  prescription_status: PrescriptionStatus;

  prescribed_at?: string | null;
  completed_at?: string | null;

  medicine_count?: number | string;
  given_medicine_count?: number | string;
  unavailable_medicine_count?: number | string;
  pending_medicine_count?: number | string;
}

// ======================================================
// PRESCRIPTION MEDICINE
// ======================================================

export interface PatientPrescriptionMedicine {
  prescription_item_id: number | string;

  medicine_id: number | string;

  medicine_name: string;

  unit?: string | null;

  dose: string;
  frequency: string;
  duration: string;

  quantity: number | string;

  dispensing_status: DispensingStatus;

  given_quantity: number | string;

  dispensed_at?: string | null;
}

// ======================================================
// PRESCRIPTION DETAILS
// ======================================================

export interface PatientPrescriptionDetails {
  prescription: {
    prescription_id: number | string;

    token_id?: number | string | null;
    token_number?: number | null;
    token_date?: string | null;

    patient_id?: string | null;
    patient_name?: string | null;

    age?: number | null;
    gender?: string | null;

    doctor_id?: number | string | null;
    doctor_name?: string | null;

    room_id?: number | string | null;
    room_number?: string | number | null;
    room_name?: string | null;

    advice?: string | null;

    status: PrescriptionStatus;

    prescribed_at?: string | null;
    completed_at?: string | null;
  };

  summary: {
    totalMedicines: number;
    givenMedicines: number;
    unavailableMedicines: number;
    pendingMedicines: number;
  };

  medicines: PatientPrescriptionMedicine[];
}

// ======================================================
// DASHBOARD
// ======================================================

export const getPatientDashboard = async () => {
  const response = await api.get("/patient/dashboard");

  return response.data;
};

// ======================================================
// TODAY TOKEN
// ======================================================

export const getMyTodayToken = async () => {
  const response = await api.get("/patient/my-token/today");

  return response.data;
};

// ======================================================
// PROFILE
// ======================================================

export const getPatientProfile = async () => {
  const response = await api.get("/patient/profile");

  return response.data;
};

export const updatePatientProfile = async (data: {
  name: string;
  mobile: string;
  age: number;
}) => {
  const response = await api.put("/patient/profile", data);

  return response.data;
};

// ======================================================
// NOTIFICATIONS
// ======================================================

export const getPatientNotifications = async () => {
  const response = await api.get("/patient/notifications");

  return response.data;
};

export const markNotificationRead = async (id: number | string) => {
  const response = await api.put(`/patient/notifications/${id}/read`);

  return response.data;
};

// ======================================================
// SEARCH
// ======================================================

export const searchDiseaseSpecialization = async (query: string) => {
  const response = await api.get("/patient/search", {
    params: {
      search: query,
    },
  });

  return response.data;
};

// ======================================================
// OPD OPTIONS
// ======================================================

export const getOpdOptions = async (
  specializationId?: string | number,
  diseaseId?: string | number,
) => {
  const response = await api.get("/patient/opd-options", {
    params: {
      ...(specializationId ? { specializationId } : {}),

      ...(diseaseId ? { diseaseId } : {}),
    },
  });

  return response.data;
};

// ======================================================
// BOOK TOKEN
// ======================================================

export const bookToken = async (opdSessionId: string | number) => {
  const response = await api.post("/patient/tokens", {
    opdSessionId,
  });

  return response.data;
};

// ======================================================
// PRESCRIPTIONS
// ======================================================

export const getMyPrescriptions = async () => {
  const response = await api.get("/patient/prescriptions");

  return response.data;
};

export const getMyPrescriptionDetails = async (
  prescriptionId: number | string,
) => {
  const response = await api.get(`/patient/prescriptions/${prescriptionId}`);

  return response.data;
};
