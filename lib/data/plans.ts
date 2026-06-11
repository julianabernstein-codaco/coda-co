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
    name: "Storefront",
    // One-time set-up fee, not a recurring subscription — `period: null`
    // renders the price as a bare "$28" with no "/month" suffix.
    price: 28,
    period: null,
    features: [
      "One-time set-up fee — no monthly cost",
      "Unlimited listings",
      "Customer reviews",
    ],
    popular: false,
    transactionFee: "5% per sale",
    targetType: "goods",
  },
];

export const servicePlans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: null,
    period: null,
    trial: "Free for 3 months",
    features: [
      "Service profile",
      "CodaCo messaging",
      "Direct client payments through CodaCo",
    ],
    popular: false,
    transactionFee: "",
    targetType: "services",
  },
  {
    id: "standard",
    name: "Standard",
    price: 14,
    period: "month",
    priceYearly: 150,
    features: [
      "Everything in Starter",
      "Verified badge (pending CodaCo verification)",
      "Client reviews",
    ],
    popular: true,
    transactionFee: "",
    targetType: "services",
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    period: "month",
    priceYearly: 320,
    features: [
      "Everything in Standard",
      "Unlimited service profiles",
      "Priority support",
      "Direct scheduling through CodaCo",
    ],
    popular: false,
    transactionFee: "",
    targetType: "services",
  },
];
