import Link from "next/link";
import type { ReactNode } from "react";

type HoverTone = "sage" | "terracotta" | "none";
type Padding = "md" | "none";

const hoverClass: Record<HoverTone, string> = {
  sage: "card-surface-hover-sg",
  terracotta: "card-surface-hover-tr",
  none: "",
};

const paddingClass: Record<Padding, string> = {
  md: "",
  none: "p-0",
};

interface BaseProps {
  hoverTone?: HoverTone;
  padding?: Padding;
  className?: string;
  children: ReactNode;
}

type CardProps =
  | (BaseProps & { href: string })
  | (BaseProps & { href?: undefined });

export function Card({
  hoverTone = "none",
  padding = "md",
  className = "",
  children,
  ...rest
}: CardProps) {
  const cls =
    `card-surface ${hoverClass[hoverTone]} ${paddingClass[padding]} ${className}`.trim();

  if ("href" in rest && rest.href) {
    return (
      <Link href={rest.href} className={`${cls} block no-underline`}>
        {children}
      </Link>
    );
  }
  return <div className={cls}>{children}</div>;
}
