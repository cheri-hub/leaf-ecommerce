import { api } from "@/lib/api";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-skeleton";
import type { Product, PaginatedResponse } from "@/types";
import { Suspense } from "react";

async function ProductGrid() {
  try {
    const data = await api<PaginatedResponse<Product>>("/api/products?pageSize=8");
    const products = data.items;

    if (products.length === 0) {
      return (
        <div className="text-center py-12 col-span-full">
          <p className="text-text-secondary">
            Nenhum produto disponível no momento.
          </p>
          <p className="text-text-muted text-sm mt-1">
            Volte em breve para conferir nossas novidades!
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  } catch {
    return (
      <p className="text-text-secondary text-center col-span-full py-8">
        Não foi possível carregar os produtos.
      </p>
    );
  }
}

export function FeaturedProducts() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={8} />}>
      <ProductGrid />
    </Suspense>
  );
}
