import type { Metadata } from "next";
import { OrdersClient } from "@/components/account/orders-client";

export const metadata: Metadata = {
  title: "Meus Pedidos — Leaf E-commerce",
};

export default function OrdersPage() {
  return <OrdersClient />;
}
