import { products } from "@/lib/data/products";
import { matchesLifeStage } from "@/lib/format/lifeStage";
import type { LifeStage, Product, ProductCategory } from "@/lib/types";

export interface ProductFilters {
  category?: ProductCategory;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  verified?: boolean;
  ids?: string[];
  lifeStage?: LifeStage | LifeStage[];
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let results = products;
  if (filters.category) results = results.filter((p) => p.category === filters.category);
  if (filters.sellerId) results = results.filter((p) => p.sellerId === filters.sellerId);
  if (filters.minPrice != null) results = results.filter((p) => p.price >= filters.minPrice!);
  if (filters.maxPrice != null) results = results.filter((p) => p.price <= filters.maxPrice!);
  if (filters.verified != null) results = results.filter((p) => p.verified === filters.verified);
  if (filters.ids) results = results.filter((p) => filters.ids!.includes(p.id));
  if (filters.lifeStage) {
    results = results.filter((p) => matchesLifeStage(p.lifeStages, filters.lifeStage));
  }
  return results;
}

export async function getProduct(id: string): Promise<Product | null> {
  return products.find((p) => p.id === id) ?? null;
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  if (!product.relatedIds?.length) return [];
  return products.filter((p) => product.relatedIds!.includes(p.id));
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  return products.filter((p) => p.verified).slice(0, limit);
}
