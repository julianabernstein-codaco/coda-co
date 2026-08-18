import type {
  ServiceLocationType,
  ServiceType,
  Vendor,
  VendorKind,
} from "@/lib/types";

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  doula: "End of life doula",
  attorney: "Estate attorney",
  cleaner: "Death cleaning",
  celebrant: "Funeral celebrant",
  organizer: "End of life organizer",
  grief: "Grief counselor",
  "home-funeral": "Home funeral guide",
  "funeral-home": "Funeral home",
  cafe: "Death cafe",
  "life-celebration": "Event planner",
  "somatic-practitioner": "Somatic practitioner (yoga, massage)",
  mediator: "Mediator",
  "spiritual-support": "Spiritual support",
  other: "Other",
};

export function serviceTypeLabel(type: ServiceType | string): string {
  return SERVICE_TYPE_LABELS[type as ServiceType] ?? type;
}

// Public page for a vendor. Goods sellers get a shop page built around
// their products; everyone else gets the services profile. Vendors listing
// both keep the services page, which is the one with room for services.
// Use this everywhere instead of hardcoding `/services/${slug}` — the
// services route redirects goods sellers here anyway, but linking straight
// to the right page avoids the bounce.
export function vendorPagePath(kind: VendorKind | string, slug: string): string {
  return kind === "goods" ? `/makers/${slug}` : `/services/${slug}`;
}

// Aggregate the location capabilities of a vendor's services into a single
// "In-home & virtual" / "In-home" / "Virtual" suffix appended to their city.
export function vendorLocationSuffix(
  vendor: Vendor,
  locationTypes: ServiceLocationType[] = [],
): string {
  const parts: string[] = [vendor.location];
  const inPerson = locationTypes.some((l) => l === "in_person" || l === "both");
  const virtual = locationTypes.some((l) => l === "virtual" || l === "both");
  if (inPerson && virtual) parts.push("In-home & virtual");
  else if (inPerson) parts.push("In-home");
  else if (virtual) parts.push("Virtual");
  return parts.join(" · ");
}
