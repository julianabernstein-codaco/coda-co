import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { LocationSearch } from "@/components/services/LocationSearch";
import { ServiceFilters } from "@/components/services/ServiceFilters";
import { ServiceGrid } from "@/components/services/ServiceGrid";
import { SavedLink } from "@/components/saved/SavedLink";
import { ServiceKeywordSearch } from "@/components/services/ServiceKeywordSearch";
import { ServiceSort } from "@/components/services/ServiceSort";
import { Container } from "@/components/ui/Container";
import { GiftCardCallout } from "@/components/ui/GiftCardCallout";
import { LifeStageChips } from "@/components/ui/filters/LifeStageChips";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { getServices } from "@/lib/api/services";
import { getServiceTypes } from "@/lib/api/serviceTypes";
import { getVendors } from "@/lib/api/vendors";
import { isKnownZip } from "@/lib/geo";
import { parseSpecializationsParam } from "@/lib/data/specializations";
import { parseLifeStageParam } from "@/lib/format/lifeStage";
import type {
  Service,
  ServiceLocationType,
  ServiceType,
  VendorWithRating,
} from "@/lib/types";

export const metadata: Metadata = {
  title: "Find services — CodaCo",
  description:
    "Find death doulas, estate attorneys, grief counselors, and other end-of-life service providers near you.",
};

interface ServicesPageProps {
  searchParams: Promise<{
    type?: string;
    locationType?: string;
    lifeStage?: string;
    specializations?: string;
    near?: string;
    q?: string;
    sort?: string;
  }>;
}

const VALID_LOCATION_TYPES = new Set<ServiceLocationType>([
  "virtual",
  "in_person",
  "both",
]);

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const {
    type,
    locationType: locParam,
    lifeStage,
    specializations: specsParam,
    near,
    q,
    sort,
  } = await searchParams;

  const serviceType = (type ?? undefined) as ServiceType | undefined;
  const locationType = locParam && VALID_LOCATION_TYPES.has(locParam as ServiceLocationType)
    ? (locParam as ServiceLocationType)
    : undefined;
  const specializations = parseSpecializationsParam(specsParam);
  // A `near` value that doesn't resolve to a known zip is treated as no
  // filter (and flagged to the user) rather than emptying the page.
  const nearActive = near != null && near !== "" && isKnownZip(near);

  const [matchedServices, allServices, allVendors, serviceTypes] = await Promise.all([
    getServices({ serviceType, locationType }),
    getServices(),
    getVendors({
      lifeStage: parseLifeStageParam(lifeStage),
      specializations,
      near,
      q,
    }),
    getServiceTypes(),
  ]);

  const vendorIds = new Set(matchedServices.map((s) => s.vendorId));
  const vendors = allVendors.filter((v) => vendorIds.has(v.id));

  // Order the results. An explicit `sort` wins; otherwise "best match"
  // falls back to nearest-first when a location is active and the natural
  // (creation) order when it isn't. Vendors with no measured distance
  // (virtual / nationwide) sort to the end.
  const byDistance = (a: VendorWithRating, b: VendorWithRating) =>
    (a.distanceMi ?? Number.POSITIVE_INFINITY) -
    (b.distanceMi ?? Number.POSITIVE_INFINITY);
  vendors.sort((a, b) => {
    if (sort === "rating") return b.rating - a.rating || b.reviewCount - a.reviewCount;
    if (sort === "most-reviewed") return b.reviewCount - a.reviewCount;
    if (sort === "nearest") return byDistance(a, b);
    return nearActive ? byDistance(a, b) : 0;
  });

  // Group services by vendor for card display.
  const servicesByVendor = new Map<string, Service[]>();
  for (const s of matchedServices) {
    const arr = servicesByVendor.get(s.vendorId) ?? [];
    arr.push(s);
    servicesByVendor.set(s.vendorId, arr);
  }

  const totalProviders = new Set(allServices.map((s) => s.vendorId)).size;
  const filtered = vendors.length;
  const hasActiveFilter =
    serviceType != null ||
    locationType != null ||
    lifeStage != null ||
    nearActive ||
    (q != null && q !== "") ||
    (specializations != null && specializations.length > 0);

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
          <Suspense>
            <ServiceKeywordSearch />
          </Suspense>
          <Suspense>
            <LocationSearch />
          </Suspense>
        </Container>
        {near != null && near !== "" && !nearActive && (
          <Container width="mid" className="mt-2">
            <p className="text-[14px] text-tr-d">
              We couldn&apos;t find that zip code — showing all providers.
            </p>
          </Container>
        )}
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
            <ServiceFilters serviceTypes={serviceTypes} />
          </Suspense>

          {/* Results column */}
          <div className="pt-6 pb-8 pl-6">
            {/* Count + sort */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-[15px] text-ink">
                {hasActiveFilter ? (
                  <>
                    {totalProviders} providers · <strong className="text-ch">{filtered}</strong> after filters
                  </>
                ) : (
                  <>{totalProviders} providers</>
                )}
              </span>
              <div className="flex items-center gap-4">
                <SavedLink />
                <Suspense>
                  <ServiceSort />
                </Suspense>
              </div>
            </div>

            <ServiceGrid vendors={vendors} servicesByVendor={servicesByVendor} />

            <div className="text-center mt-3">
              <Link
                href="/where-to-start"
                className="inline-block text-[15px] text-sg border-b border-dotted border-sg-l no-underline hover:text-sg-d"
              >
                Not sure what you need? See our guide →
              </Link>
            </div>
          </div>
        </Container>

        <Container width="mid" className="mt-8">
          <GiftCardCallout />
        </Container>
      </section>
    </>
  );
}
