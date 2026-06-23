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

const CODE_GROUP_LEN = 4;

// Codes are stored uppercased with single dash separators. Accept loose input
// (spaces, lowercase, missing dashes) and re-canonicalize.
export function normalizeGiftCardCode(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const groups: string[] = [];
  for (let i = 0; i < cleaned.length; i += CODE_GROUP_LEN) {
    groups.push(cleaned.slice(i, i + CODE_GROUP_LEN));
  }
  return groups.join("-");
}
