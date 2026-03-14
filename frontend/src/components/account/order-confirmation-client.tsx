"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { Order } from "@/types";

export function OrderConfirmationClient() {
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center animate-pulse">
        <div className="w-16 h-16 bg-secondary/40 rounded-full mx-auto mb-6" />
        <div className="h-8 w-64 bg-secondary/40 rounded mx-auto mb-4" />
        <div className="h-4 w-48 bg-secondary/40 rounded mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-4">
          Pedido não encontrado
        </h1>
        <Link
          href="/orders"
          className="text-primary hover:text-primary-hover font-medium transition-colors"
        >
          Ver meus pedidos
        </Link>
      </div>
    );
  }

  const isPaid = order.status === "Paid";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 md:py-20">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-3">
          {isPaid ? "Pagamento confirmado!" : "Pedido realizado!"}
        </h1>
        <p className="text-text-secondary text-base">
          {isPaid
            ? "Seu pagamento foi processado com sucesso. Estamos preparando seu pedido."
            : "Estamos aguardando a confirmação do pagamento."}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-border p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="font-sans font-medium text-lg text-text-main">
            Resumo do Pedido
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6 pb-6 border-b border-border">
          <div>
            <p className="text-text-muted mb-1">Número do pedido</p>
            <p className="font-medium text-text-main">#{order.id.slice(0, 8)}</p>
          </div>
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
        </div>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div>
                <p className="font-medium text-text-main">{item.productName}</p>
                <p className="text-text-muted">
                  Qtd: {item.quantity} &times; {formatCurrency(item.unitPriceInCents)}
                </p>
              </div>
              <p className="font-medium text-text-main">
                {formatCurrency(item.unitPriceInCents * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/orders/${order.id}`}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
        >
          Acompanhar pedido
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
        >
          Continuar comprando
        </Link>
      </div>
    </div>
  );
}
