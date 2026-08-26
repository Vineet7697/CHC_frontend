"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";

import { EmptyState } from "@/components/common/States";
import { useToast } from "@/components/common/Toast";

import {
  getPatientNotifications,
  markNotificationRead,
} from "@/services/patientservice";

export default function PatientNotificationsPage() {
  const { show } = useToast();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<number | string | null>(null);

  // ========================================
  // LOAD NOTIFICATIONS
  // ========================================

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);

      const response = await getPatientNotifications();

      if (response.success) {
        const data = response.data || [];

        // Unread notifications first
        data.sort((a: any, b: any) => {
          if (a.is_read === b.is_read) {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          }

          return a.is_read ? 1 : -1;
        });

        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (error: any) {
      console.error(
        "Notifications API error:",
        error?.response?.data || error
      );

      show(
        "error",
        error?.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // MARK AS READ
  // ========================================

  async function handleMarkRead(id: number | string) {
    try {
      setMarkingRead(id);

      const response = await markNotificationRead(id);

      if (response.success) {
        // API success ke baad local UI update
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? {
                  ...notification,
                  is_read: true,
                }
              : notification
          )
        );
      }
    } catch (error: any) {
      console.error(
        "Mark notification read error:",
        error?.response?.data || error
      );

      show(
        "error",
        error?.response?.data?.message ||
          "Unable to mark notification as read."
      );
    } finally {
      setMarkingRead(null);
    }
  }

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-slate-500">
          Loading notifications...
        </p>
      </div>
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="max-w-2xl space-y-6">

      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Notifications
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Updates about your token, doctor and medicines.
          </p>
        </div>
      </div>

      {/* EMPTY */}

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You'll see updates here once you book an OPD token."
        />
      ) : (
        <div className="space-y-2.5">

          {notifications.map((notification) => {
            const isRead = Boolean(notification.is_read);
            const isMarking =
              markingRead === notification.id;

            return (
              <div
                key={notification.id}
                className={`
                  bg-panel
                  border
                  rounded-2xl
                  p-4
                  flex
                  items-start
                  gap-3
                  ${
                    isRead
                      ? "border-line"
                      : "border-teal-700/40 bg-teal-50/50"
                  }
                `}
              >

                {/* ICON */}

                <span
                  className={`
                    shrink-0
                    grid
                    place-items-center
                    w-8
                    h-8
                    rounded-full
                    mt-0.5
                    ${
                      isRead
                        ? "bg-teal-100 text-slate-400"
                        : "bg-teal-800 text-white"
                    }
                  `}
                >
                  <Bell size={14} />
                </span>

                {/* CONTENT */}

                <div className="flex-1 min-w-0">

                  {notification.title && (
                    <p
                      className={`
                        text-sm
                        leading-snug
                        ${
                          isRead
                            ? "text-slate-500"
                            : "text-ink font-medium"
                        }
                      `}
                    >
                      {notification.title}
                    </p>
                  )}

                  <p
                    className={`
                      text-sm
                      leading-snug
                      ${
                        notification.title
                          ? "mt-1"
                          : ""
                      }
                      ${
                        isRead
                          ? "text-slate-500"
                          : "text-ink font-medium"
                      }
                    `}
                  >
                    {notification.message}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    {notification.created_at
                      ? new Date(
                          notification.created_at
                        ).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </p>

                </div>

                {/* MARK READ */}

                {!isRead && (
                  <button
                    onClick={() =>
                      handleMarkRead(notification.id)
                    }
                    disabled={isMarking}
                    className="
                      shrink-0
                      flex
                      items-center
                      gap-1
                      text-xs
                      font-semibold
                      text-teal-800
                      border
                      border-teal-800/25
                      rounded-lg
                      px-2.5
                      py-1.5
                      hover:bg-teal-100
                      disabled:opacity-50
                    "
                  >
                    <CheckCheck size={13} />

                    {isMarking
                      ? "Marking..."
                      : "Mark read"}
                  </button>
                )}

              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}