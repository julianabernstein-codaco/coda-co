import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Gate for every admin *page*. Anonymous visitors get the sign-in page.
// A signed-in non-admin gets it too, with `switch` set — they're usually
// someone who clicked an admin link from an email while signed in as a
// test seller or their own vendor account, and silently dropping them on
// the homepage reads as "the link is broken". Server actions keep their
// own harder checks (see requireAdmin in lib/api/applications.ts).
export async function requireAdminPage(path: string) {
  const session = await auth();
  const next = encodeURIComponent(path);
  if (!session?.user) redirect(`/login?next=${next}`);
  if (session.user.role !== "admin") redirect(`/login?next=${next}&switch=1`);
  return session.user;
}
