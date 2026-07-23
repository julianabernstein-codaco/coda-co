"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction, type ResetPasswordState } from "./actions";

const inputCls =
  "w-full h-10 px-3 text-sm rounded border border-line-bold bg-white text-ch placeholder:text-cl focus:outline-none focus:border-tr transition-colors";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<ResetPasswordState | null, FormData>(
    resetPasswordAction,
    null,
  );

  if (state?.ok) {
    return (
      <div className="bg-white rounded-[10px] border border-line p-6 space-y-4">
        <p className="text-[15px] text-ch bg-sg-p border border-sg-l rounded px-3 py-2 leading-relaxed">
          Your password has been reset. You can now sign in with your new password.
        </p>
        <Link
          href="/login"
          className="block w-full h-10 leading-10 text-center bg-tr text-white text-[16px] font-medium rounded-full hover:bg-tr-d transition-colors no-underline"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="bg-white rounded-[10px] border border-line p-6 space-y-4">
      <input type="hidden" name="token" value={token} />

      <label className="block">
        <span className="block text-[14px] font-medium text-ch mb-1.5">New password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoFocus
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
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
