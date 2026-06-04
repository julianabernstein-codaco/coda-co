# CodaCo Payments — Plain-Language Overview

*A non-technical summary of how we'd add payments to the site, for team discussion.*

---

## The big picture

We want money to move in two directions on CodaCo:

- **Money coming IN from vendors** — they pay us to be on the platform
  (subscriptions, listing fees, lead fees). → **Workflow A**
- **Money coming IN from clients, then OUT to vendors** — clients buy
  goods and services; we pass the payment to the vendor and keep a small
  cut. → **Workflow B**

We'd use **Stripe** — the payment company behind a huge share of online
stores — to handle all of it. Stripe deals with the credit cards,
security, and bank deposits so we don't have to.

### The one big decision to make first

For **Workflow B**, we need to choose how the money flows:

- **Option 1 (recommended):** The client's payment goes *straight to the
  vendor*, and Stripe automatically takes our cut along the way. This is
  the standard setup for marketplaces. It also means the **vendor** — not
  CodaCo — is responsible for refunds and tax paperwork.
- **Option 2:** *We* collect all the money, then pay each vendor
  separately. More control, but CodaCo takes on the refunds, disputes,
  and tax burden.

This is a business and legal choice, not just a technical one, and it
shapes everything else — so it's worth settling before we build.

---

## Workflow A — Vendors paying us

**What it is:** Recurring or one-off charges that vendors pay *to CodaCo*
— monthly/annual plan fees, fees to post a listing, fees when we send
them a lead.

**The good news:** Our system is already shaped for this. When a vendor
is approved today, we already create a "subscription" record for them —
it's just **free and pretend right now**. We'd swap the pretend part for
a real charge.

**What happens, in plain terms:**

1. A vendor applies and picks a plan (Starter is free; Standard and Pro
   cost money).
2. When approved, instead of being waved through for free, they enter a
   card on a secure Stripe-hosted page — card numbers never touch our
   site.
3. Stripe charges them automatically every month or year, and tells our
   system "this vendor is paid up" (or "their card failed").
4. Vendors get a self-service billing page (built by Stripe) where they
   can change cards, upgrade, downgrade, cancel, and download receipts —
   we don't build any of that ourselves.

**Listing fees and lead fees** run on the same plumbing:

- *Listing fees* — charge each time a vendor posts a new listing.
- *Lead fees* — charge per lead we send them, added to their next bill.
  The one thing we'd need to define: **what exactly counts as a billable
  "lead"?** That's a business definition, not a tech problem.

**Why this is the easier of the two:** it doesn't depend on the store
being built, it builds on a part of the system that already exists, and
the risk is low.

---

## Workflow B — Clients paying for goods & services

**What it is:** A client buys an urn or books a doula. Their money needs
to reach the *vendor's* bank account, with CodaCo keeping its small
transaction fee (the 3–5% already written into our plans).

**The honest status:** This one is bigger, because **the store checkout
itself doesn't exist yet.** Clients can add things to a cart, but there's
no working "buy" button — that was always planned as a later phase. So
Workflow B is really two jobs: (1) build the checkout, then (2) plug
Stripe into it.

**What happens, in plain terms:**

1. **Vendors connect their bank** — a one-time setup (run by Stripe) so
   we have somewhere to send their money. A vendor can't sell until this
   is done.
2. **Client checks out** — they pay on a secure Stripe page. Stripe
   splits the money: most goes to the vendor, our cut comes to us.
3. **The order is recorded** only after Stripe confirms payment went
   through — so a dropped connection can't lose an order.
4. **Refunds and disputes** flow back through Stripe the same way.

**Two wrinkles worth flagging:**

- **Goods vs. services are different.** Goods have a fixed price, so "buy
  now" is straightforward. Services are often "request a quote" or
  hourly — you can't always click-to-pay a set amount. Services payments
  will likely need a "vendor sends the client a bill" approach, and are
  worth treating as a separate, later piece.
- **A cart with items from two different vendors** needs the money split
  between them. Solvable, but it's a design choice we should make on
  purpose.

---

## Suggested order of attack

1. **Settle the one big decision** — does client money flow straight to
   vendors, or do we collect and redistribute?
2. **Do Workflow A first** — lower risk, builds on what exists, gets real
   revenue flowing from vendors.
3. **Build the basic store checkout** — still no real payments, just the
   cart-and-buy flow working.
4. **Add Stripe to the store** — so clients can actually pay for goods.
5. **Tackle services payments and listing/lead fees last** — once the
   core is proven.

---

*Questions this doc is meant to start a conversation about:*

- *Which money-flow option do we want for client payments (straight to
  vendors, or collected by us)?*
- *What counts as a billable "lead"?*
- *Do we want to support paying for services online now, or start with
  goods only?*
