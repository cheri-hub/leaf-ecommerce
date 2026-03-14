"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterFormData } from "@/lib/schemas";
import { useAuth } from "@/hooks/use-auth";
import { SITE_NAME } from "@/lib/constants";

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setLoading(true);
    setError(null);
    try {
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        taxId: data.taxId || undefined,
      });
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao criar conta. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main">
          Criar Conta
        </h1>
        <p className="text-text-secondary mt-2">
          Junte-se à {SITE_NAME}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">
            Nome completo
          </label>
          <input
            {...register("fullName")}
            className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
            placeholder="Seu nome completo"
          />
          {errors.fullName && (
            <p className="text-sm text-error mt-1">{errors.fullName.message}</p>
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
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">
              CPF
            </label>
            <input
              {...register("taxId")}
              className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
              placeholder="000.000.000-00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">
            Senha
          </label>
          <input
            type="password"
            {...register("password")}
            className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
            placeholder="Mínimo 6 caracteres"
          />
          {errors.password && (
            <p className="text-sm text-error mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">
            Confirmar senha
          </label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
            placeholder="Repita a senha"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-error mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-error text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Criando conta..." : "Criar Conta"}
        </button>
      </form>

      <p className="text-center text-sm text-text-secondary mt-6">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
          Entrar
        </Link>
      </p>
    </div>
  );
}
