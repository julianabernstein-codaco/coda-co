"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/applications";
import { prisma } from "@/lib/db";
import { log } from "@/lib/log";

// Flip one public-visibility switch for a vendor's contact links. Admin-only.
// The link value itself (websiteUrl / instagramHandle) is untouched — this
// only controls whether it renders on the public profile.
export async function setVendorContactVisibility(
  slug: string,
  field: "showWebsite" | "showInstagram",
  value: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized" };

  const data =
    field === "showWebsite" ? { showWebsite: value } : { showInstagram: value };
  try {
    await prisma.vendorProfile.update({ where: { slug }, data });
  } catch (err) {
    log.error("admin.vendor_contact_visibility_failed", { slug, field, err });
    return { ok: false, error: "Could not update. Try again." };
  }

  revalidatePath("/admin/vendors");
  revalidatePath(`/services/${slug}`);
  return { ok: true };
}
