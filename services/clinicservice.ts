import api from "@/lib/api";

// ========================================
// PRESCRIPTION ITEM
// ========================================

export interface PrescriptionItem {
  prescription_item_id: number | string;

  medicine_id: number | string;

  medicine_name: string;

  unit?: string | null;

  dose: string;

  frequency: string;

  duration: string;

  quantity: number;

  dispensing_status: "PENDING" | "GIVEN" | "UNAVAILABLE";

  given_quantity: number;

  available_stock: number;
}

// ========================================
// PENDING PRESCRIPTION
// ========================================

export interface PendingPrescription {
  prescription_id: number | string;

  token_id?: number | string | null;
  token_number?: number | null;

  patient_id?: string | null;
  patient_name?: string | null;

  doctor_id?: number | string | null;
  doctor_name?: string | null;

  room_id?: number | string | null;
  room_number?: string | number | null;

  prescribed_at?: string | null;
  completed_at?: string | null;

  prescription_status: "ACTIVE" | "COMPLETED" | "CANCELLED" | string;

  medicine_count?: number | string;

  given_medicine_count?: number | string;

  unavailable_medicine_count?: number | string;

  pending_medicine_count?: number | string;
}

// ========================================
// PRESCRIPTION DETAILS
// ========================================

export interface PrescriptionDetails {
  prescription: {
    prescription_id: number | string;

    token_id?: number | string | null;

    token_number?: number | null;

    patient_id?: string | null;

    patient_name?: string | null;

    age?: number | null;

    gender?: string | null;

    doctor_name?: string | null;

    room_number?: string | number | null;

    advice?: string | null;

    status: "ACTIVE" | "COMPLETED" | "CANCELLED" | string;

    prescribed_at?: string | null;
  };

  medicines: PrescriptionItem[];
}

// ========================================
// BACKWARD COMPATIBILITY
// ========================================

export type ClinicPrescription = PendingPrescription;

// ========================================
// API RESPONSES
// ========================================

export interface ClinicPrescriptionResponse {
  success?: boolean;

  message?: string;

  data?: PendingPrescription[];
}

export interface ClinicPrescriptionDetailsResponse {
  success?: boolean;

  message?: string;

  data?: PrescriptionDetails;
}

// ========================================
// CLINIC SERVICE
// ========================================

export const clinicService = {
  // ----------------------------------------
  // GET PENDING PRESCRIPTIONS
  // ----------------------------------------

  async getPendingPrescriptions() {
    const response = await api.get<ClinicPrescriptionResponse>(
      "/clinic/prescriptions/pending",
    );

    return response.data;
  },

  // ----------------------------------------
  // GET PRESCRIPTION DETAILS
  // ----------------------------------------

  async getPrescriptionDetails(prescriptionId: number | string) {
    const response = await api.get<ClinicPrescriptionDetailsResponse>(
      `/clinic/prescriptions/${prescriptionId}`,
    );

    return response.data;
  },

  // ----------------------------------------
  // DISPENSE MEDICINE
  // ----------------------------------------

  async dispenseMedicine(
    itemId: number | string,
    status: "GIVEN" | "UNAVAILABLE",
  ) {
    const response = await api.post(`/clinic/dispensing/${itemId}`, {
      status,
    });

    return response.data;
  },

  // ----------------------------------------
  // COMPLETE DISPENSING
  // ----------------------------------------

  async completeDispensing(prescriptionId: number | string) {
    const response = await api.post(
      `/clinic/dispensing/${prescriptionId}/complete`,
    );

    return response.data;
  },

  getPrescriptionReceipt: async (prescriptionId: string | number) => {
    const response = await api.get(
      `/clinic/prescriptions/${prescriptionId}/receipt?print=true`,
      {
        responseType: "text",
      },
    );

    return response;
  },
};
