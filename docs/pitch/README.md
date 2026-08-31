# Pitch deck

`CodaCo-Pitch-Deck.pptx` — an 8-slide investor overview. Regenerate it with:

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
| 6 | Year 1, monthly by market | Founders' spreadsheet — see below |
| 7 | Years 1–3 | Founders' spreadsheet — see below |
| 8 | Team and the ask | `/company` founder bios |

## Fonts

The deck uses **Cambria** (headings) and **Calibri** (body) rather than the
site's Crimson Pro / Nunito Sans. Both ship with Microsoft Office, so the deck
renders identically on any reviewer's machine; the web fonts would silently
substitute. Brand identity is carried by the palette, which is the exact
`@theme` token set from `app/globals.css`.

## The projection model

The figures come from the founders' spreadsheet, which runs Sep '26 – Dec '29
across six revenue blocks: Portland, Denver, Seattle, Los Angeles, New York,
and shipped goods (makers who ship nationwide and so are not geo-bound).

Mechanics:

- Launch **1 November 2026**.
- Revenue is **subscribing vendors × monthly price**, and nothing else. No
  goods transaction revenue, no gift cards, no client billing, no sponsorship.
- A vendor's first payment lands **three months after signup** — the free
  trial in `lib/data/plans.ts`. A September '26 signup first bills in
  December '26.
- **10% attrition** is written off each converting cohort.
- Price steps from **$29 to $39/month in December 2028**.

### What is reconciled, and what is not

The numbers were transcribed from a screenshot of the sheet, so every figure
in the deck was checked before use. Revenue in this model is always an integer
vendor count times $29 or $39, which makes each cell self-checking, and the
sheet's own monthly total row provides a second independent check.

**Year 1 is reconciled exactly.** The twelve months Nov '26 – Oct '27 in
`YEAR1` sum to **$91,147**, matching the sheet's stated Year 1 total, and each
month matches the sheet's own total row ($1,972, $3,393, $4,872, $6,293,
$7,482, $8,671, $9,860, $10,759, $11,571 …). That reconciliation is what
established two facts the deck relies on: Seattle opens in the *last* month of
Year 1, and the price step falls in Dec '28.

**Years 2 and 3 are not.** A month-by-month reconstruction lands within $8 of
the stated $324,104 and within 0.33% of the stated $950,244 — close enough to
confirm the model's structure, not close enough to publish. The residual points
to a one-column misalignment in the Denver row that could not be resolved from
the screenshot. Slide 7 therefore shows the founders' **annual totals as
given** and does not chart a derived monthly series for years 2 and 3.

If the source spreadsheet becomes available as CSV or XLSX, replacing the
`YEAR1` / `ANNUAL` constants with exact values — and adding the year 2–3
monthly build to slide 7 — is the natural follow-up.

### Headline figures

| Figure | Value | Window |
|---|---|---|
| Year 1 revenue | $91,147 | Nov '26 – Oct '27 |
| Year 2 revenue | $324,104 | Nov '27 – Oct '28 |
| Year 3 revenue | $950,244 | Nov '28 – Oct '29 |
| Paying vendors | 480 | Oct '27 |
| Exit monthly revenue, Year 1 | $13,920 (≈ $167K ARR) | Oct '27 |
| Vendors onboarded across the model | 2,275 | through Dec '29 |

### Market rollout

Metro population and vendor counts are the sheet's own summary columns, and
are internally consistent (population ÷ vendors = population per vendor).

| Market | Opens | Metro pop. | Vendors | Pop. per vendor |
|---|---|---|---|---|
| Portland | Nov '26 | 2.5M | 398 | 6,281 |
| Denver | Nov '26 | 3.0M | 418 | 7,177 |
| Seattle | Oct '27 | 4.1M | 447 | 9,172 |
| Los Angeles | Apr '28 | 12.9M | 450 | 28,667 |
| New York | Apr '28 | 20.0M | 414 | 48,309 |
| Shipped goods | Nov '26 | Nationwide | 148 | — |

The penetration spread is the model's conservatism: New York is assumed at one
vendor per 48,309 residents against Portland's one per 6,281.

## Before sending

- Slide 8 carries a literal `[amount]` placeholder for the raise.
- Slide 2's "~3M deaths in the United States every year" is cited to CDC/NCHS
  and should be refreshed against the latest published year.
- Slide 5 shows today's $29/month pricing; slide 7 is where the modelled step
  to $39 is explained. Keep those two consistent if either changes.
- The live URL throughout is the Vercel preview domain; swap it for the
  production domain at launch.
