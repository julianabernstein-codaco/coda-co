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
  normalizeGiftCardCode,
  isGiftCardCodeShape,
  type GiftCardLookup,
  type ClaimResult,
} from "@/lib/api/giftCards";
import { sendGiftCardDeliveryEmail } from "@/lib/email/templates";
import { rateLimit } from "@/lib/rate-limit";
import { isEmailShape } from "@/lib/format/email";
import { giftCardsOpenFor } from "@/lib/launch";
import {
  overGiftCardLimit,
  CHECKOUT_LIMIT,
  CODE_LIMIT,
  DELIVER_LIMIT,
} from "./limits";

// Stripe caps a metadata value at 500 characters; stay well inside it so a
// long name is truncated rather than failing the whole Checkout call.
const MAX_METADATA_LEN = 200;

// Shown when the gift-card sales hold is on. Deliberately the same wording the
// UI uses, so a direct action call and the disabled button tell one story.
const GIFT_CARDS_HELD_MESSAGE = "Gift cards aren't on sale just yet. Please check back soon.";

async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export interface PurchaseGiftCardInput {
  amountCents: number;
  purchaserEmail: string;
  purchaserName?: string;
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

  // The sales hold, enforced here rather than by hiding the button. A server
  // action is a POST endpoint whose id ships in the client bundle, so anyone
  // who loaded the page while sales were open can keep calling it — the UI
  // state is cosmetic and this is the actual gate. First, before any other
  // work, so a held site does nothing at all on this path.
  const session = await auth();
  if (!(await giftCardsOpenFor(session?.user?.role))) {
    return { error: GIFT_CARDS_HELD_MESSAGE };
  }

  // Cheap input checks run *before* the throttle so an honest typo costs a
  // correction, not one of the caller's ten hourly attempts. createPendingGiftCard
  // re-validates these — this is only about where the budget gets spent.
  const purchaserEmail = input.purchaserEmail?.trim();
  if (!purchaserEmail) return { error: "Enter your email so we can send a receipt." };
  if (!isEmailShape(purchaserEmail)) return { error: "Enter a valid email address." };

  const recipientEmail = input.recipientEmail?.trim() || null;
  if (recipientEmail && !isEmailShape(recipientEmail)) {
    return { error: "Enter a valid recipient email address." };
  }

  // Guests can buy gift cards, so this is the one unauthenticated payment
  // on-ramp on the site. Throttle per IP before any DB work so it can't be
  // used as a card-testing funnel: the actual card entry happens on Stripe's
  // hosted Checkout page (where Radar applies), but this caps how fast anyone
  // can spin up Checkout sessions + pending gift-card rows from one source.
  if (await overGiftCardLimit("checkout", CHECKOUT_LIMIT, "giftcard.rate_limited", { flow: "purchase" })) {
    return { error: "Too many attempts. Please try again in a little while." };
  }

  const purchaserName = input.purchaserName?.trim().slice(0, MAX_METADATA_LEN) || null;

  let card;
  try {
    card = await createPendingGiftCard({
      amountCents: input.amountCents,
      purchaserEmail,
      purchaserName,
      purchaserUserId: session?.user?.id ?? null,
      recipientEmail,
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
      // contributorName attributes the buyer's own contribution — it shows the
      // organizer in a pool's "In the pot" list, and survives a webhook miss
      // recovered via reconcile (which reads PI metadata).
      metadata: { kind: "gift_card", giftCardId: card.id, contributorName: purchaserName ?? "" },
      payment_intent_data: {
        metadata: { kind: "gift_card", giftCardId: card.id, contributorName: purchaserName ?? "" },
      },
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

  // A contribution is money in, so the sales hold covers it too — otherwise a
  // circulating contribute link would stay a live payment on-ramp after the
  // buy flow closed. Delivering an already-funded pool stays open.
  const session = await auth();
  if (!(await giftCardsOpenFor(session?.user?.role))) {
    return { error: GIFT_CARDS_HELD_MESSAGE };
  }

  // Same unauthenticated payment on-ramp as purchaseGiftCard — throttle per IP
  // (shared budget with purchases, so the total gift-card checkout rate from
  // one source is capped) before any DB work, to blunt card-testing funnels.
  if (await overGiftCardLimit("checkout", CHECKOUT_LIMIT, "giftcard.rate_limited", { flow: "contribute" })) {
    return { error: "Too many attempts. Please try again in a little while." };
  }

  const card = await findPoolByContributeToken(token);
  if (!card) return { error: "This contribution link is no longer valid." };
  if (card.status === "void") return { error: "This gift is no longer accepting contributions." };

  const amountCents = Math.round(input.amountCents);
  if (!Number.isInteger(amountCents) || amountCents < GIFT_CARD_MIN_CENTS || amountCents > GIFT_CARD_MAX_CENTS) {
    return {
      error: `Choose an amount between ${formatCents(GIFT_CARD_MIN_CENTS)} and ${formatCents(GIFT_CARD_MAX_CENTS)}.`,
    };
  }

  const contributorName = input.contributorName?.trim().slice(0, MAX_METADATA_LEN) || "";

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
        contributorName,
      },
      payment_intent_data: {
        // contributorName on the PI too (not just the session) so a webhook
        // miss recovered via reconcileCard still attributes the contribution.
        metadata: {
          kind: "gift_card",
          giftCardId: card.id,
          contributorName,
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
  // This sends an email carrying the spend code, to an address and with a
  // message body the caller chooses — i.e. a mail relay for whoever holds the
  // organizer token. Capped twice: per IP, and per token so rotating IPs
  // doesn't buy more sends out of one funded pool.
  if (await overGiftCardLimit("deliver", DELIVER_LIMIT, "giftcard.deliver_rate_limited")) {
    return { error: "Too many attempts. Please try again in a little while." };
  }
  const perToken = await rateLimit(`gift-card:deliver-token:${organizerToken}`, DELIVER_LIMIT);
  if (!perToken.ok) {
    log.warn("giftcard.deliver_rate_limited", { scope: "token" });
    return { error: "You've sent this gift several times already. Try again in a little while." };
  }

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

// A code is a bearer credential, so both entry points below are guessing
// oracles: they tell the caller whether a code exists and what it's worth.
// Reject anything that isn't a well-formed code before spending a token (so
// junk costs nothing), then charge one attempt per plausible guess. Callers
// get the same generic "not found" either way — never a hint about which half
// of the check failed.
async function overCodeGuessLimit(): Promise<boolean> {
  return overGiftCardLimit("code", CODE_LIMIT, "giftcard.code_rate_limited");
}

// Check a code's balance from the redeem page. Public-safe DTO only. Self-heals
// a stranded card first, so a recipient who got their code but whose funding
// webhook failed still sees the real balance instead of "not active yet".
export async function lookupGiftCardAction(code: string): Promise<GiftCardLookup> {
  if (!code?.trim()) return { found: false };
  if (!isGiftCardCodeShape(normalizeGiftCardCode(code))) return { found: false };
  if (await overCodeGuessLimit()) return { found: false };

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
  const notFound = { ok: false as const, error: "That code doesn't match a gift card." };
  if (!isGiftCardCodeShape(normalizeGiftCardCode(code ?? ""))) return notFound;
  if (await overCodeGuessLimit()) {
    return { ok: false, error: "Too many attempts. Please try again in a little while." };
  }

  await reconcilePendingByCode(code);
  return claimGiftCard(code, session.user.id);
}
