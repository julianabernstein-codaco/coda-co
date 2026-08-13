"use client";

import { useActionState } from "react";
import { changePasswordAction, type ChangePasswordState } from "./actions";

const inputCls =
  "w-full h-10 px-3 text-sm rounded border border-line-bold bg-white text-ch placeholder:text-cl focus:outline-none focus:border-tr transition-colors";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<ChangePasswordState | null, FormData>(
    changePasswordAction,
    null,
  );

  return (
    <form
      action={formAction}
      className="bg-white rounded-[10px] border border-line p-6 space-y-4"
      // Remount on success so the uncontrolled inputs clear after a change.
      key={state?.ok ? "done" : "editing"}
    >
      <label className="block">
        <span className="block text-[14px] font-medium text-ch mb-1.5">Current password</span>
        <input
          name="current"
          type="password"
          required
          autoComplete="current-password"
          className={inputCls}
        />
      </label>

      <label className="block">
        <span className="block text-[14px] font-medium text-ch mb-1.5">New password</span>
        <input
          name="next"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputCls}
          placeholder="At least 8 characters"
        />
      </label>

      <label className="block">
        <span className="block text-[14px] font-medium text-ch mb-1.5">Confirm new password</span>
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputCls}
          placeholder="Re-enter your new password"
        />
      </label>

      {state?.ok && (
        <p className="text-[15px] text-ch bg-sg-p border border-sg-l rounded px-3 py-2">
          Your password has been updated.
        </p>
      )}

      {state?.error && (
        <p className="text-[15px] text-tr-d bg-tr-p border border-tr-l rounded px-3 py-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full h-10 bg-tr text-white text-[16px] font-medium rounded-full hover:bg-tr-d transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
