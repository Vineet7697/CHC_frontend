"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";
import type { Role } from "@/lib/types";

export default function MobileNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV[role].slice(0, 5);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-panel border-t border-line pb-[env(safe-area-inset-bottom)]">
      <div className="flex">
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium ${
                active ? "text-teal-800" : "text-slate-400"
              }`}
            >
              <Icon size={19} strokeWidth={active ? 2.4 : 2} />
              <span className="leading-none">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
