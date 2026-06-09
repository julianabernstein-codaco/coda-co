"use client";

import { useState } from "react";
import Link from "next/link";
import { FaqList } from "@/components/list-with-us/FaqList";

export interface FaqCategory {
  heading: string;
  faqs: { q: string; a: string }[];
}

export function FaqBrowser({ categories }: { categories: FaqCategory[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filtered = q
    ? categories
        .map((cat) => ({
          ...cat,
          faqs: cat.faqs.filter(
            (faq) =>
              faq.q.toLowerCase().includes(q) ||
              faq.a.toLowerCase().includes(q),
          ),
        }))
        .filter((cat) => cat.faqs.length > 0)
    : categories;

  const totalMatches = filtered.reduce((n, cat) => n + cat.faqs.length, 0);

  return (
    <div>
      {/* Search — mirrors the landing HeroSearch input, wired to live filter */}
      <div className="relative max-w-[500px] mx-auto mb-10">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="absolute left-5 top-1/2 -translate-y-1/2"
        >
          <circle cx="7" cy="7" r="5" stroke="#C1634F" strokeWidth="1.5" />
          <line
            x1="11"
            y1="11"
            x2="15"
            y2="15"
            stroke="#C1634F"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions…"
          aria-label="Search frequently asked questions"
          className="w-full pl-12 pr-5 py-3.5 border-[1.5px] border-[rgba(193,99,79,.25)] rounded-[28px] bg-white text-[14px] text-ch outline-none focus:border-tr placeholder:text-cl"
        />
      </div>

      {totalMatches === 0 ? (
        <p className="text-center text-[14px] text-cm leading-[1.7]">
          We couldn&apos;t find anything matching{" "}
          <span className="text-ch font-medium">
            &ldquo;{query.trim()}&rdquo;
          </span>
          . Try a different word, or{" "}
          <Link href="/where-to-start" className="text-tr hover:underline">
            start here
          </Link>{" "}
          for a gentle guide.
        </p>
      ) : (
        <div className="space-y-9">
          {filtered.map((cat) => (
            <div key={cat.heading}>
              <h3 className="text-overline text-tr mb-1">{cat.heading}</h3>
              {/* Remount on query change so accordion state resets per search */}
              <FaqList key={q} faqs={cat.faqs} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
