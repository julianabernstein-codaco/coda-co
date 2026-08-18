// Transactional email templates for the vendor application flow.
// Each template has a pure `buildXxxEmail` (returns subject + html +
// text) and a thin `sendXxxEmail` wrapper that calls sendEmail. Keeping
// the build step pure means /admin/email-preview can render the same
// payloads without actually sending.

import { sendEmail, type SendResult } from "./client";

export interface EmailPayload {
  subject: string;
  html: string;
  text: string;
}

// Absolute link for an email. An email has no origin for a browser to
// resolve a relative href against, so a bare "/admin/listings" lands the
// reader wherever their mail client decides — never where we meant.
// BASE_URL wins; otherwise use the host Vercel injects (the project's
// production domain in production, the deployment's own URL on a preview,
// so a preview signup's links stay on that preview). Local dev has
// neither and falls back to a path, which is fine there.
function siteUrl(path: string): string {
  const explicit = process.env.BASE_URL?.trim().replace(/\/$/, "");
  if (explicit) return `${explicit}${path}`;

  const vercelHost =
    process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_URL;
  return vercelHost ? `https://${vercelHost}${path}` : path;
}

function dashboardUrl(): string {
  return siteUrl("/dashboard");
}

function listingUrl(slug: string): string {
  return siteUrl(`/services/${slug}`);
}

function productUrl(slug: string): string {
  return siteUrl(`/shop/${slug}`);
}

function productsDashboardUrl(): string {
  return siteUrl("/dashboard/products");
}

function giftCardRedeemUrl(): string {
  return siteUrl("/gift-cards/redeem");
}

function giftCardContributeUrl(token: string): string {
  return siteUrl(`/gift-cards/contribute/${token}`);
}

function giftCardManageUrl(token: string): string {
  return siteUrl(`/gift-cards/manage/${token}`);
}

function resetPasswordUrl(token: string): string {
  return siteUrl(`/reset-password?token=${encodeURIComponent(token)}`);
}

function forgotPasswordUrl(): string {
  return siteUrl("/forgot-password");
}

// "Sam", "Sam and Jo", "Sam, Jo and Kim", "Sam, Jo, Kim and 2 others".
function joinNames(names: string[]): string {
  if (names.length === 0) return "Several people";
  const shown = names.slice(0, 3);
  const extra = names.length - shown.length;
  if (extra > 0) {
    return `${shown.join(", ")} and ${extra} other${extra > 1 ? "s" : ""}`;
  }
  if (shown.length === 1) return shown[0];
  return `${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}`;
}

// Minimal house style. Inline styles because most clients strip <style>.
function layout(bodyHtml: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f1ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#2c2825;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1ec;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;padding:32px;">
        <tr><td>
          <div style="font-family:Georgia,serif;font-size:22px;color:#c1634f;margin-bottom:24px;">CodaCo</div>
          ${bodyHtml}
          <p style="margin:32px 0 0;font-size:12px;color:#7a7570;">
            CodaCo — a curated marketplace for end-of-life goods and services.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export interface ApplicationSubmittedArgs {
  toEmail: string;
  toName: string | null;
  displayName: string;
  kind: "goods" | "services" | "both";
}

export function buildApplicationSubmittedEmail(
  args: ApplicationSubmittedArgs,
): EmailPayload {
  const greeting = args.toName ? `Hi ${args.toName},` : "Hi,";
  const subject = "We've received your CodaCo application";
  const kindLabel =
    args.kind === "goods" ? "goods" : args.kind === "services" ? "services" : "goods and services";

  const text = [
    greeting,
    "",
    `Thanks for applying to list "${args.displayName}" on CodaCo. We've received your ${kindLabel} application and our team will review it shortly.`,
    "",
    "We'll email you again as soon as we've made a decision — usually within a few business days. If you have any questions in the meantime, just reply to this email.",
    "",
    "— The CodaCo team",
  ].join("\n");

  const html = layout(`
    <p style="margin:0 0 16px;font-size:15px;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
      Thanks for applying to list <strong>${escapeHtml(args.displayName)}</strong> on CodaCo.
      We've received your ${kindLabel} application and our team will review it shortly.
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
      We'll email you again as soon as we've made a decision — usually within a few
      business days. If you have any questions in the meantime, just reply to this email.
    </p>
    <p style="margin:0;font-size:15px;">— The CodaCo team</p>
  `);

  return { subject, html, text };
}

export async function sendApplicationSubmittedEmail(
  args: ApplicationSubmittedArgs,
): Promise<SendResult> {
  return sendEmail({ to: args.toEmail, ...buildApplicationSubmittedEmail(args) });
}

export interface ApplicationApprovedArgs {
  toEmail: string;
  toName: string | null;
  displayName: string;
  vendorSlug: string;
}

export function buildApplicationApprovedEmail(
  args: ApplicationApprovedArgs,
): EmailPayload {
  const greeting = args.toName ? `Hi ${args.toName},` : "Hi,";
  const subject = `You're approved on CodaCo`;
  const dashboard = dashboardUrl();
  const listing = listingUrl(args.vendorSlug);

  const text = [
    greeting,
    "",
    `Welcome to CodaCo! Your application for "${args.displayName}" has been approved.`,
    "",
    `Your dashboard:    ${dashboard}`,
    `Your public page:  ${listing}`,
    "",
    "From the dashboard you can edit your profile, add products and services, and publish them when you're ready. Drafts stay private until you publish.",
    "",
    "— The CodaCo team",
  ].join("\n");

  const html = layout(`
    <p style="margin:0 0 16px;font-size:15px;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
      Welcome to CodaCo! Your application for
      <strong>${escapeHtml(args.displayName)}</strong> has been approved.
    </p>
    <p style="margin:24px 0;">
      <a href="${dashboard}" style="display:inline-block;background:#c1634f;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-size:14px;">
        Go to your dashboard
      </a>
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
      From the dashboard you can edit your profile, add products and services, and
      publish them when you're ready. Drafts stay private until you publish.
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#7a7570;">
      Your public page: <a href="${listing}" style="color:#c1634f;">${listing}</a>
    </p>
    <p style="margin:0;font-size:15px;">— The CodaCo team</p>
  `);

  return { subject, html, text };
}

export async function sendApplicationApprovedEmail(
  args: ApplicationApprovedArgs,
): Promise<SendResult> {
  return sendEmail({ to: args.toEmail, ...buildApplicationApprovedEmail(args) });
}

export interface ApplicationRejectedArgs {
  toEmail: string;
  toName: string | null;
  displayName: string;
  // Optional reviewer note shown verbatim to the applicant.
  notes?: string;
}

export function buildApplicationRejectedEmail(
  args: ApplicationRejectedArgs,
): EmailPayload {
  const greeting = args.toName ? `Hi ${args.toName},` : "Hi,";
  const subject = "Update on your CodaCo application";

  const notesText = args.notes?.trim()
    ? `\nA note from the team:\n${args.notes.trim()}\n`
    : "";

  const text = [
    greeting,
    "",
    `Thank you for applying to list "${args.displayName}" on CodaCo. After reviewing your application, we're unable to approve it at this time.`,
    notesText,
    "If you'd like to discuss this decision or share more about your work, just reply to this email — we read every response.",
    "",
    "— The CodaCo team",
  ].join("\n");

  const notesHtml = args.notes?.trim()
    ? `<div style="margin:0 0 16px;padding:12px 14px;background:#f5f1ec;border-radius:8px;font-size:14px;line-height:1.55;color:#2c2825;">
         <strong style="display:block;margin-bottom:4px;font-size:12px;color:#7a7570;text-transform:uppercase;letter-spacing:.06em;">Note from the team</strong>
         ${escapeHtml(args.notes.trim()).replace(/\n/g, "<br>")}
       </div>`
    : "";

  const html = layout(`
    <p style="margin:0 0 16px;font-size:15px;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
      Thank you for applying to list <strong>${escapeHtml(args.displayName)}</strong> on
      CodaCo. After reviewing your application, we're unable to approve it at this time.
    </p>
    ${notesHtml}
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
      If you'd like to discuss this decision or share more about your work, just
      reply to this email — we read every response.
    </p>
    <p style="margin:0;font-size:15px;">— The CodaCo team</p>
  `);

  return { subject, html, text };
}

export async function sendApplicationRejectedEmail(
  args: ApplicationRejectedArgs,
): Promise<SendResult> {
  return sendEmail({ to: args.toEmail, ...buildApplicationRejectedEmail(args) });
}

// Sent right after a goods seller finishes signup. They upload their first
// item during signup, so this confirms that listing is with our team — and
// that their shop goes live once it's approved. Falls back to a "add your
// goods" nudge when the listing didn't make it through (see
// createFirstListing in app/list-with-us/actions.ts).
export interface ListYourGoodsArgs {
  toEmail: string;
  toName: string | null;
  displayName: string;
  // Title of the listing now awaiting review; null when signup couldn't
  // park one there.
  firstListingTitle?: string | null;
}

export function buildListYourGoodsEmail(args: ListYourGoodsArgs): EmailPayload {
  const greeting = args.toName ? `Hi ${args.toName},` : "Hi,";
  const listing = args.firstListingTitle?.trim() || null;
  const subject = listing
    ? "Your CodaCo shop is set up — your first listing is with our team"
    : "Your CodaCo shop is ready — add your first listing";
  const products = productsDashboardUrl();

  const opening = listing
    ? `Your shop "${args.displayName}" is set up on CodaCo, and your first listing — "${listing}" — is with our team for review. Once we approve it, both the listing and your shop go live in the marketplace (it usually takes a day or two). Every listing you add after that publishes instantly — no waiting.`
    : `Your shop "${args.displayName}" is set up on CodaCo. The next step is to list your goods — add photos and prices for each item you want to sell. Your first listing is reviewed by our team before it (and your shop) appears in the marketplace; after that, every listing you add publishes instantly.`;

  const text = [
    greeting,
    "",
    opening,
    "",
    `${listing ? "Your listings" : "Add your goods"}:  ${products}`,
    "",
    "In the meantime you can keep adding items, edit your shop profile, and get everything ready.",
    "",
    "— The CodaCo team",
  ].join("\n");

  const html = layout(`
    <p style="margin:0 0 16px;font-size:15px;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
      ${
        listing
          ? `Your shop <strong>${escapeHtml(args.displayName)}</strong> is set up on CodaCo, and your first listing — <strong>${escapeHtml(listing)}</strong> — is with our team for review. Once we approve it, both the listing and your shop go live in the marketplace (usually a day or two). Every listing you add after that publishes instantly — no waiting.`
          : `Your shop <strong>${escapeHtml(args.displayName)}</strong> is set up on CodaCo. The next step is to list your goods — add photos and prices for each item you want to sell. Your <strong>first</strong> listing is reviewed by our team before it (and your shop) appears in the marketplace; after that, every listing you add publishes instantly.`
      }
    </p>
    <p style="margin:24px 0;">
      <a href="${products}" style="display:inline-block;background:#c1634f;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-size:14px;">
        ${listing ? "See your listings" : "Add your goods"}
      </a>
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
      In the meantime you can keep adding items, edit your shop profile, and get
      everything ready.
    </p>
    <p style="margin:0;font-size:15px;">— The CodaCo team</p>
  `);

  return { subject, html, text };
}

export async function sendListYourGoodsEmail(
  args: ListYourGoodsArgs,
): Promise<SendResult> {
  return sendEmail({ to: args.toEmail, ...buildListYourGoodsEmail(args) });
}

// Sent when an admin approves a vendor's first listing. Doubles as the
// "you're now cleared to publish on your own" note.
export interface ListingApprovedArgs {
  toEmail: string;
  toName: string | null;
  productTitle: string;
  productSlug: string;
}

export function buildListingApprovedEmail(
  args: ListingApprovedArgs,
): EmailPayload {
  const greeting = args.toName ? `Hi ${args.toName},` : "Hi,";
  const subject = "Your listing is live on CodaCo";
  const listing = productUrl(args.productSlug);

  const text = [
    greeting,
    "",
    `Good news — your listing "${args.productTitle}" has been approved and is now live in the CodaCo marketplace.`,
    "",
    `See it live:  ${listing}`,
    "",
    "That was your first listing, so you're all set: any listings you add from here on publish instantly, no review needed.",
    "",
    "— The CodaCo team",
  ].join("\n");

  const html = layout(`
    <p style="margin:0 0 16px;font-size:15px;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
      Good news — your listing <strong>${escapeHtml(args.productTitle)}</strong> has been
      approved and is now live in the CodaCo marketplace.
    </p>
    <p style="margin:24px 0;">
      <a href="${listing}" style="display:inline-block;background:#c1634f;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-size:14px;">
        See it live
      </a>
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
      That was your first listing, so you're all set: any listings you add from here on
      publish instantly, no review needed.
    </p>
    <p style="margin:0;font-size:15px;">— The CodaCo team</p>
  `);

  return { subject, html, text };
}

export async function sendListingApprovedEmail(
  args: ListingApprovedArgs,
): Promise<SendResult> {
  return sendEmail({ to: args.toEmail, ...buildListingApprovedEmail(args) });
}

export interface VendorInquiryArgs {
  // Vendor's private account email — the message's `to`, never shown to
  // the client.
  toEmail: string;
  vendorName: string;
  clientName: string;
  // Client's email — rendered in the body and set as the message's
  // reply-to so the vendor can respond with a single tap.
  clientEmail: string;
  message: string;
}

export function buildVendorInquiryEmail(args: VendorInquiryArgs): EmailPayload {
  const subject = `New inquiry from ${args.clientName} via CodaCo`;

  const text = [
    `Hi ${args.vendorName},`,
    "",
    `You've received a new inquiry through your CodaCo profile.`,
    "",
    `From:    ${args.clientName}`,
    `Email:   ${args.clientEmail}`,
    "",
    "Message:",
    args.message,
    "",
    `Just reply to this email and your response goes straight to ${args.clientName}.`,
    "",
    "— CodaCo",
  ].join("\n");

  const html = layout(`
    <p style="margin:0 0 16px;font-size:15px;">Hi ${escapeHtml(args.vendorName)},</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
      You've received a new inquiry through your CodaCo profile.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;font-size:14px;line-height:1.6;">
      <tr><td style="color:#7a7570;padding-right:12px;">From</td><td style="color:#2c2825;">${escapeHtml(args.clientName)}</td></tr>
      <tr><td style="color:#7a7570;padding-right:12px;">Email</td><td><a href="mailto:${escapeHtml(args.clientEmail)}" style="color:#c1634f;">${escapeHtml(args.clientEmail)}</a></td></tr>
    </table>
    <div style="margin:0 0 16px;padding:12px 14px;background:#f5f1ec;border-radius:8px;font-size:14px;line-height:1.6;color:#2c2825;">
      ${escapeHtml(args.message).replace(/\n/g, "<br>")}
    </div>
    <p style="margin:0;font-size:14px;color:#7a7570;line-height:1.55;">
      Just reply to this email and your response goes straight to ${escapeHtml(args.clientName)}.
    </p>
  `);

  return { subject, html, text };
}

export async function sendVendorInquiryEmail(
  args: VendorInquiryArgs,
): Promise<SendResult> {
  // replyTo = the client so the vendor can reply directly; `to` stays
  // the vendor's private address, never surfaced to the client.
  return sendEmail({
    to: args.toEmail,
    replyTo: args.clientEmail,
    ...buildVendorInquiryEmail(args),
  });
}

// Sent when a gift card is delivered to its recipient: on payment confirm for
// a single-purchase card, or when the organizer sends a group pool. Carries
// the spend code and a link to check the balance / claim it to an account.
export interface GiftCardDeliveryArgs {
  toEmail: string;
  recipientName?: string | null;
  code: string;
  amountLabel: string;
  message?: string | null;
  // Sender context (mutually exclusive):
  //  • contributorNames present → group gift ("Sam, Jo and 2 others chipped in")
  //  • isSelfPurchase           → the buyer bought it for themselves
  //  • otherwise                → a single gift from purchaserName (or email)
  isSelfPurchase?: boolean;
  // Preferred "from" label for a single gift; falls back to purchaserEmail.
  purchaserName?: string | null;
  purchaserEmail?: string;
  contributorNames?: string[];
}

export function buildGiftCardDeliveryEmail(
  args: GiftCardDeliveryArgs,
): EmailPayload {
  const greeting = args.recipientName ? `Hi ${args.recipientName},` : "Hi,";
  const redeem = giftCardRedeemUrl();
  const isGroup = Boolean(args.contributorNames && args.contributorNames.length > 0);

  const subject = args.isSelfPurchase
    ? `Your ${args.amountLabel} CodaCo gift card`
    : `You've received a ${args.amountLabel} CodaCo gift card`;

  const from = args.purchaserName?.trim() || args.purchaserEmail;
  const intro = isGroup
    ? `${joinNames(args.contributorNames!)} chipped in to send you a ${args.amountLabel} CodaCo gift card — to use toward goods and services in the marketplace.`
    : args.isSelfPurchase
      ? `Thanks for your purchase. Here's your ${args.amountLabel} CodaCo gift card — use it toward goods and services in the marketplace.`
      : `${from} has sent you a ${args.amountLabel} CodaCo gift card — to use toward goods and services in the marketplace.`;

  const messageBlock = args.message?.trim()
    ? `\nTheir message:\n${args.message.trim()}\n`
    : "";

  const text = [
    greeting,
    "",
    intro,
    "",
    `Gift card code:  ${args.code}`,
    `Balance:         ${args.amountLabel}`,
    messageBlock,
    `Check your balance or add it to your account:  ${redeem}`,
    "",
    "— The CodaCo team",
  ].join("\n");

  const messageHtml = args.message?.trim()
    ? `<div style="margin:0 0 16px;padding:12px 14px;background:#f5f1ec;border-radius:8px;font-size:14px;line-height:1.55;color:#2c2825;">
         <strong style="display:block;margin-bottom:4px;font-size:12px;color:#7a7570;text-transform:uppercase;letter-spacing:.06em;">Their message</strong>
         ${escapeHtml(args.message.trim()).replace(/\n/g, "<br>")}
       </div>`
    : "";

  const html = layout(`
    <p style="margin:0 0 16px;font-size:15px;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">${escapeHtml(intro)}</p>
    <div style="margin:0 0 20px;padding:20px;background:#f5f1ec;border-radius:12px;text-align:center;">
      <div style="font-size:12px;color:#7a7570;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;">Gift card code</div>
      <div style="font-family:Georgia,serif;font-size:26px;letter-spacing:.06em;color:#2c2825;">${escapeHtml(args.code)}</div>
      <div style="margin-top:10px;font-size:14px;color:#7a7570;">Balance ${escapeHtml(args.amountLabel)}</div>
    </div>
    ${messageHtml}
    <p style="margin:24px 0;">
      <a href="${redeem}" style="display:inline-block;background:#c1634f;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-size:14px;">
        Check your balance
      </a>
    </p>
    <p style="margin:0;font-size:15px;">— The CodaCo team</p>
  `);

  return { subject, html, text };
}

export async function sendGiftCardDeliveryEmail(
  args: GiftCardDeliveryArgs,
): Promise<SendResult> {
  return sendEmail({ to: args.toEmail, ...buildGiftCardDeliveryEmail(args) });
}

// Sent to the BUYER when a single gift-card purchase is confirmed — their
// payment receipt. Distinct from the delivery email (which carries the code
// and goes to the recipient). Never includes the code.
export interface GiftCardReceiptArgs {
  toEmail: string;
  amountLabel: string;
  // Where the card was delivered, for the receipt line.
  isSelfPurchase: boolean;
  recipientName?: string | null;
  recipientEmail?: string | null;
}

export function buildGiftCardReceiptEmail(args: GiftCardReceiptArgs): EmailPayload {
  const subject = `Your ${args.amountLabel} CodaCo gift card — receipt`;
  const sentTo = args.isSelfPurchase
    ? "you"
    : args.recipientName?.trim() || args.recipientEmail || "the recipient";

  const text = [
    "Hi,",
    "",
    "Thank you for your purchase, and for thinking of someone in need of support.",
    "",
    "Receipt",
    "-------",
    `Item:    CodaCo gift card`,
    `Amount:  ${args.amountLabel}`,
    `Sent to: ${sentTo}`,
    "",
    "The balance can be spent toward goods and services across the marketplace, and any unused balance stays on the card.",
    "",
    "— The CodaCo team",
  ].join("\n");

  const html = layout(`
    <p style="margin:0 0 16px;font-size:15px;">Hi,</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.55;">
      Thank you for your purchase, and for thinking of someone in need of support.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;font-size:14px;line-height:1.7;">
      <tr><td style="color:#7a7570;padding-right:16px;">Item</td><td style="color:#2c2825;">CodaCo gift card</td></tr>
      <tr><td style="color:#7a7570;padding-right:16px;">Amount</td><td style="color:#2c2825;font-weight:600;">${escapeHtml(args.amountLabel)}</td></tr>
      <tr><td style="color:#7a7570;padding-right:16px;">Sent to</td><td style="color:#2c2825;">${escapeHtml(sentTo)}</td></tr>
    </table>
    <p style="margin:0 0 16px;font-size:14px;color:#7a7570;line-height:1.55;">
      The balance can be spent toward goods and services across the marketplace, and any
      unused balance stays on the card.
    </p>
    <p style="margin:0;font-size:15px;">— The CodaCo team</p>
  `);

  return { subject, html, text };
}

export async function sendGiftCardReceiptEmail(
  args: GiftCardReceiptArgs,
): Promise<SendResult> {
  return sendEmail({ to: args.toEmail, ...buildGiftCardReceiptEmail(args) });
}

// Sent to the organizer once their group-gift pool is funded (first
// contribution clears). Carries the public link to share for contributions
// and the secret link to manage + send the gift — no account needed for either.
export interface GiftCardPoolCreatedArgs {
  toEmail: string;
  balanceLabel: string;
  contributeToken: string;
  organizerToken: string;
}

export function buildGiftCardPoolCreatedEmail(
  args: GiftCardPoolCreatedArgs,
): EmailPayload {
  const subject = "Your CodaCo group gift is ready to share";
  const contribute = giftCardContributeUrl(args.contributeToken);
  const manage = giftCardManageUrl(args.organizerToken);

  const text = [
    "Hi,",
    "",
    `Your CodaCo group gift is started with ${args.balanceLabel} in the pot.`,
    "",
    `Share this link so others can chip in (no account needed):`,
    contribute,
    "",
    `Manage the gift and send it to the recipient when you're ready:`,
    manage,
    "",
    "Keep the manage link private — it's how you send the gift. The share link above is safe to send to anyone.",
    "",
    "— The CodaCo team",
  ].join("\n");

  const html = layout(`
    <p style="margin:0 0 16px;font-size:15px;">Hi,</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
      Your CodaCo group gift is started with <strong>${escapeHtml(args.balanceLabel)}</strong> in the pot.
    </p>
    <p style="margin:0 0 8px;font-size:14px;color:#7a7570;">Share this link so others can chip in (no account needed):</p>
    <p style="margin:0 0 20px;"><a href="${contribute}" style="color:#c1634f;word-break:break-all;">${contribute}</a></p>
    <p style="margin:24px 0;">
      <a href="${manage}" style="display:inline-block;background:#c1634f;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-size:14px;">
        Manage &amp; send the gift
      </a>
    </p>
    <p style="margin:0 0 16px;font-size:13px;color:#7a7570;line-height:1.55;">
      Keep the manage link private — it's how you send the gift. The share link above is safe to send to anyone.
    </p>
    <p style="margin:0;font-size:15px;">— The CodaCo team</p>
  `);

  return { subject, html, text };
}

export async function sendGiftCardPoolCreatedEmail(
  args: GiftCardPoolCreatedArgs,
): Promise<SendResult> {
  return sendEmail({ to: args.toEmail, ...buildGiftCardPoolCreatedEmail(args) });
}

// Sent to the organizer when someone new chips into the pool.
export interface GiftCardContributionArgs {
  toEmail: string;
  contributorName?: string | null;
  amountLabel: string;
  balanceLabel: string;
  organizerToken: string;
}

export function buildGiftCardContributionEmail(
  args: GiftCardContributionArgs,
): EmailPayload {
  const who = args.contributorName?.trim() || "Someone";
  const subject = `${who} chipped in to your CodaCo gift`;
  const manage = giftCardManageUrl(args.organizerToken);

  const text = [
    "Hi,",
    "",
    `${who} added ${args.amountLabel} to your CodaCo group gift.`,
    `The pot is now ${args.balanceLabel}.`,
    "",
    `Manage the gift or send it when you're ready:`,
    manage,
    "",
    "— The CodaCo team",
  ].join("\n");

  const html = layout(`
    <p style="margin:0 0 16px;font-size:15px;">Hi,</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
      <strong>${escapeHtml(who)}</strong> added ${escapeHtml(args.amountLabel)} to your CodaCo group gift.
      The pot is now <strong>${escapeHtml(args.balanceLabel)}</strong>.
    </p>
    <p style="margin:24px 0;">
      <a href="${manage}" style="display:inline-block;background:#c1634f;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-size:14px;">
        Manage &amp; send the gift
      </a>
    </p>
    <p style="margin:0;font-size:15px;">— The CodaCo team</p>
  `);

  return { subject, html, text };
}

export async function sendGiftCardContributionEmail(
  args: GiftCardContributionArgs,
): Promise<SendResult> {
  return sendEmail({ to: args.toEmail, ...buildGiftCardContributionEmail(args) });
}

// Sent right after someone joins the pre-launch waitlist on /launching.
// A light "you're on the list" confirmation that also validates the
// address (a bounced send tells us the email was a typo). Best-effort:
// the signup is already saved, so a send failure never blocks the form.
export interface WaitlistConfirmationArgs {
  toEmail: string;
}

export function buildWaitlistConfirmationEmail(
  _args: WaitlistConfirmationArgs,
): EmailPayload {
  const subject = "You're on the CodaCo waitlist";

  const text = [
    "Thanks for joining our waitlist. We are so looking forward to sharing CodaCo with you. We'll notify you when we go live!",
    "",
    "— The CodaCo team",
  ].join("\n");

  const html = layout(`
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
      Thanks for joining our waitlist. We are so looking forward to sharing CodaCo
      with you. We'll notify you when we go live!
    </p>
    <p style="margin:0;font-size:15px;">— The CodaCo team</p>
  `);

  return { subject, html, text };
}

export async function sendWaitlistConfirmationEmail(
  args: WaitlistConfirmationArgs,
): Promise<SendResult> {
  return sendEmail({ to: args.toEmail, ...buildWaitlistConfirmationEmail(args) });
}

// Sent when someone requests a password reset from /forgot-password. Carries
// a one-hour, single-use link. Only ever sent to an address with a real
// credential account — the request endpoint stays silent otherwise so it
// never reveals whether an email is registered.
export interface PasswordResetArgs {
  toEmail: string;
  toName: string | null;
  token: string;
}

export function buildPasswordResetEmail(args: PasswordResetArgs): EmailPayload {
  const greeting = args.toName ? `Hi ${args.toName},` : "Hi,";
  const subject = "Reset your CodaCo password";
  const reset = resetPasswordUrl(args.token);

  const text = [
    greeting,
    "",
    "We received a request to reset the password for your CodaCo account. Use the link below to choose a new one:",
    "",
    reset,
    "",
    "This link works once and expires in one hour. If you didn't ask to reset your password, you can safely ignore this email — your password won't change.",
    "",
    "— The CodaCo team",
  ].join("\n");

  const html = layout(`
    <p style="margin:0 0 16px;font-size:15px;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
      We received a request to reset the password for your CodaCo account.
      Choose a new one using the button below.
    </p>
    <p style="margin:24px 0;">
      <a href="${reset}" style="display:inline-block;background:#c1634f;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-size:14px;">
        Reset your password
      </a>
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#7a7570;line-height:1.55;">
      This link works once and expires in one hour. If you didn't ask to reset
      your password, you can safely ignore this email — your password won't change.
    </p>
    <p style="margin:0;font-size:15px;">— The CodaCo team</p>
  `);

  return { subject, html, text };
}

export async function sendPasswordResetEmail(
  args: PasswordResetArgs,
): Promise<SendResult> {
  return sendEmail({ to: args.toEmail, ...buildPasswordResetEmail(args) });
}

// Sent whenever an account's password changes — after a reset via
// /reset-password or a direct change from /account. A security
// confirmation: if the owner didn't do it, it tells them how to re-secure
// the account. Best-effort — a send failure never blocks the change itself.
export interface PasswordChangedArgs {
  toEmail: string;
  toName: string | null;
}

export function buildPasswordChangedEmail(args: PasswordChangedArgs): EmailPayload {
  const greeting = args.toName ? `Hi ${args.toName},` : "Hi,";
  const subject = "Your CodaCo password was changed";
  const forgot = forgotPasswordUrl();

  const text = [
    greeting,
    "",
    "This is a confirmation that the password for your CodaCo account was just changed.",
    "",
    "If this was you, no further action is needed.",
    "",
    `If you didn't change your password, reset it right away to secure your account: ${forgot}`,
    "You can also reply to this email and we'll help.",
    "",
    "— The CodaCo team",
  ].join("\n");

  const html = layout(`
    <p style="margin:0 0 16px;font-size:15px;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
      This is a confirmation that the password for your CodaCo account was just changed.
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
      If this was you, no further action is needed.
    </p>
    <div style="margin:0 0 16px;padding:12px 14px;background:#f5f1ec;border-radius:8px;font-size:14px;line-height:1.55;color:#2c2825;">
      <strong style="display:block;margin-bottom:4px;font-size:12px;color:#7a7570;text-transform:uppercase;letter-spacing:.06em;">Didn't do this?</strong>
      <a href="${forgot}" style="color:#c1634f;">Reset your password</a> right away to secure
      your account, or just reply to this email and we'll help.
    </div>
    <p style="margin:0;font-size:15px;">— The CodaCo team</p>
  `);

  return { subject, html, text };
}

export async function sendPasswordChangedEmail(
  args: PasswordChangedArgs,
): Promise<SendResult> {
  return sendEmail({ to: args.toEmail, ...buildPasswordChangedEmail(args) });
}

// ── Internal admin notifications ─────────────────────────────────────────
// These go to the CodaCo team inbox (ADMIN_NOTIFY_EMAIL, default
// hello@codaco.market), NOT to a vendor. They let the team learn about new
// signups and listings awaiting review without watching the admin queue.

function adminUrl(path: string): string {
  return siteUrl(path);
}

// Where the internal pings land. Defaults to the shared team address so it
// works out of the box; override per-environment with ADMIN_NOTIFY_EMAIL.
export function adminNotifyEmail(): string {
  return process.env.ADMIN_NOTIFY_EMAIL?.trim() || "hello@codaco.market";
}

// Renders a label/value table (html) + aligned lines (text) from a list of
// rows, skipping any whose value is blank. Keeps the two admin-notification
// bodies in sync and lets optional fields (company, website, …) drop out
// cleanly when a vendor didn't provide them.
interface DetailRow {
  label: string;
  value: string | null | undefined;
  // Optional link target for the html cell (email → mailto:, site → url).
  href?: string | null;
}

function detailBlock(rows: DetailRow[]): { html: string; text: string } {
  const present = rows.filter((r) => r.value && r.value.trim());
  const html = present
    .map((r) => {
      const v = escapeHtml(r.value!.trim());
      const cell = r.href
        ? `<a href="${escapeHtml(r.href)}" style="color:#c1634f;">${v}</a>`
        : v;
      return `<tr><td style="color:#7a7570;padding-right:16px;vertical-align:top;white-space:nowrap;">${r.label}</td><td style="color:#2c2825;">${cell}</td></tr>`;
    })
    .join("");
  const pad = Math.max(...present.map((r) => r.label.length)) + 2;
  const text = present
    .map((r) => `${(r.label + ":").padEnd(pad)}${r.value!.trim()}`)
    .join("\n");
  return { html, text };
}

// "Maker (goods)" / "Service provider" / "Maker & service provider".
function vendorTypeLabel(kind: "goods" | "services" | "both"): string {
  return kind === "goods"
    ? "Maker (goods)"
    : kind === "services"
      ? "Service provider"
      : "Maker & service provider";
}

// Vendors type websites loosely ("example.com" or a full URL). Give the html
// cell a valid href by prepending https:// when there's no scheme. Blank → null.
function websiteHref(raw: string | null | undefined): string | null {
  const v = raw?.trim();
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

// Turn an Instagram value into a profile link. Accepts "@handle", "handle",
// or a pasted instagram.com URL. Blank / handle-less → null (cell renders as
// plain text). The displayed text stays as the vendor typed it.
function instagramHref(raw: string | null | undefined): string | null {
  const v = raw?.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v
    .replace(/^@/, "")
    .replace(/^(www\.)?instagram\.com\//i, "")
    .replace(/\/+$/, "")
    .trim();
  return handle ? `https://instagram.com/${handle}` : null;
}

export interface NewVendorSignupArgs {
  // Headline name (company if given, else the person's full name).
  displayName: string;
  fullName?: string | null;
  companyName?: string | null;
  website?: string | null;
  // Handle or profile URL, shown as the vendor typed it.
  instagram?: string | null;
  kind: "goods" | "services" | "both";
  city: string;
  state: string;
  // Resolved ServiceType name for services / both; null for goods (a maker's
  // product types aren't chosen until they list their first product).
  serviceType?: string | null;
  // Account email — reply-to, and shown so the team can reach out.
  applicantEmail: string;
  // Goods shops self-approve; services / both wait in the review queue.
  needsReview: boolean;
  // Goods shops only: the seller says their goods need personalization or
  // contact before a buyer can order. Worth flagging because goods shops
  // skip the review queue — this email is the team's only heads-up.
  requiresCustomOrder?: boolean;
  // Goods shops only: the item uploaded during signup. Present means the
  // shop is waiting on this listing to be approved before it goes public.
  firstListing?: {
    title: string;
    productType: string | null;
    priceLabel: string;
    awaitingReview: boolean;
  } | null;
}

export function buildNewVendorSignupEmail(args: NewVendorSignupArgs): EmailPayload {
  // A goods seller uploads their first item during signup, and their shop
  // stays hidden until that listing is approved — so point the team at the
  // listing queue, not the application queue.
  const pendingListing = args.firstListing?.awaitingReview
    ? args.firstListing
    : null;
  const subject = pendingListing
    ? `New vendor to review: ${args.displayName}`
    : args.needsReview
      ? `New vendor to review: ${args.displayName}`
      : `New vendor signed up: ${args.displayName}`;
  const queue = adminUrl(pendingListing ? "/admin/listings" : "/admin/applications");
  const website = args.website?.trim() || null;

  const details = detailBlock([
    { label: "Full name", value: args.fullName },
    { label: "Company", value: args.companyName },
    { label: "Type", value: vendorTypeLabel(args.kind) },
    { label: "Location", value: `${args.city}, ${args.state}` },
    { label: "Service type", value: args.serviceType },
    { label: "Website", value: website, href: websiteHref(website) },
    { label: "Instagram", value: args.instagram, href: instagramHref(args.instagram) },
    {
      label: "Email",
      value: args.applicantEmail,
      href: `mailto:${args.applicantEmail}`,
    },
    {
      label: "Custom orders",
      value: args.requiresCustomOrder
        ? "Yes — goods need personalization / contact before purchase"
        : null,
    },
    { label: "First listing", value: args.firstListing?.title },
    { label: "Listing type", value: args.firstListing?.productType },
    { label: "Listing price", value: args.firstListing?.priceLabel },
    {
      label: "Status",
      value: pendingListing
        ? "Shop hidden until their first listing is approved"
        : args.needsReview
          ? "Needs review"
          : "Auto-approved (goods shop)",
    },
  ]);

  const lede = pendingListing
    ? "A new goods seller just signed up and uploaded their first listing. Their shop stays hidden until you approve it."
    : "A new vendor just signed up on CodaCo.";
  const cta = pendingListing
    ? "Review their first listing"
    : args.needsReview
      ? "Review in the admin queue"
      : "Open the admin queue";

  const text = [
    lede,
    "",
    details.text,
    "",
    pendingListing
      ? `Review their first listing:  ${queue}`
      : args.needsReview
        ? `Review it in the admin queue:  ${queue}`
        : `They're already live. See all vendors:  ${queue}`,
    "",
    "— CodaCo",
  ].join("\n");

  const html = layout(`
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">${lede}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;font-size:14px;line-height:1.8;">
      ${details.html}
    </table>
    <p style="margin:24px 0;">
      <a href="${queue}" style="display:inline-block;background:#c1634f;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-size:14px;">
        ${cta}
      </a>
    </p>
    <p style="margin:0;font-size:14px;color:#7a7570;">— CodaCo</p>
  `);

  return { subject, html, text };
}

export async function sendNewVendorSignupEmail(
  args: NewVendorSignupArgs,
): Promise<SendResult> {
  // replyTo = the applicant so a team member can respond to them directly.
  return sendEmail({
    to: adminNotifyEmail(),
    replyTo: args.applicantEmail,
    ...buildNewVendorSignupEmail(args),
  });
}

export interface ListingNeedsReviewArgs {
  productTitle: string;
  // Goods product-type name (e.g. "Urns & vessels").
  productType?: string | null;
  vendorName: string;
  // "City, ST" from the vendor's profile.
  location?: string | null;
  website?: string | null;
  instagram?: string | null;
  // Vendor's account email — reply-to, and shown for contact.
  vendorEmail?: string | null;
}

export function buildListingNeedsReviewEmail(
  args: ListingNeedsReviewArgs,
): EmailPayload {
  const subject = `New listing to review: ${args.productTitle}`;
  const queue = adminUrl("/admin/listings");
  const website = args.website?.trim() || null;

  const details = detailBlock([
    { label: "Listing", value: args.productTitle },
    { label: "Product type", value: args.productType },
    { label: "Vendor", value: args.vendorName },
    { label: "Type", value: "Maker (goods)" },
    { label: "Location", value: args.location },
    { label: "Website", value: website, href: websiteHref(website) },
    { label: "Instagram", value: args.instagram, href: instagramHref(args.instagram) },
    {
      label: "Email",
      value: args.vendorEmail,
      href: args.vendorEmail ? `mailto:${args.vendorEmail}` : null,
    },
  ]);

  const text = [
    "A vendor submitted their first listing, which is waiting for review before it goes live.",
    "",
    details.text,
    "",
    `Review it in the admin queue:  ${queue}`,
    "",
    "— CodaCo",
  ].join("\n");

  const html = layout(`
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">
      A vendor submitted their first listing, which is waiting for review before it goes live.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;font-size:14px;line-height:1.8;">
      ${details.html}
    </table>
    <p style="margin:24px 0;">
      <a href="${queue}" style="display:inline-block;background:#c1634f;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-size:14px;">
        Review in the admin queue
      </a>
    </p>
    <p style="margin:0;font-size:14px;color:#7a7570;">— CodaCo</p>
  `);

  return { subject, html, text };
}

export async function sendListingNeedsReviewEmail(
  args: ListingNeedsReviewArgs,
): Promise<SendResult> {
  return sendEmail({
    to: adminNotifyEmail(),
    replyTo: args.vendorEmail ?? undefined,
    ...buildListingNeedsReviewEmail(args),
  });
}

// Basic HTML-escape — applicant-supplied strings render unescaped
// inside templates otherwise, and could break the layout (or worse).
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
