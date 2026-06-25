import { prisma } from "@/lib/db";

// The three ways a signer can relate to CodaCo at launch. Mirrors the
// `WaitlistInterest` enum's real members (the schema also carries an
// `unknown` default for rows where it was never captured — not offered
// in the form).
export type WaitlistInterest = "customer" | "vendor" | "maker";

export const WAITLIST_INTERESTS: readonly WaitlistInterest[] = [
  "customer",
  "vendor",
  "maker",
];

export function isWaitlistInterest(value: string): value is WaitlistInterest {
  return (WAITLIST_INTERESTS as readonly string[]).includes(value);
}

// Display labels for the three captured interests plus the `unknown`
// fallback (a row predating the form, or one where the value was lost).
// Keyed by the full enum so the admin view can render any stored value.
export const WAITLIST_INTEREST_LABELS: Record<
  WaitlistInterest | "unknown",
  string
> = {
  customer: "Customer",
  vendor: "Vendor",
  maker: "Maker",
  unknown: "Unspecified",
};

export interface WaitlistSignupRow {
  id: string;
  email: string;
  interest: WaitlistInterest | "unknown";
  createdAt: Date;
  updatedAt: Date;
}

// Full signup list for the admin view / CSV export, newest first.
export async function getWaitlistSignups(): Promise<WaitlistSignupRow[]> {
  return prisma.waitlistSignup.findMany({
    orderBy: { createdAt: "desc" },
  });
}

// Per-interest tallies for the admin summary cards. Returns every enum
// member (including `unknown`) so the labels and counts stay aligned even
// when an interest has zero signups.
export async function getWaitlistInterestCounts(): Promise<
  Record<WaitlistInterest | "unknown", number>
> {
  const grouped = await prisma.waitlistSignup.groupBy({
    by: ["interest"],
    _count: { _all: true },
  });
  const counts: Record<WaitlistInterest | "unknown", number> = {
    customer: 0,
    vendor: 0,
    maker: 0,
    unknown: 0,
  };
  for (const row of grouped) {
    counts[row.interest] = row._count._all;
  }
  return counts;
}

// Capture a pre-launch signup. Idempotent on email: re-submitting with a
// different interest updates the row rather than failing the unique
// constraint, so someone can correct their selection without a duplicate.
// `created` reflects whether this was a brand-new signer (drives the
// "you're on the list" vs "we've updated your spot" copy).
export async function createWaitlistSignup(input: {
  email: string;
  // `unknown` is a valid stored value — it's what we record when the
  // signer didn't pick an interest (the field is optional in the form).
  interest: WaitlistInterest | "unknown";
}): Promise<{ created: boolean }> {
  const existing = await prisma.waitlistSignup.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  await prisma.waitlistSignup.upsert({
    where: { email: input.email },
    create: { email: input.email, interest: input.interest },
    update: { interest: input.interest },
  });

  return { created: !existing };
}
