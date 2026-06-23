# How a purchase works on CodaCo

*A plain-language walkthrough of what happens, start to finish, when a
customer buys an item from a maker on CodaCo. Written for anyone — no
technical background needed.*

> **At a glance:** A customer signs in (their cart is saved to their
> account), adds an item, enters their shipping address and pays by card on
> a secure payment screen. CodaCo never sees or stores the card number. The
> money is split automatically — the maker receives their share directly,
> and CodaCo keeps a small platform fee. The maker is emailed about the sale
> right away and ships the item.

---

## Step by step

### 1. The customer signs in
A CodaCo cart is tied to the customer's **account**, not just their browser,
so the first step is to sign in (or create an account). Because the cart
lives with their account, it's **saved on CodaCo and follows them across
devices** — they can start on their phone and finish on a laptop, and it'll
still be there. (If someone clicks "Add to cart" while signed out, CodaCo
simply asks them to sign in first.)

### 2. The customer adds an item to their cart
On a product page, the customer clicks **"Add to cart."** The item is saved
to their account cart on CodaCo right away. No purchase has happened yet — a
cart is just a saved list they can change anytime.

### 3. The customer reviews their cart
The customer opens the **CodaCo cart page**, where they see everything
they've added: each item, the chosen size/option, the quantity, the price,
and a running total. They can change quantities or remove items. When ready,
they click **"Checkout."**

### 4. The customer enters their shipping address
On the **CodaCo checkout page**, the customer sees a summary of their order
and fills in **where the item should be shipped** — name, street address,
city, state, and ZIP.

- **Is this saved?** Yes. We save the shipping address *with that specific
  order*, so the record of where it was sent is always accurate — even if
  the customer later updates their address for future orders.

### 5. The customer places the order
The customer clicks **"Place order."** Behind the scenes, CodaCo does a few
quick safety checks before taking any money:

- It re-checks the **current price** of each item (so the price is always
  correct and can't be tampered with).
- It confirms the item is **still in stock**.
- It **sets the item aside** (reserves it) so two people can't buy the last
  one at the same time.

At this point the order exists in our system but is marked **"unpaid."** No
money has changed hands yet.

### 6. The customer pays by card — on a secure payment screen
The customer is taken to a **secure payment screen powered by Stripe**, our
payment processor. There they enter their **credit or debit card details**
(or use a digital wallet like Apple Pay or Google Pay).

- **Does CodaCo see or store the card number?** **No — never.** Card details
  are entered directly on Stripe's secure screen. CodaCo never sees the card
  number and never stores it. This is deliberate: it keeps customers' card
  data with a specialist whose entire job is handling payments safely, and it
  keeps CodaCo out of the strict regulations that come with storing card
  numbers. The only thing CodaCo keeps is a harmless reference code that lets
  us look the payment up later.

### 7. The payment is confirmed
Once the card is approved, the customer is returned to a **CodaCo
confirmation page** showing their completed order, and their cart is
emptied. Stripe quietly tells CodaCo "this order is paid," and we update the
order from **"unpaid"** to **"paid."** If the customer backs out before
paying, the order stays unpaid and the reserved item is released back into
stock.

---

## Where the money goes

CodaCo is a **marketplace** — customers buy from independent makers, not
from CodaCo directly. So the money needs to reach the *maker*, with CodaCo
keeping a fee for running the marketplace. We use **Stripe Connect** to do
this automatically.

Here's the key idea:

- Each maker sets up their **own connected payment account** with Stripe
  (a guided, one-time setup) — *before* their items can be sold. This is
  *their* account — their bank details, their money. If a maker hasn't
  finished this setup, their items simply aren't available to buy yet, so
  a customer is never charged for something that has nowhere to send the
  money.
- When a customer pays, Stripe **splits the payment at the moment of the
  sale**:
  - The **maker's share goes directly into the maker's own account.**
  - **CodaCo automatically keeps a platform fee** (our cut for running the
    marketplace).

So the money does **not** pile up in a CodaCo account and wait to be paid
out by hand. The split happens instantly and automatically, and each party's
share lands in their own account. (If a single order contains items from
several different makers, each maker is paid their portion separately.)

This is the proper, transparent way to run a marketplace: makers are paid
directly, CodaCo's fee is clear, and no one is manually moving money around.

---

## How the maker finds out about the sale

The moment an order is placed, the maker is notified two ways:

1. **Email.** Every maker with an item in the order gets an email right away
   — "New order: 2 items, $X — view in your dashboard." Email is the
   reliable channel, so a maker never misses a sale even if they're not
   logged in.
2. **Their dashboard.** The order also appears in the maker's **CodaCo
   dashboard**, under a "Pending" list, and stays there until they mark it
   shipped.

### Printing a shipping label

The maker doesn't have to go to the post office counter to figure out
postage. Right from their CodaCo dashboard, they click **"Buy shipping
label"** for the order. CodaCo already knows where it's going (the
customer's address) and how big the item is, so it shows the available
shipping options and prices. The maker picks one, and CodaCo **buys the
label and gives them a ready-to-print label** with a tracking number
built in. The maker prints it, sticks it on the box, and drops it off (or
schedules a pickup).

The moment the label is created, CodaCo automatically **emails the
customer** the tracking link so they know the item is on its way — and
the order updates to "delivered" on its own once the carrier confirms it
arrived.

*A couple of practical notes:* to print labels, each maker provides their
**return (ship-from) address** once, and each product needs its **weight
and size** filled in (so the right postage can be calculated). Makers who
prefer to ship their own way can still just paste in a tracking number
instead.

---

## Cancelling an order or getting a refund

Two things matter here. First, **when** in the journey the customer asks.
Second, **why** — because CodaCo's small platform fee was already taken
the moment the sale happened, and whether that fee comes back depends on
the reason.

### Before the item ships
The customer can **cancel the order themselves** from their order history,
and the refund is **automatic and complete** — the full amount, including
CodaCo's fee, goes back to their card. Nothing has shipped, so the maker
isn't out anything, and the item goes back in stock. The maker is emailed
"don't ship this" so nothing goes out by mistake.

### After the item ships
Now it's a **return request**. The customer asks for a refund and gives a
reason; the maker reviews it (CodaCo can step in if needed). What happens
to CodaCo's fee depends on **whose fault it was**:

- **Something went wrong** — the item arrived damaged, it was the wrong
  item, or it never showed up: the customer gets a **full refund, and
  CodaCo also returns its fee.** The maker isn't penalized with CodaCo's
  cut on a sale that went bad, and the customer is made whole.
- **The customer simply changed their mind:** they're **refunded for the
  item**, but **CodaCo's small fee is not returned** (and return shipping
  may be deducted). Accepting "changed my mind" returns is a normal cost
  of selling, so the maker covers CodaCo's fee in that case.

### A few practical notes
- Refunds always go back to the **same card** the customer paid with, and
  take a few business days to appear — that's the bank's timing, not ours.
- **Personalized or made-to-order items** generally can't be returned for
  a change of mind (they can't be resold), but a genuinely defective one
  is always refundable.
- The money is pulled back fairly: the maker's share is returned from
  their account to fund the refund, so CodaCo never quietly eats the cost
  of a refund — and the maker never pays twice when something was CodaCo's
  or their own fault.

---

## What's saved, and what isn't

| Information | Saved by CodaCo? |
|---|---|
| Items in the cart (before checkout) | Yes — saved to the customer's account (sign-in required), so the cart persists across devices |
| Shipping address | Yes — saved with the order |
| The order details and prices | Yes |
| **Credit / debit card number** | **No — handled entirely by Stripe, never stored by CodaCo** |
| A reference code linking to the payment | Yes — so we can look the payment up |
| The maker's payout account | Set up by the maker with Stripe; CodaCo only links to it |

---

## The short version

1. Customer signs in (the cart is saved to their account and follows them
   across devices) and adds items to their CodaCo cart.
2. Customer enters a shipping address on CodaCo's checkout page.
3. Customer pays by card on Stripe's secure screen — CodaCo never sees the
   card number.
4. The payment is split automatically: the maker gets their share in their
   own account, CodaCo keeps a platform fee.
5. The maker is emailed instantly and sees the order in their dashboard.
6. The maker ships the item and the customer gets a tracking email.
7. If the customer cancels before it ships, they're refunded in full
   automatically; after it ships it's a return request, and whether
   CodaCo's fee comes back depends on the reason.
