import type { Metadata } from "next";
import { WishlistClient } from "@/components/account/wishlist-client";

export const metadata: Metadata = {
  title: "Meus Favoritos — Leaf E-commerce",
  description: "Veja os produtos que você adicionou aos favoritos.",
};

export default function WishlistPage() {
  return <WishlistClient />;
}
