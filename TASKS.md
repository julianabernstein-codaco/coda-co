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
- **Auth rate limiting is in-memory (per-instance).** `lib/rate-limit.ts`
  backs login (`authorize` in `auth.ts`) and signup with a process-local
  `Map`. On Vercel each serverless instance keeps its own counters and cold
  starts reset them, so it stops naive single-source scripting but a
  distributed/patient bot spread across instances slips through. Production
  hardening: back the limiter with **Upstash Redis** (or Vercel KV — same
  engine; `@upstash/ratelimit` gives sliding-window out of the box) so
  counters are shared and persistent. The call sites (`rateLimit(key, opts)`
  / `isRateLimited`) stay put — only the store swaps, but note the Redis
  client is async, so `rateLimit`/`isRateLimited`/`clientIp` become
  `Promise`-returning and every call site gains an `await`. Complementary,
  not a substitute: a WAF / Cloudflare Turnstile is the real answer to
  distributed attacks and IP-header spoofing (`clientIp()` trusts the
  leftmost `x-forwarded-for`, which the client controls).
- **Gift-card guest paths now have layered bot protection.**
  `purchaseGiftCard` / `contributeToPool` (`app/gift-cards/actions.ts`) run
  honeypot → per-IP rate limit → **Vercel BotID** (invisible, `lib/botid.ts` +
  `instrumentation-client.ts` + `withBotId` in `next.config.ts`). No account
  is required to buy — the account gate stays at redemption
  (`claimGiftCardAction`). Deploy step: enable **BotID** for the project in the
  Vercel dashboard (Basic tier is free; no env var needed). BotID fails open
  on infra errors and bypasses in dev/preview, so local flows are unaffected.
  Follow-ups: (a) consider BotID `checkLevel: 'deepAnalysis'` (paid) if card
  testing persists; (b) extend the same gates to the account checkout
  `placeOrder` (`app/checkout/actions.ts`); (c) tune Stripe Radar rules — the
  backstop on the payment itself; (d) void a gift card whose funding payment is
  later disputed (extend `reconcile`/webhook).

## Resolved (kept for posterity, can be deleted once stable)

- ~~No password reset recovery path~~ — landed. `/forgot-password` issues a
  one-hour, single-use token (SHA-256 hash stored in the previously-unused
  `verification_tokens` table; raw token only in the emailed link), and
  `/reset-password?token=…` consumes it and sets the new hash. The request
  endpoint always responds generically so it never reveals whether an email
  is registered. A "Forgot password?" link sits on the sign-in form. Email
  copy lives in `buildPasswordResetEmail` (previewable at
  `/admin/email-preview`).
- ~~No self-serve password *change* UI~~ — landed. `/account` (reachable by
  any signed-in user, via the nav user menu) has a change-password form:
  verifies the current password, sets the new hash, and voids any pending
  reset links. Gated to accounts that actually have a password.
- ~~Password change/reset didn't revoke existing sessions~~ — landed.
  `users.passwordChangedAt` is stamped into the JWT at sign-in; the `jwt`
  callback in `auth.ts` returns `null` (a real logout) for any token minted
  before the current value. A reset or change bumps the column, so stale
  sessions drop on their next request; the change flow re-issues the current
  device so only *other* sessions are logged out.
- ~~Server Actions for vendor forms~~ — landed in Phase D. Both
  `GoodsForm` and `ServicesForm` POST to `app/list-with-us/actions.ts`.
- ~~Suspense boundaries around filter components~~ — landed.
  `app/shop/page.tsx` and `app/services/page.tsx` both wrap their filter
  components in `<Suspense>`.
