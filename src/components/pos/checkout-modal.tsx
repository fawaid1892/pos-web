"use client";

import { useState, useEffect, useCallback } from "react";
import { X, CheckCircle, Printer, Loader, Percent, Ticket, Tag } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useCartStore } from "@/hooks/useCart";
import { useBranchStore } from "@/hooks/useBranch";
import { formatCurrency, generateInvoice } from "@/lib/utils";
import { autoApplyPromotions } from "@/lib/auto-apply-promotions";
import type { Promotion } from "@/types";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = "cash" | "qris" | "debit" | "ewallet";

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "💵 Tunai" },
  { value: "qris", label: "📱 QRIS" },
  { value: "debit", label: "💳 Debit" },
  { value: "ewallet", label: "📲 E-Wallet" },
];

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const {
    items,
    total,
    subtotal,
    discountPercent,
    setDiscountPercent,
    clearCart,
    voucherInfo,
    setVoucherDiscount,
    clearVoucher,
    itemDiscountTotal,
    autoAppliedPromotions,
    autoDiscountTotal,
    setAutoAppliedPromotions,
    clearAutoAppliedPromotions,
  } = useCartStore();
  const activeBranch = useBranchStore((state) => state.activeBranch);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step, setStep] = useState<"payment" | "success">("payment");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  // Voucher state
  const [voucherCode, setVoucherCode] = useState("");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  // Active promotions
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);

  // Auto-apply promotions whenever cart items or activePromotions change
  const applyPromotions = useCallback(() => {
    if (!activePromotions.length || !items.length) {
      clearAutoAppliedPromotions();
      return;
    }
    const applied = autoApplyPromotions(items, activePromotions);
    setAutoAppliedPromotions(applied);
  }, [items, activePromotions, setAutoAppliedPromotions, clearAutoAppliedPromotions]);

  // Fetch active promotions
  useEffect(() => {
    if (!isOpen) return;
    async function fetchActivePromotions() {
      setLoadingPromotions(true);
      try {
        const res = await fetch("/api/promotions/active");
        if (res.ok) {
          const json = await res.json();
          const data = json?.data ?? json ?? [];
          setActivePromotions(Array.isArray(data) ? data : []);
        }
      } catch {
        // Silently fail - promotions are optional
      } finally {
        setLoadingPromotions(false);
      }
    }
    fetchActivePromotions();
  }, [isOpen]);

  // Auto-apply when promotions are loaded or items change
  useEffect(() => {
    applyPromotions();
  }, [activePromotions, items, applyPromotions]);

  // Reset voucher input when modal opens
  useEffect(() => {
    if (isOpen) {
      setVoucherCode("");
      setVoucherError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const changeAmount = Math.max(0, (Number(paymentAmount) || 0) - total());

  const handleValidateVoucher = async () => {
    const code = voucherCode.trim();
    if (!code) return;

    setIsValidatingVoucher(true);
    setVoucherError(null);

    try {
      const res = await fetch("/api/promotions/validate-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const json = await res.json();
      const data = json?.data ?? json;

      if (!res.ok || !data?.valid) {
        setVoucherError(data?.error || "Kode voucher tidak valid");
        clearVoucher();
        return;
      }

      setVoucherDiscount({
        code,
        name: data.promotion_name || code,
        value: data.discount_value || 0,
        type: data.discount_type || "nominal",
      });
    } catch {
      setVoucherError("Gagal memvalidasi voucher. Periksa koneksi.");
      clearVoucher();
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    clearVoucher();
    setVoucherCode("");
    setVoucherError(null);
  };

  const handlePay = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        branch_id: activeBranch?.id ?? "",
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
          discount_percent: item.discountPercent || 0,
        })),
        payment_method: paymentMethod,
        cash_amount: paymentMethod === "cash" ? Number(paymentAmount) || total() : total(),
        customer_name: customerName.trim() || undefined,
        discount_percent: discountPercent,
        voucher_code: voucherInfo?.code || undefined,
        auto_promotions: autoAppliedPromotions.map((p) => ({
          promotion_id: p.promotionId,
          promotion_name: p.promotionName,
          discount_value: p.discountValue,
        })),
      };

      const res = await fetch("/api/transactions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Gagal memproses pembayaran");
      }

      const data = await res.json();
      setInvoiceNumber(data?.invoice || generateInvoice(activeBranch?.code || "PST"));
      setStep("success");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewTransaction = () => {
    clearCart();
    clearAutoAppliedPromotions();
    setStep("payment");
    setPaymentAmount("");
    setPaymentMethod("cash");
    setCustomerName("");
    setDiscountPercent(0);
    setSubmitError(null);
    setVoucherCode("");
    setVoucherError(null);
    clearVoucher();
    onClose();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSubmitError(null);
      onClose();
    }
  };

  if (step === "success") {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl w-full max-w-md p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold">Pembayaran Berhasil! ✅</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {invoiceNumber}
            </p>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Dibayar</span>
              <span className="font-semibold">{formatCurrency(total())}</span>
            </div>
            {paymentMethod === "cash" && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kembalian</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(changeAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode</span>
              <span className="font-medium">
                {paymentMethods.find((m) => m.value === paymentMethod)?.label}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {}}
            >
              <Printer className="w-4 h-4 mr-2" />
              Cetak Struk
            </Button>
            <Button
              className="flex-1"
              onClick={handleNewTransaction}
            >
              Transaksi Baru
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="text-lg font-bold">Pembayaran</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Customer Name */}
          <Input
            label="Nama Pelanggan (opsional)"
            type="text"
            placeholder="Masukkan nama pelanggan..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            disabled={isSubmitting}
          />

          {/* Discount Percent */}
          <Input
            label="Diskon (%)"
            type="number"
            min={0}
            max={100}
            placeholder="0"
            value={discountPercent || ""}
            onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
            disabled={isSubmitting}
          />

          {/* ─── Active Promotions ─────────────────────────────────── */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Percent className="w-4 h-4" />
              Promosi Aktif
            </label>
            {loadingPromotions ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader className="w-4 h-4 animate-spin" />
                Memuat promosi...
              </div>
            ) : activePromotions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Tidak ada promosi aktif saat ini
              </p>
            ) : (
              <div className="space-y-2">
                {activePromotions.slice(0, 3).map((promo) => {
                  const isApplied = autoAppliedPromotions.some(
                    (a) => a.promotionId === promo.id
                  );
                  return (
                    <div
                      key={promo.id}
                      className={`flex items-center gap-2 p-2.5 rounded-lg text-sm ${
                        isApplied
                          ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                          : "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                      }`}
                    >
                      <Tag className={`w-4 h-4 shrink-0 ${
                        isApplied ? "text-green-600" : "text-blue-600"
                      }`} />
                      <span className={`flex-1 ${
                        isApplied
                          ? "text-green-700 dark:text-green-300"
                          : "text-blue-700 dark:text-blue-300"
                      }`}>
                        {promo.name}
                      </span>
                      <span className={`text-xs font-medium ${
                        isApplied
                          ? "text-green-600 dark:text-green-400"
                          : "text-blue-600 dark:text-blue-400"
                      }`}>
                        {promo.discount_type === "persen"
                          ? `${promo.discount_value}%`
                          : formatCurrency(promo.discount_value)}
                        {isApplied && " ✓"}
                      </span>
                    </div>
                  );
                })}
                {activePromotions.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{activePromotions.length - 3} promosi lainnya
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ─── Voucher Code ─────────────────────────────────────── */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Kode Voucher
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Masukkan kode voucher..."
                value={voucherCode}
                onChange={(e) => {
                  setVoucherCode(e.target.value);
                  if (voucherError) setVoucherError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleValidateVoucher();
                }}
                disabled={isSubmitting || isValidatingVoucher || !!voucherInfo}
                className="flex-1 h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              {voucherInfo ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveVoucher}
                  className="shrink-0 text-destructive hover:text-destructive"
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleValidateVoucher}
                  loading={isValidatingVoucher}
                  disabled={!voucherCode.trim() || isSubmitting}
                  className="shrink-0"
                >
                  Cek
                </Button>
              )}
            </div>

            {/* Voucher result */}
            {voucherInfo && (
              <div className="mt-2 p-2.5 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                <span className="text-green-700 dark:text-green-300 flex-1">
                  {voucherInfo.name}
                </span>
                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                  Diskon: {voucherInfo.type === "persen"
                    ? `${voucherInfo.value}%`
                    : formatCurrency(voucherInfo.value)}
                </span>
              </div>
            )}

            {voucherError && (
              <p className="mt-1 text-xs text-destructive">{voucherError}</p>
            )}
          </div>

          {/* Payment Methods */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  disabled={isSubmitting}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                    paymentMethod === method.value
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-700"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Pembayaran</p>
            <p className="text-3xl font-bold text-brand-600">
              {formatCurrency(total())}
            </p>
            {itemDiscountTotal > 0 && (
              <p className="text-xs text-destructive mt-1">
                Diskon item: hemat {formatCurrency(itemDiscountTotal)}
              </p>
            )}
            {discountPercent > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Diskon {discountPercent}% (hemat {formatCurrency(subtotal() - (subtotal() * discountPercent / 100))})
              </p>
            )}
            {autoDiscountTotal > 0 && (
              <p className="text-xs text-blue-600 mt-0.5">
                Promo otomatis: hemat {formatCurrency(autoDiscountTotal)}
              </p>
            )}
            {autoAppliedPromotions.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {autoAppliedPromotions.map((p) => (
                  <p key={p.promotionId} className="text-[11px] text-blue-500">
                    {p.promotionName}: -{formatCurrency(p.discountValue)}
                  </p>
                ))}
              </div>
            )}
            {voucherInfo && (
              <p className="text-xs text-green-600 mt-0.5">
                Voucher: hemat {formatCurrency(
                  voucherInfo.type === "persen"
                    ? Math.round(subtotal() * (voucherInfo.value / 100))
                    : voucherInfo.value
                )}
              </p>
            )}
          </div>

          {/* Cash input */}
          {paymentMethod === "cash" && (
            <Input
              label="Jumlah Dibayar"
              type="number"
              placeholder="Masukkan jumlah uang..."
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              disabled={isSubmitting}
            />
          )}

          {/* Change */}
          {paymentMethod === "cash" && Number(paymentAmount) >= total() && (
            <div className="flex justify-between items-center p-3 rounded-xl bg-muted">
              <span className="text-sm font-medium">Kembalian</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(changeAmount)}
              </span>
            </div>
          )}

          {/* Error */}
          {submitError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive font-medium">
              {submitError}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border flex gap-3 shrink-0">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            className="flex-1"
            size="lg"
            onClick={handlePay}
            loading={isSubmitting}
            disabled={
              paymentMethod === "cash" && Number(paymentAmount) < total()
            }
          >
            {isSubmitting ? "Memproses..." : `Bayar ${formatCurrency(total())}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
