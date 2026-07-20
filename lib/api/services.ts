import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type {
  Service,
  ServiceLocationType,
  ServicePricingModel,
  ServiceStatus,
  ServiceType,
} from "@/lib/types";

export interface ServiceFilters {
  vendorId?: string;
  serviceType?: ServiceType;
  locationType?: ServiceLocationType;
  // Owner-preview: include draft services alongside published ones (never
  // archived). Used on the vendor's own profile so they can see their
  // unpublished work. Defaults to published-only for the public.
  includeUnpublished?: boolean;
  // Include services belonging to vendors that aren't publicly `live`
  // (pre_launch / suspended). Off by default; admin and owner-preview pass
  // `true`. See docs/go-live-plan.md.
  includeHidden?: boolean;
}

type DbService = Prisma.ServiceGetPayload<{
  include: { vendor: true; serviceType: true };
}>;

function toService(s: DbService): Service {
  return {
    id: s.slug,
    vendorId: s.vendor.slug,
    serviceType: s.serviceType.slug as ServiceType,
    title: s.title,
    description: s.description,
    locationType: s.locationType as ServiceLocationType,
    pricingModel: s.pricingModel as ServicePricingModel,
    price: s.priceCents != null ? s.priceCents / 100 : undefined,
    currency: s.currency,
    status: s.status as ServiceStatus,
  };
}

export async function getServices(filters: ServiceFilters = {}): Promise<Service[]> {
  const where: Prisma.ServiceWhereInput = filters.includeUnpublished
    ? { status: { in: ["draft", "published"] } }
    : { status: "published" };
  // Vendor relation filter: scope by slug and/or the public visibility gate.
  const vendorWhere: Prisma.VendorProfileWhereInput = {};
  if (filters.vendorId) vendorWhere.slug = filters.vendorId;
  if (!filters.includeHidden) vendorWhere.publishState = "live";
  if (Object.keys(vendorWhere).length > 0) where.vendor = vendorWhere;
  if (filters.serviceType) where.serviceType = { slug: filters.serviceType };
  if (filters.locationType && filters.locationType !== "unknown") {
    // 'both' covers either intent; an exact 'virtual' or 'in_person'
    // filter should still surface services flagged as 'both'.
    where.locationType = filters.locationType === "both"
      ? "both"
      : { in: [filters.locationType, "both"] };
  }
  const rows = await prisma.service.findMany({
    where,
    include: { vendor: true, serviceType: true },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toService);
}

export async function getService(
  id: string,
  opts: { includeHidden?: boolean } = {},
): Promise<Service | null> {
  const s = await prisma.service.findFirst({
    where: {
      slug: id,
      ...(opts.includeHidden ? {} : { vendor: { publishState: "live" } }),
    },
    include: { vendor: true, serviceType: true },
  });
  return s ? toService(s) : null;
}
