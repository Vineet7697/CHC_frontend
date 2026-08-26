"use client";

import AppShell from "@/components/layout/AppShell";
import { useEffect, useState } from "react";
import { getMe } from "@/services/authservice";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatient();
  }, []);

  async function loadPatient() {
    try {
      const response = await getMe();

      if (response.success) {
        setPatient(response.data);
      }
    } catch (error) {
      console.error("Failed to load patient profile:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      role="patient"
      userName={
        loading
          ? "Loading..."
          : patient?.name || "Patient"
      }
      meta={patient?.patient_id}
      notificationHref="/patient/notifications"
    >
      {children}
    </AppShell>
  );
}