"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, X } from "lucide-react";
import { NAV, ROLE_LABEL } from "@/lib/nav";
import type { Role } from "@/lib/types";

export default function MobileSidebar({ role, open, onClose }: { role: Role; open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  if (!open) return null;
  const items = NAV[role];

  return (
    <div className="fixed inset-0 z-[80] lg:hidden">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-72 bg-panel border-r border-line flex flex-col">
        <div className="flex items-center justify-between px-5 py-5 border-b border-line">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-teal-800 text-amber-500">
              <Activity size={18} strokeWidth={2.4} />
            </span>
            <div>
              <p className="font-display font-bold text-[15px] leading-tight text-ink">YD Hospital</p>
              <p className="text-[11px] text-slate-500 leading-tight">{ROLE_LABEL[role]}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="text-slate-400">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {items.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active ? "bg-teal-800 text-white" : "text-slate-600 hover:bg-teal-50"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
