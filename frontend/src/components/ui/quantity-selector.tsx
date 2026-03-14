"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  max?: number;
  min?: number;
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  max = 99,
  min = 1,
}: QuantitySelectorProps) {
  return (
    <div className="flex items-center border border-border-strong rounded-lg">
      <button
        onClick={() => onQuantityChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className="p-2 hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-l-lg"
        aria-label="Diminuir quantidade"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="min-w-[40px] text-center text-sm font-medium tabular-nums">
        {quantity}
      </span>
      <button
        onClick={() => onQuantityChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="p-2 hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-r-lg"
        aria-label="Aumentar quantidade"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
