"use client";

import { useEffect, useState } from "react";

import { Plus, Pencil, DoorClosed, RefreshCw } from "lucide-react";

import { Panel } from "@/components/cards/Card";
import DataTable, { Column } from "@/components/tables/DataTable";

import StatusBadge from "@/components/badges/StatusBadge";

import { Modal, ConfirmDialog } from "@/components/modals/Modal";

import { SelectField, TextField } from "@/components/forms/Field";

import { useToast } from "@/components/common/Toast";

import {
  getRooms,
  addRoom,
  updateRoom,
  deleteRoom,
  type AdminRoom,
} from "@/services/adminservice";

const SPECIALIZATIONS = [
  "Dermatology",
  "Cardiology",
  "Orthopedics",
  "ENT",
  "General Medicine",
  "Pediatrics",
];

const emptyForm = {
  number: "",
  name: "",
  floor: "",
  specialization: "",
};

type RoomRow = AdminRoom & {
  status: "AVAILABLE" | "CLOSED";

  specialization?: string | null;

  doctor_id?: number | null;
  doctor_name?: string | null;

  assignment_id?: number | null;
  assignment_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  assignment_active?: number | boolean | null;

  doctorId?: number | null;
};

export default function AdminRoomsPage() {
  const { show } = useToast();

  const [rooms, setRooms] = useState<RoomRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [addOpen, setAddOpen] = useState(false);

  const [editing, setEditing] = useState<RoomRow | null>(null);

  const [toggling, setToggling] = useState<RoomRow | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ============================================
  // LOAD ROOMS
  // ============================================

  const loadRooms = async () => {
    try {
      setLoading(true);

      const data = await getRooms();

      const mappedRooms: RoomRow[] = data.map((room) => ({
        ...room,

        status: room.is_active ? "AVAILABLE" : "CLOSED",

        specialization: room.specialization || "",
        doctorId: room.doctor_id ?? null,
      }));

      setRooms(mappedRooms);
    } catch (error: any) {
      console.error("Failed to load rooms:", error);

      show("error", error?.response?.data?.message || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // ============================================
  // VALIDATION
  // ============================================

  function validate() {
    const next: Record<string, string> = {};

    if (!form.number.trim()) {
      next.number = "Room number is required";
    }

    if (!form.name.trim()) {
      next.name = "Room name is required";
    }

    if (!form.floor.trim()) {
      next.floor = "Floor is required";
    }

    if (!form.specialization) {
      next.specialization = "Select a specialization";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  }

  // ============================================
  // ADD ROOM
  // ============================================

  async function handleAdd() {
    if (!validate()) return;

    try {
      setSaving(true);

      await addRoom({
        roomNumber: form.number.trim(),
        roomName: form.name.trim(),
        floor: form.floor.trim(),
      });

      show("success", `Room ${form.number} added successfully.`);

      setAddOpen(false);
      setForm(emptyForm);
      setErrors({});

      await loadRooms();
    } catch (error: any) {
      console.error("Add room error:", error);

      show("error", error?.response?.data?.message || "Failed to add room");
    } finally {
      setSaving(false);
    }
  }

  // ============================================
  // OPEN EDIT
  // ============================================

  function openEdit(room: RoomRow) {
    setEditing(room);

    setForm({
      number: room.room_number || "",
      name: room.room_name || "",
      floor: room.floor || "",
      specialization: room.specialization || "",
    });

    setErrors({});
  }

  // ============================================
  // UPDATE ROOM
  // ============================================

  async function handleUpdate() {
    if (!editing || !validate()) return;

    try {
      setSaving(true);

      await updateRoom(editing.id, {
        roomNumber: form.number.trim(),
        roomName: form.name.trim(),
        floor: form.floor.trim(),
      });

      show("success", `Room ${form.number} updated successfully.`);

      setEditing(null);
      setForm(emptyForm);
      setErrors({});

      await loadRooms();
    } catch (error: any) {
      console.error("Update room error:", error);

      show("error", error?.response?.data?.message || "Failed to update room");
    } finally {
      setSaving(false);
    }
  }

  // ============================================
  // DEACTIVATE ROOM
  // ============================================

  async function handleDeactivate() {
    if (!toggling) return;

    try {
      setSaving(true);

      await deleteRoom(toggling.id);

      show("success", `Room ${toggling.room_number} deactivated successfully.`);

      setToggling(null);

      // Important:
      // backend changes is_active=false,
      // so reload the list
      await loadRooms();
    } catch (error: any) {
      console.error("Deactivate room error:", error);

      show(
        "error",
        error?.response?.data?.message || "Failed to deactivate room",
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================
  // TABLE COLUMNS
  // ============================================

  const columns: Column<RoomRow>[] = [
    {
      header: "Room number",

      accessor: (room) => (
        <span className="font-display font-bold text-ink">
          {room.room_number}
        </span>
      ),
    },

    {
      header: "Room name",

      accessor: (room) =>
        room.room_name || <span className="text-slate-400">—</span>,
    },

    {
      header: "Floor",

      accessor: (room) =>
        room.floor || <span className="text-slate-400">—</span>,
    },

    {
      header: "Assigned doctor",

      accessor: (room) =>
        room.doctor_name ? (
          <span className="font-semibold text-ink">{room.doctor_name}</span>
        ) : (
          <span className="text-slate-400">Unassigned</span>
        ),
    },

    {
      header: "Specialization",

      accessor: (room) =>
        room.specialization || <span className="text-slate-400">—</span>,
    },

    {
      header: "Status",

      accessor: (room) => <StatusBadge status={room.status} />,
    },

    {
      header: "Actions",

      accessor: (room) => (
        <div className="flex gap-1.5">
          {/* EDIT */}

          <button
            onClick={() => openEdit(room)}
            disabled={!room.is_active}
            aria-label={`Edit room ${room.room_number}`}
            className="w-8 h-8 grid place-items-center rounded-lg border border-line text-slate-600 hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Pencil size={13} />
          </button>

          {/* DEACTIVATE */}

          {room.is_active && (
            <button
              onClick={() => setToggling(room)}
              aria-label={`Deactivate room ${room.room_number}`}
              className="w-8 h-8 grid place-items-center rounded-lg border border-line text-red-600 hover:bg-red-50"
            >
              <DoorClosed size={13} />
            </button>
          )}
        </div>
      ),
    },
  ];

  // ============================================
  // UI
  // ============================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Rooms</h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage OPD rooms across the hospital.
          </p>
        </div>

        <div className="flex gap-2">
          {/* REFRESH */}

          <button
            onClick={loadRooms}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-line text-slate-700 text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          {/* ADD */}

          <button
            onClick={() => {
              setForm(emptyForm);
              setErrors({});
              setAddOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-teal-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-teal-900"
          >
            <Plus size={15} />
            Add room
          </button>
        </div>
      </div>

      {/* TABLE */}

      <Panel className="!p-0">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading rooms...
          </div>
        ) : (
          <DataTable
            rows={rooms}
            rowKey={(room) => String(room.id)}
            columns={columns}
            searchKeys={(room) =>
              `${room.room_number} ${room.room_name || ""} ${room.floor || ""}`
            }
            searchPlaceholder="Search rooms..."
            filters={[
              {
                label: "All",
                value: "ALL",
              },
              {
                label: "Available",
                value: "AVAILABLE",
              },
              {
                label: "Closed",
                value: "CLOSED",
              },
            ]}
            filterFn={(room, value) => value === "ALL" || room.status === value}
            emptyTitle="No rooms found"
          />
        )}
      </Panel>

      {/* ============================================
          ADD ROOM MODAL
      ============================================ */}

      <Modal
        open={addOpen}
        onClose={() => !saving && setAddOpen(false)}
        title="Add room"
        subtitle="Register a new OPD room."
      >
        <TextField
          id="number"
          label="Room number"
          placeholder="105"
          value={form.number}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              number: e.target.value,
            }))
          }
          error={errors.number}
          required
        />

        <TextField
          id="name"
          label="Room name"
          placeholder="Cardiology OPD"
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
          id="floor"
          label="Floor"
          placeholder="Ground Floor"
          value={form.floor}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              floor: e.target.value,
            }))
          }
          error={errors.floor}
          required
        />

        <SelectField
          id="specialization"
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
          options={SPECIALIZATIONS.map((s) => ({
            value: s,
            label: s,
          }))}
        />

        <div className="flex gap-2.5 mt-2">
          <button
            onClick={() => setAddOpen(false)}
            disabled={saving}
            className="flex-1 text-sm font-semibold border border-line rounded-lg py-2.5 text-slate-600 hover:bg-teal-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleAdd}
            disabled={saving}
            className="flex-1 text-sm font-semibold bg-teal-800 text-white rounded-lg py-2.5 hover:bg-teal-900 disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add room"}
          </button>
        </div>
      </Modal>

      {/* ============================================
          EDIT ROOM MODAL
      ============================================ */}

      <Modal
        open={!!editing}
        onClose={() => !saving && setEditing(null)}
        title="Edit room"
        subtitle={`Room ${editing?.room_number || ""}`}
      >
        <TextField
          id="enumber"
          label="Room number"
          value={form.number}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              number: e.target.value,
            }))
          }
          error={errors.number}
          required
        />

        <TextField
          id="ename"
          label="Room name"
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
          id="efloor"
          label="Floor"
          value={form.floor}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              floor: e.target.value,
            }))
          }
          error={errors.floor}
          required
        />

        <SelectField
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
          options={SPECIALIZATIONS.map((s) => ({
            value: s,
            label: s,
          }))}
        />

        <div className="flex gap-2.5 mt-2">
          <button
            onClick={() => setEditing(null)}
            disabled={saving}
            className="flex-1 text-sm font-semibold border border-line rounded-lg py-2.5 text-slate-600 hover:bg-teal-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            disabled={saving}
            className="flex-1 text-sm font-semibold bg-teal-800 text-white rounded-lg py-2.5 hover:bg-teal-900 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </Modal>

      {/* ============================================
          DEACTIVATE CONFIRMATION
      ============================================ */}

      <ConfirmDialog
        open={!!toggling}
        onClose={() => !saving && setToggling(null)}
        onConfirm={handleDeactivate}
        title="Deactivate this room?"
        description={`Room ${
          toggling?.room_number || ""
        } will no longer accept new token bookings.`}
        confirmLabel={saving ? "Deactivating..." : "Deactivate"}
        danger
      />
    </div>
  );
}
