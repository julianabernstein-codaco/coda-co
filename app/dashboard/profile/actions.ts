"use server";

import { revalidatePath } from "next/cache";
import { del, put } from "@vercel/blob";
import { requireVendor } from "@/app/dashboard/lib";
import { isValidSpecialization } from "@/lib/data/specializations";
import { prisma } from "@/lib/db";
import { isOwnedBlobUrl } from "@/lib/images";
import { processUploadedImage } from "@/lib/images.server";
import { log } from "@/lib/log";
import { rateLimit } from "@/lib/rate-limit";

const VALID_LIFE_STAGES = new Set<string>([
  "planning-ahead",
  "active-dying",
  "post-death",
  "throughout",
]);

// Server-side caps on the three textarea fields. Mirrors the
// maxLength + counter values on ProfileForm and the equivalents on
// the application form / submit action — keep all in sync.
const BIO_MAX = 500;
const DESC_MAX = 500;
const NOTES_MAX = 500;

const TONES = ["sage", "terracotta"] as const;
type Tone = (typeof TONES)[number];

function isTone(value: string): value is Tone {
  return (TONES as readonly string[]).includes(value);
}

export type ProfileFormState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; error: string };

// Trims; empty/whitespace -> null so we don't persist "" or pad rows.
function emptyToNull(raw: FormDataEntryValue | null): string | null {
  const s = String(raw ?? "").trim();
  return s === "" ? null : s;
}

// Instagram handle: strip any leading @ so display is consistent.
function normalizeInstagram(raw: FormDataEntryValue | null): string | null {
  const s = emptyToNull(raw);
  return s ? s.replace(/^@+/, "") : null;
}

// Light website URL sanity check. Accepts http(s) URLs only; rejects
// scheme-less inputs ("example.com") so we never produce a broken link.
function normalizeWebsite(raw: FormDataEntryValue | null): string | null | "invalid" {
  const s = emptyToNull(raw);
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "invalid";
    return u.toString();
  } catch {
    return "invalid";
  }
}

export async function updateVendorProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const { vendor } = await requireVendor();

  const toneRaw = String(formData.get("photoTone") ?? "").trim();
  if (!isTone(toneRaw)) {
    return { status: "error", error: "Pick a frame color." };
  }

  const websiteUrl = normalizeWebsite(formData.get("websiteUrl"));
  if (websiteUrl === "invalid") {
    return { status: "error", error: "Website URL must start with http:// or https://." };
  }

  const bioRaw = String(formData.get("bio") ?? "");
  if (!bioRaw.trim()) {
    return { status: "error", error: "Add a short bio." };
  }
  if (bioRaw.length > BIO_MAX) {
    return {
      status: "error",
      error: `Bio is too long — keep it under ${BIO_MAX} characters.`,
    };
  }
  const bio = bioRaw.trim();

  // Goods-only shops never gave a service description at signup and have no
  // services to describe, so requiring one here would lock them out of their
  // own profile form. Everyone else still has to fill it in.
  const descRaw = String(formData.get("serviceDescription") ?? "");
  if (!descRaw.trim() && vendor.kind !== "goods") {
    return { status: "error", error: "Add a service description." };
  }
  if (descRaw.length > DESC_MAX) {
    return {
      status: "error",
      error: `Service description is too long — keep it under ${DESC_MAX} characters.`,
    };
  }
  // Null rather than "" when a goods-only shop leaves it blank — the public
  // profile hides the row on null, not on empty string.
  const serviceDescription = descRaw.trim() || null;

  const notesRaw = String(formData.get("pricingNotes") ?? "");
  if (notesRaw.length > NOTES_MAX) {
    return {
      status: "error",
      error: `Pricing notes are too long — keep them under ${NOTES_MAX} characters.`,
    };
  }
  const pricingNotes = notesRaw.trim() || null;

  const instagramHandle = normalizeInstagram(formData.get("instagramHandle"));
  const serviceRadius = emptyToNull(formData.get("serviceRadius"));

  // Numeric search radius (miles). Blank -> null (no geographic service
  // area). Reject non-integers / out-of-range so we never persist a
  // value the search filter can't use.
  const radiusRaw = emptyToNull(formData.get("serviceRadiusMi"));
  let serviceRadiusMi: number | null = null;
  if (radiusRaw != null) {
    const n = Number(radiusRaw);
    if (!Number.isInteger(n) || n < 0 || n > 500) {
      return {
        status: "error",
        error: "Search radius must be a whole number of miles (0–500).",
      };
    }
    serviceRadiusMi = n;
  }
  const serviceFormats = emptyToNull(formData.get("serviceFormats"));
  const serviceDays = emptyToNull(formData.get("serviceDays"));
  const serviceHours = emptyToNull(formData.get("serviceHours"));

  // Hidden inputs in the form each carry one selected spec; getAll
  // collects them. Drop anything not in the canonical list (the client
  // can only have made it onto an unknown value through tampering) and
  // de-dupe.
  const specializations = Array.from(
    new Set(
      formData
        .getAll("specializations")
        .map((v) => String(v))
        .filter(isValidSpecialization),
    ),
  );
  const lifeStages = Array.from(
    new Set(
      formData
        .getAll("lifeStages")
        .map((v) => String(v))
        .filter((s) => VALID_LIFE_STAGES.has(s)),
    ),
  );

  const zip = emptyToNull(formData.get("zip"));

  // Only goods vendors are shown the custom-order checkbox, so only their
  // submissions may write the column — otherwise an unchecked box (which
  // browsers omit from FormData entirely) would silently clear it for a
  // services vendor whose form never had the control.
  const sellsGoods = vendor.kind === "goods" || vendor.kind === "both";
  const requiresCustomOrder = formData.get("requiresCustomOrder") != null;

  const photo = formData.get("photo");
  const hasNewPhoto = photo instanceof File && photo.size > 0;

  let nextPhotoUrl: string | null | undefined; // undefined = leave column alone
  if (hasNewPhoto) {
    const limited = await rateLimit(`upload:${vendor.userId}`, {
      limit: 100,
      windowMs: 60 * 60 * 1000,
    });
    if (!limited.ok) {
      log.warn("upload.rate_limited", { kind: "vendor_photo", vendorId: vendor.id });
      return { status: "error", error: "Too many uploads. Try again later." };
    }
    const processed = await processUploadedImage(photo);
    if (!processed.ok) return { status: "error", error: processed.error };
    const { buffer, contentType, ext } = processed.image;
    const key = `vendors/${vendor.slug}/photo-${Date.now()}.${ext}`;
    const blob = await put(key, buffer, { access: "public", contentType });
    nextPhotoUrl = blob.url;
  }

  await prisma.vendorProfile.update({
    where: { id: vendor.id },
    data: {
      photoTone: toneRaw,
      bio,
      websiteUrl,
      instagramHandle,
      serviceRadius,
      serviceRadiusMi,
      serviceFormats,
      serviceDays,
      serviceHours,
      specializations,
      zip,
      serviceDescription,
      pricingNotes,
      lifeStages,
      ...(sellsGoods ? { requiresCustomOrder } : {}),
      ...(nextPhotoUrl !== undefined ? { photoSrc: nextPhotoUrl } : {}),
    },
  });

  // Old blob cleanup is best-effort. If the delete fails (network blip,
  // already gone), the row is still correct — we just leak one object.
  // Log so a sustained pattern of failures is visible in ops.
  if (hasNewPhoto && isOwnedBlobUrl(vendor.photoSrc)) {
    try {
      await del(vendor.photoSrc);
    } catch (err) {
      log.warn("blob.delete_failed", {
        kind: "vendor_photo",
        vendorId: vendor.id,
        url: vendor.photoSrc,
        err,
      });
    }
  }

  revalidatePath("/dashboard/profile");
  revalidatePath(`/services/${vendor.slug}`);
  revalidatePath(`/makers/${vendor.slug}`);
  revalidatePath("/services");

  return { status: "ok" };
}
