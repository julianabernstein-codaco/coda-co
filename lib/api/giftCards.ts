import { randomInt } from "node:crypto";
import { Prisma, type GiftCard } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  GIFT_CARD_MIN_CENTS,
  GIFT_CARD_MAX_CENTS,
  formatCents,
  normalizeGiftCardCode,
} from "@/lib/format/giftCard";

// Gift card balance lives in the ledger, never on the card. See
// docs/gift-cards-and-client-billing-plan.md. The pure, client-safe
// constants/formatters live in lib/format/giftCard.ts; re-exported here so
// server callers (actions, webhook) have one import.
export {
  GIFT_CARD_PRESETS_CENTS,
  GIFT_CARD_MIN_CENTS,
  GIFT_CARD_MAX_CENTS,
  formatCents,
  normalizeGiftCardCode,
} from "@/lib/format/giftCard";

// Unambiguous alphabet — no 0/O/1/I/L so a hand-typed code is unmistakable.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_GROUPS = 3;
const CODE_GROUP_LEN = 4;

// e.g. "Q7KP-3MWX-RBND". The format is cosmetic; normalizeGiftCardCode
// strips it back to the stored canonical form on lookup.
function generateGiftCardCode(): string {
  const groups: string[] = [];
  for (let g = 0; g < CODE_GROUPS; g++) {
    let group = "";
    for (let i = 0; i < CODE_GROUP_LEN; i++) {
      group += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
    }
    groups.push(group);
  }
  return groups.join("-");
}

export interface CreateGiftCardInput {
  amountCents: number;
  purchaserEmail: string;
  purchaserUserId?: string | null;
  recipientEmail?: string | null;
  recipientName?: string | null;
  giftMessage?: string | null;
}

// Thrown for expected, user-facing gift card failures (bad amount, unknown
// code). The server action surfaces `.message`; anything else is a 500.
export class GiftCardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GiftCardError";
  }
}

// Create the card in `pending` — no balance yet. The Stripe webhook flips it
// to `active` and writes the +purchase ledger entry once payment confirms.
// Retries on the (astronomically unlikely) code collision.
export async function createPendingGiftCard(
  input: CreateGiftCardInput,
): Promise<GiftCard> {
  const amountCents = Math.round(input.amountCents);
  if (
    !Number.isInteger(amountCents) ||
    amountCents < GIFT_CARD_MIN_CENTS ||
    amountCents > GIFT_CARD_MAX_CENTS
  ) {
    throw new GiftCardError(
      `Choose an amount between ${formatCents(GIFT_CARD_MIN_CENTS)} and ${formatCents(GIFT_CARD_MAX_CENTS)}.`,
    );
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.giftCard.create({
        data: {
          code: generateGiftCardCode(),
          initialAmountCents: amountCents,
          currency: "USD",
          status: "pending",
          purchaserEmail: input.purchaserEmail,
          purchaserUserId: input.purchaserUserId ?? null,
          recipientEmail: input.recipientEmail ?? null,
          recipientName: input.recipientName ?? null,
          giftMessage: input.giftMessage ?? null,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        continue; // code collision — try a fresh code
      }
      throw err;
    }
  }
  throw new Error("Could not allocate a unique gift card code");
}

// Settle a gift card after its Checkout payment completes: flip pending →
// active, record the PaymentIntent, and write the one +purchase ledger entry.
// Idempotent: the conditional updateMany is the lock, so Stripe's at-least-once
// delivery can't double-credit. Returns the card on the first activation,
// null on a duplicate event (so the caller only emails once).
export async function activateGiftCardFromCheckout(
  giftCardId: string,
  paymentIntentId: string | null,
): Promise<GiftCard | null> {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.giftCard.updateMany({
      where: { id: giftCardId, status: "pending" },
      data: {
        status: "active",
        fundedAt: new Date(),
        stripePaymentIntentId: paymentIntentId,
      },
    });
    if (updated.count !== 1) return null; // already active or gone — no-op

    const card = await tx.giftCard.findUnique({ where: { id: giftCardId } });
    if (!card) return null;

    await tx.giftCardLedgerEntry.create({
      data: {
        giftCardId: card.id,
        type: "purchase",
        amountCents: card.initialAmountCents,
        currency: card.currency,
        note: "Gift card purchase",
      },
    });
    return card;
  });
}

// Spendable balance = SUM(amount_cents) over the card's ledger. Pending cards
// (no ledger yet) return 0.
export async function getGiftCardBalanceCents(
  giftCardId: string,
): Promise<number> {
  const agg = await prisma.giftCardLedgerEntry.aggregate({
    where: { giftCardId },
    _sum: { amountCents: true },
  });
  return agg._sum.amountCents ?? 0;
}

// What a signed-in user has available across every gift card they've claimed
// into their account. A derived "wallet" — no balance is stored anywhere.
export async function getUserGiftCardBalanceCents(
  userId: string,
): Promise<number> {
  const agg = await prisma.giftCardLedgerEntry.aggregate({
    where: { giftCard: { claimedByUserId: userId, status: "active" } },
    _sum: { amountCents: true },
  });
  return agg._sum.amountCents ?? 0;
}

// Public-safe view of a card looked up by code. Deliberately omits purchaser
// details — only the spendable state a holder needs to see.
export type GiftCardLookup =
  | { found: false }
  | {
      found: true;
      status: GiftCard["status"];
      balanceCents: number;
      currency: string;
      claimedByUserId: string | null;
    };

export async function lookupGiftCard(rawCode: string): Promise<GiftCardLookup> {
  const code = normalizeGiftCardCode(rawCode);
  if (!code) return { found: false };

  const card = await prisma.giftCard.findUnique({ where: { code } });
  if (!card) return { found: false };

  return {
    found: true,
    status: card.status,
    balanceCents: await getGiftCardBalanceCents(card.id),
    currency: card.currency,
    claimedByUserId: card.claimedByUserId,
  };
}

export type ClaimResult =
  | { ok: true; balanceCents: number }
  | { ok: false; error: string };

// Attach an active card to a user's account so its balance auto-applies at
// checkout. No-op-friendly: claiming a card you already hold just re-confirms
// the balance.
export async function claimGiftCard(
  rawCode: string,
  userId: string,
): Promise<ClaimResult> {
  const code = normalizeGiftCardCode(rawCode);
  const card = await prisma.giftCard.findUnique({ where: { code } });
  if (!card) return { ok: false, error: "That code doesn't match a gift card." };

  if (card.status === "pending") {
    return { ok: false, error: "This gift card isn't active yet. Try again shortly." };
  }
  if (card.status === "void") {
    return { ok: false, error: "This gift card is no longer valid." };
  }
  if (card.claimedByUserId && card.claimedByUserId !== userId) {
    return { ok: false, error: "This gift card is already on another account." };
  }

  if (card.claimedByUserId !== userId) {
    await prisma.giftCard.update({
      where: { id: card.id },
      data: { claimedByUserId: userId },
    });
  }
  return { ok: true, balanceCents: await getGiftCardBalanceCents(card.id) };
}
