"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, Power } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { Product, PaginatedResponse } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    try {
      const data = await api<PaginatedResponse<Product>>(
        "/api/products?pageSize=50&activeOnly=false"
      );
      setProducts(data.items);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleToggleStatus(product: Product) {
    try {
      await api(`/api/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      toast.success(
        product.isActive ? "Produto desativado" : "Produto ativado"
      );
      await fetchProducts();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao alterar status"
      );
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await api(`/api/products/${id}`, { method: "DELETE" });
      toast.success("Produto excluído com sucesso");
      await fetchProducts();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao excluir produto"
      );
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-8">
          Produtos
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
          Produtos
        </h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-5 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-main/50">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  Nome
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  Categoria
                </th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">
                  Preço
                </th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">
                  Estoque
                </th>
                <th className="text-center px-4 py-3 font-medium text-text-secondary">
                  Status
                </th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border last:border-none hover:bg-bg-main/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-text-main">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {product.categoryName}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(product.priceInCents)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span
                        className={
                          product.stock <= 0
                            ? "text-error"
                            : product.stock <= 5
                            ? "text-warning"
                            : "text-text-main"
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${
                          product.isActive
                            ? "bg-success/10 text-success"
                            : "bg-text-muted/10 text-text-muted"
                        }`}
                      >
                        {product.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className={`p-2 rounded-lg transition-colors ${
                            product.isActive
                              ? "hover:bg-warning/10 text-text-secondary hover:text-warning"
                              : "hover:bg-success/10 text-text-secondary hover:text-success"
                          }`}
                          aria-label={product.isActive ? "Desativar" : "Ativar"}
                          title={product.isActive ? "Desativar produto" : "Ativar produto"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 rounded-lg hover:bg-primary/5 text-text-secondary hover:text-primary transition-colors"
                          aria-label="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-lg hover:bg-error/5 text-text-secondary hover:text-error transition-colors"
                          aria-label="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
