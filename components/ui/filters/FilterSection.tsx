import type { ReactNode } from "react";

interface FilterSectionProps {
  heading: string;
  children: ReactNode;
}

export function FilterSection({ heading, children }: FilterSectionProps) {
  return (
    <div className="mb-5">
      <h4 className="text-overline text-ink mb-2.5">{heading}</h4>
      {children}
    </div>
  );
}
