import type { ReactNode } from "react";

interface FilterPillProps {
  label: ReactNode;
  active: boolean;
  onClick: () => void;
}

export function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`filter-pill ${active ? "filter-pill-on" : "filter-pill-off"}`}
    >
      {label}
    </button>
  );
}
