"use client";

import { useState, useTransition } from "react";
import { setVendorContactVisibility } from "./actions";

// One on/off switch for a vendor's website or Instagram public visibility.
// Optimistic: flips immediately, reverts if the server rejects. Disabled
// when the vendor has no value for that link (nothing to show).
export function ContactToggle({
  slug,
  field,
  initial,
  disabled = false,
}: {
  slug: string;
  field: "showWebsite" | "showInstagram";
  initial: boolean;
  disabled?: boolean;
}) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle() {
    if (disabled || pending) return;
    const next = !on;
    setOn(next);
    startTransition(async () => {
      const res = await setVendorContactVisibility(slug, field, next);
      if (!res.ok) setOn(!next); // revert on failure
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={field === "showWebsite" ? "Show website" : "Show Instagram"}
      onClick={toggle}
      disabled={disabled}
      title={
        disabled
          ? "No link saved for this vendor"
          : on
            ? "Shown on the public profile — click to hide"
            : "Hidden from the public profile — click to show"
      }
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0",
        disabled
          ? "bg-cl opacity-40 cursor-not-allowed"
          : on
            ? "bg-sg cursor-pointer"
            : "bg-cl cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-5 w-5 rounded-full bg-white transition-transform",
          on ? "translate-x-[22px]" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}
