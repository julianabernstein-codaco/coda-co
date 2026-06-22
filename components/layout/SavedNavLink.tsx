"use client";

import Link from "next/link";
import { useSaved } from "@/components/providers/SavedProvider";
import { HeartIcon } from "@/components/ui/HeartIcon";

// Nav entry for the wishlist. Shows a count badge once the user has saved
// something (count is 0 until SavedProvider hydrates from localStorage, so
// server and first client render agree — no hydration mismatch).
export function SavedNavLink() {
  const { count } = useSaved();

  return (
    <li>
      <Link
        href="/saved"
        aria-label={count > 0 ? `Saved items (${count})` : "Saved items"}
        className="flex items-center gap-1.5 text-[13px] text-cm hover:text-tr no-underline transition-colors duration-150"
      >
        <HeartIcon />
        Saved
        {count > 0 && (
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-tr text-white text-[10px] font-medium leading-none">
            {count}
          </span>
        )}
      </Link>
    </li>
  );
}
