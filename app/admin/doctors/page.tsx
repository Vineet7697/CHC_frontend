"use client";

import { useEffect, useState } from "react";

import { Plus, Pencil, UserX, UserCheck, RefreshCw } from "lucide-react";

import { Panel } from "@/components/cards/Card";
import DataTable, { Column } from "@/components/tables/DataTable";
import StatusBadge from "@/components/badges/StatusBadge";
import { Modal, ConfirmDialog } from "@/components/modals/Modal";
import { TextField } from "@/components/forms/Field";
import { useToast } from "@/components/common/Toast";

import {
  getDoctors,
  addDoctor,
  updateDoctor,
} from "@/services/adminservice";

import type { Doctor } from "@/lib/types";

const SPECIALIZATIONS = [
  "Dermatology",
  "Cardiology",
  "Orthopedics",
  "ENT",
  "General Medicine",
  "Pediatrics",
];

const emptyForm = {
  code: "",
  name: "",
  qualification: "",
  specialization: "",
  mobile: "",
  email: "",
  password: "",
};

export default function AdminDoctorsPage() {
  const { show } = useToast();

  // ==========================================
  // STATE
  // ==========================================

  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [addOpen, setAddOpen] = useState(false);

  const [editing, setEditing] = useState<Doctor | null>(null);

  const [toggling, setToggling] = useState<Doctor | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ==========================================
  // LOAD DOCTORS
  // ==========================================

  const loadDoctors = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getDoctors();

      const data = response?.data ?? response?.doctors ?? response;

      const list = Array.isArray(data) ? data : [];

      const normalizedDoctors: Doctor[] = list.map((doctor: any) => ({
        id: doctor.id,

        code:
          doctor.code ??
          doctor.doctor_code ??
          doctor.doctorCode ??
          "",

        name:
          doctor.name ??
          doctor.full_name ??
          doctor.fullName ??
          "",

        qualification: doctor.qualification ?? "",

        specialization: doctor.specialization ?? "",

        mobile:
          doctor.mobile ??
          doctor.mobile_number ??
          doctor.mobileNumber ??
          "",

        email: doctor.email ?? "",

        status:
          doctor.status === "INACTIVE"
            ? "INACTIVE"
            : "ACTIVE",
      }));

      setDoctors(normalizedDoctors);
    } catch (error: any) {
      console.error("Get doctors error:", error);

      show(
        "error",
        error?.response?.data?.message ||
          "Failed to load doctors.",
      );

      setDoctors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadDoctors();
  }, []);

  // ==========================================
  // VALIDATION
  // ==========================================

  function validate() {
    const next: Record<string, string> = {};

    if (!form.code.trim()) {
      next.code = "Doctor code is required";
    }

    if (!form.name.trim()) {
      next.name = "Doctor name is required";
    }

    if (!form.qualification.trim()) {
      next.qualification = "Qualification is required";
    }

    if (!form.specialization.trim()) {
      next.specialization = "Specialization is required";
    }

    const mobile = form.mobile.replace(/\s/g, "");

    if (!/^\d{10}$/.test(mobile)) {
      next.mobile = "Enter a valid 10-digit mobile number";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = "Enter a valid email";
    }

    // Password is required only while ADDING doctor
    if (!editing) {
      if (!form.password.trim()) {
        next.password = "Password is required";
      } else if (form.password.length < 6) {
        next.password =
          "Password must contain at least 6 characters";
      }
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  }

  // ==========================================
  // ADD DOCTOR
  // ==========================================

  async function handleAdd() {
    if (!validate()) return;

    try {
      setSaving(true);

      const mobile = form.mobile.replace(/\s/g, "");

      const response = await addDoctor({
        doctorCode: form.code.trim(),
        name: form.name.trim(),
        qualification: form.qualification.trim(),
        specialization: form.specialization.trim(),
        mobile,
        email: form.email.trim(),
        password: form.password,
      });

      show(
        "success",
        response?.message ||
          `${form.name} registered successfully.`,
      );

      setAddOpen(false);

      setForm(emptyForm);

      setErrors({});

      await loadDoctors(true);
    } catch (error: any) {
      console.error("Add doctor error:", error);

      show(
        "error",
        error?.response?.data?.message ||
          "Failed to register doctor.",
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // OPEN EDIT
  // ==========================================

  function openEdit(d: Doctor) {
    setEditing(d);

    setForm({
      code: d.code,
      name: d.name,
      qualification: d.qualification,
      specialization: d.specialization,
      mobile: d.mobile,
      email: d.email,
      password: "",
    });

    setErrors({});
  }

  // ==========================================
  // UPDATE DOCTOR
  // ==========================================

  async function handleUpdate() {
    if (!editing || !validate()) {
      return;
    }

    try {
      setSaving(true);

      await updateDoctor(editing.id, {
        name: form.name.trim(),
        qualification: form.qualification.trim(),
        specialization: form.specialization.trim(),
        mobile: form.mobile.replace(/\s/g, ""),
        email: form.email.trim(),
      });

      show(
        "success",
        `${form.name}'s details updated.`,
      );

      setEditing(null);

      setForm(emptyForm);

      setErrors({});

      await loadDoctors(true);
    } catch (error: any) {
      console.error("Update doctor error:", error);

      show(
        "error",
        error?.response?.data?.message ||
          "Failed to update doctor.",
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // TOGGLE DOCTOR STATUS
  // ==========================================

  async function handleToggleDoctor() {
    if (!toggling) return;

    try {
      setSaving(true);

      const newStatus =
        toggling.status === "ACTIVE"
          ? "INACTIVE"
          : "ACTIVE";

      await updateDoctor(toggling.id, {
        status: newStatus,
      });

      setDoctors((prev) =>
        prev.map((doctor) =>
          doctor.id === toggling.id
            ? {
                ...doctor,
                status: newStatus,
              }
            : doctor,
        ),
      );

      show(
        "success",
        `${toggling.name} ${
          newStatus === "INACTIVE"
            ? "deactivated"
            : "reactivated"
        }.`,
      );

      setToggling(null);
    } catch (error: any) {
      console.error(
        "Toggle doctor error:",
        error,
      );

      show(
        "error",
        error?.response?.data?.message ||
          "Failed to update doctor status.",
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // TABLE COLUMNS
  // ==========================================

  const columns: Column<Doctor>[] = [
    {
      header: "Code",
      accessor: (d) => (
        <span className="text-slate-400 font-mono text-xs">
          {d.code}
        </span>
      ),
    },

    {
      header: "Name",
      accessor: (d) => (
        <span className="font-medium text-ink">
          {d.name}
        </span>
      ),
    },

    {
      header: "Qualification",
      accessor: (d) => d.qualification,
    },

    {
      header: "Specialization",
      accessor: (d) => d.specialization,
    },

    {
      header: "Mobile",
      accessor: (d) => d.mobile,
    },

    {
      header: "Status",
      accessor: (d) => (
        <StatusBadge status={d.status} />
      ),
    },

    {
      header: "Actions",

      accessor: (d) => (
        <div className="flex gap-1.5">

          {/* EDIT */}

          <button
            type="button"
            onClick={() => openEdit(d)}
            aria-label={`Edit ${d.name}`}
            className="w-8 h-8 grid place-items-center rounded-lg border border-line text-slate-600 hover:bg-teal-50"
          >
            <Pencil size={13} />
          </button>

          {/* ACTIVE / INACTIVE */}

          <button
            type="button"
            onClick={() => setToggling(d)}
            disabled={saving}
            aria-label={
              d.status === "ACTIVE"
                ? `Deactivate ${d.name}`
                : `Reactivate ${d.name}`
            }
            className={`w-8 h-8 grid place-items-center rounded-lg border border-line hover:bg-teal-50 disabled:opacity-50 ${
              d.status === "ACTIVE"
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {d.status === "ACTIVE" ? (
              <UserX size={13} />
            ) : (
              <UserCheck size={13} />
            )}
          </button>

        </div>
      ),
    },
  ];

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="space-y-6">

        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Doctors
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage doctor profiles and specializations.
          </p>
        </div>

        <Panel>
          <div className="py-16 text-center">

            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-teal-700"
            />

            <p className="text-sm text-slate-500 mt-3">
              Loading doctors...
            </p>

          </div>
        </Panel>

      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Doctors
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage doctor profiles and specializations.
          </p>
        </div>

        <div className="flex items-center gap-2">

          {/* REFRESH */}

          <button
            type="button"
            onClick={() => loadDoctors(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 border border-line bg-white text-slate-700 text-sm font-semibold rounded-lg px-3 py-2.5 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            Refresh
          </button>

          {/* ADD */}

          <button
            type="button"
            onClick={() => {
              setForm(emptyForm);
              setErrors({});
              setAddOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-teal-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-teal-900 shrink-0"
          >
            <Plus size={15} />

            Add doctor
          </button>

        </div>

      </div>

      {/* TABLE */}

      <Panel className="!p-0">

        <DataTable
          rows={doctors}
          rowKey={(d) => d.id}
          columns={columns}
          searchKeys={(d) =>
            `${d.name} ${d.code} ${d.specialization}`
          }
          searchPlaceholder="Search doctors..."
          filters={[
            {
              label: "All",
              value: "ALL",
            },
            {
              label: "Active",
              value: "ACTIVE",
            },
            {
              label: "Inactive",
              value: "INACTIVE",
            },
          ]}
          filterFn={(d, v) =>
            v === "ALL" || d.status === v
          }
          emptyTitle="No doctors found"
        />

      </Panel>

      {/* ==========================================
          ADD DOCTOR MODAL
      ========================================== */}

      <Modal
        open={addOpen}
        onClose={() =>
          !saving && setAddOpen(false)
        }
        title="Add doctor"
        subtitle="Register a new doctor profile and login account."
      >

        <TextField
          id="code"
          label="Doctor code"
          placeholder="DOC-045"
          value={form.code}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              code: e.target.value,
            }))
          }
          error={errors.code}
          required
        />

        <TextField
          id="name"
          label="Doctor name"
          placeholder="Dr. Full Name"
          value={form.name}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              name: e.target.value,
            }))
          }
          error={errors.name}
          required
        />

        <TextField
          id="qualification"
          label="Qualification"
          placeholder="MD, MS, etc."
          value={form.qualification}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              qualification: e.target.value,
            }))
          }
          error={errors.qualification}
          required
        />

        <TextField
          id="specialization"
          label="Specialization"
          list="spec-list"
          value={form.specialization}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              specialization: e.target.value,
            }))
          }
          error={errors.specialization}
          required
        />

        <datalist id="spec-list">
          {SPECIALIZATIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>

        <TextField
          id="mobile"
          label="Mobile"
          placeholder="98765 43210"
          value={form.mobile}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              mobile: e.target.value,
            }))
          }
          error={errors.mobile}
          required
        />

        <TextField
          id="email"
          label="Email"
          type="email"
          placeholder="doctor@ydhospital.in"
          value={form.email}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              email: e.target.value,
            }))
          }
          error={errors.email}
          required
        />

        {/* DOCTOR LOGIN PASSWORD */}

        <TextField
          id="password"
          label="Login password"
          type="password"
          placeholder="Enter temporary password"
          value={form.password}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              password: e.target.value,
            }))
          }
          error={errors.password}
          hint="This password will be used by the doctor to log in."
          required
        />

        <div className="flex gap-2.5 mt-2">

          <button
            type="button"
            onClick={() =>
              !saving && setAddOpen(false)
            }
            className="flex-1 text-sm font-semibold border border-line rounded-lg py-2.5 text-slate-600 hover:bg-teal-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAdd}
            disabled={saving}
            className="flex-1 text-sm font-semibold bg-teal-800 text-white rounded-lg py-2.5 hover:bg-teal-900 disabled:opacity-50"
          >
            {saving
              ? "Registering..."
              : "Register doctor"}
          </button>

        </div>

      </Modal>

      {/* ==========================================
          EDIT DOCTOR MODAL
      ========================================== */}

      <Modal
        open={!!editing}
        onClose={() =>
          !saving && setEditing(null)
        }
        title="Edit doctor"
        subtitle={editing?.name}
      >

        <TextField
          id="ename"
          label="Doctor name"
          value={form.name}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              name: e.target.value,
            }))
          }
          error={errors.name}
          required
        />

        <TextField
          id="equalification"
          label="Qualification"
          value={form.qualification}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              qualification: e.target.value,
            }))
          }
          error={errors.qualification}
          required
        />

        <TextField
          id="especialization"
          label="Specialization"
          value={form.specialization}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              specialization: e.target.value,
            }))
          }
          error={errors.specialization}
          required
        />

        <TextField
          id="emobile"
          label="Mobile"
          value={form.mobile}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              mobile: e.target.value,
            }))
          }
          error={errors.mobile}
          required
        />

        <TextField
          id="eemail"
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              email: e.target.value,
            }))
          }
          error={errors.email}
          required
        />

        <div className="flex gap-2.5 mt-2">

          <button
            type="button"
            onClick={() =>
              !saving && setEditing(null)
            }
            className="flex-1 text-sm font-semibold border border-line rounded-lg py-2.5 text-slate-600 hover:bg-teal-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleUpdate}
            disabled={saving}
            className="flex-1 text-sm font-semibold bg-teal-800 text-white rounded-lg py-2.5 hover:bg-teal-900 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save changes"}
          </button>

        </div>

      </Modal>

      {/* ==========================================
          ACTIVATE / DEACTIVATE
      ========================================== */}

      <ConfirmDialog
        open={!!toggling}
        onClose={() =>
          !saving && setToggling(null)
        }
        onConfirm={handleToggleDoctor}
        title={
          toggling?.status === "ACTIVE"
            ? "Deactivate this doctor?"
            : "Reactivate this doctor?"
        }
        description={`${toggling?.name} will ${
          toggling?.status === "ACTIVE"
            ? "no longer be active in the hospital."
            : "become active again."
        }`}
        confirmLabel={
          toggling?.status === "ACTIVE"
            ? "Deactivate"
            : "Reactivate"
        }
        danger={
          toggling?.status === "ACTIVE"
        }
      />

    </div>
  );
}