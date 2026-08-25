import { prisma } from "@/lib/db";

// Account holders — every row in `users`. That's the single store for
// anyone who can sign in to codaco.market: buyers, vendors and admins
// alike (a vendor is a `users` row with a `vendor_profile` attached).
// Waitlist signers are *not* account holders — they live in
// `waitlist_signups` and have no credentials.

export type AccountRole = "unknown" | "user" | "admin";

export interface AccountHolderRow {
  id: string;
  email: string;
  name: string | null;
  role: AccountRole;
  // Whether the account can sign in with a password. False for a row
  // created by an adapter flow that never set one (future OAuth).
  hasPassword: boolean;
  emailVerified: boolean;
  // Set when the user has a `vendor_profile`; null for plain buyers.
  vendorSlug: string | null;
  vendorName: string | null;
  applicationCount: number;
  orderCount: number;
  // YYYY-MM-DD, formatted here so the admin client component doesn't
  // have to carry Date objects across the RSC boundary.
  createdAt: string;
}

// Full account list for the admin database viewer, newest first. Never
// selects `password_hash` — the view is read-only and the hash has no
// business leaving the server.
export async function getAccountHolders(): Promise<AccountHolderRow[]> {
  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
      emailVerified: true,
      createdAt: true,
      vendorProfile: { select: { slug: true, displayName: true } },
      _count: { select: { applications: true, orders: true } },
    },
  });

  return rows.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    hasPassword: Boolean(u.passwordHash),
    emailVerified: u.emailVerified !== null,
    vendorSlug: u.vendorProfile?.slug ?? null,
    vendorName: u.vendorProfile?.displayName ?? null,
    applicationCount: u._count.applications,
    orderCount: u._count.orders,
    createdAt: u.createdAt.toISOString().slice(0, 10),
  }));
}
