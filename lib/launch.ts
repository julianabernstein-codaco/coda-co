import { prisma } from "@/lib/db";

// Platform launch gate + free-trial clock. One PlatformConfig row
// (id="singleton") holds `launchedAt`:
//   • null / future  → pre-launch: paid checkout is blocked for non-admins;
//     vendors sign up on the free trial only.
//   • past           → launched: paid flows open; trials run from launchedAt.
// Server-only (touches the DB) — import from server components / actions.

const CONFIG_ID = "singleton";

// Length of the free trial once it starts (at launch). 3 months ≈ 90 days.
export const TRIAL_DAYS = 90;

export async function getLaunchedAt(): Promise<Date | null> {
  const cfg = await prisma.platformConfig.findUnique({
    where: { id: CONFIG_ID },
    select: { launchedAt: true },
  });
  return cfg?.launchedAt ?? null;
}

// Whether the platform is live right now, given a (already-fetched) date.
export function launchedFrom(launchedAt: Date | null): boolean {
  return launchedAt != null && launchedAt.getTime() <= Date.now();
}

export async function isLaunched(): Promise<boolean> {
  return launchedFrom(await getLaunchedAt());
}

// Paid billing (subscriptions, goods set-up fee, gift cards) is open once
// launched. Admins can always transact so the team can validate live
// payments before launch. Pass the signed-in user's role.
export async function paidFlowsOpenFor(role?: string | null): Promise<boolean> {
  if (role === "admin") return true;
  return isLaunched();
}

// The free-trial window. Trials start at launch for everyone, so they all
// run launchedAt .. launchedAt + TRIAL_DAYS. Null before a launch date is set.
export function trialWindow(launchedAt: Date | null): {
  startsAt: Date | null;
  endsAt: Date | null;
} {
  if (!launchedAt) return { startsAt: null, endsAt: null };
  return {
    startsAt: launchedAt,
    endsAt: new Date(launchedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
  };
}

// Set (or clear, with null) the launch date. Called from the admin toggle.
export async function setLaunchedAt(launchedAt: Date | null): Promise<void> {
  await prisma.platformConfig.upsert({
    where: { id: CONFIG_ID },
    create: { id: CONFIG_ID, launchedAt },
    update: { launchedAt },
  });
}
