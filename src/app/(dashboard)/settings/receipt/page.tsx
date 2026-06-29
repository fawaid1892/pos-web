"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileTextPreview } from "@/components/receipt/receipt-preview";
import { useFileTextSettingsStore } from "@/hooks/useFileTextSettings";
import { useBranchStore } from "@/hooks/useBranch";
import type { FileTextSettingsFormData } from "@/types";
import { cn } from "@/lib/utils";
import { Printer, Save, Upload, RotateCcw } from "lucide-react";

const fontOptions = [
  { value: "mono", label: "Monospace (thermal default)" },
  { value: "sans", label: "Sans-serif" },
  { value: "serif", label: "Serif" },
] as const;

const paperOptions = [
  { value: "58mm", label: "58 mm (kecil)" },
  { value: "80mm", label: "80 mm (sedang)" },
] as const;

const fontSizeOptions = [
  { value: "sm", label: "Kecil" },
  { value: "md", label: "Sedang" },
  { value: "lg", label: "Besar" },
] as const;

export default function FileTextSettingsPage() {
  const { settings, isLoading, isSaving, fetchSettings, saveSettings, updateLogo } =
    useFileTextSettingsStore();
  const { activeBranch } = useBranchStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FileTextSettingsFormData | null>(null);

  // Load settings on mount
  useEffect(() => {
    if (activeBranch) {
      fetchSettings(activeBranch.id);
    }
  }, [activeBranch, fetchSettings]);

  // Sync form when settings loaded
  useEffect(() => {
    if (settings && !form) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, branchId, updatedAt, ...rest } = settings;
      setForm(rest);
    }
  }, [settings, form]);

  const updateField = <K extends keyof FileTextSettingsFormData>(
    key: K,
    value: FileTextSettingsFormData[K]
  ) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateField("logoUrl", dataUrl);
      updateLogo(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form) return;
    await saveSettings(form);
  };

  const handleReset = () => {
    if (!settings) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, branchId, updatedAt, ...rest } = settings;
    setForm(rest);
  };

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <Printer className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Memuat pengaturan struk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Pengaturan Struk
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Sesuaikan tampilan struk thermal untuk{" "}
              <span className="font-medium">{activeBranch?.name || "cabang aktif"}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button onClick={handleSave} loading={isSaving}>
              <Save className="w-4 h-4 mr-1" />
              Simpan
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Settings Form — 3 columns */}
          <div className="lg:col-span-3 space-y-8">
            {/* Store Info */}
            <section className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">Identitas Toko</h3>
              <div className="space-y-4">
                <Input
                  label="Nama Toko"
                  value={form.storeName}
                  onChange={(e) => updateField("storeName", e.target.value)}
                  placeholder="Nama toko Anda"
                />
                <Input
                  label="Alamat Toko"
                  value={form.storeAddress}
                  onChange={(e) => updateField("storeAddress", e.target.value)}
                  placeholder="Alamat lengkap"
                />
                <Input
                  label="Nomor Telepon"
                  value={form.storePhone}
                  onChange={(e) => updateField("storePhone", e.target.value)}
                  placeholder="Nomor telepon toko"
                />
                <Input
                  label="NPWP / Tax ID (opsional)"
                  value={form.taxId || ""}
                  onChange={(e) => updateField("taxId", e.target.value)}
                  placeholder="Contoh: 01.234.567.8-901.000"
                />
              </div>
            </section>

            {/* Header & Footer */}
            <section className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">Header &amp; Footer</h3>
              <div className="space-y-4">
                <div>
                  <Input
                    label="Teks Header"
                    value={form.headerText}
                    onChange={(e) => updateField("headerText", e.target.value)}
                  />
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={form.showHeader}
                      onChange={(e) => updateField("showHeader", e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-xs text-muted-foreground">
                      Tampilkan header
                    </span>
                  </label>
                </div>
                <div>
                  <Input
                    label="Teks Footer"
                    value={form.footerText}
                    onChange={(e) => updateField("footerText", e.target.value)}
                  />
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={form.showFooter}
                      onChange={(e) => updateField("showFooter", e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-xs text-muted-foreground">
                      Tampilkan footer
                    </span>
                  </label>
                </div>
              </div>
            </section>

            {/* Font & Paper */}
            <section className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">Tampilan &amp; Ukuran</h3>
              <div className="space-y-4">
                {/* Font family */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Jenis Font
                  </label>
                  <select
                    value={form.fontFamily}
                    onChange={(e) =>
                      updateField("fontFamily", e.target.value as "mono" | "sans" | "serif")
                    }
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    {fontOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font size */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Ukuran Font
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {fontSizeOptions.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() =>
                          updateField("fontSize", o.value as "sm" | "md" | "lg")
                        }
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm border transition-colors",
                          form.fontSize === o.value
                            ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                            : "border-input bg-background hover:bg-accent"
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paper width */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Lebar Kertas
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {paperOptions.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() =>
                          updateField("paperWidth", o.value as "58mm" | "80mm")
                        }
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm border transition-colors",
                          form.paperWidth === o.value
                            ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                            : "border-input bg-background hover:bg-accent"
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Logo */}
            <section className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">Logo</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.showLogo}
                    onChange={(e) => updateField("showLogo", e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">Tampilkan logo di struk</span>
                </label>

                {form.showLogo && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {form.logoUrl ? "Ganti Logo" : "Upload Logo"}
                    </Button>
                    {form.logoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.logoUrl}
                        alt="Logo preview"
                        className="w-20 h-20 object-contain mt-3 rounded-lg border border-border"
                      />
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Format: PNG, JPG, WebP. Maks 2 MB.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Additional options */}
            <section className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4">Opsi Tambahan</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.showItemNumber}
                    onChange={(e) => updateField("showItemNumber", e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">
                    Tampilkan nomor urut item
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.showBarcode}
                    onChange={(e) => updateField("showBarcode", e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">
                    Tampilkan barcode (placeholder)
                  </span>
                </label>
              </div>
            </section>
          </div>

          {/* Preview — 2 columns */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Pratinjau Struk
              </h3>
              <div className="flex justify-center">
                <FileTextPreview
                  settings={{
                    id: "",
                    branchId: activeBranch?.id || "",
                    updatedAt: new Date().toISOString(),
                    ...form,
                  }}
                />
              </div>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Pratinjau ini hanya estimasi. Hasil cetak tergantung printer thermal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
