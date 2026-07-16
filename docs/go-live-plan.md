# Going live with real vendors

How CodaCo transitions from a mock-populated demo to a live marketplace with
real, paying vendors — without the site ever looking empty and without a
vendor's free trial starting before we're actually open.

Read `docs/data-model-evolution.md` for the phase history (A–F) and
`docs/admin-runbook.md` for day-to-day operational tasks. This doc is the
plan for the launch itself.

## The goal

We want to let real vendors sign up **now**: create their account, build
out their profile, add draft services/products, and connect Stripe so they
can get paid. But three things must stay decoupled from signup:

1. Their listing must **not appear publicly** until we flip the site live.
2. Their **3-month free trial must not start** until launch.
3. In the meantime, **mock vendors keep populating** `/shop` and `/services`
   so the site looks full while we gather a real roster.

At launch, one operation flips every real vendor live, starts their trials,
and removes the mock data.

## Decisions locked in

Two questions that shaped this plan, already answered:

- **Stripe = Connect at signup.** "Connecting to Stripe" means each vendor
  onboards a **Stripe Connect** account so they can *receive* money from
  clients/buyers through CodaCo. (The Stripe code that exists today only
  handles vendors *paying* CodaCo — see below.) This is a net-new
  workstream.
- **Soft trial.** The 3-month membership trial tracks its own
  start/end dates and emails vendors before expiry. **No card is collected
  up front**; vendors subscribe (Monthly/Annual) before the trial ends
  using the Checkout flow that already exists.

## Where things stand today (the constraints this plan works around)

Three facts about the current code make the "sign up now, go live later"
split non-trivial. Each is a thing we build on or work around.

### 1. Vendor visibility has no gate

`getVendors()` / `getVendor()` (`lib/api/vendors.ts:100-168`), `getServices()`
/ `getService()` (`lib/api/services.ts:40-67`), and `getProducts()` /
`getProduct()` (`lib/api/products.ts:116-165`) return **every**
`vendor_profile` / its published rows. There is no `published` / `active` /
`visible` column on `VendorProfile`. Product and service queries filter on
the *product/service* `status` (`draft` vs `published`), but nothing filters
on the *vendor's* state.

Consequently, real and mock vendors are identical at the query layer. The
only thing distinguishing a mock vendor is its `@codaco.local` email. The
moment a real vendor is approved today, they are live on `/services`. There
is no switch to hold them back — **we have to add one** (Phase 1).

### 2. The "3-month free trial" is a label, not a mechanism

The services Starter plan is `billingType: "free"` with
`trial: "Free for 3 months"` (`lib/data/plans.ts:53-68`) — a display string
rendered verbatim by `planPriceLabel`. On approval, the code just writes an
`active` subscription row (`lib/api/applications.ts:163-175`). Nothing stores
a trial start or end, and nothing converts a trial to paid. No Checkout call
sets `trial_period_days`.

This is convenient: because the clock doesn't exist yet, **we get to decide
when it starts** — which is exactly what launch needs (Phase 2).

### 3. Stripe Billing is built; Stripe Connect is not

Already implemented and merged (`lib/stripe.ts`, `lib/billing/*`,
`app/api/stripe/webhook/route.ts`, `app/dashboard/billing/actions.ts`):

- Per-vendor Stripe **Customer** creation (`vendor_profile.stripeCustomerId`).
- Recurring **subscription** Checkout for services (Monthly/Annual).
- One-time **set-up fee** Checkout for the goods Storefront plan.
- A signed webhook that reconciles subscription + payment state.

All of this is about vendors **paying CodaCo**. There is **no Stripe
Connect** anywhere — no way for a vendor to connect an account to
**receive** money from clients. Connect is only referenced as future work
(`docs/data-model-evolution.md:113,530`; `docs/gift-cards-and-client-billing-plan.md`
PR 4, "automated payouts needs Stripe Connect"). Building it is Phase 3.

## The core model: separate three concerns

Today, approval welds these together. The plan pulls them apart:

| Concern | Should be available… | Mechanism |
|---|---|---|
| **Vendor account** — dashboard, edit profile, add draft services/products, connect Stripe | at signup | already exists (approval creates the profile) |
| **Publicly listed** on `/shop` + `/services` | held until launch | new `publishState` gate (Phase 1) |
| **Trial clock running** | starts at launch | new `trialStartedAt`/`trialEndsAt` (Phase 2) |

A real vendor is approved into a **`pre_launch`** state: fully functional
dashboard, invisible to the public, trial not started. Mock vendors stay
`live`. Launch flips `pre_launch → live`, stamps trial dates, and removes
mock data.

## The plan, in phases

### Phase 0 — Stop auto-exposing real vendors

`DEMO_AUTO_APPROVE_VENDORS=1` currently auto-approves every application at
submission time (`app/list-with-us/actions.ts:227-230`;
`docs/admin-runbook.md` "Auto-approve is on in production"). With the
`pre_launch` gate in place (Phase 1) auto-approve is *safe* — approved
vendors still won't be publicly visible — but we likely want the manual
review queue back for real applicants regardless.

- **Change:** unset `DEMO_AUTO_APPROVE_VENDORS` in Vercel (Production).
- **Effort:** one env var. The `/admin/applications` queue already works in
  both modes.

### Phase 1 — Vendor lifecycle state (the visibility gate)

The load-bearing change. Small, but everything else depends on it.

- **Schema:** add to `VendorProfile`:
  - `publishState VendorPublishState @default(pre_launch)` — new enum
    `{ unknown, pre_launch, live, suspended }` (an `unknown` default member
    per the repo's enum convention, but the column default is `pre_launch`).
  - `listedAt DateTime?` — stamped when the vendor first goes `live`.
- **Public queries** filter to `publishState: "live"`:
  - `getVendors` / `getVendor` (`lib/api/vendors.ts`) — add
    `where.publishState = "live"`.
  - `getServices` / `getService` (`lib/api/services.ts`) — add
    `where.vendor = { publishState: "live" }` (nested, since these join
    `vendor`).
  - `getProducts` / `getProduct` and the featured/related variants
    (`lib/api/products.ts`) — same nested `vendor` filter, so a
    `pre_launch` vendor's *published* products don't leak onto `/shop`.
  - Leave `getFeaturedVendors` / `getHomeFeaturedVendors` alone except to
    add the same `live` filter.
- **Not gated:** dashboard and admin queries. A `pre_launch` vendor sees
  their own profile, products, and services normally (via
  `requireVendor()` / owner-scoped queries) — they just don't appear on
  public listings or their public `/services/{slug}` page. (Decide whether
  the public profile page 404s or shows a "coming soon" state for
  `pre_launch` — recommend 404 to keep it simple.)
- **Mock data:** seed mock vendors with `publishState: "live"` in
  `prisma/mock.ts` so they keep populating the pages.
- **Migration:** existing rows (all currently mock) backfill to `live`;
  new applications default to `pre_launch`.

### Phase 2 — Decouple the trial and build the (soft) clock

- **Schema:** add to `Subscription` (services rows):
  - `trialStartedAt DateTime?` and `trialEndsAt DateTime?` — both null until
    launch.
- **Approval** (`lib/api/applications.ts`) no longer implies a running
  trial. It creates the `pre_launch` vendor + a services subscription in a
  pending state (keep `incomplete`, or leave `status` unset until launch —
  the dashboard already treats only `active`/`trialing` as active, so
  `pre_launch` vendors read as "not yet started").
- **At launch**, for each services vendor: set
  `trialStartedAt = <launch date>`, `trialEndsAt = trialStartedAt + 3
  months`, `status = trialing`. The dashboard billing page already treats
  `trialing` as active (`app/dashboard/billing/page.tsx`) and can show
  "N days left" from `trialEndsAt`.
- **No card, no Stripe object during the trial.** Conversion is the vendor
  running the existing Monthly/Annual Checkout before `trialEndsAt`.
- **Goods vendors** have no trial (one-time set-up fee model) — unaffected.

### Phase 3 — Stripe Connect at signup (the big new workstream)

Net-new; independent of the launch mechanics above. Lets vendors *receive*
client money through CodaCo. This is the payout side of the existing
`docs/gift-cards-and-client-billing-plan.md` ("Direct client payments
through CodaCo" / PR 4) — the two should be designed together.

- **Schema:** add to `VendorProfile` (mirroring `stripeCustomerId`):
  - `stripeConnectAccountId String? @unique`
  - onboarding status fields, e.g. `connectChargesEnabled Boolean`,
    `connectPayoutsEnabled Boolean`, `connectDetailsSubmitted Boolean`
    (or a single status enum projected from Stripe).
- **`lib/billing/connect.ts`:** create a connected account, generate Stripe
  **Account Links** for hosted onboarding, read
  `charges_enabled`/`payouts_enabled`/`details_submitted`.
- **Webhook:** extend `app/api/stripe/webhook/route.ts` to handle
  `account.updated` and persist the onboarding status.
- **Dashboard "Payments" tab:** "Connect your Stripe account" → redirect to
  Stripe-hosted onboarding → return with a live status badge (pending /
  restricted / enabled). A `pre_launch` vendor completes this from their
  dashboard before launch.
- **Account type:** recommend **Express** (CodaCo-branded, Stripe hosts
  onboarding + the payout dashboard — the standard marketplace choice) over
  Standard.

Two design decisions to settle before/while building Phase 3:

- **Onboarding is optional-but-prompted at signup, not a hard gate.**
  Capture the full vendor roster even if some don't finish Stripe onboarding
  on day one; they complete it from the `pre_launch` dashboard before
  launch. Hard-gating signup on completed Connect onboarding will cost
  sign-ups.
- **The client→vendor payment flow is its own design pass.** How a client's
  payment reaches the connected account (destination charges vs. separate
  transfers, and CodaCo's platform fee) rides on the client-billing doc.
  Connect *onboarding* can ship well before the full charge/transfer flow is
  wired — vendors don't need to receive money until real clients are
  transacting (at/after launch), not while `pre_launch`.

### Phase 4 — The launch switch

Two scripts, both dry-run by default with an explicit `--confirm` to
execute.

- **`scripts/go-live.mjs`:** in one transaction, for every `pre_launch`
  vendor: set `publishState = "live"`, `listedAt = now`, and (services)
  stamp `trialStartedAt` / `trialEndsAt` + `status = trialing`. Idempotent —
  re-running only touches rows still `pre_launch`.
- **`scripts/remove-mock-data.mjs`** (the TODO in `TASKS.md` /
  `docs/admin-runbook.md:256-277`): delete `@codaco.local` users; cascade
  deletes remove the whole mock tree (profiles, products, services, reviews,
  subscriptions). Dry-run prints "would delete N users"; `--confirm`
  executes.
- **Sparse-catalog option:** if removing all mock listings would leave the
  site looking thin on day one, either keep a handful of mock vendors
  (leave those `@codaco.local` rows in place) or stage the launch so enough
  real vendors are `live` first.

### Phase 5 — Trial-end handling (after launch)

Only bites 3 months after launch, so it can follow.

- A daily job (or on-load check) that flips `trialing → past_due` when
  `trialEndsAt` has passed without a paid subscription, and emails vendors a
  reminder before expiry.
- Gate public visibility on trial state if desired (e.g. `past_due` vendors
  drop off listings until they subscribe) — a product decision for later.

## Sequencing / critical path

```
Phase 0 ─┐
Phase 1 ─┼─► Phase 4 (launch) ─► Phase 5
Phase 2 ─┘
Phase 3 (Connect) ──────────────► (must be done by launch)
```

- **Phases 0 → 1 → 2 → 4** are a tight, low-risk path that delivers
  "collect real vendors, hold them back, launch, swap mock for real, start
  trials." None of it depends on Connect.
- **Phase 3 (Connect)** is the largest chunk and fully independent — build
  it in parallel. It only has to be *done by launch*, since vendors don't
  need to receive money until real clients transact.
- Suggested build order: Phase 1 first (unblocks everything and is safe to
  ship immediately — with all-mock data, everything is `live` and nothing
  changes visibly), then Phase 2, then Phase 3 in parallel, with Phase 0 +
  Phase 4 saved for the launch itself.

## Launch-day runbook (once the phases are built)

1. Confirm enough real vendors are approved and sitting in `pre_launch`
   (`/admin` → Vendors, or a `publishState` filter).
2. Confirm Phase 3 Connect onboarding is complete for the vendors who need
   to get paid at launch.
3. Ensure `DEMO_AUTO_APPROVE_VENDORS` is unset (Phase 0).
4. Run `scripts/go-live.mjs` (dry-run, review the count) → `--confirm`.
5. Spot-check `/services` and `/shop` — real vendors now appear; trials show
   "3 months left" on their dashboards.
6. Run `scripts/remove-mock-data.mjs` (dry-run → `--confirm`) to clear mock
   data (or keep a chosen few for catalog density).
7. Spot-check that no `@codaco.local` listings remain (unless intentionally
   kept).

## Schema-change summary

| Model | Field | Purpose | Phase |
|---|---|---|---|
| `VendorProfile` | `publishState` (enum) | public visibility gate | 1 |
| `VendorProfile` | `listedAt` | when it went live | 1 |
| `Subscription` | `trialStartedAt` | soft-trial start | 2 |
| `Subscription` | `trialEndsAt` | soft-trial end (+3mo) | 2 |
| `VendorProfile` | `stripeConnectAccountId` | Connect account | 3 |
| `VendorProfile` | `connect*Enabled` / status | onboarding state | 3 |

Migrations follow the repo workflow in `AGENTS.md` ("Local DB for migration
generation" / `npx prisma migrate dev`).

## Related docs

- `docs/data-model-evolution.md` — phase history and the deferred
  `payout_account_id` / Connect notes.
- `docs/gift-cards-and-client-billing-plan.md` — the client-payments money
  model that Phase 3's Connect payouts enable.
- `docs/admin-runbook.md` — mock-data identification, the
  `remove-mock-data.mjs` shape, and env-flag reference.
- `TASKS.md` — tracks `scripts/remove-mock-data.mjs` and the
  `DEMO_AUTO_APPROVE_VENDORS` flip as open items.
