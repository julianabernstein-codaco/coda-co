"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Keyword search into the goods marketplace. Split out from the old
// HeroSearch block so the landing page can place the search bar on its own
// (it now sits at the foot of the page, below the gift-card callout).
export function HeroSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function search() {
    const q = query.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  return (
    <div className="flex max-w-[500px] mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") search();
        }}
        placeholder="Search goods, services, books…"
        aria-label="Search the marketplace"
        className="flex-1 px-5 py-3.5 border-[1.5px] border-r-0 border-[rgba(193,99,79,.25)] rounded-l-[28px] bg-white text-[14px] text-ch outline-none focus:border-tr placeholder:text-cl"
      />
      <button
        onClick={search}
        className="bg-tr text-white border-0 px-6 py-3.5 rounded-r-[28px] text-[13px] cursor-pointer hover:bg-tr-d transition-colors"
      >
        Search
      </button>
    </div>
  );
}
