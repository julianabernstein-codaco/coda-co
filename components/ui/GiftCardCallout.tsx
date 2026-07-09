import Link from "next/link";

// Cross-page promo for gift cards: a friend / colleague / loved one who is
// grieving can be given a CodaCo balance to spend when they're ready. Used on
// the homepage, /shop, and /services. Self-contained box (warm paper surface +
// muted clay border) so it reads as distinct on white, sage, or terracotta
// section backgrounds without being loud.
export function GiftCardCallout() {
  return (
    <div className="rounded-[16px] border border-tr-l bg-pl2 overflow-hidden">
      <div className="flex flex-col items-center gap-6 px-6 py-7 text-center sm:flex-row sm:gap-8 sm:px-10 sm:py-8 sm:text-left">
        <GiftCardArt />
        <div className="flex-1">
          <p className="text-[13px] tracking-[.14em] uppercase text-tr mb-1.5">
            A gift of support
          </p>
          <h3 className="font-serif text-[24px] sm:text-[26px] font-light text-ch mb-2 leading-snug">
            Give a CodaCo gift card
          </h3>
          <p className="text-[16px] text-cm leading-relaxed max-w-[600px] mx-auto sm:mx-0">
            For a friend, colleague, or loved one who is grieving — a balance they can put
            toward the goods and services they need, whenever they&apos;re ready. Give on your
            own or invite others to chip in together.
          </p>
        </div>
        <Link
          href="/gift-cards"
          className="btn-primary btn-md no-underline whitespace-nowrap shrink-0"
        >
          Give a gift card
        </Link>
      </div>
    </div>
  );
}

// Hand-drawn gift-card-with-a-heart motif. SVG uses literal brand hex (allowed
// for SVG per AGENTS.md — it can't reference CSS vars cleanly).
function GiftCardArt() {
  return (
    <svg
      width="116"
      height="116"
      viewBox="0 0 116 116"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* back card, tilted */}
      <rect
        x="16"
        y="40"
        width="74"
        height="48"
        rx="8"
        transform="rotate(-7 53 64)"
        fill="#F5EAE6"
        stroke="#D4876F"
        strokeWidth="2"
      />
      {/* front card */}
      <rect x="26" y="44" width="74" height="48" rx="8" fill="#FFFFFF" stroke="#C1634F" strokeWidth="2" />
      {/* stripe */}
      <rect x="26" y="55" width="74" height="7" fill="#EAF0EB" />
      {/* text lines */}
      <line x1="36" y1="74" x2="70" y2="74" stroke="#A8C4AC" strokeWidth="3" strokeLinecap="round" />
      <line x1="36" y1="82" x2="58" y2="82" stroke="#A8C4AC" strokeWidth="3" strokeLinecap="round" />
      {/* heart badge */}
      <path
        d="M86 24c-3-5-11-3-11 2.5C75 32 86 38 86 38s11-6 11-11.5C97 21 89 19 86 24z"
        fill="#C1634F"
      />
      {/* sparkles */}
      <path d="M28 30l1.6 4.4L34 36l-4.4 1.6L28 42l-1.6-4.4L22 36l4.4-1.6L28 30z" fill="#7A9E82" />
      <circle cx="100" cy="58" r="2.5" fill="#D4876F" />
    </svg>
  );
}
