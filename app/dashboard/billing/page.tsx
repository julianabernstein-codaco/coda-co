import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { servicePlans, planPriceLabel } from "@/lib/data/plans";
import { getPlan } from "@/lib/api/plans";
import { isStripeConfigured } from "@/lib/stripe";
import { requireVendor } from "../lib";
import { PortalButton, SetupFeeButton, SubscribeButton } from "./BillingButtons";

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
  const servicesSub = vendor.subscriptions.find((s) => s.kind === "services");
  const setupFee = vendor.payments.find((p) => p.type === "setup_fee");

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
            <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">Vendor</p>
            <h1 className="font-serif text-[32px] font-light text-ch">Billing</h1>
            <p className="text-[13px] text-cl mt-1.5">Manage how you pay to be on CodaCo.</p>
          </div>

          {status === "success" && (
            <div className="bg-sg-p border border-sg-l rounded-[10px] px-5 py-4 mb-5">
              <p className="text-[13px] text-sg-d">
                Payment received — thank you. It can take a few seconds for your status
                below to update.
              </p>
            </div>
          )}
          {status === "cancelled" && (
            <div className="bg-white border border-line rounded-[10px] px-5 py-4 mb-5">
              <p className="text-[13px] text-cm">Checkout cancelled — no charge was made.</p>
            </div>
          )}
          {!isStripeConfigured() && (
            <div className="bg-white border border-line rounded-[10px] px-5 py-4 mb-5">
              <p className="text-[13px] text-cm">
                Billing isn’t configured in this environment yet. Buttons below are
                inactive until Stripe keys are set.
              </p>
            </div>
          )}

          {offersServices && (
            <ServicesBilling status={servicesSub?.status} planId={servicesSub?.planId} />
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

function ServicesBilling({ status, planId }: { status?: string; planId?: string }) {
  if (status && ACTIVE.has(status)) {
    const plan = planId ? getPlan("services", planId) : undefined;
    return (
      <Panel title="Your services subscription">
        <p className="text-[13px] text-cm mb-4 leading-relaxed">
          You’re subscribed{plan ? ` on the ${plan.name} plan` : ""}. Manage your card,
          switch plans, or cancel anytime.
        </p>
        <PortalButton />
      </Panel>
    );
  }
  if (status && NEEDS_ATTENTION.has(status)) {
    return (
      <Panel title="Your services subscription">
        <p className="text-[13px] text-tr mb-4 leading-relaxed">
          There’s a problem with your latest payment. Update your card to keep your
          listing live.
        </p>
        <PortalButton />
      </Panel>
    );
  }

  const recurring = servicePlans.filter((p) => p.billingType === "recurring");
  return (
    <Panel title="Choose a services plan">
      <p className="text-[13px] text-cm mb-5 leading-relaxed">
        Subscribe to publish your services on CodaCo. Pick monthly or save with annual
        billing.
      </p>
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
    </Panel>
  );
}

function GoodsBilling({ status, hasFee }: { status?: string; hasFee: boolean }) {
  // No setup-fee row means the vendor is on the free Starter goods plan.
  if (!hasFee) {
    return (
      <Panel title="Your goods plan">
        <p className="text-[13px] text-cm leading-relaxed">
          You’re on the free Starter plan — up to 3 listings, no charge.
        </p>
      </Panel>
    );
  }
  if (status === "paid") {
    return (
      <Panel title="Your goods storefront">
        <p className="text-[13px] text-cm leading-relaxed">
          Set-up fee paid — your Storefront is active with unlimited listings. This was a
          one-time payment; there’s nothing more to pay.
        </p>
      </Panel>
    );
  }
  return (
    <Panel title="Your goods storefront">
      <p className="text-[13px] text-cm mb-5 leading-relaxed">
        Pay your one-time Storefront set-up fee to unlock unlimited listings. Pay once,
        never again.
      </p>
      <SetupFeeButton label="Pay set-up fee" />
    </Panel>
  );
}
