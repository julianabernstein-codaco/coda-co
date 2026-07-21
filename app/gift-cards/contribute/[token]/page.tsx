import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { isStripeConfigured } from "@/lib/stripe";
import { getContributeView, reconcilePendingByContributeToken } from "@/lib/api/giftCards";
import { formatCents } from "@/lib/format/giftCard";
import { ContributeForm } from "./ContributeForm";

export const metadata: Metadata = {
  title: "Chip in · CodaCo gift card",
  robots: { index: false },
};

export default async function ContributePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { token } = await params;
  const { status } = await searchParams;
  // Self-heal a missed funding webhook (e.g. a contributor lands here right
  // after the creating payment) before reading the pool's state.
  await reconcilePendingByContributeToken(token);
  const view = await getContributeView(token);
  if (!view.found) notFound();

  const forWhom = view.recipientName ? ` for ${view.recipientName}` : "";

  return (
    <Container width="narrow" className="py-12">
      <div className="mb-8">
        <p className="text-[14px] tracking-[.14em] uppercase text-tr mb-1.5">Group gift</p>
        <h1 className="font-serif text-[32px] font-light text-ch mb-2">
          Chip in on a CodaCo gift card{forWhom}
        </h1>
        <p className="text-[17px] text-cl leading-relaxed">
          Add to a shared gift card balance the recipient can put toward goods and services
          across the marketplace. No account needed.
        </p>
      </div>

      {status === "thanks" && (
        <div className="bg-sg-p border border-sg-l rounded-[10px] px-5 py-4 mb-6">
          <p className="text-[15px] text-sg-d">
            Thank you for chipping in! Your contribution is added once the charge settles.
          </p>
        </div>
      )}
      {status === "cancelled" && (
        <div className="bg-white border border-line rounded-[10px] px-5 py-4 mb-6">
          <p className="text-[15px] text-cm">Checkout cancelled — no charge was made.</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_240px] items-start">
        <Card>
          {isStripeConfigured() ? (
            <ContributeForm token={token} />
          ) : (
            <p className="text-[16px] text-cm">
              Contributions aren't available just yet. Please check back soon.
            </p>
          )}
        </Card>

        <Card hoverTone="none" className="space-y-2">
          <div className="text-[14px] text-cl uppercase tracking-wide">Raised so far</div>
          <div className="font-serif text-[28px] font-light text-ch">
            {formatCents(view.balanceCents)}
          </div>
          <div className="text-[15px] text-cm">
            {view.contributorCount === 1
              ? "1 contribution"
              : `${view.contributorCount} contributions`}
          </div>
          {view.giftMessage && (
            <p className="pt-2 text-[15px] text-cm italic leading-relaxed border-t border-line mt-2">
              “{view.giftMessage}”
            </p>
          )}
          {view.delivered && (
            <p className="pt-2 text-[14px] text-cl">
              This gift has been sent to the recipient — top-ups still welcome.
            </p>
          )}
        </Card>
      </div>
    </Container>
  );
}
