import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Pagination } from "@/components/shop/Pagination";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SearchNotice } from "@/components/shop/SearchNotice";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ShopSort } from "@/components/shop/ShopSort";
import { SavedLink } from "@/components/saved/SavedLink";
import { Container } from "@/components/ui/Container";
import { GiftCardCallout } from "@/components/ui/GiftCardCallout";
import { countProducts, getProducts } from "@/lib/api/products";
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

  const parsedLifeStage = parseLifeStageParam(lifeStage);

  // `totalCount` backs the "N goods · M after filters" line, mirroring the
  // provider count on /services.
  const [products, totalCount] = await Promise.all([
    getProducts({
      productType: category as ProductType | undefined,
      lifeStage: parsedLifeStage,
      q,
    }),
    countProducts(),
  ]);

  const hasActiveFilter =
    (category != null && category !== "") ||
    (parsedLifeStage != null && parsedLifeStage.length > 0) ||
    (q != null && q !== "");

  // Client-side sort can't be done on RSC, so we handle it here. Sort by
  // the cheapest variant when ascending, the most expensive when descending —
  // matches how shoppers think about "lowest price first / highest first".
  const sorted = [...products].sort((a, b) => {
    if (sort === "price-asc") return a.priceMin - b.priceMin;
    if (sort === "price-desc") return b.priceMax - a.priceMax;
    if (sort === "most-reviewed") return b.reviewCount - a.reviewCount;
    // featured (default): listings with a cover photo first so the grid
    // never leads with placeholder-icon tiles. The sort is stable, so
    // getProducts' order is preserved within each tie group. (Verification
    // is intentionally not a sort key — no formal workflow yet.)
    return Number(Boolean(b.coverImageUrl)) - Number(Boolean(a.coverImageUrl));
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

      <section className="bg-sg-vp px-10 pt-12 pb-10">
        <Container width="wide">
          <div className="text-center mb-8">
            <p className="text-[13px] tracking-[.14em] uppercase text-tr mb-2">
              Goods for the end of life
            </p>
            <h1 className="font-serif text-[32px] font-light text-ch mb-1">
              Planning, remembering &amp; honoring
            </h1>
            {/* Constrained measure — the subtitle is long enough that the
                full container width would leave a single sprawling line. */}
            <p className="text-[15px] text-cl max-w-[560px] mx-auto">
              A carefully chosen collection — shrouds and urns, planning workbooks, pottery
              and jewelry made with cremated remains. Useful when you need it, lovely long
              after.
            </p>
          </div>

          <div className="grid grid-cols-[210px_1fr] gap-0">
            {/* Filter column */}
            <Suspense>
              <ShopFilters />
            </Suspense>

            {/* Results column */}
            <div className="pt-6 pb-8 pl-6">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[15px] text-ink">
                  {hasActiveFilter ? (
                    <>
                      {totalCount} goods ·{" "}
                      <strong className="text-ch">{sorted.length}</strong> after filters
                    </>
                  ) : (
                    <>{totalCount} goods</>
                  )}
                </span>
                <div className="flex items-center gap-4">
                  <SavedLink />
                  <Suspense>
                    <ShopSort />
                  </Suspense>
                </div>
              </div>

              <Suspense>
                <SearchNotice />
              </Suspense>

              <ProductGrid products={pageProducts} />

              <Suspense>
                <Pagination page={currentPage} totalPages={totalPages} />
              </Suspense>
            </div>
          </div>

          <div className="mt-12">
            <GiftCardCallout />
          </div>
        </Container>
      </section>
    </>
  );
}
