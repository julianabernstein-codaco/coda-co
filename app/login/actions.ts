"use server";

import { AuthError } from "next-auth";
import { LOGIN_EMAIL_LIMIT, LOGIN_IP_LIMIT, signIn } from "@/auth";
import { isNextControlFlow, log } from "@/lib/log";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prev: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rawNext = String(formData.get("next") ?? "/");
  const redirectTo = rawNext.startsWith("/") ? rawNext : "/";

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  // Peek (no increment) at the same buckets `authorize` enforces, purely to
  // give a throttled human a clear message instead of the generic "email or
  // password is incorrect". Enforcement — and the counting — still happens in
  // `authorize`, which a direct API POST can't bypass.
  const ip = await clientIp();
  if (
    (await isRateLimited(`login:ip:${ip}`, LOGIN_IP_LIMIT)) ||
    (await isRateLimited(`login:email:${email}`, LOGIN_EMAIL_LIMIT))
  ) {
    log.warn("login.rate_limited", { ip, email });
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (err) {
    if (err instanceof AuthError) {
      // Auth.js wraps every credential failure as `CredentialsSignin`. We
      // surface a single generic message so the form doesn't leak whether
      // the email exists.
      return { error: "Email or password is incorrect." };
    }
    if (!isNextControlFlow(err)) {
      log.error("login.unexpected_error", { email, err });
    }
    throw err;
  }

  return {};
}
