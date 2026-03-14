import Link from "next/link";
import { AdminGuard } from "@/components/admin/admin-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
    <div className="min-h-screen bg-bg-main">
      {/* Admin Header */}
      <header className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link href="/admin" className="font-heading text-lg font-semibold">
            Leaf Admin
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              Produtos
            </Link>
            <Link
              href="/admin/categories"
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              Categorias
            </Link>
            <Link
              href="/admin/orders"
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              Pedidos
            </Link>
            <Link
              href="/"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              ← Loja
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
    </AdminGuard>
  );
}
