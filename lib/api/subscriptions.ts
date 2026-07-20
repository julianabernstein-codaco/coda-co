import { prisma } from "@/lib/db";

// The soft services trial runs for 3 months from the day the vendor's listing
// goes live. No Stripe object backs it (see docs/go-live-plan.md); the vendor
// converts to a paid monthly/annual plan via Checkout before it ends.
export const TRIAL_MONTHS = 3;

// trialEndsAt = start + TRIAL_MONTHS. Uses setMonth, which rolls the year
// over correctly (e.g. Nov + 3 → Feb) and clamps day-of-month for short
// months (e.g. Nov 30 + 3 → Feb 28/29).
export function trialEndFrom(start: Date): Date {
  const end = new Date(start);
  end.setMonth(end.getMonth() + TRIAL_MONTHS);
  return end;
}

// Start the free trial on a services vendor's pending subscription. Called by
// the go-live switch (Phase 4) when a pre_launch vendor is published. Scoped
// to `incomplete` services rows that haven't already started a trial, so it's
// idempotent and never touches a paid (`active`) or already-`trialing` row.
// Returns the number of subscriptions updated (0 or 1 in practice).
export async function startServicesTrial(
  vendorId: string,
  now: Date = new Date(),
): Promise<number> {
  const { count } = await prisma.subscription.updateMany({
    where: {
      vendorId,
      kind: "services",
      status: "incomplete",
      trialStartedAt: null,
    },
    data: {
      status: "trialing",
      trialStartedAt: now,
      trialEndsAt: trialEndFrom(now),
    },
  });
  return count;
}
