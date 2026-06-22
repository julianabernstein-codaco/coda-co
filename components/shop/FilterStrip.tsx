"use client";

import { useFilterParams } from "@/lib/hooks/useFilterParams";
import { FilterPill } from "@/components/ui/filters/FilterPill";
import { LifeStageChips } from "@/components/ui/filters/LifeStageChips";

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
  const { get, setParams } = useFilterParams();
  const activeCategory = get("category");
  const activeSort = get("sort") || "featured";
  const activeQuery = get("q");

  return (
    <div className="mb-6 space-y-2">
      <LifeStageChips />
      {activeQuery && (
        <div className="flex items-center gap-2 text-[13px] text-cm">
          <span>
            Results for <strong className="text-ch">“{activeQuery}”</strong>
          </span>
          <button
            onClick={() => setParams({ q: "", page: "" })}
            className="text-[12px] text-tr bg-transparent border-0 font-sans cursor-pointer underline hover:text-tr-d"
          >
            Clear search
          </button>
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[13px] text-cl mr-1">Filter:</span>
        {CATEGORIES.map((cat) => (
          <FilterPill
            key={cat.value}
            label={cat.label}
            active={activeCategory === cat.value}
            onClick={() => setParams({ category: cat.value, page: "" })}
          />
        ))}

        <div className="ml-auto flex items-center gap-2 text-[13px] text-cm">
          <span>Sort:</span>
          <select
            value={activeSort}
            onChange={(e) => setParams({ sort: e.target.value, page: "" })}
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
    </div>
  );
}
