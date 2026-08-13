"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { sendVendorInquiryEmail } from "@/lib/email/templates";
import { log } from "@/lib/log";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const MESSAGE_MAX = 2000;

export interface ContactInput {
  vendorSlug: string;
  message: string;
  // Honeypot — a hidden field real users never see. Bots that fill every
  // input give themselves away; we silently drop those submissions.
  company?: string;
}

export type ContactResult = { ok: true } | { ok: false; error: string };

export async function sendVendorInquiry(input: ContactInput): Promise<ContactResult> {
  // Honeypot tripped: act like it worked so the bot doesn't retune, but
  // save nothing and send nothing.
  if (input.company && input.company.trim() !== "") {
    log.warn("inquiry.honeypot_tripped", { vendorSlug: input.vendorSlug });
    return { ok: true };
  }

  // Contacting a vendor requires an account. Identity comes from the
  // session — never the form — so every lead is attributable to a real
  // user and the reply-to email can't be spoofed.
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Please sign in to contact this provider." };
  }
  const clientUserId = session.user.id;
  const email = session.user.email;
  const name = (session.user.name ?? "").trim() || email;

  const message = input.message?.trim() ?? "";
  if (!message) return { ok: false, error: "Please add a short message." };
  if (message.length > MESSAGE_MAX) {
    return { ok: false, error: `Keep your message under ${MESSAGE_MAX} characters.` };
  }

  // Per-IP limit across all vendors — cheap first gate against scripted
  // abuse before we touch the DB.
  const ip = await clientIp();
  const ipLimit = await rateLimit(`inquiry:ip:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!ipLimit.ok) {
    log.warn("inquiry.rate_limited", { scope: "ip" });
    return { ok: false, error: "You've sent several messages recently. Please try again later." };
  }

  const vendor = await prisma.vendorProfile.findUnique({
    where: { slug: input.vendorSlug },
    include: { user: { select: { email: true } } },
  });
  if (!vendor) return { ok: false, error: "We couldn't find that provider." };

  // Per-vendor flood guard.
  const vendorLimit = await rateLimit(`inquiry:vendor:${vendor.id}`, {
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!vendorLimit.ok) {
    log.warn("inquiry.rate_limited", { scope: "vendor", vendorId: vendor.id });
    return {
      ok: false,
      error: "This provider is receiving a lot of messages right now. Please try again later.",
    };
  }

  // Save the lead first — a delivery failure must not lose it. It'll show
  // in the vendor's dashboard regardless of whether the email lands.
  await prisma.vendorInquiry.create({
    data: { vendorId: vendor.id, clientUserId, clientName: name, clientEmail: email, message },
  });

  const result = await sendVendorInquiryEmail({
    toEmail: vendor.user.email,
    vendorName: vendor.displayName,
    clientName: name,
    clientEmail: email,
    message,
  });
  if (!result.ok) {
    // Best-effort — the lead is already saved. Log so a sustained pattern
    // of delivery failures is visible in ops.
    log.warn("inquiry.email_failed", { vendorId: vendor.id, err: result.error });
  }

  log.info("inquiry.created", { vendorId: vendor.id });
  return { ok: true };
}
