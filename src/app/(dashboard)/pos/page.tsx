"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/pos/product-grid";
import { CartPanel } from "@/components/pos/cart-panel";
import { CheckoutModal } from "@/components/pos/checkout-modal";
import { useCartStore } from "@/hooks/useCart";
import type { Product } from "@/types";

export default function POSPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { addItem } = useCartStore();

  const handleSelectProduct = (product: Product) => {
    addItem({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      price: product.price,
    });
  };

  return (
    <div className="flex h-full">
      {/* Left — Product Grid */}
      <div className="flex-1">
        <ProductGrid onSelectProduct={handleSelectProduct} />
      </div>

      {/* Right — Cart Panel */}
      <div className="w-[380px] hidden lg:block">
        <CartPanel onCheckout={() => setCheckoutOpen(true)} />
      </div>

      {/* Mobile Cart Button */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-30">
        <MobileCartButton onCheckout={() => setCheckoutOpen(true)} />
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  );
}

/** Mobile floating cart button */
function MobileCartButton({ onCheckout }: { onCheckout: () => void }) {
  const { items, total, itemCount } = useCartStore();

  if (items.length === 0) return null;

  return (
    <button
      onClick={onCheckout}
      className="w-full bg-brand-600 text-white py-4 px-6 rounded-2xl shadow-lg flex items-center justify-between font-medium text-lg active:scale-[0.98] transition-transform"
    >
      <span>
        🛒 {itemCount()} item
      </span>
      <span>Rp {total().toLocaleString("id-ID")}</span>
    </button>
  );
}
