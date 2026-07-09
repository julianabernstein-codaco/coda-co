"use client";

import { useFilterParams } from "@/lib/hooks/useFilterParams";

// Prev/Next pager for the shop grid. Page state lives in the `page` URL
// param; the page RSC reads it, clamps it to the valid range, and slices
// the sorted results. Page 1 clears the param to keep the URL clean.
export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const { setParam } = useFilterParams();

  if (totalPages <= 1) return null;

  const go = (p: number) => setParam("page", p <= 1 ? "" : String(p));

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className="bg-white border border-line-bold text-cl px-4 py-1.5 rounded-[7px] text-[15px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ← Prev
      </button>
      <span className="text-[15px] text-cm">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        className="bg-tr border-none text-white px-4 py-1.5 rounded-[7px] text-[15px] cursor-pointer hover:bg-tr-d transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  );
}
