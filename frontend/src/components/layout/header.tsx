"use client";

import Link from "next/link";
import { Search, User, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { SITE_NAME, NAV_LINKS } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchModal } from "@/components/layout/search-modal";
import { api } from "@/lib/api";
import type { Category } from "@/types";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = useCart().totalItems();
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    api<Category[]>("/api/categories")
      .then((cats) => setCategories(cats.filter((c) => c.isActive)))
      .catch(() => {});
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          scrolled
            ? "bg-bg-main/90 backdrop-blur-md shadow-sm"
            : "bg-bg-main"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-full hover:bg-primary/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="font-heading text-xl font-semibold text-primary tracking-tight"
            >
              {SITE_NAME}
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) =>
                link.href === "/products" ? (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setMegaOpen(true)}
                    onMouseLeave={() => setMegaOpen(false)}
                  >
                    <Link
                      href={link.href}
                      className="text-sm font-medium tracking-wide uppercase text-text-main hover:text-primary transition-colors duration-200 flex items-center gap-1"
                    >
                      {link.label}
                      {categories.length > 0 && (
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`} />
                      )}
                    </Link>

                    {/* Mega menu dropdown */}
                    {megaOpen && categories.length > 0 && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                        <div className="bg-white rounded-lg shadow-dropdown border border-border p-6 min-w-[320px]">
                          <p className="text-xs uppercase tracking-wide text-text-muted font-medium mb-3">
                            Categorias
                          </p>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                            {categories.map((cat) => (
                              <Link
                                key={cat.id}
                                href={`/products?category=${cat.slug}`}
                                className="text-sm text-text-main hover:text-primary transition-colors py-1.5"
                                onClick={() => setMegaOpen(false)}
                              >
                                {cat.name}
                              </Link>
                            ))}
                          </div>
                          <hr className="border-border my-3" />
                          <Link
                            href="/products"
                            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                            onClick={() => setMegaOpen(false)}
                          >
                            Ver todos os produtos →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium tracking-wide uppercase text-text-main hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full hover:bg-primary/5 transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>
              <div
                className="relative flex items-center"
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <Link
                  href={user ? "/profile" : "/login"}
                  className={`p-2 rounded-full hover:bg-primary/5 transition-colors inline-flex ${user ? "text-primary" : "text-text-main"}`}
                  aria-label={user ? "Minha conta" : "Entrar"}
                >
                  <User className="w-5 h-5" />
                </Link>
                {user && userMenuOpen && (
                  <div className="absolute top-full right-0 pt-2 z-50">
                    <div className="bg-white rounded-lg shadow-dropdown border border-border py-2 min-w-[180px]">
                      <p className="px-4 py-1.5 text-sm font-medium text-text-main">{user.fullName.split(" ")[0]}</p>
                      <hr className="border-border my-1" />
                      <Link href="/profile" className="block px-4 py-2 text-sm text-text-main hover:bg-primary/5 transition-colors" onClick={() => setUserMenuOpen(false)}>Minha Conta</Link>
                      <Link href="/wishlist" className="block px-4 py-2 text-sm text-text-main hover:bg-primary/5 transition-colors" onClick={() => setUserMenuOpen(false)}>Meus Favoritos</Link>
                      <Link href="/orders" className="block px-4 py-2 text-sm text-text-main hover:bg-primary/5 transition-colors" onClick={() => setUserMenuOpen(false)}>Meus Pedidos</Link>
                      {user.roles?.includes("Admin") && (
                        <Link href="/admin" className="block px-4 py-2 text-sm text-text-main hover:bg-primary/5 transition-colors" onClick={() => setUserMenuOpen(false)}>Painel Admin</Link>
                      )}
                      <hr className="border-border my-1" />
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors"
                      >Sair</button>
                    </div>
                  </div>
                )}
              </div>
              <button
                className="p-2 rounded-full hover:bg-primary/5 transition-colors relative"
                onClick={() => setCartOpen(true)}
                aria-label="Carrinho"
              >
                <ShoppingBag className="w-5 h-5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile sidebar */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-overlay z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <nav className="fixed top-0 left-0 bottom-0 w-72 bg-bg-main z-50 shadow-drawer p-6 lg:hidden">
              <div className="flex items-center justify-between mb-8">
                <span className="font-heading text-lg font-semibold text-primary">
                  {SITE_NAME}
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-full hover:bg-primary/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium tracking-wide uppercase text-text-main hover:text-primary transition-colors py-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {categories.length > 0 && (
                  <>
                    <hr className="border-border my-1" />
                    <p className="text-xs uppercase tracking-wide text-text-muted font-medium">
                      Categorias
                    </p>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug}`}
                        className="text-sm text-text-main hover:text-primary transition-colors py-1 pl-2"
                        onClick={() => setMobileOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </>
                )}
                <hr className="border-border my-2" />
                <hr className="border-border my-1" />
                {user ? (
                  <>
                    <Link href="/profile" className="text-sm font-medium text-text-main hover:text-primary transition-colors py-2" onClick={() => setMobileOpen(false)}>Minha Conta</Link>
                    <Link href="/wishlist" className="text-sm font-medium text-text-main hover:text-primary transition-colors py-2" onClick={() => setMobileOpen(false)}>Meus Favoritos</Link>
                    <Link href="/orders" className="text-sm font-medium text-text-main hover:text-primary transition-colors py-2" onClick={() => setMobileOpen(false)}>Meus Pedidos</Link>
                    {user.roles?.includes("Admin") && (
                      <Link href="/admin" className="text-sm font-medium text-text-main hover:text-primary transition-colors py-2" onClick={() => setMobileOpen(false)}>Painel Admin</Link>
                    )}
                    <button onClick={() => { logout(); setMobileOpen(false); }} className="text-left text-sm font-medium text-error hover:text-error/80 transition-colors py-2">Sair</button>
                  </>
                ) : (
                  <Link href="/login" className="text-sm font-medium text-text-main hover:text-primary transition-colors py-2" onClick={() => setMobileOpen(false)}>Entrar / Cadastrar</Link>
                )}
              </div>
            </nav>
          </>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
