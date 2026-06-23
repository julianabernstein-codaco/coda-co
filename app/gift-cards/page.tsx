import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { isStripeConfigured } from "@/lib/stripe";
import { GiftCardForm } from "./GiftCardForm";

export const metadata: Metadata = {
  title: "Gift cards · CodaCo",
  description:
    "Give a CodaCo gift card — spendable toward goods and services in the marketplace.",
};

export default async function GiftCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <Container width="mid" className="py-12">
      <div className="mb-8 max-w-[560px]">
        <h1 className="font-serif text-[34px] font-light text-ch mb-2">CodaCo gift cards</h1>
        <p className="text-[15px] text-cl leading-relaxed">
          Give support that can be spent when it's needed. A CodaCo gift card holds a
          balance the recipient can put toward goods and services across the marketplace —
          all at once or a little at a time.
        </p>
      </div>

      {status === "success" && (
        <div className="bg-sg-p border border-sg-l rounded-[10px] px-5 py-4 mb-6">
          <p className="text-[13px] text-sg-d">
            Payment received — thank you. The gift card is on its way by email once the
            charge settles (usually a few seconds).
          </p>
        </div>
      )}
      {status === "cancelled" && (
        <div className="bg-white border border-line rounded-[10px] px-5 py-4 mb-6">
          <p className="text-[13px] text-cm">Checkout cancelled — no charge was made.</p>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-[1fr_300px] items-start">
        <Card className="space-y-6">
          {isStripeConfigured() ? (
            <GiftCardForm />
          ) : (
            <p className="text-[14px] text-cm">
              Gift cards aren't available just yet. Please check back soon.
            </p>
          )}
        </Card>

        <Card hoverTone="none" className="space-y-3 text-[13px] text-cm leading-relaxed">
          <h2 className="font-serif text-[17px] text-ch">How it works</h2>
          <p>1. Choose an amount and pay securely through Stripe.</p>
          <p>2. We email the gift card — to you, or straight to the recipient.</p>
          <p>
            3. The balance is spent at checkout on goods, and toward services billed
            through CodaCo. Any unused balance stays on the card.
          </p>
          <p className="pt-1">
            Already have a card?{" "}
            <Link href="/gift-cards/redeem" className="text-tr underline">
              Check its balance
            </Link>
            .
          </p>
        </Card>
      </div>
    </Container>
  );
}
