import type {
  Patient,
  Doctor,
  Room,
  Specialization,
  TokenRecord,
  Medicine,
  Prescription,
  InventoryTransaction,
  AppNotification,
  DoctorAssignment,
  DayReport,
} from "./types";

export const SPECIALIZATIONS: Specialization[] = [
  { id: "sp1", name: "Dermatology", description: "Skin, hair and nail conditions" },
  { id: "sp2", name: "Cardiology", description: "Heart and blood vessel care" },
  { id: "sp3", name: "Orthopedics", description: "Bones, joints and muscles" },
  { id: "sp4", name: "ENT", description: "Ear, nose and throat" },
  { id: "sp5", name: "General Medicine", description: "General health concerns" },
  { id: "sp6", name: "Pediatrics", description: "Child health and development" },
];

export const DOCTORS: Doctor[] = [
  { id: "d1", code: "DOC-014", name: "Dr. Amit Sharma", qualification: "MD Dermatology", specialization: "Dermatology", mobile: "98200 11223", email: "amit.sharma@ydhospital.in", status: "ACTIVE", roomId: "r101" },
  { id: "d2", code: "DOC-021", name: "Dr. Neha Kapoor", qualification: "DM Cardiology", specialization: "Cardiology", mobile: "98200 33445", email: "neha.kapoor@ydhospital.in", status: "ACTIVE", roomId: "r102" },
  { id: "d3", code: "DOC-009", name: "Dr. Rakesh Verma", qualification: "MS Orthopedics", specialization: "Orthopedics", mobile: "98200 55667", email: "rakesh.verma@ydhospital.in", status: "ACTIVE", roomId: "r103" },
  { id: "d4", code: "DOC-032", name: "Dr. Sara Iyer", qualification: "MS ENT", specialization: "ENT", mobile: "98200 77889", email: "sara.iyer@ydhospital.in", status: "ACTIVE", roomId: "r104" },
  { id: "d5", code: "DOC-006", name: "Dr. Manoj Pillai", qualification: "MBBS, MD", specialization: "General Medicine", mobile: "98200 99001", email: "manoj.pillai@ydhospital.in", status: "ACTIVE", roomId: "r105" },
  { id: "d6", code: "DOC-018", name: "Dr. Farah Sheikh", qualification: "MD Pediatrics", specialization: "Pediatrics", mobile: "98200 22334", email: "farah.sheikh@ydhospital.in", status: "INACTIVE" },
];

export const ROOMS: Room[] = [
  { id: "r101", number: "101", name: "Dermatology OPD", floor: "1st Floor", specialization: "Dermatology", doctorId: "d1", status: "IN_SESSION" },
  { id: "r102", number: "102", name: "Cardiology OPD", floor: "1st Floor", specialization: "Cardiology", doctorId: "d2", status: "IN_SESSION" },
  { id: "r103", number: "103", name: "Orthopedics OPD", floor: "Ground Floor", specialization: "Orthopedics", doctorId: "d3", status: "AVAILABLE" },
  { id: "r104", number: "104", name: "ENT OPD", floor: "Ground Floor", specialization: "ENT", doctorId: "d4", status: "IN_SESSION" },
  { id: "r105", number: "201", name: "General Medicine OPD", floor: "2nd Floor", specialization: "General Medicine", doctorId: "d5", status: "AVAILABLE" },
  { id: "r106", number: "202", name: "Pediatrics OPD", floor: "2nd Floor", specialization: "Pediatrics", status: "CLOSED" },
];

export const PATIENTS: Patient[] = [
  { id: "YD000025", name: "Rahul Kumar", age: 32, gender: "Male", mobile: "90000 11111" },
  { id: "YD000001", name: "Vikram Singh", age: 45, gender: "Male", mobile: "90000 22222" },
  { id: "YD000002", name: "Amit Kumar", age: 28, gender: "Male", mobile: "90000 33333" },
  { id: "YD000003", name: "Priya Sharma", age: 25, gender: "Female", mobile: "90000 44444" },
  { id: "YD000004", name: "Sunita Devi", age: 51, gender: "Female", mobile: "90000 55555" },
  { id: "YD000005", name: "Arjun Mehta", age: 8, gender: "Male", mobile: "90000 66666" },
  { id: "YD000006", name: "Kavita Rao", age: 63, gender: "Female", mobile: "90000 77777" },
];

// Current logged-in patient for the patient flow demo
export const CURRENT_PATIENT_ID = "YD000025";

export const TOKENS: TokenRecord[] = [
  { id: "t1", code: "A-018", patientId: "YD000006", roomId: "r101", doctorId: "d1", specialization: "Dermatology", status: "IN_CONSULTATION", bookedAt: "09:10 AM", calledAt: "10:20 AM" },
  { id: "t2", code: "A-017", patientId: "YD000004", roomId: "r101", doctorId: "d1", specialization: "Dermatology", status: "COMPLETED", bookedAt: "09:05 AM" },
  { id: "t3", code: "A-016", patientId: "YD000002", roomId: "r101", doctorId: "d1", specialization: "Dermatology", status: "COMPLETED", bookedAt: "09:00 AM" },
  { id: "t4", code: "A-019", patientId: "YD000003", roomId: "r101", doctorId: "d1", specialization: "Dermatology", status: "WAITING", bookedAt: "10:22 AM" },
  { id: "t5", code: "A-020", patientId: "YD000001", roomId: "r101", doctorId: "d1", specialization: "Dermatology", status: "WAITING", bookedAt: "10:25 AM" },
  { id: "t6", code: "A-025", patientId: CURRENT_PATIENT_ID, roomId: "r101", doctorId: "d1", specialization: "Dermatology", status: "WAITING", bookedAt: "10:40 AM" },
];

export const MEDICINES: Medicine[] = [
  { id: "m1", name: "Paracetamol", generic: "Paracetamol", unit: "Tablet", stock: 200, usedToday: 10, lowStockThreshold: 50, active: true },
  { id: "m2", name: "Azithromycin", generic: "Azithromycin", unit: "Tablet", stock: 0, usedToday: 0, lowStockThreshold: 20, active: true },
  { id: "m3", name: "Cetirizine", generic: "Cetirizine Hydrochloride", unit: "Tablet", stock: 320, usedToday: 22, lowStockThreshold: 60, active: true },
  { id: "m4", name: "Amoxicillin", generic: "Amoxicillin", unit: "Capsule", stock: 18, usedToday: 6, lowStockThreshold: 25, active: true },
  { id: "m5", name: "ORS Sachet", generic: "Oral Rehydration Salts", unit: "Strip", stock: 150, usedToday: 4, lowStockThreshold: 40, active: true },
  { id: "m6", name: "Betadine Ointment", generic: "Povidone-Iodine", unit: "Tube", stock: 40, usedToday: 2, lowStockThreshold: 15, active: true },
  { id: "m7", name: "Cough Syrup", generic: "Dextromethorphan", unit: "Bottle", stock: 12, usedToday: 3, lowStockThreshold: 15, active: true },
  { id: "m8", name: "Insulin Glargine", generic: "Insulin Glargine", unit: "Injection", stock: 0, usedToday: 0, lowStockThreshold: 10, active: true },
  { id: "m9", name: "Ibuprofen", generic: "Ibuprofen", unit: "Tablet", stock: 8, usedToday: 5, lowStockThreshold: 30, active: true },
  { id: "m10", name: "Multivitamin", generic: "Multivitamin Complex", unit: "Tablet", stock: 0, usedToday: 0, lowStockThreshold: 20, active: false },
];

export const PRESCRIPTIONS: Prescription[] = [
  {
    id: "rx1",
    tokenId: "t2",
    patientId: "YD000004",
    doctorId: "d1",
    roomId: "r101",
    createdAt: "09:40 AM",
    advice: "Apply sunscreen daily. Avoid scratching affected area. Review after 5 days if rash persists.",
    items: [
      { id: "i1", medicineId: "m1", medicineName: "Paracetamol", dose: "500 mg", frequency: "3 times daily", duration: "3 days", quantity: 10, dispenseStatus: "PENDING" },
      { id: "i2", medicineId: "m2", medicineName: "Azithromycin", dose: "500 mg", frequency: "Once daily", duration: "3 days", quantity: 3, dispenseStatus: "PENDING" },
      { id: "i3", medicineId: "m6", medicineName: "Betadine Ointment", dose: "Apply topically", frequency: "Twice daily", duration: "5 days", quantity: 1, dispenseStatus: "PENDING" },
    ],
    status: "PENDING",
  },
  {
    id: "rx2",
    tokenId: "t3",
    patientId: "YD000002",
    doctorId: "d1",
    roomId: "r101",
    createdAt: "09:15 AM",
    advice: "Continue antihistamine for one week.",
    items: [
      { id: "i4", medicineId: "m3", medicineName: "Cetirizine", dose: "10 mg", frequency: "Once at night", duration: "7 days", quantity: 7, dispenseStatus: "GIVEN" },
    ],
    status: "COMPLETED",
  },
];

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", patientId: CURRENT_PATIENT_ID, message: "Your token A-025 is approaching. Please be near Room 101.", createdAt: "10:41 AM", read: false },
  { id: "n2", patientId: CURRENT_PATIENT_ID, message: "Dr. Amit Sharma has started consultation for the current token.", createdAt: "10:20 AM", read: false },
  { id: "n3", patientId: CURRENT_PATIENT_ID, message: "Token booked successfully for Dermatology OPD, Room 101.", createdAt: "10:40 AM", read: true },
];

export const ASSIGNMENTS: DoctorAssignment[] = [
  { id: "as1", doctorId: "d1", roomId: "r101", date: "2026-08-23", startTime: "09:00", endTime: "13:00", status: "ACTIVE" },
  { id: "as2", doctorId: "d2", roomId: "r102", date: "2026-08-23", startTime: "09:00", endTime: "13:00", status: "ACTIVE" },
  { id: "as3", doctorId: "d3", roomId: "r103", date: "2026-08-23", startTime: "14:00", endTime: "17:00", status: "SCHEDULED" },
  { id: "as4", doctorId: "d4", roomId: "r104", date: "2026-08-23", startTime: "09:00", endTime: "12:00", status: "ACTIVE" },
];

export const INVENTORY_TRANSACTIONS: InventoryTransaction[] = [
  { id: "tx1", date: "23 Aug 2026, 09:42 AM", medicineId: "m3", medicineName: "Cetirizine", type: "DISPENSE", quantity: 7, stockBefore: 327, stockAfter: 320, prescriptionRef: "#RX-1002", notes: "Given to YD000002" },
  { id: "tx2", date: "23 Aug 2026, 08:30 AM", medicineId: "m1", medicineName: "Paracetamol", type: "STOCK_IN", quantity: 100, stockBefore: 100, stockAfter: 200, notes: "Weekly restock from district store" },
  { id: "tx3", date: "22 Aug 2026, 05:10 PM", medicineId: "m9", medicineName: "Ibuprofen", type: "DISPENSE", quantity: 6, stockBefore: 14, stockAfter: 8, prescriptionRef: "#RX-0988", notes: "Given to YD000019" },
  { id: "tx4", date: "22 Aug 2026, 11:05 AM", medicineId: "m7", medicineName: "Cough Syrup", type: "ADJUSTMENT", quantity: -2, stockBefore: 15, stockAfter: 13, notes: "Damaged bottle written off" },
];

export const DAY_REPORTS: DayReport[] = [
  { id: "dr1", date: "22 Aug 2026", totalPatients: 214, totalTokens: 214, completed: 198, waiting: 0, hold: 3, skipped: 13, prescriptions: 176, medicinesGiven: 512, medicinesUnavailable: 24, remainingStock: 8420, closedBy: "Admin · S. Joshi" },
  { id: "dr2", date: "21 Aug 2026", totalPatients: 189, totalTokens: 189, completed: 180, waiting: 0, hold: 1, skipped: 8, prescriptions: 161, medicinesGiven: 470, medicinesUnavailable: 11, remainingStock: 8720, closedBy: "Admin · S. Joshi" },
  { id: "dr3", date: "20 Aug 2026", totalPatients: 202, totalTokens: 202, completed: 191, waiting: 0, hold: 2, skipped: 9, prescriptions: 168, medicinesGiven: 495, medicinesUnavailable: 19, remainingStock: 8960, closedBy: "Admin · R. Bhatt" },
];

export const VISIT_TREND = [
  { day: "Mon", patients: 178 },
  { day: "Tue", patients: 192 },
  { day: "Wed", patients: 168 },
  { day: "Thu", patients: 205 },
  { day: "Fri", patients: 214 },
  { day: "Sat", patients: 231 },
  { day: "Sun", patients: 96 },
];

export const CANCELLED_PRESCRIPTIONS = [
  { id: "cp1", prescriptionId: "RX-0876", tokenCode: "B-041", patient: "Deepak Nair", doctor: "Dr. Neha Kapoor", reason: "Duplicate entry — re-prescribed with corrected dosage", cancelledBy: "Dr. Neha Kapoor", cancelledAt: "20 Aug 2026, 3:12 PM" },
  { id: "cp2", prescriptionId: "RX-0791", tokenCode: "C-019", patient: "Meena Joshi", doctor: "Dr. Rakesh Verma", reason: "Patient allergic to prescribed medicine, revised on the spot", cancelledBy: "Dr. Rakesh Verma", cancelledAt: "18 Aug 2026, 11:47 AM" },
];
