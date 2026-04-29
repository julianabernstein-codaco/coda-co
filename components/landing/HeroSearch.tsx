"use client";

import { useState } from "react";
import Link from "next/link";
import { GuidedSearch } from "./GuidedSearch";

export function HeroSearch() {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <>
      <div className="flex max-w-[500px] mx-auto mb-4">
        <input
          type="text"
          placeholder="Search goods, services, books…"
          className="flex-1 px-5 py-3.5 border-[1.5px] border-r-0 border-[rgba(193,99,79,.25)] rounded-l-[28px] bg-white text-[14px] text-ch outline-none focus:border-tr placeholder:text-cl"
        />
        <button className="bg-tr text-white border-0 px-6 py-3.5 rounded-r-[28px] text-[13px] cursor-pointer hover:bg-tr-d transition-colors">
          Search
        </button>
      </div>

      <p className="text-[13px] text-cl mb-1">
        Someone I love just died —{" "}
        <Link
          href="/where-to-start"
          className="text-tr cursor-pointer border-b border-dotted border-tr-l no-underline hover:text-tr-d"
        >
          I don&apos;t know where to start →
        </Link>
      </p>
      <p className="text-[13px] text-cl">
        <button
          onClick={() => setGuideOpen((v) => !v)}
          className="text-tr cursor-pointer border-b border-dotted border-tr-l bg-transparent border-x-0 border-t-0 p-0 font-sans text-[13px] hover:text-tr-d"
        >
          Or answer a few questions to find what you need {guideOpen ? "↑" : "↓"}
        </button>
      </p>

      <GuidedSearch open={guideOpen} />
    </>
  );
}
