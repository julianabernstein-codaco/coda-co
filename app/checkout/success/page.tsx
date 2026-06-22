import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { getOrderForBuyer } from "@/lib/api/orders";
import { markOrderPaid } from "../actions";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/cart");

  const { order: orderId } = await searchParams;
  const order = orderId ? await getOrderForBuyer(orderId, session.user.id) : null;

  if (!order) {
    return (
      <Container width="mid" className="py-16">
        <h1 className="font-serif text-[30px] font-light text-ch mb-3">Order not found</h1>
        <Link href="/shop" className="btn-primary btn-md no-underline">
          Browse goods
        </Link>
      </Container>
    );
  }

  // Dev-only stand-in for Stripe payment (PR 3 replaces it with the webhook).
  // Never shown in production, so a real deploy can't bypass payment.
  const showPaidStub =
    process.env.NODE_ENV !== "production" && order.status === "pending";

  return (
    <Container width="mid" className="py-16">
      <h1 className="font-serif text-[34px] font-light text-ch mb-2">Thank you</h1>
      <p className="text-[15px] text-cl mb-6">
        Your order has been placed.{" "}
        {order.status === "paid" ? "Payment received." : "Awaiting payment."}
      </p>

      <Card className="space-y-3 max-w-[480px]">
        <div className="flex justify-between text-[14px]">
          <span className="text-cm">Order</span>
          <span className="font-mono text-[12px] text-ch">{order.id}</span>
        </div>
        <div className="flex justify-between text-[14px]">
          <span className="text-cm">Status</span>
          <span className="font-medium text-ch capitalize">{order.status}</span>
        </div>
        <ul className="space-y-1 border-t border-line pt-3">
          {order.items.map((it) => (
            <li key={it.id} className="flex justify-between gap-3 text-[13px]">
              <span className="text-cm">
                {it.productTitleSnapshot} · {it.variantLabelSnapshot} × {it.quantity}
              </span>
              <span className="text-ch shrink-0">
                ${(it.unitPriceCents * it.quantity) / 100}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between text-[14px] border-t border-line pt-3">
          <span className="text-cm">Total</span>
          <span className="font-medium text-ch">${order.totalCents / 100}</span>
        </div>
      </Card>

      {showPaidStub && (
        <form action={markOrderPaid.bind(null, order.id)} className="mt-6">
          <button type="submit" className="btn-secondary btn-md">
            Mark as paid (dev)
          </button>
          <p className="text-[12px] text-cl mt-2">
            Stand-in for Stripe payment until checkout payment lands (PR 3).
          </p>
        </form>
      )}

      <div className="mt-8">
        <Link href="/shop" className="text-[13px] text-cm hover:text-tr no-underline">
          Continue shopping
        </Link>
      </div>
    </Container>
  );
}
