"use client";

import { useFilterParams } from "@/lib/hooks/useFilterParams";
import { FilterPill } from "@/components/ui/filters/FilterPill";
import { FilterPillGroup } from "@/components/ui/filters/FilterPillGroup";
import { FilterCheck } from "@/components/ui/filters/FilterCheck";
import { FilterSection } from "@/components/ui/filters/FilterSection";
import { FilterDivider } from "@/components/ui/filters/FilterDivider";
import type { ServiceTypeOption } from "@/lib/api/serviceTypes";
import { SPECIALIZATIONS } from "@/lib/data/specializations";

export function ServiceFilters({ serviceTypes }: { serviceTypes: ServiceTypeOption[] }) {
  const { get, setParam, clearAll } = useFilterParams();

  const activeType = get("type");
  const rawSpecs = get("specializations");
  const activeSpecs = rawSpecs ? rawSpecs.split(",").map((s) => s.trim()).filter(Boolean) : [];

  function toggleSpec(value: string) {
    const next = activeSpecs.includes(value)
      ? activeSpecs.filter((v) => v !== value)
      : [...activeSpecs, value];
    setParam("specializations", next.join(","));
  }
  const activeLocation = get("locationType");

  return (
    <div className="pt-6 pr-5 pb-8 border-r border-line">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[15px] font-medium text-ch">Filters</span>
        <button
          onClick={clearAll}
          className="text-[14px] text-ink bg-transparent border-0 font-sans cursor-pointer underline hover:text-tr"
        >
          Clear all
        </button>
      </div>

      <FilterSection heading="Service type">
        <FilterPillGroup>
          {serviceTypes.map((t) => (
            <FilterPill
              key={t.slug}
              label={t.name}
              active={activeType === t.slug}
              onClick={() => setParam("type", activeType === t.slug ? "" : t.slug)}
            />
          ))}
        </FilterPillGroup>
      </FilterSection>

      <FilterDivider />

      <FilterSection heading="Format">
        <FilterCheck
          label="Available this month"
          checked={false}
          onChange={() => {}}
        />
        <FilterCheck
          label="Virtual sessions"
          checked={activeLocation === "virtual"}
          onChange={() =>
            setParam("locationType", activeLocation === "virtual" ? "" : "virtual")
          }
        />
        <FilterCheck
          label="Home visits"
          checked={activeLocation === "in_person"}
          onChange={() =>
            setParam("locationType", activeLocation === "in_person" ? "" : "in_person")
          }
        />
      </FilterSection>

      <FilterDivider />

      <FilterSection heading="Specializations">
        {SPECIALIZATIONS.map((s) => (
          <FilterCheck
            key={s}
            label={s}
            checked={activeSpecs.includes(s)}
            onChange={() => toggleSpec(s)}
          />
        ))}
      </FilterSection>
    </div>
  );
}
