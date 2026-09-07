"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { TextField, SelectField } from "@/components/forms/Field";
import { useToast } from "@/components/common/Toast";
import { login } from "@/services/authservice";
import { Eye, EyeOff } from "lucide-react";
type Tab = "patient" | "staff";

export default function LoginPage() {
  const router = useRouter();
  const { show } = useToast();

  const [tab, setTab] = useState<Tab>("patient");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [staffRole, setStaffRole] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const next: Record<string, string> = {};

    // =========================
    // FRONTEND VALIDATION
    // =========================

    const loginValue = mobile.replace(/\s/g, "");

    if (!loginValue) {
      next.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(loginValue)) {
      next.mobile = "Enter a valid 10-digit mobile number";
    }

    if (!password.trim()) {
      next.password = "Password is required";
    }

    if (tab === "staff" && !staffRole) {
      next.staffRole = "Select your role to continue";
    }

    setErrors(next);

    if (Object.keys(next).length) {
      return;
    }

    handleLogin(loginValue);
  }

  async function handleLogin(loginValue: string) {
    try {
      setLoading(true);

      // =========================
      // LOGIN API
      // =========================

      const response = await login({
        login: loginValue,
        password,
      });

      // =========================
      // SUCCESS
      // =========================

      if (response.success) {
        const token = response.data?.token;
        const role = response.data?.role;

        if (!token) {
          show("error", "Login successful but token was not received.");
          return;
        }

        // =========================
        // SAVE AUTH DATA
        // =========================

        localStorage.setItem("token", token);

        if (role) {
          localStorage.setItem("role", role);
        }

        if (response.data?.profile) {
          localStorage.setItem(
            "profile",
            JSON.stringify(response.data.profile),
          );
        }

        show("success", response.message || "Logged in successfully.");

        // =========================
        // ROLE BASED REDIRECT
        // =========================

        if (role === "PATIENT") {
          router.push("/patient/dashboard");
          return;
        }

        if (role === "ADMIN") {
          router.push("/admin/dashboard");
          return;
        }

        if (role === "DOCTOR") {
          router.push("/doctor/dashboard");
          return;
        }
        if (role === "PHARMACIST") {
          router.push("/clinic/dashboard");
          return;
        }

        show("error", "Your account role is not supported.");

        return;
      }

      show("error", response?.message || "Login failed.");
    } catch (error: any) {
      // =========================
      // API ERROR
      // =========================

      const message =
        error?.response?.data?.message ||
        "Login failed. Please check your credentials.";

      show("error", message);
    } finally {
      setLoading(false);
    }
  }

  function handleTabChange(value: Tab) {
    setTab(value);

    // Clear errors
    setErrors({});

    // Reset staff role
    if (value === "patient") {
      setStaffRole("");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Welcome back</h1>

      <p className="text-sm text-slate-500 mt-1.5">
        Log in to continue to YD Hospital OPD system.
      </p>

      {/* =========================
          LOGIN TYPE
      ========================= */}

      <div className="flex bg-teal-50 border border-line rounded-xl p-1 mt-6 mb-5">
        {(["patient", "staff"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTabChange(t)}
            className={`flex-1 text-sm font-semibold rounded-lg py-2 capitalize transition-colors ${
              tab === t ? "bg-panel text-teal-800 shadow-sm" : "text-slate-500"
            }`}
          >
            {t === "patient" ? "Patient" : "Hospital staff"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* =========================
            MOBILE
        ========================= */}

        <TextField
          id="mobile"
          label="Mobile number"
          placeholder="98765 43210"
          value={mobile}
          onChange={(e) => {
            setMobile(e.target.value);

            if (errors.mobile) {
              setErrors((prev) => {
                const updated = { ...prev };
                delete updated.mobile;
                return updated;
              });
            }
          }}
          error={errors.mobile}
          required
          inputMode="numeric"
        />
{/* =========================
    PASSWORD
========================= */}

<div className="relative">
  <TextField
    id="password"
    label="Password"
    type={showPassword ? "text" : "password"}
    placeholder="••••••••"
    value={password}
    onChange={(e) => {
      setPassword(e.target.value);

      if (errors.password) {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated.password;
          return updated;
        });
      }
    }}
    error={errors.password}
    required
  />

  <button
    type="button"
    onClick={() => setShowPassword((prev) => !prev)}
    tabIndex={-1}
    className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>

        {/* =========================
            STAFF ROLE
        ========================= */}

        {tab === "staff" && (
          <SelectField
            id="staffRole"
            label="Login as"
            value={staffRole}
            onChange={(e) => {
              setStaffRole(e.target.value);

              if (errors.staffRole) {
                setErrors((prev) => {
                  const updated = { ...prev };
                  delete updated.staffRole;
                  return updated;
                });
              }
            }}
            error={errors.staffRole}
            required
            options={[
              {
                value: "admin",
                label: "Admin",
              },
              {
                value: "doctor",
                label: "Doctor",
              },
              {
                value: "pharmacist",
                label: "Medical Shop",
              },
            ]}
            hint="Select the account type assigned to you by the hospital."
          />
        )}

        {/* =========================
            FORGOT PASSWORD
        ========================= */}

        <div className="flex justify-end mb-5">
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-teal-800 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* =========================
            LOGIN BUTTON
        ========================= */}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-teal-800 text-white font-semibold text-sm rounded-xl py-3 hover:bg-teal-900 disabled:opacity-70"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogIn size={16} />
          )}

          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      {/* =========================
          PATIENT REGISTER
      ========================= */}

      <p className="text-sm text-slate-500 text-center mt-6">
        New patient?{" "}
        <Link
          href="/register"
          className="font-semibold text-teal-800 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
