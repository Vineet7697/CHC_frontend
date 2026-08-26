import api from "@/lib/api";

// ==============================
// DASHBOARD
// ==============================

export const getAdminDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

export const getPatientStats = async () => {
  const response = await api.get("/admin/dashboard/patients");
  return response.data;
};

export const getMedicineStats = async () => {
  const response = await api.get("/admin/dashboard/medicines");
  return response.data;
};

export const getRoomStats = async () => {
  const response = await api.get("/admin/dashboard/rooms");
  return response.data;
};

export const getDoctorStats = async () => {
  const response = await api.get("/admin/dashboard/doctors");
  return response.data;
};

// ==============================
// DOCTORS
// ==============================

export interface AdminDoctor {
  id: number;
  code: string;
  name: string;
  qualification: string | null;
  specialization: string | null;
  mobile: string | null;
  email: string | null;
  status?: "ACTIVE" | "INACTIVE" | string;
  is_active?: boolean | number;
}

export interface AddDoctorPayload {
  doctorCode: string;
  name: string;
  qualification: string;
  specialization: string;
  mobile: string;
  email: string;
  password: string;
}

export interface UpdateDoctorPayload {
  name?: string;
  qualification?: string;
  specialization?: string;
  mobile?: string;
  email?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export const getDoctors = async (): Promise<AdminDoctor[]> => {
  const response = await api.get("/admin/doctors");

  return response.data?.data || response.data || [];
};

export const addDoctor = async (data: AddDoctorPayload) => {
  const response = await api.post("/admin/doctors", data);

  return response.data;
};

export const updateDoctor = async (
  id: number | string,
  data: {
    name?: string;
    qualification?: string;
    specialization?: string;
    mobile?: string;
    email?: string;
    status?: "ACTIVE" | "INACTIVE";
  },
) => {
  const response = await api.put(`/admin/doctors/${id}`, data);
  return response.data;
};

export const deleteDoctor = async (id: number) => {
  const response = await api.delete(`/admin/doctors/${id}`);

  return response.data;
};

// ==============================
// ROOMS
// ==============================

export interface AdminRoom {
  id: number;
  room_number: string;
  room_name: string | null;
  floor: string | null;
  is_active: boolean;
  created_at?: string;

  doctor_id?: number | null;
  doctor_name?: string | null;
  specialization?: string | null;

  assignment_id?: number | null;
  assignment_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  assignment_active?: number | boolean | null;
}

export interface AddRoomPayload {
  roomNumber: string;
  roomName?: string;
  floor?: string | number;
}

export interface UpdateRoomPayload {
  roomNumber?: string;
  roomName?: string;
  floor?: string | number;
}

export const getRooms = async (): Promise<AdminRoom[]> => {
  const response = await api.get("/admin/rooms");

  return response.data?.data || [];
};

export const addRoom = async (data: AddRoomPayload) => {
  const response = await api.post("/admin/rooms", data);

  return response.data;
};

export const updateRoom = async (id: number, data: UpdateRoomPayload) => {
  const response = await api.put(`/admin/rooms/${id}`, data);

  return response.data;
};

export const deleteRoom = async (id: number) => {
  const response = await api.delete(`/admin/rooms/${id}`);

  return response.data;
};

// ==============================
// DOCTOR ROOM ASSIGNMENT
// ==============================

export interface DoctorRoomAssignment {
  id: number;
  assignment_date: string;
  start_time: string | null;
  end_time: string | null;
  is_active: number | boolean;

  doctor_id: number;
  doctor_name: string;

  room_id: number;
  room_number: string;
  room_name: string | null;
}

export interface AssignDoctorPayload {
   doctorId: number;
  roomId: number;
  assignmentDate: string;
  startTime: string;
  consultationStartTime: string;
  endTime: string;
}

export interface UpdateDoctorRoomAssignmentPayload {
  doctorId?: number;
  roomId?: number;
  assignmentDate?: string;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}

export const assignDoctorToRoom = async (data: AssignDoctorPayload) => {
  const response = await api.post("/admin/doctor-room-assignments", data);

  return response.data;
};

export const getDoctorRoomAssignments = async (): Promise<{
  success: boolean;
  data: DoctorRoomAssignment[];
}> => {
  const response = await api.get("/admin/doctor-room-assignments");

  return response.data;
};

export const updateDoctorRoomAssignment = async (
  id: number,
  data: UpdateDoctorRoomAssignmentPayload,
) => {
  const response = await api.put(`/admin/doctor-room-assignments/${id}`, data);

  return response.data;
};

// ==============================
// MEDICINES
// ==============================

export const getMedicines = async (params?: {
  search?: string;
  includeInactive?: boolean;
}) => {
  const response = await api.get("/admin/medicines", {
    params,
  });

  return response.data;
};

export const addMedicine = async (data: {
  name: string;
  genericName?: string;
  unit?: string;
  stockQuantity: number;
}) => {
  const response = await api.post("/admin/medicines", data);

  return response.data;
};

export const updateMedicine = async (
  id: number,
  data: {
    name?: string;
    genericName?: string;
    unit?: string;
    stockQuantity?: number;
  },
) => {
  const response = await api.put(`/admin/medicines/${id}`, data);

  return response.data;
};

export const deleteMedicine = async (id: number) => {
  const response = await api.delete(`/admin/medicines/${id}`);

  return response.data;
};

// ==============================
// INVENTORY
// ==============================

export const getInventory = async () => {
  const response = await api.get("/admin/inventory");
  return response.data;
};

export const getInventoryTransactions = async (params?: {
  medicineId?: number;
  from?: string;
  to?: string;
}) => {
  const response = await api.get("/admin/inventory/transactions", {
    params,
  });

  return response.data;
};
// ============================================
// PRESCRIPTIONS
// ============================================

export interface AdminPrescription {
  id: number;

  tokenId: number;
  patientId: number;
  doctorId: number;
  roomId: number;

  patientName: string | null;
  patientMobile: string | null;

  doctorName: string | null;
  specialization: string | null;

  roomNumber: string | null;

  tokenNumber: number | null;
  tokenCode: string | null;

  advice: string | null;

  status: "ACTIVE" | "COMPLETED" | "CANCELLED";

  medicineCount: number;

  cancelReason: string | null;
  cancelledBy: string | null;
  cancelledAt: string | null;

  prescribedAt: string;
  completedAt: string | null;
}


// GET ALL
export const getPrescriptions = async (): Promise<AdminPrescription[]> => {
  const response = await api.get("/admin/prescriptions");

  return response.data?.data || [];
};


// GET CANCELLED
export const getCancelledPrescriptions = async (): Promise<
  AdminPrescription[]
> => {
  const response = await api.get("/admin/prescriptions/cancelled");

  return response.data?.data || [];
};


// CANCEL
export const cancelPrescription = async (
  prescriptionId: number,
  reason: string
) => {
  const response = await api.post(
    `/admin/prescriptions/${prescriptionId}/cancel`,
    {
      reason,
    }
  );

  return response.data;
};
// ==============================
// DISPENSING
// ==============================

export const dispenseMedicine = async (
  itemId: number,
  status: "GIVEN" | "UNAVAILABLE",
) => {
  const response = await api.put(
    `/admin/dispensing/${itemId}`,
    {
      status,
    },
  );

  return response.data;
};

export const completeDispensing = async (
  prescriptionId: number,
) => {
  const response = await api.put(
    `/admin/dispensing/${prescriptionId}/complete`,
  );

  return response.data;
};
// ==============================
// DAY END REPORTS
// ==============================

export interface DayEndReport {
  id: number | string;
  report_date: string;

  total_patients: number;
  total_tokens: number;

  completed_tokens: number;
  waiting_tokens: number;
  hold_tokens: number;
  skipped_tokens: number;

  medicine_pending_tokens: number;
  medicine_completed_tokens: number;

  total_prescriptions: number;

  medicines_used: number;
  medicines_given: number;
  medicines_unavailable: number;

  remaining_stock: number;

  closed_by: number | string | null;
  closed_at: string | null;
}

export const closeDay = async (date?: string) => {
  const response = await api.post(
    "/admin/day-end/close",
    date ? { date } : {}
  );

  return response.data;
};

export const getReports = async (params?: {
  from?: string;
  to?: string;
}) => {
  const response = await api.get("/admin/day-end/reports", {
    params,
  });

  return response.data;
};

export const getReportById = async (
  id: number | string
) => {
  const response = await api.get(
    `/admin/day-end/reports/${id}`
  );

  return response.data;
};
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

  status:
    | "NOT_STARTED"
    | "RUNNING"
    | "ENDED"
    | "CLOSED"
    | null;

  startedAt: string | null;
  endedAt: string | null;

  currentToken: string | null;
  totalPatients: number;
}

export const getTodayOpd = async () => {
  const response = await api.get("/admin/opd/today");

  return response.data;
};

export const startOpd = async (
  opdSessionId: number
) => {
  const response = await api.post(
    "/admin/opd/start",
    {
      opdSessionId,
    }
  );

  return response.data;
};

export const endOpd = async (
  opdSessionId: number
) => {
  const response = await api.post(
    "/admin/opd/end",
    {
      opdSessionId,
    }
  );

  return response.data;
};