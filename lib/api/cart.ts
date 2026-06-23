import { prisma } from "@/lib/db";
import type { CartItem } from "@/lib/types";

// The account cart is sign-in only (no guest cart) and lives in `cart_items`,
// scoped to a user. It holds no price/title snapshot — just a reference to the
// variant and a quantity — because price is always read live at checkout
// (createOrder). Every mutation returns the fresh cart so callers can replace
// their state authoritatively.

// Lightweight `{ productId (slug), variantId, qty }` lines — the shape the
// client provider and cart UI consume. Display data (title, price, image) is
// hydrated separately via getCartProducts.
export async function getCart(userId: string): Promise<CartItem[]> {
  const rows = await prisma.cartItem.findMany({
    where: { userId },
    include: { productVariant: { select: { product: { select: { slug: true } } } } },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    productId: r.productVariant.product.slug,
    variantId: r.productVariantId,
    qty: r.quantity,
  }));
}

// Adding an existing variant bumps its quantity (the unique (user, variant)
// index makes this an upsert).
export async function addToCart(
  userId: string,
  variantId: string,
  qty: number,
): Promise<CartItem[]> {
  if (qty > 0) {
    await prisma.cartItem.upsert({
      where: { userId_productVariantId: { userId, productVariantId: variantId } },
      create: { userId, productVariantId: variantId, quantity: qty },
      update: { quantity: { increment: qty } },
    });
  }
  return getCart(userId);
}

// Sets an absolute quantity; qty <= 0 removes the line.
export async function setCartItemQty(
  userId: string,
  variantId: string,
  qty: number,
): Promise<CartItem[]> {
  if (qty <= 0) {
    await prisma.cartItem.deleteMany({ where: { userId, productVariantId: variantId } });
  } else {
    await prisma.cartItem.upsert({
      where: { userId_productVariantId: { userId, productVariantId: variantId } },
      create: { userId, productVariantId: variantId, quantity: qty },
      update: { quantity: qty },
    });
  }
  return getCart(userId);
}

export async function removeFromCart(
  userId: string,
  variantId: string,
): Promise<CartItem[]> {
  await prisma.cartItem.deleteMany({ where: { userId, productVariantId: variantId } });
  return getCart(userId);
}

export async function clearCart(userId: string): Promise<void> {
  await prisma.cartItem.deleteMany({ where: { userId } });
}
