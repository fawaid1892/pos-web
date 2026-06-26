"use client";

import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { useCartStore } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CartPanelProps {
  onCheckout: () => void;
}

export function CartPanel({ onCheckout }: CartPanelProps) {
  const {
    items,
    subtotal,
    total,
    discount,
    tax,
    itemCount,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCartStore();

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          <span className="font-semibold">Keranjang</span>
          {itemCount() > 0 && (
            <span className="bg-brand-600 text-white text-xs px-2 py-0.5 rounded-full">
              {itemCount()}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-destructive hover:underline"
          >
            Hapus Semua
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ShoppingCart className="w-12 h-12 mb-2" />
            <p className="text-sm text-center">
              Belum ada item<br />Scan atau cari produk
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.productId}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.productName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(item.price)}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity - 1)
                  }
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-border transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity + 1)
                  }
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-border transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div className="text-right min-w-[70px]">
                <p className="text-sm font-semibold">
                  {formatCurrency(item.subtotal)}
                </p>
              </div>

              <button
                onClick={() => removeItem(item.productId)}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="border-t border-border p-4 space-y-3">
          <div className="space-y-1.5 text-sm">
            <div className={cn("flex justify-between", discount > 0 && "text-muted-foreground")}>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal())}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Diskon</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Pajak</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-brand-600">{formatCurrency(total())}</span>
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={onCheckout}>
            Bayar • {formatCurrency(total())}
          </Button>
        </div>
      )}
    </div>
  );
}
