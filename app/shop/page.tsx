import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FilterStrip } from "@/components/shop/FilterStrip";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { getProducts } from "@/lib/api/products";
import type { ProductCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Shop goods — CodaCo",
  description:
    "Handmade, purposeful goods — urns, jewelry, burial shrouds, planning documents, and more.",
};

interface ShopPageProps {
  searchParams: Promise<{ category?: string; sort?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, sort } = await searchParams;

  const products = await getProducts({
    category: category as ProductCategory | undefined,
  });

  // Client-side sort can't be done on RSC, so we handle it here
  const sorted = [...products].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "most-reviewed") return b.reviewCount - a.reviewCount;
    // featured: verified first
    return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
  });

  return (
    <>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Shop goods" }]} />

      <section className="bg-sg-vp px-10 py-10">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-8">
            <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-2">All goods</p>
            <h1 className="font-serif text-[32px] font-light text-ch mb-1">The marketplace</h1>
            <p className="text-[13px] text-cl">
              Handmade, purposeful goods — available locally or shipped anywhere in the US
            </p>
          </div>

          <Suspense>
            <FilterStrip />
          </Suspense>

          <ProductGrid products={sorted} />

          <div className="flex justify-center items-center gap-2 mt-8">
            <button className="bg-white border border-[rgba(44,40,37,.2)] text-cl px-4 py-1.5 rounded-[7px] text-[13px] cursor-pointer">
              ← Prev
            </button>
            <span className="text-[13px] text-cm">Page 1 of 3</span>
            <button className="bg-tr border-none text-white px-4 py-1.5 rounded-[7px] text-[13px] cursor-pointer hover:bg-tr-d transition-colors">
              Next →
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
