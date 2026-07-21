"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSaved } from "@/components/providers/SavedProvider";
import { ProductCard } from "@/components/ui/ProductCard";
import { SaveButton } from "@/components/ui/SaveButton";
import { VendorCard } from "@/components/ui/VendorCard";
import { loadSavedItems, type SavedItemsData } from "@/app/saved/actions";

export function SavedList() {
  const { saved, hydrated, isSaved } = useSaved();
  const [data, setData] = useState<SavedItemsData | null>(null);

  const productSlugs = saved.filter((e) => e.kind === "product").map((e) => e.slug);
  const vendorSlugs = saved.filter((e) => e.kind === "vendor").map((e) => e.slug);
  // Stable keys so the fetch only re-runs when the *set* of saved slugs
  // changes (not on every render).
  const productKey = [...productSlugs].sort().join(",");
  const vendorKey = [...vendorSlugs].sort().join(",");

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    loadSavedItems(
      productKey ? productKey.split(",") : [],
      vendorKey ? vendorKey.split(",") : [],
    ).then((res) => {
      if (!cancelled) setData(res);
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, productKey, vendorKey]);

  // First load (before localStorage + the action have resolved).
  if (!hydrated || data == null) {
    return (
      <p className="text-center py-16 text-cm text-[16px]">
        Loading your saved items…
      </p>
    );
  }

  // Filter by the *live* saved set so un-saving an item removes it instantly,
  // without waiting for the background refetch.
  const products = data.products.filter((p) => isSaved("product", p.id));
  const vendors = data.vendors.filter((v) => isSaved("vendor", v.id));

  if (products.length === 0 && vendors.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[17px] text-cm mb-2">You haven&apos;t saved anything yet.</p>
        <p className="text-[15px] text-cl mb-6">
          Tap the heart on any product or provider to keep it here.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/shop" className="btn-primary btn-sm no-underline">
            Browse goods
          </Link>
          <Link href="/services" className="btn-secondary btn-sm no-underline">
            Find services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {products.length > 0 && (
        <div>
          <h2 className="font-serif text-[22px] font-light text-ch mb-4">
            Saved goods
          </h2>
          <div className="grid-auto-178">
            {products.map((p) => (
              <div key={p.id}>
                <ProductCard product={p} />
                <SaveButton
                  kind="product"
                  slug={p.id}
                  savedLabel="Saved"
                  className="btn-ghost btn-sm w-full mt-1.5"
                  activeClassName="text-tr border-tr"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {vendors.length > 0 && (
        <div>
          <h2 className="font-serif text-[22px] font-light text-ch mb-4">
            Saved providers
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">
            {vendors.map((v) => (
              <div key={v.id}>
                <VendorCard vendor={v} services={data.servicesByVendor[v.id] ?? []} />
                <SaveButton
                  kind="vendor"
                  slug={v.id}
                  savedLabel="Saved"
                  className="btn-ghost btn-sm w-full mt-1.5"
                  activeClassName="text-tr border-tr"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
