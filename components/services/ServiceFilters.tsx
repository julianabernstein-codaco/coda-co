"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const SERVICE_TYPES = [
  { value: "doula", label: "Death doula" },
  { value: "attorney", label: "Estate attorney" },
  { value: "cleaner", label: "Death cleaning" },
  { value: "celebrant", label: "Celebrant" },
  { value: "organizer", label: "EOL organizer" },
  { value: "home-funeral", label: "Home funeral" },
];

const DISTANCES = ["5 mi", "15 mi", "30 mi", "50 mi", "Virtual only"];
const RATINGS = [
  { value: "", label: "Any" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "5", label: "5 only" },
];

export function ServiceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  }

  function toggleBool(key: string) {
    const next = new URLSearchParams(params.toString());
    if (next.get(key) === "1") next.delete(key); else next.set(key, "1");
    router.push(`${pathname}?${next.toString()}`);
  }

  const activeType = params.get("type") ?? "";
  const activeDist = params.get("distance") ?? "";
  const activeRating = params.get("minRating") ?? "";

  return (
    <div className="bg-white rounded-[10px] border border-[rgba(44,40,37,.09)] p-5 w-[220px] flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[14px] font-medium text-ch">Filters</span>
        <button
          onClick={() => router.push(pathname)}
          className="text-[12px] text-tr cursor-pointer"
        >
          Clear all
        </button>
      </div>

      <FilterSection heading="Service type">
        {SERVICE_TYPES.map((t) => (
          <FilterPill
            key={t.value}
            label={t.label}
            active={activeType === t.value}
            onClick={() => setParam("type", activeType === t.value ? "" : t.value)}
          />
        ))}
      </FilterSection>

      <Divider />

      <FilterSection heading="Distance">
        {DISTANCES.map((d) => (
          <FilterPill
            key={d}
            label={d}
            active={activeDist === d}
            onClick={() => setParam("distance", activeDist === d ? "" : d)}
          />
        ))}
      </FilterSection>

      <Divider />

      <FilterSection heading="Availability">
        <FilterCheck
          label="Accepting new clients"
          checked={params.get("accepting") === "1"}
          onChange={() => toggleBool("accepting")}
        />
        <FilterCheck
          label="Virtual sessions"
          checked={params.get("virtual") === "1"}
          onChange={() => toggleBool("virtual")}
        />
        <FilterCheck
          label="Home visits"
          checked={params.get("inHome") === "1"}
          onChange={() => toggleBool("inHome")}
        />
      </FilterSection>

      <Divider />

      <FilterSection heading="Minimum rating">
        {RATINGS.map((r) => (
          <FilterPill
            key={r.value}
            label={r.label}
            active={activeRating === r.value}
            onClick={() => setParam("minRating", r.value)}
          />
        ))}
      </FilterSection>

      <Divider />

      <FilterSection heading="Verified & vetted">
        <FilterCheck
          label="CodaCo verified"
          checked={params.get("verified") === "1"}
          onChange={() => toggleBool("verified")}
        />
      </FilterSection>
    </div>
  );
}

function FilterSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h4 className="text-[12px] font-medium text-ch mb-2">{heading}</h4>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1 rounded-full text-[12px] border transition-all cursor-pointer",
        active
          ? "bg-tr text-white border-tr"
          : "bg-white text-cm border-[rgba(44,40,37,.2)] hover:border-tr hover:text-tr",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function FilterCheck({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer w-full mb-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="accent-tr"
      />
      <span className="text-[12px] text-cm">{label}</span>
    </label>
  );
}

function Divider() {
  return <div className="border-t border-[rgba(44,40,37,.08)] my-3" />;
}
