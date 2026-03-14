import { ProductGridSkeleton } from "@/components/product/product-skeleton";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="h-8 w-48 bg-secondary/40 rounded mb-8 animate-pulse" />
      <ProductGridSkeleton />
    </div>
  );
}
