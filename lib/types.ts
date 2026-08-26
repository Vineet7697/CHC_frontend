export type Role = "patient" | "doctor" | "clinic" | "admin";

export type TokenStatus =
  | "WAITING"
  | "CALLED"
  | "IN_CONSULTATION"
  | "HOLD"
  | "SKIPPED"
  | "COMPLETED"
  | "MEDICINE_PENDING"
  | "MEDICINE_COMPLETED"
  | "PRESCRIPTION_CANCELLED";

export type StockStatus = "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK" | "INACTIVE";

export type DispenseStatus = "PENDING" | "GIVEN" | "UNAVAILABLE";

export interface Patient {
  id: string; // e.g. YD000025
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  mobile: string;
}

export interface Doctor {
  id: string;
  code: string; // DOC-014
  name: string;
  qualification: string;
  specialization: string;
  mobile: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
  roomId?: string;
}

export interface Room {
  id: string;
  number: string; // 101
  name: string;
  floor: string;
  specialization: string;
  doctorId?: string;
  status: "AVAILABLE" | "IN_SESSION" | "CLOSED";
}

export interface Specialization {
  id: string;
  name: string;
  description: string;
}

export interface TokenRecord {
  id: string;
  code: string; // A-025
  patientId: string;
  roomId: string;
  doctorId: string;
  specialization: string;
  status: TokenStatus;
  bookedAt: string; // ISO time
  calledAt?: string;
}

export interface Medicine {
  id: string;
  name: string;
  generic: string;
  unit: "Tablet" | "Capsule" | "Bottle" | "Injection" | "Tube" | "Strip";
  stock: number;
  usedToday: number;
  lowStockThreshold: number;
  active: boolean;
}

export interface PrescriptionItem {
  id: string;
  medicineId: string;
  medicineName: string;
  dose: string;
  frequency: string;
  duration: string;
  quantity: number;
  dispenseStatus: DispenseStatus;
}

export interface Prescription {
  id: string;
  tokenId: string;
  patientId: string;
  doctorId: string;
  roomId: string;
  createdAt: string;
  advice?: string;
  items: PrescriptionItem[];
  status: "PENDING" | "PARTIALLY_DISPENSED" | "COMPLETED" | "CANCELLED";
  cancelReason?: string;
}

export interface InventoryTransaction {
  id: string;
  date: string;
  medicineId: string;
  medicineName: string;
  type: "STOCK_IN" | "DISPENSE" | "ADJUSTMENT" | "RETURN";
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  prescriptionRef?: string;
  notes?: string;
}

export interface AppNotification {
  id: string;
  patientId: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface DoctorAssignment {
  id: string;
  doctorId: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "ACTIVE" | "ENDED";
}

export interface DayReport {
  id: string;
  date: string;
  totalPatients: number;
  totalTokens: number;
  completed: number;
  waiting: number;
  hold: number;
  skipped: number;
  prescriptions: number;
  medicinesGiven: number;
  medicinesUnavailable: number;
  remainingStock: number;
  closedBy: string;
}
