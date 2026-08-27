import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { isStripeConfigured } from "@/lib/stripe";
import { auth } from "@/auth";
import { giftCardsOpenFor } from "@/lib/launch";
import { reconcilePendingGiftCardById } from "@/lib/api/giftCards";
import { overGiftCardLimit, RECONCILE_LIMIT } from "./limits";
import { GiftCardForm } from "./GiftCardForm";

export const metadata: Metadata = {
  title: "Gift cards · CodaCo",
  description:
    "Give a CodaCo gift card — spendable toward goods and services in the marketplace.",
};

export default async function GiftCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; card?: string }>;
}) {
  const { status, card } = await searchParams;
  // Sales hold (see lib/launch.ts). Admins keep the form so the team can still
  // validate a live purchase end-to-end.
  const session = await auth();
  const salesOpen = await giftCardsOpenFor(session?.user?.role);
  // After a single-purchase checkout we land back here with ?card=<id>. If the
  // funding webhook was missed, recover it from Stripe so the recipient's
  // delivery email actually goes out.
  //
  // That id is whatever the URL says, and reconciling costs an outbound Stripe
  // search — so throttle per IP first. A real buyer lands here once; being over
  // budget just skips the self-heal (the webhook is still the primary path) and
  // renders the page normally.
  if (card && !(await overGiftCardLimit("reconcile", RECONCILE_LIMIT, "giftcard.reconcile_rate_limited"))) {
    await reconcilePendingGiftCardById(card);
  }

  return (
    <Container width="mid" className="py-12">
      <div className="mb-8 max-w-[560px]">
        <h1 className="font-serif text-[34px] font-light text-ch mb-2">CodaCo gift cards</h1>
        {/* Future tense while held, so the page doesn't open by selling
            something you can't buy two paragraphs further down. */}
        <p className="text-[17px] text-cl leading-relaxed">
          {salesOpen ? (
            <>
              Give support that can be spent when it&apos;s needed. A CodaCo gift card holds
              a balance the recipient can put toward goods and services across the
              marketplace — all at once or a little at a time.
            </>
          ) : (
            <>
              Support that can be spent when it&apos;s needed. A CodaCo gift card will hold a
              balance the recipient can put toward goods and services across the
              marketplace — all at once or a little at a time.
            </>
          )}
        </p>
      </div>

      {/* The hold, stated first. Below it the notice would be the third thing
          read, and easy to mistake for a form that failed to load. */}
      {!salesOpen && (
        <div className="bg-tr-p border border-tr-l rounded-[10px] px-5 py-4 mb-6">
          <p className="text-[15px] text-ch leading-relaxed">
            <span className="font-medium">Gift cards aren&apos;t on sale yet.</span> We&apos;re
            finishing the checkout experience first, so a balance can actually be spent
            when you give it — check back soon.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="bg-sg-p border border-sg-l rounded-[10px] px-5 py-5 mb-6">
          <p className="text-[15px] text-sg-d leading-relaxed">
            Thank you for your purchase, and for thinking of someone in need of support.
            You will receive an emailed receipt as soon as your payment is confirmed.
          </p>
          <Link href="/" className="btn-secondary btn-sm no-underline mt-4 inline-block">
            Return home
          </Link>
        </div>
      )}
      {status === "cancelled" && (
        <div className="bg-white border border-line rounded-[10px] px-5 py-4 mb-6">
          <p className="text-[15px] text-cm">Checkout cancelled — no charge was made.</p>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-[1fr_300px] items-start">
        <Card className="space-y-6">
          {salesOpen && isStripeConfigured() ? (
            <GiftCardForm />
          ) : (
            // The banner above already states the hold, so this card carries
            // the one thing that still works rather than repeating it.
            <div className="space-y-3">
              <h2 className="font-serif text-[19px] text-ch">Already have a gift card?</h2>
              <p className="text-[16px] text-cm leading-relaxed">
                Cards that have already been bought are unaffected — you can check a
                balance and add it to your account as normal.
              </p>
              <Link
                href="/gift-cards/redeem"
                className="btn-secondary btn-md no-underline inline-block"
              >
                Check a balance
              </Link>
            </div>
          )}
        </Card>

        {/* Instructions become a description while held — the imperative steps
            ("Choose an amount", "Pick Group gift") point at controls that
            aren't rendered, which is what made the page contradict itself. */}
        <Card hoverTone="none" className="space-y-3 text-[15px] text-cm leading-relaxed">
          <h2 className="font-serif text-[17px] text-ch">
            {salesOpen ? "How it works" : "How it will work"}
          </h2>
          {salesOpen ? (
            <>
              <p>1. Choose an amount and pay securely through Stripe.</p>
              <p>2. We email the gift card — to you, or straight to the recipient.</p>
            </>
          ) : (
            <>
              <p>1. You choose an amount and pay securely through Stripe.</p>
              <p>2. We email the gift card — to you, or straight to the recipient.</p>
            </>
          )}
          <p>
            3. The balance is spent at checkout on goods, and toward services billed
            through CodaCo. Any unused balance stays on the card.
          </p>
          <p className="pt-1 border-t border-line">
            <span className="text-ch font-medium">Giving as a group?</span>{" "}
            {salesOpen ? (
              <>
                Pick “Group gift” to get a shareable link so others can chip in to one
                card — no account needed — before you send it on.
              </>
            ) : (
              <>
                You&apos;ll be able to start a group gift with a shareable link, so others
                can chip in to one card — no account needed — before you send it on.
              </>
            )}
          </p>
          {/* Only when selling — while held the card on the left leads with
              this, and saying it twice on one screen reads as filler. */}
          {salesOpen && (
            <p className="pt-1">
              Already have a card?{" "}
              <Link href="/gift-cards/redeem" className="text-tr underline">
                Check its balance
              </Link>
              .
            </p>
          )}
        </Card>
      </div>
    </Container>
  );
}
