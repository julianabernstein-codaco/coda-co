import Link from "next/link";
import type { Vendor } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Stars } from "@/components/ui/Stars";
import { VendorPhoto } from "@/components/ui/VendorPhoto";
import { vendorTypeLabel, vendorLocationSuffix } from "@/lib/format/vendor";

type Layout = "compact" | "search";

interface VendorCardProps {
  vendor: Vendor;
  layout?: Layout;
}

export function VendorCard({ vendor, layout = "compact" }: VendorCardProps) {
  if (layout === "search") return <VendorSearchCard vendor={vendor} />;
  return <VendorCompactCard vendor={vendor} />;
}

function VendorCompactCard({ vendor }: { vendor: Vendor }) {
  return (
    <Card hoverTone="sage" href={`/services/${vendor.id}`}>
      <VendorPhoto
        src={vendor.photoSrc}
        alt={vendor.name}
        initials={vendor.initials}
        tone={vendor.photoTone}
        className="mb-3"
      />
      <div className="text-[14px] font-medium text-ch mb-[2px]">{vendor.name}</div>
      <div className="text-[10px] tracking-[.08em] uppercase text-cl mb-[7px]">
        {vendorTypeLabel(vendor.type)}
      </div>
      <div className="text-[12px] text-cm mb-[5px]">{vendorLocationSuffix(vendor)}</div>
      <Stars
        rating={vendor.rating}
        reviewCount={vendor.reviewCount}
        className="text-[12px]"
      />
    </Card>
  );
}

function VendorSearchCard({ vendor }: { vendor: Vendor }) {
  return (
    <Card
      hoverTone="sage"
      className="mb-3 grid grid-cols-[64px_1fr_120px] gap-3 items-start"
    >
      <VendorPhoto
        src={vendor.photoSrc}
        alt={vendor.name}
        initials={vendor.initials}
        size="lg"
        tone={vendor.photoTone}
      />

      <div className="min-w-0">
        <Link
          href={`/services/${vendor.id}`}
          className="text-[14px] font-medium text-ch mb-[2px] no-underline hover:text-tr block"
        >
          {vendor.name}
        </Link>
        <span className="inline-block text-[10px] tracking-[.07em] uppercase bg-sg-p text-sg-d border border-sg-l px-[9px] py-[2px] rounded-[10px] mb-[6px]">
          {vendorTypeLabel(vendor.type)}
        </span>
        <div className="text-[12px] text-cm leading-[1.5] mb-[6px]">{vendor.bio}</div>
        <div className="flex flex-wrap gap-3">
          <span className="text-[12px] text-cl">
            📍 <strong className="text-cm">{vendor.location}</strong>
            {vendor.distanceMi != null && ` · ${vendor.distanceMi} mi`}
          </span>
          {vendor.inHome && vendor.virtual && (
            <span className="text-[12px] text-cl">In-home &amp; virtual</span>
          )}
          {vendor.inHome && !vendor.virtual && (
            <span className="text-[12px] text-cl">In-home</span>
          )}
          {!vendor.inHome && vendor.virtual && (
            <span className="text-[12px] text-cl">Virtual only</span>
          )}
          {vendor.accepting && (
            <span className="text-[12px] text-cl">Accepting clients</span>
          )}
        </div>
      </div>

      <div className="text-right">
        <Stars rating={vendor.rating} className="text-[13px] whitespace-nowrap block" />
        <div className="text-[11px] text-cl mb-[10px]">{vendor.reviewCount} reviews</div>
        <Link
          href={`/services/${vendor.id}`}
          className="btn-primary btn-sm w-full no-underline"
        >
          View profile →
        </Link>
        <button className="btn-ghost btn-sm w-full mt-1.5">Save</button>
      </div>
    </Card>
  );
}
