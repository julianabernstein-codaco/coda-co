"use server";

import { issuePasswordResetToken } from "@/lib/auth/password-reset";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email/templates";
import { isNextControlFlow, log } from "@/lib/log";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export interface ForgotPasswordState {
  sent?: boolean;
  error?: string;
}

export async function requestPasswordResetAction(
  _prev: ForgotPasswordState | null,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Enter your email address." };

  // Rate-limit by IP so this can't be used to blast reset emails at a
  // domain. A soft cap; keyed by source, not by target email, so it never
  // becomes a way to probe which addresses are registered.
  const ip = await clientIp();
  const limited = rateLimit(`forgot-password:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!limited.ok) {
    log.warn("password_reset.rate_limited", { ip });
    return { error: "Too many requests. Please try again in a little while." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true },
    });

    // Only issue a link when there's a credential account to reset. Unknown
    // or OAuth-only accounts silently no-op — the response below is identical
    // either way, so the form never reveals whether an email is registered.
    if (user?.passwordHash) {
      const token = await issuePasswordResetToken(user.email);
      const result = await sendPasswordResetEmail({
        toEmail: user.email,
        toName: user.name,
        token,
      });
      if (result.ok) {
        log.info("password_reset.email_sent", { userId: user.id });
      } else {
        log.error("password_reset.email_failed", { userId: user.id, err: result.error });
      }
    } else {
      log.info("password_reset.no_account", { email });
    }
  } catch (err) {
    if (!isNextControlFlow(err)) {
      log.error("password_reset.request_error", { email, err });
    }
    // Fall through to the generic success response — surfacing an internal
    // error here would still leak nothing useful, and the user can retry.
  }

  return { sent: true };
}
