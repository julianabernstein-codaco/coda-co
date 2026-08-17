// Site-wide security response headers, applied to every route by the
// `headers()` block in `next.config.ts`.
//
// These are static headers, deliberately. The stricter alternative is a
// per-request nonce minted in `proxy.ts`, but reading a nonce forces every
// page into dynamic rendering — which would cost this mostly-static
// marketplace its prerendering and full route cache. Since the app renders
// no user-authored HTML, `'unsafe-inline'` on scripts is an accepted
// tradeoff; the rest of the policy (frame-ancestors, object-src, base-uri,
// form-action) still closes real attack surface.
//
// The CSP ships as **Report-Only** — it is observed and reported, never
// enforced. Violations POST to /api/csp-report. Flip CSP_ENFORCE below once
// the reports are quiet.

// Set to true to enforce the policy instead of merely reporting it. Do this
// only after /api/csp-report has been quiet across a full traffic cycle.
const CSP_ENFORCE = false;

const REPORT_PATH = "/api/csp-report";

// Vercel Blob is the image store. Raw <img> tags in ImageUploader /
// ImageGalleryUploader point straight at it, bypassing next/image, so the
// host needs an explicit entry rather than riding on 'self'.
const BLOB_HOST = "https://*.public.blob.vercel-storage.com";

// Book covers on /books. Served through next/image (so same-origin at
// render time), but listed for the case where a raw <img> is used.
const COVERS_HOST = "https://covers.openlibrary.org";

// Stripe is server-side only today: Checkout and the Billing Portal are
// hosted pages reached by a top-level `window.location` navigation, which
// no CSP directive governs. Nothing Stripe-related belongs here yet.
// If Elements / the embedded Payment Element is ever adopted, add
// https://js.stripe.com to script-src and frame-src, and
// https://api.stripe.com to connect-src.

function buildCsp(isDev: boolean): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],

    // 'unsafe-inline' covers Next's inline bootstrap and the streamed
    // React Flight payload (`self.__next_f.push(...)`), which have no
    // stable hash. Dev additionally needs 'unsafe-eval' for the HMR
    // runtime and React refresh; production does not.
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],

    // Tailwind ships as a stylesheet, but Next injects inline <style> tags
    // during streaming and React writes inline style attributes.
    "style-src": ["'self'", "'unsafe-inline'"],

    // blob: and data: back the client-side crop/upload previews
    // (URL.createObjectURL in ImageUploader / ImageGalleryUploader).
    "img-src": ["'self'", "blob:", "data:", BLOB_HOST, COVERS_HOST],

    // next/font self-hosts Crimson Pro and Nunito Sans.
    "font-src": ["'self'", "data:"],

    // Server actions, Vercel Analytics (/_vercel/insights/*) and blob
    // uploads are all same-origin or same-host. Dev adds the HMR websocket.
    "connect-src": ["'self'", BLOB_HOST, ...(isDev ? ["ws:", "wss:"] : [])],

    // The only iframe is /admin/email-preview, which renders via srcDoc
    // with sandbox="". srcdoc frames inherit this policy, so email HTML
    // with remote images may report violations — expected, admin-only.
    "frame-src": ["'self'"],

    // No Flash/Java/embed surface, and nobody should frame this site.
    "object-src": ["'none'"],
    "frame-ancestors": ["'none'"],

    // Pin <base href> and keep every form posting back to us. Verified:
    // no form in the app posts to an external origin.
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
  };

  const serialized = Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");

  // upgrade-insecure-requests is valueless, and browsers ignore it in a
  // report-only policy — emitting a console warning on every page load if
  // we send it anyway. Include it only when enforcing, and never in dev
  // where the server is plain http://localhost.
  const upgrade = CSP_ENFORCE && !isDev ? "; upgrade-insecure-requests" : "";

  // report-uri is formally deprecated in favour of the Reporting API
  // (report-to + a Reporting-Endpoints header), but report-uri is the only
  // one Firefox and Safari implement, and Chrome still honours it. Revisit
  // if Chrome ever drops support.
  return `${serialized}${upgrade}; report-uri ${REPORT_PATH}`;
}

export interface SecurityHeader {
  key: string;
  value: string;
}

export function securityHeaders(isDev: boolean): SecurityHeader[] {
  return [
    {
      key: CSP_ENFORCE
        ? "Content-Security-Policy"
        : "Content-Security-Policy-Report-Only",
      value: buildCsp(isDev),
    },
    // Legacy clickjacking defense. frame-ancestors above supersedes it in
    // modern browsers, but this costs nothing and covers the stragglers.
    { key: "X-Frame-Options", value: "DENY" },
    // Stops MIME sniffing — a user-uploaded file served with the wrong
    // Content-Type can't be reinterpreted as script.
    { key: "X-Content-Type-Options", value: "nosniff" },
    // Full URL to same-origin, bare origin cross-origin, nothing on
    // downgrade. Keeps gift-card and password-reset tokens in the path
    // from leaking to third parties via Referer.
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  ];
}
