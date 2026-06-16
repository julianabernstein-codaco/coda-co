import type Stripe from "stripe";
import type { SubscriptionPlanId } from "@prisma/client";
import { prisma } from "@/lib/db";
import { log } from "@/lib/log";
import { mapStripeInterval, mapStripeStatus } from "./catalog";

function planIdFromMetadata(meta: Stripe.Metadata | null): SubscriptionPlanId | undefined {
  const raw = meta?.planId;
  if (raw === "standard" || raw === "pro" || raw === "starter") return raw;
  return undefined;
}

// current_period_end moved from the subscription onto the item in 2025 API
// versions — check both.
function periodEnd(sub: Stripe.Subscription): Date | null {
  const item = sub.items?.data?.[0] as { current_period_end?: number } | undefined;
  const unix =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    item?.current_period_end;
  return unix ? new Date(unix * 1000) : null;
}

// Reconcile a Stripe Subscription (services, recurring) into our
// subscriptions table. Stripe is the source of truth; we project its state
// onto the vendor's services row. Idempotent — safe on any webhook event.
export async function syncStripeSubscription(sub: Stripe.Subscription): Promise<void> {
  const vendorId = sub.metadata?.vendorId;
  if (!vendorId) {
    log.warn("billing.sync_missing_vendor", { stripeSubscriptionId: sub.id });
    return;
  }

  const item = sub.items.data[0];
  const data = {
    vendorId,
    kind: "services" as const,
    status: mapStripeStatus(sub.status),
    interval: mapStripeInterval(item?.price.recurring?.interval ?? undefined),
    stripeSubscriptionId: sub.id,
    stripePriceId: item?.price.id ?? null,
    currentPeriodEnd: periodEnd(sub),
    ...(planIdFromMetadata(sub.metadata) ? { planId: planIdFromMetadata(sub.metadata)! } : {}),
  };

  // A services vendor has one subscription row, created at approval as
  // "incomplete". Match by stripeSubscriptionId once linked, else the
  // vendor's existing services row, else create.
  const existing =
    (await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: sub.id },
      select: { id: true },
    })) ??
    (await prisma.subscription.findFirst({
      where: { vendorId, kind: "services" },
      select: { id: true },
    }));

  if (existing) {
    await prisma.subscription.update({ where: { id: existing.id }, data });
  } else {
    await prisma.subscription.create({
      data: { ...data, planId: planIdFromMetadata(sub.metadata) ?? "unknown" },
    });
  }
  log.info("billing.subscription_synced", {
    vendorId,
    stripeSubscriptionId: sub.id,
    status: data.status,
  });
}

// Settle a goods set-up fee after its one-time payment completes: flip the
// vendor's pending VendorPayment to paid and record the Stripe references.
// Idempotent — re-running only touches still-pending rows.
export async function markSetupFeePaid(
  vendorId: string,
  paymentIntentId: string | null,
  customerId: string | null,
): Promise<void> {
  const result = await prisma.vendorPayment.updateMany({
    where: { vendorId, type: "setup_fee", status: "pending" },
    data: {
      status: "paid",
      paidAt: new Date(),
      stripePaymentIntentId: paymentIntentId,
      stripeCustomerId: customerId,
    },
  });
  log.info("billing.setup_fee_paid", { vendorId, paymentIntentId, updated: result.count });
}
