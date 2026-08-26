"use client";

import { useEffect, useState } from "react";

import {
  Users,
  DoorOpen,
  Ticket,
  CheckCircle2,
  ClipboardList,
  Boxes,
  PackageCheck,
  AlertTriangle,
  PackageX,
  RefreshCw,
} from "lucide-react";

import {
  getAdminDashboard,
  getDoctorStats,
  getRoomStats,
  getMedicineStats,
  // getPendingPrescriptions,
} from "@/services/adminservice";

import { StatCard, Panel } from "@/components/cards/Card";
import DashboardCharts from "@/components/charts/DashboardCharts";
import StatusBadge from "@/components/badges/StatusBadge";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        dashboardResponse,
        doctorsResponse,
        roomsResponse,
        medicinesResponse,
        // prescriptionsResponse,
      ] = await Promise.all([
        getAdminDashboard(),
        getDoctorStats(),
        getRoomStats(),
        getMedicineStats(),
        // getPendingPrescriptions(),
      ]);

      /*
       * API service already returns response.data
       *
       * Depending on your backend response:
       *
       * {
       *   success: true,
       *   data: {...}
       * }
       *
       * OR
       *
       * {
       *   success: true,
       *   data: [...]
       * }
       */

      const dashboardData =
        dashboardResponse?.data ?? dashboardResponse;

      const doctorData =
        doctorsResponse?.data ?? doctorsResponse;

      const roomData =
        roomsResponse?.data ?? roomsResponse;

      const medicineData =
        medicinesResponse?.data ?? medicinesResponse;

      // const prescriptionData =
      //   prescriptionsResponse?.data ??
      //   prescriptionsResponse;

      setDashboard(dashboardData);

      setDoctors(
        Array.isArray(doctorData)
          ? doctorData
          : []
      );

      setRooms(
        Array.isArray(roomData)
          ? roomData
          : []
      );

      setMedicines(
        Array.isArray(medicineData)
          ? medicineData
          : []
      );

      // setPrescriptions(
      //   Array.isArray(prescriptionData)
      //     ? prescriptionData
      //     : []
      // );
    } catch (error: any) {
      console.error(
        "Admin dashboard API error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load hospital dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto mb-3">
            <RefreshCw size={28} />
          </div>

          <p className="text-sm text-slate-500">
            Loading hospital dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Hospital overview
          </h1>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="font-medium text-red-700">
            Failed to load dashboard
          </p>

          <p className="text-sm text-red-600 mt-1">
            {error}
          </p>

          <button
            type="button"
            onClick={() => loadDashboard()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD VALUES
  // ==========================================

  /*
   * Doctor statistics
   */

  const activeDoctors =
    dashboard?.doctors?.total ??
    dashboard?.totalDoctors ??
    doctors.length;

  /*
   * Rooms
   */

  const totalRooms =
    dashboard?.rooms?.total ??
    dashboard?.totalRooms ??
    rooms.length;

  /*
   * Today's patients
   */

  const todayPatients =
    dashboard?.patients?.today ??
    dashboard?.patients?.total_today ??
    dashboard?.todayPatients ??
    0;

  /*
   * Token statistics
   */

  const tokenStats = Array.isArray(
    dashboard?.tokens
  )
    ? dashboard.tokens
    : [];

  const totalTokens = tokenStats.reduce(
    (sum: number, item: any) =>
      sum + Number(item.total || 0),
    0
  );

  const completed = tokenStats
    .filter((item: any) =>
      [
        "COMPLETED",
        "MEDICINE_PENDING",
        "MEDICINE_COMPLETED",
      ].includes(item.status)
    )
    .reduce(
      (sum: number, item: any) =>
        sum + Number(item.total || 0),
      0
    );

  /*
   * Pending prescriptions
   */

  const pendingRx = prescriptions.length;

  /*
   * Medicine statistics
   */

  const totalStock =
    dashboard?.inventory?.totalStock ??
    medicines.reduce(
      (sum: number, medicine: any) =>
        sum +
        Number(
          medicine.stock_quantity ??
            medicine.stock ??
            0
        ),
      0
    );

  const usedToday =
    dashboard?.inventory?.usedToday ??
    dashboard?.inventory?.used_today ??
    medicines.reduce(
      (sum: number, medicine: any) =>
        sum +
        Number(
          medicine.used_today ??
            medicine.usedToday ??
            0
        ),
      0
    );

  const lowStock =
    dashboard?.inventory?.lowStock ??
    dashboard?.inventory?.low_stock ??
    medicines.filter((medicine: any) => {
      const stock = Number(
        medicine.stock_quantity ??
          medicine.stock ??
          0
      );

      const threshold = Number(
        medicine.low_stock_threshold ??
          medicine.lowStockThreshold ??
          10
      );

      const active =
        medicine.is_active ??
        medicine.active ??
        true;

      return (
        active &&
        stock > 0 &&
        stock <= threshold
      );
    }).length;

  const outOfStock =
    dashboard?.inventory?.outOfStock ??
    dashboard?.inventory?.out_of_stock ??
    medicines.filter((medicine: any) => {
      const stock = Number(
        medicine.stock_quantity ??
          medicine.stock ??
          0
      );

      const active =
        medicine.is_active ??
        medicine.active ??
        true;

      return active && stock === 0;
    }).length;

  return (
    <div className="space-y-6">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Hospital overview
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Live snapshot of today&apos;s OPD across
            every department.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* ==========================================
          MAIN STAT CARDS
      ========================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">

        <StatCard
          label="Total doctors"
          value={activeDoctors}
          icon={Users}
        />

        <StatCard
          label="Total rooms"
          value={totalRooms}
          icon={DoorOpen}
        />

        <StatCard
          label="Today's patients"
          value={todayPatients}
          icon={Users}
        />

        <StatCard
          label="Today's tokens"
          value={totalTokens}
          icon={Ticket}
        />

        <StatCard
          label="Completed"
          value={completed}
          icon={CheckCircle2}
          tone="green"
        />

        <StatCard
          label="Pending prescriptions"
          value={pendingRx}
          icon={ClipboardList}
          tone="amber"
        />

      </div>

      {/* ==========================================
          MEDICINE STATISTICS
      ========================================== */}

      <Panel title="Medicine statistics">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <StatCard
            label="Total stock"
            value={totalStock}
            icon={Boxes}
          />

          <StatCard
            label="Used today"
            value={usedToday}
            icon={PackageCheck}
            tone="green"
          />

          <StatCard
            label="Low stock"
            value={lowStock}
            icon={AlertTriangle}
            tone="amber"
          />

          <StatCard
            label="Out of stock"
            value={outOfStock}
            icon={PackageX}
            tone="red"
          />

        </div>

      </Panel>

      {/* ==========================================
          CHARTS
      ========================================== */}

      <DashboardCharts />

      {/* ==========================================
          DOCTOR + ROOM STATISTICS
      ========================================== */}

      <div className="grid lg:grid-cols-2 gap-5">

        {/* ========================================
            DOCTOR STATISTICS
        ======================================== */}

        <Panel title="Doctor statistics">

          <div className="space-y-2.5">

            {doctors.length === 0 ? (
              <div className="py-8 text-center">
                <Users
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="text-sm text-slate-500 mt-2">
                  No doctor statistics available.
                </p>
              </div>
            ) : (
              doctors.map((doctor: any) => {

                return (
                  <div
                    key={doctor.id}
                    className="flex items-center justify-between gap-3 border border-line rounded-xl px-4 py-3"
                  >

                    <div className="min-w-0">

                      <p className="text-sm font-medium text-ink truncate">
                        {doctor.name ||
                          "Unknown doctor"}
                      </p>

                      <p className="text-xs text-slate-500 truncate">
                        {doctor.specialization ||
                          doctor.qualification ||
                          "Doctor"}
                      </p>

                    </div>

                    <div className="text-right shrink-0">

                      <p className="text-xs text-slate-400">
                        Completed
                      </p>

                      <p className="font-display font-bold text-ink text-sm">
                        {doctor.completed_patients ??
                          doctor.completedPatients ??
                          0}
                      </p>

                    </div>

                  </div>
                );
              })
            )}

          </div>

        </Panel>

        {/* ========================================
            ROOM STATISTICS
        ======================================== */}

        <Panel title="Room statistics">

          <div className="space-y-2.5">

            {rooms.length === 0 ? (
              <div className="py-8 text-center">
                <DoorOpen
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="text-sm text-slate-500 mt-2">
                  No room statistics available.
                </p>
              </div>
            ) : (
              rooms.map((room: any) => {

                const roomNumber =
                  room.room_number ??
                  room.number ??
                  "-";

                const roomName =
                  room.room_name ??
                  room.name ??
                  room.specialization ??
                  "OPD";

                const totalPatients =
                  room.total_patients ??
                  room.totalPatients ??
                  0;

                return (
                  <div
                    key={room.id}
                    className="flex items-center justify-between gap-3 border border-line rounded-xl px-4 py-3"
                  >

                    <div className="min-w-0">

                      <p className="text-sm font-medium text-ink truncate">
                        Room {roomNumber} ·{" "}
                        {roomName}
                      </p>

                      <p className="text-xs text-slate-500 truncate">
                        {totalPatients} patients today
                      </p>

                    </div>

                    <div className="flex items-center gap-3 shrink-0">

                      <span className="text-xs text-slate-500">
                        {totalPatients} patients
                      </span>

                      {room.status && (
                        <StatusBadge
                          status={room.status}
                        />
                      )}

                    </div>

                  </div>
                );
              })
            )}

          </div>

        </Panel>

      </div>

    </div>
  );
}