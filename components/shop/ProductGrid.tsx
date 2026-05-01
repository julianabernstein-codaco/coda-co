import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ui/ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-cm">
        <p className="text-[15px] mb-2">No products found.</p>
        <p className="text-[13px] text-cl">Try a different category or clear your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid-auto-178">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
