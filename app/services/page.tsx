import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ServiceFilters } from "@/components/services/ServiceFilters";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { Container } from "@/components/ui/Container";
import { LifeStageChips } from "@/components/ui/filters/LifeStageChips";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { getVendors } from "@/lib/api/vendors";
import type { LifeStage, VendorType } from "@/lib/types";

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
    lifeStage?: string;
  }>;
}

const TYPE_LABELS: Record<string, string> = {
  doula: "Death doula",
  attorney: "Estate attorney",
  cleaner: "Death cleaning",
  celebrant: "Celebrant",
  organizer: "EOL organizer",
  "home-funeral": "Home funeral",
  "green-burial": "Green burial",
  cafe: "Death cafe",
};

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const { type, minRating, accepting, virtual: virt, verified, lifeStage } = await searchParams;

  const filters = {
    type: type as VendorType | undefined,
    minRating: minRating ? parseFloat(minRating) : undefined,
    accepting: accepting === "1" ? true : undefined,
    virtual: virt === "1" ? true : undefined,
    verified: verified === "1" ? true : undefined,
    lifeStage: lifeStage as LifeStage | undefined,
  };

  const [vendors, totalVendors] = await Promise.all([
    getVendors(filters),
    getVendors(),
  ]);

  const total = totalVendors.length;
  const filtered = vendors.length;
  const hasActiveFilter =
    filters.type != null ||
    filters.minRating != null ||
    filters.accepting === true ||
    filters.virtual === true ||
    filters.verified === true ||
    filters.lifeStage != null;

  return (
    <>
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Find services" }]} />

      {/* Search header */}
      <section className="bg-white px-10 pt-6 pb-5 border-b border-line">
        <Container width="mid" className="mb-4">
          <h1 className="font-serif text-[30px] font-light text-ch">
            Find services near you
          </h1>
        </Container>
        <Container width="mid" className="flex gap-2.5 items-center flex-wrap">
          <div className="flex flex-1 min-w-[200px] border-[1.5px] border-[rgba(193,99,79,.22)] rounded-[8px] overflow-hidden bg-white">
            <div className="px-3 py-2.5 border-r border-line flex items-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="#9A9189" strokeWidth="1.3" />
                <line x1="11" y1="11" x2="15" y2="15" stroke="#9A9189" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <input
              className="flex-1 border-0 px-3.5 py-2.5 font-sans text-[13px] text-ch outline-none bg-transparent"
              defaultValue={type ? TYPE_LABELS[type] ?? type : ""}
              placeholder="Service type…"
            />
          </div>
          <div className="flex flex-1 min-w-[180px] border-[1.5px] border-[rgba(44,40,37,.15)] rounded-[8px] overflow-hidden bg-white">
            <div className="px-3 py-2.5 border-r border-line flex items-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="7" r="3.5" stroke="#9A9189" strokeWidth="1.3" />
                <path d="M8 10.5 L8 14" stroke="#9A9189" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <input
              className="flex-1 border-0 px-3.5 py-2.5 font-sans text-[13px] text-ch outline-none bg-transparent"
              defaultValue="Boulder, CO 80301"
              placeholder="Location…"
            />
          </div>
          <button className="bg-tr text-white border-0 px-[22px] py-[11px] rounded-[8px] text-[13px] font-sans cursor-pointer hover:bg-tr-d transition-colors whitespace-nowrap">
            Search
          </button>
        </Container>
        <Container width="mid" className="mt-4">
          <Suspense>
            <LifeStageChips />
          </Suspense>
        </Container>
      </section>

      <WaveDivider topColor="#ffffff" bottomColor="#F0AE90" />

      {/* Results section */}
      <section className="bg-tr-vp px-10 pb-12 pt-10">
        <Container width="mid" className="grid grid-cols-[210px_1fr] gap-0">
          {/* Filter column */}
          <Suspense>
            <ServiceFilters />
          </Suspense>

          {/* Results column */}
          <div className="pt-6 pb-8 pl-6">
            {/* Map */}
            <div className="relative bg-sg-p border border-line rounded-[10px] h-[155px] mb-5 overflow-hidden">
              <svg
                className="w-full h-full"
                viewBox="0 0 600 155"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
                aria-hidden="true"
              >
                {/* Street grid */}
                <g stroke="#ffffff" strokeWidth="6" opacity="0.85">
                  <line x1="0" y1="40" x2="600" y2="40" />
                  <line x1="0" y1="110" x2="600" y2="110" />
                  <line x1="120" y1="0" x2="120" y2="155" />
                  <line x1="290" y1="0" x2="290" y2="155" />
                  <line x1="465" y1="0" x2="465" y2="155" />
                </g>
                {/* Diagonal arterial */}
                <path
                  d="M-20 130 Q150 95 320 105 T620 70"
                  stroke="#ffffff"
                  strokeWidth="5"
                  opacity="0.85"
                  strokeLinecap="round"
                />
                {/* Park / greenspace */}
                <rect
                  x="345"
                  y="48"
                  width="95"
                  height="55"
                  rx="6"
                  fill="#B5C9AB"
                  opacity="0.55"
                />
                {/* Drop pins — terracotta (providers) */}
                {[
                  { x: 175, y: 72 },
                  { x: 240, y: 30 },
                  { x: 395, y: 88 },
                  { x: 510, y: 55 },
                ].map((p, i) => (
                  <g key={i} transform={`translate(${p.x} ${p.y})`}>
                    <ellipse cx="0" cy="6" rx="6" ry="2" fill="#2C2825" opacity="0.18" />
                    <path
                      d="M0 -18 C-8 -18 -13 -12 -13 -5 C-13 4 0 14 0 14 C0 14 13 4 13 -5 C13 -12 8 -18 0 -18 Z"
                      fill="#C1634F"
                      stroke="#8B3E2D"
                      strokeWidth="1"
                    />
                    <circle cx="0" cy="-6" r="3.2" fill="#ffffff" />
                  </g>
                ))}
                {/* Drop pin — sage (your location) */}
                <g transform="translate(290 95)">
                  <circle cx="0" cy="0" r="22" fill="#7A9E82" opacity="0.18" />
                  <ellipse cx="0" cy="6" rx="6" ry="2" fill="#2C2825" opacity="0.18" />
                  <path
                    d="M0 -18 C-8 -18 -13 -12 -13 -5 C-13 4 0 14 0 14 C0 14 13 4 13 -5 C13 -12 8 -18 0 -18 Z"
                    fill="#7A9E82"
                    stroke="#4D7255"
                    strokeWidth="1"
                  />
                  <circle cx="0" cy="-6" r="3.2" fill="#ffffff" />
                </g>
              </svg>
              {/* Location label */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-white/95 border border-line rounded-full px-3 py-1 text-[11px] text-cm font-sans whitespace-nowrap shadow-sm">
                <span className="text-ch font-medium">{total}</span> providers near Boulder, CO
              </div>
            </div>

            {/* Count + sort */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-[13px] text-ink">
                {hasActiveFilter ? (
                  <>
                    {total} providers · <strong className="text-ch">{filtered}</strong> after filters
                  </>
                ) : (
                  <>{total} providers</>
                )}
              </span>
              <div className="flex items-center gap-[7px]">
                <label className="text-[12px] text-ink">Sort by</label>
                <select className="text-[12px] text-cm border border-[rgba(44,40,37,.15)] rounded-[6px] px-2.5 py-[5px] bg-white font-sans outline-none">
                  <option>Best match</option>
                  <option>Rating: high to low</option>
                  <option>Nearest first</option>
                  <option>Most reviewed</option>
                </select>
              </div>
            </div>

            <ServiceGrid vendors={vendors} />

            {total > filtered && (
              <div className="text-center pt-2">
                <a className="inline-block text-[13px] text-tr border-b border-dotted border-tr-l cursor-pointer hover:text-tr-d">
                  Show {total - filtered} more results →
                </a>
              </div>
            )}
            <div className="text-center mt-3">
              <Link
                href="/where-to-start"
                className="inline-block text-[13px] text-sg border-b border-dotted border-sg-l no-underline hover:text-sg-d"
              >
                Not sure what you need? See our guide →
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
