"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    onClose();
    setQuery("");
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-overlay z-50" onClick={onClose} />
      <div className="fixed top-0 left-0 right-0 z-50 bg-bg-main shadow-dropdown">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="O que você está procurando?"
              className="w-full bg-white border border-border-strong rounded-lg pl-12 pr-12 py-4 text-base placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-primary/5 transition-colors"
              aria-label="Fechar busca"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </form>
          <p className="text-xs text-text-muted mt-3 text-center">
            Pressione Enter para buscar ou Esc para fechar
          </p>
        </div>
      </div>
    </>
  );
}
