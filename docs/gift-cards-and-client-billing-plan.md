# Gift cards & client billing plan

## Context

Two related capabilities, sharing one money model:

1. **Gift cards** — a customer buys a CodaCo gift card for a fixed amount.
   CodaCo holds that amount as a balance and the recipient spends it down on
   goods and services.
2. **Client billing through CodaCo ("Option B")** — a service vendor bills a
   client *through the platform* for an agreed amount, and the client pays —
   from a gift card balance, a regular card, or a split of both.

These aren't two features that happen to touch money — they're one. A gift
card is **prepaid balance held by CodaCo**; client billing is the thing that
**spends a balance (or a card) and pays a vendor**. The gift card is the
first funding source for billing, and billing is the first thing a gift card
can pay for on the services side.

This also isn't a net-new product idea. The services plans already advertise
a feature called **"Direct client payments through CodaCo"**
(`lib/data/plans.ts`) — copy with no implementation behind it. This plan is
what makes that line true.

### What already exists (and what we reuse)

The schema is past where `docs/data-model-evolution.md` describes. Relevant
infra already in place:

- **Stripe is wired up.** `lib/stripe.ts` exposes a lazy client (mirrors
  `lib/db.ts`) and `isStripeConfigured()`. `app/api/stripe/webhook/route.ts`
  exists. `VendorPayment` (one-time charges) and `Subscription`
  (recurring) show the established pattern: write a row `pending`, let the
  webhook fill in `stripe*Id` + `paidAt` and flip status. **We mirror this
  exactly.**
- **`VendorProfile.stripeCustomerId`** — one reusable Stripe Customer per
  vendor. Buyers don't have one yet; gift-card purchase introduces a buyer
  payment path.
- **Goods checkout exists.** `lib/api/orders.ts#createOrder` writes a
  `pending` order inside a `$transaction` (re-reads price, guards oversell);
  `markOrderPaid` is the dev stub the webhook supersedes. Gift-card
  redemption against goods slots into this transaction.
- **`VendorInquiry`** — client→vendor leads from the public profile contact
  form. The natural origin of a conversation that ends in an invoice.

What's **missing** and gates the vendor-payout half:

- **No Stripe Connect.** There's no connected-account id on `VendorProfile`,
  so CodaCo can't yet push money *out* to a service vendor automatically.
  This is the one true infra dependency, and we work around it (manual
  settlement) so billing can ship before Connect is built.

## Money & accounting model (read this first)

The single most important thing to get right. Money is integer **cents +
currency** throughout (matching every existing money column).

### A gift card is a liability, not revenue

When a customer buys a $100 gift card, CodaCo collects $100 cash **now** and
owes $100 of goods/services **later**. On the books that's a **liability**
(outstanding gift-card balance / deferred revenue) — *not* revenue. Revenue
is recognized only as the balance is spent.

### Balance is derived from a ledger, never stored

This project already learned the cost of denormalized aggregates (the
`reviewSummaries` 47-vs-3 bug; see `data-model-evolution.md`). We do **not**
store a `balanceCents` column that can drift. A gift card's balance is

```
balance = SUM(amount_cents) over its ledger entries
```

Entries are **signed**: positive *loads* value (the purchase, a refund back
to the card), negative *spends* it (a redemption). The ledger is
append-only — corrections are new entries, never edits.

### Where the money goes

| Event | Ledger | Cash | Vendor owed |
|---|---|---|---|
| Buy a $100 gift card | `+10000` purchase | **+$100 in** (Stripe) → held as liability | — |
| Spend $40 on goods | `−4000` redemption → order | no new cash; drawn from liability | goods vendor's share − 5% fee |
| Spend $60 on a service invoice | `−6000` redemption → invoice payment | no new cash | invoice net (gross − platform fee) |

**The cash-timing insight worth stating loudly:** a gift-card-funded payout
is paid out of cash CodaCo *already holds* from the gift-card sale. The
outstanding-balance liability and the cash available to settle payouts must
reconcile. Finance cares about this; the data model makes it auditable by
keeping the ledger and the payout records linked.

### Split tender

A $200 invoice paid with $120 of gift balance + $80 on a card is **two**
payment records: a `gift_card` payment for $120 (a negative ledger entry)
and a `card` payment for $80 (a fresh Stripe PaymentIntent — new cash in).
The invoice is `paid` once succeeded payments sum to the amount due. This
split-tender shape is exactly what "use a portion of the gift card" requires,
and it's identical whether the thing being paid is a goods order or a
service invoice.

### Platform fees

- **Goods** already advertise **5% per sale** (`transactionFee` in
  `lib/data/plans.ts`) — note this is currently *display copy only*, not yet
  enforced in `createOrder`. Payout math will be the place it's applied.
- **Services** advertise client payments with **no transaction fee shown**.
  **Decided: no fee to start** — service billing launches at 0%
  (`feeCents = 0` / `platformFeeBps = 0`), matching the current copy. A fee
  may be added later; because the rate is stored per-payout, turning one on
  is a config change, not a migration.

## Data model

New models follow every existing convention: `cuid()` PKs, snake_case
`@@map`, money as `Int` cents + `currency String @default("USD")`, enums with
an `unknown` member as the default, `created_at`/`updated_at` on mutable
rows, snapshots for anything that must survive later edits.

### Gift cards (the balance)

```prisma
enum GiftCardStatus {
  unknown
  pending   // purchased, awaiting Stripe confirmation — not yet spendable
  active    // funded; has (or had) a spendable balance
  depleted  // balance reached zero
  void      // cancelled/refunded in full before use
}

// The purchasable instrument. Balance is NOT a column here — it's SUM over
// the ledger. `code` is what the recipient enters to claim/spend.
model GiftCard {
  id                 String         @id @default(cuid())
  code               String         @unique
  initialAmountCents Int            @map("initial_amount_cents")
  currency           String         @default("USD")
  status             GiftCardStatus @default(unknown)

  // Purchaser may be a guest, so userId is nullable; the email is the
  // durable handle. Recipient fields drive delivery + the gift message.
  purchaserUserId String?   @map("purchaser_user_id")
  purchaserEmail  String    @map("purchaser_email")
  recipientEmail  String?   @map("recipient_email")
  recipientName   String?   @map("recipient_name")
  giftMessage     String?   @map("gift_message")
  deliverAt       DateTime? @map("deliver_at")  // scheduled delivery

  // How the purchase was funded. Mirrors VendorPayment: null until the
  // webhook confirms the PaymentIntent, which also flips status → active
  // and writes the +purchase ledger entry.
  stripePaymentIntentId String?   @unique @map("stripe_payment_intent_id")
  fundedAt              DateTime? @map("funded_at")

  // Optional: claimed into an account so the balance surfaces automatically
  // at checkout without re-entering the code. Null = redeem-by-code only.
  claimedByUserId String? @map("claimed_by_user_id")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  ledger GiftCardLedgerEntry[]

  @@index([claimedByUserId])
  @@map("gift_cards")
}

enum GiftCardEntryType {
  unknown
  purchase    // + : initial load
  redemption  // − : spent on an order or invoice
  refund      // + : value returned to the card
  adjustment  // ± : manual correction (admin)
}

// Append-only signed ledger. balance = SUM(amount_cents). Exactly one of
// orderId / invoicePaymentId is set on a redemption, linking the debit to
// what it paid for.
model GiftCardLedgerEntry {
  id          String            @id @default(cuid())
  giftCardId  String            @map("gift_card_id")
  type        GiftCardEntryType @default(unknown)
  amountCents Int               @map("amount_cents") // signed
  currency    String            @default("USD")

  orderId          String? @map("order_id")
  invoicePaymentId String? @map("invoice_payment_id")

  createdByUserId String? @map("created_by_user_id")
  note            String?
  createdAt       DateTime @default(now()) @map("created_at")

  giftCard GiftCard @relation(fields: [giftCardId], references: [id], onDelete: Cascade)

  @@index([giftCardId])
  @@map("gift_card_ledger_entries")
}
```

A user's total available balance ("wallet") is **derived**, not a table:
`SUM(amount_cents)` over ledger entries of gift cards where
`claimed_by_user_id = user`. If a dedicated wallet view is wanted later it's a
read-layer aggregation, not a new source of truth.

### Group gifting (pools) — shipped in PR 1.5

Several people can chip into **one** card before it's gifted. The ledger
already models this — each contribution is just another `+` entry — so the
work is sharing + lifecycle, not money. Decisions taken:

- **Separate contribution link, never the spend code.** Two tokens on
  `gift_cards`, distinct from the private `code`:
  - `contribute_token` — **public**, shareable
    (`/gift-cards/contribute/[token]`). Anyone with it adds funds as a guest →
    straight to Stripe. Never grants spend.
  - `organizer_token` — **secret** magic link
    (`/gift-cards/manage/[token]`), emailed to the creator. No account needed
    to create, watch, or send the gift. `pooled = contribute_token != null`.
- **Always-open top-ups.** The card is spendable as soon as it's funded, and
  contributions stay open indefinitely. Sending to the recipient sets
  `delivered_at` (a marker) but does **not** lock the card.
- **Account-free for everyone.** Contributors and the organizer all act via
  tokens; a signed-in buyer is still recorded as `purchaser_user_id` when
  present, but it's never required.
- **One unified credit path.** `recordGiftCardContribution` handles both the
  creating purchase and every later top-up. It credits exactly what Stripe
  collected (`session.amount_total`), and the per-entry unique
  `stripe_payment_intent_id` is the idempotency lock. "First contribution"
  (which funds the card and triggers the organizer's pool-ready email) is
  decided atomically by a conditional `updateMany(status: pending → active)`,
  so concurrent first-contributions can't both win.
- **Emails.** Organizer gets a *pool-ready* email (share + manage links) on
  first funding and a *new-contribution* nudge thereafter; the recipient gets
  the existing delivery email — now group-aware ("Sam, Jo and 2 others chipped
  in") — when the organizer sends it.

Schema delta (migration `add_gift_card_contributions`): `contribute_token`,
`organizer_token`, `delivered_at` on `gift_cards`; `stripe_payment_intent_id`
(unique), `contributor_name`, `contributor_email` on
`gift_card_ledger_entries` (the PaymentIntent reference **moved off** the card,
since a pool has many charges).

### Client billing (Option B)

```prisma
enum ServiceInvoiceStatus {
  unknown
  draft   // vendor is composing it
  sent    // delivered to the client, awaiting payment
  paid    // succeeded payments cover the amount
  void    // cancelled by vendor/admin
  refunded
}

// A vendor-initiated bill to a client, paid through CodaCo. The general
// "vendors bill clients through CodaCo" object; a gift card is just one way
// to pay it. Snapshots keep a paid invoice readable after later edits.
model ServiceInvoice {
  id        String @id @default(cuid())
  vendorId  String @map("vendor_id")
  serviceId String? @map("service_id") // optional link to the listing billed

  // The payer. clientUserId is null until they have/claim an account;
  // clientEmail is the durable handle the invoice is sent to.
  clientUserId String? @map("client_user_id")
  clientEmail  String  @map("client_email")
  clientName   String? @map("client_name")

  description String
  amountCents Int                  @map("amount_cents")
  currency    String               @default("USD")
  status      ServiceInvoiceStatus @default(unknown)

  vendorNameSnapshot   String  @map("vendor_name_snapshot")
  serviceTitleSnapshot String? @map("service_title_snapshot")

  inquiryId String? @map("inquiry_id") // the lead this grew out of, if any

  dueAt  DateTime? @map("due_at")
  sentAt DateTime? @map("sent_at")
  paidAt DateTime? @map("paid_at")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  vendor   VendorProfile    @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  payments InvoicePayment[]
  payout   VendorPayout?

  @@index([vendorId])
  @@index([clientUserId])
  @@index([status])
  @@map("service_invoices")
}

enum PaymentMethod {
  unknown
  gift_card
  card
}

enum InvoicePaymentStatus {
  unknown
  pending
  succeeded
  failed
  refunded
}

// One row per tender used to settle an invoice. Split tender = multiple
// rows. card → a Stripe PaymentIntent (fresh cash). gift_card → a negative
// GiftCardLedgerEntry (drawn from balance).
model InvoicePayment {
  id          String               @id @default(cuid())
  invoiceId   String               @map("invoice_id")
  method      PaymentMethod        @default(unknown)
  amountCents Int                  @map("amount_cents")
  currency    String               @default("USD")
  status      InvoicePaymentStatus @default(unknown)

  stripePaymentIntentId String? @unique @map("stripe_payment_intent_id")
  giftCardId            String? @map("gift_card_id") // which card, for gift_card method

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  invoice ServiceInvoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([invoiceId])
  @@map("invoice_payments")
}

enum VendorPayoutStatus {
  unknown
  pending  // owed, not yet settled
  paid
  failed
}

enum VendorPayoutMethod {
  unknown
  manual         // admin ACH/check until Connect lands
  stripe_connect
}

// What CodaCo owes a vendor for a paid invoice, net of the platform fee.
// 1:1 with the invoice for v1. Created `pending`; settled manually at first,
// then via a Stripe Connect transfer once Connect lands. Mirrors the
// VendorPayment "row first, Stripe ids later" pattern.
model VendorPayout {
  id         String             @id @default(cuid())
  vendorId   String             @map("vendor_id")
  invoiceId  String             @unique @map("invoice_id")
  grossCents Int                @map("gross_cents")
  feeCents   Int                @map("fee_cents")  // CodaCo platform fee (may be 0)
  netCents   Int                @map("net_cents")  // paid to the vendor
  currency   String             @default("USD")
  status     VendorPayoutStatus @default(unknown)
  method     VendorPayoutMethod @default(unknown)

  stripeTransferId String?   @unique @map("stripe_transfer_id")
  paidAt           DateTime? @map("paid_at")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  vendor  VendorProfile  @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  invoice ServiceInvoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([vendorId])
  @@index([status])
  @@map("vendor_payouts")
}
```

Plus, when Connect lands (PR 4), one nullable field on `VendorProfile`:

```prisma
  stripeConnectAccountId String? @unique @map("stripe_connect_account_id")
```

## Flows

### Buying a gift card

1. `/gift-cards` purchase form (amount, recipient email/name, optional
   message + send date, purchaser email).
2. Server action creates a `GiftCard` row `pending` and a Stripe
   PaymentIntent (reuse `lib/stripe.ts`).
3. Webhook (extend `app/api/stripe/webhook/route.ts`) confirms the
   PaymentIntent → flips the card to `active`, sets `fundedAt`, writes the
   `+purchase` ledger entry, and triggers delivery email
   (Resend/Postmark — the same transactional-email choice Phase E plans for).

### Claiming / checking a balance

- `/gift-cards/redeem` — enter a code to see the balance and (if signed in)
  claim it to the account (`claimedByUserId`), so it auto-applies at
  checkout. Guests can still spend by entering the code at pay time.

### Spending on goods

- Goods checkout shows available balance, lets the buyer apply all or part,
  and charges any remainder to a card. The `−redemption` ledger entry is
  written **inside** the existing `createOrder` `$transaction` (so a failed
  charge rolls back the debit), linked via `orderId`.

### Vendor bills a client (Option B)

1. Vendor opens `/dashboard/billing` → "Bill a client": amount, description,
   client email, optional link to one of their services and/or the
   originating `VendorInquiry`. Writes a `ServiceInvoice` (`sent`).
2. Client receives an email → hosted invoice page `/invoice/[id]`.
3. Client pays: apply gift balance (full/partial) and/or a card. Each tender
   is an `InvoicePayment`; gift portions write negative ledger entries, card
   portions create PaymentIntents. Invoice flips to `paid` when succeeded
   payments cover `amountCents`.
4. On `paid`, create a `VendorPayout` (`pending`): `gross = amount`,
   `fee = gross × platformFeeBps`, `net = gross − fee`.
5. Settlement: **manual** at first (admin marks `paid`, `method = manual`);
   **automated** via Stripe Connect transfer once PR 4 lands.

## Phasing (one PR per logical change, per AGENTS.md)

A self-contained workstream; not tied to the A–F letters (the schema has
already moved past that doc). Each PR is independently landable and hidden
behind route-gating/flags until ready, per the project's migration workflow.

- **PR 1 — Gift card balance core.** `GiftCard` + `GiftCardLedgerEntry` +
  enums; migration. `lib/api/giftCards.ts` (`createGiftCardPurchase`,
  `getGiftCardBalance`, `claimGiftCard`). `/gift-cards` purchase +
  `/gift-cards/redeem`. Webhook activates the card. Delivery email. **No
  spending yet.**
- **PR 1.5 — Group gifting (pools).** ✅ Shipped. Contribution + organizer
  tokens, the `/gift-cards/contribute/[token]` and `/gift-cards/manage/[token]`
  pages, the unified `recordGiftCardContribution` credit path, and the
  organizer pool-ready / new-contribution emails. See "Group gifting" above.
- **PR 2 — Spend balance on goods.** Apply gift balance in goods checkout;
  split tender with a card; write the redemption entry inside `createOrder`.
  Refund-to-balance path.
- **PR 3 — Client billing (Option B), gift-card-funded.** `ServiceInvoice` +
  `InvoicePayment` + `VendorPayout` + enums; migration.
  `/dashboard/billing` (vendor) + `/invoice/[id]` (client, split tender).
  Payouts created `pending`, **settled manually**. Make the
  "Direct client payments through CodaCo" plan copy real.
- **PR 4 — Automated payouts via Stripe Connect.** Add
  `stripeConnectAccountId`; vendor onboarding from the dashboard;
  `VendorPayout` settles via Stripe Transfer; apply `platformFeeBps`.
- **PR 5 (optional) — Wallet UX + statements.** "Your CodaCo balance" page
  aggregating a user's claimed cards + ledger history.

PRs 1–3 are unblocked today. PR 4 is the only one that needs new infra
(Connect). Shipping PR 3 with manual settlement means Option B is usable
before Connect exists — exactly how `VendorPayment` shipped ahead of its
Stripe integration.

## Decisions

1. **Platform fee on service billing — DECIDED: no fee to start (0%).**
   Service billing launches at `platformFeeBps = 0`, matching the current
   "no fee shown" copy. A fee may be added later; the rate is stored
   per-payout (`feeCents`), so enabling one is a config change, not a
   migration. (Goods keep their advertised 5%.)

## Open decisions (need product input before PR 1)

2. **Settlement for PR 3 — manual payouts acceptable to ship Option B before
   Connect?** *(Recommended: yes. Mirrors how `VendorPayment` shipped.)*
3. **Guest vs. account-required** for buying and for redeeming a gift card.
   *(Default: allow guest purchase; allow redeem-by-code without an account,
   with optional claim-to-account when signed in.)*
4. **Gift card legal/expiry.** US CARD Act forbids expiry under 5 years and
   most dormancy fees; unredeemed balances are subject to state escheatment.
   *(Default: no expiry, no fees; revisit with counsel before real money.)*
5. **Refunds.** Refund a gift-card-funded purchase back to the gift balance
   (a `+refund` entry) or to an original card? *(Default: back to the gift
   balance.)*
