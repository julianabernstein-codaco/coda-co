"use client";

import { useFilterParams } from "@/lib/hooks/useFilterParams";
import { FilterPill } from "@/components/ui/filters/FilterPill";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "urns", label: "Urns & vessels" },
  { value: "jewelry", label: "Ash jewelry" },
  { value: "shrouds", label: "Burial shrouds" },
  { value: "planning", label: "Planning docs" },
  { value: "memorial", label: "Memorial items" },
  { value: "humor", label: "Gifts & humor" },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "most-reviewed", label: "Most reviewed" },
];

export function FilterStrip() {
  const { get, setParam } = useFilterParams();
  const activeCategory = get("category");
  const activeSort = get("sort") || "featured";

  return (
    <div className="flex items-center gap-2 flex-wrap mb-6">
      <span className="text-[13px] text-cl mr-1">Filter:</span>
      {CATEGORIES.map((cat) => (
        <FilterPill
          key={cat.value}
          label={cat.label}
          active={activeCategory === cat.value}
          onClick={() => setParam("category", cat.value)}
        />
      ))}

      <div className="ml-auto flex items-center gap-2 text-[13px] text-cm">
        <span>Sort:</span>
        <select
          value={activeSort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="border border-line-bold rounded-[6px] px-2 py-1 text-[13px] text-cm bg-white cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
