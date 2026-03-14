"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { formatCurrency, formatInstallments } from "@/lib/utils";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images[0];
  const isOutOfStock = product.stock <= 0;
  const wishlist = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isFavorite = mounted && wishlist.has(product.id);

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={mainImage.altText ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
            <span className="text-text-muted text-sm">Sem imagem</span>
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-text-muted text-white text-xs font-medium px-3 py-1.5 rounded">
              ESGOTADO
            </span>
          </div>
        )}
      </Link>

      {/* Wishlist */}
      <button
        onClick={() => wishlist.toggle(product.id)}
        className={`absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm ${
          isFavorite ? "text-error" : "text-text-main hover:text-primary"
        }`}
        aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
      </button>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-text-muted mb-1">
          {product.categoryName}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-heading text-sm font-semibold text-text-main line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2">
          <p className="font-sans font-bold text-lg text-text-main">
            {formatCurrency(product.priceInCents)}
          </p>
          <p className="text-xs text-text-secondary">
            ou {formatInstallments(product.priceInCents, 4)} sem juros
          </p>
        </div>
      </div>
    </div>
  );
}
