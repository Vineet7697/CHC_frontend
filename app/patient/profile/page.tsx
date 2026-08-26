"use client";

import { useEffect, useState } from "react";
import { TextField } from "@/components/forms/Field";
import { Panel } from "@/components/cards/Card";
import { useToast } from "@/components/common/Toast";
import { Loader2, Save, RefreshCw } from "lucide-react";

import {
  getPatientProfile,
  updatePatientProfile,
} from "@/services/patientservice";

type Patient = {
  id: number | string;
  patientId: string;
  name: string;
  mobile: string;
  age: number;
  gender: string;
};

export default function PatientProfilePage() {
  const { show } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    age: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ========================================
  // LOAD PROFILE
  // ========================================

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);

      const response = await getPatientProfile();

      console.log("PATIENT PROFILE RESPONSE:", response);

      if (!response?.success || !response?.data) {
        show(
          "error",
          response?.message || "Unable to load patient profile.",
        );
        return;
      }

      const data = response.data;

      setPatient(data);

      setForm({
        name: data.name ?? "",
        mobile: data.mobile ?? "",
        age:
          data.age !== null && data.age !== undefined
            ? String(data.age)
            : "",
      });
    } catch (error: any) {
      console.error(
        "Patient profile API error:",
        error?.response?.data || error,
      );

      show(
        "error",
        error?.response?.data?.message ||
          "Unable to load patient profile.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // FORM CHANGE
  // ========================================

  function handleChange(
    field: "name" | "mobile" | "age",
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // ========================================
  // SAVE PROFILE
  // ========================================

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    // ----------------------------------------
    // NAME
    // ----------------------------------------

    const name = form.name.trim();

    if (!name) {
      show("error", "Please enter your full name.");
      return;
    }

    // ----------------------------------------
    // MOBILE
    // ----------------------------------------

    const mobile = form.mobile.trim();

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      show(
        "error",
        "Please enter a valid 10 digit mobile number.",
      );
      return;
    }

    // ----------------------------------------
    // AGE
    // ----------------------------------------

    const age = Number(form.age);

    if (
      !Number.isInteger(age) ||
      age < 1 ||
      age > 120
    ) {
      show(
        "error",
        "Age must be between 1 and 120.",
      );
      return;
    }

    try {
      setSaving(true);

      const response = await updatePatientProfile({
        name,
        mobile,
        age,
      });

      console.log(
        "UPDATE PROFILE RESPONSE:",
        response,
      );

      if (!response?.success) {
        show(
          "error",
          response?.message ||
            "Unable to update profile.",
        );
        return;
      }

      // ----------------------------------------
      // UPDATE LOCAL STATE
      // ----------------------------------------

      if (response.data) {
        setPatient(response.data);

        setForm({
          name: response.data.name ?? "",
          mobile: response.data.mobile ?? "",
          age:
            response.data.age !== null &&
            response.data.age !== undefined
              ? String(response.data.age)
              : "",
        });
      }

      show(
        "success",
        response.message ||
          "Profile updated successfully.",
      );
    } catch (error: any) {
      console.error(
        "Update patient profile error:",
        error?.response?.data || error,
      );

      show(
        "error",
        error?.response?.data?.message ||
          "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2
            size={17}
            className="animate-spin"
          />
          Loading profile...
        </div>
      </div>
    );
  }

  // ========================================
  // NO PATIENT
  // ========================================

  if (!patient) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Panel>
          <div className="text-center py-6">
            <p className="font-display font-semibold text-ink">
              Patient profile not found
            </p>

            <p className="text-sm text-slate-500 mt-1">
              We couldn't load your profile.
            </p>

            <button
              onClick={loadProfile}
              className="inline-flex items-center gap-2 mt-4 bg-teal-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-teal-900"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        </Panel>
      </div>
    );
  }

  // ========================================
  // PROFILE PAGE
  // ========================================

  return (
    <div className="max-w-lg space-y-6">

      {/* HEADER */}

      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          My profile
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Keep your details up to date for faster
          check-ins.
        </p>
      </div>

      <Panel>

        {/* PATIENT HEADER */}

        <div className="flex items-center gap-3.5 mb-5 pb-5 border-b border-line">

          <span className="grid place-items-center w-14 h-14 rounded-full bg-teal-800 text-white text-xl font-bold">
            {patient.name?.charAt(0)?.toUpperCase() || "P"}
          </span>

          <div>
            <p className="font-display font-semibold text-ink">
              {patient.name}
            </p>

            <p className="text-xs text-slate-500 mt-0.5">
              Patient ID · {patient.patientId}
            </p>
          </div>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSave}
          noValidate
        >

          {/* NAME */}

          <TextField
            id="name"
            label="Full name"
            value={form.name}
            onChange={(e) =>
              handleChange(
                "name",
                e.target.value,
              )
            }
            required
          />

          {/* AGE + GENDER */}

          <div className="grid grid-cols-2 gap-3">

            <TextField
              id="age"
              label="Age"
              value={form.age}
              onChange={(e) =>
                handleChange(
                  "age",
                  e.target.value.replace(
                    /\D/g,
                    "",
                  ),
                )
              }
              required
              inputMode="numeric"
            />

            <TextField
              id="gender"
              label="Gender"
              value={patient.gender || ""}
              disabled
            />

          </div>

          {/* MOBILE */}

          <TextField
            id="mobile"
            label="Mobile number"
            value={form.mobile}
            onChange={(e) =>
              handleChange(
                "mobile",
                e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10),
              )
            }
            required
            inputMode="numeric"
          />

          {/* SAVE */}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-teal-800 text-white text-sm font-semibold rounded-lg px-5 py-2.5 hover:bg-teal-900 disabled:opacity-70 mt-2"
          >
            {saving ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Save size={15} />
            )}

            {saving
              ? "Saving..."
              : "Save changes"}
          </button>

        </form>
      </Panel>
    </div>
  );
}