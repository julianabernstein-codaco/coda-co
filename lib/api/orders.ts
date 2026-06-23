import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

// Cart lines arrive from the client's localStorage cart. They're treated as
// untrusted: createOrder re-reads every price and stock level from the DB.
export interface CartLineInput {
  productId: string; // public slug
  variantId: string; // private variant cuid
  qty: number;
}

// Collected on the checkout form and snapshotted onto the order as JSONB.
export interface ShippingAddressInput {
  recipientName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Thrown for any expected checkout failure (empty cart, gone product,
// oversell). The server action catches it and surfaces `.message` to the
// buyer; the transaction rolls back so no stock is decremented.
export class CheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutError";
  }
}

export async function createOrder(input: {
  buyerUserId: string;
  lines: CartLineInput[];
  shippingAddress: ShippingAddressInput;
}): Promise<{ orderId: string }> {
  const { buyerUserId, lines, shippingAddress } = input;
  if (lines.length === 0) throw new CheckoutError("Your cart is empty.");

  return prisma.$transaction(async (tx) => {
    const itemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];
    let totalCents = 0;
    let currency = "USD";

    for (const line of lines) {
      if (!Number.isInteger(line.qty) || line.qty <= 0) {
        throw new CheckoutError("Invalid quantity in cart.");
      }

      const variant = await tx.productVariant.findUnique({
        where: { id: line.variantId },
        include: { product: { include: { vendor: true } } },
      });

      // Cross-check the slug so a tampered cart can't pair a cheap variant
      // id with another product's slug.
      if (!variant || variant.product.slug !== line.productId) {
        throw new CheckoutError("An item in your cart is no longer available.");
      }
      if (variant.product.status !== "published") {
        throw new CheckoutError(`"${variant.product.title}" is no longer available.`);
      }

      // Atomic oversell guard: the conditional updateMany only decrements
      // when enough stock remains, so two concurrent checkouts can't both
      // claim the last unit. A miss (count 0) means it sold out underneath us.
      const decremented = await tx.productVariant.updateMany({
        where: { id: variant.id, stock: { gte: line.qty } },
        data: { stock: { decrement: line.qty } },
      });
      if (decremented.count !== 1) {
        throw new CheckoutError(
          `"${variant.product.title}" is out of stock at that quantity.`,
        );
      }

      totalCents += variant.priceCents * line.qty;
      currency = variant.currency;
      itemsData.push({
        productVariant: { connect: { id: variant.id } },
        vendor: { connect: { id: variant.product.vendorId } },
        quantity: line.qty,
        unitPriceCents: variant.priceCents,
        currency: variant.currency,
        productTitleSnapshot: variant.product.title,
        variantLabelSnapshot: variant.label,
        fulfillmentStatus: "pending",
      });
    }

    const order = await tx.order.create({
      data: {
        buyerUserId,
        status: "pending",
        totalCents,
        currency,
        shippingAddress: shippingAddress as unknown as Prisma.InputJsonValue,
        items: { create: itemsData },
      },
    });

    return { orderId: order.id };
  });
}

// Dev-only stand-in for the Stripe webhook that lands in PR 3. Scoped to the
// buyer + `pending` status so it can't flip someone else's order or
// double-process. Returns whether a row actually transitioned.
export async function markOrderPaid(
  orderId: string,
  buyerUserId: string,
): Promise<boolean> {
  const res = await prisma.order.updateMany({
    where: { id: orderId, buyerUserId, status: "pending" },
    data: { status: "paid" },
  });
  return res.count === 1;
}

export type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

// Scoped to the buyer so the success page can only show the requester's own
// order.
export async function getOrderForBuyer(
  orderId: string,
  buyerUserId: string,
): Promise<OrderWithItems | null> {
  return prisma.order.findFirst({
    where: { id: orderId, buyerUserId },
    include: { items: true },
  });
}
