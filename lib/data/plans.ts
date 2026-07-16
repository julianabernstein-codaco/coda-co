import type { Plan } from "@/lib/types";

export const goodsPlans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: null,
    period: null,
    features: [
      "Up to 3 product listings",
      "CodaCo marketplace visibility",
      "Buyer messaging",
      "Basic analytics",
    ],
    popular: false,
    transactionFee: "5% per sale",
    targetType: "goods",
    billingType: "free",
  },
  {
    id: "standard",
    name: "Storefront",
    // One-time set-up fee, not a recurring subscription — `period: null`
    // renders the price as a bare "$29" with no "/month" suffix.
    price: 29,
    period: null,
    features: [
      "One-time set-up fee — no monthly cost",
      "Unlimited listings",
      "Customer reviews",
    ],
    popular: false,
    transactionFee: "5% per sale",
    targetType: "goods",
    billingType: "one_time",
    amountCents: 2900,
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
// and dashboard billing). Both Monthly and Annual auto-renew.
export const servicePlanRenewalNote =
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
