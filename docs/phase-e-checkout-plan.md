# Phase E — Cart & Checkout plan

The buyer-facing half of Phase E ("orders + checkout + vendor
notifications"). Scope and data model come from
`docs/data-model-evolution.md` → "Phase E"; this doc turns that into a
build-ordered workflow. Vendor-side fulfillment (`/dashboard/orders`,
shipping, notifications) is summarized at the end but tracked as its own
chunk.

## What exists today

- **Cart is client-only.** `components/providers/CartProvider.tsx` holds
  `{ productId, variantId, qty }` line items in `localStorage` (key
  `coda-cart`). `useCart()` exposes `items`, `count`, `addItem`,
  `removeItem`, `updateQty`, `clear`.
- **No way to *see* the cart.** Add-to-cart works from the PDP
  (`components/pdp/AddToCart.tsx`), but there's no nav cart icon and no
  cart view. This is called out in `TASKS.md` ("Cart count in nav",
  "Cart drawer / cart icon in nav").
- **No `orders` / `order_items` tables.** `prisma/schema.prisma` has no
  commerce models yet.
- **Stripe is already integrated — for vendor billing only.**
  `lib/stripe.ts`, `lib/billing/*`, `app/api/stripe/webhook/route.ts`,
  and the `VendorPayment` model implement hosted Stripe Checkout +
  webhook reconciliation. Buyer checkout reuses this exact pattern rather
  than inventing a second one.

## Customer flow (happy path)

```
PDP "Add to cart"  →  cart count appears in Nav
        │
        ▼
/cart  (review line items, qty edit, remove, subtotal)
        │  "Checkout" CTA  (→ /login?next=/checkout if anon)
        ▼
/checkout  (shipping address form + order summary)
        │  "Place order"
        ▼
createOrder() server action  (one Prisma transaction)
   • re-fetch live variant prices  (never trust the client)
   • verify stock ≥ qty per line   (reject oversell)
   • reserve/decrement stock
   • write orders + order_items (price/title/variant snapshots)
   • snapshot shipping address as JSONB
        │
        ▼
Payment  →  /checkout/success  (clear cart, show order)
        │
        ▼
Vendor notified (email + /dashboard/orders)
```

Decisions baked in (from the data-model doc + the questions answered when
this plan was drafted):

- **Cart view is a dedicated `/cart` route**, not a slide-over drawer —
  simplest to build and link to, uses existing `<Container>` / `<Card>`
  primitives.
- **Checkout requires sign-in.** Anonymous buyers hit
  `/login?next=/checkout` (the existing role-gate redirect pattern, e.g.
  `app/admin/page.tsx`). Guest checkout is deferred.
- **Cart stays client-only.** No cart table; the order is the first thing
  written to the DB, at checkout.

## Build sequence (one PR per row)

| PR | Scope | Touches schema? |
|----|-------|-----------------|
| 1  | Cart visibility: nav cart count + `/cart` page | No |
| 2  | `orders` / `order_items` schema + `createOrder` transaction + dev stub-paid checkout | Yes |
| 2.5 | **Maker payout onboarding** — Stripe Connect account + dashboard flow (prerequisite for PR 3) | Yes (`stripeConnectAccountId`) |
| 3  | Real Stripe Checkout for buyers + stock reservation + Connect split | No (reuses PR 2/2.5 schema) |
| 4  | Vendor `/dashboard/orders` + "Mark shipped" + new-order email | Maybe (`order_item_events`) |

PR 1 is independently demoable and unblocks everyone. PRs 2–4 are
additive; gate any not-yet-ready surface behind route checks, not
branches (per the migration workflow conventions). **PR 2.5 must land
before PR 3** — buyers can't pay for a product whose maker hasn't set up
a payout account (there'd be nowhere for the money to go).

---

### PR 1 — Cart visibility (no DB)

- **Nav cart count.** `Nav` needs client-side access to `useCart().count`.
  Either make the cart icon a small client island inside the server-
  rendered nav, or mirror the count into a cookie the server can read.
  Island is simpler and avoids cookie/localStorage sync. Hide the badge
  when `count === 0`.
- **`/cart` page** (`app/cart/page.tsx`). The cart stores only ids, so
  the page hydrates display data via `getProducts({ ids })`
  (`lib/api/products.ts`) — titles, prices, variant labels, thumbs are
  always live, never copied into the cart. Render with `<Container>`,
  `<Card>`, `formatPriceRange`, `productThumbBg`.
  - Per-line: qty stepper (`updateQty`), remove (`removeItem`),
    line subtotal.
  - Cart subtotal + a "Checkout" CTA linking to `/checkout`.
  - Empty state with a link back to `/shop`.
- **Stale-line handling.** If a stored variant no longer exists or its
  product is unpublished/deleted, surface the line as unavailable and let
  the buyer remove it — don't crash the page.

### PR 2 — Orders schema + `createOrder` + stub payment

**Schema** (`prisma/schema.prisma`, per the data-model doc):

- `orders` — `id`, `buyerUserId` (FK → `users.id`), `status`
  (`OrderStatus`, default `unknown`), `totalCents`, `currency`,
  `shippingAddress` JSONB snapshot, `placedAt`, timestamps. One order can
  span multiple vendors.
- `order_items` — `id`, `orderId`, `productVariantId`, `vendorId`
  (snapshot), `quantity`, `unitPriceCents` (snapshot), `currency`,
  `productTitleSnapshot`, `variantLabelSnapshot`, `fulfillmentStatus`
  (default `unknown`), timestamps. Tracking columns
  (`trackingCarrier`/`trackingNumber`/`shippedAt`/`deliveredAt`) land
  with PR 4.
- Enums: `OrderStatus` (`unknown`, `pending`, `paid`, `fulfilled`,
  `cancelled`, `refunded`) and `OrderItemFulfillmentStatus` (`unknown`,
  `pending`, `shipped`, `delivered`, `cancelled`, `returned`) — each with
  `unknown` as default, matching the house style.
- Generate the migration with `npx prisma migrate dev --name
  add-orders` against a local DB (see AGENTS.md "Local DB for migration
  generation"); commit `schema.prisma` + the new migration dir together.

**`/checkout` page** (`app/checkout/page.tsx`):

- `auth()` gate → `redirect("/login?next=/checkout")` for anon.
- Shipping address form + read-only order summary (same live-hydration as
  `/cart`).

**`createOrder` server action** (`app/checkout/actions.ts`) — the
load-bearing piece. All inside `prisma.$transaction` (the `lib/db.ts`
proxy binds methods so `$transaction` works):

1. Re-read each `product_variant` by id; reject if missing/unpublished.
2. Compute `unitPriceCents` from the **live** variant, not the client.
3. Assert `stock >= qty` per line; reject the whole order on any
   shortfall (oversell guard).
4. Decrement/reserve stock.
5. Create `orders` + `order_items` with price/title/variant snapshots and
   the address JSONB snapshot.
6. Return the order id; client clears the cart and routes to
   `/checkout/success`.

**Stub payment.** Order is created `pending`; a **dev-only** "Mark as
paid" control flips it to `paid`. This lets the entire flow ship and demo
before Stripe. (Explicitly the sequencing the data-model doc calls for:
"First pass uses a stub 'Mark as paid' button in dev; real Stripe
Checkout is a follow-up.")

### PR 2.5 — Maker payout onboarding (prerequisite for PR 3)

Stripe Connect splits each payment at charge time, so a maker can only be
paid once they have a **connected account**. This must exist before any
real buyer payment can route money — hence its own PR, landed before PR 3.

- **Schema.** Add `stripeConnectAccountId String? @unique` to
  `VendorProfile` (the previously deferred `payout_account_id`). Null
  until the maker starts onboarding.
- **Onboarding flow.** A "Set up payouts" action in the vendor dashboard
  creates a Stripe **Express** connected account and an **Account Link**,
  then redirects the maker to Stripe's hosted onboarding (bank details,
  identity — all collected by Stripe, never by CodaCo). Mirror the
  existing hosted-Checkout redirect pattern in
  `app/dashboard/billing/actions.ts`.
- **Status tracking.** Reconcile onboarding completion via the Connect
  webhook (`account.updated` → store that `charges_enabled` /
  `payouts_enabled` are true). The dashboard shows "Payouts: not set up /
  pending / ready."
- **Purchasability gate.** A product is only buyable when its maker's
  account is payout-ready. Surface this to the maker (a banner on their
  products) and enforce it at checkout — a cart line for a not-yet-ready
  maker is blocked with a clear message, never silently charged.
- **Demo/dev.** Behind `isStripeConfigured()`, fall back to the PR 2 stub
  path so the flow still works without live Connect keys.

### PR 3 — Stripe Checkout for buyers (with Connect)

Reuse the vendor-billing Checkout + webhook pattern (`app/dashboard/
billing/actions.ts` is the reference), extended for **Stripe Connect** —
the marketplace money-flow model chosen for this workflow (see
`docs/how-a-purchase-works.md` for the plain-language version).

- After `createOrder` writes the `pending` order, call
  `stripe.checkout.sessions.create({ mode: "payment", line_items,
  success_url, cancel_url, metadata: { orderId } })` and redirect to
  `session.url`.
- **Connect / money split.** Each maker has a **connected account**;
  payment is split at charge time so the maker's share lands in **their**
  account and CodaCo retains a **platform/application fee**. Use
  destination charges (or separate charges-and-transfers). A multi-vendor
  cart fans out to one transfer per maker.
- **Connect onboarding.** Add `stripeConnectAccountId` to
  `VendorProfile` (the deferred `payout_account_id`) and a dashboard
  onboarding link (Stripe Account Links / Express). A product can't be
  purchased until its maker has completed onboarding — gate or flag
  accordingly.
- **Reconcile in the webhook, never in the action** —
  `app/api/stripe/webhook/route.ts` flips the order `pending → paid` on
  `checkout.session.completed`, keyed by `metadata.orderId`. Same
  discipline the subscription/`VendorPayment` flow already uses.
- **Stock timing.** Reserve stock at order creation (step 4 above) so the
  redirect window can't oversell; release the reservation on a
  cancelled/expired session. (Decrementing only on the webhook leaves a
  race where two buyers both reach Checkout for the last unit.)
- Guard with `isStripeConfigured()` so non-Stripe environments fall back
  to the PR 2 stub path.

### PR 4 — Vendor fulfillment (own chunk)

Summarized here; full detail in the data-model doc.

- `/dashboard/orders` lists the vendor's `order_items` scoped by
  `vendorId`, grouped by `fulfillmentStatus` (Pending tab first).
- "Mark shipped" → carrier + tracking number; sets `shippedAt`,
  `trackingCarrier`, `trackingNumber`, `fulfillmentStatus = shipped`;
  emails the buyer.
- New-order transactional email (Resend or Postmark) to each vendor with
  an item on the order, sent when the rows are created.
- `order_item_events` audit log (`id, orderItemId, status, actorUserId,
  note?, createdAt`) lands here.
- `orders.status` is derived from its items (`paid` on creation,
  `fulfilled` once every item is `delivered`, `cancelled` if all items
  cancelled) — recompute on read first; a trigger later if needed.

## Open questions / deferred

- **Shipping & tax.** The data-model doc defers `subtotal_cents` /
  `shipping_cents` / `tax_cents` until rules exist; first pass treats
  `totalCents` as the line-item sum (free shipping, no tax), matching the
  "Free shipping" copy already in `AddToCart`.
- **`shipping_addresses` table vs. inline form.** The schema plans a
  `shipping_addresses` table (many per user), but the order only needs the
  JSONB snapshot. First pass can collect the address inline at checkout
  and snapshot it; the saved-addresses table is additive when a buyer
  dashboard exists.
- **Guest checkout** — deferred (sign-in required for now).
- **`delivered_at` from carriers** — deferred Phase E follow-up; until
  then buyer or admin marks "received."
