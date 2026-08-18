import { handlers } from "@/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { type NextRequest, NextResponse } from "next/server";

export const { GET } = handlers;

// Per-IP throttle at the HTTP boundary, in front of Auth.js.
//
// The per-account limit inside authorize() only sees well-formed, CSRF-valid
// attempts that actually reach the credential check. A raw or malformed flood
// (wrong action, or a POST with no CSRF token) is rejected by Auth.js with a
// 400 *before* authorize() runs, so it never gets counted. This guards the
// endpoint itself: it mirrors the per-IP login threshold and, unlike
// authorize(), emits a real 429 + RateLimit headers so throttling is
// observable to a client or scanner. The per-account limit stays as
// defense-in-depth (it's the layer a rotating-IP attacker can't dodge).
const AUTH_HTTP_IP_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 } as const;

function rateLimitHeaders(remaining: number, reset: number): Record<string, string> {
  const resetSeconds = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
  return {
    "RateLimit-Limit": String(AUTH_HTTP_IP_LIMIT.limit),
    "RateLimit-Remaining": String(Math.max(0, remaining)),
    "RateLimit-Reset": String(resetSeconds),
  };
}

export async function POST(req: NextRequest): Promise<Response> {
  // Sign-out is a legitimate, low-frequency POST from an already-authenticated
  // user — don't let login-flood throttling lock someone out of signing out.
  if (req.nextUrl.pathname.endsWith("/signout")) return handlers.POST(req);

  // Throttle every other auth POST by IP at the very top — before Auth.js
  // parses the body or routes the action. That's deliberate: a flood aimed at
  // a bogus action (e.g. /api/auth/login) or a credential POST with no CSRF
  // token would otherwise be cheaply 400'd by Auth.js *before* any limiter
  // ran, so it would never be counted. Counting here means every request that
  // reaches the endpoint counts, regardless of shape. The real login form
  // doesn't touch this path (it goes through the server action → in-process
  // authorize()), so legitimate users are unaffected.
  const ip = await clientIp();
  const { ok, remaining, reset } = await rateLimit(`auth-http:ip:${ip}`, AUTH_HTTP_IP_LIMIT);
  const headers = rateLimitHeaders(remaining, reset);

  if (!ok) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      { status: 429, headers: { ...headers, "Retry-After": headers["RateLimit-Reset"] } },
    );
  }

  // Under the limit: hand off to Auth.js, then attach the informational
  // headers. Best-effort — if the returned response guards its headers, the
  // sign-in still succeeds without them.
  const res = await handlers.POST(req);
  try {
    for (const [key, value] of Object.entries(headers)) res.headers.set(key, value);
  } catch {
    // headers immutable on this response — skip, non-fatal.
  }
  return res;
}
