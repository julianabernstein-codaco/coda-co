import { NextRequest, NextResponse } from "next/server";
import { PREVIEW_COOKIE_NAME, previewToken, timingSafeEqual } from "@/lib/preview-gate";
import { getSitePrivateState } from "@/lib/site-private";

// Shared-password preview gate. The whole site is hidden behind a single
// password except the public teaser (/homepage), the password entry page
// (/preview-access), Next's own asset routes, and robots.txt.
//
// Two independent triggers engage it:
//   1. PREVIEW_PASSWORD is set — the pre-launch wall. Env-backed, so it only
//      changes on a redeploy.
//   2. PlatformConfig.sitePrivate is true — the incident kill switch, flipped
//      from /admin/launch with no deploy. See lib/site-private.ts.
// Neither set means every request passes through untouched (local dev, and
// normal post-launch operation).
//
// Lives at `proxy.ts` (Next 16+ name) — the older `middleware.ts`
// convention is deprecated but functionally identical. Proxy runs on the
// Node.js runtime in Next 16, which is what lets it read the DB at all.

const PUBLIC_EXACT = new Set([
  "/homepage",
  "/launching",
  // The /launching OpenGraph image is served from this nested route; it
  // must bypass the gate too so social crawlers can fetch the preview.
  "/launching/opengraph-image",
  "/preview-access",
  "/robots.txt",
]);

function isAsset(pathname: string): boolean {
  if (pathname.startsWith("/_next/")) return true;
  return /\.(png|jpe?g|gif|svg|webp|ico|css|js|woff2?|ttf|map|txt)$/i.test(
    pathname,
  );
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Pass the pathname through as a header so the root layout can hide
  // its nav/footer on /homepage and /preview-access without restructuring
  // every route into a route group.
  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname);
  const passThrough = NextResponse.next({ request: { headers } });

  // Exemptions are checked before either trigger so assets and programmatic
  // endpoints never cost a config read.
  //
  // Programmatic endpoints (Stripe webhooks, NextAuth callbacks) are hit by
  // external services or the app itself — never by a human typing the shared
  // password — so they must bypass the gate. Without this, Stripe's webhook
  // POST is answered with a 307 → /preview-access and no events are ever
  // processed (subscriptions stay "incomplete", set-up fees never settle).
  if (
    pathname.startsWith("/api/") ||
    PUBLIC_EXACT.has(pathname) ||
    isAsset(pathname)
  ) {
    return passThrough;
  }

  const envPassword = process.env.PREVIEW_PASSWORD;
  // Cached, so this is one query per instance per SITE_PRIVATE_TTL_MS.
  const sitePrivate = await getSitePrivateState();
  if (!envPassword && !sitePrivate.enabled) return passThrough;

  // A device is let through if its cookie matches whichever trigger is
  // active. Accepting both means arming the kill switch while the env wall is
  // already up doesn't sign out the team mid-incident, and dropping the env
  // var later doesn't either.
  const cookie = req.cookies.get(PREVIEW_COOKIE_NAME)?.value;
  if (cookie) {
    if (envPassword && timingSafeEqual(cookie, await previewToken(envPassword))) {
      return passThrough;
    }
    if (
      sitePrivate.enabled &&
      sitePrivate.passwordHash &&
      timingSafeEqual(cookie, await previewToken(sitePrivate.passwordHash))
    ) {
      return passThrough;
    }
  }

  const redirectUrl = new URL("/preview-access", req.url);
  redirectUrl.searchParams.set("next", pathname + search);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
