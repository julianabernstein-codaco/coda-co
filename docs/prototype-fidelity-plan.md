# Plan: Restore prototype fidelity to the Next.js homepage

## Context

The current Next.js app at `app/page.tsx` was rewritten freehand instead of being a faithful port of `index.html.reference`. The result has drifted in three ways that the screenshots make obvious:

1. **Wrong tagline.** "Death care, done with intention." replaced the prototype's "Everything you need to plan / *a meaningful end.*" Eyebrow "A curated marketplace" replaced "WELCOME". Subtagline "Death is a part of life. Support shouldn't be hard to find." was dropped entirely.
2. **Wrong alignment.** The hero content is left-aligned with `max-w-[780px] mx-auto` but no `text-center`, while the prototype `.hero` is `text-align:center`. All `.shd` headers in the prototype are centered too.
3. **Wrong guided-search affordance + nav.** The prototype shows two visible CTAs under the search bar ("Someone I love just died — I don't know where to start →" and "Or answer a few questions to find what you need ↓"). The webapp collapsed both into one toggle button. Nav also lost the "Books" and "Light & dark" links and added "Where to start" instead.
4. **Missing whole sections.** The prototype has Books / Reading Room and Light & Dark sections, plus a 3-step vendor onboarding block, none of which exist in `app/page.tsx`.

Other smaller drifts: search bar shape (prototype is one pill: input + button share rounded ends, no gap), featured-products count (4 vs. 6), services section (prototype has a "Showing results near: New York, NY" location bar + two text links, webapp shows a 6-pill type filter), Where-to-start CTA section (webapp invented a dark CTA section that doesn't exist in the prototype).

**Goal:** make `/` a pixel-faithful port of `index.html.reference` Page 0, while keeping the modular component structure (Nav, Footer, ProductCard, ServiceCard, WaveDivider, GuidedSearch).

## Approach

Treat `index.html.reference` lines 432–627 as the source of truth and walk top-to-bottom, porting each block. Reuse what already works (design tokens in `app/globals.css`, ProductCard, ServiceCard, WaveDivider, Logo, Footer); rewrite what drifted (Nav links, GuidedSearch UX, the entire `app/page.tsx` body); add what's missing (Books, Light & Dark, vendor-steps sections).

Don't refactor tokens or component APIs — they already match the prototype's CSS variables. The fix is HTML structure + class application + copy.

## Files to change

### 1. `app/page.tsx` — rewrite to mirror prototype Page 0

Replace the whole component body with sections in this exact order, all with `max-width:900px` (or 880px for goods/services as in prototype) centered containers:

- **Hero** (`bg-white px-10 pt-[4.5rem] pb-12 text-center`)
  - Eyebrow "WELCOME" (`.ey` style: 11px uppercase, terracotta)
  - H1 `Everything you need to plan<br/><em>a meaningful end.</em>` — 52px serif weight 300, `<em>` italic terracotta
  - `<p>` hero-tag — 15px, color `--cm`, max-width 560px, margin-bottom .5rem
  - `<p>` hero-tag2 italic — "Death is a part of life. Support shouldn't be hard to find."
  - **Search bar (one pill)**: `flex max-w-[500px] mx-auto`. Input: `flex-1 px-5 py-3.5 border-1.5 border-tr/25 border-r-0 rounded-l-[28px]`. Button: `bg-tr text-white px-5 py-3.5 rounded-r-[28px]`. Placeholder "Search goods, services, books…".
  - **Two-tier guided CTAs** (replaces the webapp's single toggle):
    - Line 1: `Someone I love just died — <Link>I don't know where to start →</Link>` (link goes to `/where-to-start`)
    - Line 2: `<button onClick={toggle}>Or answer a few questions to find what you need ↓</button>`
  - `<GuidedSearch />` (now controlled — see component changes below)

- **Wave** white → `--tr-vp` (#FCF4F1)

- **Browse by category** (`bg-tr-vp` — center-aligned `.shd` header, 10 categories). Replace "Memorial items" entry with "Books" to match prototype's 10-tile set (urns, ash jewelry, shrouds, planning docs, doulas, attorneys, death cleaning, celebrants, books, gifts & humor). Use prototype's exact Books icon (two stacked rectangles).

- **Wave** `--tr-vp` → white

- **Support in your area** (`bg-white`, eyebrow `.eys` sage, "Vetted providers · search by zip or city" subhead). Replace the type-pill row with a `.loc-bar` ("Showing results near:" + readonly-styled input "New York, NY 10001" + sage "Change" button). Show 4 vendors via `getFeaturedVendors(4)`. Below grid, two centered `.va` links: "Search all service providers →" (terracotta) and "Not sure what you need? See our guide for recently bereaved →" (sage).

- **Wave** white → `--sg-vp`

- **Featured in the marketplace** (`bg-sg-vp`, eyebrow "HANDPICKED GOODS", subhead "Available locally or shipped anywhere in the US"). 4 products via `getFeaturedProducts(4)`. Centered `.shd` header. "View all goods →" centered link below grid.

- **Wave** `--sg-vp` → white

- **Books on death & dying** (`bg-white`, eyebrow `.eys` sage "THE READING ROOM"). New section. Hardcode the 4 prototype book cards (Briefly Perfectly Human, Smoke Gets in Your Eyes, Being Mortal, When Breath Becomes Air) with their cover background colors and SVG line-overlays. Inline JSX is fine — no new component needed.

- **Wave** white → `--tr-vp`

- **Light & Dark** (`bg-tr-vp`). New section. Charcoal banner row with H3 "Light & Dark — Because death is also funny." + "Shop all →" button on the right. 4-card grid of charcoal quote tiles (`hm-c` style) with the prototype's exact 4 quotes/items/prices.

- **Wave** `--tr-vp` → white

- **Reach people who are ready** (`bg-white text-center`). New section replacing the webapp's invented dark "Where to start" CTA. Eyebrow "FOR VENDORS & SERVICE PROVIDERS", H2, copy, then a 3-step `.vd-steps` grid (Create your profile / List goods or services / Connect with clients), then "List goods →" primary + "List services" secondary buttons linking to `/list-with-us/goods` and `/list-with-us/services`.

- **Wave** white → charcoal (footer)

Footer is already rendered by `app/layout.tsx` via `<Footer />` — leave it alone unless it diverges (verify).

### 2. `components/layout/Nav.tsx` — restore prototype links

- Replace `link("Where to start", "/where-to-start", "guide")` with two entries: `link("Books", "/books", "books")` and `link("Light & dark", "/light-and-dark", "light")`. The prototype links are `<a>` placeholders with no href, so `/books` and `/light-and-dark` can be `#` for now (matching prototype's no-route behavior); confirm with user if real routes are wanted.
- Extend `NavProps["active"]` union to include `"books" | "light"`.

### 3. `components/landing/GuidedSearch.tsx` — controlled + two-tier UI

The prototype shows the panel only when "Or answer a few questions…" is clicked. Change `GuidedSearch` to:
- Accept `open: boolean` and `onToggle: () => void` props instead of owning `open` state.
- Remove the internal toggle button (the page renders both CTA links above it now).
- Inside the panel, switch from horizontal pills to the prototype's 2×2 grid (`grid-cols-2 gap-2.5`) of `.gb-btn` cards, with the "Someone I love just died" tile in `.featured` style (terracotta-tinted background + 1.5px terracotta-pale border).
- Each tile shows a bold title + smaller description line (matching `.gb-title` / `.gb-desc` from prototype lines 197–203).
- Sub-panel content reuses existing structure but matches prototype copy more closely (the webapp's current subPanels copy was rewritten — port the prototype's `.gs-recently`, `.gs-planning`, `.gs-memorial`, `.gs-learn` content verbatim, including the sub-tag pills with sage backgrounds for planning/memorial/learn).
- Add `← Back` button (`.guide-back`) inside each sub-panel that calls `setActiveSub(null)`.

`app/page.tsx` owns the `open` state and passes it down.

### 4. `app/globals.css` — verify, no expected changes

Tokens already match. Skim once to confirm `--color-tr-vp`, `--color-sg-vp`, `--color-cm`, `--color-cl`, `--color-tp`, `--color-sp` are all present and correct hex values vs. prototype `:root`. (Spot-checked: `--tr-vp #FCF4F1` ✓, `--sg-vp #F1F7F2` ✓.)

### 5. `components/ui/WaveDivider.tsx` — verify geometry

Prototype `.wd { padding-bottom:60px; margin-bottom:-60px } .wu { border-radius:50% 50% 0 0/60px 60px 0 0 }`. Confirm component implements this exact pair; if it draws the wave differently, fix to match.

## Files NOT to change

- `components/ui/ProductCard.tsx`, `ServiceCard.tsx`, `Logo.tsx`, `Footer.tsx`, `Badge.tsx`, `StarRating.tsx` — already match.
- `lib/api/products.ts`, `lib/api/vendors.ts` — only the count argument changes.
- Other routes (`/shop`, `/services`, `/where-to-start`, `/list-with-us/*`) — out of scope for this task; the user asked specifically about the homepage difference.

## Verification

1. `npm run dev`, open `http://localhost:3000`, visually diff against the first screenshot side-by-side. Check: hero copy, alignment, search-bar pill shape, both guided-search CTA lines visible by default, panel opens on toggle with 2×2 grid + featured tile, nav has "Books" and "Light & dark", all 8 sections present in correct order (hero, categories, services, goods, books, light-and-dark, vendor-steps, footer), wave dividers visually continuous.
2. Click "Or answer a few questions…" → panel opens. Click each of the 4 tiles → corresponding sub-panel renders with sub-tag pills (where applicable) and a Back button.
3. Click "I don't know where to start →" → routes to `/where-to-start`.
4. `npm run build` succeeds (no TS errors from the `NavProps` union widening or `GuidedSearch` prop change).
5. Resize to ~768px and confirm grids reflow (categories 2-up, products 2-up, services 1–2 up) — prototype uses `auto-fit minmax(...)` so this should work without breakpoints.

## Decisions confirmed with user

- **Nav links**: Create stub pages at `app/books/page.tsx` and `app/light-and-dark/page.tsx` (minimal "Coming soon" placeholders) so the new nav entries route somewhere real.
- **Dark "Where to start" CTA section**: Remove it from `app/page.tsx`. The hero's "I don't know where to start →" link is the only entry point to `/where-to-start`, matching the prototype.
