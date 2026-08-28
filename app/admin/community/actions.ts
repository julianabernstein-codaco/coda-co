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

interface CleanListing {
  orgName: string;
  email: string;
  city: string;
  state: string;
  zip: string;
  bio: string;
  serviceDescription: string | null;
}

// Shared field validation for create + edit. Returns cleaned values or a
// user-facing error.
function parseListing(
  input: CommunityListingInput,
): { ok: true; data: CleanListing } | { ok: false; error: string } {
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
  return { ok: true, data: { orgName, email, city, state, zip, bio, serviceDescription } };
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

  const parsed = parseListing(input);
  if (!parsed.ok) return parsed;
  const { orgName, email, city, state, zip, bio, serviceDescription } = parsed.data;

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

export interface UpdateCommunityListingInput extends CommunityListingInput {
  // Slug of the community listing to edit. The slug itself never changes,
  // so links and inbound references stay stable across edits.
  slug: string;
}

// Admin-only: edit an existing community listing's profile — the org's
// name, contact email, location, description, format, type, and website.
// Keeps the org's (login-less) account email in sync so inquiries still
// route correctly, and updates its primary published service.
export async function updateCommunityListing(
  input: UpdateCommunityListingInput,
): Promise<CommunityListingResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized." };

  const parsed = parseListing(input);
  if (!parsed.ok) return parsed;
  const { orgName, email, city, state, zip, bio, serviceDescription } = parsed.data;

  const serviceType = await prisma.serviceType.findUnique({
    where: { slug: input.serviceTypeSlug },
    select: { id: true, name: true, slug: true },
  });
  if (!serviceType) return { ok: false, error: "Pick a valid service type." };

  const vendor = await prisma.vendorProfile.findUnique({
    where: { slug: input.slug },
    select: {
      id: true,
      communityListing: true,
      user: { select: { id: true, email: true } },
      services: { orderBy: { createdAt: "asc" }, take: 1, select: { id: true } },
    },
  });
  if (!vendor) return { ok: false, error: "Listing not found." };
  if (!vendor.communityListing) {
    return { ok: false, error: "That vendor isn't a community listing." };
  }

  // Guard the email swap against colliding with a different account.
  if (email !== vendor.user.email.toLowerCase()) {
    const clash = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (clash && clash.id !== vendor.user.id) {
      return { ok: false, error: "Another account already uses that email." };
    }
  }

  const website = normalizeWebsite(input.website);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: vendor.user.id },
        data: { email, name: orgName },
      });
      await tx.vendorProfile.update({
        where: { id: vendor.id },
        data: {
          displayName: orgName,
          bio,
          location: `${city}, ${state}`,
          zip,
          serviceDescription,
          serviceFormats: formatsLabel(input.locationType),
          websiteUrl: website,
          showWebsite: Boolean(website),
        },
      });
      const svc = vendor.services[0];
      if (svc) {
        await tx.service.update({
          where: { id: svc.id },
          data: {
            serviceTypeId: serviceType.id,
            title: serviceType.name,
            description: serviceDescription ?? bio,
            locationType: input.locationType,
          },
        });
      }
    });

    log.info("admin.community_listing_updated", {
      adminId: admin.id,
      vendorSlug: input.slug,
    });
    revalidatePath("/services");
    revalidatePath(`/services/${input.slug}`);
    revalidatePath("/admin/community");
    return { ok: true, slug: input.slug };
  } catch (err) {
    log.error("admin.community_listing_update_failed", { slug: input.slug, err });
    return { ok: false, error: "Could not save changes. Try again." };
  }
}
