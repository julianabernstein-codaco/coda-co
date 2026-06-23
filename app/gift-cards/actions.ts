"use server";

import { headers } from "next/headers";
import { auth } from "@/auth";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { CURRENCY } from "@/lib/billing/catalog";
import { log } from "@/lib/log";
import {
  createPendingGiftCard,
  lookupGiftCard,
  claimGiftCard,
  formatCents,
  GiftCardError,
  type GiftCardLookup,
  type ClaimResult,
} from "@/lib/api/giftCards";

async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export interface PurchaseGiftCardInput {
  amountCents: number;
  purchaserEmail: string;
  recipientEmail?: string;
  recipientName?: string;
  giftMessage?: string;
}

export interface PurchaseResult {
  url?: string;
  error?: string;
}

// Buy a gift card. Guests are allowed (no auth gate) — a signed-in buyer is
// recorded as the purchaser so the card shows up under their account later.
// Creates the card `pending`, then hands off to hosted Stripe Checkout; the
// webhook activates the card and emails it once payment confirms. The card is
// never spendable until then.
export async function purchaseGiftCard(
  input: PurchaseGiftCardInput,
): Promise<PurchaseResult> {
  if (!isStripeConfigured()) return { error: "Gift cards aren't available yet." };

  const purchaserEmail = input.purchaserEmail?.trim();
  if (!purchaserEmail) return { error: "Enter your email so we can send a receipt." };

  const session = await auth();

  let card;
  try {
    card = await createPendingGiftCard({
      amountCents: input.amountCents,
      purchaserEmail,
      purchaserUserId: session?.user?.id ?? null,
      recipientEmail: input.recipientEmail?.trim() || null,
      recipientName: input.recipientName?.trim() || null,
      giftMessage: input.giftMessage?.trim() || null,
    });
  } catch (err) {
    if (err instanceof GiftCardError) return { error: err.message };
    log.error("giftcard.create_pending_failed", { err });
    return { error: "Something went wrong. Please try again." };
  }

  try {
    const origin = await getOrigin();
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: purchaserEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: card.initialAmountCents,
            product_data: {
              name: `CodaCo gift card — ${formatCents(card.initialAmountCents)}`,
            },
          },
        },
      ],
      success_url: `${origin}/gift-cards?status=success`,
      cancel_url: `${origin}/gift-cards?status=cancelled`,
      metadata: { kind: "gift_card", giftCardId: card.id },
      payment_intent_data: { metadata: { kind: "gift_card", giftCardId: card.id } },
    });
    log.info("giftcard.checkout_created", { giftCardId: card.id, sessionId: checkout.id });
    return { url: checkout.url ?? undefined };
  } catch (err) {
    log.error("giftcard.checkout_failed", { giftCardId: card.id, err });
    return { error: "Could not start checkout. Please try again." };
  }
}

// Check a code's balance from the redeem page. Public-safe DTO only.
export async function lookupGiftCardAction(code: string): Promise<GiftCardLookup> {
  if (!code?.trim()) return { found: false };
  return lookupGiftCard(code);
}

// Add a card to the signed-in user's account. Requires auth (guests can still
// look up a balance, just not claim it).
export async function claimGiftCardAction(code: string): Promise<ClaimResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Sign in to add this gift card to your account." };
  }
  return claimGiftCard(code, session.user.id);
}
