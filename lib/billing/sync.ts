import type Stripe from "stripe";
import type { SubscriptionPlanId } from "@prisma/client";
import { prisma } from "@/lib/db";
import { stripe, isStripeConfigured } from "@/lib/stripe";
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

// Reconcile a Stripe Subscription (goods or services, recurring) into our
// subscriptions table. Stripe is the source of truth; we project its state
// onto the vendor's row for that kind. Idempotent — safe on any webhook
// event. The kind is carried in the subscription metadata (set at Checkout).
export async function syncStripeSubscription(sub: Stripe.Subscription): Promise<void> {
  const vendorId = sub.metadata?.vendorId;
  if (!vendorId) {
    log.warn("billing.sync_missing_vendor", { stripeSubscriptionId: sub.id });
    return;
  }
  const kind: "goods" | "services" =
    sub.metadata?.kind === "goods" ? "goods" : "services";

  const item = sub.items.data[0];
  const data = {
    vendorId,
    kind,
    status: mapStripeStatus(sub.status),
    interval: mapStripeInterval(item?.price.recurring?.interval ?? undefined),
    stripeSubscriptionId: sub.id,
    stripePriceId: item?.price.id ?? null,
    currentPeriodEnd: periodEnd(sub),
    ...(planIdFromMetadata(sub.metadata) ? { planId: planIdFromMetadata(sub.metadata)! } : {}),
  };

  // A vendor has one subscription row per kind, created at approval as
  // "incomplete". Match by stripeSubscriptionId once linked, else the
  // vendor's existing row for this kind, else create.
  const existing =
    (await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: sub.id },
      select: { id: true },
    })) ??
    (await prisma.subscription.findFirst({
      where: { vendorId, kind },
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

// Self-heal: pull the vendor's current subscription straight from Stripe
// and sync it. Used on the billing page when a webhook may have been
// missed (e.g. the endpoint isn't configured yet), so a refresh reflects
// reality instead of sitting at "incomplete" forever. Kind-agnostic — the
// synced subscription carries its own kind in metadata. Best-effort —
// never throws into the page render.
export async function reconcileSubscription(
  vendorId: string,
  stripeCustomerId: string | null,
): Promise<void> {
  if (!isStripeConfigured() || !stripeCustomerId) return;
  try {
    const subs = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 1,
    });
    const sub = subs.data[0];
    if (sub) await syncStripeSubscription(sub);
  } catch (err) {
    log.warn("billing.reconcile_failed", { vendorId, err });
  }
}

// Fetch the live Stripe subscription for display-only state the
// webhook/reconcile doesn't persist locally (e.g. cancel-at-period-end).
// Best-effort — returns null on any error so it never breaks the page.
export async function getLiveSubscription(
  stripeSubscriptionId: string,
): Promise<Stripe.Subscription | null> {
  if (!isStripeConfigured()) return null;
  try {
    return await stripe.subscriptions.retrieve(stripeSubscriptionId);
  } catch (err) {
    log.warn("billing.retrieve_failed", { stripeSubscriptionId, err });
    return null;
  }
}
