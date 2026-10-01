"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

import {
  clinicService,
  type PrescriptionDetails,
} from "@/services/clinicservice";

export default function PharmacyReceiptPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const prescriptionId = String(params?.id ?? "");

  // Print mode
  const autoPrint = searchParams.get("print") === "true";

  const [details, setDetails] = useState<PrescriptionDetails | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // LOAD PRESCRIPTION
  // ========================================

  async function loadReceipt() {
    try {
      setLoading(true);
      setError("");

      const response =
        await clinicService.getPrescriptionDetails(prescriptionId);

      console.log("Receipt details:", response);

      if (!response?.data) {
        throw new Error("Prescription details not found");
      }

      setDetails(response.data);
    } catch (error: any) {
      console.error("Receipt details API error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load receipt",
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    if (!prescriptionId) {
      setError("Invalid prescription ID");
      setLoading(false);
      return;
    }

    loadReceipt();
  }, [prescriptionId]);

  // ========================================
  // AUTO PRINT
  // ========================================

  useEffect(() => {
    if (!details || !autoPrint) {
      return;
    }

    // Wait until receipt is fully rendered
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [details, autoPrint]);

  // ========================================
  // CLOSE AFTER PRINT
  // ========================================

  useEffect(() => {
    if (!autoPrint) {
      return;
    }

    const handleAfterPrint = () => {
      // Small delay so print dialog can finish
      setTimeout(() => {
        window.close();
      }, 300);
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [autoPrint]);

  // ========================================
  // MANUAL PRINT
  // ========================================

  function handlePrint() {
    window.print();
  }

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-slate-500">Preparing receipt...</div>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error || !details) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 text-center">
          <p className="text-sm text-red-500">{error || "Receipt not found"}</p>

          <Link
            href={`/clinic/prescriptions/${prescriptionId}`}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <ArrowLeft size={15} />
            Back
          </Link>
        </div>
      </div>
    );
  }

  const prescription = details.prescription;
  const medicines = details.medicines ?? [];

  // ========================================
  // TOKEN
  // ========================================

  const tokenCode =
    prescription.token_number != null
      ? `T-${prescription.token_number}`
      : prescription.token_id != null
        ? `T-${prescription.token_id}`
        : null;

  // ========================================
  // RECEIPT NUMBER
  // ========================================

  const receiptNumber = `RX-${String(prescription.prescription_id).padStart(
    6,
    "0",
  )}`;

  // ========================================
  // DATE
  // ========================================

  const receiptDate = prescription.prescribed_at
    ? new Date(prescription.prescribed_at).toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  // ========================================
  // DISPENSED MEDICINES
  // ========================================

  const dispensedMedicines = medicines.filter(
    (medicine) => medicine.dispensing_status === "GIVEN",
  );

  // ========================================
  // PAGE
  // ========================================

  return (
    <>
      {/* ========================================
          SCREEN HEADER
      ======================================== */}

      {!autoPrint && (
        <div className="receipt-screen-header">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/clinic/prescriptions/${prescriptionId}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-800"
            >
              <ArrowLeft size={15} />
              Back to prescription
            </Link>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900"
            >
              <Printer size={16} />
              Print Receipt
            </button>
          </div>
        </div>
      )}

      {/* ========================================
          RECEIPT
      ======================================== */}

      <main className="receipt-page">
        <div className="receipt">
          {/* HOSPITAL HEADER */}

          <div className="receipt-header">
            <h1>HOSPITAL PHARMACY</h1>

            <p className="receipt-subtitle">Pharmacy Dispensing Receipt</p>

            <p className="receipt-address">Hospital Pharmacy</p>
          </div>

          <div className="receipt-line" />

          {/* RECEIPT INFO */}

          <div className="receipt-meta">
            <div>
              <span>Receipt No.</span>
              <strong>{receiptNumber}</strong>
            </div>

            <div>
              <span>Date & Time</span>
              <strong>{receiptDate}</strong>
            </div>
          </div>

          <div className="receipt-line" />

          {/* PATIENT */}

          <section>
            <h2>Patient Details</h2>

            <div className="receipt-grid">
              <div>
                <span>Patient Name</span>
                <strong>{prescription.patient_name || "—"}</strong>
              </div>

              <div>
                <span>Patient ID</span>
                <strong>{prescription.patient_id || "—"}</strong>
              </div>

              <div>
                <span>Age</span>
                <strong>
                  {prescription.age != null ? `${prescription.age} years` : "—"}
                </strong>
              </div>

              <div>
                <span>Gender</span>
                <strong>{prescription.gender || "—"}</strong>
              </div>
            </div>
          </section>

          <div className="receipt-line" />

          {/* PRESCRIPTION */}

          <section>
            <h2>Prescription Details</h2>

            <div className="receipt-grid">
              <div>
                <span>Prescription ID</span>
                <strong>#{prescription.prescription_id}</strong>
              </div>

              <div>
                <span>Doctor</span>
                <strong>{prescription.doctor_name || "—"}</strong>
              </div>

              <div>
                <span>Token</span>
                <strong>{tokenCode || "—"}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>COMPLETED</strong>
              </div>
            </div>
          </section>

          <div className="receipt-line" />

          {/* MEDICINES */}

          <section>
            <h2>Medicines Dispensed</h2>

            <table className="medicine-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Medicine</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {medicines.map((medicine, index) => {
                  const quantity = Number(
                    medicine.given_quantity ?? medicine.quantity ?? 0,
                  );

                  return (
                    <tr key={String(medicine.prescription_item_id)}>
                      <td>{index + 1}</td>

                      <td>
                        <strong>{medicine.medicine_name}</strong>

                        {medicine.unit && <small>{medicine.unit}</small>}
                      </td>

                      <td>{quantity}</td>

                      <td>
                        {medicine.dispensing_status === "GIVEN"
                          ? "DISPENSED"
                          : "UNAVAILABLE"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <div className="receipt-line" />

          {/* SUMMARY */}

          <div className="receipt-summary">
            <div>
              <span>Total medicines</span>
              <strong>{medicines.length}</strong>
            </div>

            <div>
              <span>Dispensed</span>
              <strong>{dispensedMedicines.length}</strong>
            </div>

            <div>
              <span>Unavailable</span>
              <strong>{medicines.length - dispensedMedicines.length}</strong>
            </div>
          </div>

          <div className="receipt-line" />

          {/* FOOTER */}

          <div className="receipt-footer">
            <strong>Dispensing completed successfully</strong>

            <p>
              This receipt confirms the medicines processed by the hospital
              pharmacy.
            </p>

            <p className="thank-you">Thank you</p>
          </div>
        </div>
      </main>

      {/* ========================================
          PRINT CSS
      ======================================== */}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        .receipt-screen-header {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 24px 20px 12px;
        }

        .receipt-page {
          min-height: calc(100vh - 80px);
          background: #f1f5f9;
          padding: 20px;
        }

        .receipt {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
          color: #111827;
        }

        .receipt-header {
          text-align: center;
        }

        .receipt-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .receipt-subtitle {
          margin: 6px 0 0;
          font-size: 14px;
          font-weight: 600;
        }

        .receipt-address {
          margin: 4px 0 0;
          font-size: 12px;
          color: #64748b;
        }

        .receipt-line {
          border-top: 1px solid #e2e8f0;
          margin: 20px 0;
        }

        .receipt-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .receipt-meta div,
        .receipt-grid div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .receipt-meta span,
        .receipt-grid span {
          font-size: 11px;
          color: #64748b;
        }

        .receipt-meta strong,
        .receipt-grid strong {
          font-size: 13px;
          color: #111827;
        }

        .receipt h2 {
          margin: 0 0 14px;
          font-size: 14px;
          font-weight: 700;
        }

        .receipt-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px 24px;
        }

        .medicine-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .medicine-table th {
          padding: 10px 8px;
          text-align: left;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          font-weight: 700;
        }

        .medicine-table td {
          padding: 10px 8px;
          border: 1px solid #cbd5e1;
          vertical-align: top;
        }

        .medicine-table td strong {
          display: block;
        }

        .medicine-table td small {
          display: block;
          margin-top: 3px;
          font-size: 10px;
          color: #64748b;
        }

        .receipt-summary {
          display: flex;
          justify-content: flex-end;
          gap: 40px;
        }

        .receipt-summary div {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .receipt-summary span {
          font-size: 11px;
          color: #64748b;
        }

        .receipt-summary strong {
          font-size: 15px;
        }

        .receipt-footer {
          text-align: center;
          font-size: 12px;
        }

        .receipt-footer p {
          margin: 6px 0;
          color: #64748b;
        }

        .receipt-footer .thank-you {
          margin-top: 18px;
          font-size: 14px;
          font-weight: 700;
          color: #111827;
        }

        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .receipt-screen-header {
            display: none !important;
          }

          .receipt-page {
            min-height: auto !important;
            padding: 0 !important;
            background: white !important;
          }

          .receipt {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }

          .receipt-line {
            margin: 14px 0;
          }

          .medicine-table {
            page-break-inside: auto;
          }

          .medicine-table tr {
            page-break-inside: avoid;
          }

          section {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}
