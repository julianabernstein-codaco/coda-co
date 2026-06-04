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

// Falls back to a path-only link when BASE_URL isn't set. Production
// should always have BASE_URL configured (Vercel sets VERCEL_URL but
// users typed BASE_URL in env historically — keep it for parity).
function dashboardUrl(): string {
  const base = process.env.BASE_URL?.replace(/\/$/, "");
  return base ? `${base}/dashboard` : "/dashboard";
}

function listingUrl(slug: string): string {
  const base = process.env.BASE_URL?.replace(/\/$/, "");
  return base ? `${base}/services/${slug}` : `/services/${slug}`;
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
