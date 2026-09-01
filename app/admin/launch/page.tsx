import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import {
  areGiftCardsEnabled,
  getLaunchedAt,
  hasSitePrivatePassword,
  isDemoHidden,
  isSitePrivate,
  launchedFrom,
  trialWindow,
  TRIAL_DAYS,
} from "@/lib/launch";
import {
  flagMockVendorsAsExamples,
  goLiveNow,
  hideDemoVendors,
  holdGiftCardSales,
  openGiftCardSales,
  revertToPrelaunch,
  scheduleLaunch,
  showDemoVendors,
  takeSitePrivate,
  takeSitePublic,
} from "./actions";
import { PrivatePasswordForm } from "./PrivatePasswordForm";
import { requireAdminPage } from "@/app/admin/lib";

export const metadata: Metadata = { title: "Launch — Admin | CodaCo" };
export const dynamic = "force-dynamic";

function fmt(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";
}

export default async function AdminLaunchPage() {
  await requireAdminPage("/admin/launch");

  const launchedAt = await getLaunchedAt();
  const demoHidden = await isDemoHidden();
  const giftCardsOn = await areGiftCardsEnabled();
  const [sitePrivate, hasPrivatePassword] = await Promise.all([
    isSitePrivate(),
    hasSitePrivatePassword(),
  ]);
  const envGateOn = Boolean(process.env.PREVIEW_PASSWORD);
  const [demoCount, mockUnflagged] = await Promise.all([
    prisma.vendorProfile.count({ where: { demo: true } }),
    prisma.vendorProfile.count({
      where: { demo: false, user: { email: { endsWith: "@codaco.local" } } },
    }),
  ]);
  const live = launchedFrom(launchedAt);
  const scheduled = launchedAt != null && !live; // set, but in the future
  const { endsAt } = trialWindow(launchedAt);

  const state = live
    ? { label: "LIVE", tone: "bg-sg-p border-sg-l text-sg-d" }
    : scheduled
      ? { label: "SCHEDULED", tone: "bg-tr-p border-tr-l text-tr" }
      : { label: "PRE-LAUNCH", tone: "bg-pl border-line text-cm" };

  return (
    <div className="min-h-screen bg-pl2">
      <div className="max-w-[720px] mx-auto px-6 py-10">
        <p className="text-xs font-medium uppercase tracking-widest text-tr mb-1.5">Admin</p>
        <h1 className="font-serif text-4xl text-ch mb-1.5">Launch</h1>
        <p className="text-cm text-sm mb-6">
          Controls whether paid vendor billing is open. Pre-launch, goods and
          services subscriptions are locked for everyone but admins — vendors
          run on the free trial. Going live opens paid flows and starts every
          vendor’s {TRIAL_DAYS}-day free trial from the launch time. Gift-card
          sales are a separate switch, below.
        </p>

        <div className="bg-white rounded-[10px] border border-line p-6 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full border ${state.tone}`}>
              {state.label}
            </span>
            <span className="text-[13px] text-cm">
              Launch time: <span className="text-ch">{fmt(launchedAt)}</span>
            </span>
          </div>
          {live && (
            <p className="text-[13px] text-cm">
              Paid flows are open. Free trials end{" "}
              <span className="text-ch">{fmt(endsAt)}</span>.
            </p>
          )}
          {scheduled && (
            <p className="text-[13px] text-cm">
              Paid flows open automatically at the scheduled time above.
            </p>
          )}
          {!launchedAt && (
            <p className="text-[13px] text-cm">
              No launch date set — the platform is in pre-launch.
            </p>
          )}
        </div>

        <div className="bg-white rounded-[10px] border border-line p-6 space-y-5">
          <div>
            <h2 className="font-serif text-[18px] text-ch mb-2">Go live now</h2>
            <form action={goLiveNow}>
              <button className="btn-primary btn-md" type="submit">
                Launch now
              </button>
            </form>
          </div>

          <div className="border-t border-line pt-5">
            <h2 className="font-serif text-[18px] text-ch mb-2">Schedule a launch</h2>
            <form action={scheduleLaunch} className="flex flex-wrap items-center gap-2">
              <input
                type="datetime-local"
                name="launchedAt"
                required
                className="border border-line-strong rounded-[8px] px-3 py-2 text-[13px] text-ch"
              />
              <button className="btn-secondary btn-md" type="submit">
                Schedule
              </button>
              <span className="text-[12px] text-cl w-full">
                Interpreted as UTC. Paid flows stay locked until this time.
              </span>
            </form>
          </div>

          <div className="border-t border-line pt-5">
            <h2 className="font-serif text-[18px] text-ch mb-2">Revert to pre-launch</h2>
            <p className="text-[12px] text-cl mb-2">
              Clears the launch date and re-locks paid flows.
            </p>
            <form action={revertToPrelaunch}>
              <button className="btn-ghost btn-md" type="submit">
                Back to pre-launch
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-[10px] border border-line p-6 mt-5">
          <h2 className="font-serif text-[18px] text-ch mb-2">Gift card sales</h2>
          <p className="text-[13px] text-cm mb-4 leading-relaxed">
            Whether the public can buy a gift card or chip into a group gift.
            Held by default: until checkout ships (Phase E) a sold card is a
            balance nobody can spend, so every sale is an obligation with
            nothing behind it. Enforced server-side, not just on the buttons.
          </p>
          <p className="text-[13px] text-cm mb-4 leading-relaxed">
            Checking a balance, claiming a card, and an organizer sending an
            already-funded pool stay open either way — a hold must never strand
            someone who already paid. Admins can always buy, so the team can
            validate a live charge before opening sales.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full border ${
                giftCardsOn ? "bg-sg-p border-sg-l text-sg-d" : "bg-pl border-line text-cm"
              }`}
            >
              {giftCardsOn ? "ON SALE" : "ON HOLD"}
            </span>
            <form action={giftCardsOn ? holdGiftCardSales : openGiftCardSales}>
              <button className="btn-secondary btn-md" type="submit">
                {giftCardsOn ? "Hold gift card sales" : "Open gift card sales"}
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-[10px] border border-line p-6 mt-5">
          <h2 className="font-serif text-[18px] text-ch mb-2">Take the site private</h2>
          <p className="text-[13px] text-cm mb-4 leading-relaxed">
            Emergency switch. Puts the whole site back behind the shared-password
            wall — every page except the public welcome and launching pages.
            Applies within about 15 seconds, with no deploy and no migration, so
            it works during an incident when a redeploy is the last thing you
            want to be running.
          </p>
          <p className="text-[13px] text-cm mb-4 leading-relaxed">
            Stripe webhooks and sign-in stay reachable so billing keeps settling
            and the team can still log in. Set the bypass password{" "}
            <span className="text-ch">before</span> you need it — arming is
            blocked without one, since that would lock the team out too.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span
              className={`text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full border ${
                sitePrivate ? "bg-tr-p border-tr-l text-tr" : "bg-sg-p border-sg-l text-sg-d"
              }`}
            >
              {sitePrivate ? "PRIVATE" : "PUBLIC"}
            </span>
            <form action={sitePrivate ? takeSitePublic : takeSitePrivate}>
              <button
                className={sitePrivate ? "btn-secondary btn-md" : "btn-primary btn-md"}
                type="submit"
                disabled={!sitePrivate && !hasPrivatePassword}
              >
                {sitePrivate ? "Make site public again" : "Take site private now"}
              </button>
            </form>
            {!sitePrivate && !hasPrivatePassword && (
              <span className="text-[12px] text-tr w-full">
                Set a bypass password below to enable this.
              </span>
            )}
          </div>

          {envGateOn && (
            <p className="text-[12px] text-cl mb-4 leading-relaxed">
              Note: <code className="text-cm">PREVIEW_PASSWORD</code> is currently
              set, so the site is already gated by the env-var wall regardless of
              this switch. Both passwords work while that is true.
            </p>
          )}

          <div className="border-t border-line pt-5">
            <h3 className="text-[14px] font-medium text-ch mb-1">Bypass password</h3>
            <p className="text-[13px] text-cl mb-3 leading-relaxed">
              What the team enters at <code className="text-cm">/preview-access</code>{" "}
              to get through the wall. Stored hashed. Replacing it signs out every
              device that had already unlocked —{" "}
              {hasPrivatePassword ? "one is set." : "none is set yet."}
            </p>
            <PrivatePasswordForm hasPassword={hasPrivatePassword} />
          </div>
        </div>

        <div className="bg-white rounded-[10px] border border-line p-6 mt-5">
          <h2 className="font-serif text-[18px] text-ch mb-2">Demo / example vendors</h2>
          <p className="text-[13px] text-cm mb-4 leading-relaxed">
            Sample vendors show new visitors what a populated marketplace looks
            like. They render with an “Example” badge and can’t be contacted or
            bought from. Once real vendors fill the site, hide them all here.
          </p>
          <p className="text-[13px] text-cm mb-4">
            <span className="text-ch tabular-nums">{demoCount}</span> vendor
            {demoCount === 1 ? "" : "s"} currently flagged as examples.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full border ${
                demoHidden ? "bg-pl border-line text-cm" : "bg-sg-p border-sg-l text-sg-d"
              }`}
            >
              {demoHidden ? "HIDDEN" : "SHOWING"}
            </span>
            <form action={demoHidden ? showDemoVendors : hideDemoVendors}>
              <button className="btn-secondary btn-md" type="submit">
                {demoHidden ? "Show demo vendors" : "Hide demo vendors"}
              </button>
            </form>
          </div>

          <div className="border-t border-line mt-5 pt-5">
            <h3 className="text-[14px] font-medium text-ch mb-1">Flag mock vendors</h3>
            <p className="text-[13px] text-cl mb-3 leading-relaxed">
              Marks the sample vendors (reserved <code className="text-cm">@codaco.local</code>{" "}
              accounts) as examples — the in-app equivalent of{" "}
              <code className="text-cm">npm run demo:flag</code>.{" "}
              {mockUnflagged > 0
                ? `${mockUnflagged} not yet flagged.`
                : "All mock vendors are already flagged."}
            </p>
            <form action={flagMockVendorsAsExamples}>
              <button className="btn-secondary btn-md" type="submit">
                Flag mock vendors as examples
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
