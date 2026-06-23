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
  findPoolByContributeToken,
  deliverPooledGiftCard,
  reconcilePendingByCode,
  formatCents,
  GiftCardError,
  GIFT_CARD_MIN_CENTS,
  GIFT_CARD_MAX_CENTS,
  type GiftCardLookup,
  type ClaimResult,
} from "@/lib/api/giftCards";
import { sendGiftCardDeliveryEmail } from "@/lib/email/templates";

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
  // Group gift: mint a shareable contribution link + a private organizer link,
  // and don't auto-deliver (the organizer sends it from the manage page).
  pooled?: boolean;
}

export interface PurchaseResult {
  url?: string;
  error?: string;
}

// Buy a gift card (or start a group gift). Guests are allowed (no auth gate) —
// a signed-in buyer is recorded as the purchaser. Creates the card `pending`,
// then hands off to hosted Stripe Checkout; the webhook records the payment
// and sends the right email once it confirms. Never spendable until then.
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
      pooled: input.pooled,
    });
  } catch (err) {
    if (err instanceof GiftCardError) return { error: err.message };
    log.error("giftcard.create_pending_failed", { err });
    return { error: "Something went wrong. Please try again." };
  }

  try {
    const origin = await getOrigin();
    // A pool sends the organizer to their manage page; a single card back to
    // the gift-cards page. The organizer token is the creator's own secret, so
    // it's fine in their post-checkout redirect.
    const successUrl = card.organizerToken
      ? `${origin}/gift-cards/manage/${card.organizerToken}?status=success`
      : // Carry the card id so the success page can self-heal a missed webhook.
        `${origin}/gift-cards?status=success&card=${card.id}`;
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: purchaserEmail,
      line_items: [giftCardLineItem(card.initialAmountCents)],
      success_url: successUrl,
      cancel_url: `${origin}/gift-cards?status=cancelled`,
      metadata: { kind: "gift_card", giftCardId: card.id },
      payment_intent_data: { metadata: { kind: "gift_card", giftCardId: card.id } },
    });
    log.info("giftcard.checkout_created", {
      giftCardId: card.id,
      pooled: Boolean(card.organizerToken),
      sessionId: checkout.id,
    });
    return { url: checkout.url ?? undefined };
  } catch (err) {
    log.error("giftcard.checkout_failed", { giftCardId: card.id, err });
    return { error: "Could not start checkout. Please try again." };
  }
}

function giftCardLineItem(amountCents: number) {
  return {
    quantity: 1,
    price_data: {
      currency: CURRENCY,
      unit_amount: amountCents,
      product_data: { name: `CodaCo gift card — ${formatCents(amountCents)}` },
    },
  } as const;
}

export interface ContributeInput {
  amountCents: number;
  contributorName?: string;
  contributorEmail?: string;
}

// Chip into an existing group gift via its public contribution token. No auth —
// contributors go straight to Stripe as guests. The webhook credits the pool
// and notifies the organizer once payment confirms.
export async function contributeToPool(
  token: string,
  input: ContributeInput,
): Promise<PurchaseResult> {
  if (!isStripeConfigured()) return { error: "Gift cards aren't available yet." };

  const card = await findPoolByContributeToken(token);
  if (!card) return { error: "This contribution link is no longer valid." };
  if (card.status === "void") return { error: "This gift is no longer accepting contributions." };

  const amountCents = Math.round(input.amountCents);
  if (!Number.isInteger(amountCents) || amountCents < GIFT_CARD_MIN_CENTS || amountCents > GIFT_CARD_MAX_CENTS) {
    return {
      error: `Choose an amount between ${formatCents(GIFT_CARD_MIN_CENTS)} and ${formatCents(GIFT_CARD_MAX_CENTS)}.`,
    };
  }

  try {
    const origin = await getOrigin();
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: input.contributorEmail?.trim() || undefined,
      line_items: [giftCardLineItem(amountCents)],
      success_url: `${origin}/gift-cards/contribute/${token}?status=thanks`,
      cancel_url: `${origin}/gift-cards/contribute/${token}?status=cancelled`,
      metadata: {
        kind: "gift_card",
        giftCardId: card.id,
        contributorName: input.contributorName?.trim() || "",
      },
      payment_intent_data: {
        // contributorName on the PI too (not just the session) so a webhook
        // miss recovered via reconcileCard still attributes the contribution.
        metadata: {
          kind: "gift_card",
          giftCardId: card.id,
          contributorName: input.contributorName?.trim() || "",
        },
      },
    });
    return { url: checkout.url ?? undefined };
  } catch (err) {
    log.error("giftcard.contribute_checkout_failed", { giftCardId: card.id, err });
    return { error: "Could not start checkout. Please try again." };
  }
}

export interface DeliverActionInput {
  recipientEmail: string;
  recipientName?: string;
  giftMessage?: string;
}

export interface DeliverActionResult {
  ok?: boolean;
  error?: string;
}

// Organizer sends the pooled gift to its recipient (from the manage page).
// Sets the recipient fields + delivery time and emails the card. Top-ups stay
// open afterward, and re-sending is allowed.
export async function deliverGiftCardAction(
  organizerToken: string,
  input: DeliverActionInput,
): Promise<DeliverActionResult> {
  const result = await deliverPooledGiftCard(organizerToken, {
    recipientEmail: input.recipientEmail,
    recipientName: input.recipientName,
    giftMessage: input.giftMessage,
  });
  if (!result.ok) return { error: result.error };

  await sendGiftCardDeliveryEmail({
    toEmail: result.card.recipientEmail!,
    recipientName: result.card.recipientName,
    code: result.card.code,
    amountLabel: formatCents(result.balanceCents),
    message: result.card.giftMessage,
    contributorNames: result.contributorNames,
  });
  return { ok: true };
}

// Check a code's balance from the redeem page. Public-safe DTO only. Self-heals
// a stranded card first, so a recipient who got their code but whose funding
// webhook failed still sees the real balance instead of "not active yet".
export async function lookupGiftCardAction(code: string): Promise<GiftCardLookup> {
  if (!code?.trim()) return { found: false };
  await reconcilePendingByCode(code);
  return lookupGiftCard(code);
}

// Add a card to the signed-in user's account. Requires auth (guests can still
// look up a balance, just not claim it).
export async function claimGiftCardAction(code: string): Promise<ClaimResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Sign in to add this gift card to your account." };
  }
  await reconcilePendingByCode(code);
  return claimGiftCard(code, session.user.id);
}
