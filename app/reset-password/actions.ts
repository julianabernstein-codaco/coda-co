"use server";

import bcrypt from "bcryptjs";
import { consumePasswordResetToken } from "@/lib/auth/password-reset";
import { isNextControlFlow, log } from "@/lib/log";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export interface ResetPasswordState {
  ok?: boolean;
  error?: string;
}

export async function resetPasswordAction(
  _prev: ResetPasswordState | null,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token) return { error: "This reset link is invalid or has expired." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "The two passwords don't match." };

  // Cap attempts per source so a leaked/guessable token space can't be
  // brute-forced. Tokens are 256-bit random, so this is belt-and-braces.
  const ip = await clientIp();
  const limited = rateLimit(`reset-password:${ip}`, { limit: 10, windowMs: 60 * 60 * 1000 });
  if (!limited.ok) {
    log.warn("password_reset.consume_rate_limited", { ip });
    return { error: "Too many attempts. Please try again in a little while." };
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const done = await consumePasswordResetToken(token, hash);
    if (!done) {
      log.warn("password_reset.consume_failed", { ip });
      return {
        error: "This reset link is invalid or has expired. Request a new one to try again.",
      };
    }
    log.info("password_reset.completed", { ip });
  } catch (err) {
    if (!isNextControlFlow(err)) {
      log.error("password_reset.consume_error", { ip, err });
    }
    return { error: "Something went wrong resetting your password. Please try again." };
  }

  return { ok: true };
}
