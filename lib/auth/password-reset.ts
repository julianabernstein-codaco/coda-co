import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

// Password-reset tokens live in the (otherwise unused) `verification_tokens`
// table. Auth.js only touches that table for its Email provider, which we
// don't wire, so it's free real estate for our own flow.
//
// We store only a SHA-256 hash of the token — the raw token travels in the
// emailed link and never lands in the DB. A DB leak therefore can't be
// replayed into an account takeover, and hashing keeps the `token @unique`
// lookup O(1). Tokens are short-lived and single-use.

const TTL_MS = 60 * 60 * 1000; // 1 hour

// Namespacing the identifier keeps our rows distinct from anything Auth.js
// might one day write to the same table, and lets us map a token back to
// the email it was issued for.
const IDENTIFIER_PREFIX = "password-reset:";

function identifierFor(email: string): string {
  return `${IDENTIFIER_PREFIX}${email}`;
}

export function hashResetToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

// Issues a fresh reset token for `email`, invalidating any outstanding ones
// (so requesting a second link voids the first). Returns the raw token to
// embed in the emailed URL. The caller must have already confirmed a
// credential account exists for this email.
export async function issuePasswordResetToken(email: string): Promise<string> {
  const identifier = identifierFor(email);
  const raw = randomBytes(32).toString("base64url");
  const token = hashResetToken(raw);
  const expires = new Date(Date.now() + TTL_MS);

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier } }),
    prisma.verificationToken.create({ data: { identifier, token, expires } }),
  ]);

  return raw;
}

// Validates a raw reset token without consuming it, returning the email it
// was issued for (used by the reset page to decide whether to show the form
// or an "expired link" notice). Returns null for unknown/expired/foreign
// tokens.
export async function verifyPasswordResetToken(raw: string): Promise<string | null> {
  if (!raw) return null;
  const token = hashResetToken(raw);
  const row = await prisma.verificationToken.findUnique({ where: { token } });
  if (!row) return null;
  if (row.expires.getTime() <= Date.now()) return null;
  if (!row.identifier.startsWith(IDENTIFIER_PREFIX)) return null;
  return row.identifier.slice(IDENTIFIER_PREFIX.length);
}

// Atomically consumes the token and sets the new password hash in one
// transaction. The token is deleted before the password is written, so a
// concurrent double-submit can't reuse it. Returns false if the token
// vanished or expired between page-load and submit.
export async function consumePasswordResetToken(
  raw: string,
  newPasswordHash: string,
): Promise<boolean> {
  const token = hashResetToken(raw);
  try {
    await prisma.$transaction(async (tx) => {
      const row = await tx.verificationToken.findUnique({ where: { token } });
      if (!row || row.expires.getTime() <= Date.now()) throw new Error("invalid_token");
      if (!row.identifier.startsWith(IDENTIFIER_PREFIX)) throw new Error("invalid_token");
      const email = row.identifier.slice(IDENTIFIER_PREFIX.length);
      // Delete first so a racing request finds nothing to consume.
      await tx.verificationToken.delete({ where: { token } });
      await tx.user.update({ where: { email }, data: { passwordHash: newPasswordHash } });
    });
    return true;
  } catch {
    return false;
  }
}
