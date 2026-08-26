"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { TextField, SelectField } from "@/components/forms/Field";
import { useToast } from "@/components/common/Toast";
import { registerPatient } from "@/services/authservice";

export default function RegisterPage() {
  const router = useRouter();
  const { show } = useToast();

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    mobile: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));

    // Field change hone par us field ka old error hata do
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const next: Record<string, string> = {};

    // =========================
    // FRONTEND VALIDATION
    // =========================

    if (!form.name.trim()) {
      next.name = "Full name is required";
    }

    if (!form.age.trim()) {
      next.age = "Age is required";
    } else if (
      Number(form.age) <= 0 ||
      Number(form.age) > 120
    ) {
      next.age = "Enter a valid age";
    }

    if (!form.gender) {
      next.gender = "Select a gender";
    }

    const mobile = form.mobile.replace(/\s/g, "");

    if (!/^\d{10}$/.test(mobile)) {
      next.mobile = "Enter a valid 10-digit mobile number";
    }

    if (form.password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }

    setErrors(next);

    if (Object.keys(next).length) {
      return;
    }

    // =========================
    // API CALL
    // =========================

    try {
      setLoading(true);

      const response = await registerPatient({
        name: form.name.trim(),
        age: Number(form.age),
        gender: form.gender,
        mobile,
        password: form.password,
      });

      // =========================
      // SUCCESS
      // =========================

      if (response.success) {
        // Backend registration ke baad token de raha hai
        const token = response.data?.token;

        if (token) {
          localStorage.setItem("token", token);
        }

        show(
          "success",
          response.message || "Account created successfully."
        );

        router.push("/login");
      }
    } catch (error: any) {
      // =========================
      // API ERROR
      // =========================

      const message =
        error?.response?.data?.message ||
        "Registration failed. Please try again.";

      show("error", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">
        Create your account
      </h1>

      <p className="text-sm text-slate-500 mt-1.5">
        Register once — use it every time you visit the hospital.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6">
        <TextField
          id="name"
          label="Full name"
          placeholder="Rahul Kumar"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          error={errors.name}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="age"
            label="Age"
            placeholder="32"
            value={form.age}
            onChange={(e) => update("age", e.target.value)}
            error={errors.age}
            required
            inputMode="numeric"
          />

          <SelectField
            id="gender"
            label="Gender"
            value={form.gender}
            onChange={(e) => update("gender", e.target.value)}
            error={errors.gender}
            required
            options={[
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Other", label: "Other" },
            ]}
          />
        </div>

        <TextField
          id="mobile"
          label="Mobile number"
          placeholder="98765 43210"
          value={form.mobile}
          onChange={(e) => update("mobile", e.target.value)}
          error={errors.mobile}
          required
          inputMode="numeric"
        />

        <TextField
          id="password"
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          error={errors.password}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-teal-800 text-white font-semibold text-sm rounded-xl py-3 hover:bg-teal-900 disabled:opacity-70 mt-2"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <UserPlus size={16} />
          )}

          {loading
            ? "Creating account..."
            : "Create account"}
        </button>
      </form>

      <p className="text-sm text-slate-500 text-center mt-6">
        Already registered?{" "}
        <Link
          href="/login"
          className="font-semibold text-teal-800 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}