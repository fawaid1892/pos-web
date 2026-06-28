"use client";

import { useState } from "react";
import { X, CheckCircle2, Printer, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useCartStore } from "@/hooks/useCart";
import { useBranchStore } from "@/hooks/useBranch";
import { formatCurrency, generateInvoice } from "@/lib/utils";

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
  const { items, total, subtotal, discountPercent, setDiscountPercent, clearCart } = useCartStore();
  const activeBranch = useBranchStore((state) => state.activeBranch);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step, setStep] = useState<"payment" | "success">("payment");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  if (!isOpen) return null;

  const changeAmount = Math.max(0, (Number(paymentAmount) || 0) - total());

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
        })),
        payment_method: paymentMethod,
        cash_amount: paymentMethod === "cash" ? Number(paymentAmount) || total() : total(),
        customer_name: customerName.trim() || undefined,
        discount_percent: discountPercent,
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
    setStep("payment");
    setPaymentAmount("");
    setPaymentMethod("cash");
    setCustomerName("");
    setDiscountPercent(0);
    setSubmitError(null);
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
              <CheckCircle2 className="w-8 h-8 text-green-600" />
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
      <div className="bg-background rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold">Pembayaran</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
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
            {discountPercent > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Diskon {discountPercent}% (hemat {formatCurrency(subtotal() - total())})
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
        <div className="p-4 border-t border-border flex gap-3">
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
