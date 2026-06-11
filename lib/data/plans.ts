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
  },
  {
    id: "standard",
    name: "Standard",
    price: 12,
    period: "month",
    features: [
      "Unlimited listings",
      "Verified seller badge",
      "Customer reviews",
      "Priority in search results",
      "Sales analytics dashboard",
    ],
    popular: true,
    transactionFee: "5% per sale",
    targetType: "goods",
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    period: "month",
    features: [
      "Everything in Standard",
      "Featured placement in categories",
      "Reduced 3% transaction fee",
      "Advanced analytics",
      "Priority seller support",
      "Early access to new features",
    ],
    popular: false,
    transactionFee: "3% per sale",
    targetType: "goods",
  },
];

export const servicePlanIncludes = [
  "Service profile",
  "Verified badge (pending CodaCo approval)",
  "CodaCo messaging",
  "Direct client payments through CodaCo",
  "Client reviews",
];

export const servicePlans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: null,
    period: null,
    trial: "Free for 3 months",
    features: [],
    popular: false,
    transactionFee: "",
    targetType: "services",
  },
  {
    id: "standard",
    name: "Monthly",
    price: 15,
    period: "month",
    features: ["Cancel any time"],
    popular: true,
    transactionFee: "",
    targetType: "services",
  },
  {
    id: "pro",
    name: "Annual",
    price: 160,
    period: "year",
    features: ["Save $20 vs. paying monthly", "Priority support"],
    popular: false,
    transactionFee: "",
    targetType: "services",
  },
];

// Compact price label for a plan card ("Free for 3 months", "$15/mo",
// "$160/yr"). Keeps the signup form and the standalone /plan page in sync.
export function planPriceLabel(plan: Plan): string {
  if (plan.trial) return plan.trial;
  if (plan.price == null) return "Free";
  const suffix = plan.period === "month" ? "/mo" : plan.period === "year" ? "/yr" : "";
  return `$${plan.price}${suffix}`;
}
