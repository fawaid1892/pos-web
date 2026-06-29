"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatDate } from "@/lib/utils";
import type { Promotion } from "@/types";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Percent,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

const PROMOTION_TYPES: Record<string, string> = {
  voucher: "Voucher",
  bundling: "Bundling",
  potongan_harga: "Potongan Harga",
  buy_x_get_y: "Buy X Get Y",
  min_purchase: "Min. Pembelian",
};

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "active", label: "Aktif" },
  { value: "expired", label: "Kadaluarsa" },
];

const TYPE_OPTIONS = [
  { value: "", label: "Semua Tipe" },
  { value: "voucher", label: "Voucher" },
  { value: "bundling", label: "Bundling" },
  { value: "potongan_harga", label: "Potongan Harga" },
  { value: "buy_x_get_y", label: "Buy X Get Y" },
  { value: "min_purchase", label: "Min. Pembelian" },
];

export default function PromotionListPage() {
  const router = useRouter();

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPromotions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set("type", typeFilter);
      if (statusFilter === "active") params.set("active", "true");
      const res = await fetch(`/api/promotions?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat data promosi");
      const json = await res.json();
      const data = json?.data ?? json ?? [];
      setPromotions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setPromotions([]);
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/promotions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus promosi");
      setDeleteConfirmId(null);
      setDeleteConfirmName("");
      fetchPromotions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & paginate
  const filtered = promotions.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.code || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPage(1);
    },
    []
  );

  const isExpired = (endDate: string) => new Date(endDate) < new Date();
  const isActive = (p: Promotion) => p.is_active && !isExpired(p.end_date);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Percent className="w-5 h-5" />
            Manajemen Promosi
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola promosi dan voucher ({promotions.length} promosi)
          </p>
        </div>
        <Button onClick={() => router.push("/promotions/create")} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Promosi
        </Button>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-border flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama atau kode promo..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-6 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="px-6 py-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-accent/50 animate-pulse" />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Percent className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              {search || typeFilter || statusFilter !== "all"
                ? "Tidak ada promosi yang cocok dengan filter"
                : "Belum ada promosi. Tambahkan promosi pertama!"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-6 py-3">Nama</th>
                <th className="text-left px-6 py-3 hidden sm:table-cell">Tipe</th>
                <th className="text-left px-6 py-3 hidden md:table-cell">Kode Promo</th>
                <th className="text-left px-6 py-3 hidden lg:table-cell">Periode</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3 hidden lg:table-cell">Pemakaian</th>
                <th className="text-right px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((promo) => (
                <tr
                  key={promo.id}
                  className="border-b border-border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/promotions/${promo.id}`)}
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-sm">{promo.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm hidden sm:table-cell">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      promo.type === "voucher" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                      promo.type === "bundling" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      promo.type === "potongan_harga" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      promo.type === "buy_x_get_y" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    )}>
                      {PROMOTION_TYPES[promo.type] || promo.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-muted-foreground hidden md:table-cell">
                    {promo.code || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground hidden lg:table-cell">
                    {formatDate(promo.start_date)} — {formatDate(promo.end_date)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 text-sm",
                      isActive(promo)
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted-foreground"
                    )}>
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        isActive(promo) ? "bg-green-500" : "bg-muted-foreground"
                      )} />
                      {isActive(promo) ? "Aktif" : isExpired(promo.end_date) ? "Kadaluarsa" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground hidden lg:table-cell">
                    {promo.current_uses || 0}/{promo.max_uses || "∞"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/promotions/${promo.id}`);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(promo.id);
                          setDeleteConfirmName(promo.name);
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 border border-border">
            <h3 className="text-lg font-semibold mb-2">Hapus Promosi?</h3>
            <p className="text-sm text-muted-foreground mb-1">
              Promosi <span className="font-medium text-foreground">{deleteConfirmName}</span> akan
              dinonaktifkan.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
                Batal
              </Button>
              <Button
                variant="danger"
                loading={isDeleting}
                onClick={() => handleDelete(deleteConfirmId)}
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
