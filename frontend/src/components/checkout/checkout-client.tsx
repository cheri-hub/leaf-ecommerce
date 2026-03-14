"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, User, LogIn, Tag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { checkoutSchema, type CheckoutFormData } from "@/lib/schemas";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import type { CreateOrderResponse, CouponInfo } from "@/types";

export function CheckoutClient() {
  const { items, updateQuantity, removeItem, totalCents, clear } = useCart();
  const { user, isLoading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<CouponInfo | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const showForm = !!user || guestMode;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.fullName,
        email: user.email,
        phone: user.phone ?? "",
        taxId: user.taxId ?? "",
      });
    }
  }, [user, reset]);

  async function onSubmit(data: CheckoutFormData) {
    if (items.length === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await api<CreateOrderResponse>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          customer: {
            name: data.name,
            email: data.email,
            phone: data.phone || undefined,
            taxId: data.taxId || undefined,
          },
          couponCode: couponApplied?.code || undefined,
        }),
      });

      clear();

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        window.location.href = `/orders/${response.orderId}`;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao processar pedido. Tente novamente."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-2">
          Seu carrinho está vazio
        </h1>
        <p className="text-text-secondary mb-6">
          Adicione produtos antes de finalizar a compra.
        </p>
        <Link
          href="/products"
          className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-8">
        Finalizar Compra
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3">
          {authLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-32 bg-secondary/40 rounded" />
              <div className="h-12 bg-secondary/40 rounded-lg" />
              <div className="h-12 bg-secondary/40 rounded-lg" />
            </div>
          ) : !showForm ? (
            <div className="space-y-6">
              <h2 className="font-heading text-lg font-semibold text-text-main">
                Como deseja continuar?
              </h2>

              {/* Login option */}
              <div className="bg-white rounded-lg border border-border p-6">
                <div className="flex items-center gap-3 mb-3">
                  <LogIn className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-semibold text-text-main">Já tenho uma conta</h3>
                </div>
                <p className="text-sm text-text-secondary mb-4">
                  Faça login para preencher seus dados automaticamente e acompanhar seu pedido.
                </p>
                <Link
                  href="/login?redirect=/checkout"
                  className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm uppercase tracking-wide"
                >
                  Entrar na minha conta
                </Link>
              </div>

              {/* Register option */}
              <div className="bg-white rounded-lg border border-border p-6">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-semibold text-text-main">Criar uma conta</h3>
                </div>
                <p className="text-sm text-text-secondary mb-4">
                  Cadastre-se para acompanhar pedidos, salvar favoritos e ter uma experiência personalizada.
                </p>
                <Link
                  href="/register?redirect=/checkout"
                  className="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm uppercase tracking-wide"
                >
                  Criar conta
                </Link>
              </div>

              {/* Guest option */}
              <div className="bg-white rounded-lg border border-border p-6">
                <div className="flex items-center gap-3 mb-3">
                  <ShoppingBag className="w-5 h-5 text-text-secondary" />
                  <h3 className="text-sm font-semibold text-text-main">Continuar sem conta</h3>
                </div>
                <p className="text-sm text-text-secondary mb-4">
                  Finalize sua compra informando apenas seus dados. Você não poderá acompanhar o pedido pela plataforma.
                </p>
                <button
                  onClick={() => setGuestMode(true)}
                  className="text-primary hover:text-primary-hover font-medium text-sm transition-colors"
                >
                  Continuar como convidado →
                </button>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit(onSubmit)} id="checkout-form" className="space-y-5">
            <h2 className="font-heading text-lg font-semibold text-text-main mb-4">
              Seus Dados
            </h2>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                Nome completo
              </label>
              <input
                {...register("name")}
                className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                placeholder="Seu nome completo"
              />
              {errors.name && (
                <p className="text-sm text-error mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1">
                E-mail
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="text-sm text-error mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  Telefone
                </label>
                <input
                  {...register("phone")}
                  className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                  placeholder="(11) 99999-9999"
                />
                {errors.phone && (
                  <p className="text-sm text-error mt-1">{errors.phone.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">
                  CPF/CNPJ
                </label>
                <input
                  {...register("taxId")}
                  className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                  placeholder="000.000.000-00"
                />
                {errors.taxId && (
                  <p className="text-sm text-error mt-1">{errors.taxId.message}</p>
                )}
              </div>
            </div>
          </form>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-border p-6 sticky top-28">
            <h2 className="font-heading text-lg font-semibold text-text-main mb-4">
              Resumo do Pedido
            </h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary/30 flex-shrink-0">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-main truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {formatCurrency(item.priceInCents)}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <QuantitySelector
                        quantity={item.quantity}
                        onQuantityChange={(q) =>
                          updateQuantity(item.productId, q)
                        }
                        max={10}
                      />
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1 text-text-muted hover:text-error transition-colors"
                        aria-label="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              {/* Coupon */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-text-main mb-1.5">
                  Cupom de desconto
                </label>
                {couponApplied ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-success/10 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium text-success">
                          {couponApplied.code}
                          {" — "}
                          {couponApplied.discountKind === "PERCENTAGE"
                            ? `${couponApplied.discount / 100}% off`
                            : `−${formatCurrency(couponApplied.discount)}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCouponApplied(null);
                          setCouponCode("");
                          setCouponError(null);
                        }}
                        className="text-xs text-text-muted hover:text-error transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Insira o código <span className="font-semibold">{couponApplied.code}</span> na página de pagamento para aplicar o desconto.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError(null);
                        }}
                        className="flex-1 bg-white border border-border-strong rounded-lg px-3 py-2 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                        placeholder="CÓDIGO"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const code = couponCode.trim();
                          if (!code) return;
                          setCouponLoading(true);
                          setCouponError(null);
                          try {
                            const info = await api<CouponInfo>(
                              `/api/coupons/validate?code=${encodeURIComponent(code)}`
                            );
                            setCouponApplied(info);
                            setCouponCode("");
                          } catch {
                            setCouponError("Cupom inválido ou expirado.");
                          } finally {
                            setCouponLoading(false);
                          }
                        }}
                        disabled={!couponCode.trim() || couponLoading}
                        className="bg-secondary hover:bg-secondary-hover text-text-main font-medium py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {couponLoading ? "..." : "Aplicar"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-error mt-1">{couponError}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-medium text-text-main">
                  {formatCurrency(totalCents())}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Frete</span>
                <span className="text-success font-medium">Grátis</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-semibold text-text-main">Total</span>
                <span className="font-bold text-lg text-text-main">
                  {formatCurrency(totalCents())}
                </span>
              </div>
            </div>

            {error && (
              <p className="text-sm text-error mt-4 text-center">{error}</p>
            )}

            <button
              type="submit"
              form="checkout-form"
              disabled={submitting || !showForm}
              className="w-full mt-6 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Processando..." : "Finalizar Pedido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
