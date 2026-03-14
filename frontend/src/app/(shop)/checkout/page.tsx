import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/checkout-client";

export const metadata: Metadata = {
  title: "Checkout — Leaf E-commerce",
  description: "Finalize sua compra com segurança.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
