import { randomInt, randomBytes } from "node:crypto";
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

// URL-safe random token for the public contribution link and the secret
// organizer link. ~22 chars of base64url ≈ 128 bits — unguessable, distinct
// from the human-typed spend `code`.
function generateToken(): string {
  return randomBytes(16).toString("base64url");
}

// pooled = the card accepts group contributions (has a contributeToken).
export function isPooled(card: Pick<GiftCard, "contributeToken">): boolean {
  return card.contributeToken != null;
}

export interface CreateGiftCardInput {
  amountCents: number;
  purchaserEmail: string;
  purchaserUserId?: string | null;
  recipientEmail?: string | null;
  recipientName?: string | null;
  giftMessage?: string | null;
  // When true, the card is a group-gift pool: mint contribute + organizer
  // tokens and don't auto-deliver on first funding (the organizer sends it).
  pooled?: boolean;
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
          contributeToken: input.pooled ? generateToken() : null,
          organizerToken: input.pooled ? generateToken() : null,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        continue; // code / token collision — try fresh ones
      }
      throw err;
    }
  }
  throw new Error("Could not allocate a unique gift card code");
}

export interface RecordContributionInput {
  giftCardId: string;
  paymentIntentId: string | null;
  amountCents: number;
  currency?: string;
  contributorName?: string | null;
  contributorEmail?: string | null;
}

export type RecordContributionResult =
  | { recorded: false }
  | {
      recorded: true;
      card: GiftCard;
      // True only for the very first contribution (the one that funds the
      // card, pending → active). Drives "first" vs "another" emails.
      wasFirst: boolean;
      amountCents: number;
      balanceCents: number;
      contributorName: string | null;
    };

// Credit a confirmed Checkout payment to a card — used for BOTH the creating
// purchase and every later top-up. The amount is what Stripe actually
// collected (session.amount_total), never trusted from the client.
//
// Idempotent: the unique stripePaymentIntentId on the ledger entry is the lock,
// so Stripe's at-least-once delivery can't double-credit (a duplicate event
// hits the unique constraint and returns { recorded: false }).
export async function recordGiftCardContribution(
  input: RecordContributionInput,
): Promise<RecordContributionResult> {
  const amountCents = Math.round(input.amountCents);
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return { recorded: false };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const card = await tx.giftCard.findUnique({ where: { id: input.giftCardId } });
      if (!card) return { recorded: false };

      // The flip is the atomic "is this the first contribution?" test. The
      // conditional updateMany re-checks status === "pending" after taking the
      // row lock, so under concurrent first-contributions exactly one sees
      // count === 1; the rest wait, then match 0 (already active).
      const flip = await tx.giftCard.updateMany({
        where: { id: card.id, status: "pending" },
        data: { status: "active", fundedAt: new Date() },
      });
      const wasFirst = flip.count === 1;

      // The unique PaymentIntent makes this the idempotency lock. A retried
      // webhook throws P2002 here and is caught below as a no-op.
      await tx.giftCardLedgerEntry.create({
        data: {
          giftCardId: card.id,
          type: "purchase",
          amountCents,
          currency: input.currency ?? card.currency,
          stripePaymentIntentId: input.paymentIntentId,
          contributorName: input.contributorName ?? null,
          contributorEmail: input.contributorEmail ?? null,
          note: wasFirst ? "Gift card purchase" : "Gift card contribution",
        },
      });

      const [fresh, agg] = await Promise.all([
        tx.giftCard.findUnique({ where: { id: card.id } }),
        tx.giftCardLedgerEntry.aggregate({
          where: { giftCardId: card.id },
          _sum: { amountCents: true },
        }),
      ]);

      return {
        recorded: true as const,
        card: fresh ?? card,
        wasFirst,
        amountCents,
        balanceCents: agg._sum.amountCents ?? 0,
        contributorName: input.contributorName ?? null,
      };
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { recorded: false }; // duplicate PaymentIntent — already credited
    }
    throw err;
  }
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

// ── Group gifting (pools) ─────────────────────────────────────────────────────

export interface ContributionSummary {
  name: string | null;
  amountCents: number;
  note: string | null;
  at: Date;
}

// Money-in entries (purchases / contributions), newest first. Used to show
// "who chipped in" on the manage page and in the delivery email.
async function getContributions(giftCardId: string): Promise<ContributionSummary[]> {
  const rows = await prisma.giftCardLedgerEntry.findMany({
    where: { giftCardId, type: "purchase" },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    name: r.contributorName,
    amountCents: r.amountCents,
    note: null,
    at: r.createdAt,
  }));
}

// Server-internal: the card behind a public contribution token, or null. The
// action needs the id (for Stripe metadata) and status; never sent to a client.
export async function findPoolByContributeToken(
  token: string,
): Promise<GiftCard | null> {
  if (!token) return null;
  return prisma.giftCard.findUnique({ where: { contributeToken: token } });
}

// Public, account-free view for the contribute page. Deliberately omits the
// spend code, the organizer token, emails, and the internal id.
export type ContributeView =
  | { found: false }
  | {
      found: true;
      status: GiftCard["status"];
      recipientName: string | null;
      giftMessage: string | null;
      balanceCents: number;
      contributorCount: number;
      delivered: boolean;
    };

export async function getContributeView(token: string): Promise<ContributeView> {
  const card = await findPoolByContributeToken(token);
  if (!card) return { found: false };
  const contributions = await getContributions(card.id);
  return {
    found: true,
    status: card.status,
    recipientName: card.recipientName,
    giftMessage: card.giftMessage,
    balanceCents: contributions.reduce((n, c) => n + c.amountCents, 0),
    contributorCount: contributions.length,
    delivered: card.deliveredAt != null,
  };
}

// Organizer (secret-token) view for the manage page: fuller, but still never
// the spend code.
export type ManageView =
  | { found: false }
  | {
      found: true;
      status: GiftCard["status"];
      balanceCents: number;
      currency: string;
      recipientEmail: string | null;
      recipientName: string | null;
      giftMessage: string | null;
      deliveredAt: Date | null;
      contributeToken: string;
      contributions: ContributionSummary[];
    };

export async function getManageView(token: string): Promise<ManageView> {
  if (!token) return { found: false };
  const card = await prisma.giftCard.findUnique({ where: { organizerToken: token } });
  if (!card || !card.contributeToken) return { found: false };
  const contributions = await getContributions(card.id);
  return {
    found: true,
    status: card.status,
    balanceCents: contributions.reduce((n, c) => n + c.amountCents, 0),
    currency: card.currency,
    recipientEmail: card.recipientEmail,
    recipientName: card.recipientName,
    giftMessage: card.giftMessage,
    deliveredAt: card.deliveredAt,
    contributeToken: card.contributeToken,
    contributions,
  };
}

export interface DeliverInput {
  recipientEmail: string;
  recipientName?: string | null;
  giftMessage?: string | null;
}

export type DeliverResult =
  | { ok: false; error: string }
  | {
      ok: true;
      card: GiftCard;
      balanceCents: number;
      contributorNames: string[];
    };

// Organizer sends the pooled card to its recipient. Sets the recipient fields
// + deliveredAt and hands back what the action needs to email the card. Stays
// "always-open": top-ups can still land afterward, and re-sending is allowed
// (e.g. corrected address) — deliveredAt just records the first send.
export async function deliverPooledGiftCard(
  organizerToken: string,
  input: DeliverInput,
): Promise<DeliverResult> {
  const card = await prisma.giftCard.findUnique({ where: { organizerToken } });
  if (!card || !card.contributeToken) {
    return { ok: false, error: "We couldn't find that gift pool." };
  }
  if (card.status === "pending") {
    return { ok: false, error: "Wait until the first contribution clears before sending." };
  }
  if (card.status === "void") {
    return { ok: false, error: "This gift pool is no longer valid." };
  }
  const recipientEmail = input.recipientEmail?.trim();
  if (!recipientEmail) {
    return { ok: false, error: "Enter the recipient's email." };
  }

  const updated = await prisma.giftCard.update({
    where: { id: card.id },
    data: {
      recipientEmail,
      recipientName: input.recipientName?.trim() || null,
      giftMessage: input.giftMessage?.trim() || card.giftMessage,
      deliveredAt: card.deliveredAt ?? new Date(),
    },
  });

  const contributions = await getContributions(card.id);
  return {
    ok: true,
    card: updated,
    balanceCents: contributions.reduce((n, c) => n + c.amountCents, 0),
    contributorNames: contributions
      .map((c) => c.name?.trim())
      .filter((n): n is string => Boolean(n)),
  };
}
