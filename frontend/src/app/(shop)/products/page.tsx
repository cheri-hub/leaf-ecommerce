import type { Metadata } from "next";
import { ProductsClient } from "@/components/product/products-client";

export const metadata: Metadata = {
  title: "Produtos — Leaf E-commerce",
  description:
    "Explore nosso catálogo completo de produtos selecionados com cuidado.",
};

export default function ProductsPage() {
  return <ProductsClient />;
}
