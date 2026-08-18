import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// Every dashboard page calls this. Anon users go to login; signed-in
// users without a vendor_profile get bounced to the application flow.
export async function requireVendor() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/dashboard");

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    include: { subscriptions: true, payments: true },
  });
  if (!vendor) redirect("/list-with-us");

  return { user: session.user, vendor };
}

// The mirror image, for the signup wizards: a user who already has a shop
// can't create a second one (vendor_profile.user_id is unique), so send
// them to the dashboard rather than letting them fill out a form that
// can only fail at the end.
export async function redirectIfVendor(userId: string) {
  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (vendor) redirect("/dashboard");
}
