"use client";

import { Trash2, Minus, Plus, ShoppingCart, Percent } from "lucide-react";
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
    discountPercent,
    discountAmount,
    tax,
    itemCount,
    removeItem,
    updateQuantity,
    clearCart,
    updateItemDiscount,
    itemDiscountTotal,
    autoAppliedPromotions,
    autoDiscountTotal,
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
          items.map((item) => {
            const itemDisc = item.discountPercent || 0;
            const itemDiscAmount = itemDisc > 0 ? Math.round(item.subtotal * itemDisc / 100) : 0;
            const effectiveTotal = item.subtotal - itemDiscAmount;

            return (
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
                  {/* Item-level discount input */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <Percent className="w-3 h-3 text-muted-foreground shrink-0" />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="0"
                      value={itemDisc || ""}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                        updateItemDiscount(item.productId, val);
                      }}
                      className="w-16 h-6 text-xs rounded border border-input bg-background px-1.5 py-0.5 text-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <span className="text-[10px] text-muted-foreground">%</span>
                    {itemDiscAmount > 0 && (
                      <span className="text-[10px] text-destructive font-medium ml-auto">
                        -{formatCurrency(itemDiscAmount)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1">
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
                  {itemDiscAmount > 0 ? (
                    <>
                      <p className="text-sm font-semibold text-destructive">
                        {formatCurrency(effectiveTotal)}
                      </p>
                      <p className="text-[10px] text-muted-foreground line-through">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-semibold">
                      {formatCurrency(item.subtotal)}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="border-t border-border p-4 space-y-3">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal())}</span>
            </div>
            {itemDiscountTotal > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Diskon Item</span>
                <span>-{formatCurrency(itemDiscountTotal)}</span>
              </div>
            )}
            {discountPercent > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Diskon ({discountPercent}%)</span>
                <span>-{formatCurrency(discountAmount())}</span>
              </div>
            )}
            {autoDiscountTotal > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Promo Otomatis</span>
                <span>-{formatCurrency(autoDiscountTotal)}</span>
              </div>
            )}
            {autoAppliedPromotions.length > 0 && (
              <div className="space-y-0.5">
                {autoAppliedPromotions.map((p) => (
                  <p key={p.promotionId} className="text-[10px] text-blue-500 flex justify-between">
                    <span>{p.promotionName}</span>
                    <span>-{formatCurrency(p.discountValue)}</span>
                  </p>
                ))}
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
