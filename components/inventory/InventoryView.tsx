"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  Boxes,
  PackageCheck,
  AlertTriangle,
  PackageX,
  RefreshCw,
} from "lucide-react";

import { StatCard, Panel } from "@/components/cards/Card";

import DataTable, {
  Column,
} from "@/components/tables/DataTable";

import StatusBadge from "@/components/badges/StatusBadge";

import {
  Modal,
  ConfirmDialog,
} from "@/components/modals/Modal";

import {
  SelectField,
  TextField,
} from "@/components/forms/Field";

import { useToast } from "@/components/common/Toast";

import type { Medicine } from "@/lib/types";

import {
  getMedicines,
  getMedicineStats,
  addMedicine as apiAddMedicine,
  updateMedicine as apiUpdateMedicine,
  deleteMedicine as apiDeleteMedicine,
  getInventoryTransactions,
} from "@/services/adminservice";

// ============================================================
// CONSTANTS
// ============================================================

const UNITS = [
  "Tablet",
  "Capsule",
  "Bottle",
  "Injection",
  "Tube",
  "Strip",
];

// ============================================================
// TYPES
// ============================================================

interface InventoryTransaction {
  id: number | string;

  medicineId?: number;

  medicineName: string;

  type: string;

  quantity: number;

  stockBefore: number;

  stockAfter: number;

  prescriptionRef?: string | null;

  notes?: string | null;

  date: string;
}

interface MedicineStats {
  id: number | string;

  name: string;

  stockQuantity: number;

  usedToday: number;
}

// ============================================================
// RESPONSE HELPER
// ============================================================

function extractArray<T>(response: any): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
}

// ============================================================
// MEDICINE NORMALIZER
// ============================================================

function normalizeMedicine(
  item: any,
  statsMap: Map<string, MedicineStats>,
): Medicine {
  const id = String(item.id);

  const stats = statsMap.get(id);

  return {
    id,

    name: item.name ?? "",

    generic:
      item.generic ??
      item.generic_name ??
      "",

    unit:
      item.unit ??
      "Tablet",

    stock: Number(
      item.stock ??
        item.stock_quantity ??
        item.stockQuantity ??
        0,
    ),

    usedToday: Number(
      item.usedToday ??
        item.used_today ??
        stats?.usedToday ??
        0,
    ),

    lowStockThreshold: Number(
      item.lowStockThreshold ??
        item.low_stock_threshold ??
        20,
    ),

    active:
      typeof item.is_active !== "undefined"
        ? Boolean(Number(item.is_active))
        : typeof item.active !== "undefined"
          ? Boolean(item.active)
          : true,
  };
}

// ============================================================
// TRANSACTION NORMALIZER
// ============================================================

function normalizeTransaction(
  item: any,
): InventoryTransaction {
  const type =
    item.type ??
    item.transaction_type ??
    "";

  const rawQuantity = Number(
    item.quantity ?? 0,
  );

  /*
   * Backend stores DISPENSE quantity as positive.
   * UI displays dispensing as negative stock movement.
   */
  let quantity = rawQuantity;

  if (
    type.toUpperCase() === "DISPENSE" &&
    quantity > 0
  ) {
    quantity = -quantity;
  }

  return {
    id: item.id,

    medicineId:
      item.medicine_id ??
      item.medicineId,

    medicineName:
      item.medicineName ??
      item.medicine_name ??
      "Unknown medicine",

    type,

    quantity,

    stockBefore: Number(
      item.stockBefore ??
        item.stock_before ??
        0,
    ),

    stockAfter: Number(
      item.stockAfter ??
        item.stock_after ??
        0,
    ),

    prescriptionRef:
      item.prescriptionRef ??
      item.prescription_item_id ??
      null,

    notes:
      item.notes ??
      null,

    date:
      item.date ??
      item.created_at ??
      "",
  };
}

// ============================================================
// DATE FORMATTER
// ============================================================

function formatDate(
  value: string,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

// ============================================================
// STOCK STATUS
// ============================================================

function stockStatus(
  medicine: Medicine,
): string {
  if (!medicine.active) {
    return "INACTIVE";
  }

  if (medicine.stock === 0) {
    return "OUT_OF_STOCK";
  }

  if (
    medicine.stock <=
    medicine.lowStockThreshold
  ) {
    return "LOW_STOCK";
  }

  return "AVAILABLE";
}

// ============================================================
// COMPONENT
// ============================================================

export default function InventoryView({
  editable = true,
}: {
  editable?: boolean;
}) {
  const { show } = useToast();

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [medicines, setMedicines] =
    useState<Medicine[]>([]);

  const [transactions, setTransactions] =
    useState<InventoryTransaction[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [tab, setTab] =
    useState<
      "medicines" | "transactions"
    >("medicines");

  const [addOpen, setAddOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<Medicine | null>(null);

  const [removing, setRemoving] =
    useState<Medicine | null>(null);

  const [form, setForm] =
    useState({
      name: "",
      generic: "",
      unit: "Tablet",
      stock: "",
      lowStockThreshold: "20",
    });

  const [errors, setErrors] =
    useState<
      Record<string, string>
    >({});

  // ----------------------------------------------------------
  // LOAD INVENTORY
  // ----------------------------------------------------------

  const loadInventory =
    async () => {
      try {
        setRefreshing(true);

        /*
         * Three APIs are loaded together:
         *
         * 1. Medicines
         * 2. Medicine usage statistics
         * 3. Inventory transactions
         */
        const [
          medicinesResponse,
          medicineStatsResponse,
          transactionsResponse,
        ] = await Promise.all([
          getMedicines({
            includeInactive: true,
          }),

          getMedicineStats(),

          getInventoryTransactions(),
        ]);

        // ----------------------------------------------------
        // MEDICINE STATS
        // ----------------------------------------------------

        const medicineStats =
          extractArray<any>(
            medicineStatsResponse,
          );

        const statsMap =
          new Map<
            string,
            MedicineStats
          >();

        medicineStats.forEach(
          (item: any) => {
            statsMap.set(
              String(item.id),
              {
                id: item.id,

                name:
                  item.name ?? "",

                stockQuantity:
                  Number(
                    item.stock_quantity ??
                      item.stockQuantity ??
                      0,
                  ),

                usedToday:
                  Number(
                    item.used_today ??
                      item.usedToday ??
                      0,
                  ),
              },
            );
          },
        );

        // ----------------------------------------------------
        // MEDICINES
        // ----------------------------------------------------

        const medicineRows =
          extractArray<any>(
            medicinesResponse,
          );

        const normalizedMedicines =
          medicineRows.map(
            (item: any) =>
              normalizeMedicine(
                item,
                statsMap,
              ),
          );

        setMedicines(
          normalizedMedicines,
        );

        // ----------------------------------------------------
        // TRANSACTIONS
        // ----------------------------------------------------

        const transactionRows =
          extractArray<any>(
            transactionsResponse,
          );

        const normalizedTransactions =
          transactionRows.map(
            (item: any) =>
              normalizeTransaction(
                item,
              ),
          );

        setTransactions(
          normalizedTransactions,
        );
      } catch (error: any) {
        console.error(
          "Inventory load error:",
          error,
        );

        show(
          "error",
          error?.response?.data
            ?.message ??
            "Failed to load inventory.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  // ----------------------------------------------------------
  // INITIAL LOAD
  // ----------------------------------------------------------

  useEffect(() => {
    loadInventory();
  }, []);

  // ----------------------------------------------------------
  // REFRESH
  // ----------------------------------------------------------

  const handleRefresh =
    async () => {
      await loadInventory();
    };

  // ----------------------------------------------------------
  // STATS
  // ----------------------------------------------------------

  const totalMedicines =
    useMemo(
      () =>
        medicines.filter(
          (medicine) =>
            medicine.active,
        ).length,
      [medicines],
    );

  const totalStock =
    useMemo(
      () =>
        medicines.reduce(
          (total, medicine) =>
            total +
            Number(
              medicine.stock,
            ),
          0,
        ),
      [medicines],
    );

  const usedToday =
    useMemo(
      () =>
        medicines.reduce(
          (total, medicine) =>
            total +
            Number(
              medicine.usedToday,
            ),
          0,
        ),
      [medicines],
    );

  const lowStock =
    useMemo(
      () =>
        medicines.filter(
          (medicine) =>
            medicine.active &&
            medicine.stock > 0 &&
            medicine.stock <=
              medicine.lowStockThreshold,
        ).length,
      [medicines],
    );

  const outOfStock =
    useMemo(
      () =>
        medicines.filter(
          (medicine) =>
            medicine.active &&
            medicine.stock === 0,
        ).length,
      [medicines],
    );

  // ----------------------------------------------------------
  // FORM RESET
  // ----------------------------------------------------------

  function resetForm() {
    setForm({
      name: "",
      generic: "",
      unit: "Tablet",
      stock: "",
      lowStockThreshold: "20",
    });

    setErrors({});
  }

  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  function validate() {
    const next: Record<
      string,
      string
    > = {};

    if (!form.name.trim()) {
      next.name =
        "Medicine name is required";
    }

    if (!form.generic.trim()) {
      next.generic =
        "Generic name is required";
    }

    if (
      form.stock === "" ||
      Number(form.stock) < 0 ||
      Number.isNaN(
        Number(form.stock),
      )
    ) {
      next.stock =
        "Enter a valid stock quantity";
    }

    if (
      form.lowStockThreshold !==
        "" &&
      Number(
        form.lowStockThreshold,
      ) < 0
    ) {
      next.lowStockThreshold =
        "Threshold cannot be negative";
    }

    setErrors(next);

    return (
      Object.keys(next).length ===
      0
    );
  }

  // ----------------------------------------------------------
  // ADD MEDICINE
  // ----------------------------------------------------------

  const handleAdd =
    async () => {
      if (!validate()) {
        return;
      }

      try {
        setSaving(true);

        await apiAddMedicine({
          name: form.name.trim(),

          genericName:
            form.generic.trim(),

          unit: form.unit,

          stockQuantity:
            Number(form.stock),
        });

        show(
          "success",
          `${form.name} added to inventory.`,
        );

        setAddOpen(false);

        resetForm();

        await loadInventory();
      } catch (error: any) {
        console.error(
          "Add medicine error:",
          error,
        );

        show(
          "error",
          error?.response?.data
            ?.message ??
            "Failed to add medicine.",
        );
      } finally {
        setSaving(false);
      }
    };

  // ----------------------------------------------------------
  // OPEN EDIT
  // ----------------------------------------------------------

  function openEdit(
    medicine: Medicine,
  ) {
    setEditing(medicine);

    setForm({
      name: medicine.name,

      generic:
        medicine.generic,

      unit:
        medicine.unit,

      stock:
        String(
          medicine.stock,
        ),

      lowStockThreshold:
        String(
          medicine.lowStockThreshold,
        ),
    });

    setErrors({});
  }

  // ----------------------------------------------------------
  // UPDATE MEDICINE
  // ----------------------------------------------------------

  const handleUpdate =
    async () => {
      if (!editing) {
        return;
      }

      if (!validate()) {
        return;
      }

      try {
        setSaving(true);

        await apiUpdateMedicine(
          Number(editing.id),
          {
            name:
              form.name.trim(),

            genericName:
              form.generic.trim(),

            unit:
              form.unit,

            stockQuantity:
              Number(form.stock),
          },
        );

        show(
          "success",
          `${form.name} updated successfully.`,
        );

        setEditing(null);

        resetForm();

        await loadInventory();
      } catch (error: any) {
        console.error(
          "Update medicine error:",
          error,
        );

        show(
          "error",
          error?.response?.data
            ?.message ??
            "Failed to update medicine.",
        );
      } finally {
        setSaving(false);
      }
    };

  // ----------------------------------------------------------
  // DELETE / DEACTIVATE
  // ----------------------------------------------------------

  const handleRemove =
    async () => {
      if (!removing) {
        return;
      }

      try {
        setDeleting(true);

        await apiDeleteMedicine(
          Number(removing.id),
        );

        show(
          "success",
          `${removing.name} removed from active inventory.`,
        );

        setRemoving(null);

        await loadInventory();
      } catch (error: any) {
        console.error(
          "Delete medicine error:",
          error,
        );

        show(
          "error",
          error?.response?.data
            ?.message ??
            "Failed to remove medicine.",
        );
      } finally {
        setDeleting(false);
      }
    };

  // ----------------------------------------------------------
  // TABLE COLUMNS
  // ----------------------------------------------------------

  const columns: Column<Medicine>[] =
    [
      {
        header: "Medicine ID",

        accessor: (
          medicine,
        ) => (
          <span className="text-slate-400 font-mono text-xs">
            {String(
              medicine.id,
            ).toUpperCase()}
          </span>
        ),
      },

      {
        header: "Name",

        accessor: (
          medicine,
        ) => (
          <span className="font-medium text-ink">
            {medicine.name}
          </span>
        ),
      },

      {
        header: "Generic",

        accessor: (
          medicine,
        ) => (
          <span className="text-slate-500">
            {medicine.generic ||
              "—"}
          </span>
        ),
      },

      {
        header: "Unit",

        accessor: (
          medicine,
        ) =>
          medicine.unit ||
          "—",
      },

      {
        header: "Current stock",

        accessor: (
          medicine,
        ) => (
          <span className="font-display font-bold">
            {medicine.stock}
          </span>
        ),
      },

      {
        header: "Today's used",

        accessor: (
          medicine,
        ) =>
          medicine.usedToday,
      },

      {
        header: "Status",

        accessor: (
          medicine,
        ) => (
          <StatusBadge
            status={stockStatus(
              medicine,
            )}
          />
        ),
      },

      ...(editable
        ? [
            {
              header: "Actions",

              accessor: (
                medicine: Medicine,
              ) => (
                <div className="flex gap-1.5">
                  <button
                    onClick={() =>
                      openEdit(
                        medicine,
                      )
                    }
                    disabled={
                      saving ||
                      deleting
                    }
                    aria-label={`Edit ${medicine.name}`}
                    className="w-8 h-8 grid place-items-center rounded-lg border border-line text-slate-600 hover:bg-teal-50 disabled:opacity-50"
                  >
                    <Pencil
                      size={13}
                    />
                  </button>

                  <button
                    onClick={() =>
                      setRemoving(
                        medicine,
                      )
                    }
                    disabled={
                      saving ||
                      deleting
                    }
                    aria-label={`Remove ${medicine.name}`}
                    className="w-8 h-8 grid place-items-center rounded-lg border border-line text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2
                      size={13}
                    />
                  </button>
                </div>
              ),
            } as Column<Medicine>,
          ]
        : []),
    ];

  // ----------------------------------------------------------
  // LOADING UI
  // ----------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Inventory
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Medicine stock, usage and
            transaction history.
          </p>
        </div>

        <Panel>
          <div className="py-16 flex flex-col items-center justify-center">
            <RefreshCw
              size={28}
              className="animate-spin text-teal-700"
            />

            <p className="mt-3 text-sm text-slate-500">
              Loading inventory...
            </p>
          </div>
        </Panel>
      </div>
    );
  }

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  return (
    <div className="space-y-6">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Inventory
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Medicine stock, usage and
            transaction history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* REFRESH */}

          <button
            onClick={
              handleRefresh
            }
            disabled={
              refreshing ||
              saving ||
              deleting
            }
            className="inline-flex items-center gap-2 border border-line text-slate-700 text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-teal-50 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

          {/* ADD */}

          {editable && (
            <button
              onClick={() => {
                resetForm();
                setAddOpen(true);
              }}
              disabled={
                saving ||
                deleting
              }
              className="inline-flex items-center gap-2 bg-teal-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-teal-900 disabled:opacity-50"
            >
              <Plus size={15} />

              Add medicine
            </button>
          )}
        </div>
      </div>

      {/* ================================================== */}
      {/* STATS */}
      {/* ================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

        <StatCard
          label="Total medicines"
          value={
            totalMedicines
          }
          icon={Boxes}
        />

        <StatCard
          label="Total stock"
          value={totalStock}
          icon={
            PackageCheck
          }
          tone="green"
        />

        <StatCard
          label="Used today"
          value={usedToday}
          icon={Boxes}
        />

        <StatCard
          label="Low stock"
          value={lowStock}
          icon={
            AlertTriangle
          }
          tone="amber"
        />

        <StatCard
          label="Out of stock"
          value={
            outOfStock
          }
          icon={PackageX}
          tone="red"
        />
      </div>

      {/* ================================================== */}
      {/* TABS */}
      {/* ================================================== */}

      <div className="flex bg-teal-50 border border-line rounded-xl p-1 max-w-xs">

        {(
          [
            "medicines",
            "transactions",
          ] as const
        ).map(
          (item) => (
            <button
              key={item}
              onClick={() =>
                setTab(item)
              }
              className={`flex-1 text-sm font-semibold rounded-lg py-2 capitalize transition-colors ${
                tab === item
                  ? "bg-panel text-teal-800 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      {/* ================================================== */}
      {/* MEDICINES */}
      {/* ================================================== */}

      {tab ===
      "medicines" ? (
        <Panel className="!p-0">

          <DataTable
            rows={
              medicines
            }
            rowKey={(
              medicine,
            ) =>
              medicine.id
            }
            columns={
              columns
            }
            searchKeys={(
              medicine,
            ) =>
              `${medicine.name} ${medicine.generic}`
            }
            searchPlaceholder="Search medicine..."
            filters={[
              {
                label: "All",
                value: "ALL",
              },

              {
                label:
                  "Available",
                value:
                  "AVAILABLE",
              },

              {
                label:
                  "Low stock",
                value:
                  "LOW_STOCK",
              },

              {
                label:
                  "Out of stock",
                value:
                  "OUT_OF_STOCK",
              },

              {
                label:
                  "Inactive",
                value:
                  "INACTIVE",
              },
            ]}
            filterFn={(
              medicine,
              value,
            ) =>
              value ===
                "ALL" ||
              stockStatus(
                medicine,
              ) === value
            }
            emptyTitle="No medicines found"
            emptyDescription="Try a different search term or filter."
          />

        </Panel>
      ) : (

        /* ================================================== */
        /* TRANSACTIONS */
        /* ================================================== */

        <Panel className="!p-0">

          {transactions.length ===
          0 ? (
            <div className="py-16 text-center">

              <Boxes
                size={32}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-semibold text-slate-600">
                No inventory transactions
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Medicine stock transactions
                will appear here.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm min-w-[900px]">

                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 border-t border-line">

                    <th className="px-5 py-3">
                      Date
                    </th>

                    <th className="px-5 py-3">
                      Medicine
                    </th>

                    <th className="px-5 py-3">
                      Type
                    </th>

                    <th className="px-5 py-3">
                      Qty
                    </th>

                    <th className="px-5 py-3">
                      Before
                    </th>

                    <th className="px-5 py-3">
                      After
                    </th>

                    <th className="px-5 py-3">
                      Reference
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {transactions.map(
                    (
                      transaction,
                    ) => (
                      <tr
                        key={
                          transaction.id
                        }
                        className="border-t border-line hover:bg-teal-50/60"
                      >

                        <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                          {formatDate(
                            transaction.date,
                          )}
                        </td>

                        <td className="px-5 py-3.5 font-medium text-ink whitespace-nowrap">
                          {
                            transaction.medicineName
                          }
                        </td>

                        <td className="px-5 py-3.5">

                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-teal-100 text-teal-700">
                            {transaction.type
                              .replace(
                                /_/g,
                                " ",
                              )}
                          </span>

                        </td>

                        <td
                          className={`px-5 py-3.5 font-semibold ${
                            transaction.quantity <
                            0
                              ? "text-red-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {transaction.quantity >
                          0
                            ? `+${transaction.quantity}`
                            : transaction.quantity}
                        </td>

                        <td className="px-5 py-3.5 text-slate-500">
                          {
                            transaction.stockBefore
                          }
                        </td>

                        <td className="px-5 py-3.5 font-semibold text-ink">
                          {
                            transaction.stockAfter
                          }
                        </td>

                        <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                          {transaction.prescriptionRef ??
                            transaction.notes ??
                            "—"}
                        </td>

                      </tr>
                    ),
                  )}

                </tbody>
              </table>

            </div>
          )}

        </Panel>
      )}

      {/* ================================================== */}
      {/* ADD MEDICINE MODAL */}
      {/* ================================================== */}

      <Modal
        open={
          addOpen
        }
        onClose={() => {
          if (!saving) {
            setAddOpen(
              false,
            );
          }
        }}
        title="Add medicine"
        subtitle="Add a new medicine to the inventory."
      >

        <TextField
          id="name"
          label="Medicine name"
          value={
            form.name
          }
          onChange={(
            event,
          ) =>
            setForm(
              (
                current,
              ) => ({
                ...current,
                name:
                  event
                    .target
                    .value,
              }),
            )
          }
          error={
            errors.name
          }
          required
        />

        <TextField
          id="generic"
          label="Generic name"
          value={
            form.generic
          }
          onChange={(
            event,
          ) =>
            setForm(
              (
                current,
              ) => ({
                ...current,
                generic:
                  event
                    .target
                    .value,
              }),
            )
          }
          error={
            errors.generic
          }
          required
        />

        <div className="grid grid-cols-2 gap-3">

          <SelectField
            id="unit"
            label="Unit"
            value={
              form.unit
            }
            onChange={(
              event,
            ) =>
              setForm(
                (
                  current,
                ) => ({
                  ...current,
                  unit:
                    event
                      .target
                      .value,
                }),
              )
            }
            options={UNITS.map(
              (unit) => ({
                value:
                  unit,
                label:
                  unit,
              }),
            )}
            required
          />

          <TextField
            id="stock"
            label="Initial stock"
            value={
              form.stock
            }
            onChange={(
              event,
            ) =>
              setForm(
                (
                  current,
                ) => ({
                  ...current,
                  stock:
                    event
                      .target
                      .value,
                }),
              )
            }
            error={
              errors.stock
            }
            required
            inputMode="numeric"
          />

        </div>

        <TextField
          id="lowStockThreshold"
          label="Low stock threshold"
          value={
            form.lowStockThreshold
          }
          onChange={(
            event,
          ) =>
            setForm(
              (
                current,
              ) => ({
                ...current,
                lowStockThreshold:
                  event
                    .target
                    .value,
              }),
            )
          }
          error={
            errors.lowStockThreshold
          }
          inputMode="numeric"
          hint="Default threshold is 20 because the current database API does not store a threshold."
        />

        <div className="flex gap-2.5 mt-2">

          <button
            onClick={() =>
              setAddOpen(
                false,
              )
            }
            disabled={
              saving
            }
            className="flex-1 text-sm font-semibold border border-line rounded-lg py-2.5 text-slate-600 hover:bg-teal-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={
              handleAdd
            }
            disabled={
              saving
            }
            className="flex-1 text-sm font-semibold bg-teal-800 text-white rounded-lg py-2.5 hover:bg-teal-900 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save medicine"}
          </button>

        </div>

      </Modal>

      {/* ================================================== */}
      {/* EDIT MEDICINE MODAL */}
      {/* ================================================== */}

      <Modal
        open={
          !!editing
        }
        onClose={() => {
          if (!saving) {
            setEditing(
              null,
            );
          }
        }}
        title="Update medicine"
        subtitle={
          editing?.name
        }
      >

        <TextField
          id="ename"
          label="Medicine name"
          value={
            form.name
          }
          onChange={(
            event,
          ) =>
            setForm(
              (
                current,
              ) => ({
                ...current,
                name:
                  event
                    .target
                    .value,
              }),
            )
          }
          error={
            errors.name
          }
          required
        />

        <TextField
          id="egeneric"
          label="Generic name"
          value={
            form.generic
          }
          onChange={(
            event,
          ) =>
            setForm(
              (
                current,
              ) => ({
                ...current,
                generic:
                  event
                    .target
                    .value,
              }),
            )
          }
          error={
            errors.generic
          }
          required
        />

        <div className="grid grid-cols-2 gap-3">

          <SelectField
            id="eunit"
            label="Unit"
            value={
              form.unit
            }
            onChange={(
              event,
            ) =>
              setForm(
                (
                  current,
                ) => ({
                  ...current,
                  unit:
                    event
                      .target
                      .value,
                }),
              )
            }
            options={UNITS.map(
              (unit) => ({
                value:
                  unit,
                label:
                  unit,
              }),
            )}
            required
          />

          <TextField
            id="estock"
            label="Stock quantity"
            value={
              form.stock
            }
            onChange={(
              event,
            ) =>
              setForm(
                (
                  current,
                ) => ({
                  ...current,
                  stock:
                    event
                      .target
                      .value,
                }),
              )
            }
            error={
              errors.stock
            }
            required
            inputMode="numeric"
            hint="Cannot be negative."
          />

        </div>

        <div className="flex gap-2.5 mt-2">

          <button
            onClick={() =>
              setEditing(
                null,
              )
            }
            disabled={
              saving
            }
            className="flex-1 text-sm font-semibold border border-line rounded-lg py-2.5 text-slate-600 hover:bg-teal-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={
              handleUpdate
            }
            disabled={
              saving
            }
            className="flex-1 text-sm font-semibold bg-teal-800 text-white rounded-lg py-2.5 hover:bg-teal-900 disabled:opacity-50"
          >
            {saving
              ? "Updating..."
              : "Save changes"}
          </button>

        </div>

      </Modal>

      {/* ================================================== */}
      {/* DELETE CONFIRMATION */}
      {/* ================================================== */}

      <ConfirmDialog
        open={
          !!removing
        }
        onClose={() => {
          if (!deleting) {
            setRemoving(
              null,
            );
          }
        }}
        onConfirm={
          handleRemove
        }
        title="Remove this medicine?"
        description={`Are you sure you want to remove ${
          removing?.name ??
          "this medicine"
        }? It will be deactivated, not deleted, and its history will be preserved.`}
        confirmLabel={
          deleting
            ? "Removing..."
            : "Remove"
        }
      />

    </div>
  );
}