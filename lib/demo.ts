// The reserved email domain that marks mock / sample accounts.
//
// `prisma/mock.ts` seeds every fake user under this domain — the admin
// (`admin@codaco.local`) and one per sample vendor (`{slug}@codaco.local`) —
// all sharing a single dev password that is documented in this repo and in
// `docs/admin-runbook.md`. RFC 6762 reserves `.local`, so a real user can
// never sign up with a colliding address: matching on this suffix is an
// exact test for "this row came from the mock seed".
//
// Pure + dependency-free so it's safe to import from anywhere (auth config,
// server actions, standalone scripts). `demoSignInAllowed` reads env, so
// it's server-only in practice.

export const DEMO_EMAIL_DOMAIN = "@codaco.local";

export function isDemoEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(DEMO_EMAIL_DOMAIN);
}

// Whether mock accounts are allowed to sign in *in this environment*.
//
// These accounts are a convenience the team relies on daily (signing in as a
// sample vendor to check a dashboard) and a liability the moment the site is
// reachable by the public, since their password is published. Rather than
// make that a thing someone has to remember to switch off, it's derived:
//
//   - Not production (local dev, CI)          -> allowed.
//   - Production behind the preview wall      -> allowed. `PREVIEW_PASSWORD`
//     being set is what makes the site private; `proxy.ts` redirects every
//     page and server action to /preview-access without it.
//   - Production, wall down (public)          -> blocked.
//
// So the guard arms itself at LAUNCH.md step 8 ("unset PREVIEW_PASSWORD"),
// which is the exact moment these logins would otherwise become reachable
// from the open internet. Deleting the rows is still the clean end state
// (LAUNCH.md step 1) — this is the backstop for the window in between.
//
// Deliberately no override env var: the only thing an override could buy is
// "let the published password work on the public site", which is the
// situation this exists to prevent. If you need a demo login after going
// public, rotate that account's password instead.
export function demoSignInAllowed(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return Boolean(process.env.PREVIEW_PASSWORD);
}
