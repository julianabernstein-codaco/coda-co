// Shape check for an email address — pure and client-safe.
//
// Deliberately loose: the only thing worth rejecting server-side is input that
// clearly isn't an address (no @, whitespace, no dot in the domain). Anything
// stricter starts bouncing valid addresses. Real validation is "did the
// message arrive", not a regex.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Longest address RFC 5321 allows on the wire. Bounds a free-text field that
// gets persisted and handed to the mailer.
export const MAX_EMAIL_LEN = 254;

export function isEmailShape(raw: string): boolean {
  return typeof raw === "string" && raw.length <= MAX_EMAIL_LEN && EMAIL_SHAPE.test(raw);
}
