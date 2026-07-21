import type Stripe from "stripe";
import type {
  SubscriptionInterval,
  SubscriptionStatus,
} from "@prisma/client";
import type { Plan } from "@/lib/types";

// Billing reads everything off the code-defined plans (lib/data/plans.ts):
// `amountCents` is the charge and `billingType` decides the Stripe object.
// Goods and services both use a recurring Subscription (`recurring`); the
// `one_time` PaymentIntent branch is still supported but unused by current
// plans. Because amounts live in code we drive Checkout with inline
// `price_data` (no pre-created Stripe Products/Prices, no price-id env vars).

export const CURRENCY = "usd";

// Recurring interval for a service plan, from its display period.
export function planInterval(plan: Plan): SubscriptionInterval {
  if (plan.period === "month") return "month";
  if (plan.period === "year") return "year";
  return "unknown";
}

// One Checkout line item built from a plan. `recurring` plans get a
// subscription price; a `one_time` plan (unused today) gets a flat charge.
export function checkoutLineItem(plan: Plan): Stripe.Checkout.SessionCreateParams.LineItem {
  if (!plan.amountCents || plan.amountCents <= 0) {
    throw new Error(`Plan ${plan.id} has no chargeable amount`);
  }
  const recurring =
    plan.billingType === "recurring" && plan.period
      ? { recurring: { interval: plan.period } as const }
      : {};
  return {
    quantity: 1,
    price_data: {
      currency: CURRENCY,
      unit_amount: plan.amountCents,
      product_data: {
        name: `CodaCo ${plan.targetType === "services" ? "Services" : "Goods"} — ${plan.name}`,
      },
      ...recurring,
    },
  };
}

// ── Stripe → local mapping ───────────────────────────────────────────────────

export function mapStripeStatus(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case "incomplete":
      return "incomplete";
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "paused":
      return "past_due";
    case "unpaid":
      return "unpaid";
    case "canceled":
    case "incomplete_expired":
      return "cancelled";
    default:
      return "unknown";
  }
}

export function mapStripeInterval(interval: string | undefined): SubscriptionInterval {
  if (interval === "month") return "month";
  if (interval === "year") return "year";
  return "unknown";
}
