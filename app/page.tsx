import type { Metadata } from "next";
import Link from "next/link";
import { GuidedSearch } from "@/components/landing/GuidedSearch";
import { ProductCard } from "@/components/ui/ProductCard";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { WaveDivider } from "@/components/ui/WaveDivider";
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
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M18 6 C12 6 8 11 8 18 C8 25 12 30 18 30 C24 30 28 25 28 18 C28 11 24 6 18 6Z" stroke="#C1634F" strokeWidth="1.5" fill="none"/>
        <path d="M13 18 C13 14 15 11 18 11 C21 11 23 14 23 18" stroke="#C1634F" strokeWidth="1.3" fill="none"/>
        <line x1="18" y1="6" x2="18" y2="4" stroke="#C1634F" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Ash jewelry",
    href: "/shop?category=jewelry",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M18 8 L20 14 L26 14 L21 18 L23 24 L18 20 L13 24 L15 18 L10 14 L16 14 Z" stroke="#C1634F" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Burial shrouds",
    href: "/shop?category=shrouds",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M11 8 C11 8 13 10 18 10 C23 10 25 8 25 8 L25 24 C25 27 22 29 18 29 C14 29 11 27 11 24 Z" stroke="#7A9E82" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
  },
  {
    label: "Planning docs",
    href: "/shop?category=planning",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="8" y="6" width="20" height="24" rx="2" stroke="#C1634F" strokeWidth="1.5"/>
        <line x1="12" y1="13" x2="24" y2="13" stroke="#C1634F" strokeWidth="1.2"/>
        <line x1="12" y1="17" x2="24" y2="17" stroke="#C1634F" strokeWidth="1.2"/>
        <line x1="12" y1="21" x2="19" y2="21" stroke="#C1634F" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    label: "Death doulas",
    href: "/services?type=doula",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="14" cy="13" r="4.5" stroke="#7A9E82" strokeWidth="1.5"/>
        <path d="M6 28 C6 23 9.5 20 14 20 C18.5 20 22 23 22 28" stroke="#7A9E82" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M24 15 C24 15 27 13 29 16" stroke="#C1634F" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Estate attorneys",
    href: "/services?type=attorney",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="10" y="10" width="16" height="16" rx="2" stroke="#7A9E82" strokeWidth="1.5"/>
        <line x1="14" y1="16" x2="22" y2="16" stroke="#7A9E82" strokeWidth="1.2"/>
        <line x1="14" y1="20" x2="20" y2="20" stroke="#7A9E82" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    label: "Death cleaning",
    href: "/services?type=cleaner",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M10 28 L10 14 L18 8 L26 14 L26 28" stroke="#C1634F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <rect x="14" y="20" width="8" height="8" stroke="#C1634F" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    label: "Celebrants",
    href: "/services?type=celebrant",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="10" stroke="#7A9E82" strokeWidth="1.5" fill="none"/>
        <path d="M14 18 C14 15 16 13 18 13 C20 13 22 15 22 18" stroke="#7A9E82" strokeWidth="1.3" fill="none"/>
        <line x1="18" y1="23" x2="18" y2="26" stroke="#7A9E82" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Memorial items",
    href: "/shop?category=memorial",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M18 27 C18 27 8 20 8 13.5 C8 10 10.5 8 13.5 8 C15.5 8 17 9.5 18 11 C19 9.5 20.5 8 22.5 8 C25.5 8 28 10 28 13.5 C28 20 18 27 18 27Z" stroke="#7A9E82" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
  },
  {
    label: "Gifts & humor",
    href: "/shop?category=humor",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M10 22 C10 22 10 14 18 14 C26 14 26 22 26 22 L10 22Z" stroke="#C1634F" strokeWidth="1.5" fill="none"/>
        <rect x="14" y="22" width="8" height="5" rx="1" stroke="#C1634F" strokeWidth="1.3"/>
      </svg>
    ),
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

      <WaveDivider topColor="#ffffff" bottomColor="#FCF4F1" />

      {/* Category grid */}
      <section className="bg-tr-vp px-10 pt-0 pb-12">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-7">
            <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-2">Browse by category</p>
            <h2 className="font-serif text-[32px] font-light text-ch mb-1">What are you looking for?</h2>
            <p className="text-[13px] text-cl">Goods by mail · Services by location</p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="bg-white border border-[rgba(44,40,37,.09)] rounded-[12px] p-5 text-center cursor-pointer transition-all duration-200 hover:border-tr-l hover:-translate-y-0.5 no-underline block"
              >
                <div className="w-10 h-10 mx-auto mb-2.5 flex items-center justify-center">
                  {cat.icon}
                </div>
                <div className="text-[12px] font-medium text-ch leading-tight">{cat.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider topColor="#FCF4F1" bottomColor="#ffffff" />

      {/* Featured products */}
      <section className="bg-white px-10 pt-0 pb-12">
        <div className="max-w-[880px] mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1">Handpicked goods</p>
              <h2 className="font-serif text-[32px] font-light text-ch">Featured in the marketplace</h2>
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

      <WaveDivider topColor="#ffffff" bottomColor="#F1F7F2" />

      {/* Services */}
      <section className="bg-sg-vp px-10 pt-0 pb-12">
        <div className="max-w-[880px] mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[11px] tracking-[.14em] uppercase text-sg mb-1">Find local services</p>
              <h2 className="font-serif text-[32px] font-light text-ch">Support in your area</h2>
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

      <WaveDivider topColor="#F1F7F2" bottomColor="#2C2825" />

      {/* Where to start CTA */}
      <section className="bg-ch px-10 pt-0 pb-14 text-center">
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

      <WaveDivider topColor="#2C2825" bottomColor="#ffffff" />

      {/* List with us CTA */}
      <section className="bg-white px-10 pt-0 pb-12 text-center">
        <div className="max-w-[560px] mx-auto">
          <p className="text-[11px] tracking-[.14em] uppercase text-sg mb-2">For vendors</p>
          <h2 className="font-serif text-[32px] font-light text-ch mb-3">
            Reach people who are ready.
          </h2>
          <p className="text-[14px] text-cm mb-6 leading-relaxed">
            Join CodaCo curated marketplace. Free to start, approval typically within 24 hours.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/list-with-us/goods"
              className="inline-block bg-tr text-white px-7 py-3 rounded-full text-[14px] no-underline hover:bg-tr-d transition-colors"
            >
              List goods →
            </Link>
            <Link
              href="/list-with-us/services"
              className="inline-block border border-[rgba(44,40,37,.2)] text-ch px-7 py-3 rounded-full text-[14px] no-underline hover:border-tr hover:text-tr transition-colors"
            >
              List services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
