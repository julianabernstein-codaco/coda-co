"use client";

import { useFilterParams } from "@/lib/hooks/useFilterParams";
import { FilterPill } from "@/components/ui/filters/FilterPill";
import { LIFE_STAGES } from "@/lib/format/lifeStage";

interface LifeStageChipsProps {
  label?: string;
  className?: string;
}

export function LifeStageChips({ label = "Relevance:", className = "" }: LifeStageChipsProps) {
  const { get, setParam } = useFilterParams();
  const active = get("lifeStage");

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <span className="text-[13px] text-cl mr-1">{label}</span>
      <FilterPill
        label="Any stage"
        active={!active}
        onClick={() => setParam("lifeStage", "")}
      />
      {LIFE_STAGES.map((s) => (
        <FilterPill
          key={s.value}
          label={s.label}
          active={active === s.value}
          onClick={() => setParam("lifeStage", active === s.value ? "" : s.value)}
        />
      ))}
    </div>
  );
}
