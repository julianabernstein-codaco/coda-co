"use client";

import { useSaved, type SavedKind } from "@/components/providers/SavedProvider";

interface SaveButtonProps {
  kind: SavedKind;
  // Public slug of the product or vendor being saved.
  slug: string;
  // Label shown when not yet saved (default "Save") and once saved.
  label?: string;
  savedLabel?: string;
  // Always-applied classes (borders, sizing). `activeClassName` is layered
  // on when the item is saved so callers can tint the saved state.
  className?: string;
  activeClassName?: string;
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill={filled ? "currentColor" : "none"}
      aria-hidden="true"
    >
      <path
        d="M8 13.6 C8 13.6 2.2 9.9 2.2 5.9 C2.2 3.8 3.9 2.6 5.6 2.6 C6.8 2.6 7.6 3.3 8 4 C8.4 3.3 9.2 2.6 10.4 2.6 C12.1 2.6 13.8 3.8 13.8 5.9 C13.8 9.9 8 13.6 8 13.6 Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Toggleable wishlist button. Persists via SavedProvider (localStorage) and
// reflects saved state with a filled heart + swapped label. Used on the
// PDP, vendor cards, and the vendor profile.
export function SaveButton({
  kind,
  slug,
  label = "Save",
  savedLabel = "Saved",
  className = "",
  activeClassName = "",
}: SaveButtonProps) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(kind, slug);

  return (
    <button
      type="button"
      onClick={() => toggle(kind, slug)}
      aria-pressed={saved}
      className={`inline-flex items-center justify-center gap-1.5 cursor-pointer ${className} ${saved ? activeClassName : ""}`}
    >
      <Heart filled={saved} />
      {saved ? savedLabel : label}
    </button>
  );
}
