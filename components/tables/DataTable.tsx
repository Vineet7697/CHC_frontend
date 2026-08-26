"use client";

import React, { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/common/States";
import { Inbox } from "lucide-react";

export interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortKey?: (row: T) => string | number;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  searchKeys?: (row: T) => string;
  filters?: { label: string; value: string }[];
  filterFn?: (row: T, filterValue: string) => boolean;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  rowKey: (row: T) => string;
  searchPlaceholder?: string;
}

export default function DataTable<T>({
  columns,
  rows,
  searchKeys,
  filters,
  filterFn,
  pageSize = 8,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search or filters.",
  rowKey,
  searchPlaceholder = "Search...",
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(filters?.[0]?.value ?? "");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = rows;
    if (filters && filterFn && activeFilter) {
      result = result.filter((r) => filterFn(r, activeFilter));
    }
    if (query && searchKeys) {
      const q = query.toLowerCase();
      result = result.filter((r) => searchKeys(r).toLowerCase().includes(q));
    }
    return result;
  }, [rows, query, activeFilter, filters, filterFn, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      {(searchKeys || filters) && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 pt-5 pb-1">
          {searchKeys && (
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full text-sm bg-teal-50 border border-line rounded-lg pl-8 pr-3 py-2 outline-none focus:border-teal-700 focus:bg-panel"
              />
            </div>
          )}
          {filters && (
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setActiveFilter(f.value);
                    setPage(1);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    activeFilter === f.value
                      ? "bg-teal-800 border-teal-800 text-white"
                      : "border-line text-slate-500 hover:border-teal-700 hover:text-teal-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={Inbox} title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-t border-line text-left">
                  {columns.map((c, i) => (
                    <th key={i} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                      {c.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr key={rowKey(row)} className="border-t border-line hover:bg-teal-50/60 transition-colors">
                    {columns.map((c, i) => (
                      <td key={i} className={`px-5 py-3.5 align-middle ${c.className ?? ""}`}>
                        {c.accessor(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-line">
              <p className="text-xs text-slate-500">
                Page {page} of {totalPages} · {filtered.length} records
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 grid place-items-center rounded-lg border border-line disabled:opacity-40 hover:bg-teal-50"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 grid place-items-center rounded-lg border border-line disabled:opacity-40 hover:bg-teal-50"
                  aria-label="Next page"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
