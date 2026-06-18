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
| 5  | **Shipping labels** — buy/print a real label via EasyPost (replaces manual tracking entry) | Yes (parcel + label fields) |
| 6  | **Cancellations & refunds** — self-cancel pre-ship, maker-reviewed returns after, Connect-aware refunds | Yes (`refunds` / refund fields) |

PR 1 is independently demoable and unblocks everyone. PRs 2–4 are
additive; gate any not-yet-ready surface behind route checks, not
branches (per the migration workflow conventions). **PR 2.5 must land
before PR 3** — buyers can't pay for a product whose maker hasn't set up
a payout account (there'd be nowhere for the money to go). **PR 5 builds
on PR 4** and needs the parcel/ship-from data called out below.

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
  emails the buyer. (PR 5 adds a "Buy a label" path that fills these in
  automatically; this manual entry stays as the fallback for makers who
  ship outside CodaCo.)
- New-order transactional email (Resend or Postmark) to each vendor with
  an item on the order, sent when the rows are created.
- `order_item_events` audit log (`id, orderItemId, status, actorUserId,
  note?, createdAt`) lands here.
- `orders.status` is derived from its items (`paid` on creation,
  `fulfilled` once every item is `delivered`, `cancelled` if all items
  cancelled) — recompute on read first; a trigger later if needed.

### PR 5 — Shipping labels (EasyPost)

Lets a maker **buy and print a real shipping label from the dashboard**
instead of going to the carrier themselves and pasting a tracking number
back in. Provider is **EasyPost** (one API for rates + label purchase +
tracking, and its tracker webhook also closes out the long-deferred
`deliveredAt` polling). See `docs/how-a-purchase-works.md` for the
plain-language version.

**The label workflow (maker side):**

1. A **paid** order item sits in `/dashboard/orders` → Pending.
2. Maker clicks **"Buy shipping label."** CodaCo assembles an EasyPost
   *Shipment* from three inputs: **ship-from** (the maker's address),
   **ship-to** (the order's address snapshot), and the **parcel**
   (weight + dimensions of the item).
3. EasyPost returns **rates**. Maker picks a service (or CodaCo
   auto-selects cheapest / a default carrier).
4. Maker confirms; CodaCo **buys the label** via EasyPost. Postage is
   funded per the cost model chosen below.
5. EasyPost returns a **label (PDF/PNG)** + **tracking number** +
   **tracking URL**. CodaCo stores them on the `order_item`, sets
   `fulfillmentStatus = shipped` and `shippedAt`, and emails the buyer
   the tracking link — the same notification PR 4 already sends.
6. Maker **downloads and prints** the label, attaches it, and drops the
   package off (or schedules a pickup, an EasyPost extra later).
7. EasyPost's **tracker webhook** updates `deliveredAt` /
   `fulfillmentStatus = delivered` automatically — no buyer/admin
   self-marking needed once this lands.

**What else we'd need for this to work** (the real gaps — most of these
don't exist today):

- **Structured parcel data (data gap).** Labels need a numeric **weight**
  and **length/width/height**. Today products only have free-form
  `details.weight` / `details.dimensions` *display strings* — unusable
  for an API. Add real numeric fields on **`product_variants`** (variants
  differ in size/weight) and collect them in the product editor. Without
  this, no rate or label can be generated. Block "Buy a label" (and, in
  the buyer-pays model, purchasability) until a product has parcel data.
- **A structured ship-from address (data gap).** `VendorProfile` has a
  free-text `location` + `zip`, not a full street address. EasyPost needs
  a complete, verified from-address (name, line1/2, city, state, postal,
  country). Add structured ship-from fields to the vendor profile (or
  reuse the address already on their Stripe Connect account) and verify
  it via EasyPost address verification.
- **Ship-to address** — *already covered.* The order's
  `shippingAddress` JSONB snapshot is the to-address.
- **EasyPost client + key.** `lib/shipping/easypost.ts` — a lazy client
  mirroring `lib/stripe.ts`'s proxy (key read on first use), plus an
  `isShippingConfigured()` guard so environments without a key fall back
  to PR 4's manual tracking entry.
- **New persistence (schema).** Extend `order_items` with
  `shippingLabelUrl`, `easypostShipmentId`, and `postageCostCents`
  (+ `currency`); the `trackingCarrier` / `trackingNumber` / `shippedAt`
  / `deliveredAt` columns from PR 4 are reused.
- **A tracking webhook route.** `app/api/easypost/webhook/route.ts` for
  tracker events → `deliveredAt`. Mirror the Stripe webhook's
  signature-verify-then-reconcile shape.
- **Postage cost model — open decision (documented both ways):**
  - *Buyer pays shipping at checkout.* The buyer is charged calculated
    shipping as a real line on the order. **This reaches back into PR 3:**
    to quote a rate at checkout we need parcel data at listing time **and**
    the buyer's address before payment, so checkout makes an EasyPost
    *rate* call and adds `shippingCents` to the total (activating the
    deferred `shipping_cents` column). Most transparent; more moving parts.
  - *Maker absorbs (free shipping).* Matches the "Free shipping" copy
    already in `AddToCart`. No rate quote at checkout; the maker pays
    postage when buying the label, **deducted from their Stripe Connect
    payout** (reduce the transfer by `postageCostCents`) or charged to a
    card on file. Simpler checkout; postage is a maker cost of doing
    business.
  - Pick before building PR 5; the buyer-pays path changes PR 3, the
    maker-absorbs path doesn't.
- **Fallback path stays.** International, oversized, or
  EasyPost-down cases fall back to PR 4's manual "enter your own tracking
  number." Never hard-block a maker from fulfilling.

### PR 6 — Cancellations & refunds

Because CodaCo uses **Stripe Connect destination charges**, the sale
already split at payment time — the maker's share sits in *their*
connected account and CodaCo's platform fee was taken up front. That
shapes every refund: a refund is paid from CodaCo's platform balance, so
to avoid CodaCo eating the whole thing we **reverse the maker's transfer**
to claw their share back, and *separately* decide whether CodaCo's fee
comes back too. See `docs/how-a-purchase-works.md` for the
plain-language version.

**Three paths, by where the order is in its life:**

**1. Cancel before payment** (order is `pending`, never paid).
Already handled by the abandoned-checkout path: release the reserved
stock, set order `cancelled`. No Stripe call — no money moved.

**2. Self-cancel after payment, before shipment** (order `paid`; no
label bought, item not `shipped`). The buyer clicks **"Cancel order"**
in their order history and gets an **automatic full refund** — no maker
approval needed, since nothing has shipped:
- Stripe: full refund of the charge with `reverse_transfer: true` (pull
  the maker's share back) **and** `refund_application_fee: true` — a
  pre-ship cancel delivered no value, so the buyer is made whole and the
  maker isn't charged CodaCo's cut on a sale that never happened.
- Restock the inventory; set order `cancelled`, items `cancelled`.
- Email the maker ("Order cancelled — do not ship") and the buyer.
- **Gate:** once a label is bought or the item is marked `shipped`,
  self-cancel disappears and the buyer sees "Request a return" instead.

**3. Refund / return request after shipment** (item `shipped` or
`delivered`). The buyer submits a **return request with a reason**; the
maker reviews and approves/declines from `/dashboard/orders` (CodaCo
admin can step in as backstop). On approval, the **fee treatment depends
on the reason** (the chosen policy):
- *CodaCo/maker at fault* — defective, wrong item, never arrived: full
  refund with `reverse_transfer: true` **and**
  `refund_application_fee: true`. Buyer made whole; CodaCo returns its
  fee so the maker isn't penalized twice.
- *Buyer's choice* — changed mind, no longer needed: refund the item
  price with `reverse_transfer: true` but `refund_application_fee:
  false` — **CodaCo keeps its fee**, the maker bears it as the cost of
  accepting a return (optionally minus return shipping).
- Restock only if the item comes back in sellable condition; set item
  `returned`, order `refunded` (or `partially refunded` for multi-item
  orders).

**Mechanics to get right:**

- **Reconcile via webhook, not the sync response.** Add `charge.refunded`
  / `refund.updated` handling to `app/api/stripe/webhook/route.ts`; flip
  order → `refunded` and item → `returned`/`cancelled` there, same
  discipline as payment. The button only *requests* the refund.
- **Partial & multi-item refunds.** A cart can span makers and items;
  refund per `order_item` (its own charge portion + transfer reversal),
  not per whole order. Order status becomes `refunded` only when every
  item is refunded.
- **Void an unused label.** If a label was bought but the package never
  shipped, request an EasyPost label refund (unused labels are
  refundable) so postage isn't lost.
- **Non-returnable items.** Personalized/made-to-order goods are excluded
  from buyer's-choice returns (the PDP already says "Returns within 14
  days for non-personalized items") — enforce at request time, still
  allow fault-based refunds.

**Schema:**
- Add a small **`refunds`** table (`id`, `orderItemId`, `amountCents`,
  `currency`, `reason` enum, `faultParty` enum, `stripeRefundId`,
  `status` enum, `createdAt`) rather than scalar columns — a single item
  can be partially refunded more than once, and we want an auditable
  trail. Feed `order_item_events` too.
- Reuse the existing `orders.status` (`cancelled`, `refunded`) and
  `order_items.fulfillment_status` (`cancelled`, `returned`) enum members
  — they were defined for exactly this.

**Deferred:** who pays **return shipping** (buyer vs maker, by reason) —
follows the same fault logic; wire it once the EasyPost label flow (PR 5)
exists so CodaCo can generate the return label. Dispute/chargeback
handling (`charge.dispute.created`) is its own follow-up.

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
