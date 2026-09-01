"use client";

import { useActionState } from "react";
import { setPrivateModePassword, type PrivatePasswordState } from "./actions";

// Client-only because setting the bypass password is the one control here
// that can fail validation and needs to say why. The kill-switch toggles
// themselves stay plain server-action forms.
export function PrivatePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, formAction, pending] = useActionState<PrivatePasswordState | null, FormData>(
    setPrivateModePassword,
    null,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input
        type="password"
        name="password"
        required
        minLength={12}
        autoComplete="new-password"
        placeholder={hasPassword ? "Set a new password" : "At least 12 characters"}
        className="border border-line-strong rounded-[8px] px-3 py-2 text-[13px] text-ch min-w-[240px] outline-none focus:border-tr"
      />
      <button className="btn-secondary btn-md" type="submit" disabled={pending}>
        {pending ? "Saving…" : hasPassword ? "Replace password" : "Set password"}
      </button>
      {state?.error && <p className="text-[13px] text-tr w-full">{state.error}</p>}
      {state?.ok && <p className="text-[13px] text-sg-d w-full">{state.ok}</p>}
    </form>
  );
}
