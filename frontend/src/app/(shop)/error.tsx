"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <h2 className="font-heading text-2xl md:text-3xl font-semibold text-text-main mb-4">
        Algo deu errado
      </h2>
      <p className="text-text-secondary mb-6">
        Ocorreu um erro inesperado. Tente novamente.
      </p>
      <button
        onClick={reset}
        className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
      >
        Tentar novamente
      </button>
    </div>
  );
}
