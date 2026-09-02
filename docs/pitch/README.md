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

## Working process — verify before drafting

When the projection tab changes, **do not go straight to the slides.**

1. Read the tab from Drive and run the reconciliation checks (see
   *Reconciliation* below): annual totals against the sheet's own monthly
   row *and* the sum of the market columns; every month an exact integer
   vendor count × price; no market's revenue falling month-on-month; no
   implausible jumps; and a sanity check on the summary columns against
   the real world (metro populations, vendor totals).
2. **Report what is broken and stop there.** The founders would rather fix
   the sheet first than have slides drafted around bad numbers and redone
   afterwards.
3. Build the slides once the data is confirmed good.

Checks that have earned their place, each having caught a real defect: a
subscriber row that did not accumulate; a duplicated month; a total row
disagreeing with the columns above it; a signup cell reading 1016 instead
of 10; and a population column copied from the wrong tab. Internal
consistency alone is not enough — the last two were internally consistent
and still wrong.

## Slides

| # | Slide | Sourced from |
|---|---|---|
| 1 | Title | Homepage hero copy (`app/page.tsx`) |
| 2 | The problem | `/about` ethos + purpose copy |
| 3 | The solution | `prisma/seed.ts` product/service types, `/what-is-codaco` |
| 4 | The product, built and live | `docs/data-model-evolution.md` phases A–D, `LAUNCH.md`, `TASKS.md` |
| 5 | Business model | `lib/data/plans.ts`, `/list-with-us` FAQ |
| 6 | Year 1, monthly by market | 7-metro tab of the founders' spreadsheet — see below |
| 7 | Years 1–3 | 7-metro tab of the founders' spreadsheet — see below |
| 8 | Team and the ask | `/company` founder bios |

## Fonts

The deck uses **Cambria** (headings) and **Calibri** (body) rather than the
site's Crimson Pro / Nunito Sans. Both ship with Microsoft Office, so the deck
renders identically on any reviewer's machine; the web fonts would silently
substitute. Brand identity is carried by the palette, which is the exact
`@theme` token set from `app/globals.css`.

## The projection model

Source: the **7-metro tab** of **"CodaCo Market Projections 2026.xlsx"** in
Google Drive, read 31 Aug 2026. Its A1 cell still reads *"5 Year
Projections"* — stale; the data runs **38 months, Sep '26 – Oct '29**.

Read it straight from Drive with the Google Drive connector
(`read_file_content` on the file id) — no download or export needed. That call
returns every tab concatenated into one string, so locate the block by its
title row rather than assuming position, and note that the title row does not
always match the tab name.

Seven metros — Portland OR, Denver, Seattle, Madison WI, Portland ME,
Asheville NC, Los Angeles — plus shipped goods.

Mechanics:

- Launch **1 November 2026**.
- Revenue is **subscribing vendors × monthly price**, and nothing else. No
  goods transaction revenue, no gift cards, no client billing, no sponsorship.
- A vendor's first payment lands **three months after signup** — the free
  trial in `lib/data/plans.ts`.
- **Front-loaded churn**, and this is what sets the tab apart: a metro loses
  **30% of each arriving cohort for its first three months**, then settles to
  10%; shipped-goods sellers churn at **50% for six months** before settling.
  The earlier tabs assumed a flat 10% throughout.
- Price steps from **$29 to $39/month in December 2028**.

### Which tab feeds the deck

| | Best Est (tab 1) | More Conservative (tab 2) | **7-metro (in the deck)** |
|---|---|---|---|
| Year 1 | $109,707 | $103,675 | **$84,419** |
| Year 2 | $421,863 | $372,795 | **$312,417** |
| Year 3 | $1,046,949 | $933,011 | **$1,015,031** ⚠ |
| Three-year | $1,578,519 | $1,409,481 | **$1,411,867** ⚠ |

The 7-metro tab trades New York for three smaller markets (Madison, Portland
ME, Asheville) and applies much harsher early churn, which is why Year 1 lands
lowest of the three despite opening more cities. ⚠ = affected by the LA defect
below.

### Reconciliation

| | Stated | Monthly Revenue row | Sum of the eight market rows |
|---|---|---|---|
| Year 1 (Nov '26 – Oct '27) | $84,419 | $84,419 ✓ | $84,419 ✓ |
| Year 2 (Nov '27 – Oct '28) | $312,417 | $312,417 ✓ | $312,417 ✓ |
| Year 3 (Nov '28 – Oct '29) | $1,015,031 | $1,015,031 ✓ | $1,015,031 ✓ |

All 38 months agree between the total row and the market columns, and every
market figure is an exact integer vendor count × price. **Internal
consistency is not the problem here** — the two defects below are inputs that
are internally consistent and still wrong.

### Two defects to fix before this deck is shown

**1. Los Angeles' Dec '28 signup cell reads `1016`.** Every neighbouring
month in that row reads 10 or less. It converts three months later, so LA
jumps from $10,452 in Feb '29 to **$50,037** in Mar '29 — and then *falls*
every month after, which a subscriber base cannot do. The knock-on:

| | As written | With the cell reading 10 |
|---|---|---|
| LA, Mar–Oct '29 | $377,364 | ~$91,065 |
| Year 3 | $1,015,031 | **~$728,732** (−28%) |
| Three-year total | $1,411,867 | ~$1,125,568 |
| Oct '29 run rate | $101,556/mo (≈$1.22M ARR) | ~$66,261/mo (≈$795K ARR) |

Slide 7 carries a caveat line while this stands. Fix the cell, re-read, and
set `YEAR3_VERIFIED = true` in `build-deck.mjs` to drop it.

**2. The metro-population column is carried over from the five-metro tab.**
Four of seven are wrong, and wrong by two orders of magnitude:

| Market | Sheet | Actual metro |
|---|---|---|
| Madison, WI | 12.9M | ~0.7M — that is LA's figure |
| Portland, ME | 20.0M | ~0.6M — that is New York's figure |
| Asheville, NC | 20.0M | ~0.5M — that is New York's figure |
| Los Angeles | 20.0M | ~12.9M |

Slide 7's rollout table therefore **omits population and population-per-vendor
entirely** rather than print figures that would not survive ten seconds of
scrutiny. Once corrected, restore those two columns — the penetration spread
is one of the deck's better arguments.

Two smaller things: LA's "Total New Vendors" summary cell (1,344) is inflated
by the same typo, and shipped goods' cell duplicates it, so slide 7 shows a
dash for both and totals only the six clean metros (1,145).

### Headline figures

| Figure | Value | Window |
|---|---|---|
| Year 1 revenue | $84,419 | Nov '26 – Oct '27 |
| Year 2 revenue | $312,417 | Nov '27 – Oct '28 |
| Year 3 revenue | $1,015,031 (⚠ ~$728,732 corrected) | Nov '28 – Oct '29 |
| Paying vendors | 527 | Oct '27 |
| Exit monthly revenue, Year 1 | $15,283 (≈ $183K ARR) | Oct '27 |

### Market rollout

"First revenue" is the first month with a paying vendor — three months after
that market starts recruiting, derived from the revenue rows.

| Market | First revenue | New vendors |
|---|---|---|
| Portland, OR | Dec '26 | 199 |
| Denver | Dec '26 | 214 |
| Seattle | May '27 | 195 |
| Madison, WI | Aug '27 | 223 |
| Portland, ME | Sep '27 | 170 |
| Asheville, NC | Oct '27 | 144 |
| Los Angeles | Nov '27 | — (see defect 1) |
| Shipped goods | Dec '26 | — (cell duplicates LA's) |

Los Angeles opens in Nov '27, one month outside Year 1, so slide 6 charts six
metros plus shipped goods.

## Before sending

- **Fix the two spreadsheet defects above.** Slide 7 carries a visible caveat line until the Los Angeles cell is corrected.
- Slide 8 carries a literal `[amount]` placeholder for the raise.
- Slide 2's "~3M deaths in the United States every year" is cited to CDC/NCHS
  and should be refreshed against the latest published year.
- Slide 5 shows today's $29/month pricing; slide 7 is where the modelled step
  to $39 is explained. Keep those two consistent if either changes.
- The live URL throughout is the Vercel preview domain; swap it for the
  production domain at launch.
