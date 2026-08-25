import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isDemoHidden } from "@/lib/launch";
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
    demo: s.vendor.demo,
  };
}

export async function getServices(filters: ServiceFilters = {}): Promise<Service[]> {
  const where: Prisma.ServiceWhereInput = filters.includeUnpublished
    ? { status: { in: ["draft", "published"] } }
    : { status: "published" };
  const vendorWhere: Prisma.VendorProfileWhereInput = {};
  if (filters.vendorId) vendorWhere.slug = filters.vendorId;
  if (await isDemoHidden()) vendorWhere.demo = false;
  if (Object.keys(vendorWhere).length) where.vendor = vendorWhere;
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

export async function getService(id: string): Promise<Service | null> {
  const s = await prisma.service.findUnique({
    where: { slug: id },
    include: { vendor: true, serviceType: true },
  });
  if (!s) return null;
  if (s.vendor.demo && (await isDemoHidden())) return null;
  return toService(s);
}
