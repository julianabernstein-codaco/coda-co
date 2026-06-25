import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FilterStrip } from "@/components/shop/FilterStrip";
import { Pagination } from "@/components/shop/Pagination";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SavedLink } from "@/components/saved/SavedLink";
import { Container } from "@/components/ui/Container";
import { GiftCardCallout } from "@/components/ui/GiftCardCallout";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { getFeaturedProducts, getProducts } from "@/lib/api/products";
import { parseLifeStageParam } from "@/lib/format/lifeStage";
import type { ProductType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Shop goods — CodaCo",
  description:
    "Handmade, purposeful goods — urns, jewelry, burial shrouds, planning documents, and more.",
};

// One screen of the grid. The auto-fill grid is 4–5 wide on desktop, so a
// multiple of those keeps rows even.
const PAGE_SIZE = 12;

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    lifeStage?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, sort, lifeStage, q, page } = await searchParams;

  const [products, featuredProducts] = await Promise.all([
    getProducts({
      productType: category as ProductType | undefined,
      lifeStage: parseLifeStageParam(lifeStage),
      q,
    }),
    getFeaturedProducts(4),
  ]);

  // Client-side sort can't be done on RSC, so we handle it here. Sort by
  // the cheapest variant when ascending, the most expensive when descending —
  // matches how shoppers think about "lowest price first / highest first".
  const sorted = [...products].sort((a, b) => {
    if (sort === "price-asc") return a.priceMin - b.priceMin;
    if (sort === "price-desc") return b.priceMax - a.priceMax;
    if (sort === "most-reviewed") return b.reviewCount - a.reviewCount;
    // featured (default): listings with a cover photo first so the grid
    // never leads with placeholder-icon tiles, then verified. The sort is
    // stable, so getProducts' order is preserved within each tie group.
    const cover = Number(Boolean(b.coverImageUrl)) - Number(Boolean(a.coverImageUrl));
    if (cover !== 0) return cover;
    return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
  });

  // Paginate the sorted results. `page` is clamped to the valid range so a
  // stale/out-of-bounds value (e.g. after narrowing filters) never yields
  // an empty page.
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(
    Math.max(1, parseInt(page ?? "1", 10) || 1),
    totalPages,
  );
  const pageProducts = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Shop goods" }]} />

      {/* Featured in the marketplace */}
      <section className="bg-white px-10 pt-12 pb-10">
        <Container width="wide">
          <SectionHeader
            eyebrow="Handpicked goods"
            title="Featured in the marketplace"
            subtitle="Available locally or shipped anywhere in the US"
          />
          <div className="grid-auto-178">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className="mt-12">
            <GiftCardCallout />
          </div>
        </Container>
      </section>

      <WaveDivider topColor="#ffffff" bottomColor="#B5C9AB" />

      <section className="bg-sg-vp px-10 py-10">
        <Container width="wide">
          <div className="text-center mb-8">
            <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-2">All goods</p>
            <h1 className="font-serif text-[32px] font-light text-ch mb-1">The marketplace</h1>
            <p className="text-[13px] text-cl">
              Handmade, purposeful goods — available locally or shipped anywhere in the US
            </p>
          </div>

          <div className="flex justify-end mb-3">
            <SavedLink />
          </div>

          <Suspense>
            <FilterStrip />
          </Suspense>

          <ProductGrid products={pageProducts} />

          <Suspense>
            <Pagination page={currentPage} totalPages={totalPages} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
