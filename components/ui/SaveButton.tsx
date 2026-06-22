"use client";

import { useSaved, type SavedKind } from "@/components/providers/SavedProvider";
import { HeartIcon } from "@/components/ui/HeartIcon";

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
      <HeartIcon filled={saved} />
      {saved ? savedLabel : label}
    </button>
  );
}
