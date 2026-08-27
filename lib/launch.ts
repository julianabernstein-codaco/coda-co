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

// Paid vendor billing (goods + services subscriptions) is open once
// launched. Admins can always transact so the team can validate live payments
// before launch. Gift cards have their own switch — see giftCardsOpenFor.
// Pass the signed-in user's role.
export async function paidFlowsOpenFor(role?: string | null): Promise<boolean> {
  if (role === "admin") return true;
  return isLaunched();
}

// ── Gift cards ────────────────────────────────────────────────────────────
//
// Deliberately independent of `launchedAt`. The launch date answers "can we
// bill vendors yet"; this answers "should the public be able to buy a balance
// we can't yet redeem". Until Phase E ships a spend path, every card sold is
// an unredeemable obligation, so the flag ships OFF and is switched on from
// /admin/launch.
//
// This gates the two money-IN on-ramps only — buying a card and chipping into
// a pool. Checking a balance, claiming a card, and an organizer delivering an
// already-funded pool stay open unconditionally: those people paid, and a hold
// must never strand them.

export async function areGiftCardsEnabled(): Promise<boolean> {
  const cfg = await prisma.platformConfig.findUnique({
    where: { id: CONFIG_ID },
    select: { giftCardsEnabled: true },
  });
  return cfg?.giftCardsEnabled ?? false;
}

// Admins bypass, mirroring paidFlowsOpenFor — the team needs to run a real
// purchase against live keys to validate the webhook and payout before the
// flow opens to anyone else (LAUNCH.md, pre-launch step 3).
export async function giftCardsOpenFor(role?: string | null): Promise<boolean> {
  if (role === "admin") return true;
  return areGiftCardsEnabled();
}

export async function setGiftCardsEnabled(enabled: boolean): Promise<void> {
  await prisma.platformConfig.upsert({
    where: { id: CONFIG_ID },
    create: { id: CONFIG_ID, giftCardsEnabled: enabled },
    update: { giftCardsEnabled: enabled },
  });
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

// Whether the demo/example vendors are currently hidden from public
// surfaces (the retirement switch, flipped from /admin/launch).
export async function isDemoHidden(): Promise<boolean> {
  const cfg = await prisma.platformConfig.findUnique({
    where: { id: CONFIG_ID },
    select: { demoVendorsHidden: true },
  });
  return cfg?.demoVendorsHidden ?? false;
}

export async function setDemoVendorsHidden(hidden: boolean): Promise<void> {
  await prisma.platformConfig.upsert({
    where: { id: CONFIG_ID },
    create: { id: CONFIG_ID, demoVendorsHidden: hidden },
    update: { demoVendorsHidden: hidden },
  });
}
