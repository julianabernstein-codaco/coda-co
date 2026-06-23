"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createOrder,
  markOrderPaid as markOrderPaidApi,
  CheckoutError,
  type CartLineInput,
  type ShippingAddressInput,
} from "@/lib/api/orders";
import { clearCart } from "@/lib/api/cart";

export interface PlaceOrderResult {
  orderId?: string;
  error?: string;
}

// Buyer id always comes from the session, never the client. createOrder
// re-validates prices and stock, so the cart lines posted here are untrusted
// input used only to know *what* to look up.
export async function placeOrder(input: {
  lines: CartLineInput[];
  shippingAddress: ShippingAddressInput;
}): Promise<PlaceOrderResult> {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in to place your order." };

  try {
    const { orderId } = await createOrder({
      buyerUserId: session.user.id,
      lines: input.lines,
      shippingAddress: input.shippingAddress,
    });
    // Empty the account cart server-side once the order exists, so it can't
    // re-appear if the client navigation drops before the provider clears.
    await clearCart(session.user.id);
    return { orderId };
  } catch (err) {
    if (err instanceof CheckoutError) return { error: err.message };
    return { error: "Something went wrong placing your order. Please try again." };
  }
}

// Dev stub standing in for the Stripe webhook (PR 3). Posted from the success
// page; flips the buyer's own pending order to paid, then re-renders.
export async function markOrderPaid(orderId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/cart");
  await markOrderPaidApi(orderId, session.user.id);
  redirect(`/checkout/success?order=${orderId}`);
}
