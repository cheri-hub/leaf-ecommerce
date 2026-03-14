"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, PackageSearch } from "lucide-react";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { useDebounce } from "@/hooks/use-debounce";
import type { Product, Category, PaginatedResponse } from "@/types";

export function ProductsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get("page") ?? "1");
  const categoryParam = searchParams.get("category") ?? "";
  const searchParam = searchParams.get("search") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParam);
  const debouncedSearch = useDebounce(searchInput, 400);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (updates.category !== undefined || updates.search !== undefined) {
        params.delete("page");
      }
      router.push(`/products?${params.toString()}`);
    },
    [searchParams, router]
  );

  useEffect(() => {
    updateParams({ search: debouncedSearch });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("pageSize", String(ITEMS_PER_PAGE));
        if (categoryParam) params.set("categorySlug", categoryParam);
        if (searchParam) params.set("search", searchParam);

        const data = await api<PaginatedResponse<Product>>(
          `/api/products?${params.toString()}`
        );
        setProducts(data.items);
        setTotalPages(data.totalPages);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [page, categoryParam, searchParam]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await api<Category[]>("/api/categories");
        setCategories(data);
      } catch {
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main">
          Nossos Produtos
        </h1>
        <p className="text-text-secondary mt-1">
          Encontre o produto perfeito para você
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar produtos..."
            className="w-full bg-white border border-border-strong rounded-lg pl-10 pr-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
          />
        </div>

        <select
          value={categoryParam}
          onChange={(e) => updateParams({ category: e.target.value })}
          className="bg-white border border-border-strong rounded-lg px-4 py-3 text-sm text-text-main focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      {loading ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <PackageSearch className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="font-heading text-xl font-semibold text-text-main mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
            Não encontramos resultados para sua busca. Tente outros termos ou explore nossas categorias.
          </p>
          <button
            onClick={() => {
              router.push("/products");
            }}
            className="text-primary font-medium text-sm hover:text-primary-hover transition-colors"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => updateParams({ page: String(p) })}
          />
        </div>
      )}
    </div>
  );
}
