"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
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

export default function AdminOrderDetailPage() {
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
      <div className="animate-pulse space-y-6">
        <div className="h-6 w-48 bg-secondary/40 rounded" />
        <div className="bg-white rounded-lg border border-border p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-secondary/40 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-4">
          Pedido não encontrado
        </h1>
        <Link
          href="/admin/orders"
          className="text-primary hover:text-primary-hover font-medium transition-colors"
        >
          Voltar para pedidos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-6">
        <Link href="/admin/orders" className="hover:text-primary transition-colors">
          Pedidos
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-text-main">#{order.id.slice(0, 8)}</span>
      </nav>

      <div className="flex items-center gap-4 mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main">
          Pedido #{order.id.slice(0, 8)}
        </h1>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded ${
            statusColors[order.status] ?? "bg-secondary text-text-main"
          }`}
        >
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Informações do Pedido
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-muted">Data</dt>
              <dd className="text-text-main font-medium">
                {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </dd>
            </div>
            {order.paidAt && (
              <div className="flex justify-between">
                <dt className="text-text-muted">Pago em</dt>
                <dd className="text-text-main font-medium">
                  {new Date(order.paidAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-text-muted">Total</dt>
              <dd className="text-text-main font-bold">
                {formatCurrency(order.totalInCents)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Cliente
          </h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-text-muted">Nome</dt>
              <dd className="text-text-main font-medium">
                {order.customerName}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">E-mail</dt>
              <dd className="text-text-main font-medium">
                {order.customerEmail}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Resumo
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-muted">Itens</dt>
              <dd className="text-text-main font-medium">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Subtotal</dt>
              <dd className="text-text-main font-medium">
                {formatCurrency(order.totalInCents)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-muted">Frete</dt>
              <dd className="text-success font-medium">Grátis</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-heading text-lg font-semibold text-text-main">
            Itens do Pedido
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-main/50">
                <th className="text-left px-6 py-3 font-medium text-text-secondary">
                  Produto
                </th>
                <th className="text-right px-6 py-3 font-medium text-text-secondary">
                  Preço Unitário
                </th>
                <th className="text-right px-6 py-3 font-medium text-text-secondary">
                  Qtd
                </th>
                <th className="text-right px-6 py-3 font-medium text-text-secondary">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-none"
                >
                  <td className="px-6 py-4 font-medium text-text-main">
                    {item.productName}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums text-text-secondary">
                    {formatCurrency(item.unitPriceInCents)}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums text-text-secondary">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums font-semibold text-text-main">
                    {formatCurrency(item.unitPriceInCents * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-bg-main/50">
                <td colSpan={3} className="px-6 py-4 font-semibold text-text-main text-right">
                  Total
                </td>
                <td className="px-6 py-4 text-right tabular-nums font-bold text-text-main">
                  {formatCurrency(order.totalInCents)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
