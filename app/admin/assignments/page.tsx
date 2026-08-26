"use client";

import { useEffect, useState } from "react";
import { CalendarPlus } from "lucide-react";

import { Panel } from "@/components/cards/Card";
import DataTable, { Column } from "@/components/tables/DataTable";
import StatusBadge from "@/components/badges/StatusBadge";
import { SelectField, TextField } from "@/components/forms/Field";
import { useToast } from "@/components/common/Toast";

import {
  getDoctors,
  getRooms,
  getDoctorRoomAssignments,
  assignDoctorToRoom,
  type AdminDoctor,
  type AdminRoom,
  type DoctorRoomAssignment,
} from "@/services/adminservice";

export default function AdminAssignmentsPage() {
  const { show } = useToast();

  // ==============================
  // STATE
  // ==============================

  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [assignments, setAssignments] = useState<DoctorRoomAssignment[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    doctorId: "",
    roomId: "",
    date: "",
    startTime: "09:00",
    endTime: "13:00",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ==============================
  // LOAD DATA
  // ==============================

  const loadData = async () => {
    try {
      setLoading(true);

      const [doctorsResponse, roomsResponse, assignmentsResponse] =
        await Promise.all([
          getDoctors(),
          getRooms(),
          getDoctorRoomAssignments(),
        ]);

      // ==============================
      // DOCTORS
      // ==============================

      const doctorsData = doctorsResponse ?? [];

      setDoctors(doctorsData);

      // ==============================
      // ROOMS
      // ==============================

      // getRooms() already returns array
      setRooms(roomsResponse ?? []);

      // ==============================
      // ASSIGNMENTS
      // ==============================

      const assignmentsData = assignmentsResponse?.data ?? [];

      setAssignments(assignmentsData);
    } catch (error: any) {
      console.error("Failed to load assignment data:", error);

      show(
        "error",
        error?.response?.data?.message || "Failed to load assignment data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==============================
  // VALIDATION
  // ==============================

  const validate = () => {
    const next: Record<string, string> = {};

    if (!form.doctorId) {
      next.doctorId = "Select a doctor";
    }

    if (!form.roomId) {
      next.roomId = "Select a room";
    }

    if (!form.date) {
      next.date = "Select a date";
    }

    if (!form.startTime) {
      next.startTime = "Select a start time";
    }

    if (!form.endTime) {
      next.endTime = "Select an end time";
    }

    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      next.endTime = "End time must be after start time";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  // ==============================
  // ASSIGN DOCTOR
  // ==============================

  const handleAssign = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      await assignDoctorToRoom({
        doctorId: Number(form.doctorId),
        roomId: Number(form.roomId),
        assignmentDate: form.date,
        startTime: form.startTime,
        consultationStartTime: form.startTime,
        endTime: form.endTime,
      });

      show("success", "Doctor assigned to room successfully.");

      // Refresh assignments
      const response = await getDoctorRoomAssignments();

      setAssignments(response?.data ?? []);

      // Reset only doctor and room
      setForm((prev) => ({
        ...prev,
        doctorId: "",
        roomId: "",
      }));

      setErrors({});
    } catch (error: any) {
      console.error("Assign doctor error:", error);

      show(
        "error",
        error?.response?.data?.message || "Failed to assign doctor.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // TABLE COLUMNS
  // ==============================

  const columns: Column<DoctorRoomAssignment>[] = [
    {
      header: "Doctor",
      accessor: (assignment) => (
        <div>
          <p className="font-semibold text-ink">{assignment.doctor_name}</p>

          <p className="text-xs text-slate-500">
            Doctor ID: {assignment.doctor_id}
          </p>
        </div>
      ),
    },

    {
      header: "Room",
      accessor: (assignment) => (
        <div>
          <p className="font-semibold text-ink">
            Room {assignment.room_number}
          </p>

          {assignment.room_name && (
            <p className="text-xs text-slate-500">{assignment.room_name}</p>
          )}
        </div>
      ),
    },

    {
      header: "Date",
      accessor: (assignment) =>
        assignment.assignment_date
          ? new Date(assignment.assignment_date).toLocaleDateString("en-IN")
          : "-",
    },

    {
      header: "Start",
      accessor: (assignment) => assignment.start_time ?? "-",
    },

    {
      header: "End",
      accessor: (assignment) => assignment.end_time ?? "-",
    },

    {
      header: "Status",
      accessor: (assignment) => (
        <StatusBadge status={assignment.is_active ? "ACTIVE" : "INACTIVE"} />
      ),
    },
  ];

  // ==============================
  // RETURN
  // ==============================

  return (
    <div className="space-y-6">
      {/* ============================== */}
      {/* HEADER */}
      {/* ============================== */}

      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Doctor room assignments
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Assign doctors to OPD rooms with a schedule.
        </p>
      </div>

      {/* ============================== */}
      {/* NEW ASSIGNMENT */}
      {/* ============================== */}

      <Panel title="New assignment">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-x-3">
          {/* DOCTOR */}

          <SelectField
            id="doctorId"
            label="Doctor"
            value={form.doctorId}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                doctorId: e.target.value,
              }))
            }
            error={errors.doctorId}
            required
            options={doctors
              .filter((doctor) => {
                return (
                  doctor.status === "ACTIVE" ||
                  (doctor as any).is_active === true ||
                  (doctor as any).is_active === 1
                );
              })
              .map((doctor) => ({
                value: String(doctor.id),
                label: `${doctor.name}${
                  doctor.specialization ? ` · ${doctor.specialization}` : ""
                }`,
              }))}
          />

          {/* ROOM */}

          <SelectField
            id="roomId"
            label="Room"
            value={form.roomId}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                roomId: e.target.value,
              }))
            }
            error={errors.roomId}
            required
            options={rooms
              .filter((room) => room.is_active)
              .map((room) => ({
                value: String(room.id),
                label: `Room ${room.room_number}${
                  room.room_name ? ` · ${room.room_name}` : ""
                }`,
              }))}
          />

          {/* DATE */}

          <TextField
            id="date"
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                date: e.target.value,
              }))
            }
            error={errors.date}
            required
          />

          {/* START */}

          <TextField
            id="startTime"
            label="Start time"
            type="time"
            value={form.startTime}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                startTime: e.target.value,
              }))
            }
            error={errors.startTime}
            required
          />

          {/* END */}

          <TextField
            id="endTime"
            label="End time"
            type="time"
            value={form.endTime}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                endTime: e.target.value,
              }))
            }
            error={errors.endTime}
            required
          />
        </div>

        {/* ASSIGN BUTTON */}

        <button
          type="button"
          onClick={handleAssign}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-teal-800 text-white text-sm font-semibold rounded-lg px-5 py-2.5 hover:bg-teal-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CalendarPlus size={15} />
          {saving ? "Assigning..." : "Assign doctor"}
        </button>
      </Panel>

      {/* ============================== */}
      {/* ASSIGNMENTS TABLE */}
      {/* ============================== */}

      <Panel className="!p-0" title="All assignments">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading assignments...
          </div>
        ) : (
          <DataTable
            rows={assignments}
            rowKey={(assignment) => String(assignment.id)}
            columns={columns}
            searchKeys={(assignment) =>
              `${assignment.doctor_name} ${assignment.room_number} ${
                assignment.room_name ?? ""
              } ${assignment.assignment_date}`
            }
            searchPlaceholder="Search assignments..."
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
            filterFn={(assignment, value) => {
              if (value === "ALL") {
                return true;
              }

              if (value === "ACTIVE") {
                return Boolean(assignment.is_active);
              }

              if (value === "INACTIVE") {
                return !assignment.is_active;
              }

              return true;
            }}
            emptyTitle="No assignments yet"
          />
        )}
      </Panel>
    </div>
  );
}
