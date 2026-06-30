/**
 * Hook untuk keranjang belanja (POS Cart)
 * 
 * Menggunakan Zustand agar state persist antar navigasi
 */

import { create } from "zustand";
import type { TransactionItem, AppliedPromotion } from "@/types";

interface CartState {
  items: TransactionItem[];
  discountPercent: number;
  tax: number;
  voucherDiscount: number;
  voucherInfo: { code: string; name: string; value: number; type: string } | null;
  /** Auto-applied promotion discounts from backend */
  autoAppliedPromotions: AppliedPromotion[];
  autoDiscountTotal: number;
  /** Item-level manual discount totals */
  itemDiscountTotal: number;

  // Computed
  subtotal: () => number;
  discountAmount: () => number;
  voucherDiscountAmount: () => number;
  total: () => number;
  itemCount: () => number;

  // Actions
  addItem: (item: Omit<TransactionItem, "subtotal" | "discountPercent">) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  setDiscountPercent: (percent: number) => void;
  setTax: (amount: number) => void;
  setVoucherDiscount: (voucher: { code: string; name: string; value: number; type: string } | null) => void;
  clearVoucher: () => void;
  /** Set per-item manual discount percent */
  updateItemDiscount: (productId: number, discountPercent: number) => void;
  /** Set auto-applied promotions */
  setAutoAppliedPromotions: (promotions: AppliedPromotion[]) => void;
  /** Clear auto-applied promotions */
  clearAutoAppliedPromotions: () => void;
}

/** Recompute itemDiscountTotal from items */
function computeItemDiscountTotal(items: TransactionItem[]): number {
  return items.reduce((sum, item) => {
    if (!item.discountPercent) return sum;
    return sum + Math.round(item.subtotal * (item.discountPercent / 100));
  }, 0);
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discountPercent: 0,
  tax: 0,
  voucherDiscount: 0,
  voucherInfo: null,
  autoAppliedPromotions: [],
  autoDiscountTotal: 0,
  itemDiscountTotal: 0,

  subtotal: () => get().items.reduce((sum, item) => sum + item.subtotal, 0),

  discountAmount: () => {
    const subtotal = get().subtotal();
    const percent = get().discountPercent;
    if (percent <= 0) return 0;
    return Math.round(subtotal * (percent / 100));
  },

  voucherDiscountAmount: () => {
    return get().voucherDiscount;
  },

  total: () => {
    const subtotal = get().subtotal();
    const discount = get().discountAmount();
    const itemDiscount = get().itemDiscountTotal;
    const voucher = get().voucherDiscount;
    const autoDiscount = get().autoDiscountTotal;
    const tax = get().tax;
    return subtotal - discount - itemDiscount - voucher - autoDiscount + tax;
  },

  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  addItem: (item) => {
    const state = get();
    const existing = state.items.find((i) => i.productId === item.productId);

    if (existing) {
      const updated = state.items.map((i) =>
        i.productId === item.productId
          ? {
              ...i,
              quantity: i.quantity + item.quantity,
              subtotal: (i.quantity + item.quantity) * i.price,
            }
          : i
      );
      set({ items: updated, itemDiscountTotal: computeItemDiscountTotal(updated) });
    } else {
      const updated = [
        ...state.items,
        { ...item, subtotal: item.quantity * item.price, discountPercent: 0 },
      ];
      set({ items: updated, itemDiscountTotal: computeItemDiscountTotal(updated) });
    }
  },

  removeItem: (productId) => {
    const updated = get().items.filter((i) => i.productId !== productId);
    set({ items: updated, itemDiscountTotal: computeItemDiscountTotal(updated) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const updated = get().items.map((i) =>
      i.productId === productId
        ? { ...i, quantity, subtotal: quantity * i.price }
        : i
    );
    set({ items: updated, itemDiscountTotal: computeItemDiscountTotal(updated) });
  },

  clearCart: () => set({
    items: [],
    discountPercent: 0,
    tax: 0,
    voucherDiscount: 0,
    voucherInfo: null,
    autoAppliedPromotions: [],
    autoDiscountTotal: 0,
    itemDiscountTotal: 0,
  }),

  setDiscountPercent: (percent) => set({ discountPercent: percent }),
  setTax: (amount) => set({ tax: amount }),

  setVoucherDiscount: (voucher) => {
    if (!voucher) {
      set({ voucherDiscount: 0, voucherInfo: null });
      return;
    }
    const subtotal = get().subtotal();
    let discountValue = 0;
    if (voucher.type === 'persen') {
      discountValue = Math.round(subtotal * (voucher.value / 100));
    } else {
      discountValue = voucher.value;
    }
    set({ voucherDiscount: discountValue, voucherInfo: voucher });
  },

  clearVoucher: () => set({ voucherDiscount: 0, voucherInfo: null }),

  updateItemDiscount: (productId, discountPercent) => {
    const validPercent = Math.max(0, Math.min(100, discountPercent));
    const updated = get().items.map((i) =>
      i.productId === productId
        ? { ...i, discountPercent: validPercent }
        : i
    );
    set({ items: updated, itemDiscountTotal: computeItemDiscountTotal(updated) });
  },

  setAutoAppliedPromotions: (promotions) => {
    const total = promotions.reduce((sum, p) => sum + p.discountValue, 0);
    set({ autoAppliedPromotions: promotions, autoDiscountTotal: total });
  },

  clearAutoAppliedPromotions: () => set({ autoAppliedPromotions: [], autoDiscountTotal: 0 }),
}));
