"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { TextField } from "@/components/forms/Field";

export default function ForgotPasswordPage() {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobile.replace(/\s/g, ""))) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 900);
  }

  if (sent) {
    return (
      <div className="text-center">
        <span className="grid place-items-center w-12 h-12 rounded-full bg-green-100 text-green-600 mx-auto mb-4">
          <CheckCircle2 size={22} />
        </span>
        <h1 className="font-display text-xl font-bold text-ink">Check your messages</h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          We&apos;ve sent a reset code to <span className="font-semibold text-ink">{mobile}</span>. Enter it in the app
          to set a new password.
        </p>
        <Link href="/login" className="inline-block mt-6 text-sm font-semibold text-teal-800 hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-800 mb-6">
        <ArrowLeft size={14} /> Back to login
      </Link>
      <h1 className="font-display text-2xl font-bold text-ink">Reset your password</h1>
      <p className="text-sm text-slate-500 mt-1.5">Enter your registered mobile number and we&apos;ll send a reset code.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6">
        <TextField id="mobile" label="Mobile number" placeholder="98765 43210" value={mobile} onChange={(e) => setMobile(e.target.value)} error={error} required inputMode="numeric" />
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-teal-800 text-white font-semibold text-sm rounded-xl py-3 hover:bg-teal-900 disabled:opacity-70"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
          {loading ? "Sending..." : "Send reset code"}
        </button>
      </form>
    </div>
  );
}
