"use client";

import { useState } from "react";
import { useFilterParams } from "@/lib/hooks/useFilterParams";

// Free-text "what" box for the services search. Writes the `q` URL param;
// getVendors matches it against provider name, bio, service description,
// and credentials. Applies on Enter or blur (mirrors LocationSearch); the
// guarded compare avoids a redundant navigation when nothing changed.
export function ServiceKeywordSearch() {
  const { get, setParam } = useFilterParams();
  const [value, setValue] = useState(get("q"));

  function apply() {
    const next = value.trim();
    if (next !== get("q")) setParam("q", next);
  }

  return (
    <div className="flex flex-1 min-w-[200px] border-[1.5px] border-[rgba(193,99,79,.22)] rounded-[8px] overflow-hidden bg-white">
      <div className="px-3 py-2.5 border-r border-line flex items-center">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="#9A9189" strokeWidth="1.3" />
          <line x1="11" y1="11" x2="15" y2="15" stroke="#9A9189" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </div>
      <input
        className="flex-1 border-0 px-3.5 py-2.5 font-sans text-[13px] text-ch outline-none bg-transparent"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={apply}
        onKeyDown={(e) => {
          if (e.key === "Enter") apply();
        }}
        placeholder="Search providers…"
        aria-label="Search providers by keyword"
      />
    </div>
  );
}
