"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { setDemoVendorsHidden, setGiftCardsEnabled, setLaunchedAt } from "@/lib/launch";
import { log } from "@/lib/log";

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
