import type { LifeStage } from "@/lib/types";

export const LIFE_STAGES: { value: LifeStage; label: string }[] = [
  { value: "planning-ahead", label: "Planning ahead" },
  { value: "active-dying", label: "Active dying" },
  { value: "post-death", label: "Post-death" },
  { value: "throughout", label: "Relevant throughout" },
];

const VALID_VALUES = new Set<LifeStage>(LIFE_STAGES.map((s) => s.value));

const LABELS: Record<LifeStage, string> = Object.fromEntries(
  LIFE_STAGES.map((s) => [s.value, s.label]),
) as Record<LifeStage, string>;

export function lifeStageLabel(stage: LifeStage): string {
  return LABELS[stage];
}

// Parse a comma-separated lifeStage URL param into a typed array. Returns
// undefined when no valid values are present so callers can short-circuit.
export function parseLifeStageParam(raw: string | undefined): LifeStage[] | undefined {
  if (!raw) return undefined;
  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter((p): p is LifeStage => VALID_VALUES.has(p as LifeStage));
  return parts.length ? parts : undefined;
}

// Filter helper shared by getVendors / getProducts.
// "throughout" tagged entries match any specific-stage filter, so vendors
// who serve all phases don't disappear when a user narrows by phase.
// Accepts a single stage or a list — list semantics are OR (entry matches
// if it satisfies any of the requested stages).
export function matchesLifeStage(
  entryStages: LifeStage[],
  filter: LifeStage | LifeStage[] | undefined,
): boolean {
  if (!filter) return true;
  const filters = Array.isArray(filter) ? filter : [filter];
  if (filters.length === 0) return true;
  return filters.some(
    (f) =>
      entryStages.includes(f) ||
      (f !== "throughout" && entryStages.includes("throughout")),
  );
}

