export default function ProductNotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h1 className="font-heading text-3xl font-semibold text-text-main mb-4">
        Produto não encontrado
      </h1>
      <p className="text-text-secondary mb-6">
        O produto que você procura não existe ou foi removido.
      </p>
      <a
        href="/products"
        className="inline-block bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
      >
        Ver todos os produtos
      </a>
    </div>
  );
}
