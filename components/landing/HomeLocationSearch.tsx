"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { normalizeZip } from "@/lib/geo/zip";

// Location box for the home "Support in your area" section. On submit it
// hands off to the full /services search with the searcher's zip in the
// `near` param, so they land on the complete, filterable results list
// (rather than filtering a teaser grid in place).
//
// Imports only the client-safe helper from lib/geo/zip — never lib/geo —
// so the zipcodes dataset stays out of the client bundle.
export function HomeLocationSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function search() {
    const zip = normalizeZip(value) ?? "";
    // A resolvable zip pre-filters the services search; anything else just
    // opens the full provider list.
    router.push(zip ? `/services?near=${zip}` : "/services");
  }

  return (
    <div className="flex items-center gap-2.5 bg-white border border-line rounded-[8px] px-4 py-2.5">
      <span className="text-[15px] text-cm whitespace-nowrap">Find providers near you:</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") search();
        }}
        inputMode="numeric"
        autoComplete="postal-code"
        placeholder="Enter your zip code"
        aria-label="Search providers by zip code"
        className="flex-1 min-w-0 border-0 bg-transparent font-sans text-[15px] text-tr font-medium outline-none placeholder:text-cl placeholder:font-normal"
      />
      <button onClick={search} className="btn-secondary btn-sm">
        Search
      </button>
    </div>
  );
}
