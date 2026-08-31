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

Source: the **"Best Est, 3 Year Projections"** tab (the first tab) of
**"CodaCo Market Projections 2026.xlsx"** in Google Drive, read 31 Aug 2026.
It runs Sep '26 – Dec '29 across five metros plus shipped goods (makers who
ship nationwide and so are not geo-bound).

Mechanics:

- Launch **1 November 2026**.
- Revenue is **subscribing vendors × monthly price**, and nothing else. No
  goods transaction revenue, no gift cards, no client billing, no sponsorship.
- A vendor's first payment lands **three months after signup** — the free
  trial in `lib/data/plans.ts`. A September '26 signup first bills in
  December '26.
- **~10% attrition** on each arriving cohort.
- Price steps from **$29 to $39/month in December 2028**.

### Reconciliation

All three stated annual totals tie **exactly** to the sheet's own Monthly
Revenue row:

| | Stated | Monthly Revenue row | Sum of the six market rows |
|---|---|---|---|
| Year 1 (Nov '26 – Oct '27) | $101,848 | $101,848 ✓ | $101,848 ✓ |
| Year 2 (Nov '27 – Oct '28) | $369,837 | $369,837 ✓ | $375,985 |
| Year 3 (Nov '28 – Oct '29) | $953,420 | $953,420 ✓ | $953,420 ✓ |

Slide 6 charts the market rows for Year 1, where the two agree. Slide 7 uses
the stated annual totals.

### Three defects in the source sheet

These are recorded here so they are not rediscovered, and so nobody assumes
the deck introduced them. **The deck reproduces the sheet as-is** — none of
this is silently corrected.

1. **Seattle's subscriber row does not accumulate.** It oscillates — 20, 50,
   80, 25, 25, 20, 50, 80, 105, 50, 50, 38 — as though it sums a rolling
   window rather than a running total. Seattle's revenue consequently *falls*
   ten separate times, most visibly from $2,233 in Jul '27 to $638 in Aug '27;
   every other market is monotonic. The effect is large: Seattle recruits
   **495 vendors, more than Portland's 398**, yet ends Year 3 at $4,914/month
   against Portland's $13,884. Rebuilt on the same mechanic as Portland and
   Denver, Seattle would be roughly **$183K in Year 3 rather than $47K**, and
   the three-year total about **$206K higher**. This is visible on slide 6 as
   a Seattle band that shrinks after July.
2. **Denver's revenue row repeats a month.** $6,757 appears twice (May and
   Jun '28), leaving that row one month behind its own vendor count from then
   on — worth roughly $200/month.
3. **The Monthly Revenue total row disagrees with the market rows in two
   months**: Apr '28 (row $22,649, markets $29,058) and May '28 (row $31,900,
   markets $31,639). This is the whole of the Year 2 discrepancy above.

### Headline figures

| Figure | Value | Window |
|---|---|---|
| Year 1 revenue | $101,848 | Nov '26 – Oct '27 |
| Year 2 revenue | $369,837 | Nov '27 – Oct '28 |
| Year 3 revenue | $953,420 | Nov '28 – Oct '29 |
| Three-year total | $1,425,105 | |
| Paying vendors | 567 | Oct '27 |
| Exit monthly revenue, Year 1 | $16,443 (≈ $197K ARR) | Oct '27 |
| Exit monthly revenue, Year 3 | $92,781 (≈ $1.11M ARR) | Dec '29 |

### Market rollout

"First revenue" is the first month with a paying vendor — three months after
that market starts recruiting. Population and vendor columns are the sheet's
own and are internally consistent (population ÷ vendors = population per
vendor).

| Market | First revenue | Metro pop. | Vendors | Pop. per vendor |
|---|---|---|---|---|
| Portland | Dec '26 | 2.5M | 398 | 6,281 |
| Denver | Dec '26 | 3.0M | 418 | 7,177 |
| Seattle | May '27 | 4.1M | 495 | 8,283 |
| Los Angeles | Aug '27 | 12.9M | 644 | 20,031 |
| New York | Dec '27 | 20.0M | 476 | 42,017 |
| Shipped goods | Dec '26 | Nationwide | — | — |

Five metros, 2,431 vendors. The penetration spread is the model's
conservatism: New York is assumed at one vendor per 42,017 residents against
Portland's one per 6,281.

The sheet's "Total New Vendors" column reads 148 for shipped goods, but that
row's own monthly signups sum to 530 — the summary cell looks stale, so the
deck shows a dash rather than either number.

## Before sending

- Slide 8 carries a literal `[amount]` placeholder for the raise.
- Slide 2's "~3M deaths in the United States every year" is cited to CDC/NCHS
  and should be refreshed against the latest published year.
- Slide 5 shows today's $29/month pricing; slide 7 is where the modelled step
  to $39 is explained. Keep those two consistent if either changes.
- The live URL throughout is the Vercel preview domain; swap it for the
  production domain at launch.
