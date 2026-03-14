"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlide {
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaHref: string;
  imageUrl: string;
}

interface HeroBannerProps {
  slides: HeroSlide[];
  autoPlayMs?: number;
}

export function HeroBanner({ slides, autoPlayMs = 5000 }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, autoPlayMs);
    return () => clearInterval(timer);
  }, [next, autoPlayMs, slides.length]);

  const slide = slides[current];

  return (
    <section className="relative w-full aspect-[3/1] max-md:aspect-video overflow-hidden">
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Image
            src={s.imageUrl}
            alt={s.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-lg">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-light text-white leading-[1.1] tracking-tight">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="mt-3 text-white/80 text-base md:text-lg">
                {slide.subtitle}
              </p>
            )}
            <Link
              href={slide.ctaHref}
              className="mt-6 inline-block bg-white text-text-main font-semibold py-3 px-8 rounded-lg hover:bg-white/90 transition-colors text-sm uppercase tracking-wide"
            >
              {slide.ctaText}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors backdrop-blur-sm"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors backdrop-blur-sm"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === current ? "bg-white" : "bg-white/40"
                }`}
                aria-label={`Ir para slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
