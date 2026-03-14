"use client";

import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const REVIEWS = [
  {
    id: 1,
    name: "Ana Clara",
    city: "São Paulo, SP",
    rating: 5,
    text: "Produtos incríveis! A qualidade é surpreendente e a embalagem veio impecável. Com certeza comprarei novamente.",
  },
  {
    id: 2,
    name: "Rafael Santos",
    city: "Rio de Janeiro, RJ",
    rating: 5,
    text: "Frete rápido e produto exatamente como descrito. O atendimento ao cliente também foi excelente.",
  },
  {
    id: 3,
    name: "Mariana Costa",
    city: "Belo Horizonte, MG",
    rating: 4,
    text: "Amei a experiência de compra. O site é muito fácil de usar e o produto chegou antes do prazo.",
  },
  {
    id: 4,
    name: "Lucas Oliveira",
    city: "Curitiba, PR",
    rating: 5,
    text: "Já é a terceira vez que compro aqui. Sempre superando as expectativas. Recomendo para todos!",
  },
  {
    id: 5,
    name: "Juliana Pereira",
    city: "Porto Alegre, RS",
    rating: 5,
    text: "A qualidade dos produtos é premium. Vale cada centavo investido. Virei cliente fiel!",
  },
  {
    id: 6,
    name: "Fernando Lima",
    city: "Salvador, BA",
    rating: 4,
    text: "Ótima variedade de produtos e preços justos. O parcelamento sem juros ajudou muito.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? "fill-warning text-warning"
              : "fill-none text-text-muted"
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewsSection() {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 3;
  const maxStart = REVIEWS.length - visibleCount;

  function prev() {
    setStartIndex((i) => Math.max(0, i - 1));
  }

  function next() {
    setStartIndex((i) => Math.min(maxStart, i + 1));
  }

  const visible = REVIEWS.slice(startIndex, startIndex + visibleCount);

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <p className="text-text-secondary text-sm uppercase tracking-wide mb-2">
            Mais de 5.000 avaliações
          </p>
          <h2 className="font-heading text-2xl md:text-3xl font-semibold text-text-main">
            O que nossos clientes dizem
          </h2>
          <div className="w-12 h-0.5 bg-primary mx-auto mt-4" />
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visible.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg p-6 shadow-card"
              >
                <StarRating rating={review.rating} />
                <p className="mt-4 text-text-main text-sm leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-text-main">
                    {review.name}
                  </p>
                  <p className="text-xs text-text-muted">{review.city}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              disabled={startIndex === 0}
              className="p-2 rounded-full border border-border hover:bg-primary/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Avaliações anteriores"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: maxStart + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStartIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === startIndex ? "bg-primary" : "bg-border-strong"
                  }`}
                  aria-label={`Ir para grupo ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              disabled={startIndex >= maxStart}
              className="p-2 rounded-full border border-border hover:bg-primary/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Próximas avaliações"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
