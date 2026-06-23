"use server";

import { auth } from "@/auth";
import { getProducts } from "@/lib/api/products";
import {
  getCart,
  addToCart,
  setCartItemQty,
  removeFromCart,
  clearCart,
} from "@/lib/api/cart";
import type { CartItem, ProductWithRating } from "@/lib/types";

// The cart stores only `{ productId, variantId, qty }`. The cart + checkout
// pages call this to hydrate live display data. Only `published` products come
// back (getProducts filters to them), so an unpublished or deleted product
// drops out and the page can flag that line as unavailable.
export async function getCartProducts(ids: string[]): Promise<ProductWithRating[]> {
  if (ids.length === 0) return [];
  return getProducts({ ids });
}

// --- Account cart mutations. All scoped to the session user; a signed-out
// caller gets an empty cart back (there is no guest cart). Each returns the
// authoritative cart so the client provider can replace its state. ---

export async function loadCart(): Promise<CartItem[]> {
  const session = await auth();
  if (!session?.user) return [];
  return getCart(session.user.id);
}

export async function addCartItem(variantId: string, qty: number): Promise<CartItem[]> {
  const session = await auth();
  if (!session?.user) return [];
  return addToCart(session.user.id, variantId, qty);
}

export async function updateCartItemQty(variantId: string, qty: number): Promise<CartItem[]> {
  const session = await auth();
  if (!session?.user) return [];
  return setCartItemQty(session.user.id, variantId, qty);
}

export async function removeCartItem(variantId: string): Promise<CartItem[]> {
  const session = await auth();
  if (!session?.user) return [];
  return removeFromCart(session.user.id, variantId);
}

export async function clearCartItems(): Promise<CartItem[]> {
  const session = await auth();
  if (!session?.user) return [];
  await clearCart(session.user.id);
  return [];
}
