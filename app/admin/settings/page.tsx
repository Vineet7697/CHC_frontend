"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Panel } from "@/components/cards/Card";
import { TextField } from "@/components/forms/Field";
import { useToast } from "@/components/common/Toast";
import api from "@/lib/api";

type SettingsForm = {
  hospitalName: string;
  lowStockThreshold: string;
  tokenPrefixA: string;
  tokenPrefixB: string;
  supportMobile: string;
};

const DEFAULT_FORM: SettingsForm = {
  hospitalName: "",
  lowStockThreshold: "20",
  tokenPrefixA: "A",
  tokenPrefixB: "B",
  supportMobile: "",
};

export default function AdminSettingsPage() {
  const { show } = useToast();

  const [form, setForm] = useState<SettingsForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================
  // GET SETTINGS
  // =========================
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);

        const response = await api.get("/admin/settings");

        const data = response.data?.data ?? response.data;

        setForm({
          hospitalName: data.hospitalName ?? "",
          lowStockThreshold: String(data.lowStockThreshold ?? 20),
          tokenPrefixA: data.tokenPrefixA ?? "A",
          tokenPrefixB: data.tokenPrefixB ?? "B",
          supportMobile: data.supportMobile ?? "",
        });
      } catch (error: any) {
        console.error("Failed to load settings:", error);

        show(
          "error",
          error?.response?.data?.message ||
            "Failed to load hospital settings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [show]);

  // =========================
  // HANDLE CHANGE
  // =========================
  function updateField(
    field: keyof SettingsForm,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // =========================
  // SAVE SETTINGS
  // =========================
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!form.hospitalName.trim()) {
      show("error", "Hospital name is required.");
      return;
    }

    if (!form.supportMobile.trim()) {
      show("error", "Support helpline is required.");
      return;
    }

    const threshold = Number(form.lowStockThreshold);

    if (
      !Number.isInteger(threshold) ||
      threshold < 0
    ) {
      show(
        "error",
        "Low-stock threshold must be a valid number."
      );
      return;
    }

    if (!form.tokenPrefixA.trim()) {
      show("error", "Ground/1st floor token prefix is required.");
      return;
    }

    if (!form.tokenPrefixB.trim()) {
      show("error", "Upper floor token prefix is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put("/admin/settings", {
        hospitalName: form.hospitalName.trim(),

        lowStockThreshold: threshold,

        tokenPrefixA: form.tokenPrefixA
          .trim()
          .toUpperCase(),

        tokenPrefixB: form.tokenPrefixB
          .trim()
          .toUpperCase(),

        supportMobile: form.supportMobile.trim(),
      });

      const data = response.data?.data;

      if (data) {
        setForm({
          hospitalName: data.hospitalName ?? form.hospitalName,
          lowStockThreshold: String(
            data.lowStockThreshold ??
              form.lowStockThreshold
          ),
          tokenPrefixA:
            data.tokenPrefixA ?? form.tokenPrefixA,
          tokenPrefixB:
            data.tokenPrefixB ?? form.tokenPrefixB,
          supportMobile:
            data.supportMobile ?? form.supportMobile,
        });
      }

      show("success", "Settings saved successfully.");
    } catch (error: any) {
      console.error("Failed to save settings:", error);

      show(
        "error",
        error?.response?.data?.message ||
          "Failed to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="max-w-xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Settings
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Hospital-wide configuration for the OPD system.
          </p>
        </div>

        <Panel title="General">
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2
              size={20}
              className="animate-spin mr-2"
            />
            Loading settings...
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Settings
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Hospital-wide configuration for the OPD system.
        </p>
      </div>

      <Panel title="General">
        <form
          onSubmit={handleSave}
          noValidate
        >
          <TextField
            id="hospitalName"
            label="Hospital name"
            value={form.hospitalName}
            onChange={(e) =>
              updateField(
                "hospitalName",
                e.target.value
              )
            }
            required
          />

          <TextField
            id="supportMobile"
            label="Support helpline"
            value={form.supportMobile}
            onChange={(e) =>
              updateField(
                "supportMobile",
                e.target.value
              )
            }
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <TextField
              id="tokenPrefixA"
              label="Ground/1st floor token prefix"
              value={form.tokenPrefixA}
              onChange={(e) =>
                updateField(
                  "tokenPrefixA",
                  e.target.value
                )
              }
              maxLength={1}
            />

            <TextField
              id="tokenPrefixB"
              label="Upper floor token prefix"
              value={form.tokenPrefixB}
              onChange={(e) =>
                updateField(
                  "tokenPrefixB",
                  e.target.value
                )
              }
              maxLength={1}
            />
          </div>

          <TextField
            id="lowStockThreshold"
            label="Default low-stock threshold"
            value={form.lowStockThreshold}
            onChange={(e) =>
              updateField(
                "lowStockThreshold",
                e.target.value
              )
            }
            inputMode="numeric"
            hint="Used for new medicines added without a custom threshold."
          />

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
              : "Save settings"}
          </button>
        </form>
      </Panel>
    </div>
  );
}