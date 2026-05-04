import type { LifeStage } from "@/lib/types";

export const LIFE_STAGES: { value: LifeStage; label: string }[] = [
  { value: "planning-ahead", label: "Planning ahead" },
  { value: "active-dying", label: "Active dying" },
  { value: "post-death", label: "Post-death" },
  { value: "throughout", label: "Relevant throughout" },
];

const LABELS: Record<LifeStage, string> = Object.fromEntries(
  LIFE_STAGES.map((s) => [s.value, s.label]),
) as Record<LifeStage, string>;

export function lifeStageLabel(stage: LifeStage): string {
  return LABELS[stage];
}

// Filter helper shared by getVendors / getProducts.
// "throughout" tagged entries match any specific-stage filter, so vendors
// who serve all phases don't disappear when a user narrows by phase.
export function matchesLifeStage(
  entryStages: LifeStage[],
  filter: LifeStage | undefined,
): boolean {
  if (!filter) return true;
  if (entryStages.includes(filter)) return true;
  if (filter !== "throughout" && entryStages.includes("throughout")) return true;
  return false;
}
