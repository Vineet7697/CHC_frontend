import Link from "next/link";
import { Activity } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-teal-950 flex flex-col">
      <div className="flex-1 grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between p-12 scanline bg-gradient-to-b from-teal-950 to-[#071F1E] text-white">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/10 text-amber-500">
              <Activity size={18} strokeWidth={2.4} />
            </span>
            <span>
              <p className="font-display font-bold text-[15px] leading-tight">
                YD Hospital
              </p>
              <p className="text-[11px] text-teal-200/70 leading-tight">
                OPD &amp; Medicine Management
              </p>
            </span>
          </Link>

          {/* Illustration */}
          <div className="flex-1 flex items-center justify-center py-10">
            <img
              src="/aushdham6.png"
              alt="Aushdham"
              className="w-100 h-100 object-contain rounded-lg"
            />
          </div>

          <p className="text-xs text-teal-200/50">
            © 2026 YD District Hospital · Government OPD System
          </p>
        </div>

        <div className="bg-paper flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm">
            <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-8">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-teal-800 text-amber-500">
                <Activity size={18} strokeWidth={2.4} />
              </span>
              <span>
                <p className="font-display font-bold text-[15px] leading-tight text-ink">
                  YD Hospital
                </p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  OPD Management
                </p>
              </span>
            </Link>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
