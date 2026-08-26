"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
} from "lucide-react";

import StatusBadge from "@/components/badges/StatusBadge";
import {
  ConfirmDialog,
} from "@/components/modals/Modal";
import {
  EmptyState,
} from "@/components/common/States";
import {
  useToast,
} from "@/components/common/Toast";

import {
  getOpdOptions,
  bookToken,
} from "@/services/patientservice";

export default function OpdOptionsPage() {
  const { specId } =
    useParams<{ specId: string }>();

  const searchParams =
    useSearchParams();

  const router = useRouter();

  const { show } = useToast();

  // ========================================
  // URL PARAMETERS
  // ========================================

  const specializationId =
    searchParams.get("specializationId");

  const diseaseId =
    searchParams.get("diseaseId");

  // ========================================
  // STATE
  // ========================================

  const [rooms, setRooms] =
    useState<any[]>([]);

  const [specialization, setSpecialization] =
    useState<any>(null);

  const [confirmRoom, setConfirmRoom] =
    useState<any>(null);

  const [booking, setBooking] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  // ========================================
  // LOAD OPD OPTIONS
  // ========================================

  useEffect(() => {
    if (
      !specializationId &&
      !diseaseId &&
      !specId
    ) {
      setLoading(false);
      return;
    }

    loadOpdOptions();
  }, [
    specializationId,
    diseaseId,
    specId,
  ]);

  async function loadOpdOptions() {
    try {
      setLoading(true);

      /*
       * If query parameter exists,
       * use it.
       *
       * Otherwise fallback to specId.
       */

      const finalSpecializationId =
        specializationId ||
        (!diseaseId ? specId : undefined);

      const response =
        await getOpdOptions(
          finalSpecializationId,
          diseaseId || undefined,
        );

      if (!response?.success) {
        setRooms([]);
        return;
      }

      const data =
        response.data || [];

      // ========================================
      // ARRAY RESPONSE
      // ========================================

      if (Array.isArray(data)) {
        setRooms(data);

        if (data.length > 0) {
          setSpecialization({
            id:
              data[0].specialization_id,

            name:
              data[0].specialization_name,
          });
        }
      }

      // ========================================
      // OBJECT RESPONSE
      // ========================================

      else {
        setRooms(
          data.rooms || [],
        );

        setSpecialization(
          data.specialization ||
            null,
        );
      }

    } catch (error: any) {
      console.error(
        "OPD options API error:",
        error?.response?.data ||
          error,
      );

      show(
        "error",
        error?.response?.data
          ?.message ||
          "Unable to load OPD options.",
      );

    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // BOOK TOKEN
  // ========================================

  async function handleConfirmBook() {
    if (!confirmRoom) {
      return;
    }

    try {
      setBooking(true);

      const response =
        await bookToken(
          confirmRoom.opd_session_id,
        );

      if (response?.success) {
        show(
          "success",
          response.message ||
            "Token booked successfully.",
        );

        setConfirmRoom(null);

        router.push(
          "/patient/token",
        );
      }

    } catch (error: any) {
      console.error(
        "Book token API error:",
        error?.response?.data ||
          error,
      );

      show(
        "error",
        error?.response?.data
          ?.message ||
          "Unable to book token.",
      );

    } finally {
      setBooking(false);
    }
  }

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-slate-500">
          Loading OPD options...
        </p>
      </div>
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="space-y-6 max-w-3xl">

      {/* BACK */}

      <Link
        href="/patient/search"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-800"
      >
        <ArrowLeft size={14} />
        Back to search
      </Link>

      {/* HEADER */}

      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          {specialization?.name ||
            "OPD"}{" "}
          — available rooms
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Choose a room to book your token.
        </p>
      </div>

      {/* NO OPD */}

      {rooms.length === 0 ? (

        <EmptyState
          title="No OPD open right now"
          description="Please check back later or choose a different specialization."
        />

      ) : (

        <div className="space-y-3">

          {rooms.map((room) => (

            <div
              key={
                room.opd_session_id
              }
              className="bg-panel border border-line rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >

              {/* DETAILS */}

              <div className="flex-1">

                <div className="flex items-center gap-2.5">

                  <p className="font-display font-bold text-ink text-[15px]">
                    Room{" "}
                    {room.room_number}
                  </p>

                  <StatusBadge
                    status={
                      room.status
                    }
                  />

                </div>

                <p className="text-sm text-slate-500 mt-0.5">
                  {room.room_name ||
                    "OPD Room"}
                </p>

                <p className="text-sm text-ink mt-2 font-medium">
                  {room.doctor_name ||
                    "Doctor to be assigned"}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  {
                    room.specialization_name
                  }
                </p>

                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Users size={13} />

                  {room.waiting_count ??
                    0}{" "}
                  patient
                  {(room.waiting_count ??
                    0) !== 1
                    ? "s"
                    : ""}{" "}
                  waiting
                </p>

              </div>

              {/* BOOK */}

              <button
                onClick={() =>
                  setConfirmRoom(
                    room,
                  )
                }
                disabled={
                  booking ||
                  !room.opd_session_id ||
                  ![
                    "NOT_STARTED",
                    "RUNNING",
                  ].includes(
                    room.status,
                  )
                }
                className="inline-flex items-center justify-center gap-1.5 bg-teal-800 text-white text-sm font-semibold rounded-lg px-5 py-2.5 hover:bg-teal-900 disabled:opacity-40 shrink-0"
              >
                Book OPD
              </button>

            </div>

          ))}

        </div>

      )}

      {/* CONFIRM */}

      <ConfirmDialog
        open={!!confirmRoom}
        onClose={() =>
          !booking &&
          setConfirmRoom(null)
        }
        onConfirm={
          handleConfirmBook
        }
        title="Confirm token booking"
        description="You can book only one OPD token per day. Please confirm you want to proceed with this room."
        confirmLabel={
          booking
            ? "Booking..."
            : "Book token"
        }
        danger={false}
      />

    </div>
  );
}