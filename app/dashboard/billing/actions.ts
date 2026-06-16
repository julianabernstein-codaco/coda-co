"use server";

import { headers } from "next/headers";
import type { SubscriptionPlanId } from "@prisma/client";
import { requireVendor } from "../lib";
import { getPlan } from "@/lib/api/plans";
import { checkoutLineItem } from "@/lib/billing/catalog";
import { ensureStripeCustomer } from "@/lib/billing/customer";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { log } from "@/lib/log";

export interface CheckoutResult {
  url?: string;
  error?: string;
}

async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

// Start a recurring subscription Checkout for a services vendor. planId
// picks the cadence: "standard" = Monthly, "pro" = Annual. The subscription
// row is reconciled by the webhook on completion — never here.
export async function startServiceSubscriptionCheckout(
  planId: SubscriptionPlanId,
): Promise<CheckoutResult> {
  if (!isStripeConfigured()) return { error: "Billing is not configured yet." };
  const { vendor } = await requireVendor();
  if (vendor.kind === "goods") return { error: "Goods vendors don't use a subscription." };

  const plan = getPlan("services", planId);
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
      metadata: { vendorId: vendor.id, planId, kind: "services" },
      subscription_data: { metadata: { vendorId: vendor.id, planId, kind: "services" } },
    });
    log.info("billing.service_checkout_created", { vendorId: vendor.id, planId, sessionId: session.id });
    return { url: session.url ?? undefined };
  } catch (err) {
    log.error("billing.service_checkout_failed", { vendorId: vendor.id, err });
    return { error: "Could not start checkout. Try again." };
  }
}

// Start a one-time Checkout for the goods "Storefront" set-up fee. The
// vendor's pending VendorPayment is settled by the webhook on completion.
export async function startGoodsSetupCheckout(): Promise<CheckoutResult> {
  if (!isStripeConfigured()) return { error: "Billing is not configured yet." };
  const { vendor } = await requireVendor();
  if (vendor.kind === "services") return { error: "Services vendors don't pay a set-up fee." };

  const pending = vendor.payments.find(
    (p) => p.type === "setup_fee" && p.status === "pending",
  );
  if (!pending) return { error: "No set-up fee is due." };

  const plan = getPlan("goods", "standard");
  if (!plan || plan.billingType !== "one_time") {
    return { error: "Set-up fee is unavailable." };
  }

  try {
    const customerId = await ensureStripeCustomer(vendor.id);
    const origin = await getOrigin();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [checkoutLineItem(plan)],
      success_url: `${origin}/dashboard/billing?status=success`,
      cancel_url: `${origin}/dashboard/billing?status=cancelled`,
      metadata: { vendorId: vendor.id, kind: "goods_setup" },
      payment_intent_data: { metadata: { vendorId: vendor.id, kind: "goods_setup" } },
    });
    log.info("billing.goods_setup_checkout_created", { vendorId: vendor.id, sessionId: session.id });
    return { url: session.url ?? undefined };
  } catch (err) {
    log.error("billing.goods_setup_checkout_failed", { vendorId: vendor.id, err });
    return { error: "Could not start checkout. Try again." };
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
