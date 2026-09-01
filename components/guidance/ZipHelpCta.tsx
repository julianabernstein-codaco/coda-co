"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { normalizeZip } from "@/lib/geo/zip";

// The "help near you" call to action on /guidance. It reads as a button —
// matching the paired browse link beside it — and only opens a zip field
// once it's clicked, so the callout stays a two-button row at rest.
//
// On submit it hands off to the full /services search with the searcher's
// zip in the `near` param, the same contract <HomeLocationSearch> uses.
// Imports only the client-safe helper from lib/geo/zip — never lib/geo —
// so the zipcodes dataset stays out of the client bundle.
export function ZipHelpCta({
  className = "",
  lifeStage,
}: {
  className?: string;
  /** Optional `lifeStage` filter carried through to the results page. */
  lifeStage?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  function search() {
    const zip = normalizeZip(value);
    // A resolvable zip pre-filters the services search; anything else just
    // opens the provider list (still narrowed to the requested stages).
    const query = [
      zip ? `near=${zip}` : null,
      lifeStage ? `lifeStage=${encodeURIComponent(lifeStage)}` : null,
    ]
      .filter(Boolean)
      .join("&");
    router.push(query ? `/services?${query}` : "/services");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`btn-primary btn-lg ${className}`}
      >
        Enter your zip code for help near you
      </button>
    );
  }

  return (
    <div
      className={`flex items-center gap-2.5 bg-white border border-line rounded-pill pl-5 pr-2 py-1.5 ${className}`}
    >
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") search();
        }}
        inputMode="numeric"
        autoComplete="postal-code"
        placeholder="Enter your zip code"
        aria-label="Find help near you by zip code"
        className="w-[150px] border-0 bg-transparent font-sans text-[15px] text-tr font-medium outline-none placeholder:text-cl placeholder:font-normal"
      />
      <button type="button" onClick={search} className="btn-primary btn-sm">
        Find help →
      </button>
    </div>
  );
}
