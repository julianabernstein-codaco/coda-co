"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/providers/CartProvider";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { productThumbBg } from "@/lib/format/product";
import type { ProductWithRating } from "@/lib/types";
import { getCartProducts } from "./actions";

export default function CartPage() {
  const { items, updateQty, removeItem, isSignedIn } = useCart();
  const [products, setProducts] = useState<ProductWithRating[]>([]);
  const [loading, setLoading] = useState(true);

  // Distinct product slugs in the cart. Stable across qty edits, so the
  // fetch only re-runs when a product is added or removed.
  const productIds = useMemo(
    () => Array.from(new Set(items.map((i) => i.productId))),
    [items],
  );
  const idsKey = productIds.join(",");

  useEffect(() => {
    let active = true;
    setLoading(true);
    getCartProducts(idsKey ? idsKey.split(",") : [])
      .then((rows) => active && setProducts(rows))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [idsKey]);

  const byId = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  // Join each cart line to its live product + variant. A line is
  // "unavailable" when the product is unpublished/deleted or its variant
  // no longer exists — surfaced so the buyer can remove it, never crashed.
  const lines = items.map((item) => {
    const product = byId.get(item.productId);
    const variant = product?.variants.find((v) => v.id === item.variantId);
    return { item, product, variant };
  });
  const subtotal = lines.reduce(
    (sum, l) => (l.variant ? sum + l.variant.price * l.item.qty : sum),
    0,
  );

  if (items.length === 0) {
    // The cart is account-linked (sign-in only), so prompt signed-out
    // visitors to sign in rather than just showing "empty".
    return (
      <Container width="mid" className="py-16">
        <h1 className="font-serif text-[34px] font-light text-ch mb-3">Your cart</h1>
        {isSignedIn ? (
          <>
            <p className="text-[17px] text-cl mb-6">Your cart is empty.</p>
            <Link href="/shop" className="btn-primary btn-md no-underline">
              Browse goods
            </Link>
          </>
        ) : (
          <>
            <p className="text-[17px] text-cl mb-6">
              Sign in to start a cart — your cart is saved to your account and
              follows you across devices.
            </p>
            <Link href="/login?next=/cart" className="btn-primary btn-md no-underline">
              Sign in
            </Link>
          </>
        )}
      </Container>
    );
  }

  return (
    <Container width="mid" className="py-12">
      <h1 className="font-serif text-[34px] font-light text-ch mb-6">Your cart</h1>

      <div className="grid gap-8 md:grid-cols-[1fr_300px] items-start">
        {/* Line items */}
        <div className="space-y-3">
          {lines.map(({ item, product, variant }) => {
            const key = `${item.productId}:${item.variantId}`;

            if (!product || !variant) {
              return (
                <Card key={key} className="flex items-center justify-between gap-4">
                  <div className="text-[15px] text-cl">
                    This item is no longer available.
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-[14px] text-cm hover:text-tr underline cursor-pointer"
                  >
                    Remove
                  </button>
                </Card>
              );
            }

            return (
              <Card key={key} className="flex gap-4">
                {/* Thumb */}
                <Link
                  href={`/shop/${product.id}`}
                  className="shrink-0 w-20 h-20 rounded-[8px] overflow-hidden relative block"
                  style={product.coverImageUrl ? undefined : { background: productThumbBg(product.id) }}
                >
                  {product.coverImageUrl && (
                    <Image
                      src={product.coverImageUrl}
                      alt={product.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/shop/${product.id}`}
                    className="text-[16px] font-medium text-ch no-underline hover:text-tr"
                  >
                    {product.title}
                  </Link>
                  <div className="text-[14px] text-cl mt-[2px]">{product.seller}</div>
                  {product.variants.length > 1 && (
                    <div className="text-[14px] text-cm mt-[2px]">{variant.label}</div>
                  )}

                  {/* Quantity stepper */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-line-bold rounded-[8px] overflow-hidden">
                      <button
                        aria-label="Decrease quantity"
                        onClick={() => updateQty(item.productId, item.variantId, item.qty - 1)}
                        className="px-2.5 py-1 text-[17px] text-cm hover:bg-pl cursor-pointer"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 text-[16px] font-medium text-ch min-w-[36px] text-center">
                        {item.qty}
                      </span>
                      <button
                        aria-label="Increase quantity"
                        onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
                        className="px-2.5 py-1 text-[17px] text-cm hover:bg-pl cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-[14px] text-cm hover:text-tr underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Line total */}
                <div className="text-[16px] font-medium text-tr shrink-0">
                  ${variant.price * item.qty}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Summary */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between text-[16px]">
            <span className="text-cm">Subtotal</span>
            <span className="font-medium text-ch">${subtotal}</span>
          </div>
          <p className="text-[14px] text-cl">
            Shipping & taxes calculated at checkout.
          </p>
          <Link
            href="/checkout"
            className="btn-primary btn-md w-full text-center no-underline block"
          >
            Checkout
          </Link>
          <Link
            href="/shop"
            className="block text-center text-[15px] text-cm hover:text-tr no-underline"
          >
            Continue shopping
          </Link>
        </Card>
      </div>

      {loading && (
        <p className="text-[14px] text-cl mt-4">Updating cart…</p>
      )}
    </Container>
  );
}
