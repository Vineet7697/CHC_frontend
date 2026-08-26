import AppShell from "@/components/layout/AppShell";

export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="clinic" userName="Medical" meta="Pharmacist · Ground Floor Counter">
      {children}
    </AppShell>
  );
}
