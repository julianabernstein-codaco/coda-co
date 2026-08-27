// Pure, client-safe gift card helpers — no DB, no Node built-ins. Import this
// from client components; the server-only ledger logic (which pulls in Prisma)
// lives in lib/api/giftCards.ts and re-exports these for server callers.

// Purchase amount guardrails (cents). Presets drive the buy form; the min/max
// bound any custom amount. Kept here so the form and the server action
// validate against the same numbers.
export const GIFT_CARD_PRESETS_CENTS = [2500, 5000, 10000, 20000] as const;
export const GIFT_CARD_MIN_CENTS = 1000; // $10
export const GIFT_CARD_MAX_CENTS = 100000; // $1,000

// Whole-dollar when even, cents otherwise ("$100", "$74.50").
export function formatCents(cents: number): string {
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;
}

// Unambiguous alphabet — no 0/O/1/I/L so a hand-typed code is unmistakable.
// It lives here rather than next to the generator so the shape check below is
// client-safe and validates against the exact character set codes are minted
// from. 32 chars × 12 positions = 60 bits of entropy per code.
export const GIFT_CARD_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const GIFT_CARD_CODE_GROUPS = 3;
export const GIFT_CARD_CODE_GROUP_LEN = 4;

// Codes are stored uppercased with single dash separators. Accept loose input
// (spaces, lowercase, missing dashes) and re-canonicalize.
export function normalizeGiftCardCode(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const groups: string[] = [];
  for (let i = 0; i < cleaned.length; i += GIFT_CARD_CODE_GROUP_LEN) {
    groups.push(cleaned.slice(i, i + GIFT_CARD_CODE_GROUP_LEN));
  }
  return groups.join("-");
}

const CODE_SHAPE = new RegExp(
  `^[${GIFT_CARD_CODE_ALPHABET}]{${GIFT_CARD_CODE_GROUP_LEN}}` +
    `(?:-[${GIFT_CARD_CODE_ALPHABET}]{${GIFT_CARD_CODE_GROUP_LEN}})` +
    `{${GIFT_CARD_CODE_GROUPS - 1}}$`,
);

// Does a *normalized* code match the canonical minted shape (XXXX-XXXX-XXXX
// over the alphabet above)? Every code-taking entry point checks this before
// touching the database or Stripe, so junk input is rejected for free and the
// per-IP guess budget is spent only on plausible codes.
export function isGiftCardCodeShape(normalized: string): boolean {
  return CODE_SHAPE.test(normalized);
}
