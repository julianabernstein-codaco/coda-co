"use client";

import { useFilterParams } from "@/lib/hooks/useFilterParams";
import { FilterPill } from "@/components/ui/filters/FilterPill";
import { FilterPillGroup } from "@/components/ui/filters/FilterPillGroup";
import { FilterSection } from "@/components/ui/filters/FilterSection";
import { LIFE_STAGES } from "@/lib/format/lifeStage";

interface LifeStageChipsProps {
  label?: string;
  /**
   * `row` (default) — inline "Relevance: [chips]" strip for use above a
   * results grid. `stack` — a headed section sized for a filter rail,
   * matching the other <FilterSection> blocks around it.
   */
  layout?: "row" | "stack";
  className?: string;
}

export function LifeStageChips({
  label,
  layout = "row",
  className = "",
}: LifeStageChipsProps) {
  const { get, setParam } = useFilterParams();
  const raw = get("lifeStage");
  const active = raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];

  function toggle(value: string) {
    const next = active.includes(value)
      ? active.filter((v) => v !== value)
      : [...active, value];
    setParam("lifeStage", next.join(","));
  }

  const pills = (
    <>
      <FilterPill
        label="Any stage"
        active={active.length === 0}
        onClick={() => setParam("lifeStage", "")}
      />
      {LIFE_STAGES.map((s) => (
        <FilterPill
          key={s.value}
          label={s.label}
          active={active.includes(s.value)}
          onClick={() => toggle(s.value)}
        />
      ))}
    </>
  );

  if (layout === "stack") {
    return (
      <div className={className}>
        <FilterSection heading={label ?? "Relevance"}>
          <FilterPillGroup>{pills}</FilterPillGroup>
        </FilterSection>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <span className="text-[15px] text-cl mr-1">{label ?? "Relevance:"}</span>
      {pills}
    </div>
  );
}
