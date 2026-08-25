import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ContactVendorForm } from "@/components/services/ContactVendorForm";
import { Container } from "@/components/ui/Container";
import { ExampleBadge } from "@/components/ui/ExampleBadge";
import { ProductCard } from "@/components/ui/ProductCard";
import { SaveButton } from "@/components/ui/SaveButton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stars } from "@/components/ui/Stars";
import { VendorPhoto } from "@/components/ui/VendorPhoto";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { prisma } from "@/lib/db";
import { getProducts } from "@/lib/api/products";
import { getVendor } from "@/lib/api/vendors";
import { getVendorReviews } from "@/lib/api/vendor-reviews";
import { formatMonthYear } from "@/lib/format/date";
import { lifeStageLabel } from "@/lib/format/lifeStage";

interface PageProps {
  params: Promise<{ vendorId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { vendorId } = await params;
  // Unpublished-inclusive so an owner previewing their own shop gets a real
  // title; the page itself 404s for everyone else.
  const vendor = await getVendor(vendorId, { includeUnpublished: true });
  if (!vendor) return { title: "Maker not found — CodaCo" };
  return {
    title: `${vendor.name} — CodaCo`,
    description: vendor.bio,
  };
}

// Splits bio on blank lines so makers can write multi-paragraph bios in
// the dashboard's single textarea and have them render as paragraphs here.
function bioParagraphs(bio: string): string[] {
  return bio
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default async function MakerShopPage({ params }: PageProps) {
  const { vendorId } = await params;
  const session = await auth();
  const [vendor, vendorReviewList, owner] = await Promise.all([
    getVendor(vendorId, { includeUnpublished: true }),
    getVendorReviews(vendorId),
    prisma.vendorProfile.findUnique({
      where: { slug: vendorId },
      select: { userId: true, published: true },
    }),
  ]);
  if (!vendor) notFound();

  // Service providers live on /services — send anyone who lands here with
  // their slug to the page built for them.
  if (vendor.kind !== "goods") redirect(`/services/${vendorId}`);

  const isSignedIn = Boolean(session?.user);
  const loginHref = `/login?next=${encodeURIComponent(`/makers/${vendorId}`)}`;
  const isOwner = Boolean(session?.user) && session!.user.id === owner?.userId;

  // A maker awaiting first-listing review is visible to nobody but
  // themselves — everyone else gets the same 404 as a bad slug.
  const isPreview = !owner?.published;
  if (isPreview && !isOwner) notFound();

  // The owner sees their drafts and in-review listings (tagged); buyers see
  // published goods only.
  const goods = await getProducts({
    sellerId: vendorId,
    includeUnpublished: isOwner,
  });
  const unpublishedCount = goods.filter((p) => p.status !== "published").length;

  const paragraphs = bioParagraphs(vendor.bio);
  const hasReviews = vendorReviewList.length > 0;

  const instagramHandle = vendor.instagramHandle ?? null;
  const instagramLabel = instagramHandle ? `@${instagramHandle}` : null;
  const instagramUrl = instagramHandle
    ? `https://instagram.com/${instagramHandle}`
    : null;

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Goods", href: "/shop" },
          { label: vendor.name },
        ]}
      />

      {isPreview && (
        <section className="bg-tr-p border-b border-tr-l px-10 py-3">
          <Container width="mid">
            <p className="text-[15px] text-cm">
              <span className="font-medium text-ch">
                Preview — only you can see this page.
              </span>{" "}
              Your shop goes public once our team approves your first
              listing.{" "}
              <Link
                href="/dashboard"
                className="text-tr no-underline hover:underline"
              >
                Back to your dashboard
              </Link>
            </p>
          </Container>
        </section>
      )}

      {/* Hero */}
      <section className="bg-white px-10 pt-10 pb-12">
        <Container width="mid">
          <div className="flex gap-6 items-start mb-6">
            <VendorPhoto
              src={vendor.photoSrc}
              alt={vendor.name}
              initials={vendor.initials}
              size="xl"
              tone={vendor.photoTone ?? "terracotta"}
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="font-serif text-[34px] font-light text-ch leading-tight">
                  {vendor.name}
                </h1>
                {vendor.demo && <ExampleBadge />}
                {vendor.lifeStages.map((s) => (
                  <span
                    key={s}
                    className="text-[12px] tracking-[.06em] uppercase bg-tr-p text-tr-d border border-tr-l px-2.5 py-0.5 rounded-full"
                  >
                    {lifeStageLabel(s)}
                  </span>
                ))}
              </div>
              <div className="text-[13px] tracking-[.14em] uppercase text-tr mb-3">
                Maker
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 items-center mb-2">
                <span className="text-[15px] text-cm">📍 {vendor.location}</span>
                {vendor.memberSince && (
                  <span className="text-[15px] text-cl">
                    CodaCo member since {formatMonthYear(vendor.memberSince)}
                  </span>
                )}
              </div>
              <Stars
                rating={vendor.rating}
                reviewCount={vendor.reviewCount}
                className="text-[15px]"
              />
              <div className="flex flex-wrap gap-3 items-center mt-5">
                <a href="#goods" className="btn-primary btn-md no-underline">
                  See their goods ↓
                </a>
                <SaveButton
                  kind="vendor"
                  slug={vendor.id}
                  className="btn-ghost btn-md"
                  activeClassName="text-tr border-tr"
                />
              </div>
            </div>
          </div>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={`text-[16px] leading-[1.7] text-cm ${i < paragraphs.length - 1 ? "mb-4" : ""}`}
            >
              {p}
            </p>
          ))}

          {vendor.requiresCustomOrder && (
            <div className="mt-6 rounded-[10px] border border-tr-l bg-tr-p px-5 py-4">
              <p className="text-[15px] text-cm">
                <span className="font-medium text-ch">Made for one person.</span>{" "}
                Some of {vendor.name}&apos;s work needs personalization or a
                conversation before it can be made — sending cremated remains,
                an image, or a textile, for instance. Message them to start.
              </p>
            </div>
          )}
        </Container>
      </section>

      <WaveDivider topColor="var(--color-white)" bottomColor="var(--color-tr-vp)" />

      {/* Their goods */}
      <section id="goods" className="bg-tr-vp px-10 pt-4 pb-16 scroll-mt-24">
        <Container width="mid">
          <SectionHeader
            eyebrow="For sale"
            title={`Goods from ${vendor.name}`}
            subtitle={
              goods.length > 0
                ? `${goods.length} ${goods.length === 1 ? "piece" : "pieces"}, made and shipped by the maker.`
                : undefined
            }
            className="mb-8"
          />

          {isOwner && unpublishedCount > 0 && (
            <div className="bg-white border border-tr-p rounded-[8px] px-4 py-3 mb-6 text-[14px] text-ink">
              {unpublishedCount === 1
                ? "One of your listings isn't live yet — only you can see it here."
                : `${unpublishedCount} of your listings aren't live yet — only you can see them here.`}{" "}
              <Link
                href="/dashboard/products"
                className="text-tr no-underline hover:underline"
              >
                Manage listings →
              </Link>
            </div>
          )}

          {goods.length === 0 ? (
            <p className="text-[16px] text-cl italic text-center">
              {isOwner
                ? "You haven’t added any goods yet — add your first from your dashboard."
                : `${vendor.name} hasn’t published any goods yet.`}
            </p>
          ) : (
            <div className="grid-auto-200">
              {goods.map((p) => (
                <div key={p.id} className="relative">
                  {p.status !== "published" && (
                    <span className="absolute z-10 top-2 left-2 text-[12px] tracking-[.06em] uppercase bg-white text-cl border border-line px-1.5 py-0.5 rounded-full">
                      {p.status === "draft" ? "Draft" : "In review"}
                    </span>
                  )}
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {hasReviews && (
        <>
          <WaveDivider topColor="var(--color-tr-vp)" bottomColor="var(--color-sg-vp)" />

          {/* Reviews */}
          <section className="bg-sg-vp px-10 pt-4 pb-16">
            <Container width="narrow">
              <SectionHeader
                eyebrow="What buyers say"
                eyebrowTone="sg"
                title="Reviews"
                className="mb-8"
              />
              {vendor.demo && (
                <p className="text-center text-[13px] text-cl mb-6 -mt-4">
                  Example reviews — shown to illustrate how buyer reviews appear on a
                  shop page.
                </p>
              )}
              <div className="text-center mb-8">
                <div className="font-serif text-[42px] font-light text-ch leading-none mb-2">
                  {vendor.rating.toFixed(1)}
                </div>
                <Stars
                  rating={vendor.rating}
                  reviewCount={vendor.reviewCount}
                  className="text-[16px]"
                />
              </div>
              <div className="space-y-4">
                {vendorReviewList.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-[10px] p-5 border border-line"
                  >
                    <Stars rating={r.rating} className="text-[15px]" />
                    <p className="font-serif text-[16px] font-light text-ch leading-[1.7] italic my-3">
                      &ldquo;{r.body}&rdquo;
                    </p>
                    <div className="text-[14px] text-cl">
                      {r.reviewer} · {r.location} · {formatMonthYear(r.date)}
                    </div>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        </>
      )}

      <WaveDivider
        topColor={hasReviews ? "var(--color-sg-vp)" : "var(--color-tr-vp)"}
        bottomColor="var(--color-white)"
      />

      {/* Contact CTA */}
      <section id="contact" className="bg-white px-10 pt-4 pb-16 scroll-mt-24">
        <Container width="narrow">
          <div className="bg-tr-vp border border-tr-p rounded-[14px] p-8">
            <div className="text-center">
              <h2 className="font-serif text-[26px] font-light text-ch mb-3">
                {vendor.demo ? "Example shop" : `Message ${vendor.name}`}
              </h2>
              <p className="text-[15px] text-ink max-w-[420px] mx-auto mb-6 leading-[1.75]">
                {vendor.demo
                  ? `${vendor.name} is a sample listing showing how CodaCo shops look. Contact and purchase are disabled for example shops.`
                  : vendor.requiresCustomOrder
                    ? `Commissions, questions about materials, timing — send a note and ${vendor.name} will reply straight to your email.`
                    : `Questions about a piece, a custom size, or timing — send a note and ${vendor.name} will reply straight to your email.`}
              </p>
            </div>
            {vendor.demo ? null : isSignedIn ? (
              <ContactVendorForm vendorSlug={vendor.id} vendorName={vendor.name} />
            ) : (
              <div className="bg-white border border-tr-p rounded-[10px] p-6 text-center">
                <p className="text-[16px] text-ch font-medium mb-1">
                  Sign in to message {vendor.name}
                </p>
                <p className="text-[15px] text-cm mb-5">
                  You’ll need a free account to send a message. It takes a
                  moment, and keeps your conversations in one place.
                </p>
                <Link href={loginHref} className="btn-primary btn-md no-underline">
                  Sign in to message
                </Link>
              </div>
            )}
            <div className="text-center mt-4">
              <Link href="/shop" className="text-[15px] text-tr no-underline hover:underline">
                Browse all goods →
              </Link>
            </div>
            {/* Each link shows only when its value is set AND the CodaCo
                team has switched it on (VendorProfile.show*). */}
            {((vendor.showWebsite && vendor.websiteUrl) ||
              (vendor.showInstagram && instagramLabel)) && (
              <div className="text-[14px] text-cm pt-4 border-t border-tr-p mt-5 flex flex-wrap gap-x-3 gap-y-1 justify-center">
                {vendor.showWebsite && vendor.websiteUrl && (
                  <a
                    href={vendor.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-tr no-underline hover:underline"
                  >
                    {vendor.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                )}
                {vendor.showWebsite &&
                  vendor.websiteUrl &&
                  vendor.showInstagram &&
                  instagramLabel && <span>·</span>}
                {vendor.showInstagram && instagramLabel && instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-tr no-underline hover:underline"
                  >
                    {instagramLabel}
                  </a>
                )}
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
