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

Source: the **"7 metros, 3 Year Projections"** tab of **"CodaCo Market
Projections 2026.xlsx"** in Google Drive, read 31 Aug 2026. **38 months,
Sep '26 – Oct '29.**

Read it straight from Drive with the Google Drive connector
(`read_file_content` on the file id) — no download or export needed. That call
returns every tab concatenated into one string, so locate the block by its
title row rather than assuming position.

Seven metros — Portland OR, Denver, Seattle, Minneapolis, San Francisco,
Asheville NC, Los Angeles — plus shipped-goods makers nationwide.

Mechanics:

- Launch **1 November 2026**.
- Revenue is **subscribing vendors × monthly price**, and nothing else. No
  goods transaction revenue, no gift cards, no client billing, no sponsorship.
- A vendor's first payment lands **three months after signup** — the free
  trial in `lib/data/plans.ts`.
- **Front-loaded churn**, and this is what sets the tab apart: a metro loses
  **30% of each arriving cohort for its first three months**, then settles to
  10%; shipped-goods sellers churn at **50% for six months** before settling.
  The five-metro tabs assumed a flat 10% throughout.
- Price steps from **$29 to $39/month in December 2028**.

### Which tab feeds the deck

| | Best Est | More Conservative | **7-metro (in the deck)** |
|---|---|---|---|
| Year 1 | $109,707 | $103,675 | **$83,984** |
| Year 2 | $421,863 | $372,795 | **$307,632** |
| Year 3 | $1,046,949 | $933,011 | **$700,034** |
| Three-year | $1,578,519 | $1,409,481 | **$1,091,650** |

The 7-metro tab drops New York for Minneapolis, San Francisco and Asheville
and applies far harsher early churn, so it lands well below the others. It is
the most defensible of the three to lead with.

### Reconciliation — all six checks pass

| Check | Result |
|---|---|
| Total row = sum of the eight market rows | ✓ all 38 months |
| Annual totals vs total row **and** market columns | ✓ $83,984 / $307,632 / $700,034 |
| Every month an exact integer vendor count × price | ✓ all eight markets |
| Month-on-month falls | ✓ max −0.8%, and only after a market's signups stop; the total row never falls |
| Implausible jumps (>60%) | ✓ none |
| Summary columns vs the sheet's own rows and the real world | ✓ every population, vendor total and population-per-vendor |

`check_v3.py` in the session scratchpad is the script; re-derive it from the
tab when the model changes.

**Defects found and fixed by the founders during this round**, kept here so
the checks that caught them are not dropped: a Los Angeles signup cell reading
`1016` instead of `10` (inflated Year 3 by 28%); metro populations carried
over from the five-metro tab (Madison at 12.9M, Portland ME and Asheville at
20M); a stale population-per-vendor cell for Portland; and a shipped-goods
vendor total duplicating Los Angeles'.

One cosmetic item remains, unused by the deck: the **"Avg. New/Mo, first
year" column is wrong for every metro** — San Francisco reads 61.1 against an
actual 6.5, Asheville 41.6 against 4.5, Los Angeles 84.2 against 6.7. Only a
problem if that column is shown elsewhere.

### Headline figures

| Figure | Value | Window |
|---|---|---|
| Year 1 revenue | $83,984 | Nov '26 – Oct '27 |
| Year 2 revenue | $307,632 | Nov '27 – Oct '28 |
| Year 3 revenue | $700,034 | Nov '28 – Oct '29 |
| Three-year total | $1,091,650 | |
| Paying vendors | 522 | Oct '27 |
| Exit monthly revenue, Year 1 | $15,138 (≈ $182K ARR) | Oct '27 |
| Exit monthly revenue, Year 3 | $63,921 (≈ $767K ARR) | Oct '29 |

### Market rollout

"First revenue" is the first month with a paying vendor — three months after
that market starts recruiting.

| Market | First revenue | Metro pop. | Vendors | Pop. per vendor |
|---|---|---|---|---|
| Portland, OR | Dec '26 | 2.5M | 199 | 12,563 |
| Denver | Dec '26 | 3.0M | 214 | 14,019 |
| Seattle | May '27 | 4.1M | 194 | 21,134 |
| Minneapolis | Aug '27 | 3.8M | 223 | 16,996 |
| San Francisco | Sep '27 | 4.6M | 170 | 27,059 |
| Asheville, NC | Oct '27 | 0.4M | 144 | 2,778 |
| Los Angeles | Nov '27 | 12.9M | 334 | 38,623 |
| Shipped goods | Dec '26 | Nationwide | 472 | — |

Seven metros, 1,478 vendors. Los Angeles opens in Nov '27, one month outside
Year 1, so slide 6 charts six metros plus shipped goods. The penetration
spread is the model's conservatism: Los Angeles at one vendor per 38,623
residents against Asheville's one per 2,778.

## Before sending

- Slide 8 carries a literal `[amount]` placeholder for the raise.
- Slide 2's "~3M deaths in the United States every year" is cited to CDC/NCHS
  and should be refreshed against the latest published year.
- Slide 5 shows today's $29/month pricing; slide 7 is where the modelled step
  to $39 is explained. Keep those two consistent if either changes.
- The live URL throughout is the Vercel preview domain; swap it for the
  production domain at launch.
