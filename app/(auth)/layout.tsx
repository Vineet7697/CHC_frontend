import Link from "next/link";
import { Activity } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-teal-950 flex flex-col">
      <div className="flex-1 grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between p-12 scanline bg-gradient-to-b from-teal-950 to-[#071F1E] text-white">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/10 text-amber-500">
              <Activity size={18} strokeWidth={2.4} />
            </span>
            <span>
              <p className="font-display font-bold text-[15px] leading-tight">YD Hospital</p>
              <p className="text-[11px] text-teal-200/70 leading-tight">OPD &amp; Medicine Management</p>
            </span>
          </Link>

          {/* Illustration */}
          <div className="flex-1 flex items-center justify-center py-10">
            <svg
              width="320"
              height="320"
              viewBox="0 0 320 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="max-w-full h-auto"
            >
              {/* Outer glow ring */}
              <circle cx="160" cy="160" r="140" stroke="white" strokeOpacity="0.06" strokeWidth="1.5" />
              <circle cx="160" cy="160" r="110" stroke="white" strokeOpacity="0.08" strokeWidth="1.5" />

              {/* Dashed orbit */}
              <circle
                cx="160"
                cy="160"
                r="128"
                stroke="#F59E0B"
                strokeOpacity="0.35"
                strokeWidth="1.2"
                strokeDasharray="4 8"
              />

              {/* Card / clipboard base */}
              <rect x="95" y="90" width="130" height="160" rx="14" fill="white" fillOpacity="0.06" />
              <rect x="95" y="90" width="130" height="160" rx="14" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" />

              {/* Clip on top */}
              <rect x="140" y="80" width="40" height="16" rx="6" fill="#F59E0B" fillOpacity="0.9" />

              {/* Lines representing text */}
              <rect x="115" y="120" width="70" height="6" rx="3" fill="white" fillOpacity="0.25" />
              <rect x="115" y="136" width="90" height="6" rx="3" fill="white" fillOpacity="0.15" />
              <rect x="115" y="152" width="55" height="6" rx="3" fill="white" fillOpacity="0.15" />

              {/* Pulse / heartbeat line */}
              <polyline
                points="110,190 130,190 140,172 150,208 160,190 180,190 190,172 200,208 210,190 220,190"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Medical cross badge */}
              <circle cx="230" cy="90" r="24" fill="#F59E0B" />
              <rect x="222" y="80" width="16" height="20" rx="2" fill="#042f2e" />
              <rect x="216" y="86" width="28" height="8" rx="2" fill="#042f2e" />

              {/* Small floating dots */}
              <circle cx="80" cy="230" r="4" fill="white" fillOpacity="0.3" />
              <circle cx="245" cy="210" r="3" fill="white" fillOpacity="0.25" />
              <circle cx="95" cy="70" r="3" fill="#F59E0B" fillOpacity="0.6" />
            </svg>
          </div>

          <p className="text-xs text-teal-200/50">© 2026 YD District Hospital · Government OPD System</p>
        </div>

        <div className="bg-paper flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm">
            <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-8">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-teal-800 text-amber-500">
                <Activity size={18} strokeWidth={2.4} />
              </span>
              <span>
                <p className="font-display font-bold text-[15px] leading-tight text-ink">YD Hospital</p>
                <p className="text-[11px] text-slate-500 leading-tight">OPD Management</p>
              </span>
            </Link>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}