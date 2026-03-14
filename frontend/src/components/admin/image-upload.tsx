"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { ProductImage } from "@/types";

interface ImageUploadProps {
  productId: string;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
}

export function ImageUpload({ productId, images, onImagesChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const uploaded = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5228"}/api/products/${productId}/images`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );

        if (!uploaded.ok) {
          throw new Error("Erro ao fazer upload da imagem");
        }

        const newImage = (await uploaded.json()) as ProductImage;
        onImagesChange([...images, newImage]);
      }
      toast.success("Imagem(ns) enviada(s) com sucesso");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao enviar imagem"
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove(imageId: string) {
    try {
      await api(`/api/products/${productId}/images/${imageId}`, {
        method: "DELETE",
      });
      onImagesChange(images.filter((img) => img.id !== imageId));
      toast.success("Imagem removida");
    } catch {
      toast.error("Erro ao remover imagem");
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-text-main mb-2">
        Imagens do Produto
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {images.map((img, i) => (
          <div
            key={img.id}
            className="relative aspect-square rounded-lg overflow-hidden bg-secondary/20 border border-border group"
          >
            <Image
              src={img.url}
              alt={img.altText ?? `Imagem ${i + 1}`}
              fill
              sizes="120px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(img.id)}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-error text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remover imagem"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1.5 left-1.5 text-[10px] font-medium bg-primary text-white px-1.5 py-0.5 rounded">
                Principal
              </span>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square rounded-lg border-2 border-dashed border-border-strong hover:border-primary flex flex-col items-center justify-center gap-1.5 text-text-muted hover:text-primary transition-colors disabled:opacity-50"
        >
          <Upload className="w-5 h-5" />
          <span className="text-xs font-medium">
            {uploading ? "Enviando..." : "Adicionar"}
          </span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-text-muted">
        JPEG, PNG ou WebP. A primeira imagem será a principal.
      </p>
    </div>
  );
}
