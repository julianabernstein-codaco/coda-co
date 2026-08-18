"use client";

import { useFilterParams } from "@/lib/hooks/useFilterParams";

// "Results for X · Clear search" line shown above the goods grid when a
// keyword search is active. Split out of the old <FilterStrip> when the
// category filters moved into the left rail.
export function SearchNotice() {
  const { get, setParams } = useFilterParams();
  const query = get("q");

  if (!query) return null;

  return (
    <div className="flex items-center gap-2 text-[15px] text-cm mb-4">
      <span>
        Results for <strong className="text-ch">“{query}”</strong>
      </span>
      <button
        onClick={() => setParams({ q: "", page: "" })}
        className="text-[14px] text-tr bg-transparent border-0 font-sans cursor-pointer underline hover:text-tr-d"
      >
        Clear search
      </button>
    </div>
  );
}
