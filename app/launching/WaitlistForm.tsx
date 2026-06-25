"use client";

import { useActionState, useState } from "react";
import { joinWaitlist, type WaitlistState } from "./actions";
import type { WaitlistInterest } from "@/lib/api/waitlist";

const ROLES: Array<{
  value: WaitlistInterest;
  label: string;
  hint: string;
}> = [
  {
    value: "customer",
    label: "Customer",
    hint: "Looking for goods, services, or support",
  },
  {
    value: "vendor",
    label: "Vendor",
    hint: "I offer end-of-life services",
  },
  {
    value: "maker",
    label: "Maker",
    hint: "I create goods — urns, shrouds, keepsakes",
  },
];

export function WaitlistForm() {
  const [state, formAction, pending] = useActionState<WaitlistState | null, FormData>(
    joinWaitlist,
    null,
  );
  const [interest, setInterest] = useState<WaitlistInterest | "">("");

  if (state?.ok) {
    return (
      <div className="card-surface p-7 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-sg-p border-[1.5px] border-sg-l flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12.5 L10 17.5 L19 7" stroke="var(--color-sg-d)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-serif text-[20px] font-light text-ch mb-1.5">
          Thank you.
        </p>
        <p className="text-[14px] text-cm leading-relaxed">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="card-surface p-6 sm:p-7 text-left">
      {/* Hidden field carries the selected role into the form submission. */}
      <input type="hidden" name="interest" value={interest} />

      <fieldset className="mb-5">
        <legend className="block text-[12px] font-medium text-ch mb-2.5">
          I&apos;m interested as a…{" "}
          <span className="font-normal text-cl">(optional)</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {ROLES.map((role) => {
            const active = interest === role.value;
            return (
              <button
                type="button"
                key={role.value}
                // Optional + deselectable: clicking the active choice
                // clears it back to "no pick".
                onClick={() => setInterest(active ? "" : role.value)}
                aria-pressed={active}
                className={`rounded-[10px] border px-3.5 py-3 text-left transition-colors ${
                  active
                    ? "border-tr bg-tr-p"
                    : "border-line-bold bg-white hover:border-tr-l"
                }`}
              >
                <span className="block text-[13px] font-medium text-ch mb-0.5">
                  {role.label}
                </span>
                <span className="block text-[11px] text-cl leading-snug">
                  {role.hint}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block mb-4">
        <span className="block text-[12px] font-medium text-ch mb-1.5">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full h-11 px-3.5 text-[14px] rounded-[10px] border border-line-bold bg-white text-ch placeholder:text-cl focus:outline-none focus:border-tr transition-colors"
        />
      </label>

      {state?.error && (
        <p className="text-[13px] text-tr-d bg-tr-p border border-tr-l rounded-[8px] px-3 py-2 mb-4">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary btn-lg w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Adding you…" : "Notify me at launch"}
      </button>

      <p className="text-[12px] text-cl text-center mt-3 leading-relaxed">
        No spam, ever.
      </p>
    </form>
  );
}
