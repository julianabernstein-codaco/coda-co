"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { FaqList } from "@/components/list-with-us/FaqList";
import type { GuidanceTopic } from "@/components/faq/content";

// Duotone topic icons: a filled light-tone shape with dark-tone line detail,
// set inside a soft tinted circle badge. Tone alternates sage/terracotta across
// the cards (assigned by index below). Literal hex is the sanctioned exception
// for SVG fills/strokes — CSS tokens can't be referenced from SVG attributes.
type Tone = { fill: string; stroke: string; badge: string; hover: "sage" | "terracotta" };

const SAGE: Tone = { fill: "#A8C4AC", stroke: "#4D7255", badge: "bg-sg-p", hover: "sage" };
const TERRA: Tone = { fill: "#D4876F", stroke: "#8B3E2D", badge: "bg-tr-p", hover: "terracotta" };

const icons: Record<string, (t: Tone) => ReactNode> = {
  // First steps / paperwork — a document with lines.
  "when-someone-dies": ({ fill, stroke }) => (
    <svg width="24" height="24" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="7" y="4.5" width="12" height="17" rx="1.6" fill={fill} stroke={stroke} strokeWidth="1.3" />
      <line x1="9.8" y1="9" x2="16.2" y2="9" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="9.8" y1="12" x2="16.2" y2="12" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="9.8" y1="15" x2="13.5" y2="15" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  // Body disposition / green burial — a leaf with a vein.
  "funerals-and-body-disposition": ({ fill, stroke }) => (
    <svg width="24" height="24" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path d="M6 20C6 12 12 6 20 6c0 8-6 14-14 14Z" fill={fill} stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M9 17 17 9M12 15.5l3.2-.4M10.5 13l.4-3.2" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  // Companioning support — a heart.
  "death-doulas": ({ fill, stroke }) => (
    <svg width="24" height="24" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path d="M13 20.5C6.5 16 5 11.5 8 9.3c1.8-1.3 3.6-.3 5 1.5 1.4-1.8 3.2-2.8 5-1.5 3 2.2 1.5 6.7-5 11.2Z" fill={fill} stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  // Care at home — a house sheltering a heart.
  "hospice-care": ({ fill, stroke }) => (
    <svg width="24" height="24" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path d="M5 12.5 13 6l8 6.5V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.5Z" fill={fill} stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M13 18.5c-2.2-1.5-2.8-3-1.7-3.9.66-.54 1.3-.1 1.7.55.4-.65 1.04-1.09 1.7-.55 1.1.9.5 2.4-1.7 3.9Z" fill={stroke} />
    </svg>
  ),
  // Sorting belongings — a lidded box.
  "death-cleaning": ({ fill, stroke }) => (
    <svg width="24" height="24" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="5" y="9.5" width="16" height="11" rx="1" fill={fill} stroke={stroke} strokeWidth="1.3" />
      <rect x="3.8" y="6" width="18.4" height="4" rx="1" fill={fill} stroke={stroke} strokeWidth="1.3" />
      <line x1="10.5" y1="14" x2="15.5" y2="14" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
};

const toneForIndex = (i: number): Tone => (i % 2 === 0 ? SAGE : TERRA);

function answerText(faq: GuidanceTopic["faqs"][number]): string {
  return faq.searchText ?? (typeof faq.a === "string" ? faq.a : "");
}

export function GuidanceHub({ topics }: { topics: GuidanceTopic[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  // Land at the top on load (see FaqBrowser note); skip when deep-linking.
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, []);

  const results = q
    ? topics
        .map((topic) => ({
          ...topic,
          faqs: topic.faqs.filter(
            (faq) =>
              faq.q.toLowerCase().includes(q) ||
              answerText(faq).toLowerCase().includes(q),
          ),
        }))
        .filter((topic) => topic.faqs.length > 0)
    : [];

  return (
    <div>
      {/* Search */}
      <div className="relative max-w-[500px] mx-auto mb-10">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="absolute left-5 top-1/2 -translate-y-1/2"
        >
          <circle cx="7" cy="7" r="5" stroke="#4D7255" strokeWidth="1.5" />
          <line x1="11" y1="11" x2="15" y2="15" stroke="#4D7255" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guidance…"
          aria-label="Search guidance"
          className="w-full pl-12 pr-5 py-3.5 border-[1.5px] border-sg-l focus:border-sg rounded-[28px] bg-white text-[14px] text-ch outline-none placeholder:text-cl"
        />
      </div>

      {q ? (
        results.length === 0 ? (
          <p className="text-center text-[14px] text-cm leading-[1.7]">
            We couldn&apos;t find anything matching{" "}
            <span className="text-ch font-medium">
              &ldquo;{query.trim()}&rdquo;
            </span>
            . Try a different word, or browse the topics by clearing your search.
          </p>
        ) : (
          <div className="space-y-9">
            {results.map((topic) => (
              <div key={topic.slug}>
                <Link
                  href={`/guidance/${topic.slug}`}
                  className="text-overline text-sg-d mb-1 inline-block hover:underline"
                >
                  {topic.heading}
                </Link>
                {/* Remount on query change so accordion state resets per search */}
                <FaqList key={q} faqs={topic.faqs} />
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          {topics.map((topic, i) => {
            const tone = toneForIndex(i);
            return (
            <Card
              key={topic.slug}
              href={`/guidance/${topic.slug}`}
              hoverTone={tone.hover}
            >
              <div className="flex items-start gap-3.5">
                <span
                  className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${tone.badge}`}
                  aria-hidden="true"
                >
                  {icons[topic.slug](tone)}
                </span>
                <div>
                  <h2 className="font-serif text-[19px] font-normal text-ch mb-1 leading-snug">
                    {topic.heading}
                  </h2>
                  <p className="text-[13px] text-cl leading-[1.55]">
                    {topic.blurb}
                  </p>
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
