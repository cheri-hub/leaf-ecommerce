"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalCents } = useCart();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-overlay z-50"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-md bg-bg-main z-50 shadow-drawer transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading text-lg font-semibold">
            Meu Carrinho ({items.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-primary/5 transition-colors"
            aria-label="Fechar carrinho"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-text-muted mb-4" />
              <p className="font-heading text-lg font-semibold text-text-main mb-1">
                Seu carrinho está vazio
              </p>
              <p className="text-sm text-text-secondary mb-6">
                Explore nossos produtos e encontre algo especial.
              </p>
              <button
                onClick={onClose}
                className="bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-4 py-3 border-b border-border last:border-0"
                >
                  <div className="w-20 h-20 bg-border rounded-lg overflow-hidden shrink-0">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-sm font-medium text-text-main line-clamp-2 hover:text-primary transition-colors"
                      onClick={onClose}
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm font-bold text-text-main mt-1">
                      {formatCurrency(item.priceInCents)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="p-1 rounded hover:bg-primary/5 disabled:opacity-30 transition-colors"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="p-1 rounded hover:bg-primary/5 transition-colors"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto p-1 text-text-muted hover:text-error transition-colors"
                        aria-label="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-text-secondary">
                Subtotal
              </span>
              <span className="text-lg font-bold text-text-main">
                {formatCurrency(totalCents())}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center text-sm uppercase tracking-wide"
            >
              Finalizar Compra
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
