import api from "@/lib/api";

export interface DoctorOPD {
  opd_session_id: number;
  opd_date: string;
  status: string;
  token_start_time?: string | null;
  consultation_start_time?: string | null;
  token_close_time?: string | null;
  current_token_number?: number | null;
  doctor_id: number;
  doctor_code: string;
  doctor_name: string;
  room_id: number;
  room_number: string | number;
  room_name: string;
  specializations?: string | null;
}

export interface DoctorPatient {
  token_id: number;
  token_number: number;
  token_date: string;
  status: string;
  called_at?: string | null;
  consultation_started_at?: string | null;
  completed_at?: string | null;
  opd_session_id: number;
  room_id: number;
  room_number: string | number;
  room_name: string;
  patient_record_id: number;
  patient_id: string;
  patient_name: string;
  age: number;
  gender: string;
}

export interface CurrentPatient {
  token_id: number;
  token_number: number;
  status: string;
  patient_id: string;
  name: string;
  age: number;
  gender: string;
  room_number: string | number;
  current_token_number: number;
}

export interface PrescriptionMedicine {
  medicineId: number | string;
  dose: string;
  frequency?: string;
  duration?: string;
  quantity: number;
}

export interface CreatePrescriptionPayload {
  tokenId: number | string;
  advice?: string;
  medicines: PrescriptionMedicine[];
}

export const doctorService = {
  async getToday() {
    const response = await api.get("/doctor/today");
    return response.data;
  },

  async getPatients(status?: string) {
    const response = await api.get("/doctor/patients", {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  async getCurrentPatient() {
    const response = await api.get("/doctor/current-patient");
    return response.data;
  },

  async callNext() {
    const response = await api.post("/doctor/call-next");
    return response.data;
  },

  async holdPatient(tokenId: number | string) {
    const response = await api.post(`/doctor/hold/${tokenId}`);
    return response.data;
  },

  async skipPatient(tokenId: number | string) {
    const response = await api.post(`/doctor/skip/${tokenId}`);
    return response.data;
  },

  async recallPatient(tokenId: number | string) {
    const response = await api.post(`/doctor/recall/${tokenId}`);
    return response.data;
  },

  async createPrescription(data: CreatePrescriptionPayload) {
    const response = await api.post("/doctor/prescriptions", data);
    return response.data;
  },

  async completeConsultation(tokenId: number | string) {
    const response = await api.post("/doctor/complete-consultation", {
      tokenId,
    });
    return response.data;
  },

  async getMedicines() {
    const response = await api.get("/doctor/medicines");
    return response.data;
  },
};

export const getMedicines = doctorService.getMedicines;



// ==============================
// OPD MANAGEMENT
// ==============================

export interface AdminOpdRoom {
  id: number;
  number: string;

  roomName: string | null;
  floor: string | null;

  doctorId: number | null;
  doctorName: string | null;
  specialization: string | null;

  opdSessionId: number | null;

  status: "NOT_STARTED" | "RUNNING" | "ENDED" | "CLOSED" | null;

  startedAt: string | null;
  endedAt: string | null;

  currentToken: string | null;
  totalPatients: number;
}

export const getTodayOpd = async () => {
  const response = await api.get("/admin/opd/today");

  return response.data;
};

export const startOpd = async (opdSessionId: number) => {
  const response = await api.post("/admin/opd/start", {
    opdSessionId,
  });

  return response.data;
};

export const endOpd = async (opdSessionId: number) => {
  const response = await api.post("/admin/opd/end", {
    opdSessionId,
  });

  return response.data;
};