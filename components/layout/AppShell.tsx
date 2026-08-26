import React from "react";
import type { Role } from "@/lib/types";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileNav from "./MobileNav";

export default function AppShell({
  role,
  userName,
  meta,
  notificationHref,
  children,
}: {
  role: Role;
  userName: string;
  meta?: string;
  notificationHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar role={role} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header role={role} userName={userName} meta={meta} notificationHref={notificationHref} />
        <main className="flex-1 px-4 sm:px-6 py-6 pb-24 lg:pb-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
      <MobileNav role={role} />
    </div>
  );
}
