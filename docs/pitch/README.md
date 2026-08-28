# Pitch deck

`CodaCo-Pitch-Deck.pptx` — a 7-slide investor overview. Regenerate it with:

```bash
node docs/pitch/build-deck.mjs docs/pitch/CodaCo-Pitch-Deck.pptx
```

The generator needs `pptxgenjs`, which is **not** a project dependency (the
deck is not part of the app build). Install it ad hoc:

```bash
npm install --no-save pptxgenjs
```

Edit `build-deck.mjs` rather than the `.pptx` when a change should stick — the
`.pptx` is a build output and gets overwritten.

## Slides

| # | Slide | Sourced from |
|---|---|---|
| 1 | Title | Homepage hero copy (`app/page.tsx`) |
| 2 | The problem | `/about` ethos + purpose copy |
| 3 | The solution | `prisma/seed.ts` product/service types, `/what-is-codaco` |
| 4 | The product, built and live | `docs/data-model-evolution.md` phases A–D, `LAUNCH.md`, `TASKS.md` |
| 5 | Business model | `lib/data/plans.ts`, `/list-with-us` FAQ |
| 6 | Year 1 projections | Founders' spreadsheet — see below |
| 7 | Team and the ask | `/company` founder bios |

## Fonts

The deck uses **Cambria** (headings) and **Calibri** (body) rather than the
site's Crimson Pro / Nunito Sans. Both ship with Microsoft Office, so the deck
renders identically on any reviewer's machine; the web fonts would silently
substitute. Brand identity is carried by the palette, which is the exact
`@theme` token set from `app/globals.css`.

## Year 1 model

The figures on slide 6 are the founders' projection, transcribed verbatim into
the `YEAR1` constant in `build-deck.mjs`. Its mechanics:

- Launch **1 November 2026**; the sheet runs Sep '26 – Dec '27 (16 months).
- Three markets: **Portland**, **Denver**, and **Elsewhere** (shipped goods,
  which are not geo-bound).
- Revenue is **cumulative paying vendors × $29/month**, nothing else. No goods
  transaction revenue, no gift cards, no client billing, no sponsorship.
- A vendor's first payment lands **three months after signup** — the free
  trial in `lib/data/plans.ts`. A September signup first bills in December.
- **Zero churn** is assumed. This is the model's most optimistic input.

Derived headline numbers, all internally consistent with the monthly rows:

| Figure | Value | Window |
|---|---|---|
| Year 1 revenue | $38,077 | Sep '26 – Aug '27 |
| Paying vendors at end of Year 1 | 254 | Aug '27 |
| Monthly revenue | $10,295 (≈ $124K ARR) | Dec '27 |
| Cumulative revenue | $74,791 | Sep '26 – Dec '27 |

## Before sending

- Slide 7 carries a literal `[amount]` placeholder for the raise.
- Slide 2's "~3M deaths in the United States every year" is cited to CDC/NCHS
  and should be refreshed against the latest published year.
- The live URL throughout is the Vercel preview domain; swap it for the
  production domain at launch.
