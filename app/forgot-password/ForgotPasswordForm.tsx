"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction, type ForgotPasswordState } from "./actions";

const inputCls =
  "w-full h-10 px-3 text-sm rounded border border-line-bold bg-white text-ch placeholder:text-cl focus:outline-none focus:border-tr transition-colors";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<ForgotPasswordState | null, FormData>(
    requestPasswordResetAction,
    null,
  );

  if (state?.sent) {
    return (
      <div className="bg-white rounded-[10px] border border-line p-6 space-y-4">
        <p className="text-[15px] text-ch bg-sg-p border border-sg-l rounded px-3 py-2 leading-relaxed">
          If an account exists for that email, we&apos;ve sent a link to reset your
          password. It expires in one hour — check your inbox (and spam folder).
        </p>
        <p className="text-[14px] text-cl text-center">
          <Link href="/login" className="text-tr no-underline hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="bg-white rounded-[10px] border border-line p-6 space-y-4">
      <label className="block">
        <span className="block text-[14px] font-medium text-ch mb-1.5">Email</span>
        <input
          name="email"
          type="email"
          required
          autoFocus
          autoComplete="email"
          className={inputCls}
          placeholder="you@example.com"
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
        {pending ? "Sending…" : "Send reset link"}
      </button>

      <p className="text-[14px] text-cl text-center">
        Remembered it?{" "}
        <Link href="/login" className="text-tr no-underline hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
