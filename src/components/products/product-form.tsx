"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategories, useCreateProduct, useUpdateProduct } from "@/hooks/useProductsQuery";
import type { Product } from "@/types";
import { X } from "lucide-react";

const UNIT_OPTIONS = [
  "PCS", "CUP", "KG", "GRAM", "ML", "LITER", "BOTOL", "PAX", "PAKET", "METER",
] as const;

interface FormFields {
  name: string;
  code: string;
  unit: string;
  price: string;
  cost_price: string;
  category_id: string;
  stock: string;
}

interface ProductFormModalProps {
  mode: "create" | "edit";
  product?: Product;
  open?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function ProductFormModal({
  mode,
  product,
  open = true,
  onClose,
  onCancel,
  onSuccess,
}: ProductFormModalProps) {
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [form, setForm] = useState<FormFields>({
    name: "",
    code: "",
    unit: "PCS",
    price: "",
    cost_price: "",
    category_id: "",
    stock: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && product) {
      setForm({
        name: product.name || "",
        code: product.code || "",
        unit: product.unit || "PCS",
        price: String(product.price ?? ""),
        cost_price: String(product.costPrice ?? ""),
        category_id: product.categoryId || "",
        stock: String(product.stock ?? "0"),
      });
    } else {
      setForm({
        name: "",
        code: "",
        unit: "PCS",
        price: "",
        cost_price: "",
        category_id: "",
        stock: "0",
      });
    }
    setErrors({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, product, open]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Nama produk wajib diisi";
    if (!form.price || Number(form.price) <= 0) next.price = "Harga jual harus diisi dan lebih dari 0";
    if (!form.stock || Number(form.stock) < 0) next.stock = "Stok harus diisi dan tidak boleh negatif";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      code: form.code.trim() || undefined,
      unit: form.unit || "PCS",
      price: Number(form.price),
      cost_price: form.cost_price ? Number(form.cost_price) : undefined,
      category_id: form.category_id || undefined,
      stock: Number(form.stock),
    };

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(payload as any);
      } else if (product) {
        await updateMutation.mutateAsync({ id: product.id, data: payload as any });
      }
      onSuccess?.();
      onClose?.();
    } catch {
      // error handled by mutation
    }
  };

  const updateField = (key: keyof FormFields, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <Input
        id="name"
        label="Nama Produk *"
        placeholder="Masukkan nama produk"
        value={form.name}
        onChange={(e) => updateField("name", e.target.value)}
        error={errors.name}
      />

      {/* Kode Barang (SKU) */}
      <Input
        id="code"
        label="Kode Barang (SKU)"
        placeholder="Kosongkan untuk auto-generate"
        value={form.code}
        onChange={(e) => updateField("code", e.target.value)}
        error={errors.code}
      />

      {/* Satuan */}
      <div className="w-full">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Satuan
        </label>
        <select
          value={form.unit}
          onChange={(e) => updateField("unit", e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {UNIT_OPTIONS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>

      {/* Price & Cost Price */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="price"
          label="Harga Jual *"
          type="number"
          placeholder="0"
          value={form.price}
          onChange={(e) => updateField("price", e.target.value)}
          error={errors.price}
        />
        <Input
          id="cost_price"
          label="Harga Modal"
          type="number"
          placeholder="0"
          value={form.cost_price}
          onChange={(e) => updateField("cost_price", e.target.value)}
          error={errors.cost_price}
        />
      </div>

      {/* Category */}
      <div className="w-full">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Kategori
        </label>
        <select
          value={form.category_id}
          onChange={(e) => updateField("category_id", e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">-- Pilih Kategori --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stock */}
      <Input
        id="stock"
        label="Stok *"
        type="number"
        placeholder="0"
        value={form.stock}
        onChange={(e) => updateField("stock", e.target.value)}
        error={errors.stock}
      />

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        <Button type="button" variant="ghost" onClick={() => { onClose?.(); onCancel?.(); }}>
          Batal
        </Button>
        <Button type="submit" loading={isLoading}>
          {mode === "create" ? "Tambah Produk" : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );

  // Standalone mode (used by old pages)
  if (!onClose) {
    return formContent;
  }

  // Modal mode
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-lg mx-4 border border-border max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold">
              {mode === "create" ? "Tambah Produk" : "Edit Produk"}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {mode === "create"
                ? "Buat produk baru"
                : `Mengubah: ${product?.name}`}
            </p>
          </div>
          <button
            onClick={() => { onClose(); onCancel?.(); }}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          {formContent}
        </div>
      </div>
    </div>
  );
}

export { ProductFormModal as ProductForm };
