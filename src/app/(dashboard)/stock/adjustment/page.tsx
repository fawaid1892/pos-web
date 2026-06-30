"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAdjustStock } from "@/hooks/useInventoryQuery";
import { useProducts } from "@/hooks/useProductsQuery";
import { useBranchStore } from "@/hooks/useBranch";
import {
  ArrowUp,
  ArrowLeft,
  Search,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StockAdjustmentPage() {
  const router = useRouter();
  const { activeBranch } = useBranchStore();
  const { data: products = [] } = useProducts();
  const adjustMutation = useAdjustStock();

  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [type, setType] = useState<"in" | "out">("in");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProductDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const filteredProducts = products.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.barcode || "").toLowerCase().includes(productSearch.toLowerCase())
  );

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedProductId) {
      newErrors.product = "Produk harus dipilih";
    }

    const qty = Number(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) {
      newErrors.quantity = "Jumlah harus lebih dari 0";
    }

    if (type === "out" && selectedProduct && qty > selectedProduct.stock) {
      newErrors.quantity = "Stok tidak mencukupi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await adjustMutation.mutateAsync({
        productId: selectedProductId!,
        type,
        quantity: Number(quantity),
        notes: notes || undefined,
      });
      router.push("/stock");
    } catch {
      // error handled by mutation
    }
  };

  const handleProductSelect = (productId: number) => {
    setSelectedProductId(productId);
    setShowProductDropdown(false);
    setProductSearch("");
    setErrors((prev) => ({ ...prev, product: "" }));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/stock")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ArrowUp className="w-5 h-5" />
              Adjustment Stok
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeBranch
                ? `Sesuaikan stok untuk ${activeBranch.name}`
                : "Pilih cabang terlebih dahulu"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
          {/* Product Selector */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Produk <span className="text-destructive">*</span>
            </label>
            {selectedProduct ? (
              <div className="flex items-center justify-between h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedProduct.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {selectedProduct.barcode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProductId(null);
                    setProductSearch("");
                  }}
                  className="text-muted-foreground hover:text-foreground text-lg leading-none"
                >
                  &times;
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Cari produk..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            )}
            {errors.product && (
              <p className="mt-1 text-xs text-destructive">{errors.product}</p>
            )}

            {/* Product Dropdown */}
            {showProductDropdown && !selectedProduct && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                    Produk tidak ditemukan
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleProductSelect(product.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-accent text-left"
                    >
                      <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        {product.barcode && (
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            {product.barcode}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        Stok: {product.stock}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Type Radio */}
          <fieldset>
            <legend className="block text-sm font-medium text-foreground mb-2">
              Tipe <span className="text-destructive">*</span>
            </legend>
            <div className="flex gap-4">
              <label
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm",
                  type === "in"
                    ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                    : "border-input hover:bg-accent"
                )}
              >
                <input
                  type="radio"
                  name="type"
                  value="in"
                  checked={type === "in"}
                  onChange={() => setType("in")}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    type === "in"
                      ? "border-green-500"
                      : "border-muted-foreground"
                  )}
                >
                  {type === "in" && (
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                </div>
                Stok Masuk
              </label>
              <label
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm",
                  type === "out"
                    ? "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                    : "border-input hover:bg-accent"
                )}
              >
                <input
                  type="radio"
                  name="type"
                  value="out"
                  checked={type === "out"}
                  onChange={() => setType("out")}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    type === "out"
                      ? "border-red-500"
                      : "border-muted-foreground"
                  )}
                >
                  {type === "out" && (
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                  )}
                </div>
                Stok Keluar
              </label>
            </div>
          </fieldset>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Jumlah <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setErrors((prev) => ({ ...prev, quantity: "" }));
              }}
              placeholder="Masukkan jumlah"
              className={cn(
                "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                errors.quantity && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-destructive">{errors.quantity}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Catatan
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opsional: alasan adjustment"
              rows={3}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/stock")}
            >
              Batal
            </Button>
            <Button
              type="submit"
              loading={adjustMutation.isPending}
              disabled={!activeBranch}
            >
              {type === "in" ? "Tambah Stok" : "Kurangi Stok"}
            </Button>
          </div>

          {/* Error Banner */}
          {adjustMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {adjustMutation.error instanceof Error
                ? adjustMutation.error.message
                : "Gagal melakukan adjustment stok"}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
