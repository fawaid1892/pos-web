/**
 * Auto-apply active promotions to cart items.
 * 
 * Supports: bundling, potongan_harga, buy_x_get_y, min_purchase.
 * Voucher-type promotions are excluded (handled manually via voucher input).
 */
import type { Promotion, TransactionItem, AppliedPromotion } from "@/types";

export function autoApplyPromotions(
  items: TransactionItem[],
  activePromotions: Promotion[]
): AppliedPromotion[] {
  const result: AppliedPromotion[] = [];
  if (!items.length || !activePromotions.length) return result;

  // ─── potongan_harga: fixed discount on matching products ──────
  const potongan = activePromotions.filter((p) => p.type === "potongan_harga");
  for (const promo of potongan) {
    // If sku_target is set, only apply to that product; otherwise apply to all items
    if (promo.sku_target) {
      const matchingItem = items.find(
        (item) => item.productName.toLowerCase().includes(promo.sku_target!.toLowerCase())
      );
      if (matchingItem) {
        const discount = promo.discount_type === "persen"
          ? Math.round(matchingItem.subtotal * (promo.discount_value / 100))
          : promo.discount_value;
        result.push({
          promotionId: promo.id,
          promotionName: promo.name,
          type: promo.type,
          discountValue: discount,
          description: promo.discount_type === "persen"
            ? `Diskon ${promo.discount_value}% pada ${matchingItem.productName}`
            : `Diskon ${promo.discount_value} pada ${matchingItem.productName}`,
        });
      }
    } else {
      // Apply to all items
      const discount = promo.discount_type === "persen"
        ? Math.round(items.reduce((s, i) => s + i.subtotal, 0) * (promo.discount_value / 100))
        : promo.discount_value;
      result.push({
        promotionId: promo.id,
        promotionName: promo.name,
        type: promo.type,
        discountValue: discount,
        description: promo.discount_type === "persen"
          ? `Diskon ${promo.discount_value}% seluruh item`
          : `Diskon ${promo.discount_value} seluruh item`,
      });
    }
  }

  // ─── min_purchase: discount if total is above qty_min ──────────
  const minPurchases = activePromotions.filter((p) => p.type === "min_purchase");
  const grossTotal = items.reduce((s, i) => s + i.subtotal, 0);
  for (const promo of minPurchases) {
    if (grossTotal >= promo.qty_min) {
      const discount = promo.discount_type === "persen"
        ? Math.round(grossTotal * (promo.discount_value / 100))
        : promo.discount_value;
      result.push({
        promotionId: promo.id,
        promotionName: promo.name,
        type: promo.type,
        discountValue: discount,
        description: `Min. belanja ${promo.qty_min}`,
      });
    }
  }

  // ─── bundling: discount when buying specific quantities ─────────
  const bundling = activePromotions.filter((p) => p.type === "bundling");
  for (const promo of bundling) {
    if (promo.sku_target) {
      const targetItem = items.find(
        (item) => item.productName.toLowerCase().includes(promo.sku_target!.toLowerCase())
      );
      if (targetItem && targetItem.quantity >= promo.qty_min) {
        const bundleCount = Math.floor(targetItem.quantity / promo.qty_min);
        const discount = promo.discount_type === "persen"
          ? Math.round(targetItem.price * promo.qty_min * (promo.discount_value / 100) * bundleCount)
          : promo.discount_value * bundleCount;
        result.push({
          promotionId: promo.id,
          promotionName: promo.name,
          type: promo.type,
          discountValue: discount,
          description: `Paket ${promo.qty_min} ${targetItem.productName}`,
        });
      }
    } else {
      // Bundling without specific sku — generic bundle discount
      const totalQty = items.reduce((s, i) => s + i.quantity, 0);
      if (totalQty >= promo.qty_min) {
        const bundleCount = Math.floor(totalQty / promo.qty_min);
        const discount = promo.discount_type === "persen"
          ? Math.round(grossTotal * (promo.discount_value / 100) * bundleCount)
          : promo.discount_value * bundleCount;
        result.push({
          promotionId: promo.id,
          promotionName: promo.name,
          type: promo.type,
          discountValue: discount,
          description: `Bundling ${promo.qty_min} item`,
        });
      }
    }
  }

  // ─── buy_x_get_y: buy X get Y free ─────────────────────────────
  const buyXGetY = activePromotions.filter((p) => p.type === "buy_x_get_y");
  for (const promo of buyXGetY) {
    if (promo.sku_target && promo.qty_free > 0) {
      const targetItem = items.find(
        (item) => item.productName.toLowerCase().includes(promo.sku_target!.toLowerCase())
      );
      if (targetItem && targetItem.quantity >= promo.qty_min) {
        const eligibleSets = Math.floor(targetItem.quantity / promo.qty_min);
        const freeQty = eligibleSets * promo.qty_free;
        const discount = freeQty * targetItem.price;
        result.push({
          promotionId: promo.id,
          promotionName: promo.name,
          type: promo.type,
          discountValue: discount,
          description: `Beli ${promo.qty_min} gratis ${promo.qty_free} ${targetItem.productName}`,
        });
      }
    }
  }

  return result;
}
