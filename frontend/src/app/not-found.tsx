import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-heading text-6xl font-semibold text-primary mb-4">
          404
        </h1>
        <h2 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-4">
          Página não encontrada
        </h2>
        <p className="text-text-secondary mb-8">
          A página que você procura não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
