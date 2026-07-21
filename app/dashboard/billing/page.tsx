import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { goodsPlans, servicePlans, planPriceLabel, planRenewalNote } from "@/lib/data/plans";
import { prisma } from "@/lib/db";
import { getLiveSubscription, reconcileSubscription } from "@/lib/billing/sync";
import { getLaunchedAt, launchedFrom, trialWindow } from "@/lib/launch";
import { isStripeConfigured } from "@/lib/stripe";
import { requireVendor } from "../lib";
import {
  CancelSubButton,
  PortalButton,
  SubscribeButton,
  UpgradeAnnualButton,
} from "./BillingButtons";

export const metadata: Metadata = { title: "Billing — CodaCo" };
export const dynamic = "force-dynamic";

const ACTIVE = new Set(["active", "trialing"]);
const NEEDS_ATTENTION = new Set(["past_due", "unpaid"]);

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { user, vendor } = await requireVendor();
  const { status } = await searchParams;

  // Pre-launch gate: paid options are shown but locked until launch. Admins
  // bypass so the team can validate live billing. Free trials start at launch.
  const launchedAt = await getLaunchedAt();
  const live = launchedFrom(launchedAt);
  const paidOpen = user.role === "admin" || live;
  const { endsAt: trialEndsAt } = trialWindow(launchedAt);
  let trialLabel: string;
  if (!live) {
    trialLabel = "Your free trial starts when CodaCo launches.";
  } else {
    const daysLeft = Math.ceil((trialEndsAt!.getTime() - Date.now()) / 86_400_000);
    trialLabel =
      daysLeft > 0
        ? `Free trial — ${daysLeft} day${daysLeft === 1 ? "" : "s"} left.`
        : "Your free trial has ended — choose a plan to keep your services live.";
  }

  // A vendor subscribes on one kind. Goods and services now run on the same
  // recurring model; "both" (not produced by the signup forms today) is
  // treated as services for its billing row.
  const subKind = vendor.kind === "services" ? "services" : "goods";
  let sub = vendor.subscriptions.find((s) => s.kind === subKind);

  // Self-heal a missed webhook: if the vendor has paid (has a Stripe
  // customer) but the subscription isn't active yet, pull the live status
  // from Stripe so a refresh reflects reality instead of sitting on
  // "Choose a plan" forever.
  if (
    vendor.stripeCustomerId &&
    isStripeConfigured() &&
    !(sub && ACTIVE.has(sub.status))
  ) {
    await reconcileSubscription(vendor.id, vendor.stripeCustomerId);
    sub =
      (await prisma.subscription.findFirst({
        where: { vendorId: vendor.id, kind: subKind },
      })) ?? sub;
  }

  // cancel_at_period_end isn't persisted locally, so read it live to show a
  // scheduled cancellation on the page (not just in the Stripe portal).
  let cancelScheduled = false;
  if (sub?.stripeSubscriptionId && ACTIVE.has(sub.status)) {
    const live = await getLiveSubscription(sub.stripeSubscriptionId);
    cancelScheduled = live?.cancel_at_period_end ?? false;
  }

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Billing" },
        ]}
      />

      <section className="bg-pl2 px-10 py-10 min-h-screen">
        <Container width="mid">
          <div className="mb-7">
            <p className="text-[13px] tracking-[.14em] uppercase text-tr mb-1.5">Vendor</p>
            <h1 className="font-serif text-[32px] font-light text-ch">Billing</h1>
            <p className="text-[15px] text-cl mt-1.5">Manage how you pay to be on CodaCo.</p>
          </div>

          {status === "success" && (
            <div className="bg-sg-p border border-sg-l rounded-[10px] px-5 py-4 mb-5">
              <p className="text-[15px] text-sg-d">
                Payment received — thank you. It can take a few seconds for your status
                below to update.
              </p>
            </div>
          )}
          {status === "cancelled" && (
            <div className="bg-white border border-line rounded-[10px] px-5 py-4 mb-5">
              <p className="text-[15px] text-cm">Checkout cancelled — no charge was made.</p>
            </div>
          )}
          {!isStripeConfigured() && (
            <div className="bg-white border border-line rounded-[10px] px-5 py-4 mb-5">
              <p className="text-[15px] text-cm">
                Billing isn’t configured in this environment yet. Buttons below are
                inactive until Stripe keys are set.
              </p>
            </div>
          )}

          <SubscriptionBilling
            kind={subKind}
            status={sub?.status}
            planId={sub?.planId}
            interval={sub?.interval}
            cancelScheduled={cancelScheduled}
            paidOpen={paidOpen}
            trialLabel={trialLabel}
          />
        </Container>
      </section>
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[10px] border border-line p-6 mb-5">
      <h2 className="font-serif text-[22px] text-ch mb-4">{title}</h2>
      {children}
    </div>
  );
}

// The paid-plan picker, shown to trial and not-yet-subscribed vendors. When
// pre-launch (paidOpen false) the buttons render visible-but-locked.
function PlanChooser({ kind, paidOpen }: { kind: "goods" | "services"; paidOpen: boolean }) {
  const plans = kind === "goods" ? goodsPlans : servicePlans;
  const recurring = plans.filter((p) => p.billingType === "recurring");
  return (
    <>
      <div className="flex flex-col gap-2">
        {recurring.map((plan) => (
          <SubscribeButton
            key={plan.id}
            planId={plan.id}
            label={`${plan.name} — ${planPriceLabel(plan)}${paidOpen ? "" : " · Available at launch"}`}
            primary={plan.popular}
            locked={!paidOpen}
          />
        ))}
      </div>
      <p className="text-[13px] text-cl mt-3">{planRenewalNote}</p>
      {!paidOpen && (
        <p className="text-[13px] text-cl mt-1">
          Paid plans open when CodaCo launches — until then you’re on the free trial.
        </p>
      )}
    </>
  );
}

// One subscription panel for either vendor kind — goods and services share
// the same recurring model, only the noun differs.
function SubscriptionBilling({
  kind,
  status,
  planId,
  interval,
  cancelScheduled,
  paidOpen,
  trialLabel,
}: {
  kind: "goods" | "services";
  status?: string;
  planId?: string;
  interval?: string;
  cancelScheduled?: boolean;
  paidOpen: boolean;
  trialLabel: string;
}) {
  const noun = kind === "services" ? "services" : "goods";
  // Free-trial (Starter) vendor — not a paid subscriber. Show trial state and
  // let them move to a paid plan (locked pre-launch).
  if (planId === "starter") {
    return (
      <Panel title={`Your ${noun} plan`}>
        <p className="text-[15px] text-cm mb-4 leading-relaxed">
          You’re on the <span className="text-ch">free trial</span> — full access, no
          charge. {trialLabel}
        </p>
        <p className="text-[14px] text-cm mb-3">When you’re ready, choose a plan:</p>
        <PlanChooser kind={kind} paidOpen={paidOpen} />
      </Panel>
    );
  }
  if (status && ACTIVE.has(status)) {
    const intervalWord = interval === "year" ? "annual" : "monthly";
    return (
      <Panel title={`Your ${noun} subscription`}>
        <p className="text-[15px] text-cm mb-4 leading-relaxed">
          Your <span className="text-ch">{intervalWord}</span> subscription is active.
          {cancelScheduled
            ? " It’s set to cancel at the end of the current billing period — reactivate from Manage billing."
            : " Manage your card, switch plans, or cancel anytime."}
        </p>
        <div className="flex flex-wrap gap-2">
          {!cancelScheduled && interval !== "year" && <UpgradeAnnualButton />}
          <PortalButton />
          {!cancelScheduled && <CancelSubButton />}
        </div>
      </Panel>
    );
  }
  if (status && NEEDS_ATTENTION.has(status)) {
    return (
      <Panel title={`Your ${noun} subscription`}>
        <p className="text-[15px] text-tr mb-4 leading-relaxed">
          There’s a problem with your latest payment. Update your card to keep your
          {kind === "services" ? " listing" : " shop"} live.
        </p>
        <PortalButton />
      </Panel>
    );
  }

  return (
    <Panel title={`Choose a ${noun} plan`}>
      <p className="text-[15px] text-cm mb-5 leading-relaxed">
        Subscribe to keep your {noun} on CodaCo after your free trial. Pick monthly or
        save with annual billing.
      </p>
      <PlanChooser kind={kind} paidOpen={paidOpen} />
    </Panel>
  );
}
