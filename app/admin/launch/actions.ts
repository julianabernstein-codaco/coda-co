"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  hasSitePrivatePassword,
  setDemoVendorsHidden,
  setGiftCardsEnabled,
  setLaunchedAt,
  setSitePrivate,
  setSitePrivatePassword,
} from "@/lib/launch";
import { log } from "@/lib/log";
import { clearSitePrivateCache } from "@/lib/site-private";

async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Not authorized");
  }
}

// The launch date gates paid billing everywhere, so bust the whole tree.
function revalidateAll(): void {
  revalidatePath("/", "layout");
}

export async function goLiveNow(): Promise<void> {
  await requireAdmin();
  await setLaunchedAt(new Date());
  log.info("launch.go_live_now");
  revalidateAll();
}

export async function scheduleLaunch(formData: FormData): Promise<void> {
  await requireAdmin();
  const raw = String(formData.get("launchedAt") ?? "");
  const date = new Date(raw);
  if (!raw || Number.isNaN(date.getTime())) return; // ignore empty/invalid
  await setLaunchedAt(date);
  log.info("launch.scheduled", { launchedAt: date.toISOString() });
  revalidateAll();
}

export async function revertToPrelaunch(): Promise<void> {
  await requireAdmin();
  await setLaunchedAt(null);
  log.info("launch.reverted_to_prelaunch");
  revalidateAll();
}

export async function hideDemoVendors(): Promise<void> {
  await requireAdmin();
  await setDemoVendorsHidden(true);
  log.info("launch.demo_vendors_hidden", { hidden: true });
  revalidateAll();
}

export async function showDemoVendors(): Promise<void> {
  await requireAdmin();
  await setDemoVendorsHidden(false);
  log.info("launch.demo_vendors_hidden", { hidden: false });
  revalidateAll();
}

// Gift-card sales hold. Independent of the launch date — see lib/launch.ts.
// Turning sales on is a money decision, so it's logged like one.
export async function openGiftCardSales(): Promise<void> {
  await requireAdmin();
  await setGiftCardsEnabled(true);
  log.info("launch.gift_cards_enabled", { enabled: true });
  revalidateAll();
}

export async function holdGiftCardSales(): Promise<void> {
  await requireAdmin();
  await setGiftCardsEnabled(false);
  log.info("launch.gift_cards_enabled", { enabled: false });
  revalidateAll();
}

// ── Incident kill switch ──────────────────────────────────────────────────
//
// Takes the whole site back behind the shared-password wall without a
// redeploy. Unlike the env-var gate, this applies within seconds — see
// lib/site-private.ts for the read path and its TTL.

export interface PrivatePasswordState {
  error?: string;
  ok?: string;
}

// Set (or rotate) the bypass password. Stored bcrypt-hashed, like any other
// password in the app. Rotating signs out every unlocked device, since the
// gate cookie is derived from the hash.
export async function setPrivateModePassword(
  _prev: PrivatePasswordState | null,
  formData: FormData,
): Promise<PrivatePasswordState> {
  await requireAdmin();
  const password = String(formData.get("password") ?? "");
  // Longer floor than a user account's 8: this is one shared secret guarding
  // the whole site, with no per-account lockout behind it.
  if (password.length < 12) {
    return { error: "Use at least 12 characters — this is a single shared secret." };
  }

  await setSitePrivatePassword(await bcrypt.hash(password, 12));
  clearSitePrivateCache();
  log.info("site_private.password_set");
  revalidateAll();
  return { ok: "Password saved. Any device already unlocked will have to enter it again." };
}

// Arm the switch. Refuses without a stored password: post-launch
// PREVIEW_PASSWORD is unset, so arming with no bypass secret would wall off
// the site with no way back in short of the redeploy this exists to avoid.
// The UI disables the button in that state; this is the server-side backstop.
export async function takeSitePrivate(): Promise<void> {
  await requireAdmin();
  if (!(await hasSitePrivatePassword())) {
    throw new Error("Set a bypass password before taking the site private.");
  }

  await setSitePrivate(true);
  clearSitePrivateCache();
  log.warn("site_private.enabled", { enabled: true });
  revalidateAll();
}

export async function takeSitePublic(): Promise<void> {
  await requireAdmin();
  await setSitePrivate(false);
  clearSitePrivateCache();
  log.warn("site_private.enabled", { enabled: false });
  revalidateAll();
}

// Flag the mock/sample vendors (reserved @codaco.local emails) as demo, so
// they render with the "Example" badge and disabled contact/purchase. The
// runtime equivalent of `npm run demo:flag` — runnable from the deployed
// app against the live DB, no terminal. Idempotent.
export async function flagMockVendorsAsExamples(): Promise<void> {
  await requireAdmin();
  const mock = await prisma.vendorProfile.findMany({
    where: { user: { email: { endsWith: "@codaco.local" } } },
    select: { id: true },
  });
  if (mock.length > 0) {
    await prisma.vendorProfile.updateMany({
      where: { id: { in: mock.map((v) => v.id) } },
      data: { demo: true },
    });
  }
  log.info("launch.flag_mock_demo", { count: mock.length });
  revalidateAll();
}
