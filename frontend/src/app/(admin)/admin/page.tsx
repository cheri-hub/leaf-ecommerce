"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api<DashboardStats>("/api/admin/dashboard");
        setStats(data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = stats
    ? [
        {
          label: "Total de Produtos",
          value: stats.totalProducts.toString(),
          icon: Package,
          color: "text-primary",
          bg: "bg-primary/10",
        },
        {
          label: "Total de Pedidos",
          value: stats.totalOrders.toString(),
          icon: ShoppingBag,
          color: "text-primary-light",
          bg: "bg-primary-light/10",
        },
        {
          label: "Pedidos Pagos",
          value: stats.paidOrders.toString(),
          icon: TrendingUp,
          color: "text-success",
          bg: "bg-success/10",
        },
        {
          label: "Receita Total",
          value: formatCurrency(stats.totalRevenueCents),
          icon: DollarSign,
          color: "text-success",
          bg: "bg-success/10",
        },
      ]
    : [];

  return (
    <div>
      <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-8">
        Dashboard
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-border p-6 animate-pulse">
              <div className="h-4 w-24 bg-secondary/40 rounded mb-3" />
              <div className="h-6 w-16 bg-secondary/40 rounded" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-lg border border-border p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-text-secondary">{card.label}</p>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-text-main">{card.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-text-secondary">
          Não foi possível carregar as estatísticas.
        </p>
      )}
    </div>
  );
}
