"use client";

import { useEffect, useRef, useState } from "react";
import { signOutAction } from "./userMenuActions";

// Signed-in account control for the Nav. Collapses the user's name and the
// sign-out button into a dropdown opened from a small person icon, so the
// nav bar stays uncluttered. Client island (open/close state + outside-click
// and Escape handling); the sign-out itself runs through a server action.
export function UserMenu({ display }: { display: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <li ref={ref} className="relative flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${display}`}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-cm transition-colors duration-150 hover:border-tr-l hover:text-tr"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] min-w-[200px] rounded-[12px] border border-line bg-white py-2 shadow-lg z-50"
        >
          <div className="border-b border-line-soft px-4 pb-2 pt-1">
            <p className="text-[12px] text-cl">Signed in as</p>
            <p className="truncate text-[14px] text-ch">{display}</p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="w-full px-4 py-2.5 text-left text-[14px] text-cm transition-colors hover:bg-tr-vp hover:text-tr"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </li>
  );
}
