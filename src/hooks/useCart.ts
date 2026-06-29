/**
 * Hook untuk keranjang belanja (POS Cart)
 * 
 * Menggunakan Zustand agar state persist antar navigasi
 */

import { create } from "zustand";
import type { TransactionItem } from "@/types";

interface CartState {
  items: TransactionItem[];
  discountPercent: number;
  tax: number;
  voucherDiscount: number;
  voucherInfo: { code: string; name: string; value: number; type: string } | null;

  // Computed
  subtotal: () => number;
  discountAmount: () => number;
  voucherDiscountAmount: () => number;
  total: () => number;
  itemCount: () => number;

  // Actions
  addItem: (item: Omit<TransactionItem, "subtotal">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setDiscountPercent: (percent: number) => void;
  setTax: (amount: number) => void;
  setVoucherDiscount: (voucher: { code: string; name: string; value: number; type: string } | null) => void;
  clearVoucher: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discountPercent: 0,
  tax: 0,
  voucherDiscount: 0,
  voucherInfo: null,

  subtotal: () => get().items.reduce((sum, item) => sum + item.subtotal, 0),

  discountAmount: () => {
    const subtotal = get().subtotal();
    const percent = get().discountPercent;
    return Math.round(subtotal * (percent / 100));
  },

  voucherDiscountAmount: () => {
    return get().voucherDiscount;
  },

  total: () => {
    const subtotal = get().subtotal();
    const discount = get().discountAmount();
    const voucher = get().voucherDiscount;
    const tax = get().tax;
    return subtotal - discount - voucher + tax;
  },

  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  addItem: (item) => {
    const state = get();
    const existing = state.items.find((i) => i.productId === item.productId);

    if (existing) {
      set({
        items: state.items.map((i) =>
          i.productId === item.productId
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
                subtotal: (i.quantity + item.quantity) * i.price,
              }
            : i
        ),
      });
    } else {
      set({
        items: [
          ...state.items,
          { ...item, subtotal: item.quantity * item.price },
        ],
      });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.productId !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.productId === productId
          ? { ...i, quantity, subtotal: quantity * i.price }
          : i
      ),
    });
  },

  clearCart: () => set({ items: [], discountPercent: 0, tax: 0, voucherDiscount: 0, voucherInfo: null }),

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
}));
