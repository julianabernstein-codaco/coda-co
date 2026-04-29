import { goodsPlans, servicePlans } from "@/lib/data/plans";
import type { Plan } from "@/lib/types";

export async function getPlans(type: "goods" | "services"): Promise<Plan[]> {
  return type === "goods" ? goodsPlans : servicePlans;
}
