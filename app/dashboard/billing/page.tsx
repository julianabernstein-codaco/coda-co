import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { servicePlans, planPriceLabel, servicePlanRenewalNote } from "@/lib/data/plans";
import { formatFullDate } from "@/lib/format/date";
import { prisma } from "@/lib/db";
import { getLiveSubscription, reconcileServicesSubscription } from "@/lib/billing/sync";
import { isStripeConfigured } from "@/lib/stripe";
import { requireVendor } from "../lib";
import {
  CancelSubButton,
  PortalButton,
  SetupFeeButton,
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
  const { vendor } = await requireVendor();
  const { status } = await searchParams;

  const offersServices = vendor.kind === "services" || vendor.kind === "both";
  const offersGoods = vendor.kind === "goods" || vendor.kind === "both";
  let servicesSub = vendor.subscriptions.find((s) => s.kind === "services");
  const setupFee = vendor.payments.find((p) => p.type === "setup_fee");

  // Self-heal a missed webhook: if the vendor has paid (has a Stripe
  // customer) but the services subscription isn't active yet, pull the
  // live status from Stripe so a refresh reflects reality instead of
  // sitting on "Choose a plan" forever.
  if (
    offersServices &&
    vendor.stripeCustomerId &&
    isStripeConfigured() &&
    !(servicesSub && ACTIVE.has(servicesSub.status))
  ) {
    await reconcileServicesSubscription(vendor.id, vendor.stripeCustomerId);
    servicesSub =
      (await prisma.subscription.findFirst({
        where: { vendorId: vendor.id, kind: "services" },
      })) ?? servicesSub;
  }

  // cancel_at_period_end isn't persisted locally, so read it live to show a
  // scheduled cancellation on the page (not just in the Stripe portal).
  let cancelScheduled = false;
  if (servicesSub?.stripeSubscriptionId && ACTIVE.has(servicesSub.status)) {
    const live = await getLiveSubscription(servicesSub.stripeSubscriptionId);
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

          {offersServices && (
            <ServicesBilling
              status={servicesSub?.status}
              interval={servicesSub?.interval}
              planId={servicesSub?.planId}
              trialEndsAt={servicesSub?.trialEndsAt ?? null}
              cancelScheduled={cancelScheduled}
            />
          )}
          {offersGoods && (
            <GoodsBilling status={setupFee?.status} hasFee={Boolean(setupFee)} />
          )}
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

function SubscribePlanButtons() {
  const recurring = servicePlans.filter((p) => p.billingType === "recurring");
  return (
    <>
      <div className="flex flex-col gap-2">
        {recurring.map((plan) => (
          <SubscribeButton
            key={plan.id}
            planId={plan.id}
            label={`${plan.name} — ${planPriceLabel(plan)}`}
            primary={plan.popular}
          />
        ))}
      </div>
      <p className="text-[13px] text-cl mt-3">{servicePlanRenewalNote}</p>
    </>
  );
}

function ServicesBilling({
  status,
  interval,
  planId,
  trialEndsAt,
  cancelScheduled,
}: {
  status?: string;
  interval?: string;
  planId?: string;
  trialEndsAt?: Date | null;
  cancelScheduled?: boolean;
}) {
  // Free trial in progress: the vendor's services are live at no charge until
  // trialEndsAt. They convert to a paid monthly/annual plan before then.
  if (status === "trialing" && trialEndsAt) {
    const daysLeft = Math.max(
      0,
      Math.ceil((trialEndsAt.getTime() - Date.now()) / 86_400_000),
    );
    return (
      <Panel title="Your free trial">
        <p className="text-[15px] text-cm mb-4 leading-relaxed">
          You’re on your <span className="text-ch">free 3-month trial</span> —{" "}
          <span className="text-ch">
            {daysLeft} {daysLeft === 1 ? "day" : "days"} left
          </span>
          , through {formatFullDate(trialEndsAt)}. Your services are live at no
          charge. Choose a plan before then to keep your listing up.
        </p>
        <SubscribePlanButtons />
      </Panel>
    );
  }

  // Paid subscription active.
  if (status === "active") {
    const intervalWord = interval === "year" ? "annual" : "monthly";
    return (
      <Panel title="Your services subscription">
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
      <Panel title="Your services subscription">
        <p className="text-[15px] text-tr mb-4 leading-relaxed">
          There’s a problem with your latest payment. Update your card to keep your
          listing live.
        </p>
        <PortalButton />
      </Panel>
    );
  }

  // Pending free-trial (Starter) vendor whose trial hasn't started — their
  // listing isn't live yet. The trial begins at go-live; nothing to pay now.
  if (planId === "starter") {
    return (
      <Panel title="Your free trial">
        <p className="text-[15px] text-cm leading-relaxed">
          Your 3-month free trial begins the day your listing goes live on CodaCo.
          You’ll choose a monthly or annual plan before it ends — no charge until
          then.
        </p>
      </Panel>
    );
  }

  // Recurring plan chosen but not yet active: prompt to subscribe.
  return (
    <Panel title="Choose a services plan">
      <p className="text-[15px] text-cm mb-5 leading-relaxed">
        Subscribe to publish your services on CodaCo. Pick monthly or save with annual
        billing.
      </p>
      <SubscribePlanButtons />
    </Panel>
  );
}

function GoodsBilling({ status, hasFee }: { status?: string; hasFee: boolean }) {
  // No setup-fee row means the vendor is on the free Starter goods plan.
  if (!hasFee) {
    return (
      <Panel title="Your goods plan">
        <p className="text-[15px] text-cm leading-relaxed">
          You’re on the free Starter plan — up to 3 listings, no charge.
        </p>
      </Panel>
    );
  }
  if (status === "paid") {
    return (
      <Panel title="Your goods storefront">
        <p className="text-[15px] text-cm leading-relaxed">
          Set-up fee paid — your Storefront is active with unlimited listings. This was a
          one-time payment; there’s nothing more to pay.
        </p>
      </Panel>
    );
  }
  return (
    <Panel title="Your goods storefront">
      <p className="text-[15px] text-cm mb-5 leading-relaxed">
        Pay your one-time Storefront set-up fee to unlock unlimited listings. Pay once,
        never again.
      </p>
      <SetupFeeButton label="Pay set-up fee" />
    </Panel>
  );
}
