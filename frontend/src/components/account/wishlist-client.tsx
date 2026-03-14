"use client";

import { useEffect, useState } from "react";
import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useWishlistStore } from "@/stores/wishlist-store";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-skeleton";
import { api } from "@/lib/api";
import type { Product } from "@/types";

export function WishlistClient() {
  const wishlistIds = useWishlistStore((s) => s.items);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function fetchProducts() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const results = await Promise.all(
          wishlistIds.map((id) =>
            api<Product>(`/api/products/${id}`).catch(() => null)
          )
        );
        setProducts(results.filter((p): p is Product => p !== null));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [wishlistIds, mounted]);

  if (!mounted || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main">
            Meus Favoritos
          </h1>
        </div>
        <ProductGridSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main">
          Meus Favoritos
        </h1>
        <p className="text-text-secondary mt-1">
          {products.length > 0
            ? `${products.length} ${products.length === 1 ? "produto" : "produtos"} favoritado${products.length === 1 ? "" : "s"}`
            : "Seus produtos favoritos aparecerão aqui"}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="font-heading text-xl font-semibold text-text-main mb-2">
            Nenhum favorito ainda
          </h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Explore nossos produtos e toque no coração para salvar seus favoritos.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
          >
            Explorar produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao perfil
        </Link>
      </div>
    </div>
  );
}
