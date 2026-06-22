"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { Card } from "@/components/ui/Card";
import { getCartProducts } from "@/app/cart/actions";
import { placeOrder } from "./actions";
import type { ProductWithRating } from "@/lib/types";
import type { ShippingAddressInput } from "@/lib/api/orders";

const EMPTY_ADDRESS: ShippingAddressInput = {
  recipientName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "United States",
};

export function CheckoutForm() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [products, setProducts] = useState<ProductWithRating[]>([]);
  const [address, setAddress] = useState<ShippingAddressInput>(EMPTY_ADDRESS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const idsKey = useMemo(
    () => Array.from(new Set(items.map((i) => i.productId))).join(","),
    [items],
  );

  useEffect(() => {
    let active = true;
    getCartProducts(idsKey ? idsKey.split(",") : []).then(
      (rows) => active && setProducts(rows),
    );
    return () => {
      active = false;
    };
  }, [idsKey]);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const lines = items
    .map((item) => {
      const product = byId.get(item.productId);
      const variant = product?.variants.find((v) => v.id === item.variantId);
      return product && variant ? { item, product, variant } : null;
    })
    .filter((l): l is NonNullable<typeof l> => l != null);
  const subtotal = lines.reduce((sum, l) => sum + l.variant.price * l.item.qty, 0);

  function set<K extends keyof ShippingAddressInput>(key: K, value: string) {
    setAddress((a) => ({ ...a, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await placeOrder({ lines: items, shippingAddress: address });
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    clear();
    router.push(`/checkout/success?order=${result.orderId}`);
  }

  if (items.length === 0) {
    return (
      <p className="text-[15px] text-cl">
        Your cart is empty.{" "}
        <Link href="/shop" className="text-tr underline">
          Browse goods
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-[1fr_300px] items-start">
      {/* Shipping address */}
      <div className="space-y-4">
        <h2 className="font-serif text-[20px] text-ch">Shipping address</h2>
        <Field label="Full name" value={address.recipientName} onChange={(v) => set("recipientName", v)} />
        <Field label="Address line 1" value={address.line1} onChange={(v) => set("line1", v)} />
        <Field label="Address line 2 (optional)" value={address.line2 ?? ""} onChange={(v) => set("line2", v)} required={false} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="City" value={address.city} onChange={(v) => set("city", v)} />
          <Field label="State" value={address.state} onChange={(v) => set("state", v)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="ZIP / postal code" value={address.postalCode} onChange={(v) => set("postalCode", v)} />
          <Field label="Country" value={address.country} onChange={(v) => set("country", v)} />
        </div>
      </div>

      {/* Order summary */}
      <Card className="space-y-4">
        <h2 className="font-serif text-[18px] text-ch">Order summary</h2>
        <ul className="space-y-2">
          {lines.map(({ item, product, variant }) => (
            <li key={`${item.productId}:${item.variantId}`} className="flex justify-between gap-3 text-[13px]">
              <span className="text-cm">
                {product.title}
                {product.variants.length > 1 ? ` · ${variant.label}` : ""}
                <span className="text-cl"> × {item.qty}</span>
              </span>
              <span className="text-ch font-medium shrink-0">${variant.price * item.qty}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between text-[14px] border-t border-line pt-3">
          <span className="text-cm">Subtotal</span>
          <span className="font-medium text-ch">${subtotal}</span>
        </div>
        <p className="text-[12px] text-cl">Shipping & taxes calculated at checkout.</p>

        {error && <p className="text-[13px] text-tr">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary btn-md w-full disabled:opacity-50">
          {submitting ? "Placing order…" : "Place order"}
        </button>
        <Link href="/cart" className="block text-center text-[13px] text-cm hover:text-tr no-underline">
          Back to cart
        </Link>
      </Card>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-ch uppercase tracking-wide">{label}</span>
      <input
        type="text"
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-[8px] border border-line-bold text-[14px] text-ch focus:border-tr outline-none"
      />
    </label>
  );
}
