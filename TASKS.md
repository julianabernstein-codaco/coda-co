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

**Sales are currently held.** `PlatformConfig.giftCardsEnabled` ships `false`
and is flipped from `/admin/launch`. The reason is the ordering: PR 2 (spend
on goods) hasn't landed, so a card sold today is a balance nobody can
redeem — an obligation with nothing behind it, and no in-app way to unwind
it. The hold is enforced in the server actions (`purchaseGiftCard`,
`contributeToPool`), not by the buttons; redeem / claim / organizer-deliver
stay open, and admins bypass. **Open sales as part of PR 2**, together with
the refund-clawback work noted in the security section below — those two
land the same guarantee from opposite ends.

## Image storage (parallel workstream)

User-uploaded images for vendor headshots and product photos. Three-phase
plan using Vercel Blob; full scope in `docs/images-plan.md`. Phase 1
(vendor headshot) is the suggested starting point and not blocked by
Phase E.

## Vendor renewal & cancellation (compliance workstream)

Requirements for automatic-renewal subscriptions sold to Vendors. Nothing
here is built yet — this is the durable record of what the checkout and
account flows must satisfy before auto-renewing vendor plans can ship.
These center on renewal and cancellation for our vendor users; this first
entry covers **checkout disclosure and consent**.

### At checkout — disclosure and consent

| Requirement | What it means concretely |
|---|---|
| **Clear and conspicuous** | Renewal terms in the same font size and prominence as surrounding text, in visual proximity to the consent action — not behind a link, not in a footer, not in the Terms modal. |
| **Before payment** | Disclosed before the Vendor submits payment information, not on the confirmation page. |
| **Separate consent** | A dedicated, unchecked checkbox for automatic renewal, distinct from the checkbox accepting the Terms. Never pre-ticked. Never bundled. |
| **No undermining language** | Nothing elsewhere in the flow may contradict, obscure, or detract from the renewal disclosure. |
| **Consent record** | Log Vendor ID, timestamp, IP, the exact disclosure text shown, and the consent event. Retain **3 years / 1 year post-termination, whichever is longer**. Version the disclosure text so you can prove what a Vendor saw in 2026 rather than what the page says today. |

### Immediately after purchase

Send an acknowledgment email containing the renewal terms, cancellation
policy, and cancellation instructions, in a retainable form. Send it whether
or not the Vendor also sees a confirmation screen.

### Ongoing

- **Renewal reminder** before annual renewals, **15–45 days out**, with the
  amount and a cancel link.
- **Price change notice**, **7–30 days out**, with old price, new price,
  effective date, and a cancel link.
- **Free trial reminder**, **3–21 days before conversion**, if we ever offer
  trials longer than 31 days.

### Cancellation UI

- Cancel button reachable from the account dashboard in **no more clicks than
  it took to subscribe**.
- No phone-only, no mail-only, no "contact your account manager," no
  business-hours limitation.
- Retention offers are permitted, but the **cancel-now button must be
  prominent on the same page** and must complete cancellation **in one
  action**.
- Confirmation of cancellation sent by email.
- Do not require a reason, a survey, or a password reset to cancel.

### Records to keep

Consent logs, disclosure text versions, sent-notice logs (reminders, price
changes, acknowledgments), and cancellation request timestamps. In a dispute,
**the absence of a log is generally treated as absence of the notice.**

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
- **CSP is Report-Only, not enforced.** `lib/security-headers.ts` ships
  the policy as `Content-Security-Policy-Report-Only` so a missed source
  reports instead of breaking a page. Watch `event=csp.violation` in
  Vercel logs across a full traffic cycle, then flip the `CSP_ENFORCE`
  constant to `true`. Two known follow-ups at that point: `script-src`
  still carries `'unsafe-inline'` (a per-request nonce in `proxy.ts` is
  the strict alternative and is nearly free here — the app is already
  fully dynamic), and `/admin/email-preview` renders email HTML in a
  `srcDoc` iframe that inherits the page policy, so remote images inside
  previewed emails may report violations.
- **Add a Vercel Firewall rate-limit rule on `/api/auth/*` (edge backstop).**
  App-level rate limiting is now layered and live: an IP throttle at the auth
  HTTP boundary (`app/api/auth/[...nextauth]/route.ts`) returns a real `429`
  + `Retry-After`/`RateLimit-*` on every auth POST, a per-account limit in
  `authorize()` is the defense-in-depth layer, and `lib/rate-limit.ts` is
  Redis-backed via Upstash (env vars set in Vercel preview + production) with
  an in-memory fallback and a 1s timeout guard so a Redis blip can't hang
  auth. **Remaining (dashboard config, no code):** add a Vercel Firewall
  rate-limit rule on `/api/auth/*` — a per-IP wall at the *edge* that counts
  every request before it reaches the function, immune to handler-order and
  to app-layer IP-header spoofing (`clientIp()` trusts the leftmost
  `x-forwarded-for`, which the client controls). Use it *in addition to* the
  app-level per-account logic, not instead of. A CAPTCHA / Cloudflare
  Turnstile is the further step if credential-stuffing persists.
- **Verify Upstash is actually serving prod (not silently on the fallback).**
  After a login burst on production, confirm `rl:*` keys appear in the
  Upstash Data Browser and that `event=ratelimit.redis_unavailable` is *not*
  logging in Vercel. If it is, the limiter is degraded to per-instance
  in-memory and the effective ceiling is ~×(instance count).
- **Enable Stripe fraud controls in the Dashboard (card-testing defense).**
  Card handling is confirmed **PCI SAQ-A**: every charge path is hosted
  Stripe Checkout / Billing Portal reached by top-level redirect
  (`window.location.href = session.url`) — no `@stripe/stripe-js`/Elements,
  no card fields, no PAN ever touches our server. The gift-card purchase and
  pool-contribution flows (the only *unauthenticated* payment on-ramps) are
  now per-IP rate-limited (`gift-card:checkout:<ip>`, 10/hr, shared budget)
  so they can't be used as a card-testing funnel; the redeem side
  (`gift-card:code:<ip>`, 20/hr) caps code guessing the same way. All the
  gift-card throttles live in `app/gift-cards/limits.ts`. **Remaining (Stripe Dashboard, no
  code)** — verify/enable: (1) **Radar** is active (on by default; "Radar for
  Fraud Teams" adds custom rules); (2) Radar rule **"Block if CVC verification
  fails"**; (3) Radar rule **"Block if postal code verification fails"** (AVS
  / ZIP); (4) the built-in **card-testing** rule / rate-limiting, plus a
  "block if risk level = highest" rule. When Phase E wires real goods
  payments, keep them on hosted **Checkout** (not Elements with card fields)
  to stay in SAQ-A scope.
- **A refunded or charged-back gift card keeps its balance.** Nothing
  listens for `charge.refunded` / `charge.dispute.created`, so the classic
  laundering loop — buy a card, receive the code, then refund or dispute the
  charge — leaves a fully funded ledger behind. Not exploitable *today*
  because there is no spend path yet (Phase E), which is why it wasn't fixed
  alongside the rest of the gift-card hardening, but it must land **with**
  the spend path, not after it. Shape: handle both events in
  `app/api/stripe/webhook/route.ts`, write a *negative* `adjustment` ledger
  entry for the refunded amount, and set `status = void` when the clawback
  takes the balance to zero. Needs a new idempotency key — the unique
  `stripe_payment_intent_id` is already taken by the purchase entry, so add
  a nullable unique column (a Refund/Dispute id) in the same migration.
  Open product questions to settle first: what happens when the balance was
  already partly spent (allow a negative balance and chase it, or write off?),
  and whether a dispute should void the card immediately or only on loss.
- **`getOrigin()` trusts `x-forwarded-host`.** Duplicated in
  `app/gift-cards/actions.ts`, `app/gift-cards/manage/[token]/page.tsx`, and
  `app/dashboard/billing/actions.ts`; each builds Stripe `success_url` /
  `cancel_url` from a header the client controls. Low severity — an attacker
  can only spoof the Host on *their own* request, so they redirect
  themselves — but it does let anyone mint a genuine `checkout.stripe.com`
  session that lands on a site they chose, which is a decent phishing prop,
  and the gift-card success URL carries the organizer token. Fix once, in a
  shared `lib/site-url.ts`: accept the forwarded host only when it matches
  `NEXT_PUBLIC_SITE_URL` / `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL`,
  and fall back to the configured value otherwise (preview deploys keep
  working via `VERCEL_URL`).
- **A failed gift-card email silently swallows the notification.** In the
  webhook, the sends run after `recordGiftCardContribution`. If a send
  throws we return 500, Stripe retries, the credit is (correctly) idempotent
  and returns `{ recorded: false }` — so the retry skips the email entirely
  and it is never sent. Correctness, not security. Fix by making the sends
  non-fatal (log and continue) or by driving them off recorded state rather
  off the `wasFirst` flag of the winning call.

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
