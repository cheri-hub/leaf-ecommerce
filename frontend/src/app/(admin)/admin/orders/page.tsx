"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { Order, PaginatedResponse } from "@/types";

const statusColors: Record<string, string> = {
  Pending: "bg-warning/10 text-warning",
  Paid: "bg-success/10 text-success",
  Refunded: "bg-text-muted/10 text-text-muted",
  Failed: "bg-error/10 text-error",
  Cancelled: "bg-error/10 text-error",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await api<PaginatedResponse<Order>>(
          "/api/orders?pageSize=50"
        );
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
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-8">
          Pedidos
        </h1>
        <div className="bg-white rounded-lg border border-border p-6 animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-secondary/40 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main">
          Pedidos
        </h1>
        <span className="text-sm text-text-secondary">
          {orders.length} pedido{orders.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-main/50">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  Pedido
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  Cliente
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  Data
                </th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">
                  Total
                </th>
                <th className="text-center px-4 py-3 font-medium text-text-secondary">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-none hover:bg-bg-main/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-primary hover:text-primary-hover transition-colors"
                    >
                      #{order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-main">
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-xs text-text-secondary">
                        {order.customerEmail}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">
                    {formatCurrency(order.totalInCents)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${
                        statusColors[order.status] ??
                        "bg-secondary text-text-main"
                      }`}
                    >
                      {ORDER_STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
