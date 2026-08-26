import AppShell from "@/components/layout/AppShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="admin" userName="YD Hospital" meta="Hospital Administrator">
      {children}
    </AppShell>
  );
}
