"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { invalidatePasswordResetTokens } from "@/lib/auth/password-reset";
import { prisma } from "@/lib/db";
import { sendPasswordChangedEmail } from "@/lib/email/templates";
import { isNextControlFlow, log } from "@/lib/log";
import { rateLimit } from "@/lib/rate-limit";

export interface ChangePasswordState {
  ok?: boolean;
  error?: string;
}

export async function changePasswordAction(
  _prev: ChangePasswordState | null,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await auth();
  if (!session?.user) return { error: "You need to be signed in to change your password." };

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!current || !next) return { error: "Fill in every field." };
  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  if (next !== confirm) return { error: "The two new passwords don't match." };
  if (next === current) return { error: "Your new password must be different from your current one." };

  // Cap current-password guesses per account. Being signed in already gates
  // this hard, but a shared/borrowed session shouldn't get unlimited tries.
  const limited = rateLimit(`change-password:${session.user.id}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!limited.ok) {
    log.warn("password_change.rate_limited", { userId: session.user.id });
    return { error: "Too many attempts. Please try again in a little while." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, passwordHash: true },
    });
    if (!user?.passwordHash) {
      // No password on file — the account signs in another way (or the row
      // vanished). Nothing to change here.
      return { error: "This account doesn't use a password to sign in." };
    }

    const currentOk = await bcrypt.compare(current, user.passwordHash);
    if (!currentOk) {
      log.warn("password_change.wrong_current", { userId: user.id });
      return { error: "Your current password is incorrect." };
    }

    const passwordHash = await bcrypt.hash(next, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    // Void any pending reset links so an old emailed link can't later
    // overwrite the password just set.
    await invalidatePasswordResetTokens(user.email);
    log.info("password_change.completed", { userId: user.id });

    // Security confirmation. Best-effort: the change already succeeded, so a
    // send failure is logged but never surfaced to the user.
    const emailResult = await sendPasswordChangedEmail({
      toEmail: user.email,
      toName: user.name,
    });
    if (!emailResult.ok) {
      log.error("password_change.confirmation_email_failed", { userId: user.id, err: emailResult.error });
    }
  } catch (err) {
    if (!isNextControlFlow(err)) {
      log.error("password_change.error", { userId: session.user.id, err });
    }
    return { error: "Something went wrong updating your password. Please try again." };
  }

  return { ok: true };
}
