import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { log } from "@/lib/log";
import { syncStripeSubscription } from "@/lib/billing/sync";
import {
  recordGiftCardContribution,
  isPooled,
  formatCents,
} from "@/lib/api/giftCards";
import {
  sendGiftCardDeliveryEmail,
  sendGiftCardReceiptEmail,
  sendGiftCardPoolCreatedEmail,
  sendGiftCardContributionEmail,
} from "@/lib/email/templates";

// Stripe webhook. Signature-verified against STRIPE_WEBHOOK_SECRET, so the
// payload is trusted. Stripe retries on non-2xx and may deliver events more
// than once, so every handler is idempotent.
//
// Register the endpoint in the Stripe dashboard (Developers → Webhooks /
// Event destinations) or via `stripe listen --forward-to
// .../api/stripe/webhook` in dev, and paste the signing secret into
// STRIPE_WEBHOOK_SECRET.
// Credit a gift card from a Checkout session, then send whatever email that
// funding event calls for. Called from both checkout.session.completed and
// checkout.session.async_payment_succeeded; safe to call with any session.
async function creditGiftCardCheckout(session: Stripe.Checkout.Session): Promise<void> {
  if (session.metadata?.kind !== "gift_card" || !session.metadata.giftCardId) return;

  // ── The gate that keeps a gift card from being free money ──────────────
  // checkout.session.completed does NOT mean "paid". For delayed-notification
  // payment methods (ACH, SEPA, Bacs, Boleto, Klarna, and others that can be
  // switched on from the Stripe Dashboard with no code change here) it fires
  // as soon as the customer finishes the flow, while payment_status is still
  // `unpaid` — and that payment can still fail days later. Crediting there
  // would email a spendable code for money that never arrives, which is
  // exactly the buy-then-bounce laundering pattern gift cards attract.
  //
  // So: only `paid` funds a card. Async methods come back through
  // checkout.session.async_payment_succeeded once the money is actually in,
  // and this same function credits them then. (`no_payment_required`, the
  // zero-total case, is correctly excluded too.)
  if (session.payment_status !== "paid") {
    log.info("giftcard.checkout_awaiting_payment", {
      giftCardId: session.metadata.giftCardId,
      sessionId: session.id,
      paymentStatus: session.payment_status,
    });
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  // Credits the amount Stripe actually collected — never a client-supplied
  // number. Idempotent on the PaymentIntent, so a retried event (or the same
  // session arriving via both `completed` and `async_payment_succeeded`)
  // returns { recorded: false } and no duplicate credit or email goes out.
  const res = await recordGiftCardContribution({
    giftCardId: session.metadata.giftCardId,
    paymentIntentId,
    amountCents: session.amount_total ?? 0,
    currency: (session.currency ?? "usd").toUpperCase(),
    contributorName: session.metadata.contributorName ?? null,
    contributorEmail:
      session.customer_details?.email ?? session.metadata.contributorEmail ?? null,
  });
  if (!res.recorded) return;

  const { card } = res;
  if (isPooled(card)) {
    // Group pool: never auto-deliver — the organizer sends it. Just notify
    // them: pool ready on the first contribution, otherwise a "someone
    // chipped in" nudge.
    if (res.wasFirst) {
      await sendGiftCardPoolCreatedEmail({
        toEmail: card.purchaserEmail,
        balanceLabel: formatCents(res.balanceCents),
        contributeToken: card.contributeToken!,
        organizerToken: card.organizerToken!,
      });
    } else {
      await sendGiftCardContributionEmail({
        toEmail: card.purchaserEmail,
        contributorName: res.contributorName,
        amountLabel: formatCents(res.amountCents),
        balanceLabel: formatCents(res.balanceCents),
        organizerToken: card.organizerToken!,
      });
    }
  } else if (res.wasFirst) {
    // Single-purchase card: deliver the card (with code) to the recipient,
    // and email the buyer their payment receipt.
    await sendGiftCardDeliveryEmail({
      toEmail: card.recipientEmail ?? card.purchaserEmail,
      recipientName: card.recipientName,
      purchaserName: card.purchaserName,
      purchaserEmail: card.purchaserEmail,
      isSelfPurchase: !card.recipientEmail,
      code: card.code,
      amountLabel: formatCents(res.balanceCents),
      message: card.giftMessage,
    });
    await sendGiftCardReceiptEmail({
      toEmail: card.purchaserEmail,
      amountLabel: formatCents(res.balanceCents),
      isSelfPurchase: !card.recipientEmail,
      recipientName: card.recipientName,
      recipientEmail: card.recipientEmail,
    });
  }
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    log.error("billing.webhook_missing_secret");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Raw body required for signature verification — do not JSON.parse first.
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    log.warn("billing.webhook_bad_signature", { err });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode === "subscription" && session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          await syncStripeSubscription(await stripe.subscriptions.retrieve(subId));
        } else if (session.mode === "payment") {
          await creditGiftCardCheckout(session);
        }
        break;
      }

      // Delayed-notification methods settle long after
      // checkout.session.completed — this is where their money actually
      // lands, so it's a funding event just like a paid card session.
      case "checkout.session.async_payment_succeeded":
        await creditGiftCardCheckout(event.data.object);
        break;

      // ...and this is where it doesn't. Nothing to undo (we never credited
      // an unpaid session), but log it: a burst here is a card-testing or
      // bank-fraud signal worth seeing.
      case "checkout.session.async_payment_failed": {
        const session = event.data.object;
        if (session.metadata?.kind === "gift_card") {
          log.warn("giftcard.async_payment_failed", {
            giftCardId: session.metadata.giftCardId,
            sessionId: session.id,
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncStripeSubscription(event.data.object);
        break;

      // Both settle the same way — re-read the subscription so our mirror of
      // its status is authoritative — but they're logged differently. A
      // decline is the one billing event worth alerting on: a spike across
      // customers is card-testing or a processor problem, and a repeat on one
      // customer is a vendor about to lapse. Logging the paid side too (at
      // info) is what makes a *rate* computable; a raw decline count alone
      // just tracks how many vendors we have.
      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription | null;
        };
        const subRef = invoice.subscription;
        const subId = subRef ? (typeof subRef === "string" ? subRef : subRef.id) : null;

        const customerRef = invoice.customer;
        const fields = {
          invoiceId: invoice.id,
          // Joins to vendor_profile.stripe_customer_id when you need to know
          // *which* vendor without paying for a DB read on the webhook path.
          customerId: typeof customerRef === "string" ? customerRef : (customerRef?.id ?? null),
          subscriptionId: subId,
          amountDueCents: invoice.amount_due,
          billingReason: invoice.billing_reason,
        };

        if (event.type === "invoice.payment_failed") {
          // attempt_count separates a first decline from Stripe's dunning
          // retries, so an alert can fire on new failures rather than
          // re-counting the same lapsing customer every retry.
          log.warn("billing.invoice_payment_failed", {
            ...fields,
            attemptCount: invoice.attempt_count,
          });
        } else {
          log.info("billing.invoice_paid", fields);
        }

        if (subId) {
          await syncStripeSubscription(await stripe.subscriptions.retrieve(subId));
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    // 500 so Stripe retries; handlers are idempotent.
    log.error("billing.webhook_handler_failed", { type: event.type, err });
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
