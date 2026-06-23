import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { getManageView, reconcilePendingByOrganizerToken } from "@/lib/api/giftCards";
import { formatCents } from "@/lib/format/giftCard";
import { ShareLink, DeliverForm } from "./ManagePanel";

export const metadata: Metadata = {
  title: "Manage your group gift · CodaCo",
  robots: { index: false },
};

async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export default async function ManagePoolPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { token } = await params;
  const { status } = await searchParams;
  // Self-heal: if the funding webhook was missed/failed, recover the card from
  // Stripe before rendering so the organizer doesn't see a stuck "pending" pot.
  await reconcilePendingByOrganizerToken(token);
  const view = await getManageView(token);
  if (!view.found) notFound();

  const origin = await getOrigin();
  const shareUrl = `${origin}/gift-cards/contribute/${view.contributeToken}`;
  const pending = view.status === "pending";

  return (
    <Container width="mid" className="py-12">
      <div className="mb-8">
        <p className="text-[12px] tracking-[.14em] uppercase text-tr mb-1.5">Group gift</p>
        <h1 className="font-serif text-[32px] font-light text-ch mb-2">Manage your group gift</h1>
        <p className="text-[15px] text-cl leading-relaxed">
          Share the link to collect contributions, then send the gift to the recipient
          whenever you're ready. Top-ups stay open even after you send it.
        </p>
      </div>

      {status === "success" && pending && (
        <div className="bg-sg-p border border-sg-l rounded-[10px] px-5 py-4 mb-6">
          <p className="text-[13px] text-sg-d">
            Payment received — your gift pool will be ready to share in a few seconds. Refresh
            if it still shows pending.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_260px] items-start">
        <div className="space-y-6">
          {/* Share link */}
          <Card className="space-y-3">
            <h2 className="font-serif text-[18px] text-ch">Share to collect contributions</h2>
            <p className="text-[13px] text-cm">
              Anyone with this link can chip in — no account needed. Safe to share widely.
            </p>
            <ShareLink url={shareUrl} />
          </Card>

          {/* Deliver */}
          <Card className="space-y-3">
            <h2 className="font-serif text-[18px] text-ch">
              {view.deliveredAt ? "Sent to the recipient" : "Send the gift"}
            </h2>
            {pending ? (
              <p className="text-[13px] text-cm">
                Once your first contribution clears you'll be able to send the gift here.
              </p>
            ) : (
              <>
                {view.deliveredAt && (
                  <p className="text-[13px] text-sg-d">
                    Delivered to {view.recipientEmail}. You can re-send or keep collecting
                    top-ups.
                  </p>
                )}
                <DeliverForm
                  token={token}
                  alreadyDelivered={view.deliveredAt != null}
                  defaultName={view.recipientName ?? ""}
                  defaultEmail={view.recipientEmail ?? ""}
                  defaultMessage={view.giftMessage ?? ""}
                />
              </>
            )}
          </Card>
        </div>

        {/* Summary */}
        <Card hoverTone="none" className="space-y-3">
          <div>
            <div className="text-[12px] text-cl uppercase tracking-wide">In the pot</div>
            <div className="font-serif text-[30px] font-light text-ch">
              {formatCents(view.balanceCents)}
            </div>
          </div>
          <div className="border-t border-line pt-3">
            <div className="text-[12px] text-cl uppercase tracking-wide mb-2">Contributions</div>
            {view.contributions.length === 0 ? (
              <p className="text-[13px] text-cl">No contributions yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {view.contributions.map((c, i) => (
                  <li key={i} className="flex justify-between text-[13px]">
                    <span className="text-cm">{c.name?.trim() || "Anonymous"}</span>
                    <span className="text-ch font-medium">{formatCents(c.amountCents)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </Container>
  );
}
