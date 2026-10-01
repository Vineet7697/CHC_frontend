"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { NAV, ROLE_LABEL } from "@/lib/nav";
import type { Role } from "@/lib/types";

import LogoutModal from "@/components/common/LogoutModal";

interface SidebarProps {
  role: Role;
}

export default function Sidebar({
  role,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [logoutOpen, setLogoutOpen] =
    useState(false);

  const items = NAV[role];

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    // Remove authentication
    localStorage.removeItem("token");

    // Remove optional auth/user data if present
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("patient");
    localStorage.removeItem("currentPatientId");

    // Close modal
    setLogoutOpen(false);

    // Redirect
    router.replace("/login");
  };

  // ======================================================
  // ACTIVE ROUTE
  // ======================================================

  const isActive = (href: string) => {
    if (href === `/${role}/dashboard`) {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  return (
    <>
      <aside className="hidden h-screen w-[274px] shrink-0 border-r border-line bg-panel lg:flex lg:flex-col">


        <div className="flex h-[92px] shrink-0 items-center gap-3 border-b border-line px-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-800 text-white">
            <span className="text-lg font-bold">
              Y
            </span>
          </div>

          <div className="min-w-0">
            <p className="font-display text-[15px] font-bold text-ink">
              YD Hospital
            </p>

            <p className="text-xs text-slate-500">
              OPD Management
            </p>
          </div>
        </div>

        {/* ==================================================
            NAVIGATION
        ================================================== */}

       <div className="flex-1 px-3 py-5 overflow-hidden">
          <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            {ROLE_LABEL[role]}
          </p>

          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-teal-800 text-white"
                      : "text-slate-600 hover:bg-teal-50 hover:text-teal-900",
                  ].join(" ")}
                >
                  <Icon
                    size={18}
                    className="shrink-0"
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ==================================================
            BOTTOM AREA
        ================================================== */}

        <div className="border-t border-line p-3">
          {/* LOGOUT */}
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut
              size={18}
              className="shrink-0"
            />

            <span>Logout</span>
          </button>

          {/* HOSPITAL INFO */}
          <div className="mt-3 rounded-xl border border-line bg-slate-50 p-3">
            <p className="text-xs font-semibold text-teal-800">
              District Hospital OPD
            </p>

            <p className="mt-0.5 text-[11px] text-slate-500">
              OPD & Medicine Management
            </p>
          </div>
        </div>
      </aside>

      {/* ==================================================
          LOGOUT MODAL
      ================================================== */}

      <LogoutModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}