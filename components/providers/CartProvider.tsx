"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { CartItem } from "@/lib/types";
import {
  addCartItem,
  updateCartItemQty,
  removeCartItem,
  clearCartItems,
} from "@/app/cart/actions";

interface CartContextType {
  items: CartItem[];
  count: number;
  // False for signed-out visitors. The cart is account-only (no guest cart),
  // so add-to-cart surfaces a sign-in prompt instead of mutating.
  isSignedIn: boolean;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (productId: string, variantId: string) => Promise<void>;
  updateQty: (productId: string, variantId: string, qty: number) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

function sameLine(a: CartItem, productId: string, variantId: string) {
  return a.productId === productId && a.variantId === variantId;
}

// Server-backed cart. `initialItems` is the user's `cart_items` loaded in the
// root layout (so the badge is correct on first paint, no flash). Each mutation
// updates local state optimistically, then replaces it with the authoritative
// cart the server action returns. The DB is the source of truth; the provider
// is keyed by user id in the layout, so it remounts cleanly on sign-in/out.
export function CartProvider({
  initialItems,
  isSignedIn,
  children,
}: {
  initialItems: CartItem[];
  isSignedIn: boolean;
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>(initialItems);

  const addItem = useCallback(
    async (item: CartItem) => {
      if (!isSignedIn) return;
      setItems((prev) => {
        const existing = prev.find((i) => sameLine(i, item.productId, item.variantId));
        return existing
          ? prev.map((i) =>
              sameLine(i, item.productId, item.variantId)
                ? { ...i, qty: i.qty + item.qty }
                : i,
            )
          : [...prev, item];
      });
      setItems(await addCartItem(item.variantId, item.qty));
    },
    [isSignedIn],
  );

  const removeItem = useCallback(
    async (productId: string, variantId: string) => {
      if (!isSignedIn) return;
      setItems((prev) => prev.filter((i) => !sameLine(i, productId, variantId)));
      setItems(await removeCartItem(variantId));
    },
    [isSignedIn],
  );

  const updateQty = useCallback(
    async (productId: string, variantId: string, qty: number) => {
      if (!isSignedIn) return;
      setItems((prev) =>
        qty <= 0
          ? prev.filter((i) => !sameLine(i, productId, variantId))
          : prev.map((i) => (sameLine(i, productId, variantId) ? { ...i, qty } : i)),
      );
      setItems(await updateCartItemQty(variantId, qty));
    },
    [isSignedIn],
  );

  const clear = useCallback(async () => {
    if (!isSignedIn) return;
    setItems([]);
    setItems(await clearCartItems());
  }, [isSignedIn]);

  const count = items.reduce((n, i) => n + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, count, isSignedIn, addItem, removeItem, updateQty, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
