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
| 6 | Year 1, monthly by market | Conservative tab of the founders' spreadsheet — see below |
| 7 | Years 1–3 | Conservative tab of the founders' spreadsheet — see below |
| 8 | Team and the ask | `/company` founder bios |

## Fonts

The deck uses **Cambria** (headings) and **Calibri** (body) rather than the
site's Crimson Pro / Nunito Sans. Both ship with Microsoft Office, so the deck
renders identically on any reviewer's machine; the web fonts would silently
substitute. Brand identity is carried by the palette, which is the exact
`@theme` token set from `app/globals.css`.

## The projection model

Source: the **"More Conservative Best Est, 3 Y"** tab (the **second** tab) of
**"CodaCo Market Projections 2026.xlsx"** in Google Drive, read 31 Aug 2026.
It runs Sep '26 – Dec '29 across five metros plus shipped goods (makers who
ship nationwide and so are not geo-bound).

Read it straight from Drive with the Google Drive connector
(`read_file_content` on the file id) — no download or export needed. That call
returns every tab concatenated into one string, so locate the block by its
title row (`More Conservative Best Est, 3 Y …`) rather than assuming position.

**Which tab feeds the deck matters.** The first tab, "Best Est, 3 Year
Projections", is the base case and runs about 11% higher over three years.
The remaining tabs hold older single-year best / conservative / aggressive
scenarios and are not used.

| | Base case (tab 1) | **Conservative (tab 2, in the deck)** |
|---|---|---|
| Year 1 | $109,707 | **$103,675** (−5.5%) |
| Year 2 | $421,863 | **$372,795** (−11.6%) |
| Year 3 | $1,046,949 | **$933,011** (−10.9%) |
| Three-year | $1,578,519 | **$1,409,481** (−10.7%) |

Portland, Denver and New York are identical between the two; the conservative
tab cuts Seattle (495 → 373 vendors) and Los Angeles (644 → 437) and nudges
shipped goods up slightly.

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

Checks run against the tab before anything reaches a slide. **Everything
ties:**

| | Stated | Monthly Revenue row | Sum of the six market rows |
|---|---|---|---|
| Year 1 (Nov '26 – Oct '27) | $103,675 | $103,675 ✓ | $103,675 ✓ |
| Year 2 (Nov '27 – Oct '28) | $372,795 | $372,795 ✓ | $372,795 ✓ |
| Year 3 (Nov '28 – Oct '29) | $933,011 | $933,011 ✓ | $933,011 ✓ |

Also verified across all forty months: every market figure is an exact
integer vendor count × price ($29 through Nov '28, $39 from Dec '28), no
market's revenue ever falls, and the Monthly Revenue row equals the sum of
the market rows in every single month. Zero discrepancies.

`/tmp/.../check_cons.py` in the session scratchpad is the script that ran
these checks; re-derive it from the tab if the model changes again.

### Reading the sheet without tripping over the header

The month header once labelled two different blocks "J '28" (columns S and
AE), which made two readers disagree about which cells held April '28. That
is fixed — AE now reads J '29 — but checking by column letter is still the
reliable way in a 40-column row:

| Month | Column | | Month | Column |
|---|---|---|---|---|
| Sep '26 (first) | C | | Dec '28 (fee step) | AD |
| Nov '26 (launch) | E | | Apr '29 | AH |
| Oct '27 (Year 1 end) | P | | Dec '29 (last) | AP |
| Apr '28 | V | | | |

Two labels in the sheet anchor this and agree with each other: "Launch Date
November 1" sits over column E, and "Fee increase to $39/mo" over column AD —
which is exactly where every market's price steps from $29 to $39 (Portland
291 × $29 = $8,439, then 300 × $39 = $11,700). Both tabs share this layout.

### Headline figures

| Figure | Value | Window |
|---|---|---|
| Year 1 revenue | $103,675 | Nov '26 – Oct '27 |
| Year 2 revenue | $372,795 | Nov '27 – Oct '28 |
| Year 3 revenue | $933,011 | Nov '28 – Oct '29 |
| Three-year total | $1,409,481 | |
| Paying vendors | 592 | Oct '27 |
| Exit monthly revenue, Year 1 | $17,168 (≈ $206K ARR) | Oct '27 |
| Exit monthly revenue, Year 3 | $89,778 (≈ $1.08M ARR) | Dec '29 |

### Market rollout

"First revenue" is the first month with a paying vendor — three months after
that market starts recruiting. Population and vendor columns are the sheet's
own and are internally consistent (population ÷ vendors = population per
vendor).

| Market | First revenue | Metro pop. | Vendors | Pop. per vendor |
|---|---|---|---|---|
| Portland | Dec '26 | 2.5M | 398 | 6,281 |
| Denver | Dec '26 | 3.0M | 418 | 7,177 |
| Seattle | May '27 | 4.1M | 373 | 10,992 |
| Los Angeles | Aug '27 | 12.9M | 437 | 29,519 |
| New York | Dec '27 | 20.0M | 476 | 42,017 |
| Shipped goods | Dec '26 | Nationwide | — | — |

Five metros, 2,102 vendors. The penetration spread is the model's
conservatism: Los Angeles is assumed at one vendor per 29,519 residents and
New York one per 42,017, against Portland's one per 6,281.

The sheet's "Total New Vendors" column reads 155 for shipped goods, but that
row's own monthly signups sum to well over 500 — the summary cell looks
stale, so the deck shows a dash rather than either number.

## Before sending

- Slide 8 carries a literal `[amount]` placeholder for the raise.
- Slide 2's "~3M deaths in the United States every year" is cited to CDC/NCHS
  and should be refreshed against the latest published year.
- Slide 5 shows today's $29/month pricing; slide 7 is where the modelled step
  to $39 is explained. Keep those two consistent if either changes.
- The live URL throughout is the Vercel preview domain; swap it for the
  production domain at launch.
