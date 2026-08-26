"use client";

import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Menu,
  User as UserIcon,
} from "lucide-react";
import { useState } from "react";

import { ROLE_LABEL } from "@/lib/nav";
import type { Role } from "@/lib/types";
import { useHospital } from "@/lib/store";
import MobileSidebar from "./MobileSidebar";

export default function Header({
  role,
  userName,
  meta,
  notificationHref,
}: {
  role: Role;
  userName: string;
  meta?: string;
  notificationHref?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { notifications, currentPatientId } = useHospital();

  const unread =
    role === "patient"
      ? notifications.filter(
          (n) =>
            n.patientId === currentPatientId &&
            !n.read,
        ).length
      : 0;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-panel/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          {/* LEFT */}
          <div className="flex min-w-0 items-center gap-3">
            {/* MOBILE MENU */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-slate-600 hover:bg-teal-50 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={17} />
            </button>

            {/* USER INFO */}
            <div className="min-w-0">
              <p className="truncate font-display text-[15px] font-semibold text-ink">
                {userName}
              </p>

              <p className="truncate text-xs text-slate-500">
                {meta ?? ROLE_LABEL[role]}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* NOTIFICATIONS */}
            {notificationHref && (
              <Link
                href={notificationHref}
                className="relative grid h-9 w-9 place-items-center rounded-lg border border-line text-slate-600 hover:bg-teal-50"
                aria-label="Notifications"
              >
                <Bell size={17} />

                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </Link>
            )}

            {/* USER MENU */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setMenuOpen((value) => !value)
                }
                className="flex items-center gap-2 rounded-lg border border-line py-1 pl-1 pr-2 hover:bg-teal-50 sm:pr-3"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-teal-800 text-xs font-bold text-white">
                  {userName?.charAt(0)?.toUpperCase() || "U"}
                </span>

                <span className="hidden max-w-[140px] truncate text-xs font-semibold text-ink sm:block">
                  {userName}
                </span>

                <ChevronDown
                  size={14}
                  className="text-slate-400"
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 z-40 mt-2 w-48 rounded-xl border border-line bg-panel py-1.5 shadow-lg">
                  {/* PROFILE */}
                  <Link
                    href={
                      role === "patient"
                        ? "/patient/profile"
                        : "#"
                    }
                    className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-600 hover:bg-teal-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <UserIcon size={15} />
                    Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE SIDEBAR */}
      <MobileSidebar
        role={role}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </>
  );
}