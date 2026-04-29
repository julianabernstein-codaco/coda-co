import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ServiceFilters } from "@/components/services/ServiceFilters";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { getVendors } from "@/lib/api/vendors";
import type { VendorType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Find services — CodaCo",
  description:
    "Find death doulas, estate attorneys, grief counselors, and other end-of-life service providers near you.",
};

interface ServicesPageProps {
  searchParams: Promise<{
    type?: string;
    minRating?: string;
    accepting?: string;
    virtual?: string;
    verified?: string;
  }>;
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const { type, minRating, accepting, virtual: virt, verified } = await searchParams;

  const vendors = await getVendors({
    type: type as VendorType | undefined,
    minRating: minRating ? parseFloat(minRating) : undefined,
    accepting: accepting === "1" ? true : undefined,
    virtual: virt === "1" ? true : undefined,
    verified: verified === "1" ? true : undefined,
  });

  return (
    <>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Find services" }]} />

      {/* Search header */}
      <section className="bg-white px-10 py-10">
        <div className="max-w-[880px] mx-auto">
          <h1 className="font-serif text-[30px] font-light text-ch mb-5">
            Find services near you
          </h1>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 border border-[rgba(44,40,37,.15)] rounded-[8px] px-4 py-2.5 bg-white">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="#9A9189" strokeWidth="1.3" />
                <line x1="11" y1="11" x2="15" y2="15" stroke="#9A9189" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input
                className="flex-1 bg-transparent text-[13px] text-cm outline-none"
                defaultValue={type ? (type === "doula" ? "Death doula" : type) : ""}
                placeholder="Service type…"
              />
            </div>
            <div className="flex items-center gap-2 border border-[rgba(44,40,37,.15)] rounded-[8px] px-4 py-2.5 bg-white w-[220px]">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="7" r="3.5" stroke="#9A9189" strokeWidth="1.3" />
                <path d="M8 10.5 L8 14" stroke="#9A9189" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input
                className="flex-1 bg-transparent text-[13px] text-cm outline-none"
                defaultValue="New York, NY 10001"
                placeholder="Location…"
              />
            </div>
            <button className="bg-tr text-white px-6 py-2.5 rounded-[8px] text-[13px] hover:bg-tr-d transition-colors cursor-pointer">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <div className="bg-tr-vp px-10 py-4">
        <div className="max-w-[880px] mx-auto">
          <div className="bg-white border border-[rgba(44,40,37,.1)] rounded-[8px] px-6 py-4 flex items-center justify-center">
            <svg width="320" height="80" viewBox="0 0 320 80" fill="none">
              <rect x="10" y="10" width="300" height="60" rx="6" stroke="#9A9189" strokeWidth="1" fill="none" />
              <circle cx="90" cy="40" r="7" stroke="#C1634F" strokeWidth="1.5" fill="none" />
              <circle cx="90" cy="40" r="3" fill="#C1634F" />
              <circle cx="160" cy="28" r="7" stroke="#C1634F" strokeWidth="1.5" fill="none" />
              <circle cx="160" cy="28" r="3" fill="#C1634F" />
              <circle cx="220" cy="45" r="7" stroke="#7A9E82" strokeWidth="1.5" fill="none" />
              <circle cx="220" cy="45" r="3" fill="#7A9E82" />
              <text x="160" y="72" fontSize="10" fill="#9A9189" textAnchor="middle" fontFamily="sans-serif">
                {vendors.length} providers found
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Results */}
      <section className="bg-tr-vp px-10 pb-12">
        <div className="max-w-[880px] mx-auto flex gap-6">
          {/* Filters sidebar */}
          <Suspense>
            <ServiceFilters />
          </Suspense>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 py-2">
              <span className="text-[13px] text-cm">
                {vendors.length} provider{vendors.length !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-2 text-[13px] text-cm">
                <label>Sort by</label>
                <select className="border border-[rgba(44,40,37,.2)] rounded-[6px] px-2 py-1 text-[13px] bg-white">
                  <option>Best match</option>
                  <option>Rating: high to low</option>
                  <option>Nearest first</option>
                  <option>Most reviewed</option>
                </select>
              </div>
            </div>

            <ServiceGrid vendors={vendors} />
          </div>
        </div>
      </section>
    </>
  );
}
