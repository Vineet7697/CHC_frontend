"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search as SearchIcon,
  ArrowRight,
  DoorOpen,
  Stethoscope,
} from "lucide-react";

import { EmptyState } from "@/components/common/States";
import { useToast } from "@/components/common/Toast";

import { searchDiseaseSpecialization } from "@/services/patientservice";

export default function PatientSearchPage() {
  const { show } = useToast();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // ========================================
  // SEARCH API
  // ========================================

  useEffect(() => {
    const value = query.trim();

    // Backend requires minimum 2 characters
    if (value.length < 2) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      searchData(value);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  async function searchData(value: string) {
    try {
      setLoading(true);

      const response = await searchDiseaseSpecialization(value);

      if (!response?.success) {
        setResults([]);
        setSearched(true);
        return;
      }

      const data = response.data || [];

      if (Array.isArray(data)) {
        setResults(data);
      } else {
        setResults(
          data.results ||
            data.specializations ||
            data.data ||
            [],
        );
      }

      setSearched(true);
    } catch (error: any) {
      console.error(
        "Patient search API error:",
        error?.response?.data || error,
      );

      setResults([]);

      show(
        "error",
        error?.response?.data?.message ||
          "Unable to search.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ========================================
          HEADER
      ======================================== */}

      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Search disease or specialization
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Tell us what&apos;s bothering you — we&apos;ll match you
          to the right OPD.
        </p>
      </div>

      {/* ========================================
          SEARCH INPUT
      ======================================== */}

      <div className="relative">
        <SearchIcon
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search disease or specialization"
          className="w-full text-sm bg-panel border border-line rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-teal-700"
        />
      </div>

      {/* ========================================
          SEARCH HINT
      ======================================== */}

      {!query && (
        <p className="text-xs text-slate-400">
          Enter at least 2 characters to search.
        </p>
      )}

      {/* ========================================
          LOADING
      ======================================== */}

      {loading && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">
            Searching...
          </p>
        </div>
      )}

      {/* ========================================
          NO RESULTS
      ======================================== */}

      {!loading &&
        searched &&
        results.length === 0 && (
          <EmptyState
            title="No matching result"
            description="Try a different disease name or specialization."
          />
        )}

      {/* ========================================
          RESULTS
      ======================================== */}

      {!loading &&
        results.length > 0 && (
          <div className="space-y-3">

            {results.map((item, index) => {
              const id =
                item.id ??
                item.specialization_id ??
                item.specializationId ??
                item.disease_id ??
                item.diseaseId;

              const name =
                item.name ??
                item.specialization_name ??
                item.specializationName ??
                item.disease_name ??
                item.diseaseName ??
                "Unknown";

              const description =
                item.description ??
                item.specialization_description ??
                item.disease_description ??
                "";

              const roomCount = Number(
                item.room_count ??
                  item.roomCount ??
                  item.opd_count ??
                  item.opdCount ??
                  0,
              );

              const doctorCount = Number(
                item.doctor_count ??
                  item.doctorCount ??
                  0,
              );

              const type = String(
                item.type || "",
              ).toUpperCase();

              return (
                <div
                  key={`${type}-${id ?? index}`}
                  className="bg-panel border border-line rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >

                  {/* ========================================
                      DETAILS
                  ======================================== */}

                  <div className="flex-1">

                    <div className="flex items-center gap-2">
                      <p className="font-display font-semibold text-ink text-[15px]">
                        {name}
                      </p>

                      {type && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {type}
                        </span>
                      )}
                    </div>

                    {description && (
                      <p className="text-sm text-slate-500 mt-0.5">
                        {description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">

                      <span className="flex items-center gap-1.5">
                        <DoorOpen size={13} />

                        {roomCount} OPD
                        {roomCount !== 1 ? "s" : ""}
                        {" "}available
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Stethoscope size={13} />

                        {doctorCount} doctor
                        {doctorCount !== 1 ? "s" : ""}
                      </span>

                    </div>
                  </div>

                  {/* ========================================
                      NEXT BUTTON
                  ======================================== */}

                  {type === "SPECIALIZATION" && id ? (

                    <Link
                      href={`/patient/opd/${id}?specializationId=${id}`}
                      className="inline-flex items-center justify-center gap-1.5 bg-teal-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-teal-900 shrink-0"
                    >
                      Next
                      <ArrowRight size={15} />
                    </Link>

                  ) : type === "DISEASE" && id ? (

                    <Link
                      href={`/patient/opd/${id}?diseaseId=${id}`}
                      className="inline-flex items-center justify-center gap-1.5 bg-teal-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-teal-900 shrink-0"
                    >
                      Next
                      <ArrowRight size={15} />
                    </Link>

                  ) : (

                    <span className="text-xs text-red-600">
                      Invalid result
                    </span>

                  )}

                </div>
              );
            })}

          </div>
        )}

    </div>
  );
}