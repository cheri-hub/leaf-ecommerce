"use client";

import { useState } from "react";
import { toast } from "sonner";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    // TODO: integrate with newsletter service when available
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitted(true);
    setEmail("");
    toast.success("Inscrição realizada com sucesso!");
    setLoading(false);
  }

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-surface-card">
      <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-heading text-2xl md:text-3xl font-semibold text-text-main">
          Receba Novidades
        </h2>
        <p className="text-text-secondary mt-2 mb-6">
          Cadastre-se e fique por dentro de lançamentos e ofertas exclusivas.
        </p>

        {submitted ? (
          <p className="text-success font-medium">
            Obrigado! Você receberá nossas novidades em breve.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              required
              className="flex-1 bg-white border border-border-strong rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Inscrever-se"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
