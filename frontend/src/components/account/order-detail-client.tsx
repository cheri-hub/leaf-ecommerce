"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { Order } from "@/types";

export function OrderDetailClient() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchOrder() {
      try {
        const data = await api<Order>(`/api/orders/${id}`);
        setOrder(data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
        <div className="h-6 w-48 bg-secondary/40 rounded mb-8" />
        <div className="bg-white rounded-lg border border-border p-6 space-y-4">
          <div className="h-4 w-32 bg-secondary/40 rounded" />
          <div className="h-4 w-64 bg-secondary/40 rounded" />
          <div className="h-4 w-40 bg-secondary/40 rounded" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-4">
          Pedido não encontrado
        </h1>
        <Link
          href="/orders"
          className="text-primary hover:text-primary-hover font-medium transition-colors"
        >
          Voltar para meus pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-6">
        <Link href="/orders" className="hover:text-primary transition-colors">
          Meus Pedidos
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-text-main">#{order.id.slice(0, 8)}</span>
      </nav>

      <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-6">
        Pedido #{order.id.slice(0, 8)}
      </h1>

      <div className="bg-white rounded-lg border border-border p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-text-muted mb-1">Status</p>
            <p className="font-medium text-text-main">
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </p>
          </div>
          <div>
            <p className="text-text-muted mb-1">Data</p>
            <p className="font-medium text-text-main">
              {new Date(order.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <div>
            <p className="text-text-muted mb-1">Total</p>
            <p className="font-bold text-text-main">
              {formatCurrency(order.totalInCents)}
            </p>
          </div>
          {order.paidAt && (
            <div>
              <p className="text-text-muted mb-1">Pago em</p>
              <p className="font-medium text-text-main">
                {new Date(order.paidAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border p-6">
        <h2 className="font-heading text-lg font-semibold text-text-main mb-4">
          Itens do Pedido
        </h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-3 border-b border-border last:border-none"
            >
              <div>
                <p className="text-sm font-medium text-text-main">
                  {item.productName}
                </p>
                <p className="text-xs text-text-secondary">
                  Qtd: {item.quantity} × {formatCurrency(item.unitPriceInCents)}
                </p>
              </div>
              <p className="text-sm font-semibold text-text-main">
                {formatCurrency(item.unitPriceInCents * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
