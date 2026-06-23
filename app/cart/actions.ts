"use server";

import { getProducts } from "@/lib/api/products";
import type { ProductWithRating } from "@/lib/types";

// The cart lives in the client's localStorage as `{ productId, variantId,
// qty }` — it carries no titles or prices. The cart page calls this to
// hydrate live display data for the products it holds. Only `published`
// products come back (getProducts filters to them), so an unpublished or
// deleted product simply drops out and the page can flag that line as
// unavailable.
export async function getCartProducts(ids: string[]): Promise<ProductWithRating[]> {
  if (ids.length === 0) return [];
  return getProducts({ ids });
}
