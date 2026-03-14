"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { api, ApiError } from "@/lib/api";
import { CheckCircle, ArrowLeft } from "lucide-react";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!email || !token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-3">
          Link inválido
        </h1>
        <p className="text-text-secondary mb-6">
          O link de redefinição de senha é inválido ou expirou. Solicite um novo
          link.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
        >
          Solicitar novo link
        </Link>
      </div>
    );
  }

  async function onSubmit(data: ResetPasswordFormData) {
    setLoading(true);
    setError(null);
    try {
      await api("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          token,
          newPassword: data.newPassword,
        }),
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Erro ao redefinir senha. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 md:py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-3">
          Senha redefinida!
        </h1>
        <p className="text-text-secondary mb-8">
          Sua senha foi alterada com sucesso. Agora você pode fazer login com a
          nova senha.
        </p>
        <Link
          href="/login"
          className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm uppercase tracking-wide"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-main">
          Redefinir senha
        </h1>
        <p className="text-text-secondary mt-2">Crie uma nova senha para sua conta.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">
            Nova senha
          </label>
          <input
            type="password"
            {...register("newPassword")}
            className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
            placeholder="Mínimo 8 caracteres"
            autoFocus
          />
          {errors.newPassword && (
            <p className="text-sm text-error mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-main mb-1">
            Confirmar nova senha
          </label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="w-full bg-white border border-border-strong rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
            placeholder="Repita a nova senha"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-error mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {error && <p className="text-sm text-error text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Salvando..." : "Redefinir senha"}
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
