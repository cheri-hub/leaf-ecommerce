"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { categorySchema, type CategoryFormData } from "@/lib/schemas";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  async function fetchCategories() {
    try {
      const data = await api<Category[]>("/api/categories");
      setCategories(data);
    } catch {
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function handleEdit(category: Category) {
    setEditingId(category.id);
    setShowForm(true);
    reset({
      name: category.name,
      description: category.description ?? "",
    });
  }

  function handleNewCategory() {
    setEditingId(null);
    setShowForm(true);
    reset({ name: "", description: "" });
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    reset({ name: "", description: "" });
  }

  async function onSubmit(data: CategoryFormData) {
    try {
      if (editingId) {
        await api(`/api/categories/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        toast.success("Categoria atualizada com sucesso");
      } else {
        await api("/api/categories", {
          method: "POST",
          body: JSON.stringify(data),
        });
        toast.success("Categoria criada com sucesso");
      }
      handleCancel();
      await fetchCategories();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao salvar categoria"
      );
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    try {
      await api(`/api/categories/${id}`, { method: "DELETE" });
      toast.success("Categoria excluída com sucesso");
      await fetchCategories();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao excluir categoria"
      );
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-8">
          Categorias
        </h1>
        <div className="bg-white rounded-lg border border-border p-6 animate-pulse space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
          Categorias
        </h1>
        <button
          onClick={handleNewCategory}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-5 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-text-main">
              {editingId ? "Editar Categoria" : "Nova Categoria"}
            </h2>
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-full hover:bg-primary/5 transition-colors"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Nome
              </label>
              <input
                {...register("name")}
                className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                placeholder="Nome da categoria"
              />
              {errors.name && (
                <p className="text-sm text-error mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Descrição
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none"
                placeholder="Descrição da categoria (opcional)"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-5 rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                {isSubmitting ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="border-2 border-border-strong text-text-main font-semibold py-2.5 px-5 rounded-lg hover:bg-bg-main transition-colors text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-main/50">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  Nome
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  Slug
                </th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  Descrição
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
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                    Nenhuma categoria cadastrada.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-border last:border-none hover:bg-bg-main/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-text-main">
                      {cat.name}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{cat.slug}</td>
                    <td className="px-4 py-3 text-text-secondary max-w-xs truncate">
                      {cat.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${
                          cat.isActive
                            ? "bg-success/10 text-success"
                            : "bg-text-muted/10 text-text-muted"
                        }`}
                      >
                        {cat.isActive ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-2 rounded-lg hover:bg-primary/5 text-text-secondary hover:text-primary transition-colors"
                          aria-label="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
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
