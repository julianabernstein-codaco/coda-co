// Generates the CodaCo investor pitch deck (8 slides).
//
//   node build-deck.mjs [outfile]
//
// Palette and voice come from the live site: brand tokens in
// `app/globals.css`, copy from `/about`, `/what-is-codaco`, `/list-with-us`,
// pricing from `lib/data/plans.ts`. Financial figures are the founders'
// projection model (see YEAR1 / ANNUAL / MARKETS below).

import pptxgen from "pptxgenjs";

/* ------------------------------------------------------------------ *
 * Brand tokens (app/globals.css @theme) — no leading '#' in pptxgenjs
 * ------------------------------------------------------------------ */
const TR = "C1634F"; // terracotta
const TR_L = "D4876F"; // terracotta light
const TR_P = "F5EAE6"; // terracotta pale
const TR_D = "8B3E2D"; // terracotta deep
const SG = "7A9E82"; // sage
const SG_L = "A8C4AC"; // sage light
const SG_P = "EAF0EB"; // sage pale
const SG_D = "4D7255"; // sage deep
const CH = "2C2825"; // charcoal
const CM = "5A534C"; // charcoal mid
const CL = "9A9189"; // charcoal light
const PL = "FAF9F7"; // warm white
const WHITE = "FFFFFF";
const LINE = "E7E3DE"; // hairline on light
const ON_DARK = "EFEBE5"; // body text on charcoal
const ON_DARK_DIM = "B4ACA3";

const SERIF = "Cambria"; // stands in for Crimson Pro
const SANS = "Calibri"; // stands in for Nunito Sans

const W = 13.3;
const H = 7.5;

/* ------------------------------------------------------------------ *
 * Projection model — the "Best Est, 3 Year Projections" tab of
 * "CodaCo Market Projections 2026.xlsx" (Google Drive), read 31 Aug 2026
 * after the founders' rebuild of the model.
 *
 * Launch 1 Nov 2026, running Sep '26 - Dec '29 across five metros plus
 * shipped goods. $29/vendor/month, 3-month free trial (a Sep '26 signup
 * first bills in Dec '26), ~10% attrition on each arriving cohort, and a
 * step to $39/month from Dec '28.
 *
 * Reconciled: all three stated annual totals tie exactly to the sheet's
 * own Monthly Revenue row, and Year 1 also ties to the sum of the market
 * rows. See README.md for the two rows that do not tie, and for the
 * Seattle defect that suppresses that market throughout.
 * ------------------------------------------------------------------ */
const Y1_MONTHS = [
  "Nov '26", "Dec", "Jan '27", "Feb", "Mar", "Apr",
  "May", "Jun", "Jul", "Aug", "Sep", "Oct '27",
];
// Year 1 = Nov '26 - Oct '27. Sums to $109,707, the sheet's Year 1 total.
const YEAR1 = {
  portland: [0, 870, 1363, 1885, 2407, 2813, 3219, 3625, 4031, 4321, 4640, 4959],
  denver: [0, 754, 1363, 2001, 2639, 3161, 3683, 4205, 4437, 4698, 4959, 5220],
  seattle: [0, 0, 0, 0, 0, 0, 522, 1305, 2088, 2726, 3364, 4031],
  la: [0, 0, 0, 0, 0, 0, 0, 0, 0, 928, 1769, 2610],
  shipped: [0, 348, 667, 986, 1247, 1508, 1769, 2030, 2291, 2552, 2755, 2958],
};

// Annual totals, read off the sheet's summary rows and verified against
// its Monthly Revenue row.
// Year 2 is the sheet's stated figure. Its Monthly Revenue row still holds
// two bad cells (Apr and May '28); correcting them raises Year 2 to
// $421,863. The deck keeps the stated number so it matches the model the
// founders would hand to a reader. See README.md.
const ANNUAL = [
  { label: "Year 1", value: 109707 },
  { label: "Year 2", value: 411916 },
  { label: "Year 3", value: 1046949 },
];

// Market rollout. "First revenue" is the first month with a paying
// vendor — three months after that market starts recruiting. Population
// and vendor columns are the sheet's own summary columns and are
// internally consistent (population / vendors = population per vendor).
const MARKETS = [
  ["Portland", "Dec '26", "2.5M", "398", "6,281"],
  ["Denver", "Dec '26", "3.0M", "418", "7,177"],
  ["Seattle", "May '27", "4.1M", "495", "8,283"],
  ["Los Angeles", "Aug '27", "12.9M", "644", "20,031"],
  ["New York", "Dec '27", "20.0M", "476", "42,017"],
  ["Shipped goods", "Dec '26", "Nationwide", "—", "—"],
];

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "CodaCo Market";
pres.company = "CodaCo Market";
pres.title = "CodaCo — Investor Overview";

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

// Soft overlapping arcs bleeding off the edge — echoes the site's wave
// dividers. Fresh option objects each call (pptxgenjs mutates them).
function arcs(slide, { flip = false } = {}) {
  const x1 = flip ? -4.6 : W - 3.4;
  const x2 = flip ? -5.6 : W - 1.9;
  slide.addShape(pres.ShapeType.ellipse, {
    x: x1, y: -2.4, w: 6.5, h: 6.5,
    fill: { color: TR_D, transparency: flip ? 86 : 78 },
    line: { type: "none" },
  });
  slide.addShape(pres.ShapeType.ellipse, {
    x: x2, y: 2.6, w: 6.0, h: 6.0,
    fill: { color: SG_D, transparency: flip ? 88 : 82 },
    line: { type: "none" },
  });
}

// White card with a hairline and a whisper of shadow.
function card(slide, { x, y, w, h, fill = WHITE, line = LINE }) {
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.11,
    fill: { color: fill },
    line: { color: line, width: 0.75 },
    shadow: { type: "outer", color: CH, opacity: 0.06, blur: 8, offset: 2, angle: 90 },
  });
}

// The repeated motif: a filled circle carrying initials or a numeral.
function badge(slide, { x, y, d = 0.52, tone = "tr", label, fontSize = 15 }) {
  const bg = tone === "sg" ? SG_P : TR_P;
  const fg = tone === "sg" ? SG_D : TR_D;
  slide.addShape(pres.ShapeType.ellipse, {
    x, y, w: d, h: d,
    fill: { color: bg },
    line: { color: tone === "sg" ? SG_L : TR_L, width: 1 },
  });
  slide.addText(label, {
    x, y, w: d, h: d,
    isTextBox: true, margin: 0,
    align: "center", valign: "middle",
    fontFace: SERIF, fontSize, bold: true, color: fg,
  });
}

function eyebrow(slide, text, { x, y, w = 8, color = TR }) {
  slide.addText(text.toUpperCase(), {
    x, y, w, h: 0.28,
    isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 11, bold: true,
    charSpacing: 2.2, color,
  });
}

function slideTitle(slide, text, { x = 0.75, y = 0.92, w = 11.8, size = 36, color = CH } = {}) {
  slide.addText(text, {
    x, y, w, h: 0.72,
    isTextBox: true, margin: 0,
    fontFace: SERIF, fontSize: size, color,
    valign: "top",
  });
}

function subtitle(slide, text, { x = 0.75, y = 1.66, w = 11.0, color = CM, size = 14.5 } = {}) {
  slide.addText(text, {
    x, y, w, h: 0.42,
    isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: size, color, lineSpacing: 20,
  });
}

/* ================================================================== *
 * 1 — Title
 * ================================================================== */
{
  const s = pres.addSlide();
  s.background = { color: CH };
  arcs(s);

  eyebrow(s, "A curated marketplace for death and dying", {
    x: 0.85, y: 1.55, w: 8.5, color: TR_L,
  });

  s.addText("CodaCo", {
    x: 0.8, y: 1.95, w: 8.0, h: 1.2,
    isTextBox: true, margin: 0,
    fontFace: SERIF, fontSize: 68, color: PL,
  });

  s.addText(
    [
      { text: "Death is a part of life.", options: { color: PL, breakLine: true } },
      { text: "Support should be easy to find.", options: { color: TR_L } },
    ],
    {
      x: 0.8, y: 3.35, w: 8.4, h: 1.3,
      isTextBox: true, margin: 0,
      fontFace: SERIF, fontSize: 29, italic: true, lineSpacing: 40,
    },
  );

  s.addText(
    "Goods, services, and plain-language guidance — brought into one welcoming place for families planning ahead or grieving a loss.",
    {
      x: 0.8, y: 4.78, w: 7.4, h: 0.9,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 14.5, color: ON_DARK, lineSpacing: 22,
    },
  );

  s.addText("Investor overview  ·  Three-year projections", {
    x: 0.8, y: 6.5, w: 6.0, h: 0.3,
    isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 11.5, color: ON_DARK_DIM,
  });
  s.addText("Launching 1 November 2026  ·  coda-co-nine.vercel.app", {
    x: 6.3, y: 6.5, w: 6.2, h: 0.3,
    isTextBox: true, margin: 0, align: "right",
    fontFace: SANS, fontSize: 11.5, color: ON_DARK_DIM,
  });

  s.addNotes(
    "CodaCo Market is a curated two-sided marketplace for everything families need around death and dying — goods, services and guidance. The product is built and live; we launch 1 November 2026.",
  );
}

/* ================================================================== *
 * 2 — Problem
 * ================================================================== */
{
  const s = pres.addSlide();
  s.background = { color: PL };

  eyebrow(s, "The problem", { x: 0.75, y: 0.55 });
  slideTitle(s, "The resources exist. Families can’t find them.");
  subtitle(
    s,
    "When someone dies, the help that would make it bearable is scattered across a dozen places — and nobody goes looking until they need it.",
    { w: 8.0, y: 1.62 },
  );

  const problems = [
    {
      n: "1",
      tone: "tr",
      head: "Scattered",
      body: "An urn from one shop. A doula from a Facebook group. An estate attorney from a search result. Nothing connects, and nothing is comparable.",
    },
    {
      n: "2",
      tone: "sg",
      head: "Poorly described",
      body: "Most end-of-life practitioners are close to invisible online, or described in language nobody uses when they are grieving.",
    },
    {
      n: "3",
      tone: "tr",
      head: "Searched at the worst possible moment",
      body: "Families do this research once, under time pressure, in the days after a death — with no way to tell who is qualified.",
    },
  ];

  let y = 2.5;
  problems.forEach((p) => {
    badge(s, { x: 0.78, y: y + 0.02, tone: p.tone, label: p.n });
    s.addText(p.head, {
      x: 1.52, y, w: 6.6, h: 0.34,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 16, bold: true, color: CH,
    });
    s.addText(p.body, {
      x: 1.52, y: y + 0.38, w: 6.6, h: 0.8,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 13.5, color: CM, lineSpacing: 19,
    });
    y += 1.42;
  });

  // Stat panel
  card(s, { x: 8.85, y: 2.28, w: 3.72, h: 2.5, fill: TR_P, line: "EBD8D1" });
  s.addText("~3M", {
    x: 8.95, y: 2.5, w: 3.5, h: 0.95,
    isTextBox: true, margin: 0, align: "center",
    fontFace: SERIF, fontSize: 56, bold: true, color: TR_D,
  });
  s.addText("deaths in the United States every year", {
    x: 9.15, y: 3.5, w: 3.1, h: 0.55,
    isTextBox: true, margin: 0, align: "center",
    fontFace: SANS, fontSize: 14, bold: true, color: CH, lineSpacing: 18,
  });
  s.addText("Each one sends a household searching, usually for the first time.", {
    x: 9.15, y: 4.02, w: 3.1, h: 0.6,
    isTextBox: true, margin: 0, align: "center",
    fontFace: SANS, fontSize: 11.5, color: CM, lineSpacing: 15,
  });

  s.addText("“Loss deserves to be met with care.”", {
    x: 8.75, y: 5.02, w: 3.92, h: 0.62,
    isTextBox: true, margin: 0, align: "center",
    fontFace: SERIF, fontSize: 15.5, italic: true, color: CH, lineSpacing: 22,
  });
  s.addText("— The CodaCo Market ethos", {
    x: 8.85, y: 5.7, w: 3.72, h: 0.28,
    isTextBox: true, margin: 0, align: "center",
    fontFace: SANS, fontSize: 11, color: CL,
  });

  s.addText("Source: CDC / NCHS annual U.S. mortality.", {
    x: 0.78, y: 6.72, w: 6.0, h: 0.26,
    isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 10, color: CL,
  });

  s.addNotes(
    "The founders' own frustration: when facing the death of someone you love, the resources you need are scattered, poorly described and hard to compare — and you are doing the research at the worst possible time.",
  );
}

/* ================================================================== *
 * 3 — Solution
 * ================================================================== */
{
  const s = pres.addSlide();
  s.background = { color: PL };

  eyebrow(s, "The solution", { x: 0.75, y: 0.55, color: SG_D });
  slideTitle(s, "One place for everything a family needs");
  subtitle(
    s,
    "Curated goods, vetted local practitioners, and gentle guidance — searchable together, by category and by where you live.",
    { w: 10.5, y: 1.62 },
  );

  // Goods
  card(s, { x: 0.75, y: 2.32, w: 5.75, h: 3.15, fill: TR_P, line: "EBD8D1" });
  badge(s, { x: 1.05, y: 2.58, d: 0.46, tone: "tr", label: "G", fontSize: 14 });
  s.addText("Goods", {
    x: 1.63, y: 2.56, w: 3.0, h: 0.42,
    isTextBox: true, margin: 0,
    fontFace: SERIF, fontSize: 24, color: CH,
  });
  s.addText("6 categories", {
    x: 4.4, y: 2.66, w: 1.95, h: 0.3,
    isTextBox: true, margin: 0, align: "right",
    fontFace: SANS, fontSize: 12, bold: true, color: TR_D,
  });
  s.addText(
    [
      { text: "Urns & vessels", options: { bullet: true, breakLine: true } },
      { text: "Ash jewelry", options: { bullet: true, breakLine: true } },
      { text: "Burial shrouds", options: { bullet: true, breakLine: true } },
      { text: "Planning documents & workbooks", options: { bullet: true, breakLine: true } },
      { text: "Memorial items", options: { bullet: true, breakLine: true } },
      { text: "Gifts & humor", options: { bullet: true } },
    ],
    {
      x: 1.12, y: 3.18, w: 5.0, h: 1.8,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 13, color: CH, paraSpaceAfter: 4,
    },
  );
  s.addText("Shipped nationwide, or collected locally.", {
    x: 1.12, y: 4.98, w: 5.0, h: 0.3,
    isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 11.5, italic: true, color: CM,
  });

  // Services
  card(s, { x: 6.8, y: 2.32, w: 5.75, h: 3.15, fill: SG_P, line: "D8E3D9" });
  badge(s, { x: 7.1, y: 2.58, d: 0.46, tone: "sg", label: "S", fontSize: 14 });
  s.addText("Services", {
    x: 7.68, y: 2.56, w: 3.0, h: 0.42,
    isTextBox: true, margin: 0,
    fontFace: SERIF, fontSize: 24, color: CH,
  });
  s.addText("14 types", {
    x: 10.45, y: 2.66, w: 1.95, h: 0.3,
    isTextBox: true, margin: 0, align: "right",
    fontFace: SANS, fontSize: 12, bold: true, color: SG_D,
  });
  s.addText(
    [
      { text: "End-of-life doulas", options: { bullet: true, breakLine: true } },
      { text: "Estate attorneys", options: { bullet: true, breakLine: true } },
      { text: "Grief counselors & spiritual support", options: { bullet: true, breakLine: true } },
      { text: "Funeral celebrants & home funeral guides", options: { bullet: true, breakLine: true } },
      { text: "Death cleaning & end-of-life organizers", options: { bullet: true, breakLine: true } },
      { text: "Death cafés, mediators, funeral homes", options: { bullet: true } },
    ],
    {
      x: 7.17, y: 3.18, w: 5.0, h: 1.8,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 13, color: CH, paraSpaceAfter: 4,
    },
  );
  s.addText("Found by zip code, matched to each provider’s service radius.", {
    x: 7.17, y: 4.98, w: 5.1, h: 0.3,
    isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 11.5, italic: true, color: CM,
  });

  // Differentiators
  const diffs = [
    ["Curated, not open", "Every vendor is reviewed and approved before they appear."],
    ["Local by radius", "Providers surface for the zip codes they actually serve."],
    ["Guidance, not just listings", "Plain-language answers for people who have never done this."],
  ];
  diffs.forEach((d, i) => {
    const x = 0.75 + i * 4.0;
    card(s, { x, y: 5.72, w: 3.75, h: 1.05 });
    s.addText(d[0], {
      x: x + 0.24, y: 5.87, w: 3.3, h: 0.3,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 13.5, bold: true, color: TR_D,
    });
    s.addText(d[1], {
      x: x + 0.24, y: 6.18, w: 3.3, h: 0.5,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 11.5, color: CM, lineSpacing: 15,
    });
  });

  s.addNotes(
    "Two sides of one marketplace: shipped goods from makers nationwide, and services matched to the searcher's zip code against each vendor's own service radius. Curation is the product — every listing is reviewed.",
  );
}

/* ================================================================== *
 * 4 — Product, built and live
 * ================================================================== */
{
  const s = pres.addSlide();
  s.background = { color: PL };

  eyebrow(s, "The product", { x: 0.75, y: 0.55 });
  slideTitle(s, "Not a concept — a working marketplace");
  subtitle(
    s,
    "Live today at coda-co-nine.vercel.app. Four build phases shipped: the catalog, the database, accounts, and full vendor self-service.",
    { w: 11.0, y: 1.62 },
  );

  const features = [
    ["V", "tr", "Vendor self-service", "Apply, build a shop or service profile, list and price. Admin approves in 1–2 business days."],
    ["$", "sg", "Subscription billing", "Stripe Checkout and customer portal — trials, renewals, plan changes, cancellation."],
    ["◎", "tr", "Local discovery", "Zip-centroid search against each vendor’s service radius; virtual providers surface everywhere."],
    ["★", "sg", "Trust layer", "Verified reviews, saved items, and a curated approval queue behind every listing."],
    ["♥", "tr", "Gift cards", "Balances and shareable group-gift pools — contribute without creating an account."],
    ["?", "sg", "Guidance & editorial", "Plain-language answers for the newly bereaved, plus a curated reading list."],
  ];

  features.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.75 + col * 4.0;
    const y = 2.34 + row * 1.86;
    card(s, { x, y, w: 3.75, h: 1.62 });
    badge(s, { x: x + 0.24, y: y + 0.22, d: 0.46, tone: f[1], label: f[0], fontSize: 14 });
    s.addText(f[2], {
      x: x + 0.82, y: y + 0.26, w: 2.75, h: 0.34,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 14, bold: true, color: CH,
    });
    s.addText(f[3], {
      x: x + 0.24, y: y + 0.78, w: 3.3, h: 0.72,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 11.5, color: CM, lineSpacing: 15,
    });
  });

  card(s, { x: 0.75, y: 6.14, w: 11.8, h: 0.72, fill: SG_P, line: "D8E3D9" });
  s.addText(
    [
      { text: "Shipping next:  ", options: { bold: true, color: SG_D } },
      { text: "cart and checkout with orders and vendor notifications, then verified-purchase reviews. Gift-card sales open once a balance can be spent.", options: { color: CH } },
    ],
    {
      x: 1.0, y: 6.14, w: 11.3, h: 0.72,
      isTextBox: true, margin: 0, valign: "middle",
      fontFace: SANS, fontSize: 12.5,
    },
  );

  s.addNotes(
    "The engineering risk is largely behind us. Vendors can already sign up, be approved, publish listings and be billed. What remains before revenue-bearing transactions is the buyer checkout path.",
  );
}

/* ================================================================== *
 * 5 — Business model
 * ================================================================== */
{
  const s = pres.addSlide();
  s.background = { color: PL };

  eyebrow(s, "Business model", { x: 0.75, y: 0.55, color: SG_D });
  slideTitle(s, "Vendors subscribe. Buyers pay nothing extra.");
  subtitle(
    s,
    "One flat rate for goods makers and service providers alike — no per-sale transaction fee, so vendors keep 100% of what they earn.",
    { w: 11.0, y: 1.62 },
  );

  const plans = [
    { name: "Starter", price: "Free", unit: "for 3 months", note: "Every feature, no card required.", tone: "sg", featured: false },
    { name: "Monthly", price: "$29", unit: "per month", note: "Cancel any time.", tone: "tr", featured: true },
    { name: "Annual", price: "$320", unit: "per year", note: "Save 8%.", tone: "tr", featured: false },
  ];

  plans.forEach((p, i) => {
    const x = 0.75 + i * 3.34;
    card(s, {
      x, y: 2.34, w: 3.1, h: 2.28,
      fill: p.featured ? TR_P : WHITE,
      line: p.featured ? TR_L : LINE,
    });
    s.addText(p.name.toUpperCase(), {
      x: x + 0.22, y: 2.55, w: 2.66, h: 0.28,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 11, bold: true, charSpacing: 2,
      color: p.tone === "sg" ? SG_D : TR_D,
    });
    s.addText(p.price, {
      x: x + 0.22, y: 2.86, w: 2.66, h: 0.72,
      isTextBox: true, margin: 0,
      fontFace: SERIF, fontSize: 40, color: CH,
    });
    s.addText(p.unit, {
      x: x + 0.22, y: 3.6, w: 2.66, h: 0.28,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 12.5, color: CM,
    });
    s.addText(p.note, {
      x: x + 0.22, y: 3.98, w: 2.66, h: 0.45,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 11.5, color: CM, lineSpacing: 15,
    });
  });

  // Right-hand pull quote
  card(s, { x: 10.77, y: 2.34, w: 1.78, h: 2.28, fill: CH, line: CH });
  s.addText("0%", {
    x: 10.82, y: 2.85, w: 1.68, h: 0.7,
    isTextBox: true, margin: 0, align: "center",
    fontFace: SERIF, fontSize: 40, bold: true, color: TR_L,
  });
  s.addText("take rate on\nevery sale", {
    x: 10.82, y: 3.6, w: 1.68, h: 0.7,
    isTextBox: true, margin: 0, align: "center",
    fontFace: SANS, fontSize: 12, color: ON_DARK, lineSpacing: 16,
  });

  const why = [
    ["Recurring from day one", "Revenue is subscription, not transaction — predictable and forecastable before GMV exists."],
    ["Low friction to say yes", "A free quarter and $29/month is an easy decision for a solo doula or a one-person studio."],
    ["Same price on both sides", "Goods and services share one plan, one dashboard, one billing path — no second business to run."],
  ];
  why.forEach((wI, i) => {
    const x = 0.75 + i * 4.0;
    card(s, { x, y: 4.9, w: 3.75, h: 1.28 });
    badge(s, { x: x + 0.24, y: 5.08, d: 0.4, tone: i === 1 ? "sg" : "tr", label: String(i + 1), fontSize: 12 });
    s.addText(wI[0], {
      x: x + 0.74, y: 5.11, w: 2.85, h: 0.3,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 13.5, bold: true, color: CH,
    });
    s.addText(wI[1], {
      x: x + 0.24, y: 5.55, w: 3.3, h: 0.55,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 11.5, color: CM, lineSpacing: 15,
    });
  });

  s.addText(
    "Not yet in the model: gift cards and group-gift pools, vendor-bills-client-through-CodaCo, and sponsored placement.",
    {
      x: 0.78, y: 6.42, w: 11.7, h: 0.32,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 11.5, italic: true, color: CL,
    },
  );

  s.addNotes(
    "Deliberately a subscription, not a take rate. It removes the incentive to fight vendors over attribution, and it makes revenue legible long before transaction volume is meaningful. The upside lines — gift cards, client billing, sponsorship — are excluded from the projections entirely.",
  );
}

/* ================================================================== *
 * 6 — Year 1 projections (monthly, reconciled to the sheet)
 * ================================================================== */
{
  const s = pres.addSlide();
  s.background = { color: PL };

  eyebrow(s, "Year 1", { x: 0.75, y: 0.55 });
  slideTitle(s, "Four cities in the first year");
  subtitle(
    s,
    "Portland and Denver open 1 November 2026, with shipped-goods makers nationwide. Seattle follows in May, Los Angeles in August.",
    { w: 8.6, y: 1.66, size: 13.5 },
  );

  s.addChart(
    pres.ChartType.bar,
    [
      { name: "Portland", labels: Y1_MONTHS, values: YEAR1.portland },
      { name: "Denver", labels: Y1_MONTHS, values: YEAR1.denver },
      { name: "Seattle", labels: Y1_MONTHS, values: YEAR1.seattle },
      { name: "Los Angeles", labels: Y1_MONTHS, values: YEAR1.la },
      { name: "Shipped goods", labels: Y1_MONTHS, values: YEAR1.shipped },
    ],
    {
      x: 0.7, y: 2.42, w: 8.5, h: 4.15,
      barDir: "col",
      barGrouping: "stacked",
      chartColors: [TR, SG, TR_L, SG_D, SG_L],
      showTitle: true,
      title: "Monthly subscription revenue by market",
      titleColor: CH,
      titleFontFace: SANS,
      titleFontSize: 13,
      showLegend: true,
      legendPos: "b",
      legendColor: CM,
      legendFontFace: SANS,
      legendFontSize: 10,
      showValue: false,
      catAxisLabelColor: CM,
      catAxisLabelFontFace: SANS,
      catAxisLabelFontSize: 9,
      valAxisLabelColor: CM,
      valAxisLabelFontFace: SANS,
      valAxisLabelFontSize: 9,
      valAxisLabelFormatCode: '"$"#,##0',
      valGridLine: { color: "E7E3DE", size: 0.75 },
      catGridLine: { style: "none" },
      valAxisLineShow: false,
      catAxisLineShow: false,
      barGapWidthPct: 45,
    },
  );

  const stats = [
    ["$109,707", "Year 1 revenue", "Nov '26 – Oct '27", "tr"],
    ["682", "paying vendors", "subscribing in Oct '27", "sg"],
    ["$19,778", "exit monthly revenue", "Oct '27 — ≈ $237K ARR", "tr"],
    ["4", "metros live", "plus nationwide shipping", "sg"],
  ];
  stats.forEach((st, i) => {
    const y = 2.42 + i * 1.06;
    card(s, {
      x: 9.5, y, w: 3.05, h: 0.92,
      fill: st[3] === "tr" ? TR_P : SG_P,
      line: st[3] === "tr" ? "EBD8D1" : "D8E3D9",
    });
    s.addText(st[0], {
      x: 9.68, y: y + 0.08, w: 2.7, h: 0.44,
      isTextBox: true, margin: 0,
      fontFace: SERIF, fontSize: 26, bold: true,
      color: st[3] === "tr" ? TR_D : SG_D,
    });
    s.addText(st[1], {
      x: 9.68, y: y + 0.5, w: 2.7, h: 0.24,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 12, bold: true, color: CH,
    });
    s.addText(st[2], {
      x: 9.68, y: y + 0.71, w: 2.7, h: 0.22,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 10.5, color: CM,
    });
  });

  s.addText(
    "$29 per vendor per month, less 10% attrition on each converting cohort. A vendor’s first payment falls three months after signup, at the end of the free trial — so the first revenue month is December 2026.",
    {
      x: 0.78, y: 6.72, w: 11.7, h: 0.28,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 10, color: CL,
    },
  );

  s.addNotes(
    "Every dollar here is a $29 subscription — no goods transaction revenue, no gift cards, no client billing, no sponsorship. Portland and Denver carry the first six months; Seattle arriving in May and Los Angeles in August is what compounds into Year 2, and the year exits at nearly double its mid-year run rate. New York opens just after this window, in December 2027.",
  );
}

/* ================================================================== *
 * 7 — Years 1–3
 * ================================================================== */
{
  const s = pres.addSlide();
  s.background = { color: PL };

  eyebrow(s, "Years 1 – 3", { x: 0.75, y: 0.55, color: SG_D });
  slideTitle(s, "Five metros by the third year");
  subtitle(
    s,
    "The same playbook run city by city, each new metro inheriting a marketplace that already works. Revenue compounds because vendors signed in year one are still subscribing in year three.",
    { w: 11.4, y: 1.62, size: 13.5 },
  );

  s.addChart(
    pres.ChartType.bar,
    [
      {
        name: "Annual revenue",
        labels: ANNUAL.map((a) => a.label),
        values: ANNUAL.map((a) => a.value),
      },
    ],
    {
      x: 0.7, y: 2.5, w: 5.3, h: 3.2,
      barDir: "col",
      chartColors: [TR],
      showTitle: true,
      title: "Annual subscription revenue",
      titleColor: CH,
      titleFontFace: SANS,
      titleFontSize: 13,
      showLegend: false,
      showValue: true,
      dataLabelPosition: "outEnd",
      dataLabelColor: CH,
      dataLabelFontFace: SANS,
      dataLabelFontSize: 12,
      dataLabelFontBold: true,
      dataLabelFormatCode: '"$"#,##0',
      catAxisLabelColor: CM,
      catAxisLabelFontFace: SANS,
      catAxisLabelFontSize: 11,
      valAxisLabelColor: CM,
      valAxisLabelFontFace: SANS,
      valAxisLabelFontSize: 9,
      valAxisLabelFormatCode: '"$"#,##0',
      valAxisMinVal: 0,
      valAxisMaxVal: 1200000,
      valGridLine: { color: "E7E3DE", size: 0.75 },
      catGridLine: { style: "none" },
      valAxisLineShow: false,
      catAxisLineShow: false,
      barGapWidthPct: 90,
    },
  );

  s.addText(
    [
      { text: "$1,568,572", options: { bold: true, color: TR_D } },
      { text: " over three years — exiting at ≈ ", options: { color: CM } },
      { text: "$1.21M ARR", options: { bold: true, color: TR_D } },
      { text: ".", options: { color: CM } },
    ],
    {
      x: 0.7, y: 5.78, w: 5.4, h: 0.3,
      isTextBox: true, margin: 0, align: "center",
      fontFace: SANS, fontSize: 12,
    },
  );

  // Market rollout table
  s.addText("Market rollout", {
    x: 6.35, y: 2.5, w: 6.2, h: 0.3,
    isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 13, bold: true, color: CH,
  });
  s.addTable(
    [
      [
        // Header at 10pt so every label stays on one line in the narrow columns.
        { text: "Market", options: { bold: true, color: TR_D, fontSize: 10 } },
        { text: "First rev.", options: { bold: true, color: TR_D, fontSize: 10 } },
        { text: "Metro pop.", options: { bold: true, color: TR_D, fontSize: 10, align: "right" } },
        { text: "Vendors", options: { bold: true, color: TR_D, fontSize: 10, align: "right" } },
        { text: "Pop. per vendor", options: { bold: true, color: TR_D, fontSize: 10, align: "right" } },
      ],
      ...MARKETS.map((m) => [
        { text: m[0], options: { color: CH, bold: true } },
        { text: m[1], options: { color: CM } },
        { text: m[2], options: { color: CM, align: "right" } },
        { text: m[3], options: { color: CH, align: "right" } },
        { text: m[4], options: { color: CM, align: "right" } },
      ]),
      [
        { text: "Five metros", options: { bold: true, color: CH } },
        { text: "", options: {} },
        { text: "", options: {} },
        { text: "2,431", options: { bold: true, color: CH, align: "right" } },
        { text: "", options: {} },
      ],
    ],
    {
      x: 6.35, y: 2.86, w: 6.2,
      colW: [1.45, 1.0, 1.1, 0.95, 1.7],
      rowH: 0.31,
      fontFace: SANS,
      fontSize: 11,
      border: { type: "solid", color: LINE, pt: 0.75 },
      fill: { color: WHITE },
      margin: [3, 6, 3, 6],
      valign: "middle",
    },
  );

  // Model levers
  const levers = [
    ["3-month free trial", "Every vendor starts free, so the first payment lands three months after signup."],
    ["~10% attrition", "A tenth of each arriving cohort is written off — churn is in the model, not assumed away."],
    ["$29 → $39 from Dec '28", "One price step in year three, once the marketplace has depth in five metros."],
  ];
  levers.forEach((lv, i) => {
    const x = 0.75 + i * 4.0;
    card(s, { x, y: 6.16, w: 3.75, h: 0.92, fill: i === 1 ? SG_P : TR_P, line: i === 1 ? "D8E3D9" : "EBD8D1" });
    s.addText(lv[0], {
      x: x + 0.22, y: 6.26, w: 3.32, h: 0.26,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 12.5, bold: true, color: i === 1 ? SG_D : TR_D,
    });
    s.addText(lv[1], {
      x: x + 0.22, y: 6.54, w: 3.32, h: 0.48,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 10.5, color: CM, lineSpacing: 13.5,
    });
  });

  s.addNotes(
    "Three-year revenue totals $1.57M, exiting December 2029 at $100,503 a month — roughly $1.21M of annual run rate. The penetration assumption is the conservative part: New York is modelled at one vendor per 42,017 residents against one per 6,281 in Portland, so the largest metros are barely touched. All three annual figures are the spreadsheet's own; Year 1 and Year 3 also tie exactly to the sum of the market columns.",
  );
}

/* ================================================================== *
 * 8 — Team and the ask
 * ================================================================== */
{
  const s = pres.addSlide();
  s.background = { color: CH };
  arcs(s, { flip: true });

  eyebrow(s, "The team", { x: 0.75, y: 0.6, color: TR_L });
  slideTitle(s, "Built by people who have done this work", {
    y: 0.94, color: PL, size: 32,
  });

  const people = [
    {
      initials: "JB", tone: "tr",
      name: "Juliana Bernstein",
      role: "Co-founder",
      bio: "Geriatric physician associate turned entrepreneur. Sixteen years in geriatric and palliative medicine, then founded Oregon’s first event company dedicated to living funerals and celebrations of life. Brown University; OHSU.",
    },
    {
      initials: "NL", tone: "sg",
      name: "Naomi Levy",
      role: "Co-founder",
      bio: "Seventeen years in product and project management of economic forecasts, then founded a home-organizing practice helping people manage their lives and belongings. Economics, New York University.",
    },
    {
      initials: "AS", tone: "tr",
      name: "Alison Shmerling, MD, MPH",
      role: "Advisor",
      bio: "Physician in underserved care settings, building programs at the intersection of underserved care and healthcare technology. Northwestern University; Tufts University School of Medicine.",
    },
  ];

  people.forEach((p, i) => {
    const x = 0.75 + i * 4.0;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 1.82, w: 3.75, h: 3.02,
      rectRadius: 0.11,
      fill: { color: PL, transparency: 92 },
      line: { color: p.tone === "tr" ? TR_D : SG_D, width: 1 },
    });
    // Initials circle — the site's avatar motif.
    s.addShape(pres.ShapeType.ellipse, {
      x: x + 0.26, y: 2.04, w: 0.64, h: 0.64,
      fill: { color: p.tone === "tr" ? TR : SG },
      line: { type: "none" },
    });
    s.addText(p.initials, {
      x: x + 0.26, y: 2.04, w: 0.64, h: 0.64,
      isTextBox: true, margin: 0, align: "center", valign: "middle",
      fontFace: SERIF, fontSize: 18, bold: true, color: CH,
    });
    s.addText(p.name, {
      x: x + 0.26, y: 2.8, w: 3.24, h: 0.32,
      isTextBox: true, margin: 0,
      // Keep every name on one line so the role label below never collides.
      fontFace: SERIF, fontSize: p.name.length > 20 ? 14.5 : 16.5, color: PL,
    });
    s.addText(p.role.toUpperCase(), {
      x: x + 0.26, y: 3.15, w: 3.24, h: 0.22,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 10, bold: true, charSpacing: 2,
      color: p.tone === "tr" ? TR_L : SG_L,
    });
    s.addText(p.bio, {
      x: x + 0.26, y: 3.44, w: 3.24, h: 1.2,
      isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 10.5, color: ON_DARK, lineSpacing: 14,
    });
  });

  // The ask
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.75, y: 5.14, w: 11.8, h: 1.4,
    rectRadius: 0.11,
    fill: { color: TR_D, transparency: 62 },
    line: { color: TR_L, width: 1 },
  });
  s.addText("The ask", {
    x: 1.05, y: 5.32, w: 3.0, h: 0.3,
    isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 11, bold: true, charSpacing: 2, color: TR_L,
  });
  s.addText(
    "We are raising [amount] to fund vendor recruitment in Portland and Denver through launch and the first twelve months.",
    {
      x: 1.05, y: 5.64, w: 8.4, h: 0.72,
      isTextBox: true, margin: 0,
      fontFace: SERIF, fontSize: 16, color: PL, lineSpacing: 23,
    },
  );
  s.addText("hello@codaco.market\ncoda-co-nine.vercel.app", {
    x: 9.7, y: 5.62, w: 2.6, h: 0.7,
    isTextBox: true, margin: 0, align: "right",
    fontFace: SANS, fontSize: 12, color: ON_DARK, lineSpacing: 17,
  });

  s.addNotes(
    "Replace [amount] with the raise before sending. Founders are operators in this space, not outsiders to it — the marketplace exists because they kept being asked for the referrals it now holds.",
  );
}

const out = process.argv[2] ?? "CodaCo-Pitch-Deck.pptx";
await pres.writeFile({ fileName: out });
console.log(`Wrote ${out}`);
