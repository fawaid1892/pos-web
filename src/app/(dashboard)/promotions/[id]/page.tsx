"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatDate } from "@/lib/utils";
import type { Branch } from "@/types";
import {
  ArrowLeft,
  Save,
  Trash2,
  Percent,
  Globe,
  MapPinned,
  Building2,
  CheckCircle,
  Check,
} from "lucide-react";

// ─── Provinsi/Kota types ──────────────────────────────────────────────────────
interface Province {
  id: string;
  name: string;
}

interface City {
  id: string;
  name: string;
}

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

const SCOPE_OPTIONS = [
  { value: "all", label: "Semua Cabang", icon: Globe },
  { value: "province", label: "By Provinsi", icon: MapPinned },
  { value: "city", label: "By Kota", icon: Building2 },
  { value: "selected", label: "Pilih Cabang", icon: CheckCircle },
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
  scope: string;
  province_id: string;
  city_id: string;
  branch_ids: string[];
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
  scope: "all",
  province_id: "",
  city_id: "",
  branch_ids: [],
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

  // ─── Scope-related state ───────────────────────────────────────────────────
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingCity, setLoadingCity] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // ─── Fetch provinces on mount ──────────────────────────────────────────────
  useEffect(() => {
    async function loadProvinces() {
      setLoadingProvince(true);
      try {
        const res = await fetch(
          "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json"
        );
        const data = await res.json();
        setProvinces(data);
      } catch {
        console.error("Failed to load provinces");
      } finally {
        setLoadingProvince(false);
      }
    }
    loadProvinces();
  }, []);

  // ─── Fetch cities when province changes ────────────────────────────────────
  useEffect(() => {
    if (!formData.province_id) {
      setCities([]);
      return;
    }
    async function loadCities() {
      setLoadingCity(true);
      try {
        const res = await fetch(
          `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${formData.province_id}.json`
        );
        const data = await res.json();
        setCities(data);
      } catch {
        console.error("Failed to load cities");
      } finally {
        setLoadingCity(false);
      }
    }
    loadCities();
  }, [formData.province_id]);

  // ─── Fetch branches when scope = 'selected' ───────────────────────────────
  useEffect(() => {
    if (formData.scope === "selected" && branches.length === 0) {
      async function loadBranches() {
        setLoadingBranches(true);
        try {
          const res = await fetch("/api/branches", { cache: "no-store" });
          const json = await res.json();
          const data = Array.isArray(json) ? json : json?.data ?? [];
          setBranches(data);
        } catch {
          console.error("Failed to load branches");
        } finally {
          setLoadingBranches(false);
        }
      }
      loadBranches();
    }
  }, [formData.scope, branches.length]);

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
          scope: promo.scope || "all",
          province_id: promo.province_id || "",
          city_id: promo.city_id || "",
          branch_ids: promo.branches?.map((b: { branch_id: string }) => b.branch_id) || [],
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

  const handleScopeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      scope: value,
      // Reset province/city/branch_ids when switching scope
      province_id: value === "all" || value === "selected" ? "" : prev.province_id,
      city_id: value !== "city" ? "" : prev.city_id,
      branch_ids: value !== "selected" ? [] : prev.branch_ids,
    }));
  };

  const handleBranchToggle = (branchId: string) => {
    setFormData((prev) => ({
      ...prev,
      branch_ids: prev.branch_ids.includes(branchId)
        ? prev.branch_ids.filter((id) => id !== branchId)
        : [...prev.branch_ids, branchId],
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
      const payload: Record<string, unknown> = {
        name: formData.name.trim(),
        type: formData.type,
        discount_value: Number(formData.discount_value),
        discount_type: formData.discount_type,
        qty_min: Number(formData.qty_min),
        qty_free: Number(formData.qty_free),
        max_uses: Number(formData.max_uses),
        start_date: formData.start_date,
        end_date: formData.end_date,
        scope: formData.scope,
        is_active: formData.is_active,
        code: formData.code.trim() || undefined,
        sku_target: formData.sku_target.trim() || undefined,
      };

      // Add scope-specific fields
      if (formData.scope === "province") {
        payload.province_id = formData.province_id || undefined;
      } else if (formData.scope === "city") {
        payload.province_id = formData.province_id || undefined;
        payload.city_id = formData.city_id || undefined;
      } else if (formData.scope === "selected") {
        payload.branch_ids = formData.branch_ids.length > 0 ? formData.branch_ids : undefined;
      }

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

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* Scope / Branch Coverage */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <div className="w-full">
            <label className="block text-sm font-medium text-foreground mb-3">
              Cakupan Cabang
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SCOPE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = formData.scope === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleScopeChange(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border-2 px-3 py-3 text-sm font-medium transition-all",
                      isActive
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-muted bg-card text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional scope fields */}

          {/* By Province */}
          {formData.scope === "province" && (
            <div className="w-full">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Pilih Provinsi
              </label>
              <select
                name="province_id"
                value={formData.province_id}
                onChange={handleChange}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loadingProvince}
              >
                <option value="">
                  {loadingProvince ? "Memuat..." : "Pilih Provinsi"}
                </option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* By City */}
          {formData.scope === "city" && (
            <>
              <div className="w-full">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Pilih Provinsi
                </label>
                <select
                  name="province_id"
                  value={formData.province_id}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={loadingProvince}
                >
                  <option value="">
                    {loadingProvince ? "Memuat..." : "Pilih Provinsi"}
                  </option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              {formData.province_id && (
                <div className="w-full">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Pilih Kota / Kabupaten
                  </label>
                  <select
                    name="city_id"
                    value={formData.city_id}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={loadingCity}
                  >
                    <option value="">
                      {loadingCity ? "Memuat..." : "Pilih Kota / Kabupaten"}
                    </option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Selected Branches */}
          {formData.scope === "selected" && (
            <div className="w-full">
              <label className="block text-sm font-medium text-foreground mb-2">
                Pilih Cabang ({formData.branch_ids.length} dipilih)
              </label>
              {loadingBranches ? (
                <p className="text-sm text-muted-foreground">Memuat daftar cabang...</p>
              ) : branches.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada cabang tersedia.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto rounded-lg border border-border p-2 space-y-1">
                  {branches.map((branch) => {
                    const isSelected = formData.branch_ids.includes(branch.id);
                    return (
                      <label
                        key={branch.id}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors",
                          isSelected
                            ? "bg-primary/5 text-foreground"
                            : "hover:bg-accent/50 text-muted-foreground"
                        )}
                      >
                        <div className="relative flex items-center justify-center w-5 h-5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleBranchToggle(branch.id)}
                            className="sr-only peer"
                          />
                          <div
                            className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/30 bg-background"
                            )}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{branch.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {branch.code}{branch.city ? ` — ${branch.city}` : ""}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
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
