"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBranchStore } from "@/hooks/useBranch";
import { useUsersStore } from "@/hooks/useUsers";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Trash2,
  UserPlus,
  UserX,
  Users,
  Building2,
  Loader,
  Percent,
  Calendar,
  Tag,
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

// ─── Role color map ───────────────────────────────────────────────────────────

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  kasir: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  cashier: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  owner: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  manager: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  superadmin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const roleLabel = (role: string) => {
  const map: Record<string, string> = {
    admin: "Admin",
    kasir: "Kasir",
    cashier: "Kasir",
    owner: "Owner",
    manager: "Manajer",
    superadmin: "Super Admin",
  };
  return map[role] || role;
};

// ─── Promotion types for the section ──────────────────────────────────────────

interface BranchPromotion {
  id: string;
  name: string;
  type: string;
  discount_value: number;
  discount_type: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  scope: string;
}

const PROMOTION_TYPE_LABELS: Record<string, string> = {
  voucher: "Voucher",
  bundling: "Bundling",
  potongan_harga: "Potongan Harga",
  buy_x_get_y: "Buy X Get Y",
  min_purchase: "Min. Pembelian",
};

const SCOPE_LABELS: Record<string, string> = {
  all: "Semua Cabang",
  province: "By Provinsi",
  city: "By Kota",
  selected: "Cabang Terpilih",
};

// ─── Branch Promotions Section Component ──────────────────────────────────────

function BranchPromotionsSection({ branchId }: { branchId: string }) {
  const [promotions, setPromotions] = useState<BranchPromotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPromotions() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/branches/${branchId}/promotions`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load promotions");
        const json = await res.json();
        const data = Array.isArray(json) ? json : json?.data ?? [];
        setPromotions(data);
      } catch (err) {
        console.error("Failed to load branch promotions:", err);
        setPromotions([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadPromotions();
  }, [branchId]);

  const isExpired = (endDate: string) => new Date(endDate) < new Date();
  const isPromoActive = (p: BranchPromotion) => p.is_active && !isExpired(p.end_date);

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Percent className="w-5 h-5" />
          Promosi Aktif
        </h3>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <Loader className="w-4 h-4 animate-spin" />
          Memuat promosi...
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 bg-accent/30 rounded-lg text-center">
          <Percent className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
          <p>Tidak ada promosi yang aktif untuk cabang ini.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {promotions.filter(isPromoActive).map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-border p-4 hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {PROMOTION_TYPE_LABELS[p.type] || p.type}
                  </p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Aktif
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Tag className="w-3 h-3" />
                <span>
                  {p.discount_type === "persen"
                    ? `${p.discount_value}%`
                    : `Rp ${p.discount_value.toLocaleString("id-ID")}`}
                </span>
                <span className="text-border">|</span>
                <Calendar className="w-3 h-3" />
                <span>
                  {formatDateShort(p.start_date)} — {formatDateShort(p.end_date)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground/70">
                Cakupan: <span className="font-medium">{SCOPE_LABELS[p.scope] || p.scope}</span>
              </div>
            </div>
          ))}
          {promotions.filter(isPromoActive).length === 0 && (
            <div className="col-span-full text-sm text-muted-foreground py-4 bg-accent/30 rounded-lg text-center">
              <Percent className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p>Tidak ada promosi yang aktif untuk cabang ini.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function BranchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const branchId = params.id as string;

  const {
    branches,
    isLoading,
    error,
    fetchBranches,
    updateBranch,
    deleteBranch,
    branchUsers,
    branchUsersLoading,
    fetchBranchUsers,
    assignUserToBranch,
    removeUserFromBranch,
  } = useBranchStore();

  const { users, fetchUsers } = useUsersStore();
  const isNewBranch = branchId === "create";

  // ─── Branch form state ─────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    address: "",
    phone: "",
    province: "",       // display name (e.g. "Jawa Barat")
    province_code: "",  // emsifa code (e.g. "32")
    city: "",           // display name (e.g. "Bogor")
    city_code: "",      // emsifa code (e.g. "3271")
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ─── Provinsi/Kota state ───────────────────────────────────────────────────
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingCity, setLoadingCity] = useState(false);

  // ─── User assignment modal state ──────────────────────────────────────────
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // ─── Delete branch state ──────────────────────────────────────────────────
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Load initial data ─────────────────────────────────────────────────────
  useEffect(() => {
    if (branches.length === 0) fetchBranches();
    if (users.length === 0) fetchUsers();
    if (!isNewBranch) {
      fetchBranchUsers(branchId);
    }
  }, [branchId, isNewBranch, fetchBranches, fetchUsers, fetchBranchUsers, branches.length, users.length]);

  // ─── Load branch data into form ────────────────────────────────────────────
  useEffect(() => {
    if (isNewBranch) {
      setFormData({
        code: "",
        name: "",
        address: "",
        phone: "",
        province: "",
        province_code: "",
        city: "",
        city_code: "",
        isActive: true,
      });
      return;
    }
    const branch = branches.find((b) => b.id === branchId);
    if (branch) {
      setFormData({
        code: branch.code || "",
        name: branch.name || "",
        address: branch.address || "",
        phone: branch.phone || "",
        province: branch.province || "",
        province_code: branch.province_code || "",
        city: branch.city || "",
        city_code: branch.city_code || "",
        isActive: branch.isActive,
      });
    }
  }, [branchId, branches, isNewBranch]);

  // ─── Fetch provinces on mount ──────────────────────────────────────────────
  useEffect(() => {
    async function loadProvinces() {
      setLoadingProvince(true);
      try {
        const res = await fetch(
          "https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json"
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
    if (!formData.province_code) {
      setCities([]);
      return;
    }
    async function loadCities() {
      setLoadingCity(true);
      try {
        const res = await fetch(
          `https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${formData.province_code}.json`
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
  }, [formData.province_code]);

  // ─── Form handlers ─────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    if (!formData.name.trim() || !formData.code.trim()) {
      setFormError("Nama cabang dan kode cabang wajib diisi");
      return;
    }
    setFormError(null);
    setIsSaving(true);
    try {
      if (isNewBranch) {
        // For new branch, redirect to the list after creating
        const res = await fetch("/api/branches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Gagal menyimpan" }));
          throw new Error(err.error || "Gagal menyimpan");
        }
        await fetchBranches();
        router.push("/branches");
      } else {
        const result = await updateBranch(branchId, formData);
        if (result) {
          // Success — stay on page
        }
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await deleteBranch(branchId);
    setIsDeleting(false);
    if (success) {
      router.push("/branches");
    }
  };

  // ─── User assignment handlers ─────────────────────────────────────────────
  const usersNotInBranch = users.filter(
    (u) => !branchUsers.some((bu) => bu.id === u.id)
  );

  const handleAssignUser = async () => {
    if (!selectedUserId) return;
    setIsAssigning(true);
    await assignUserToBranch(branchId, selectedUserId);
    setIsAssigning(false);
    setSelectedUserId("");
    setAssignModalOpen(false);
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (!confirm(`Hapus user "${userName}" dari cabang ini?`)) return;
    await removeUserFromBranch(branchId, userId);
  };

  // ─── Loading state for page ────────────────────────────────────────────────
  if (!isNewBranch && branches.length > 0 && !branches.find((b) => b.id === branchId)) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Memuat data cabang...</p>
      </div>
    );
  }

  const branch = branches.find((b) => b.id === branchId);

  return (
    <div className="h-full flex flex-col overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/branches")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {isNewBranch ? "Tambah Cabang Baru" : `Edit Cabang: ${branch?.name || ""}`}
            </h2>
            {!isNewBranch && branch && (
              <p className="text-sm text-muted-foreground mt-0.5">
                Kode: {branch.code}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} loading={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Simpan
          </Button>
          {!isNewBranch && (
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

      {/* Error / Success messages */}
      {formError && (
        <div className="mx-6 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}
      {error && (
        <div className="mx-6 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION A — Branch Info Form */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Informasi Cabang</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            {/* Kode Cabang */}
            <div>
              <Input
                label="Kode Cabang"
                name="code"
                placeholder="Contoh: CBD-01"
                value={formData.code}
                onChange={handleChange}
              />
            </div>

            {/* Nama Cabang */}
            <div>
              <Input
                label="Nama Cabang"
                name="name"
                placeholder="Masukkan nama cabang"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Provinsi */}
            <div className="w-full">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Provinsi
              </label>
              <select
                name="province"
                value={formData.province_code}
                onChange={(e) => {
                  const selectedProvince = provinces.find(p => p.id === e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    province: selectedProvince ? selectedProvince.name : "",
                    province_code: e.target.value,
                    city: "",
                    city_code: "",
                  }));
                }}
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

            {/* Kota */}
            <div className="w-full">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Kota / Kabupaten
              </label>
              <select
                name="city"
                value={formData.city_code}
                onChange={(e) => {
                  const selectedCity = cities.find(c => c.id === e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    city: selectedCity ? selectedCity.name : "",
                    city_code: e.target.value,
                  }));
                }}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!formData.province_code || loadingCity}
              >
                <option value="">
                  {!formData.province_code
                    ? "Pilih provinsi terlebih dahulu"
                    : loadingCity
                    ? "Memuat..."
                    : "Pilih Kota / Kabupaten"}
                </option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Alamat */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Alamat
              </label>
              <textarea
                name="address"
                placeholder="Masukkan alamat lengkap"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* No. Telepon */}
            <div>
              <Input
                label="No. Telepon"
                name="phone"
                placeholder="Contoh: 021-12345678"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Status Aktif */}
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-muted rounded-full peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-4.5" />
                </div>
                <span className="text-sm font-medium">Status Aktif</span>
              </label>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION B — User Assignment */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {!isNewBranch && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Pengguna Cabang
              </h3>
              <Button
                size="sm"
                onClick={() => setAssignModalOpen(true)}
                disabled={usersNotInBranch.length === 0}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Tambah User
              </Button>
            </div>

            {branchUsersLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader className="w-4 h-4 animate-spin" />
                Memuat pengguna...
              </div>
            ) : branchUsers.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 bg-accent/30 rounded-lg text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                <p>Belum ada pengguna yang ditugaskan ke cabang ini.</p>
                <p className="text-xs mt-1">
                  Klik &quot;Tambah User&quot; untuk menambahkan pengguna.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <th className="text-left px-4 py-3">Username</th>
                      <th className="text-left px-4 py-3">Nama Lengkap</th>
                      <th className="text-left px-4 py-3">Role</th>
                      <th className="text-right px-4 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t border-border hover:bg-accent/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm">
                          {user.username || user.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {user.full_name || user.name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium",
                              roleColors[user.role] || roleColors.admin
                            )}
                          >
                            {roleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveUser(
                                user.id,
                                user.full_name || user.username || user.name || ""
                              )
                            }
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION C — Active Promotions */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {!isNewBranch && <BranchPromotionsSection branchId={branchId} />}
      </div>

      {/* ─── Assign User Modal ──────────────────────────────────────────────── */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-md mx-4 border border-border">
            <h3 className="text-lg font-semibold mb-4">Tambah User ke Cabang</h3>
            <div className="space-y-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Pilih User
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">-- Pilih User --</option>
                  {usersNotInBranch.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username || u.email} — {u.full_name || u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setAssignModalOpen(false);
                  setSelectedUserId("");
                }}
              >
                Batal
              </Button>
              <Button
                disabled={!selectedUserId}
                loading={isAssigning}
                onClick={handleAssignUser}
              >
                Tambahkan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ──────────────────────────────────────── */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 border border-border">
            <h3 className="text-lg font-semibold mb-2">Hapus Cabang?</h3>
            <p className="text-sm text-muted-foreground mb-1">
              Cabang <span className="font-medium text-foreground">{branch?.name}</span> akan
              dihapus permanen.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setDeleteConfirmOpen(false)}
              >
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
