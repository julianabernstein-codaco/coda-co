"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type { SubscriptionPlanId } from "@prisma/client";
import { requireVendor } from "../lib";
import { getPlan } from "@/lib/api/plans";
import { CURRENCY, checkoutLineItem } from "@/lib/billing/catalog";
import { ensureStripeCustomer } from "@/lib/billing/customer";
import { syncStripeSubscription } from "@/lib/billing/sync";
import { paidFlowsOpenFor } from "@/lib/launch";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { log } from "@/lib/log";

export interface CheckoutResult {
  url?: string;
  error?: string;
}

// For in-place actions (no Stripe redirect) — the page refreshes on ok.
export interface ActionResult {
  ok?: boolean;
  error?: string;
}

async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

// Start a recurring subscription Checkout for a vendor (goods or services).
// planId picks the cadence: "standard" = Monthly, "pro" = Annual. The
// subscription row is reconciled by the webhook on completion — never here.
export async function startSubscriptionCheckout(
  planId: SubscriptionPlanId,
): Promise<CheckoutResult> {
  if (!isStripeConfigured()) return { error: "Billing is not configured yet." };
  const { user, vendor } = await requireVendor();
  // Pre-launch: paid plans are locked; vendors run on the free trial. Admins
  // bypass so the team can validate live billing before launch.
  if (!(await paidFlowsOpenFor(user.role))) {
    return { error: "Paid plans open at launch — you're on the free trial until then." };
  }

  const kind = vendor.kind === "services" ? "services" : "goods";
  const plan = getPlan(kind, planId);
  if (!plan || plan.billingType !== "recurring") {
    return { error: "Pick a billing cycle." };
  }

  try {
    const customerId = await ensureStripeCustomer(vendor.id);
    const origin = await getOrigin();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [checkoutLineItem(plan)],
      success_url: `${origin}/dashboard/billing?status=success`,
      cancel_url: `${origin}/dashboard/billing?status=cancelled`,
      metadata: { vendorId: vendor.id, planId, kind },
      subscription_data: { metadata: { vendorId: vendor.id, planId, kind } },
    });
    log.info("billing.subscription_checkout_created", { vendorId: vendor.id, planId, kind, sessionId: session.id });
    return { url: session.url ?? undefined };
  } catch (err) {
    log.error("billing.subscription_checkout_failed", { vendorId: vendor.id, err });
    return { error: "Could not start checkout. Try again." };
  }
}

// Upgrade a monthly subscription to the annual plan in place —
// no new Checkout, no re-entering card details. Switches the subscription
// item to an annual price (created inline, since plans live in code) and
// prorates the difference. Synced back immediately so the page reflects it.
export async function upgradeToAnnual(): Promise<ActionResult> {
  if (!isStripeConfigured()) return { error: "Billing is not configured yet." };
  const { vendor } = await requireVendor();
  const kind = vendor.kind === "services" ? "services" : "goods";

  const sub = vendor.subscriptions.find(
    (s) => s.kind === kind && s.stripeSubscriptionId,
  );
  if (!sub?.stripeSubscriptionId) return { error: "No active subscription to upgrade." };
  if (sub.interval === "year") return { error: "You're already on the annual plan." };

  const annual = getPlan(kind, "pro");
  if (!annual?.amountCents) return { error: "The annual plan is unavailable." };

  try {
    const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
    const price = await stripe.prices.create({
      currency: CURRENCY,
      unit_amount: annual.amountCents,
      recurring: { interval: "year" },
      product_data: { name: `CodaCo ${kind === "services" ? "Services" : "Goods"} — Annual` },
    });
    const updated = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      items: [{ id: stripeSub.items.data[0].id, price: price.id }],
      proration_behavior: "create_prorations",
      // Keep metadata in sync so the webhook/reconcile records the new plan.
      metadata: { vendorId: vendor.id, planId: "pro", kind },
    });
    await syncStripeSubscription(updated);
    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard");
    log.info("billing.upgraded_to_annual", { vendorId: vendor.id, kind });
    return { ok: true };
  } catch (err) {
    log.error("billing.upgrade_failed", { vendorId: vendor.id, err });
    return { error: "Could not upgrade. Try again." };
  }
}

// Cancel the subscription at the end of the current billing period
// (keeps access until then). Stripe leaves status "active" with
// cancel_at_period_end until the period ends; the billing page reads that
// flag live to show the scheduled cancellation.
export async function cancelSubscription(): Promise<ActionResult> {
  if (!isStripeConfigured()) return { error: "Billing is not configured yet." };
  const { vendor } = await requireVendor();
  const kind = vendor.kind === "services" ? "services" : "goods";

  const sub = vendor.subscriptions.find(
    (s) => s.kind === kind && s.stripeSubscriptionId,
  );
  if (!sub?.stripeSubscriptionId) return { error: "No active subscription to cancel." };

  try {
    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard");
    log.info("billing.cancel_scheduled", { vendorId: vendor.id });
    return { ok: true };
  } catch (err) {
    log.error("billing.cancel_failed", { vendorId: vendor.id, err });
    return { error: "Could not cancel. Try again." };
  }
}

// Open the Stripe Billing Portal so a subscribed vendor can update their
// card, switch plans, or cancel without UI we have to build.
export async function openBillingPortal(): Promise<CheckoutResult> {
  if (!isStripeConfigured()) return { error: "Billing is not configured yet." };
  const { vendor } = await requireVendor();
  if (!vendor.stripeCustomerId) return { error: "No billing account yet." };

  try {
    const origin = await getOrigin();
    const session = await stripe.billingPortal.sessions.create({
      customer: vendor.stripeCustomerId,
      return_url: `${origin}/dashboard/billing`,
    });
    return { url: session.url };
  } catch (err) {
    log.error("billing.portal_failed", { vendorId: vendor.id, err });
    return { error: "Could not open the billing portal. Try again." };
  }
}
