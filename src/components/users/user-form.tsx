"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBranchStore } from "@/hooks/useBranch";
import { useCreateUser, useUpdateUser } from "@/hooks/useUsersQuery";
import type { User } from "@/types";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "kasir", label: "Kasir" },
  { value: "owner", label: "Owner" },
] as const;

const roleColors: Record<string, string> = {
  admin: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  kasir: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  owner: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  manager: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  superadmin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  cashier: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

interface FormFields {
  username: string;
  full_name: string;
  password: string;
  role: string;
  branchId: string;
}

interface UserFormModalProps {
  mode: "create" | "edit";
  user?: User;
  open?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function UserFormModal({ mode, user, open = true, onClose, onCancel, onSuccess }: UserFormModalProps) {
  const { branches } = useBranchStore();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const [form, setForm] = useState<FormFields>({
    username: "",
    full_name: "",
    password: "",
    role: "kasir",
    branchId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && user) {
      setForm({
        username: user.username || user.email || "",
        full_name: user.full_name || user.name || "",
        password: "",
        role: user.role === "superadmin" || user.role === "manager" ? user.role === "superadmin" ? "admin" : "kasir" : user.role,
        branchId: user.branchId || "",
      });
    } else {
      setForm({ username: "", full_name: "", password: "", role: "kasir", branchId: "" });
    }
    setErrors({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, user, open]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.username.trim()) next.username = "Username wajib diisi";
    if (!form.full_name.trim()) next.full_name = "Nama lengkap wajib diisi";
    if (mode === "create" && !form.password) next.password = "Password wajib diisi";
    else if (mode === "create" && form.password.length < 6)
      next.password = "Password minimal 6 karakter";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Record<string, unknown> = {
      username: form.username,
      full_name: form.full_name,
      role: form.role,
      branch_id: form.branchId || undefined,
    };
    if (form.password) payload.password = form.password;

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(payload as any);
      } else if (user) {
        await updateMutation.mutateAsync({ id: user.id, data: payload as any });
      }
      onSuccess?.();
      onClose?.();

      // In standalone mode (no onClose), prevent duplicate navigation
      // The parent create/edit pages handle routing via onSuccess/onCancel
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

  // ─── Inline form content (used by both standalone & modal) ──────────
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Username */}
      <Input
        id="username"
        label="Username"
        placeholder="Masukkan username"
        value={form.username}
        onChange={(e) => updateField("username", e.target.value)}
        error={errors.username}
      />

      {/* Full Name */}
      <Input
        id="full_name"
        label="Nama Lengkap"
        placeholder="Masukkan nama lengkap"
        value={form.full_name}
        onChange={(e) => updateField("full_name", e.target.value)}
        error={errors.full_name}
      />

      {/* Password */}
      <Input
        id="password"
        label={mode === "create" ? "Password" : "Password Baru (kosongkan jika tidak diubah)"}
        type="password"
        placeholder={mode === "create" ? "Minimal 6 karakter" : "Biarkan kosong"}
        value={form.password}
        onChange={(e) => updateField("password", e.target.value)}
        error={errors.password}
      />

      {/* Role */}
      <div className="w-full">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Role / Peran
        </label>
        <div className="grid grid-cols-3 gap-2">
          {roleOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateField("role", opt.value)}
              className={cn(
                "px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors text-center",
                form.role === opt.value
                  ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                  : "border-input bg-background hover:bg-accent"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Branch */}
      <div className="w-full">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Cabang
        </label>
        <select
          value={form.branchId}
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

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        <Button type="button" variant="ghost" onClick={() => { onClose?.(); onCancel?.(); }}>
          Batal
        </Button>
        <Button type="submit" loading={isLoading}>
          {mode === "create" ? "Buat User" : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );

  // ─── Standalone mode (used by old create/edit pages) ───────────────
  if (!onClose) {
    return formContent;
  }

  // ─── Modal mode ─────────────────────────────────────────────────────
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-lg mx-4 border border-border max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold">
              {mode === "create" ? "Tambah User" : "Edit User"}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {mode === "create"
                ? "Buat akun user baru"
                : `Mengubah: ${user?.full_name || user?.name}`}
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

export { roleColors, roleOptions };
export { UserFormModal as UserForm };
