import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/db";
import { formatPriceRange } from "@/lib/format/product";
import { ListingReviewCard, type Listing } from "./ListingReviewCard";
import { requireAdminPage } from "@/app/admin/lib";

export const metadata: Metadata = {
  title: "Listing review — Admin | CodaCo",
};

export const dynamic = "force-dynamic";

export default async function AdminListingsPage() {
  await requireAdminPage("/admin/listings");

  const products = await prisma.product.findMany({
    where: { status: "pending_review" },
    include: {
      productType: true,
      variants: true,
      images: { orderBy: { sortOrder: "asc" } },
      vendor: {
        select: {
          displayName: true,
          location: true,
          user: { select: { email: true } },
        },
      },
    },
    orderBy: { updatedAt: "asc" },
  });

  const listings: Listing[] = products.map((p) => {
    const prices = p.variants.map((v) => v.priceCents / 100);
    const priceMin = prices.length ? Math.min(...prices) : 0;
    const priceMax = prices.length ? Math.max(...prices) : 0;
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      productType: p.productType.name,
      priceLabel: formatPriceRange(priceMin, priceMax),
      description: p.description,
      coverImageUrl: p.coverImageUrl,
      gallery: p.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
      })),
      vendorName: p.vendor.displayName,
      vendorEmail: p.vendor.user.email,
      vendorLocation: p.vendor.location,
      submittedAt: p.updatedAt.toISOString().slice(0, 10),
    };
  });

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Listing review" },
        ]}
      />

      <section className="bg-pl2 px-10 py-10 min-h-screen">
        <Container width="wide">
          <div className="mb-7">
            <p className="text-[13px] tracking-[.14em] uppercase text-tr mb-1.5">Admin</p>
            <h1 className="font-serif text-[32px] font-light text-ch">Listing review</h1>
            <p className="text-[15px] text-cl mt-1.5">
              A goods seller&apos;s first listing waits here until it&apos;s
              approved. Approving publishes it and clears the seller to publish
              future listings without review.
            </p>
          </div>

          <h2 className="text-[17px] font-medium text-ch mb-3">
            Awaiting review <span className="text-cl">({listings.length})</span>
          </h2>
          {listings.length === 0 ? (
            <div className="bg-white rounded-[10px] border border-line py-10 text-center text-[15px] text-cm">
              No listings awaiting review.
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((l) => (
                <ListingReviewCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

