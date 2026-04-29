# CodaCo: Task Tracker

This file tracks implementation progress for the Next.js rebuild. See `PLAN.md` for the full architecture.

---

## Phases

### Phase 1 — Project Setup ✅
- [x] Bootstrap Next.js 15 with TypeScript, Tailwind v4, App Router, Turbopack
- [x] Enable React Compiler (`experimental.reactCompiler`)
- [x] Configure Tailwind `@theme` tokens in `app/globals.css`
- [x] Set up `next/font` with Cormorant Garamond + DM Sans
- [x] Create full directory structure (`lib/`, `components/`, all `app/` routes)
- [x] Write `PLAN.md` and `TASKS.md`

---

### Phase 2 — Types + Data Layer
- [x] Write all TypeScript interfaces in `lib/types.ts`
- [ ] Extract mock products into `lib/data/products.ts`
- [ ] Extract mock vendors into `lib/data/vendors.ts`
- [ ] Extract mock reviews into `lib/data/reviews.ts`
- [ ] Extract mock plans into `lib/data/plans.ts`
- [ ] Write `lib/api/products.ts` — `getProducts()`, `getProduct()`
- [ ] Write `lib/api/vendors.ts` — `getVendors()`, `getVendor()`
- [ ] Write `lib/api/reviews.ts` — `getReviews()`, `getReviewSummary()`
- [ ] Write `lib/api/plans.ts` — `getPlans()`

---

### Phase 3 — Shared Components
- [ ] `components/layout/Nav.tsx` (RSC)
- [ ] `components/layout/Footer.tsx` (RSC)
- [ ] `components/layout/Breadcrumb.tsx` (RSC)
- [ ] `components/ui/ProductCard.tsx` (RSC)
- [ ] `components/ui/ServiceCard.tsx` (RSC)
- [ ] `components/ui/PlanCard.tsx` (client — interactive selection)
- [ ] `components/ui/ReviewCard.tsx` (RSC)
- [ ] `components/ui/StarRating.tsx` (RSC)
- [ ] `components/ui/Badge.tsx` (RSC)
- [ ] `components/ui/Button.tsx`
- [ ] `components/ui/WaveDivider.tsx` (RSC)
- [ ] `components/ui/StepsBar.tsx` (RSC)
- [ ] `components/providers/CartProvider.tsx` (client — Context + localStorage)

---

### Phase 4 — Pages

#### 4a — Static / simple pages
- [ ] `app/where-to-start/page.tsx`
- [ ] `app/list-with-us/page.tsx`
- [ ] `app/list-with-us/confirm/page.tsx`

#### 4b — Shop + Services
- [ ] `app/shop/page.tsx` + `components/shop/ProductGrid.tsx`
- [ ] `components/shop/FilterSidebar.tsx` (client)
- [ ] `components/shop/FilterStrip.tsx` (client)
- [ ] `app/services/page.tsx` + `components/services/ServiceGrid.tsx`
- [ ] `components/services/ServiceSearch.tsx` (client)
- [ ] `components/services/ServiceFilters.tsx` (client)

#### 4c — Product Detail Page (PDP)
- [ ] `app/shop/[productId]/page.tsx`
- [ ] `components/pdp/ImageGallery.tsx` (client)
- [ ] `components/pdp/VariantSelector.tsx` (client)
- [ ] `components/pdp/QuantityAdjuster.tsx` (client)
- [ ] `components/pdp/AddToCart.tsx` (client)
- [ ] `components/pdp/ProductTabs.tsx` (client)
- [ ] `components/pdp/ReviewHistogram.tsx` (RSC)

#### 4d — Landing Page
- [ ] `app/page.tsx`
- [ ] `components/landing/Hero.tsx` (RSC)
- [ ] `components/landing/GuidedSearch.tsx` (client)

#### 4e — Vendor Onboarding Forms
- [ ] `app/list-with-us/goods/page.tsx` + `components/vendor/GoodsForm.tsx` (client)
- [ ] `app/list-with-us/services/page.tsx` + `components/vendor/ServicesForm.tsx` (client)
- [ ] `app/list-with-us/plan/page.tsx` + `components/vendor/PlanSelector.tsx` (client)

---

### Phase 5 — State Wiring
- [ ] Wire cart state: `CartProvider` → `AddToCart`, Nav cart count
- [ ] Wire filter state: searchParams → `FilterSidebar` / `FilterStrip` → page RSC
- [ ] Wire multi-step form state + URL step param
- [ ] Add Server Actions for form submission stubs

---

## Notes for Future Agents

- **Design reference**: `index.html.reference` contains the full original prototype. Use it for visual parity, copy, and layout reference.
- **Tailwind tokens**: All brand colors are in `app/globals.css` under `@theme`. Use `bg-tr`, `text-sg-d`, `border-tr-l`, `font-serif`, etc.
- **RSC first**: Components are RSC by default. Only add `'use client'` if the component needs `useState`, `useEffect`, browser APIs, or event handlers.
- **Data API**: All data is fetched via `lib/api/*.ts`. These functions are async — call them with `await` in Server Components. Do not import from `lib/data/*.ts` directly in components.
- **Fonts**: Loaded via `next/font` in `app/layout.tsx`, exposed as CSS variables `--font-serif` and `--font-sans`, referenced in Tailwind `@theme`.
