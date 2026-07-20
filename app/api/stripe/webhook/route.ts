import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { log } from "@/lib/log";
import { markSetupFeePaid, syncStripeSubscription } from "@/lib/billing/sync";
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
        } else if (
          session.mode === "payment" &&
          session.metadata?.kind === "goods_setup" &&
          session.metadata.vendorId
        ) {
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? null);
          const customerId =
            typeof session.customer === "string"
              ? session.customer
              : (session.customer?.id ?? null);
          await markSetupFeePaid(session.metadata.vendorId, paymentIntentId, customerId);
        } else if (
          session.mode === "payment" &&
          session.metadata?.kind === "gift_card" &&
          session.metadata.giftCardId
        ) {
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? null);
          // Credits the amount Stripe actually collected. Idempotent on the
          // PaymentIntent, so a retried event returns { recorded: false } and
          // no duplicate credit or email goes out.
          const res = await recordGiftCardContribution({
            giftCardId: session.metadata.giftCardId,
            paymentIntentId,
            amountCents: session.amount_total ?? 0,
            currency: (session.currency ?? "usd").toUpperCase(),
            contributorName: session.metadata.contributorName ?? null,
            contributorEmail:
              session.customer_details?.email ??
              session.metadata.contributorEmail ??
              null,
          });

          if (res.recorded) {
            const { card } = res;
            if (isPooled(card)) {
              // Group pool: never auto-deliver — the organizer sends it. Just
              // notify them: pool ready on the first contribution, otherwise a
              // "someone chipped in" nudge.
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
              // Single-purchase card: deliver the card (with code) to the
              // recipient, and email the buyer their payment receipt.
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
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncStripeSubscription(event.data.object);
        break;

      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription | null;
        };
        const subRef = invoice.subscription;
        if (subRef) {
          const subId = typeof subRef === "string" ? subRef : subRef.id;
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
