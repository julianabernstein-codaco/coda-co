// Grant or revoke the `admin` role on an existing account.
//
//   DATABASE_URL=... npm run admin:list
//   DATABASE_URL=... npm run admin:promote -- julie@codaco.market
//   DATABASE_URL=... npm run admin:demote  -- julie@codaco.market
//
// There is no UI for this: `/admin` is read-only and `/signup` hardcodes
// role="user" (app/signup/actions.ts), so the role is set out-of-band and
// deliberately stays that way — an in-app "make this person an admin"
// button would be the single most valuable thing for an attacker who got
// one admin session.
//
// This never creates accounts and never touches passwords. The person
// signs up normally at /signup first (with the invite code); this only
// changes their role. That keeps credential handling out of the script
// entirely — nothing here can leak or set a password.
//
// Role changes take effect on the person's *next request*, with no
// sign-out needed: the `jwt` callback in auth.ts re-reads users.role on
// every request, so a demote lands within seconds even on a machine
// that's already signed in.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { normalizeSslmode } from "../lib/connectionString";
import { isDemoEmail } from "../lib/demo";

config({ path: ".env" });

const adapter = new PrismaPg({
  connectionString: normalizeSslmode(process.env.DATABASE_URL!),
});
const prisma = new PrismaClient({ adapter });

type Mode = "list" | "promote" | "demote";

const USAGE = `Usage:
  npm run admin:list
  npm run admin:promote -- <email>
  npm run admin:demote  -- <email>`;

async function listAdmins(): Promise<{ email: string; name: string | null }[]> {
  return prisma.user.findMany({
    where: { role: "admin" },
    select: { email: true, name: true },
    orderBy: { email: "asc" },
  });
}

function printAdmins(admins: { email: string; name: string | null }[]): void {
  if (admins.length === 0) {
    console.log("No admins.");
    return;
  }
  console.log(`Admins (${admins.length}):`);
  for (const a of admins) console.log(`  ${a.email}${a.name ? `  (${a.name})` : ""}`);
}

async function main() {
  const mode = (process.argv[2] ?? "").trim() as Mode;
  if (!["list", "promote", "demote"].includes(mode)) {
    console.error(USAGE);
    process.exit(2);
  }

  if (mode === "list") {
    printAdmins(await listAdmins());
    return;
  }

  // Normalized the same way authorize() normalizes a submitted email, so
  // the row this matches is the row that will actually sign in.
  const email = (process.argv[3] ?? "").trim().toLowerCase();
  if (!email) {
    console.error(USAGE);
    process.exit(2);
  }

  // Mock accounts share one password that's published in this repo. Making
  // one of them an admin would hand out the admin role with it. Only blocks
  // promotion — demoting a mock admin (the one prisma/mock.ts seeds) is a
  // cleanup worth supporting, not something to refuse.
  if (mode === "promote" && isDemoEmail(email)) {
    console.error(
      `Refusing: ${email} is a mock account (see lib/demo.ts). Its password is\n` +
        `published in this repo, so it must never hold the admin role.`,
    );
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true, passwordHash: true },
  });

  if (!user) {
    console.error(
      `No account for ${email}.\n` +
        `This script only changes an existing account's role — it never creates\n` +
        `accounts or sets passwords. Have them sign up at /signup first (they'll\n` +
        `need the invite code), then re-run this.`,
    );
    process.exit(1);
  }

  const targetRole = mode === "promote" ? "admin" : "user";

  if (user.role === targetRole) {
    console.log(`${email} is already ${targetRole} — nothing to do.`);
    printAdmins(await listAdmins());
    return;
  }

  // Don't strip the last admin anyone can actually sign in as — that locks
  // everyone out of /admin with no in-app way back, recoverable only by
  // another DB write. Mock admins don't count toward that: their sign-in is
  // refused once the site is public (lib/demo.ts), so leaving one behind
  // isn't a way back in.
  if (mode === "demote") {
    const usable = (await listAdmins()).filter((a) => !isDemoEmail(a.email));
    if (usable.length <= 1 && !isDemoEmail(email)) {
      console.error(
        `Refusing: ${email} is the only admin that can sign in. Promote someone\n` +
          `else first, otherwise nobody can reach /admin.`,
      );
      process.exit(1);
    }
  }

  await prisma.user.update({ where: { id: user.id }, data: { role: targetRole } });

  console.log(
    `${mode === "promote" ? "Promoted" : "Demoted"} ${email}: ${user.role} → ${targetRole}`,
  );
  if (mode === "promote" && !user.passwordHash) {
    // OAuth-only accounts can't sign in through the credentials path at all
    // (authorize() returns null without a passwordHash), which is the
    // stronger setup — flagged so it doesn't look like a bug later.
    console.log("Note: this account has no password (OAuth-only sign-in).");
  }
  console.log("Takes effect on their next request — no sign-out needed.\n");
  printAdmins(await listAdmins());
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
