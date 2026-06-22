"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { normalizeZip } from "@/lib/geo/zip";

// Location box for the home "Support in your area" section. Writes the
// searcher's zip into the `near` query param; the page RSC re-renders and
// swaps the curated featured set for the nearest providers. Accepts a bare
// zip or free text containing one ("Boulder, CO 80301"); a 5-digit zip is
// pulled out on submit. Clearing it returns to the featured set.
//
// Imports only the client-safe helper from lib/geo/zip — never lib/geo —
// so the zipcodes dataset stays out of the client bundle.
export function HomeLocationSearch({ initialZip }: { initialZip: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialZip);

  function apply() {
    const zip = normalizeZip(value) ?? "";
    // scroll:false keeps the viewer on this section rather than jumping to
    // the top of the page when the results re-render.
    router.push(zip ? `/?near=${zip}` : "/", { scroll: false });
  }

  return (
    <div className="flex items-center gap-2.5 bg-white border border-line rounded-[8px] px-4 py-2.5">
      <span className="text-[13px] text-cm whitespace-nowrap">Showing results near:</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") apply();
        }}
        inputMode="numeric"
        autoComplete="postal-code"
        placeholder="Enter your zip code"
        aria-label="Search providers by zip code"
        className="flex-1 min-w-0 border-0 bg-transparent font-sans text-[13px] text-tr font-medium outline-none placeholder:text-cl placeholder:font-normal"
      />
      <button onClick={apply} className="btn-secondary btn-sm">
        Change
      </button>
    </div>
  );
}
