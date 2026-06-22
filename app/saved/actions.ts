"use server";

import { getProducts } from "@/lib/api/products";
import { getServices } from "@/lib/api/services";
import { getVendors } from "@/lib/api/vendors";
import type { ProductWithRating, Service, VendorWithRating } from "@/lib/types";

export interface SavedItemsData {
  products: ProductWithRating[];
  vendors: VendorWithRating[];
  // Services per vendor (keyed by vendor slug) for the vendor card's type
  // label + location line. Plain object so it serializes across the action
  // boundary (a Map wouldn't).
  servicesByVendor: Record<string, Service[]>;
}

// Hydrates the browser's saved slugs (localStorage) into full card data.
// Unpublished products and removed vendors simply don't come back, so the
// wishlist self-heals when a saved item goes away.
export async function loadSavedItems(
  productSlugs: string[],
  vendorSlugs: string[],
): Promise<SavedItemsData> {
  const [products, vendors] = await Promise.all([
    productSlugs.length ? getProducts({ ids: productSlugs }) : Promise.resolve([]),
    vendorSlugs.length ? getVendors({ ids: vendorSlugs }) : Promise.resolve([]),
  ]);

  const servicesByVendor: Record<string, Service[]> = {};
  await Promise.all(
    vendors.map(async (v) => {
      servicesByVendor[v.id] = await getServices({ vendorId: v.id });
    }),
  );

  return { products, vendors, servicesByVendor };
}
