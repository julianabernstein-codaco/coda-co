# Open work

Tracks known gaps in the Next.js app. For the phased rebuild plan + status,
see `docs/data-model-evolution.md`. For day-to-day admin operations, see
`docs/admin-runbook.md`.

## Phase E (next major chunk)

Orders + checkout + vendor notifications. Not on the demo path, so not
blocking, but the natural next phase. Full scope lives in
`docs/data-model-evolution.md` under "Phase E"; the build-ordered
cart & checkout workflow is in `docs/phase-e-checkout-plan.md`.
High-level pieces:

- Cart drawer / cart icon in nav + working "Checkout" CTA (today the cart
  writes to localStorage but has no UI to view it).
- `orders` + `order_items` tables; server action that revalidates price,
  decrements stock, creates rows in a transaction.
- Stub "Mark as paid" button in dev; real Stripe Checkout is a Phase E
  follow-up.
- `/dashboard/orders` for vendors, scoped by `order_items.vendor_id`.
- Transactional email on new order (Resend or Postmark).
- "Mark shipped" action with tracking number; buyer email.

## Phase F

Verified-purchase-gated review submission. Adds `verified_purchase` +
`order_item_id` columns to `product_reviews`. Depends on Phase E.

## Gift cards & client billing (parallel workstream)

CodaCo-held gift card balance + vendor-bills-client-through-CodaCo ("Option
B" / "Direct client payments through CodaCo"). One shared money model: a
gift card is prepaid balance held as a liability; billing spends a balance
or a card and pays a vendor. Full scope in
`docs/gift-cards-and-client-billing-plan.md`. PRs 1–3 (gift card balance →
spend on goods → vendor invoicing with manual payout settlement) are
unblocked; PR 4 (automated payouts) needs Stripe Connect. PR 1 (balance core)
and PR 1.5 (group-gift pools — shareable contribution link + magic organizer
link, account-free) have landed.

## Image storage (parallel workstream)

User-uploaded images for vendor headshots and product photos. Three-phase
plan using Vercel Blob; full scope in `docs/images-plan.md`. Phase 1
(vendor headshot) is the suggested starting point and not blocked by
Phase E.

## Smaller gaps

- **No password *change* UI (self-serve, while signed in).** A signed-in
  user still can't rotate their password from a settings page. The
  forgotten-password *recovery* path now exists (see below); an
  authenticated change form is the remaining gap.
- **Email is unverified.** `email_verified_at` is in the schema but no
  flow sets it. If signup verification ships, this is the column to use.
- **Cart count in nav.** Requires `Nav` to read cart state on the client
  (or a cookie). Currently the cart total is invisible outside the PDP.
  Best landed alongside the Phase E cart drawer.
- **`generateStaticParams` for `/shop/[productId]`** to enable full
  static generation of product pages. Low priority — pages are fast
  already.
- **`scripts/remove-mock-data.mjs`** — a dry-run-default script to
  cascade-delete `@codaco.local` users when real vendors onboard. Pattern
  is in `docs/admin-runbook.md`; write the script when needed.
- **`DEMO_AUTO_APPROVE_VENDORS=1` is on in production.** Fine for the
  demo; flip off the moment there's a real applicant. The admin queue
  works either way.

## Resolved (kept for posterity, can be deleted once stable)

- ~~No password reset recovery path~~ — landed. `/forgot-password` issues a
  one-hour, single-use token (SHA-256 hash stored in the previously-unused
  `verification_tokens` table; raw token only in the emailed link), and
  `/reset-password?token=…` consumes it and sets the new hash. The request
  endpoint always responds generically so it never reveals whether an email
  is registered. A "Forgot password?" link sits on the sign-in form. Email
  copy lives in `buildPasswordResetEmail` (previewable at
  `/admin/email-preview`).
- ~~Server Actions for vendor forms~~ — landed in Phase D. Both
  `GoodsForm` and `ServicesForm` POST to `app/list-with-us/actions.ts`.
- ~~Suspense boundaries around filter components~~ — landed.
  `app/shop/page.tsx` and `app/services/page.tsx` both wrap their filter
  components in `<Suspense>`.
