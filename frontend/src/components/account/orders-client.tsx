"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { Order } from "@/types";

const statusColors: Record<string, string> = {
  Pending: "bg-warning/10 text-warning",
  Paid: "bg-success/10 text-success",
  Refunded: "bg-text-muted/10 text-text-muted",
  Failed: "bg-error/10 text-error",
  Cancelled: "bg-error/10 text-error",
};

export function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await api<{ items: Order[] }>("/api/orders");
        setOrders(data.items);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-8">
          Meus Pedidos
        </h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-border p-6 animate-pulse">
              <div className="h-4 w-32 bg-secondary/40 rounded mb-3" />
              <div className="h-3 w-48 bg-secondary/40 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Package className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-2">
          Nenhum pedido
        </h1>
        <p className="text-text-secondary mb-6">
          Você ainda não fez nenhum pedido.
        </p>
        <Link
          href="/products"
          className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
        >
          Explorar produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-8">
        Meus Pedidos
      </h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block bg-white rounded-lg border border-border p-6 hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-text-main">
                Pedido #{order.id.slice(0, 8)}
              </span>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  statusColors[order.status] ?? "bg-secondary text-text-main"
                }`}
              >
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-text-secondary">
              <span>
                {new Date(order.createdAt).toLocaleDateString("pt-BR")} •{" "}
                {order.items.length} {order.items.length === 1 ? "item" : "itens"}
              </span>
              <span className="font-semibold text-text-main">
                {formatCurrency(order.totalInCents)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
