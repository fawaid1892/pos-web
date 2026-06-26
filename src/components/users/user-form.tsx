"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUsersStore } from "@/hooks/useUsers";
import { useBranchStore } from "@/hooks/useBranch";
import type { UserFormData, User } from "@/types";
import { cn } from "@/lib/utils";

const roleOptions = [
  { value: "superadmin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manajer" },
  { value: "cashier", label: "Kasir" },
] as const;

const roleColors: Record<string, string> = {
  superadmin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  admin: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  manager: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  cashier: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

interface UserFormProps {
  mode: "create" | "edit";
  user?: User;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserForm({ mode, user, onSuccess, onCancel }: UserFormProps) {
  const router = useRouter();
  const { createUser, updateUser, isLoading } = useUsersStore();
  const { branches } = useBranchStore();
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "cashier",
    branchId: "",
    phone: "",
    isActive: true,
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        branchId: user.branchId || "",
        phone: user.phone || "",
        isActive: user.isActive,
        password: "",
      });
    }
  }, [mode, user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Nama wajib diisi";
    if (!formData.email.trim()) newErrors.email = "Email wajib diisi";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Format email tidak valid";
    if (mode === "create" && !formData.password)
      newErrors.password = "Password wajib diisi";
    else if (mode === "create" && (formData.password?.length ?? 0) < 6)
      newErrors.password = "Password minimal 6 karakter";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (mode === "create") {
        await createUser(formData);
      } else if (user) {
        const { password, ...rest } = formData;
        await updateUser(user.id, password ? { password, ...rest } : rest);
      }
      onSuccess?.();
    } catch {
      // error handled by store
    }
  };

  const updateField = <K extends keyof UserFormData>(
    key: K,
    value: UserFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <Input
        id="name"
        label="Nama Lengkap"
        placeholder="Masukkan nama lengkap"
        value={formData.name}
        onChange={(e) => updateField("name", e.target.value)}
        error={errors.name}
      />

      {/* Email */}
      <Input
        id="email"
        label="Email"
        type="email"
        placeholder="user@example.com"
        value={formData.email}
        onChange={(e) => updateField("email", e.target.value)}
        error={errors.email}
      />

      {/* Role */}
      <div className="w-full">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Role / Peran
        </label>
        <div className="grid grid-cols-2 gap-2">
          {roleOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateField("role", opt.value)}
              className={cn(
                "px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors text-left",
                formData.role === opt.value
                  ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                  : "border-input bg-background hover:bg-accent"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.role && <p className="mt-1 text-xs text-destructive">{errors.role}</p>}
      </div>

      {/* Branch */}
      <div className="w-full">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Cabang
        </label>
        <select
          value={formData.branchId}
          onChange={(e) => updateField("branchId", e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">-- Semua Cabang --</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Phone */}
      <Input
        id="phone"
        label="Nomor Telepon"
        type="tel"
        placeholder="08xxxxxxxxxx"
        value={formData.phone || ""}
        onChange={(e) => updateField("phone", e.target.value)}
        error={errors.phone}
      />

      {/* Password */}
      <Input
        id="password"
        label={mode === "create" ? "Password" : "Password Baru (kosongkan jika tidak diubah)"}
        type="password"
        placeholder={mode === "create" ? "Minimal 6 karakter" : "Biarkan kosong jika tidak diubah"}
        value={formData.password || ""}
        onChange={(e) => updateField("password", e.target.value)}
        error={errors.password}
      />

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => updateField("isActive", !formData.isActive)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            formData.isActive ? "bg-brand-600" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
              formData.isActive ? "translate-x-[22px]" : "translate-x-[2px]"
            )}
          />
        </button>
        <span className="text-sm text-muted-foreground">
          {formData.isActive ? "Aktif" : "Nonaktif"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            onCancel?.();
            router.back();
          }}
        >
          Batal
        </Button>
        <Button type="submit" loading={isLoading}>
          {mode === "create" ? "Buat User" : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}

export { roleColors, roleOptions };
