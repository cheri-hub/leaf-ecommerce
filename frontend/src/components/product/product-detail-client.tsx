"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Heart } from "lucide-react";
import { formatCurrency, formatInstallments } from "@/lib/utils";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/types";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const images = product.images.length > 0 ? product.images : null;
  const currentImage = images?.[selectedImage];
  const isOutOfStock = product.stock <= 0;

  function handleAddToCart() {
    addItem(product, quantity);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/products" className="hover:text-primary transition-colors">
          Produtos
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-text-main">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          {images && images.length > 1 && (
            <div className="hidden md:flex flex-col gap-2 w-20">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedImage
                      ? "border-primary"
                      : "border-border hover:border-border-strong"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? `${product.name} ${i + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="flex-1 relative aspect-square rounded-lg overflow-hidden bg-white">
            {currentImage ? (
              <Image
                src={currentImage.url}
                alt={currentImage.altText ?? product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                <span className="text-text-muted">Sem imagem</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted mb-2">
            {product.categoryName}
          </p>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-sans font-bold text-2xl text-text-main">
              {formatCurrency(product.priceInCents)}
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            ou {formatInstallments(product.priceInCents, 4)} sem juros
          </p>

          {/* Stock */}
          {isOutOfStock ? (
            <p className="mt-4 text-sm text-error font-medium">Produto esgotado</p>
          ) : product.stock <= 5 ? (
            <p className="mt-4 text-sm text-warning font-medium">
              Apenas {product.stock} unidade{product.stock > 1 ? "s" : ""} em estoque
            </p>
          ) : null}

          {/* Quantity + CTA */}
          <div className="mt-6 flex items-center gap-4">
            <QuantitySelector
              quantity={quantity}
              onQuantityChange={setQuantity}
              max={Math.min(product.stock, 10)}
              min={1}
            />
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOutOfStock ? "Indisponível" : "Adicionar ao Carrinho"}
            </button>
            <button
              className="p-3 rounded-full hover:bg-primary/5 text-text-main transition-colors border border-border"
              aria-label="Adicionar aos favoritos"
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8 pt-8 border-t border-border">
              <h2 className="font-heading text-lg font-semibold text-text-main mb-3">
                Descrição
              </h2>
              <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
