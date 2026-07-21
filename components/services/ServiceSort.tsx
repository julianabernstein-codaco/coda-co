"use client";

import { useFilterParams } from "@/lib/hooks/useFilterParams";

const OPTIONS = [
  { value: "best", label: "Best match" },
  { value: "rating", label: "Rating: high to low" },
  { value: "nearest", label: "Nearest first" },
  { value: "most-reviewed", label: "Most reviewed" },
];

// Sort control for the services results. Writes the `sort` URL param; the
// page RSC orders the vendor list to match. "Best match" is the default
// and clears the param to keep the URL clean.
export function ServiceSort() {
  const { get, setParam } = useFilterParams();
  const active = get("sort") || "best";

  return (
    <div className="flex items-center gap-[7px]">
      <label className="text-[14px] text-ink">Sort by</label>
      <select
        value={active}
        onChange={(e) => setParam("sort", e.target.value === "best" ? "" : e.target.value)}
        className="text-[14px] text-cm border border-line-bold rounded-[6px] px-2.5 py-[5px] bg-white font-sans outline-none cursor-pointer"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
