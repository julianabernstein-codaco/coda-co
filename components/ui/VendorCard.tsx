import Link from "next/link";
import type { Service, VendorWithRating } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { SaveButton } from "@/components/ui/SaveButton";
import { Stars } from "@/components/ui/Stars";
import { VendorPhoto } from "@/components/ui/VendorPhoto";
import { serviceTypeLabel, vendorLocationSuffix } from "@/lib/format/vendor";

type Layout = "compact" | "search";

interface VendorCardProps {
  vendor: VendorWithRating;
  layout?: Layout;
  // The vendor's matching services. Used to derive type labels and the
  // in-home/virtual line that used to live on the vendor row.
  services?: Service[];
}

export function VendorCard({ vendor, layout = "compact", services = [] }: VendorCardProps) {
  if (layout === "search") return <VendorSearchCard vendor={vendor} services={services} />;
  return <VendorCompactCard vendor={vendor} services={services} />;
}

function primaryTypeLabel(services: Service[]): string {
  if (services.length === 0) return "Service provider";
  return serviceTypeLabel(services[0].serviceType);
}

function VendorCompactCard({
  vendor,
  services,
}: {
  vendor: VendorWithRating;
  services: Service[];
}) {
  return (
    <Card hoverTone="sage" href={`/services/${vendor.id}`}>
      <VendorPhoto
        src={vendor.photoSrc}
        alt={vendor.name}
        initials={vendor.initials}
        tone={vendor.photoTone}
        className="mb-3"
      />
      <div className="text-[16px] font-medium text-ch mb-[2px]">{vendor.name}</div>
      <div className="text-[12px] tracking-[.08em] uppercase text-cl mb-[7px]">
        {primaryTypeLabel(services)}
      </div>
      <div className="text-[14px] text-cm mb-[5px]">
        {vendorLocationSuffix(vendor, services.map((s) => s.locationType))}
      </div>
      <Stars
        rating={vendor.rating}
        reviewCount={vendor.reviewCount}
        className="text-[14px]"
      />
    </Card>
  );
}

function VendorSearchCard({
  vendor,
  services,
}: {
  vendor: VendorWithRating;
  services: Service[];
}) {
  const inPerson = services.some(
    (s) => s.locationType === "in_person" || s.locationType === "both",
  );
  const virtual = services.some(
    (s) => s.locationType === "virtual" || s.locationType === "both",
  );

  return (
    <Card
      hoverTone="sage"
      className="mb-3 grid grid-cols-[88px_1fr] gap-4 items-start"
    >
      <VendorPhoto
        src={vendor.photoSrc}
        alt={vendor.name}
        initials={vendor.initials}
        size="lg"
        tone={vendor.photoTone}
        className="w-[88px] h-[88px]"
      />

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3 mb-[6px]">
          <Link
            href={`/services/${vendor.id}`}
            className="text-[16px] font-medium text-ch no-underline hover:text-tr min-w-0"
          >
            {vendor.name}
          </Link>
          <span className="shrink-0 text-[12px] tracking-[.07em] uppercase bg-sg-p text-sg-d border border-sg-l px-[9px] py-[2px] rounded-[10px] whitespace-nowrap">
            {primaryTypeLabel(services)}
          </span>
        </div>
        <div className="text-[16px] text-cm leading-[1.6] mb-2">{vendor.bio}</div>
        <div className="flex flex-wrap gap-3 mb-3">
          <span className="text-[14px] text-cl">
            📍 <strong className="text-cm">{vendor.location}</strong>
            {vendor.distanceMi != null && ` · ${vendor.distanceMi} mi`}
          </span>
          {inPerson && virtual && (
            <span className="text-[14px] text-cl">In-home &amp; virtual</span>
          )}
          {inPerson && !virtual && (
            <span className="text-[14px] text-cl">In-home</span>
          )}
          {!inPerson && virtual && (
            <span className="text-[14px] text-cl">Virtual only</span>
          )}
        </div>

        <div className="mb-3">
          <Stars
            rating={vendor.rating}
            reviewCount={vendor.reviewCount}
            className="text-[15px] text-tr"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/services/${vendor.id}`}
            className="btn-primary btn-sm no-underline"
          >
            View profile →
          </Link>
          <SaveButton
            kind="vendor"
            slug={vendor.id}
            className="btn-ghost btn-sm"
            activeClassName="text-tr border-tr"
          />
        </div>
      </div>
    </Card>
  );
}
