"use server";

import type { ApplicationKind, Prisma, SubscriptionPlanId } from "@prisma/client";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import {
  autoApproveAsAdmin,
  createApplication,
  normalizeSlug,
} from "@/lib/api/applications";
import { createListing, uniqueProductSlug } from "@/lib/api/products";
import { isValidSpecialization } from "@/lib/data/specializations";
import { formatPriceRange } from "@/lib/format/product";
import { normalizeZip, parseRadiusLabel } from "@/lib/geo/zip";
import { prisma } from "@/lib/db";
import { processUploadedImage, type ProcessedImage } from "@/lib/images.server";
import {
  sendApplicationSubmittedEmail,
  sendListYourGoodsEmail,
  sendNewVendorSignupEmail,
} from "@/lib/email/templates";
import { log } from "@/lib/log";

export interface ApplicationFormState {
  error?: string;
}

const VALID_KINDS = new Set<ApplicationKind>(["goods", "services", "both"]);
const VALID_PLANS = new Set<SubscriptionPlanId>(["starter", "standard", "pro"]);
// Mirrors the maxLength on the corresponding textareas in ServicesForm
// / GoodsForm. Server-side enforcement is what actually keeps a
// copy-paste or scripted client from overrunning the column.
const BIO_MAX = 500;
const DESC_MAX = 500;
const NOTES_MAX = 500;
// Mirrors the maxLength on the first-item description in GoodsForm.
const ITEM_DESC_MAX = 1000;

interface SubmitInput {
  kind: Exclude<ApplicationKind, "unknown">;
  displayName: string;
  // Notification-only: surfaced in the team's new-signup email so admins can
  // review without opening the site. Not persisted here — the vendor profile
  // is built from the application at approval time. Required for goods
  // applicants (see the kind check below); optional for services.
  firstName?: string;
  lastName?: string;
  companyName?: string;
  website?: string;
  instagram?: string;
  bio: string;
  city: string;
  state: string;
  planId: SubscriptionPlanId;
  // Curated tags the applicant picked on Step 2. Validated against
  // the canonical list — anything unrecognized is dropped silently.
  specializations?: string[];
  zip?: string;
  // Services form only — the chosen service-radius pill ("15 mi",
  // "Virtual only"). Parsed to a numeric mileage server-side.
  radius?: string;
  serviceDescription?: string;
  pricingNotes?: string;
  lifeStages?: string[];
  // Services form only — used by approveApplication to auto-create
  // the vendor's first draft Service from data they already gave us.
  serviceTypeSlug?: string;
  inHome?: boolean;
  virtual?: boolean;
  // Services form only — the availability day/hour pills the applicant
  // picked. Joined and carried onto the profile's display fields.
  availableDays?: string[];
  availableHours?: string[];
  // Goods form only — the seller declared their goods need personalization
  // or contact with the buyer, so they can't be bought outright on the site.
  requiresCustomOrder?: boolean;
  // Goods form only — the first listing, collected during signup so CodaCo
  // can review it before the shop goes public. Required for goods.
  firstItem?: FirstItemInput;
}

export interface FirstItemInput {
  title: string;
  productTypeSlug: string;
  // Dollars as typed in the form; converted to cents server-side.
  startingPrice: number;
  description: string;
  // Cropped cover photo from the signup form's uploader. Server actions
  // can carry a File across the boundary, so this arrives as the real
  // bytes and goes through the same sharp + Blob pipeline as a cover
  // uploaded later from the dashboard.
  photo: File;
}

const VALID_LIFE_STAGES = new Set<string>([
  "planning-ahead",
  "active-dying",
  "post-death",
  "throughout",
]);

type ServiceLocation = "unknown" | "virtual" | "in_person" | "both";

function deriveLocationType(
  inHome: boolean | undefined,
  virtual: boolean | undefined,
): ServiceLocation {
  if (inHome && virtual) return "both";
  if (inHome) return "in_person";
  if (virtual) return "virtual";
  return "unknown";
}

// Returns a unique slug by appending -2, -3, … if the seed collides.
async function uniqueSlug(seed: string): Promise<string> {
  const base = normalizeSlug(seed);
  if (!base) throw new Error("Could not derive a slug from the display name");
  let candidate = base;
  let n = 2;
  // Vendor profiles are the canonical owners of slugs once approved; we
  // also probe vendor_applications so a new applicant doesn't collide
  // with one already in flight.
  while (true) {
    const [profile, app] = await Promise.all([
      prisma.vendorProfile.findUnique({ where: { slug: candidate }, select: { id: true } }),
      prisma.vendorApplication.findFirst({ where: { proposedSlug: candidate }, select: { id: true } }),
    ]);
    if (!profile && !app) return candidate;
    candidate = `${base}-${n++}`;
  }
}

// Turns the item captured on Step 2 into the vendor's first product:
// uploads the processed cover, then writes the product + its default
// variant. Lands in `pending_review` so it shows up in /admin/listings —
// approving it is what publishes both the listing and the shop.
//
// A cover upload failure downgrades the listing to a draft instead of
// failing the signup: publishing needs a cover, so parking it in review
// without one would stall the seller behind a listing nobody can approve.
async function createFirstListing(
  vendorId: string,
  item: FirstItemInput,
  image: ProcessedImage,
) {
  const slug = await uniqueProductSlug(item.title);

  let coverImageUrl: string | null = null;
  try {
    const key = `products/${slug}/cover-${Date.now()}.${image.ext}`;
    const blob = await put(key, image.buffer, {
      access: "public",
      contentType: image.contentType,
    });
    coverImageUrl = blob.url;
  } catch (err) {
    log.warn("application.first_listing_cover_failed", { vendorId, err });
  }

  const productType = await prisma.productType.findUnique({
    where: { slug: item.productTypeSlug },
    select: { name: true },
  });
  const priceCents = Math.round(item.startingPrice * 100);
  const status = coverImageUrl ? "pending_review" : "draft";

  const product = await createListing({
    vendorId,
    productTypeSlug: item.productTypeSlug,
    slug,
    title: item.title.trim(),
    description: item.description.trim(),
    priceCents,
    coverImageUrl,
    status,
  });
  if (!product) return null;

  log.info("application.first_listing_created", {
    vendorId,
    productId: product.id,
    status,
  });
  return {
    ...product,
    status,
    productTypeName: productType?.name ?? null,
    priceLabel: formatPriceRange(priceCents / 100, priceCents / 100),
  };
}

async function submit(input: SubmitInput): Promise<ApplicationFormState> {
  if (!VALID_KINDS.has(input.kind)) return { error: "Invalid application kind." };
  if (!VALID_PLANS.has(input.planId)) return { error: "Pick a plan to continue." };
  if (!input.displayName.trim()) return { error: "Tell us your shop or practice name." };
  // Goods sellers must give both a company name (which becomes the shop
  // name) and the person behind it, so we always know who we're dealing
  // with. Mirrors the Step 1 gate in GoodsForm.
  if (input.kind === "goods") {
    if (!input.companyName?.trim()) {
      return { error: "Add a company name for your shop." };
    }
    if (!input.firstName?.trim() || !input.lastName?.trim()) {
      return { error: "Add your first and last name." };
    }
  }
  if (!input.city.trim() || !input.state.trim()) {
    return { error: "Add a city and state." };
  }
  // Zip is required for every applicant — it drives the geographic
  // search filter (zip + radius for services; location for goods).
  const normalizedZip = normalizeZip(input.zip);
  if (!normalizedZip) {
    return { error: "Add a valid 5-digit zip code so buyers can find you." };
  }
  if (!input.bio.trim()) {
    return { error: "Tell clients a bit about you (the 'About you' field)." };
  }
  if (input.bio.length > BIO_MAX) {
    return { error: `Bio is too long — keep it under ${BIO_MAX} characters.` };
  }
  // serviceDescription/pricingNotes are sent by the services form only.
  // Goods leaves them undefined; we skip both checks in that case.
  if (input.serviceDescription !== undefined) {
    if (!input.serviceDescription.trim()) {
      return { error: "Add a service description." };
    }
    if (input.serviceDescription.length > DESC_MAX) {
      return { error: `Service description is too long — keep it under ${DESC_MAX} characters.` };
    }
  }
  // Goods signup collects the seller's first listing on Step 2. Validate it
  // before anything is written, so a bad item can't leave a half-built shop.
  let firstItemImage: ProcessedImage | null = null;
  if (input.kind === "goods") {
    const item = input.firstItem;
    if (!item?.title.trim()) return { error: "Give your first item a title." };
    if (!item.productTypeSlug.trim()) return { error: "Pick a product type for your item." };
    if (!Number.isFinite(item.startingPrice) || item.startingPrice < 0) {
      return { error: "Enter a starting price for your item." };
    }
    if (item.description.length > ITEM_DESC_MAX) {
      return { error: `Item description is too long — keep it under ${ITEM_DESC_MAX} characters.` };
    }
    if (!(item.photo instanceof File) || item.photo.size === 0) {
      return { error: "Add a photo of your item." };
    }
    const known = await prisma.productType.findUnique({
      where: { slug: item.productTypeSlug },
      select: { id: true },
    });
    if (!known) return { error: "Pick a product type for your item." };
    // Decode/strip/re-encode up front: a corrupt or hostile file fails here,
    // before the application row exists, so the seller can just fix it and
    // resubmit.
    const processed = await processUploadedImage(item.photo);
    if (!processed.ok) return { error: processed.error };
    firstItemImage = processed.image;
  }

  if (
    input.pricingNotes !== undefined &&
    input.pricingNotes.length > NOTES_MAX
  ) {
    return { error: `Pricing notes are too long — keep them under ${NOTES_MAX} characters.` };
  }

  const session = await auth();
  if (!session?.user) {
    // Visitors who hit this server action while signed-out get sent to
    // signup with a deep-link back to the form they came from.
    redirect(`/signup?next=/list-with-us/${input.kind === "services" ? "services" : "goods"}`);
  }

  // One shop per account — vendor_profile.user_id is unique, so a second
  // signup would blow up on the profile insert at approval time (after the
  // application row is already written). Both wizards redirect an existing
  // vendor to their dashboard before they see the form; this catches anyone
  // who got past that, and keeps the failure a message rather than a 500.
  const existingVendor = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (existingVendor) {
    return {
      error:
        "This account already has a shop on CodaCo. Open your dashboard to add listings or edit it.",
    };
  }

  const slug = await uniqueSlug(input.displayName);

  // Drop anything not in the canonical lists; de-dupe just in case the
  // client sent the same tag twice.
  const specializations = Array.from(
    new Set((input.specializations ?? []).filter(isValidSpecialization)),
  );
  const lifeStages = Array.from(
    new Set((input.lifeStages ?? []).filter((s) => VALID_LIFE_STAGES.has(s))),
  );

  const zip = normalizedZip ?? (input.zip?.trim() || null);
  const serviceRadiusMi = parseRadiusLabel(input.radius);
  const serviceDescription = input.serviceDescription?.trim() || null;
  const pricingNotes = input.pricingNotes?.trim() || null;
  // Join the availability pills into the free-text display strings the
  // profile's service-area card renders. Capped so a tampered client
  // can't overrun the column.
  const serviceDays = (input.availableDays ?? []).join(", ").slice(0, 200) || null;
  const serviceHours = (input.availableHours ?? []).join(", ").slice(0, 200) || null;

  // For services applicants, look up the picked service type so we
  // only persist a slug that resolves at approval time. For goods, no
  // service type is in play.
  let serviceTypeSlug: string | null = null;
  let serviceTypeName: string | null = null;
  if (input.kind === "services" || input.kind === "both") {
    const raw = input.serviceTypeSlug?.trim();
    if (raw) {
      const match = await prisma.serviceType.findUnique({
        where: { slug: raw },
        select: { slug: true, name: true },
      });
      serviceTypeSlug = match?.slug ?? null;
      serviceTypeName = match?.name ?? null;
    }
  }
  const serviceLocationType = deriveLocationType(input.inHome, input.virtual);

  const app = await createApplication({
    applicantUserId: session.user.id,
    kind: input.kind,
    proposedDisplayName: input.displayName.trim(),
    proposedSlug: slug,
    proposedBio: input.bio.trim(),
    location: `${input.city.trim()}, ${input.state.trim()}`,
    planId: input.planId,
    specializations,
    zip,
    serviceRadiusMi,
    serviceDescription,
    pricingNotes,
    lifeStages,
    serviceTypeSlug,
    serviceLocationType,
    serviceDays,
    serviceHours,
    website: input.website?.trim() || null,
    instagram: input.instagram?.trim() || null,
    // Only the goods form asks this; services applications always store false.
    requiresCustomOrder: input.kind === "goods" && input.requiresCustomOrder === true,
  });

  // They finished — drop any in-progress signup draft so it no longer
  // shows up as an abandoned signup.
  await prisma.vendorSignupDraft.deleteMany({ where: { userId: session.user.id } });

  // Pure goods shops are self-serve: the shop page itself isn't reviewed.
  // Auto-approve so the maker lands straight in their dashboard, then park
  // the item they just uploaded in the listing-review queue. The shop stays
  // unpublished (vendor_profile.published = false) until CodaCo approves
  // that listing. Services / both still go through manual review below.
  let firstListing: Awaited<ReturnType<typeof createFirstListing>> = null;
  if (input.kind === "goods") {
    const vendor = await autoApproveAsAdmin(app.id, { notify: false });
    // Past this point the vendor row exists and the applicant can't
    // resubmit (vendor_profile.user_id is unique), so a listing failure is
    // logged and recovered from in the dashboard — never thrown at them.
    try {
      firstListing = await createFirstListing(vendor.id, input.firstItem!, firstItemImage!);
    } catch (err) {
      log.error("application.first_listing_failed", {
        applicationId: app.id,
        vendorId: vendor.id,
        err,
      });
    }
  }

  // Ping the team inbox on every new signup. Goods shops (kind === "goods")
  // are auto-approved and skip the review queue, so we flag them as such;
  // services / both land in manual review. Best-effort — a mail hiccup must
  // never fail the applicant's submission.
  const fullName =
    `${input.firstName?.trim() ?? ""} ${input.lastName?.trim() ?? ""}`.trim() ||
    null;
  const adminPing = await sendNewVendorSignupEmail({
    displayName: input.displayName.trim(),
    fullName,
    companyName: input.companyName?.trim() || null,
    website: input.website?.trim() || null,
    instagram: input.instagram?.trim() || null,
    kind: input.kind,
    city: input.city.trim(),
    state: input.state.trim(),
    serviceType: serviceTypeName,
    applicantEmail: session.user.email!,
    needsReview: input.kind !== "goods",
    requiresCustomOrder: input.kind === "goods" && input.requiresCustomOrder === true,
    firstListing: firstListing
      ? {
          title: firstListing.title,
          productType: firstListing.productTypeName,
          priceLabel: firstListing.priceLabel,
          awaitingReview: firstListing.status === "pending_review",
        }
      : null,
  });
  if (!adminPing.ok) {
    log.warn("application.admin_notify_failed", {
      applicationId: app.id,
      err: adminPing.error,
    });
  }

  // Welcome the maker and tell them where their first listing stands,
  // instead of the generic "application approved" note.
  if (input.kind === "goods") {
    const nudge = await sendListYourGoodsEmail({
      toEmail: session.user.email!,
      toName: session.user.name ?? null,
      displayName: input.displayName.trim(),
      firstListingTitle: firstListing?.status === "pending_review" ? firstListing.title : null,
    });
    if (!nudge.ok) {
      log.warn("application.list_goods_email_failed", {
        applicationId: app.id,
        err: nudge.error,
      });
    }
    // A listing that couldn't be created (or lost its photo) lands the
    // seller in the product editor to finish it rather than a dashboard
    // that looks like their item vanished.
    redirect(
      firstListing && firstListing.status !== "pending_review"
        ? `/dashboard/products/${firstListing.id}`
        : "/dashboard",
    );
  }

  // Demo auto-approve: a single env flag flips the admin queue off so a
  // prospect can sign up and have a working dashboard in under a minute.
  // Off in production. The admin queue still works either way. The
  // approval email fires from approveApplication, so we deliberately do
  // NOT also send the "we got it" email here — back-to-back submitted +
  // approved emails in seconds is confusing.
  if (process.env.DEMO_AUTO_APPROVE_VENDORS === "1") {
    await autoApproveAsAdmin(app.id);
    redirect("/dashboard");
  }

  // Manual-review path: confirm receipt by email. Best-effort — never
  // fail the submission because Resend hiccuped.
  const emailResult = await sendApplicationSubmittedEmail({
    toEmail: session.user.email!,
    toName: session.user.name ?? null,
    displayName: input.displayName.trim(),
    kind: input.kind,
  });
  if (!emailResult.ok) {
    log.warn("application.submitted_email_failed", {
      applicationId: app.id,
      err: emailResult.error,
    });
  }

  redirect("/list-with-us/confirm");
}

export interface SaveSignupDraftInput {
  kind: "goods" | "services";
  step: number;
  // Partial form state so far. Stored as-is (size-guarded) for internal
  // funnel tracking of who started a listing but didn't finish.
  data: Record<string, unknown>;
}

// Best-effort: upsert the signed-in user's in-progress signup as they
// advance through the listing form. Auth-gated (the listing pages already
// require a session) and never throws into the caller — draft-save must
// not disrupt the form. The draft is deleted on submit.
export async function saveSignupDraft(input: SaveSignupDraftInput): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user) return;
    if (input.kind !== "goods" && input.kind !== "services") return;

    const data =
      input.data && typeof input.data === "object" && !Array.isArray(input.data)
        ? input.data
        : {};
    // Guard against oversized / crafted payloads — drop the body if huge.
    let json: Prisma.InputJsonValue = {};
    try {
      if (JSON.stringify(data).length <= 10_000) json = data as Prisma.InputJsonValue;
    } catch {
      json = {};
    }
    const step = Number.isFinite(input.step)
      ? Math.max(0, Math.min(20, Math.trunc(input.step)))
      : 0;

    const company = typeof data.companyName === "string" ? data.companyName.trim() : "";
    const first = typeof data.firstName === "string" ? data.firstName.trim() : "";
    const last = typeof data.lastName === "string" ? data.lastName.trim() : "";
    const orgName = company || `${first} ${last}`.trim() || null;

    const fields = {
      kind: input.kind,
      lastStep: step,
      data: json,
      orgName,
      email: session.user.email ?? null,
    };
    await prisma.vendorSignupDraft.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, ...fields },
      update: fields,
    });
  } catch (err) {
    log.warn("signup_draft.save_failed", { err });
  }
}

export async function submitGoodsApplication(input: Omit<SubmitInput, "kind">) {
  return submit({ ...input, kind: "goods" });
}

export async function submitServicesApplication(input: Omit<SubmitInput, "kind">) {
  return submit({ ...input, kind: "services" });
}
