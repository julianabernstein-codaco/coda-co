"use client";

import { useFilterParams } from "@/lib/hooks/useFilterParams";
import { FilterDivider } from "@/components/ui/filters/FilterDivider";
import { FilterPill } from "@/components/ui/filters/FilterPill";
import { FilterPillGroup } from "@/components/ui/filters/FilterPillGroup";
import { FilterSection } from "@/components/ui/filters/FilterSection";
import { LifeStageChips } from "@/components/ui/filters/LifeStageChips";

const CATEGORIES = [
  { value: "", label: "All goods" },
  { value: "urns", label: "Urns & vessels" },
  { value: "jewelry", label: "Ash jewelry" },
  { value: "shrouds", label: "Burial shrouds" },
  { value: "planning", label: "Planning docs" },
  { value: "memorial", label: "Memorial items" },
  { value: "humor", label: "Gifts & humor" },
];

// Left-hand filter rail for /shop, mirroring <ServiceFilters> on /services:
// category first, then the life-stage ("Relevance") chips as a stacked
// section below it, so every filter lives in one column.
export function ShopFilters() {
  const { get, setParams, clearAll } = useFilterParams();
  const activeCategory = get("category");

  return (
    <div className="pt-6 pr-5 pb-8 border-r border-line">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[15px] font-medium text-ch">Filters</span>
        <button
          onClick={clearAll}
          className="text-[14px] text-ink bg-transparent border-0 font-sans cursor-pointer underline hover:text-tr"
        >
          Clear all
        </button>
      </div>

      <FilterSection heading="Category">
        <FilterPillGroup>
          {CATEGORIES.map((cat) => (
            <FilterPill
              key={cat.value}
              label={cat.label}
              active={activeCategory === cat.value}
              onClick={() => setParams({ category: cat.value, page: "" })}
            />
          ))}
        </FilterPillGroup>
      </FilterSection>

      <FilterDivider />

      <LifeStageChips layout="stack" />
    </div>
  );
}
