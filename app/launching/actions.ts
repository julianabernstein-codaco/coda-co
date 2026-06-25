"use server";

import { log } from "@/lib/log";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  createWaitlistSignup,
  isWaitlistInterest,
} from "@/lib/api/waitlist";

export interface WaitlistState {
  ok?: boolean;
  message?: string;
  error?: string;
}

// Pragmatic email shape check — not RFC-exhaustive, just enough to reject
// obvious typos before they land in the launch list. The unique constraint
// + upsert in the data layer handle the rest.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function joinWaitlist(
  _prev: WaitlistState | null,
  formData: FormData,
): Promise<WaitlistState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const interest = String(formData.get("interest") ?? "");

  if (!EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (!isWaitlistInterest(interest)) {
    return { error: "Let us know whether you're a customer, vendor, or maker." };
  }

  // Cheap signup-spam shield, keyed by IP — mirrors the account signup
  // flow. The window is generous so a legit retry after a typo isn't blocked.
  const ip = await clientIp();
  const limited = rateLimit(`waitlist:${ip}`, { limit: 8, windowMs: 60 * 60 * 1000 });
  if (!limited.ok) {
    log.warn("waitlist.rate_limited", { ip });
    return { error: "Too many signups from here. Try again a bit later." };
  }

  try {
    const { created } = await createWaitlistSignup({ email, interest });
    log.info("waitlist.signup", { email, interest, created });
    return {
      ok: true,
      message: created
        ? "You're on the list. We'll email you the moment we open."
        : "Got it — we've updated your spot on the list.",
    };
  } catch (err) {
    log.error("waitlist.signup_failed", { email, interest, err });
    return { error: "Something went wrong saving your spot. Please try again." };
  }
}
