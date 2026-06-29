"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Trash2,
  Percent,
} from "lucide-react";

const PROMOTION_TYPES = [
  { value: "voucher", label: "Voucher" },
  { value: "bundling", label: "Bundling" },
  { value: "potongan_harga", label: "Potongan Harga" },
  { value: "buy_x_get_y", label: "Buy X Get Y" },
  { value: "min_purchase", label: "Min. Pembelian" },
];

const DISCOUNT_TYPES = [
  { value: "persen", label: "Persen (%)" },
  { value: "nominal", label: "Nominal (Rp)" },
];

interface FormData {
  name: string;
  type: string;
  code: string;
  discount_value: number;
  discount_type: string;
  sku_target: string;
  qty_min: number;
  qty_free: number;
  start_date: string;
  end_date: string;
  branch_id: string;
  is_active: boolean;
  max_uses: number;
}

const DEFAULT_FORM: FormData = {
  name: "",
  type: "voucher",
  code: "",
  discount_value: 0,
  discount_type: "persen",
  sku_target: "",
  qty_min: 0,
  qty_free: 0,
  start_date: "",
  end_date: "",
  branch_id: "",
  is_active: true,
  max_uses: 0,
};

export default function PromotionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const promoId = params.id as string;
  const isNew = promoId === "create";

  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load promotion data
  useEffect(() => {
    if (isNew) {
      // Set default dates
      const today = new Date().toISOString().split("T")[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setFormData({
        ...DEFAULT_FORM,
        start_date: today,
        end_date: nextMonth.toISOString().split("T")[0],
      });
      return;
    }

    async function loadPromotion() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/promotions/${promoId}`);
        if (!res.ok) throw new Error("Gagal memuat data promosi");
        const json = await res.json();
        const promo = json?.data ?? json;
        setFormData({
          name: promo.name || "",
          type: promo.type || "voucher",
          code: promo.code || "",
          discount_value: promo.discount_value || 0,
          discount_type: promo.discount_type || "persen",
          sku_target: promo.sku_target || "",
          qty_min: promo.qty_min || 0,
          qty_free: promo.qty_free || 0,
          start_date: promo.start_date ? promo.start_date.split("T")[0] : "",
          end_date: promo.end_date ? promo.end_date.split("T")[0] : "",
          branch_id: promo.branch_id || "",
          is_active: promo.is_active ?? true,
          max_uses: promo.max_uses || 0,
        });
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    }
    loadPromotion();
  }, [promoId, isNew]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setFormError("Nama promosi wajib diisi");
      return;
    }
    if (formData.type === "voucher" && !formData.code.trim()) {
      setFormError("Kode promo wajib diisi untuk tipe Voucher");
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      setFormError("Periode berlaku wajib diisi");
      return;
    }
    if (formData.discount_value <= 0) {
      setFormError("Nilai diskon harus lebih dari 0");
      return;
    }

    setFormError(null);
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        discount_value: Number(formData.discount_value),
        qty_min: Number(formData.qty_min),
        qty_free: Number(formData.qty_free),
        max_uses: Number(formData.max_uses),
        branch_id: formData.branch_id || undefined,
        code: formData.code.trim() || undefined,
        sku_target: formData.sku_target.trim() || undefined,
      };

      const method = isNew ? "POST" : "PUT";
      const url = isNew ? "/api/promotions" : `/api/promotions/${promoId}`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Gagal menyimpan" }));
        throw new Error(err.error || "Gagal menyimpan promosi");
      }

      router.push("/promotions");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/promotions/${promoId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus promosi");
      router.push("/promotions");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Memuat data promosi...</p>
      </div>
    );
  }

  // Determine which fields to show based on type
  const showCode = formData.type === "voucher";
  const showSkuTarget = formData.type === "bundling" || formData.type === "potongan_harga";
  const showQtyMin = formData.type === "buy_x_get_y" || formData.type === "min_purchase";
  const showQtyFree = formData.type === "buy_x_get_y";
  const showMaxUses = formData.type === "voucher";

  return (
    <div className="h-full flex flex-col overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/promotions")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Percent className="w-5 h-5" />
              {isNew ? "Tambah Promosi Baru" : `Edit Promosi: ${formData.name}`}
            </h2>
            {!isNew && (
              <p className="text-sm text-muted-foreground mt-0.5">
                Tipe: {PROMOTION_TYPES.find((t) => t.value === formData.type)?.label || formData.type}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} loading={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Simpan
          </Button>
          {!isNew && (
            <Button
              variant="danger"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus
            </Button>
          )}
        </div>
      </div>

      {/* Error messages */}
      {formError && (
        <div className="mx-6 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      {/* Form */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-6">
          {/* Nama Promosi */}
          <Input
            label="Nama Promosi"
            name="name"
            placeholder="Contoh: Diskon Akhir Tahun"
            value={formData.name}
            onChange={handleChange}
          />

          {/* Tipe Promosi */}
          <div className="w-full">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tipe Promosi
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {PROMOTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Conditional: Kode Promo (voucher only) */}
          {showCode && (
            <Input
              label="Kode Promo"
              name="code"
              placeholder="Contoh: HEMAT50"
              value={formData.code}
              onChange={handleChange}
            />
          )}

          {/* Diskon Value & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nilai Diskon"
              name="discount_value"
              type="number"
              min={0}
              placeholder="0"
              value={formData.discount_value || ""}
              onChange={handleChange}
            />
            <div className="w-full">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Tipe Diskon
              </label>
              <select
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChange}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {DISCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional: SKU Target */}
          {showSkuTarget && (
            <Input
              label="SKU Target"
              name="sku_target"
              placeholder="Contoh: SKU-001 atau biarkan kosong untuk semua"
              value={formData.sku_target}
              onChange={handleChange}
            />
          )}

          {/* Conditional: Qty Min & Qty Free */}
          {showQtyMin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={
                  formData.type === "min_purchase"
                    ? "Minimum Pembelian (Qty)"
                    : "Qty Minimum"
                }
                name="qty_min"
                type="number"
                min={0}
                placeholder="0"
                value={formData.qty_min || ""}
                onChange={handleChange}
              />
              {showQtyFree && (
                <Input
                  label="Qty Gratis"
                  name="qty_free"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.qty_free || ""}
                  onChange={handleChange}
                />
              )}
            </div>
          )}

          {/* Periode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Berlaku Mulai"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
            />
            <Input
              label="Berlaku Sampai"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
            />
          </div>

          {/* Maksimal Pemakaian (voucher only) */}
          {showMaxUses && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Maksimal Pemakaian"
                name="max_uses"
                type="number"
                min={0}
                placeholder="0 = Tidak terbatas"
                value={formData.max_uses || ""}
                onChange={handleChange}
              />
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-muted rounded-full peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-4.5" />
                  </div>
                  <span className="text-sm font-medium">Status Aktif</span>
                </label>
              </div>
            </div>
          )}

          {/* Status aktif for non-voucher */}
          {!showMaxUses && (
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-muted rounded-full peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-4.5" />
                </div>
                <span className="text-sm font-medium">Status Aktif</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 border border-border">
            <h3 className="text-lg font-semibold mb-2">Hapus Promosi?</h3>
            <p className="text-sm text-muted-foreground mb-1">
              Promosi <span className="font-medium text-foreground">{formData.name}</span> akan
              dinonaktifkan.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>
                Batal
              </Button>
              <Button
                variant="danger"
                loading={isDeleting}
                onClick={handleDelete}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
