# What a part-time engineer adds that the current setup can't

Internal. Written to answer one question: *what will a hired engineer do
better and more consistently than the founder can, working with Claude?*

The short version: **you are not hiring a builder. You are hiring an owner
and a brake.** The current loop is unusually good at producing code and
unusually weak at everything that isn't producing code. Evaluate the hire
against the second column, not the first.

---

## 1. Where CodaCo actually is today

| | |
|---|---|
| Code | ~30,000 lines of TypeScript, 231 files |
| Surface | 56 pages, 4 API routes, a full admin back office |
| Data | Postgres, 24 models / 19 enums, 29 migrations |
| Money | Live Stripe — vendor subscriptions, $29 storefront fee, gift cards |
| Infra | Vercel + Neon, Resend email, Vercel Blob, Upstash Redis |
| Auth | Auth.js v5 **beta**, credentials, password reset, session invalidation |
| CI | Drift check + `next build` |
| Tests | **None** |
| Monitoring | **None** |
| History | ~145 PRs in roughly two months |

That table is the whole argument. The top half is strong. The two bolded
rows are the gap.

---

## 2. What the current setup already does well

Don't pay someone to do these. This is where the existing loop is genuinely
hard to beat.

**Feature velocity.** A complete two-sided marketplace — vendor onboarding,
applications and approval, subscriptions, gift cards with a ledger, a shop,
a service directory with geographic search, an admin console — in about two
months. A part-time engineer working alone would not have come close.

**Convention consistency.** `AGENTS.md` plus `scripts/check-drift.mjs` is a
real system, not a wish. The codebase has less stylistic drift than most
30k-line projects with three engineers on them.

**Documentation.** `docs/data-model-evolution.md`, `TASKS.md`, `LAUNCH.md`,
`docs/admin-runbook.md` are better than most funded startups have. This is
the reason the whole arrangement works at all.

**Copy, UI fidelity, page building.** Settled and enforced.

So: **do not hire someone to write features.** That is the thing this setup
is best at, and a new engineer will be slower at it than you already are.

---

## 3. The seven gaps, ranked by what they cost you

### 1. Nobody reviews the code adversarially

Today code is written by Claude and approved by you. Two problems compound.
Claude is systematically biased toward believing its own output is correct,
and can't run the site to check. You can read the *intent* of a change, but
not audit 400 lines of Stripe webhook handling for a race condition — and
shouldn't have to.

Every serious software team has an independent reader for exactly this
reason. CodaCo has zero. The gift-card refund hole documented in `TASKS.md`
— buy a card, take the code, dispute the charge, keep the balance — is one
we happened to find. The open question is how many we haven't.

*What changes:* every change touching money, auth, or personal data gets read
by a person whose job is to break it.

### 2. There is not a single automated test

Not one test file in the repository. CI runs the drift check and
`next build`, which proves the code *compiles* — not that it *works*.

Nothing verifies that a gift-card balance can't go negative, that one vendor
can't read another vendor's orders, that the rate limiter actually limits,
that role gates gate, that the Stripe webhook is idempotent under retry.

This is invisible, boring, compounding work — precisely the category that
never feels urgent, so never gets requested, so never gets built. Someone who
will be answering for the site when it breaks builds it anyway.

*What changes:* roughly 30–40 tests across the money and auth paths, running
in CI. Call it two weeks of part-time work. It permanently changes the risk
profile of every future change **including Claude's** — an agent with a test
suite to run against is a meaningfully more reliable agent than one without.

### 3. Nobody is watching production

No error tracking, no alerting, no uptime monitoring, no habit of reading
logs. Three failure modes that are already documented in `TASKS.md` and are
currently undetectable:

- The Stripe webhook starts returning 500s → subscriptions silently never
  activate, and you find out from an angry vendor.
- Upstash goes unreachable → the rate limiter quietly degrades to
  per-instance in-memory and the effective ceiling multiplies by the
  instance count. `TASKS.md` flags this exact scenario and the check for it
  has never been run.
- A gift-card email throws → Stripe retries, the credit is correctly
  idempotent, and the email is *never sent*. The customer paid and received
  nothing.

Claude cannot notice any of this. It only exists when invoked. A person
notices on a Tuesday.

### 4. Security is a well-kept list, not a practice

`TASKS.md` documents, unclosed:

- CSP still ships `Report-Only`, with `'unsafe-inline'` in `script-src`
- `getOrigin()` trusts a client-controlled `x-forwarded-host` in three files
- No Vercel Firewall rate-limit rule on `/api/auth/*` (the edge backstop)
- Stripe Radar fraud rules unverified
- Email addresses are never verified — `email_verified_at` is dead schema
- `DEMO_AUTO_APPROVE_VENDORS=1` is live in production
- Gift-card refund/chargeback clawback missing, and must land **with** the
  Phase E spend path, not after it

The quality of that list is a credit to the current setup. But writing an
issue down and closing it are different jobs, and right now no one is on the
hook for the second one.

### 5. Beta dependencies in production, with no owner

`next-auth@5.0.0-beta.31` — a **beta** authentication library handling real
credentials. Alongside Next 16.2, React 19.2 with the React Compiler,
Prisma 7, Tailwind 4. Every one is recent enough that upgrades break things
and advisories land regularly.

Nobody owns the upgrade path or the response to a CVE. An urgent Auth.js
patch would be discovered whenever someone next happened to look.

### 6. Compliance work on a clock that has already started

Two items with real deadlines and real penalties:

**Auto-renewal requirements** (the disclosure/consent/cancellation rules in
`TASKS.md`): separate unchecked consent checkbox, versioned disclosure text,
consent logs retained three years, renewal reminders 15–45 days out,
cancellation in one action from the dashboard. None of it is built, and it
binds the moment a vendor plan auto-renews.

**Trial-to-paid conversion.** The 90-day trial clock starts for every vendor
at launch, and `LAUNCH.md` notes plainly that nothing enforces payment when
it ends. That's a deadline you set yourself, 90 days after go-live.

### 7. Continuity

Claude forgets everything between sessions that isn't written down. Your
documentation is the only reason this works — but "we tried that in June and
it broke" isn't in the docs, and no doc ever captures the whole model.

On launch day, when something is wrong and you need a judgment call in ten
minutes, documentation doesn't help. A person who has held the system in
their head for six months does.

---

## 4. What you should *not* hire for

- **Full time.** The build velocity doesn't call for it, and the work above
  doesn't fill 40 hours.
- **A designer or frontend specialist.** The visual system is settled and
  mechanically enforced.
- **Someone to take the codebase over from Claude.** That would slow you down
  and cost several times as much for less output.
- **A security specialist as such.** You need working security judgment
  attached to someone who is also shipping, not an auditor who visits.

---

## 5. Sizing and cost

| Period | Hours | Focus |
|---|---|---|
| First 60 days | 15–20 hrs/wk | Test harness on money + auth, wire up monitoring, close the security backlog, own the launch checklist |
| Steady state | 8–12 hrs/wk | Review every PR, dependency upgrades, incident response, whichever phase is in flight |
| Spikes | — | Launch week; the first trial-expiry wave 90 days later |

**Rate estimate.** Senior freelance full-stack TypeScript in the US runs
roughly **$85–$160/hr**; someone with real Stripe and security depth sits
around **$110–$150**. At 10 hrs/week that's about **$4.5k–$6.5k/month**
steady state, with the first two months nearer **$8k–$12k/month**.

Treat those as a starting band to sanity-check against a couple of actual
conversations, not a quote.

---

## 6. The one hiring filter that matters

They must be genuinely good at **reviewing and directing AI-written code** —
not merely willing to tolerate it.

Most engineers fall into one of two failure modes. Some are hostile to the
premise and will quietly start rewriting things by hand, which destroys the
velocity that makes this business viable at its current size. Others trust
the output uncritically, which means you've hired a second rubber stamp and
paid for it.

You need the rarer third kind: fluent enough to direct an agent effectively,
skeptical enough to assume its output is wrong until checked.

**How to test for it.** Skip the algorithm puzzle. Hand a candidate the
gift-card chargeback entry from `TASKS.md` — the refund/dispute loop that
leaves a funded balance behind — and ask what they'd do about it. A strong
answer notices that it isn't exploitable yet because there's no spend path,
that it therefore has to ship *with* Phase E rather than after, that the
existing unique `stripe_payment_intent_id` is already taken so idempotency
needs a new key, and that there's a product question underneath (partial
spend, and whether a dispute voids immediately or only on loss) that isn't
theirs to decide alone. That's the whole job in one question: read carefully,
sequence correctly, escalate the right call.

---

## 7. One-paragraph summary

The current setup produces good code quickly and has no mechanism for
catching when it's wrong, no way to know when production breaks, and no one
accountable for security, upgrades, or compliance deadlines that are already
running. A part-time engineer at 8–12 hours a week, focused on review,
testing, monitoring, and ownership — rather than on shipping features — closes
all of that, and makes the agent-assisted development that's already working
measurably safer at the same time.
