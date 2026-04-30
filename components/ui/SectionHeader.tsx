import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrowTone?: "tr" | "sg";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  eyebrowTone = "tr",
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`section-header ${className}`.trim()}>
      {eyebrow && (
        <p className={`section-eyebrow ${eyebrowTone === "sg" ? "section-eyebrow-sg" : ""}`.trim()}>
          {eyebrow}
        </p>
      )}
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}
