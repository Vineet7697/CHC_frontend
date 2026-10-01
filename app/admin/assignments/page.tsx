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
  updateDoctorRoomAssignment,
  type AdminDoctor,
  type AdminRoom,
  type DoctorRoomAssignment,
} from "@/services/adminservice";

const DAY_NAMES = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export default function AdminAssignmentsPage() {
  const { show } = useToast();

  // ==============================
  // STATE
  // ==============================
  const [editingId, setEditingId] = useState<number | null>(null);
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

  const handleEdit = (assignment: DoctorRoomAssignment) => {
    setEditingId(assignment.id);

    setForm({
      doctorId: String(assignment.doctor_id),
      roomId: String(assignment.room_id),
      date: assignment.assignment_date
        ? String(assignment.assignment_date).split("T")[0]
        : "",
      startTime: assignment.start_time?.slice(0, 5) || "09:00",
      endTime: assignment.end_time?.slice(0, 5) || "13:00",
    });

    setErrors({});
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      if (editingId) {
        await updateDoctorRoomAssignment(editingId, {
          doctorId: Number(form.doctorId),
          roomId: Number(form.roomId),
          assignmentDate: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
        });

        show("success", "Assignment updated successfully.");
      } else {
        await assignDoctorToRoom({
          doctorId: Number(form.doctorId),
          roomId: Number(form.roomId),
          assignmentDate: form.date,
          startTime: form.startTime,
          consultationStartTime: form.startTime,
          endTime: form.endTime,
        });

        show("success", "Doctor assigned to room successfully.");
      }

      await loadData();

      setEditingId(null);

      setForm({
        doctorId: "",
        roomId: "",
        date: "",
        startTime: "09:00",
        endTime: "13:00",
      });

      setErrors({});
    } catch (error: any) {
      console.error("Save assignment error:", error);

      show(
        "error",
        error?.response?.data?.message || "Failed to save assignment.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // SELECTED DOCTOR
  // ==============================

  const selectedDoctor = doctors.find(
    (doctor) => String(doctor.id) === String(form.doctorId),
  );

  const getDateDayName = (date: string) => {
    if (!date) return null;

    const [year, month, day] = date.split("-").map(Number);

    if (!year || !month || !day) return null;

    return DAY_NAMES[new Date(year, month - 1, day).getDay()];
  };

  const selectedDateDay = getDateDayName(form.date);

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

    // ==========================================
    // DOCTOR WEEKLY SCHEDULE CHECK
    // ==========================================

    if (
      form.doctorId &&
      form.date &&
      selectedDoctor &&
      selectedDoctor.workingDays &&
      selectedDoctor.workingDays.length > 0 &&
      selectedDateDay &&
      !selectedDoctor.workingDays.includes(selectedDateDay)
    ) {
      next.date = `${selectedDoctor.name} is not available on ${selectedDateDay
        .charAt(0)
        .toUpperCase()}${selectedDateDay.slice(1).toLowerCase()}.`;
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
    {
      header: "Action",
      accessor: (assignment) => (
        <button
          type="button"
          onClick={() => handleEdit(assignment)}
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Edit
        </button>
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

      <Panel title={editingId ? "Edit assignment" : "New assignment"}>
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
                }${
                  doctor.workingDays?.length
                    ? ` · ${doctor.workingDays
                        .map(
                          (day) =>
                            day.charAt(0) +
                            day.slice(1).toLowerCase().slice(0, 2),
                        )
                        .join(", ")}`
                    : ""
                }`,
              }))}
          />

          {/* DOCTOR WORKING DAYS */}

          {selectedDoctor && (
            <div className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-2.5">
              <p className="text-xs font-semibold text-teal-800">
                Doctor working days
              </p>

              <p className="mt-1 text-sm text-teal-900">
                {selectedDoctor.workingDays?.length
                  ? selectedDoctor.workingDays
                      .map(
                        (day) =>
                          day.charAt(0) +
                          day.slice(1).toLowerCase().slice(0, 2),
                      )
                      .join(", ")
                  : "No weekly schedule configured"}
              </p>

              {form.date && selectedDateDay && (
                <p
                  className={`mt-1 text-xs font-medium ${
                    selectedDoctor.workingDays?.includes(selectedDateDay)
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {selectedDateDay.charAt(0) +
                    selectedDateDay.slice(1).toLowerCase()}{" "}
                  {selectedDoctor.workingDays?.includes(selectedDateDay)
                    ? "✓ Available"
                    : "✕ Not available"}
                </p>
              )}
            </div>
          )}

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
            min={new Date().toISOString().split("T")[0]}
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
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-teal-800 text-white text-sm font-semibold rounded-lg px-5 py-2.5 hover:bg-teal-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CalendarPlus size={15} />

          {saving
            ? editingId
              ? "Updating..."
              : "Assigning..."
            : editingId
              ? "Update assignment"
              : "Assign doctor"}
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
