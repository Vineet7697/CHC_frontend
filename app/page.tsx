import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Clock3,
  MapPin,
  Phone,
  HeartPulse,
  Stethoscope,
  Bone,
  Baby,
  Building2,
  CheckCircle2,
  Siren,
} from "lucide-react";

const SERVICES = [
  {
    icon: ShieldCheck,
    title: "Secure Access",
    desc: "Your hospital services are protected with secure digital access.",
  },
  {
    icon: Smartphone,
    title: "Easy to Use",
    desc: "Simple and accessible digital services for patients and staff.",
  },
  {
    icon: Clock3,
    title: "Save Time",
    desc: "Access essential hospital services without unnecessary paperwork.",
  },
];

const DEPARTMENTS = [
  {
    icon: Stethoscope,
    name: "General Medicine",
  },
  {
    icon: HeartPulse,
    name: "Cardiology",
  },
  {
    icon: Bone,
    name: "Orthopaedics",
  },
  {
    icon: Baby,
    name: "Paediatrics",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* ================= HEADER ================= */}
      <header className="border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 sm:px-6 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-teal-800 text-amber-500">
              <Activity size={18} strokeWidth={2.4} />
            </span>

            <span>
              <p className="font-display font-bold text-[15px] leading-tight text-ink">
                YD Hospital
              </p>

              <p className="text-[11px] text-slate-500 leading-tight">
                District Hospital
              </p>
            </span>
          </Link>

          {/* Login */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800 border border-teal-800/25 rounded-lg px-4 py-2 hover:bg-teal-50 transition"
          >
            Patient / Staff Login
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 pt-14 pb-16 lg:pt-20 lg:pb-20 grid lg:grid-cols-[1.05fr,0.95fr] gap-12 lg:gap-16 items-center">
        {/* Left */}
        <div>
          <p className="inline-flex items-center gap-2 text-teal-700 text-[11px] font-semibold bg-teal-100 rounded-full px-3 py-1.5 mb-5 uppercase tracking-wide">
            <Building2 size={13} />
            District Hospital
          </p>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-[58px] font-bold text-ink leading-[1.06] tracking-tight">
            Quality Healthcare,
            <br />
            <span className="text-teal-800">Closer to You.</span>
          </h1>

          <p className="text-slate-500 text-base sm:text-lg mt-6 max-w-xl leading-relaxed">
            Access essential hospital services through a simple and secure
            digital platform designed for patients and hospital staff.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-teal-800 text-white font-semibold text-sm rounded-xl px-5 py-3 hover:bg-teal-900 transition shadow-sm"
            >
              Patient Login
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 border border-line bg-white font-semibold text-sm rounded-xl px-5 py-3 text-ink hover:bg-teal-50 transition"
            >
              Staff Login
            </Link>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-8 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-teal-700" />
              Secure Platform
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-teal-700" />
              Digital Services
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-teal-700" />
              Easy Access
            </span>
          </div>
        </div>

        {/* Right visual */}
        <div className="relative">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-100 rounded-full blur-2xl opacity-60" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-teal-100 rounded-full blur-2xl opacity-70" />

          <div className="relative bg-white border border-line rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(15,70,65,0.08)]">
            {/* Hospital visual */}
            <div className="h-64 sm:h-72 rounded-2xl bg-gradient-to-br from-teal-50 to-slate-50 border border-teal-100 flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 rounded-3xl bg-teal-800 text-white grid place-items-center shadow-lg">
                  <Building2 size={46} strokeWidth={1.5} />
                </div>

                <p className="font-display font-bold text-xl mt-5 text-ink">
                  YD District Hospital
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Healthcare Services
                </p>
              </div>
            </div>

            {/* Info strip */}
            <div className="grid grid-cols-3 divide-x divide-line mt-5">
              <div className="text-center px-2">
                <p className="text-xs text-slate-400">Services</p>
                <p className="font-semibold text-sm mt-1">Digital</p>
              </div>

              <div className="text-center px-2">
                <p className="text-xs text-slate-400">Access</p>
                <p className="font-semibold text-sm mt-1">Secure</p>
              </div>

              <div className="text-center px-2">
                <p className="text-xs text-slate-400">Support</p>
                <p className="font-semibold text-sm mt-1">Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="border-y border-line bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Our Digital Services
            </p>

            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">
              Healthcare made simpler.
            </h2>

            <p className="text-slate-500 mt-3 leading-relaxed">
              A modern digital experience that makes accessing hospital
              services easier, faster and more convenient.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-10">
            {SERVICES.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.title}
                  className="rounded-2xl border border-line bg-paper p-6 hover:border-teal-200 hover:shadow-sm transition"
                >
                  <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-800 grid place-items-center">
                    <Icon size={21} />
                  </div>

                  <h3 className="font-display font-bold text-lg mt-5">
                    {service.title}
                  </h3>

                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= DEPARTMENTS ================= */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Healthcare Services
            </p>

            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">
              Medical Departments
            </h2>

            <p className="text-slate-500 mt-3 max-w-xl">
              Explore the healthcare departments available at YD District
              Hospital.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-9">
          {DEPARTMENTS.map((department) => {
            const Icon = department.icon;

            return (
              <div
                key={department.name}
                className="group rounded-2xl border border-line bg-white p-5 hover:border-teal-200 hover:shadow-sm transition"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-800 grid place-items-center group-hover:bg-teal-800 group-hover:text-white transition">
                  <Icon size={23} />
                </div>

                <h3 className="font-semibold text-sm sm:text-base mt-5">
                  {department.name}
                </h3>

                <div className="flex items-center gap-1 text-xs text-teal-700 mt-3">
                  Healthcare Services
                  <ArrowRight size={12} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section className="bg-teal-900 text-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              About YD Hospital
            </p>

            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3 leading-tight">
              Serving the community with accessible healthcare.
            </h2>

            <p className="text-teal-100/75 mt-5 leading-relaxed max-w-xl">
              YD District Hospital is committed to providing accessible,
              reliable and patient-focused healthcare services to the
              community through modern healthcare facilities and digital
              solutions.
            </p>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 mt-7 bg-white text-teal-900 font-semibold text-sm rounded-xl px-5 py-3 hover:bg-teal-50 transition"
            >
              Access Hospital Services
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-6">
              <HeartPulse size={25} className="text-amber-400" />
              <p className="font-semibold mt-5">Patient Focused</p>
              <p className="text-xs text-teal-100/60 mt-2 leading-relaxed">
                Services designed around patient convenience.
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-6">
              <ShieldCheck size={25} className="text-amber-400" />
              <p className="font-semibold mt-5">Secure</p>
              <p className="text-xs text-teal-100/60 mt-2 leading-relaxed">
                Secure digital access to hospital services.
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-6">
              <Smartphone size={25} className="text-amber-400" />
              <p className="font-semibold mt-5">Digital</p>
              <p className="text-xs text-teal-100/60 mt-2 leading-relaxed">
                Modern tools for easier access.
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-6">
              <Building2 size={25} className="text-amber-400" />
              <p className="font-semibold mt-5">Community</p>
              <p className="text-xs text-teal-100/60 mt-2 leading-relaxed">
                Healthcare for the local community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOSPITAL INFO ================= */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16">
        <div className="text-center max-w-xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Hospital Information
          </p>

          <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">
            Important Information
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-10">
          <div className="border border-line rounded-2xl p-6 bg-white">
            <Clock3 className="text-teal-800" size={23} />

            <p className="font-semibold mt-5">OPD Hours</p>

            <p className="text-sm text-slate-500 mt-2">
              Monday – Saturday
            </p>

            <p className="text-sm font-medium mt-1">
              9:00 AM – 4:00 PM
            </p>
          </div>

          <div className="border border-line rounded-2xl p-6 bg-white">
            <Siren className="text-teal-800" size={23} />

            <p className="font-semibold mt-5">Emergency Services</p>

            <p className="text-sm text-slate-500 mt-2">
              Emergency department
            </p>

            <p className="text-sm font-medium mt-1">
              Available 24 × 7
            </p>
          </div>

          <div className="border border-line rounded-2xl p-6 bg-white">
            <MapPin className="text-teal-800" size={23} />

            <p className="font-semibold mt-5">Hospital Location</p>

            <p className="text-sm text-slate-500 mt-2">
              YD District Hospital
            </p>

            <p className="text-sm font-medium mt-1">
              District Hospital Campus
            </p>
          </div>
        </div>
      </section>

      {/* ================= CONTACT STRIP ================= */}
      <section className="border-t border-line bg-slate-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <p className="font-semibold">Need assistance?</p>
            <p className="text-sm text-slate-500 mt-1">
              Contact the hospital help desk for assistance.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-teal-800">
            <Phone size={16} />
            Hospital Help Desk
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-line bg-paper">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-7 h-7 rounded-lg bg-teal-800 text-amber-500">
              <Activity size={14} />
            </span>

            <span className="font-semibold text-sm">
              YD District Hospital
            </span>
          </div>

          <p className="text-xs text-slate-500">
            © 2026 YD District Hospital · Government Healthcare Services
          </p>
        </div>
      </footer>
    </main>
  );
}