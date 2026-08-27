# Software Engineer — CodaCo

**Part-time / freelance · Remote · ~10 hrs/week**

> Bracketed items are placeholders to fill in before posting.

---

## About CodaCo

CodaCo is a curated marketplace for death and dying. Burial shrouds, end-of-life
doulas, estate attorneys, home funeral guides, memorial makers, planning
workbooks — the people and things that help when someone is dying or has died,
gathered in one place and actually vetted.

It's a small business, close to launch, with a real working product: vendor
onboarding and review, subscriptions, gift cards, a shop, a service directory,
an admin back office. Live Stripe money moves through it.

## The role

This is an unusual setup, so we'll be direct about it.

Most of CodaCo's code is written by Claude, working with the founder. That has
gone well — the site is around 30,000 lines of TypeScript built over a couple of
months, with a documented design system, a phased data-model plan, and an honest
backlog. We don't need someone to take that over.

What we need is the part that arrangement is bad at: someone who reads the code
adversarially, tests the paths where money and personal data move, watches
production, closes security work, and says "not yet" when something shouldn't
ship.

Think of it as a technical owner and reviewer more than a feature builder. You'll
write code — but your most valuable hours will be the ones spent making sure the
rest of the code is right.

## What you'd own

**Review.** Every change that touches payments, authentication, or customer data
gets read by you before it ships. Your job is to find what the author — human or
otherwise — missed.

**Tests.** There aren't any yet. Building a real suite around the money and auth
paths (gift-card balances, subscription state, role gates, webhook idempotency)
is the first significant piece of work, and probably the most valuable thing
you'll do all year.

**Production.** Error tracking, alerting, and the habit of noticing. Right now,
if the Stripe webhook started failing, no one would find out until a vendor
complained.

**Security.** We keep an honest backlog — CSP enforcement, header trust,
rate-limiting at the edge, gift-card chargeback handling. You'd close it, and
keep it closed as the surface grows.

**Upgrades.** Next.js, React, Prisma, and a beta release of Auth.js running in
production. Someone needs to own the upgrade path and respond when an advisory
lands.

**Launch and after.** The go-live checklist, the first real vendors, trial-to-paid
conversion, and the auto-renewal disclosure and cancellation requirements that
come with selling subscriptions.

## The stack

Next.js 16 (App Router, React Server Components), React 19, TypeScript,
Tailwind v4, Postgres via Prisma 7, Auth.js v5, Stripe, Resend, Upstash Redis,
deployed on Vercel with Neon.

## What we're looking for

- **Several years of production TypeScript and React.** You've shipped something
  real, maintained it afterward, and been responsible when it broke.
- **Postgres and migrations.** You've run a data migration that wasn't allowed to
  lose rows.
- **Hands-on Stripe.** Subscriptions, webhooks, refunds, disputes. You know why
  idempotency matters and what happens when it's missing.
- **Working security judgment.** Not a certification — the practical kind. You can
  look at an auth flow or a payment handler and see where it bends.
- **Fluency with AI-written code, and healthy skepticism about it.** This is the
  real filter. You should be comfortable directing an AI agent as a primary code
  producer, and equally comfortable assuming its output is wrong until you've
  checked. Engineers who refuse to work this way and engineers who trust it
  blindly both struggle here.
- **Clear writing.** Most of the collaboration is asynchronous and in prose.

## What this isn't

- Not full-time, and not a path to full-time right now.
- Not greenfield. You're inheriting a codebase with strong, documented
  conventions, and you'd work within them — or make the case for changing them.
- Not a design role. The visual system is settled and enforced in CI.
- Not a place to rewrite working things because you'd have built them
  differently.

## Working together

- Remote and asynchronous, flexible hours. [Time-zone overlap, if any]
- Roughly 15–20 hrs/week for the first two months, settling to 8–12.
- Freelance contract. [Rate / structure]
- One pull request per change, reviewed and squash-merged. Conventions live in
  the repo and stay current.

## About the subject matter

CodaCo is about death. You'd be reading copy about dying, grief, and funerals
most days you work here. For most people that turns out to be fine, and for some
it's the reason to take the job — but it's worth knowing going in.

## To apply

Send [contact] a short note with:

1. Something you've built and maintained that handled money or sensitive data.
2. How you use AI tools in your own work today — what you let them do, and what
   you don't.
3. Anything you've written that we can read.

No cover letter needed.

If it looks like a fit, we'll follow up with a short **paid** exercise: we'll walk
you through a real open item from our backlog — a gift-card refund path that can
leave a funded balance behind after the buyer disputes the charge — and talk
through how you'd close it. We're more interested in how you think about
sequencing and risk than in how fast you'd write the patch.
