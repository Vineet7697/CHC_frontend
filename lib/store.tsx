"use client";

import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import {
  DOCTORS,
  ROOMS,
  PATIENTS,
  TOKENS,
  MEDICINES,
  PRESCRIPTIONS,
  NOTIFICATIONS,
  ASSIGNMENTS,
  INVENTORY_TRANSACTIONS,
  CURRENT_PATIENT_ID,
} from "./mock-data";
import type {
  Doctor,
  Room,
  Patient,
  TokenRecord,
  Medicine,
  Prescription,
  PrescriptionItem,
  AppNotification,
  DoctorAssignment,
  InventoryTransaction,
  DispenseStatus,
} from "./types";

function nowTime() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

interface HospitalState {
  doctors: Doctor[];
  rooms: Room[];
  patients: Patient[];
  tokens: TokenRecord[];
  medicines: Medicine[];
  prescriptions: Prescription[];
  notifications: AppNotification[];
  assignments: DoctorAssignment[];
  transactions: InventoryTransaction[];
  currentPatientId: string;
}

interface HospitalActions {
  // patient
  bookToken: (roomId: string) => TokenRecord;
  markNotificationRead: (id: string) => void;
  // doctor
  callNext: (roomId: string) => TokenRecord | null;
  holdToken: (tokenId: string) => void;
  skipToken: (tokenId: string) => void;
  recallToken: (tokenId: string) => void;
  submitPrescription: (tokenId: string, items: Omit<PrescriptionItem, "id" | "dispenseStatus">[], advice: string) => void;
  completeConsultation: (tokenId: string) => void;
  // clinic
  dispenseItem: (prescriptionId: string, itemId: string, action: "GIVEN" | "UNAVAILABLE") => void;
  completeDispensing: (prescriptionId: string) => void;
  // inventory / admin
  addMedicine: (m: Omit<Medicine, "id" | "usedToday" | "active">) => void;
  updateMedicine: (id: string, patch: Partial<Medicine>) => void;
  removeMedicine: (id: string) => void;
  addDoctor: (d: Omit<Doctor, "id" | "status">) => void;
  updateDoctor: (id: string, patch: Partial<Doctor>) => void;
  deactivateDoctor: (id: string) => void;
  addRoom: (r: Omit<Room, "id" | "status">) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  deactivateRoom: (id: string) => void;
  assignDoctor: (doctorId: string, roomId: string, date: string, startTime: string, endTime: string) => void;
  startOPD: (roomId: string) => void;
  endOPD: (roomId: string) => void;
  cancelPrescription: (prescriptionId: string, reason: string) => void;
}

const HospitalContext = createContext<(HospitalState & HospitalActions) | null>(null);

export function HospitalProvider({ children }: { children: React.ReactNode }) {
  const [doctors, setDoctors] = useState<Doctor[]>(DOCTORS);
  const [rooms, setRooms] = useState<Room[]>(ROOMS);
  const [patients] = useState<Patient[]>(PATIENTS);
  const [tokens, setTokens] = useState<TokenRecord[]>(TOKENS);
  const [medicines, setMedicines] = useState<Medicine[]>(MEDICINES);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(PRESCRIPTIONS);
  const [notifications, setNotifications] = useState<AppNotification[]>(NOTIFICATIONS);
  const [assignments, setAssignments] = useState<DoctorAssignment[]>(ASSIGNMENTS);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(INVENTORY_TRANSACTIONS);

  const pushNotification = useCallback((patientId: string, message: string) => {
    setNotifications((prev) => [
      { id: `n${Date.now()}`, patientId, message, createdAt: nowTime(), read: false },
      ...prev,
    ]);
  }, []);

  const bookToken = useCallback(
    (roomId: string): TokenRecord => {
      const room = rooms.find((r) => r.id === roomId)!;
      const prefix = room.number.startsWith("2") ? "B" : "A";
      const roomTokens = tokens.filter((t) => t.roomId === roomId);
      const nextNum = roomTokens.length + 18; // continues the mock sequence
      const code = `${prefix}-${String(nextNum).padStart(3, "0")}`;
      const record: TokenRecord = {
        id: `t${Date.now()}`,
        code,
        patientId: CURRENT_PATIENT_ID,
        roomId,
        doctorId: room.doctorId ?? "",
        specialization: room.specialization,
        status: "WAITING",
        bookedAt: nowTime(),
      };
      setTokens((prev) => [...prev, record]);
      pushNotification(CURRENT_PATIENT_ID, `Token ${code} booked successfully for ${room.specialization} OPD, Room ${room.number}.`);
      return record;
    },
    [rooms, tokens, pushNotification]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const callNext = useCallback(
    (roomId: string): TokenRecord | null => {
      let called: TokenRecord | null = null;
      setTokens((prev) => {
        const next = [...prev];
        const idx = next.findIndex((t) => t.roomId === roomId && t.status === "WAITING");
        if (idx === -1) return prev;
        next[idx] = { ...next[idx], status: "IN_CONSULTATION", calledAt: nowTime() };
        called = next[idx];
        return next;
      });
      if (called) pushNotification((called as TokenRecord).patientId, `Your token ${(called as TokenRecord).code} has been called. Please proceed to the consultation room.`);
      return called;
    },
    [pushNotification]
  );

  const holdToken = useCallback((tokenId: string) => {
    setTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, status: "HOLD" } : t)));
  }, []);

  const skipToken = useCallback((tokenId: string) => {
    setTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, status: "SKIPPED" } : t)));
  }, []);

  const recallToken = useCallback((tokenId: string) => {
    setTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, status: "IN_CONSULTATION", calledAt: nowTime() } : t)));
  }, []);

  const submitPrescription = useCallback(
    (tokenId: string, items: Omit<PrescriptionItem, "id" | "dispenseStatus">[], advice: string) => {
      const token = tokens.find((t) => t.id === tokenId);
      if (!token) return;
      const prescription: Prescription = {
        id: `rx${Date.now()}`,
        tokenId,
        patientId: token.patientId,
        doctorId: token.doctorId,
        roomId: token.roomId,
        createdAt: nowTime(),
        advice,
        items: items.map((it, i) => ({ ...it, id: `pi${Date.now()}-${i}`, dispenseStatus: "PENDING" as DispenseStatus })),
        status: "PENDING",
      };
      setPrescriptions((prev) => [prescription, ...prev]);
      setTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, status: "MEDICINE_PENDING" } : t)));
      pushNotification(token.patientId, `Prescription submitted by Dr. ${doctors.find((d) => d.id === token.doctorId)?.name ?? ""}. Please proceed to the Clinic / Medical Shop.`);
    },
    [tokens, doctors, pushNotification]
  );

  const completeConsultation = useCallback((tokenId: string) => {
    setTokens((prev) =>
      prev.map((t) => (t.id === tokenId && t.status === "IN_CONSULTATION" ? { ...t, status: "MEDICINE_PENDING" } : t))
    );
  }, []);

  const dispenseItem = useCallback(
    (prescriptionId: string, itemId: string, action: "GIVEN" | "UNAVAILABLE") => {
      setPrescriptions((prevRx) => {
        return prevRx.map((rx) => {
          if (rx.id !== prescriptionId) return rx;
          const items = rx.items.map((it) => (it.id === itemId ? { ...it, dispenseStatus: action } : it));
          return { ...rx, items };
        });
      });

      if (action === "GIVEN") {
        const rx = prescriptions.find((r) => r.id === prescriptionId);
        const item = rx?.items.find((i) => i.id === itemId);
        if (item) {
          setMedicines((prev) =>
            prev.map((m) => {
              if (m.id !== item.medicineId) return m;
              const stockAfter = Math.max(0, m.stock - item.quantity);
              setTransactions((tx) => [
                {
                  id: `tx${Date.now()}`,
                  date: `${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}, ${nowTime()}`,
                  medicineId: m.id,
                  medicineName: m.name,
                  type: "DISPENSE",
                  quantity: item.quantity,
                  stockBefore: m.stock,
                  stockAfter,
                  prescriptionRef: `#${prescriptionId.toUpperCase()}`,
                  notes: `Given to ${rx?.patientId}`,
                },
                ...tx,
              ]);
              return { ...m, stock: stockAfter, usedToday: m.usedToday + item.quantity };
            })
          );
        }
      }
    },
    [prescriptions]
  );

  const completeDispensing = useCallback(
    (prescriptionId: string) => {
      let patientId = "";
      let given: string[] = [];
      let unavailable: string[] = [];
      setPrescriptions((prev) =>
        prev.map((rx) => {
          if (rx.id !== prescriptionId) return rx;
          patientId = rx.patientId;
          given = rx.items.filter((i) => i.dispenseStatus === "GIVEN").map((i) => i.medicineName);
          unavailable = rx.items.filter((i) => i.dispenseStatus === "UNAVAILABLE").map((i) => i.medicineName);
          return { ...rx, status: "COMPLETED" };
        })
      );
      setTokens((prev) => {
        const rx = prescriptions.find((r) => r.id === prescriptionId);
        if (!rx) return prev;
        return prev.map((t) => (t.id === rx.tokenId ? { ...t, status: "MEDICINE_COMPLETED" } : t));
      });
      if (patientId) {
        const parts: string[] = [];
        if (given.length) parts.push(`Given: ${given.join(", ")}`);
        if (unavailable.length) parts.push(`Unavailable: ${unavailable.join(", ")}`);
        pushNotification(patientId, `Dispensing complete. ${parts.join(" · ")}`);
      }
    },
    [prescriptions, pushNotification]
  );

  const addMedicine = useCallback((m: Omit<Medicine, "id" | "usedToday" | "active">) => {
    setMedicines((prev) => [{ ...m, id: `m${Date.now()}`, usedToday: 0, active: true }, ...prev]);
  }, []);

  const updateMedicine = useCallback((id: string, patch: Partial<Medicine>) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch, stock: Math.max(0, patch.stock ?? m.stock) } : m)));
  }, []);

  const removeMedicine = useCallback((id: string) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, active: false } : m)));
  }, []);

  const addDoctor = useCallback((d: Omit<Doctor, "id" | "status">) => {
    setDoctors((prev) => [{ ...d, id: `d${Date.now()}`, status: "ACTIVE" }, ...prev]);
  }, []);

  const updateDoctor = useCallback((id: string, patch: Partial<Doctor>) => {
    setDoctors((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }, []);

  const deactivateDoctor = useCallback((id: string) => {
    setDoctors((prev) => prev.map((d) => (d.id === id ? { ...d, status: d.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : d)));
  }, []);

  const addRoom = useCallback((r: Omit<Room, "id" | "status">) => {
    setRooms((prev) => [{ ...r, id: `r${Date.now()}`, status: "AVAILABLE" }, ...prev]);
  }, []);

  const updateRoom = useCallback((id: string, patch: Partial<Room>) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const deactivateRoom = useCallback((id: string) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, status: r.status === "CLOSED" ? "AVAILABLE" : "CLOSED" } : r)));
  }, []);

  const assignDoctor = useCallback((doctorId: string, roomId: string, date: string, startTime: string, endTime: string) => {
    setAssignments((prev) => [
      { id: `as${Date.now()}`, doctorId, roomId, date, startTime, endTime, status: "SCHEDULED" },
      ...prev,
    ]);
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, doctorId } : r)));
  }, []);

  const startOPD = useCallback((roomId: string) => {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, status: "IN_SESSION" } : r)));
  }, []);

  const endOPD = useCallback((roomId: string) => {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, status: "AVAILABLE" } : r)));
  }, []);

  const cancelPrescription = useCallback((prescriptionId: string, reason: string) => {
    setPrescriptions((prev) => prev.map((rx) => (rx.id === prescriptionId ? { ...rx, status: "CANCELLED", cancelReason: reason } : rx)));
  }, []);

  const value = useMemo(
    () => ({
      doctors,
      rooms,
      patients,
      tokens,
      medicines,
      prescriptions,
      notifications,
      assignments,
      transactions,
      currentPatientId: CURRENT_PATIENT_ID,
      bookToken,
      markNotificationRead,
      callNext,
      holdToken,
      skipToken,
      recallToken,
      submitPrescription,
      completeConsultation,
      dispenseItem,
      completeDispensing,
      addMedicine,
      updateMedicine,
      removeMedicine,
      addDoctor,
      updateDoctor,
      deactivateDoctor,
      addRoom,
      updateRoom,
      deactivateRoom,
      assignDoctor,
      startOPD,
      endOPD,
      cancelPrescription,
    }),
    [
      doctors,
      rooms,
      patients,
      tokens,
      medicines,
      prescriptions,
      notifications,
      assignments,
      transactions,
      bookToken,
      markNotificationRead,
      callNext,
      holdToken,
      skipToken,
      recallToken,
      submitPrescription,
      completeConsultation,
      dispenseItem,
      completeDispensing,
      addMedicine,
      updateMedicine,
      removeMedicine,
      addDoctor,
      updateDoctor,
      deactivateDoctor,
      addRoom,
      updateRoom,
      deactivateRoom,
      assignDoctor,
      startOPD,
      endOPD,
      cancelPrescription,
    ]
  );

  return <HospitalContext.Provider value={value}>{children}</HospitalContext.Provider>;
}

export function useHospital() {
  const ctx = useContext(HospitalContext);
  if (!ctx) throw new Error("useHospital must be used within HospitalProvider");
  return ctx;
}
