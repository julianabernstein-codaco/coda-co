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
**"CodaCo Market Projections 2026.xlsx"** in Google Drive, read 31 Aug 2026
after the founders rebuilt the model. It runs Sep '26 – Dec '29 across five
metros plus shipped goods (makers who ship nationwide and so are not
geo-bound).

Read it straight from Drive with the Google Drive connector
(`read_file_content` on the file id) — no download or export needed. The first
tab is the one that matters; the later tabs hold the earlier
best-estimate / conservative / aggressive single-year scenarios.

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

Checks run against the sheet before anything reaches a slide:

| | Stated | Monthly Revenue row | Sum of the six market rows |
|---|---|---|---|
| Year 1 (Nov '26 – Oct '27) | $109,707 | $109,707 ✓ | $109,707 ✓ |
| Year 2 (Nov '27 – Oct '28) | $411,916 | $411,916 ✓ | $421,863 |
| Year 3 (Nov '28 – Oct '29) | $1,046,949 | $1,046,949 ✓ | $1,046,949 ✓ |

Also verified: every month in all six markets is an exact integer vendor
count × price, and no market's revenue ever falls.

### One open defect in the source sheet

**The Monthly Revenue total row holds two bad cells** — Apr '28 (row $25,520,
market columns $33,524) and May '28 (row $33,582, market columns $35,525).
The row consequently *falls* from Mar '28 to Apr '28, which nothing in the
model supports.

Because the annual totals are computed off that row, **Year 2 is understated
by $9,947**: it should read $421,863, not $411,916. Slide 7 shows the stated
$411,916 so the deck matches the model a reader would be handed. Fix those two
cells and the deck can be regenerated to match.

Two earlier defects — Seattle's subscriber row not accumulating, and a
duplicated month in Denver's revenue row — were fixed in the founders'
rebuild and are gone.

### Headline figures

| Figure | Value | Window |
|---|---|---|
| Year 1 revenue | $109,707 | Nov '26 – Oct '27 |
| Year 2 revenue | $411,916 (should be $421,863) | Nov '27 – Oct '28 |
| Year 3 revenue | $1,046,949 | Nov '28 – Oct '29 |
| Three-year total | $1,568,572 | |
| Paying vendors | 682 | Oct '27 |
| Exit monthly revenue, Year 1 | $19,778 (≈ $237K ARR) | Oct '27 |
| Exit monthly revenue, Year 3 | $100,503 (≈ $1.21M ARR) | Dec '29 |

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
