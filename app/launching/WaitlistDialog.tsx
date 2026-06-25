"use client";

import { useRef, useState } from "react";
import { WaitlistForm } from "./WaitlistForm";

// Trigger button on the hero that opens the signup form in a standalone
// modal. Uses the native <dialog> element via showModal() for built-in
// focus trapping, Escape-to-close, and an inert backdrop — no library.
export function WaitlistDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Drives whether the form is mounted. Remounting on each open gives a
  // fresh form after a previous success (the form swaps to a thank-you
  // panel in place once submitted).
  const [open, setOpen] = useState(false);

  function openDialog() {
    setOpen(true);
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button type="button" onClick={openDialog} className="btn-secondary btn-lg">
        Get notified at launch
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        // Close when the backdrop (the dialog element itself) is clicked,
        // but not when a click lands inside the content box.
        onClick={(e) => {
          if (e.target === dialogRef.current) closeDialog();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-[460px] bg-transparent p-0 backdrop:bg-ch/50"
      >
        <div className="relative max-h-[90vh] overflow-y-auto rounded-[16px] bg-tr-vp p-6 sm:p-7 text-center">
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close"
            className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full text-cm hover:bg-white/60 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="mb-6">
            <h2 className="font-serif text-[24px] font-light text-ink mb-1.5">
              Get notified at launch
            </h2>
            <p className="text-[14px] text-ink/80 leading-relaxed">
              Drop your email below, and we&apos;ll send you a single note when
              we launch.
            </p>
          </div>

          {open && <WaitlistForm />}
        </div>
      </dialog>
    </>
  );
}
