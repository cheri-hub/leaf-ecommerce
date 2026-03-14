"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { productSchema, type ProductFormData } from "@/lib/schemas";
import type { Product, Category } from "@/types";

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingData, setLoadingData] = useState(!!productId);
  const isEditing = !!productId;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      priceInCents: 0,
      stock: 0,
      categoryId: "",
      isActive: true,
    },
  });

  useEffect(() => {
    async function load() {
      try {
        const cats = await api<Category[]>("/api/categories");
        setCategories(cats);

        if (productId) {
          const product = await api<Product>(`/api/products/${productId}`);
          reset({
            name: product.name,
            description: product.description ?? "",
            priceInCents: product.priceInCents,
            stock: product.stock,
            categoryId: product.categoryId,
            isActive: product.isActive,
          });
        }
      } catch {
        toast.error("Erro ao carregar dados");
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [productId, reset]);

  async function onSubmit(data: ProductFormData) {
    try {
      const body = {
        ...data,
        description: data.description || null,
      };

      if (isEditing) {
        await api(`/api/products/${productId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        toast.success("Produto atualizado com sucesso");
      } else {
        await api("/api/products", {
          method: "POST",
          body: JSON.stringify(body),
        });
        toast.success("Produto criado com sucesso");
      }
      router.push("/admin/products");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao salvar produto"
      );
    }
  }

  if (loadingData) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 w-48 bg-secondary/40 rounded" />
        <div className="bg-white rounded-lg border border-border p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-secondary/40 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-6">
        <Link href="/admin/products" className="hover:text-primary transition-colors">
          Produtos
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-text-main">
          {isEditing ? "Editar" : "Novo Produto"}
        </span>
      </nav>

      <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-8">
        {isEditing ? "Editar Produto" : "Novo Produto"}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg border border-border p-6 space-y-5 max-w-2xl"
      >
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">
            Nome
          </label>
          <input
            {...register("name")}
            className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
            placeholder="Nome do produto"
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
            rows={4}
            className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none"
            placeholder="Descrição do produto (opcional)"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Preço (centavos)
            </label>
            <input
              type="number"
              {...register("priceInCents", { valueAsNumber: true })}
              className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
              placeholder="Ex: 9990 = R$ 99,90"
            />
            {errors.priceInCents && (
              <p className="text-sm text-error mt-1">
                {errors.priceInCents.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              Estoque
            </label>
            <input
              type="number"
              {...register("stock", { valueAsNumber: true })}
              className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
              placeholder="Quantidade em estoque"
            />
            {errors.stock && (
              <p className="text-sm text-error mt-1">{errors.stock.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">
            Categoria
          </label>
          <select
            {...register("categoryId")}
            className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-sm text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-sm text-error mt-1">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            {...register("isActive")}
            className="w-4 h-4 rounded border-border-strong text-primary focus:ring-primary/20"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-text-main">
            Produto ativo
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            {isSubmitting
              ? "Salvando..."
              : isEditing
              ? "Salvar Alterações"
              : "Criar Produto"}
          </button>
          <Link
            href="/admin/products"
            className="border-2 border-border-strong text-text-main font-semibold py-3 px-6 rounded-lg hover:bg-bg-main transition-colors text-sm inline-flex items-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
