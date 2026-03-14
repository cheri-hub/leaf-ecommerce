import type { Metadata } from "next";
import { TrustBar } from "@/components/layout/trust-bar";
import { HeroBanner } from "@/components/layout/hero-banner";
import type { HeroSlide } from "@/components/layout/hero-banner";
import { FeaturedProducts } from "@/components/home/featured-products";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { ReviewsSection } from "@/components/home/reviews-section";

export const metadata: Metadata = {
  title: "Leaf E-commerce — Natureza em cada detalhe",
  description:
    "Descubra produtos selecionados com cuidado para o seu dia a dia. Frete grátis acima de R$ 400, parcele em até 12x.",
  openGraph: {
    title: "Leaf E-commerce — Natureza em cada detalhe",
    description:
      "Descubra produtos selecionados com cuidado para o seu dia a dia.",
    type: "website",
  },
};

const HERO_SLIDES: HeroSlide[] = [
  {
    title: "Natureza em cada detalhe",
    subtitle: "Descubra produtos selecionados com cuidado para o seu dia a dia.",
    ctaText: "Explorar produtos",
    ctaHref: "/products",
    imageUrl: "/images/hero-banner.svg",
  },
  {
    title: "Novidades da estação",
    subtitle: "Confira os lançamentos que acabaram de chegar à nossa loja.",
    ctaText: "Ver novidades",
    ctaHref: "/products",
    imageUrl: "/images/hero-banner-2.svg",
  },
  {
    title: "Frete grátis acima de R$ 400",
    subtitle: "Aproveite condições especiais para suas compras.",
    ctaText: "Comprar agora",
    ctaHref: "/products",
    imageUrl: "/images/hero-banner-3.svg",
  },
];

export default function HomePage() {
  return (
    <>
      <HeroBanner slides={HERO_SLIDES} />
      <TrustBar />

      <section className="py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-semibold text-text-main">
              Produtos em Destaque
            </h2>
            <p className="text-text-secondary text-base mt-2">
              Os favoritos dos nossos clientes
            </p>
            <div className="w-12 h-0.5 bg-primary mx-auto mt-4" />
          </div>
          <FeaturedProducts />
        </div>
      </section>

      <section className="py-12 md:py-16 bg-surface-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold text-text-main">
            Novidades
          </h2>
          <p className="text-text-secondary text-base mt-2">
            Recém-chegados à nossa loja
          </p>
          <div className="w-12 h-0.5 bg-primary mx-auto mt-4 mb-8 md:mb-12" />
          <FeaturedProducts />
        </div>
      </section>

      <ReviewsSection />

      <NewsletterSection />
    </>
  );
}
