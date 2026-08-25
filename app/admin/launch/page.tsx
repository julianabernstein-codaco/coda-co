import type { Metadata } from "next";
import {
  getLaunchedAt,
  isDemoHidden,
  launchedFrom,
  trialWindow,
  TRIAL_DAYS,
} from "@/lib/launch";
import {
  goLiveNow,
  hideDemoVendors,
  revertToPrelaunch,
  scheduleLaunch,
  showDemoVendors,
} from "./actions";
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
          run on the free trial. (Gift cards are always on sale.) Going live opens
          paid flows and starts every vendor’s {TRIAL_DAYS}-day free trial from the
          launch time.
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
          <h2 className="font-serif text-[18px] text-ch mb-2">Demo / example vendors</h2>
          <p className="text-[13px] text-cm mb-4 leading-relaxed">
            Sample vendors show new visitors what a populated marketplace looks
            like. They render with an “Example” badge and can’t be contacted or
            bought from. Once real vendors fill the site, hide them all here.
          </p>
          <div className="flex items-center gap-3">
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
        </div>
      </div>
    </div>
  );
}
