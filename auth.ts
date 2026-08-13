import { PrismaAdapter } from "@auth/prisma-adapter";
import type { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { log } from "@/lib/log";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// Login brute-force limits. Exported so the login server action can peek at
// the same buckets/thresholds for its user-facing "too many attempts"
// message without duplicating the numbers (enforcement still happens here in
// `authorize`, the one path a direct API POST can't skip). 15-minute window;
// per-email is tighter than per-IP so shared-NAT users aren't punished for a
// neighbor while a single account still can't be ground down.
export const LOGIN_IP_LIMIT = { limit: 10, windowMs: 15 * 60 * 1000 } as const;
export const LOGIN_EMAIL_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 } as const;

// Auth.js v5 config. Session strategy is JWT (Credentials can't use DB
// sessions in v5), so the auth cookie is a signed token, not a DB session
// id. We keep it revocable anyway: the `jwt` callback re-reads the user
// every request and returns null (a hard logout) once the token is stale
// — see the callbacks below.
//
// Phase C only wires Credentials. OAuth providers slot in here later
// without schema or callback changes — that's the whole point of the
// Account/Session/VerificationToken tables landing in this phase.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  // Auth.js v5 refuses requests whose Host header isn't on a trusted list
  // unless AUTH_URL is set or `trustHost` is true. Setting it explicitly
  // makes self-hosted / Docker / preview deployments work without needing
  // to plumb AUTH_URL into every environment. Vercel + similar trusted
  // platforms still get host-checked via the AUTH_TRUST_HOST env var.
  trustHost: true,

  // The Credentials provider can't use the database session strategy
  // directly (Auth.js limitation), so we issue a JWT for the auth cookie
  // and re-hydrate the user (including role) from the DB on every request
  // via the `jwt` callback below — which also enforces password-based
  // session invalidation.
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = typeof creds?.email === "string" ? creds.email.trim().toLowerCase() : "";
        const password = typeof creds?.password === "string" ? creds.password : "";
        if (!email || !password) {
          log.warn("auth.signin_failed", { reason: "missing_credentials", email: email || null });
          return null;
        }

        // Brute-force shield at the true choke point: both the login form's
        // server action and a raw POST to /api/auth/callback/credentials
        // funnel through here, so this is the one place that covers every
        // path. Keyed by IP *and* email — IP alone lets a botnet spread out,
        // email alone lets one host grind many accounts. We check before the
        // bcrypt.compare so an attacker can't burn CPU past the limit.
        // Same generic `null` return as any credential failure — no signal
        // that throttling (vs. a bad password) happened, so no enumeration.
        const ip = await clientIp();
        const ipOk = rateLimit(`login:ip:${ip}`, LOGIN_IP_LIMIT).ok;
        const emailOk = rateLimit(`login:email:${email}`, LOGIN_EMAIL_LIMIT).ok;
        if (!ipOk || !emailOk) {
          log.warn("auth.rate_limited", { ip, email, reason: !emailOk ? "email" : "ip" });
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) {
          log.warn("auth.signin_failed", { reason: "user_not_found", email });
          return null;
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
          log.warn("auth.signin_failed", { reason: "wrong_password", email, userId: user.id });
          return null;
        }

        log.info("auth.signin_succeeded", { userId: user.id, email });
        return { id: user.id, email: user.email, name: user.name ?? null };
      },
    }),
  ],

  callbacks: {
    // Runs on sign-in (with `user`) and on every session read (without it).
    // We re-read the user from the DB each time — the same cost the previous
    // `session`-callback hydration paid — to keep `role` live AND to enforce
    // password-based session invalidation. Returning null clears the cookie,
    // a real logout. Node-runtime only: the edge middleware (`proxy.ts`)
    // never imports this config, so Prisma is never pulled into the edge.
    async jwt({ token, user }) {
      if (user) token.uid = user.id;

      // JWT-field augmentation is inert under next-auth v5's module layout, so
      // token reads are cast (matching the rest of this file).
      const uid = token.uid as string | undefined;
      if (!uid) return token;

      const u = await prisma.user.findUnique({
        where: { id: uid },
        select: { email: true, name: true, role: true, passwordChangedAt: true },
      });
      if (!u) {
        // User deleted between cookie issuance and now — kill the stale
        // session instead of carrying a dangling reference.
        log.warn("auth.session_user_missing", { userId: uid });
        return null;
      }

      const dbVersion = u.passwordChangedAt?.getTime() ?? 0;
      if (user) {
        // Fresh sign-in (or a post-change re-issue): adopt the current
        // password version so this new token is valid.
        token.pwc = dbVersion;
      } else if (((token.pwc as number | undefined) ?? 0) !== dbVersion) {
        // The password changed after this token was minted (a reset, or a
        // change on another device). Invalidate this session.
        log.info("auth.session_invalidated", { userId: uid, reason: "password_changed" });
        return null;
      }

      token.email = u.email;
      token.name = u.name;
      token.role = u.role;
      return token;
    },
    async session({ session, token }) {
      const uid = token.uid as string | undefined;
      if (uid) {
        session.user = {
          ...session.user,
          id: uid,
          email: (token.email as string | null | undefined) ?? session.user.email,
          name: (token.name as string | null | undefined) ?? null,
          role: (token.role as UserRole | undefined) ?? "unknown",
        };
      }
      return session;
    },
  },
});
