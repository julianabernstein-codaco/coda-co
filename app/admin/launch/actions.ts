"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { setLaunchedAt } from "@/lib/launch";
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
