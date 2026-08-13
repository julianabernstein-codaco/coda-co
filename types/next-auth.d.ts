import "next-auth";
import type { UserRole } from "@prisma/client";

// Augments the Auth.js session shape so RSC code can read `session.user.role`
// without an `as` cast. The `jwt` and `session` callbacks in auth.ts populate
// these fields on every request.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: UserRole;
    // Password version this token was minted against (users.passwordChangedAt
    // as epoch ms, 0 when null). The `jwt` callback invalidates the token if
    // the DB value has moved on — i.e. the password changed since sign-in.
    pwc?: number;
  }
}
