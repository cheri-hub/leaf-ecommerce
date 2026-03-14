export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-card animate-pulse">
      <div className="aspect-square bg-secondary/30" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 bg-secondary/40 rounded" />
        <div className="h-4 w-full bg-secondary/40 rounded" />
        <div className="h-4 w-3/4 bg-secondary/40 rounded" />
        <div className="h-5 w-20 bg-secondary/40 rounded" />
        <div className="h-3 w-28 bg-secondary/40 rounded" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
