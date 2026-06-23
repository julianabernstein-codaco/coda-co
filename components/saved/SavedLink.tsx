"use client";

import Link from "next/link";
import { useSaved } from "@/components/providers/SavedProvider";
import { HeartIcon } from "@/components/ui/HeartIcon";

// Wishlist entry point for the listing pages (/shop, /services). Count is 0
// until SavedProvider hydrates from localStorage, so server and first client
// render agree (no hydration mismatch).
export function SavedLink({ className = "" }: { className?: string }) {
  const { count } = useSaved();

  return (
    <Link
      href="/saved"
      aria-label={count > 0 ? `Saved items (${count})` : "Saved items"}
      className={`inline-flex items-center gap-1.5 text-[13px] text-cm hover:text-tr no-underline transition-colors duration-150 ${className}`}
    >
      <HeartIcon />
      Saved
      {count > 0 && (
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-tr text-white text-[10px] font-medium leading-none">
          {count}
        </span>
      )}
    </Link>
  );
}
