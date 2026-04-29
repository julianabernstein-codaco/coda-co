# CodaCo: Architecture Plan

## Context

CodaCo is a curated marketplace for death and dying — connecting buyers with trusted handmade goods (urns, jewelry, burial shrouds, planning documents) and service providers (death doulas, estate attorneys, grief counselors). The original prototype was a single `index.html` file (preserved as `index.html.reference`). This plan describes the modular Next.js rebuild.

---

## Stack

| Layer | Choice |
|---|---|
| Meta-framework | Next.js 15+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel |
| React | React 19 + React Compiler (auto-memoization) |
| Fonts | `next/font` — Cormorant Garamond (serif) + DM Sans (sans) |

---

## Routes

| URL | Page | Notes |
|---|---|---|
| `/` | Landing | Hero, guided search, category grid, featured services |
| `/shop` | Shop goods | Product grid, filter sidebar, sort |
| `/shop/[productId]` | Product detail | Gallery, variants, tabs, reviews, add to cart |
| `/services` | Find services | Search bar, filter sidebar, service cards, map placeholder |
| `/where-to-start` | Where to start | Guide for recently bereaved — static educational content |
| `/list-with-us` | Vendor landing | Value props, testimonials, FAQ |
| `/list-with-us/goods` | List goods form | Multi-step: Profile → Listing → Photos & Pricing → Plan |
| `/list-with-us/services` | List services form | Multi-step: Profile → Service → Area & Availability → Plan |
| `/list-with-us/plan` | Plan selection | Shared plan review page (goods or services) |
| `/list-with-us/confirm` | Confirmation | Post-submission confirmation + next steps |

---

## Directory Structure

```
coda-co/
├── app/
│   ├── layout.tsx                 # Root layout: Nav, Footer, CartProvider
│   ├── globals.css                # Tailwind @theme tokens + base reset
│   ├── page.tsx                   # Landing page
│   ├── shop/
│   │   ├── page.tsx               # Shop goods grid
│   │   └── [productId]/page.tsx   # Product detail
│   ├── services/page.tsx
│   ├── where-to-start/page.tsx
│   └── list-with-us/
│       ├── page.tsx
│       ├── goods/page.tsx
│       ├── services/page.tsx
│       ├── plan/page.tsx
│       └── confirm/page.tsx
│
├── components/
│   ├── layout/
│   │   ├── Nav.tsx                # RSC — sticky nav with active link state
│   │   ├── Footer.tsx             # RSC — multi-column footer
│   │   └── Breadcrumb.tsx         # RSC — breadcrumb trail
│   ├── ui/
│   │   ├── ProductCard.tsx        # RSC
│   │   ├── ServiceCard.tsx        # RSC
│   │   ├── PlanCard.tsx           # 'use client' — interactive selection
│   │   ├── ReviewCard.tsx         # RSC
│   │   ├── StarRating.tsx         # RSC
│   │   ├── Badge.tsx              # RSC
│   │   ├── Button.tsx             # RSC (or client)
│   │   ├── WaveDivider.tsx        # RSC — SVG wave section separator
│   │   └── StepsBar.tsx           # RSC
│   ├── shop/
│   │   ├── ProductGrid.tsx        # RSC
│   │   ├── FilterSidebar.tsx      # 'use client' — reads/writes searchParams
│   │   └── FilterStrip.tsx        # 'use client' — horizontal pill filters
│   ├── services/
│   │   ├── ServiceGrid.tsx        # RSC
│   │   ├── ServiceSearch.tsx      # 'use client'
│   │   └── ServiceFilters.tsx     # 'use client'
│   ├── landing/
│   │   ├── Hero.tsx               # RSC
│   │   └── GuidedSearch.tsx       # 'use client' — collapsible panel
│   ├── pdp/
│   │   ├── ImageGallery.tsx       # 'use client'
│   │   ├── VariantSelector.tsx    # 'use client'
│   │   ├── QuantityAdjuster.tsx   # 'use client'
│   │   ├── AddToCart.tsx          # 'use client'
│   │   ├── ProductTabs.tsx        # 'use client'
│   │   └── ReviewHistogram.tsx    # RSC
│   ├── vendor/
│   │   ├── GoodsForm.tsx          # 'use client' — multi-step form
│   │   ├── ServicesForm.tsx       # 'use client' — multi-step form
│   │   └── PlanSelector.tsx       # 'use client'
│   └── providers/
│       └── CartProvider.tsx       # 'use client' — React Context + localStorage
│
├── lib/
│   ├── types.ts                   # All TypeScript interfaces
│   ├── data/
│   │   ├── products.ts            # Mock Product[]
│   │   ├── vendors.ts             # Mock Vendor[]
│   │   ├── reviews.ts             # Mock Review[]
│   │   └── plans.ts               # Mock Plan[]
│   └── api/
│       ├── products.ts            # getProducts(), getProduct()
│       ├── vendors.ts             # getVendors(), getVendor()
│       ├── reviews.ts             # getReviews()
│       └── plans.ts               # getPlans()
│
└── public/
    └── favicon.svg
```

---

## Design Tokens (Tailwind @theme)

Defined in `app/globals.css`:

| Token | Value | Usage |
|---|---|---|
| `--color-tr` | `#C1634F` | Terracotta — primary brand, CTAs |
| `--color-tr-l` | `#D4876F` | Terracotta light — hover states |
| `--color-tr-p` | `#F5EAE6` | Terracotta pale — card backgrounds |
| `--color-tr-d` | `#8B3E2D` | Terracotta dark — pressed states |
| `--color-tr-vp` | `#FCF4F1` | Terracotta very pale — page sections |
| `--color-sg` | `#7A9E82` | Sage green — secondary brand |
| `--color-sg-l` | `#A8C4AC` | Sage light |
| `--color-sg-p` | `#EAF0EB` | Sage pale |
| `--color-sg-d` | `#4D7255` | Sage dark |
| `--color-sg-vp` | `#F1F7F2` | Sage very pale — page sections |
| `--color-ch` | `#2C2825` | Charcoal — primary text |
| `--color-cm` | `#5A534C` | Medium charcoal — body text |
| `--color-cl` | `#9A9189` | Light charcoal — secondary/muted |
| `--color-pl` | `#FAF9F7` | Warm off-white |
| `--color-pl2` | `#F3F1EE` | Warm gray |
| `--font-serif` | Cormorant Garamond | Headings, display text |
| `--font-sans` | DM Sans | Body, UI |

---

## State Management

| State | Strategy |
|---|---|
| Filter state (shop, services) | URL `searchParams` — shareable, bookmarkable |
| Cart | React Context (`CartProvider`) + `localStorage` |
| Multi-step vendor forms | Component state + URL `?step=N` param |
| Form submission | Server Actions |

---

## Key Architectural Decisions

- **RSC by default** — only add `'use client'` where interactivity requires it
- **React Compiler enabled** — no manual `useMemo`/`useCallback`/`React.memo`
- **Filter state in URL** — `/shop?category=urns` is shareable and back-button safe
- **Async API functions** — `getProducts()` is async from day one; swapping mock data for a real DB (`Prisma`, `Drizzle`) requires changing only `lib/api/*.ts`
- **No external state library** — Context + URL params cover all current needs

---

## Data Entities

See `lib/types.ts` for full TypeScript definitions.

**Product**: id, title, seller, sellerId, location, price, category, badge, thumbBg, variants[], glazeOptions?, rating, reviewCount, verified, description, details{}, relatedIds?

**Vendor**: id, initials, name, type, location, bio, credentials?, rating, reviewCount, distanceMi?, accepting, virtual, inHome, specializations[], verified

**Review**: id, productId, reviewer, location, date, rating, body

**Plan**: id, name, price, period, features[], popular, transactionFee, targetType

---

## Reference

The original prototype HTML is preserved at `index.html.reference`. Use it as the visual and content source of truth throughout development.
