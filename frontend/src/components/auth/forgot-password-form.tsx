"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { api, ApiError } from "@/lib/api";
import { Mail, ArrowLeft } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.email("E-mail inválido"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setLoading(true);
    setError(null);
    try {
      await api("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: data.email }),
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Erro ao processar. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 md:py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-success" />
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-3">
          Verifique seu e-mail
        </h1>
        <p className="text-text-secondary mb-8">
          Se o e-mail estiver cadastrado, você receberá um link para redefinir
          sua senha. Verifique também a caixa de spam.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main">
          Esqueci minha senha
        </h1>
        <p className="text-text-secondary mt-2">
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
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
            autoFocus
          />
          {errors.email && (
            <p className="text-sm text-error mt-1">{errors.email.message}</p>
          )}
        </div>

        {error && <p className="text-sm text-error text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Enviando..." : "Enviar link de redefinição"}
        </button>
      </form>

      <p className="text-center text-sm text-text-secondary mt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
