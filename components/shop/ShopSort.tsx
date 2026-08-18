"use client";

import { useFilterParams } from "@/lib/hooks/useFilterParams";

const OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "most-reviewed", label: "Most reviewed" },
];

// Sort control for the goods results. Writes the `sort` URL param; the page
// RSC orders the product list to match. "Featured" is the default and clears
// the param to keep the URL clean. Changing the sort resets pagination.
export function ShopSort() {
  const { get, setParams } = useFilterParams();
  const active = get("sort") || "featured";

  return (
    <div className="flex items-center gap-[7px]">
      <label className="text-[14px] text-ink">Sort by</label>
      <select
        value={active}
        onChange={(e) =>
          setParams({ sort: e.target.value === "featured" ? "" : e.target.value, page: "" })
        }
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
