import type { Metadata } from "next";
import Link from "next/link";
import { GuidedSearch } from "@/components/landing/GuidedSearch";
import { ProductCard } from "@/components/ui/ProductCard";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { getFeaturedProducts } from "@/lib/api/products";
import { getFeaturedVendors } from "@/lib/api/vendors";

export const metadata: Metadata = {
  title: "CodaCo — A curated marketplace for death and dying",
  description:
    "CodaCo connects people with trusted goods and services for end-of-life planning, grief support, and meaningful farewells.",
};

const categories = [
  {
    label: "Urns & vessels",
    href: "/shop?category=urns",
  },
  {
    label: "Ash jewelry",
    href: "/shop?category=jewelry",
  },
  {
    label: "Burial shrouds",
    href: "/shop?category=shrouds",
  },
  {
    label: "Planning docs",
    href: "/shop?category=planning",
  },
  {
    label: "Memorial items",
    href: "/shop?category=memorial",
  },
];

const serviceTypes = [
  { label: "Death doulas", type: "doula" },
  { label: "Estate attorneys", type: "attorney" },
  { label: "Death cleaning", type: "cleaner" },
  { label: "Celebrants", type: "celebrant" },
  { label: "EOL organizers", type: "organizer" },
  { label: "Grief counselors", type: "grief" },
];

export default async function LandingPage() {
  const [featuredProducts, featuredVendors] = await Promise.all([
    getFeaturedProducts(6),
    getFeaturedVendors(4),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-white px-10 py-16">
        <div className="max-w-[780px] mx-auto">
          <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-3">
            A curated marketplace
          </p>
          <h1 className="font-serif text-[52px] font-light leading-[1.1] text-ch mb-5">
            Death care,{" "}
            <em className="not-italic text-tr">done with intention.</em>
          </h1>
          <p className="text-[16px] text-cm max-w-[540px] leading-[1.8] mb-6">
            CodaCo connects you with trusted makers and service providers — handmade goods, death
            doulas, estate attorneys, and more — all vetted for care and quality.
          </p>

          {/* Search bar */}
          <div className="flex gap-3 max-w-[560px]">
            <div className="flex-1 flex items-center gap-2 border border-[rgba(44,40,37,.15)] rounded-[10px] px-4 py-3 bg-white">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="#9A9189" strokeWidth="1.3" />
                <line x1="11" y1="11" x2="15" y2="15" stroke="#9A9189" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input
                className="flex-1 bg-transparent text-[14px] text-cm outline-none"
                placeholder="What are you looking for?"
              />
            </div>
            <button className="bg-tr text-white px-6 py-3 rounded-[10px] text-[14px] hover:bg-tr-d transition-colors cursor-pointer">
              Search
            </button>
          </div>

          <GuidedSearch />
        </div>
      </section>

      {/* Category grid */}
      <section className="bg-tr-vp px-10 py-12">
        <div className="max-w-[880px] mx-auto">
          <div className="text-center mb-6">
            <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-2">Shop by category</p>
            <h2 className="font-serif text-[32px] font-light text-ch">Goods for every need</h2>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="bg-white border border-[rgba(44,40,37,.09)] rounded-[12px] p-5 text-center cursor-pointer transition-all duration-200 hover:border-tr-l hover:-translate-y-0.5 no-underline block"
              >
                <div className="text-[12px] font-medium text-ch leading-tight">{cat.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-white px-10 py-12">
        <div className="max-w-[880px] mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1">Featured goods</p>
              <h2 className="font-serif text-[32px] font-light text-ch">From the marketplace</h2>
            </div>
            <Link href="/shop" className="text-[13px] text-tr border-b border-dotted border-tr-l pb-px no-underline hover:text-tr-d transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(178px,1fr))] gap-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-sg-vp px-10 py-12">
        <div className="max-w-[880px] mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[11px] tracking-[.14em] uppercase text-sg mb-1">Find services</p>
              <h2 className="font-serif text-[32px] font-light text-ch">People who can help</h2>
            </div>
            <Link href="/services" className="text-[13px] text-sg-d border-b border-dotted border-sg-l pb-px no-underline hover:opacity-80 transition-opacity">
              Find services
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {serviceTypes.map((st) => (
              <Link
                key={st.type}
                href={`/services?type=${st.type}`}
                className="bg-white border border-[rgba(44,40,37,.09)] rounded-full px-4 py-2 text-[13px] text-cm no-underline hover:border-sg transition-colors"
              >
                {st.label}
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4">
            {featuredVendors.map((v) => (
              <ServiceCard key={v.id} vendor={v} />
            ))}
          </div>
        </div>
      </section>

      {/* Where to start CTA */}
      <section className="bg-ch px-10 py-14 text-center">
        <div className="max-w-[560px] mx-auto">
          <p className="text-[11px] tracking-[.14em] uppercase text-sg mb-3">Not sure where to begin?</p>
          <h2 className="font-serif text-[36px] font-light text-tr-vp mb-4 leading-tight">
            We will help you find your footing.
          </h2>
          <p className="text-[14px] text-[rgba(252,244,241,.7)] mb-8 leading-relaxed">
            Whether someone just died, you are planning ahead, or you are supporting a loved one,
            our guide helps you figure out what you need and who can help.
          </p>
          <Link
            href="/where-to-start"
            className="inline-block bg-tr text-white px-8 py-3.5 rounded-full text-[14px] no-underline hover:bg-tr-d transition-colors"
          >
            Read the guide
          </Link>
        </div>
      </section>

      {/* List with us CTA */}
      <section className="bg-white px-10 py-12 text-center">
        <div className="max-w-[560px] mx-auto">
          <p className="text-[11px] tracking-[.14em] uppercase text-sg mb-2">For vendors</p>
          <h2 className="font-serif text-[32px] font-light text-ch mb-3">
            Reach people who are ready.
          </h2>
          <p className="text-[14px] text-cm mb-6 leading-relaxed">
            Join CodaCo curated marketplace. Free to start, approval typically within 24 hours.
          </p>
          <Link
            href="/list-with-us"
            className="inline-block bg-ch text-white px-8 py-3.5 rounded-full text-[14px] no-underline hover:opacity-90 transition-opacity"
          >
            List with us
          </Link>
        </div>
      </section>
    </>
  );
}
