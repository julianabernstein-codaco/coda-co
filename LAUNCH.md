# Launch checklist

How to take CodaCo from pre-launch (live Stripe keys, vendor billing locked)
to fully live. Do the steps in order. Most of this is dashboard config, not
code — the code gate (`lib/launch.ts` + `/admin/launch`) already exists.

## How the pre-launch gate works

- Vendor **paid** flows — service subscriptions and the goods **$29 Storefront
  set-up fee** — are locked until launch. They render **visible-but-disabled**
  ("Available at launch"); the block is also enforced server-side in the
  checkout actions, so a stray button can't create a charge.
- **Admins bypass the gate** (`role === "admin"`) so the team can validate live
  billing before launch.
- **Gift cards are always on sale** — not gated.
- The switch is `PlatformConfig.launchedAt` (one row), edited from
  **`/admin/launch`**. `null`/future = pre-launch; a past timestamp = live.
- `launchedAt` also starts every vendor's **90-day free trial** (`TRIAL_DAYS`
  in `lib/launch.ts`) — the clock runs from launch for everyone.

## Environment variables (Vercel → Settings → Environment Variables)

Only two Stripe vars are read by the app:

| Var | Pre-launch (test) | Launch (live) |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_…` | `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | test endpoint's `whsec_…` | **live** endpoint's `whsec_…` |

Notes:
- No publishable key and **no price-id vars** — prices are code-defined
  (`lib/data/plans.ts`, inline `price_data`).
- Keep **test** keys on the **Preview** scope so preview deploys stay in test
  mode while Production runs live.
- `PREVIEW_PASSWORD` (unrelated to Stripe) is the shared-password site gate —
  set = private, unset = public.

## Pre-launch (do this now, to test live safely)

1. Confirm the Stripe account is activated (business details + bank connected).
2. Set **live** `STRIPE_SECRET_KEY` on Vercel **Production** only if you want to
   test live now; otherwise stay on test keys. Either way, vendors can't be
   charged (gate is on) — but **gift-card purchases are real** once on live keys.
3. As an **admin**, run a real subscription / goods fee / gift-card charge to
   validate the live webhook + payout, then refund from Stripe.

## Launch day

1. **Clean test data.** Remove mock/test vendors from the production DB so real
   vendors aren't mixed with demo rows. (Ask Claude for the cleanup if needed.)
2. **Null out stale test-mode Stripe refs** on any *real* vendor who attempted a
   test-mode checkout: clear `vendor_profile.stripe_customer_id` (and any
   `subscriptions.stripe_subscription_id`) so live mode creates fresh customers.
   Vendors who only signed up (never opened Checkout) have none — nothing to do.
3. **Live Stripe keys.** Set `STRIPE_SECRET_KEY` = `sk_live_…` on Production.
4. **Live webhook** (webhooks are per-mode — the test one won't fire live). In
   Stripe **Live mode** → Developers → Webhooks → Add endpoint:
   - URL: `https://<canonical-domain>/api/stripe/webhook` (the domain the site
     loads as without redirecting — no `www` vs apex mismatch).
   - Events: `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`,
     `invoice.paid`, `invoice.payment_failed`.
   - Copy its `whsec_…` → set `STRIPE_WEBHOOK_SECRET` on Production.
5. **Enable the live Customer Portal** (also per-mode): Stripe **Live mode** →
   Settings → Billing → Customer portal → activate/save. (Powers "Manage
   billing".)
6. **Redeploy** Production so the new env vars take effect.
7. **Flip the switch:** `/admin/launch` → **Launch now** (or Schedule a date).
   This opens vendor paid flows and starts every vendor's 90-day trial.
8. **(Optional) Go public:** unset `PREVIEW_PASSWORD` on Production + redeploy to
   drop the shared-password wall.

## Verify

- Stripe → Webhooks → your live endpoint shows **200** deliveries.
- A real subscription flips to active on `/dashboard/billing`; a real gift-card
  purchase issues and emails.
- Refund test charges from Stripe.

## Known follow-on (not built yet)

- **Trial → paid conversion enforcement.** The trial is labeled and its clock
  starts at launch, but nothing forces payment when the 90 days end (no
  paywall / dunning). Build this before the first trials expire.

## Rollback

`/admin/launch` → **Revert to pre-launch** re-locks vendor paid flows. To fully
return to test mode, swap the two Stripe env vars back to `sk_test_…` /
test `whsec_…` and redeploy.
