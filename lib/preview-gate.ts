// Shared helpers for the preview-access gate. Imported by both `proxy.ts`
// and the /preview-access server action. Both run on the Node.js runtime
// (Next 16 proxy defaults to Node), and both have WebCrypto.
//
// The gate has two independent triggers, either of which engages it:
//   1. PREVIEW_PASSWORD env var — the pre-launch wall. Changing it needs a
//      Vercel redeploy, so it's a deploy-time setting, not an incident lever.
//   2. PlatformConfig.sitePrivate — the incident kill switch, flipped from
//      /admin/launch and picked up within seconds. See lib/site-private.ts.
//
// Each trigger has its own unlock secret, so the cookie has to be valid for
// whichever is active. `previewToken` derives the cookie value from that
// secret: rotating the secret invalidates every previously-unlocked device,
// which is exactly what you want when a shared password leaks.

export const PREVIEW_COOKIE_NAME = "coda-preview";
const TOKEN_SALT = "coda-preview-v1";

// Cookie value for a given unlock secret. For the env-var gate the secret is
// the password itself; for the DB kill switch it's the stored bcrypt hash
// (never the plaintext), so the hash is what rotates the cookie.
export async function previewToken(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`${TOKEN_SALT}:${secret}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Constant-time compare for the fixed-length hex digests above. Both the
// proxy's cookie check and the unlock form's password check go through this
// so neither leaks a match prefix through response timing.
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}
