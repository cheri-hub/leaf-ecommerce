"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema, type LoginFormData } from "@/lib/schemas";
import { useAuth } from "@/hooks/use-auth";
import { SITE_NAME } from "@/lib/constants";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      router.push(redirect);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao fazer login. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main">
          Entrar
        </h1>
        <p className="text-text-secondary mt-2">
          Bem-vindo de volta à {SITE_NAME}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-text-main">
              Senha
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Esqueci minha senha
            </Link>
          </div>
          <input
            type="password"
            {...register("password")}
            className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
            placeholder="Sua senha"
          />
          {errors.password && (
            <p className="text-sm text-error mt-1">{errors.password.message}</p>
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
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-center text-sm text-text-secondary mt-6">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-primary hover:text-primary-hover font-medium transition-colors">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
