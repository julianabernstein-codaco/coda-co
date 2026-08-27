// Per-IP throttles for the gift-card surface, in one place so the server
// actions and the RSC pages that share a budget agree on the numbers.
//
// Gift cards are the site's favourite abuse target: the purchase and
// contribution flows are the only *unauthenticated* payment on-ramps (a
// card-testing funnel), and the redeem flow is a bearer-credential oracle (a
// balance-enumeration funnel). Codes carry 60 bits of entropy, so blind
// guessing is already hopeless — these caps exist so the attempt *rate* is
// bounded too, and so partial knowledge (a shoulder-surfed or half-remembered
// code) can't be completed offline-fast.
//
// Backed by lib/rate-limit.ts: Upstash Redis when configured, per-instance
// in-memory otherwise. Not a defense against a genuinely distributed attacker
// — that's the Vercel Firewall rule tracked in TASKS.md.

import { clientIp, rateLimit } from "@/lib/rate-limit";
import { log } from "@/lib/log";

const HOUR_MS = 60 * 60 * 1000;

// Starting a Stripe Checkout session (purchase or pool contribution). Shared
// budget across both, so the total gift-card checkout rate from one source is
// what's capped, not each flow separately.
export const CHECKOUT_LIMIT = { limit: 10, windowMs: HOUR_MS };

// Presenting a code — balance lookup and account claim, again on one shared
// budget. A real recipient checks a balance once or twice; 20/hr leaves room
// for typos and shared NAT egress while making enumeration pointless.
export const CODE_LIMIT = { limit: 20, windowMs: HOUR_MS };

// Sending a funded pool to a recipient. The organizer picks both the address
// and the message body, so an unthrottled resend is a spam relay from our
// domain. Generous for the handful of legitimate re-sends (corrected address).
export const DELIVER_LIMIT = { limit: 10, windowMs: HOUR_MS };

// Best-effort self-heal against Stripe (`?card=` on the success page). Each
// call is an outbound Stripe search on a caller-supplied id, so cap how much
// of our Stripe API quota one source can burn.
export const RECONCILE_LIMIT = { limit: 10, windowMs: HOUR_MS };

type Limit = { limit: number; windowMs: number };

// Count one attempt for `scope` against the caller's IP. Returns true when the
// caller is over budget; callers decide whether that's a user-facing error or
// a silent skip. `event` is logged on rejection so abuse is visible.
export async function overGiftCardLimit(
  scope: string,
  opts: Limit,
  event: string,
  extra: Record<string, unknown> = {},
): Promise<boolean> {
  const ip = await clientIp();
  const { ok } = await rateLimit(`gift-card:${scope}:${ip}`, opts);
  if (!ok) log.warn(event, { ip, ...extra });
  return !ok;
}
