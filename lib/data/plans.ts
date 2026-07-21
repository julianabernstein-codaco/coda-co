import type { Plan } from "@/lib/types";

// Shown once above the goods plan cards (signup + /plan page) — the
// features every goods plan shares, so each card only lists what differs.
export const goodsPlanIncludes = [
  "Shop profile",
  "Unlimited listings",
  "Buyer messaging",
  "Direct payments through CodaCo",
  "Customer reviews",
];

// Goods Makers subscribe on the same three recurring tiers as Service
// Vendors: a 3-month free trial (Starter), then Monthly or Annual. No
// per-sale percentage fee. Billing is plan-driven — `amountCents` +
// `billingType` + `period` drive Stripe Checkout (see lib/billing/catalog).
export const goodsPlans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: null,
    period: null,
    trial: "Free for 3 months",
    features: [
      "Risk free trial with all of the features",
      "Then sign up for a monthly or annual plan",
    ],
    popular: false,
    transactionFee: "",
    targetType: "goods",
    billingType: "free",
  },
  {
    id: "standard",
    name: "Monthly",
    price: 29,
    period: "month",
    features: ["Cancel any time"],
    popular: true,
    transactionFee: "",
    targetType: "goods",
    billingType: "recurring",
    amountCents: 2900,
  },
  {
    id: "pro",
    name: "Annual",
    price: 320,
    period: "year",
    features: ["Save 8%"],
    popular: false,
    transactionFee: "",
    targetType: "goods",
    billingType: "recurring",
    amountCents: 32000,
  },
];

export const servicePlanIncludes = [
  "Service profile",
  "Verified badge (pending CodaCo approval)",
  "CodaCo messaging",
  "Direct client payments through CodaCo",
  "Client reviews",
];

// Reassurance shown under the recurring plan choices (signup, /plan page,
// and dashboard billing) for both goods and services. Monthly and Annual
// auto-renew.
export const planRenewalNote =
  "We'll always notify you before renewal.";

export const servicePlans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: null,
    period: null,
    trial: "Free for 3 months",
    features: [
      "Risk free trial with all of the features",
      "Then sign up for a monthly or annual plan",
    ],
    popular: false,
    transactionFee: "",
    targetType: "services",
    billingType: "free",
  },
  {
    id: "standard",
    name: "Monthly",
    price: 29,
    period: "month",
    features: ["Cancel any time"],
    popular: true,
    transactionFee: "",
    targetType: "services",
    billingType: "recurring",
    amountCents: 2900,
  },
  {
    id: "pro",
    name: "Annual",
    price: 320,
    period: "year",
    features: ["Save 8%"],
    popular: false,
    transactionFee: "",
    targetType: "services",
    billingType: "recurring",
    amountCents: 32000,
  },
];

// Compact price label for a plan card ("Free for 3 months", "$29/mo",
// "$320/yr"). Keeps the signup form and the standalone /plan page in sync.
export function planPriceLabel(plan: Plan): string {
  if (plan.trial) return plan.trial;
  if (plan.price == null) return "Free";
  const suffix = plan.period === "month" ? "/mo" : plan.period === "year" ? "/yr" : "";
  return `$${plan.price}${suffix}`;
}
