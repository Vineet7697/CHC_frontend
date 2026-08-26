"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { doctorService } from "@/services/doctorservice";

export const CURRENT_DOCTOR_ID = "d1";

interface DoctorHeaderData {
  doctor_name?: string;
  doctor_id?: number;
  room_number?: string | number;
  room_name?: string;
  specializations?: string | null;
}

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [doctor, setDoctor] = useState<DoctorHeaderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDoctor = async () => {
      try {
        const response = await doctorService.getToday();

        if (!mounted) return;
        const data = response?.data;

        if (data) {
          setDoctor({
            doctor_name: data.doctor_name,
            doctor_id: data.doctor_id,
            room_number: data.room_number,
            room_name: data.room_name,
            specializations: data.specializations,
          });
        }
      } catch (error) {
        console.error("Failed to load doctor information:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDoctor();

    return () => {
      mounted = false;
    };
  }, []);

  const userName = loading
    ? "Doctor"
    : doctor?.doctor_name || "Doctor";

  const meta =
    doctor?.room_number && doctor?.specializations
      ? `Room ${doctor.room_number} · ${doctor.specializations}`
      : doctor?.room_number
        ? `Room ${doctor.room_number}`
        : doctor?.specializations || "";

  return (
    <AppShell
      role="doctor"
      userName={userName}
      meta={meta}
    >
      {children}
    </AppShell>
  );
}