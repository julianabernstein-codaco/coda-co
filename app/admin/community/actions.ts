"use server";

import { revalidatePath } from "next/cache";
import { normalizeSlug, requireAdmin } from "@/lib/api/applications";
import { prisma } from "@/lib/db";
import { normalizeZip } from "@/lib/geo/zip";
import { log } from "@/lib/log";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX = 120;
const BIO_MAX = 500;
const DESC_MAX = 500;

type LocationType = "in_person" | "virtual" | "both";

export interface CommunityListingInput {
  orgName: string;
  contactEmail: string;
  city: string;
  state: string;
  zip: string;
  serviceTypeSlug: string;
  locationType: LocationType;
  bio: string;
  serviceDescription?: string;
  website?: string;
}

export type CommunityListingResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

function formatsLabel(t: LocationType): string {
  if (t === "both") return "In person & virtual";
  if (t === "virtual") return "Virtual";
  return "In person";
}

function normalizeWebsite(raw: string | undefined): string | null {
  const s = (raw ?? "").trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

async function uniqueSlug(seed: string): Promise<string> {
  const base = normalizeSlug(seed);
  if (!base) throw new Error("Could not derive a slug from the organization name");
  let candidate = base;
  let n = 2;
  while (true) {
    const [profile, app] = await Promise.all([
      prisma.vendorProfile.findUnique({ where: { slug: candidate }, select: { id: true } }),
      prisma.vendorApplication.findFirst({ where: { proposedSlug: candidate }, select: { id: true } }),
    ]);
    if (!profile && !app) return candidate;
    candidate = `${base}-${n++}`;
  }
}

// Admin-only: create a free, published community listing (a vendor_profile
// flagged communityListing) for a volunteer-led org, plus a lightweight
// user (no password — admin-managed) so client inquiries reach their email.
// No subscription or payment: these listings are free forever.
export async function createCommunityListing(
  input: CommunityListingInput,
): Promise<CommunityListingResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized." };

  const orgName = input.orgName?.trim() ?? "";
  const email = input.contactEmail?.trim().toLowerCase() ?? "";
  const city = input.city?.trim() ?? "";
  const state = input.state?.trim() ?? "";
  const bio = input.bio?.trim() ?? "";
  const serviceDescription = input.serviceDescription?.trim() || null;

  if (!orgName) return { ok: false, error: "Add the organization name." };
  if (orgName.length > NAME_MAX) return { ok: false, error: "Organization name is too long." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid contact email." };
  if (!city || !state) return { ok: false, error: "Add a city and state." };
  const zip = normalizeZip(input.zip);
  if (!zip) return { ok: false, error: "Add a valid 5-digit zip code." };
  if (!bio) return { ok: false, error: "Add a short description of the organization." };
  if (bio.length > BIO_MAX) return { ok: false, error: `Description is too long — under ${BIO_MAX} characters.` };
  if (serviceDescription && serviceDescription.length > DESC_MAX) {
    return { ok: false, error: `"What they offer" is too long — under ${DESC_MAX} characters.` };
  }

  const serviceType = await prisma.serviceType.findUnique({
    where: { slug: input.serviceTypeSlug },
    select: { id: true, name: true, slug: true },
  });
  if (!serviceType) return { ok: false, error: "Pick a valid service type." };

  // Reuse an existing account for this email if it has no vendor yet;
  // never hijack an email that already runs a vendor.
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { vendorProfile: { select: { slug: true } } },
  });
  if (existingUser?.vendorProfile) {
    return { ok: false, error: `That email already has a vendor (${existingUser.vendorProfile.slug}).` };
  }

  const slug = await uniqueSlug(orgName);
  const website = normalizeWebsite(input.website);

  try {
    const vendor = await prisma.$transaction(async (tx) => {
      const userId =
        existingUser?.id ??
        (
          await tx.user.create({
            data: { email, name: orgName, role: "user" },
            select: { id: true },
          })
        ).id;

      const v = await tx.vendorProfile.create({
        data: {
          userId,
          slug,
          displayName: orgName,
          bio,
          location: `${city}, ${state}`,
          kind: "services",
          verified: false,
          published: true,
          communityListing: true,
          zip,
          serviceDescription,
          serviceFormats: formatsLabel(input.locationType),
          websiteUrl: website,
          showWebsite: Boolean(website),
        },
        select: { id: true, slug: true },
      });

      // First (published) service so the org appears in /services search.
      const baseServiceSlug = `${slug}-${serviceType.slug}`;
      let serviceSlug = baseServiceSlug;
      let n = 2;
      while (await tx.service.findUnique({ where: { slug: serviceSlug }, select: { id: true } })) {
        serviceSlug = `${baseServiceSlug}-${n++}`;
      }
      await tx.service.create({
        data: {
          vendorId: v.id,
          serviceTypeId: serviceType.id,
          slug: serviceSlug,
          title: serviceType.name,
          description: serviceDescription ?? bio,
          locationType: input.locationType,
          pricingModel: "quote",
          currency: "USD",
          status: "published",
        },
      });

      return v;
    });

    log.info("admin.community_listing_created", {
      adminId: admin.id,
      vendorSlug: vendor.slug,
    });
    revalidatePath("/services");
    revalidatePath("/admin/vendors");
    return { ok: true, slug: vendor.slug };
  } catch (err) {
    log.error("admin.community_listing_failed", { orgName, err });
    return { ok: false, error: "Could not create the listing. Try again." };
  }
}
