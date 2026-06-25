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

// Capture a pre-launch signup. Idempotent on email: re-submitting with a
// different interest updates the row rather than failing the unique
// constraint, so someone can correct their selection without a duplicate.
// `created` reflects whether this was a brand-new signer (drives the
// "you're on the list" vs "we've updated your spot" copy).
export async function createWaitlistSignup(input: {
  email: string;
  interest: WaitlistInterest;
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
