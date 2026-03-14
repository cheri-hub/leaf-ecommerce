import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { ProductDetailClient } from "@/components/product/product-detail-client";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await api<Product>(`/api/products/slug/${slug}`);
    return {
      title: `${product.name} — Leaf E-commerce`,
      description:
        product.description ??
        `${product.name} por ${formatCurrency(product.priceInCents)}`,
      openGraph: {
        title: product.name,
        description:
          product.description ?? `Compre ${product.name} na Leaf E-commerce`,
        images: product.images[0]
          ? [{ url: product.images[0].url, alt: product.name }]
          : undefined,
      },
    };
  } catch {
    return { title: "Produto — Leaf E-commerce" };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  let product: Product;
  try {
    product = await api<Product>(`/api/products/slug/${slug}`);
  } catch {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
