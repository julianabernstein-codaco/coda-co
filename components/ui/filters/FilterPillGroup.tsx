import type { ReactNode } from "react";

export function FilterPillGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-[5px]">{children}</div>;
}
