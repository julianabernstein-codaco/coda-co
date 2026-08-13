import { PrismaAdapter } from "@auth/prisma-adapter";
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

// Auth.js v5 config. The adapter writes sessions to the DB so we never
// hand a JWT to the browser; sessions are server-truth and revocable.
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
  // directly (Auth.js limitation), so we issue a JWT for the auth
  // cookie and re-hydrate the user (including role) from the DB on
  // every request via the `session` callback below.
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
    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      const uid = token.uid as string | undefined;
      if (uid) {
        const u = await prisma.user.findUnique({
          where: { id: uid },
          select: { id: true, email: true, name: true, role: true },
        });
        if (u) {
          session.user = {
            ...session.user,
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
          };
        } else {
          // JWT references a user that no longer exists — likely deleted
          // between cookie issuance and this request. Stale session, but
          // worth knowing about: a real user just hit a dead session.
          log.warn("auth.session_user_missing", { userId: uid });
        }
      }
      return session;
    },
  },
});
