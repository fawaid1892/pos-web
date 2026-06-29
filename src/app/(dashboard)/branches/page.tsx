"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBranchStore } from "@/hooks/useBranch";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Building2,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function BranchListPage() {
  const router = useRouter();
  const {
    branches,
    isLoading,
    error,
    fetchBranches,
    deleteBranch,
    createBranch,
    branchUsers,
    fetchBranchUsers,
  } = useBranchStore();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>("");

  useEffect(() => {
    if (branches.length === 0) fetchBranches();
  }, [fetchBranches, branches.length]);

  // Filter & paginate
  const filtered = branches.filter(
    (b) =>
      (b.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.code || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.city || "").toLowerCase().includes(search.toLowerCase())
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

  const handleCreate = async () => {
    if (!newName.trim() || !newCode.trim()) return;
    setIsCreating(true);
    const branch = await createBranch({
      name: newName.trim(),
      code: newCode.trim(),
      address: newAddress.trim(),
      phone: newPhone.trim() || undefined,
      isActive: true,
    });
    setIsCreating(false);
    if (branch) {
      setCreateOpen(false);
      setNewName("");
      setNewCode("");
      setNewAddress("");
      setNewPhone("");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteBranch(id);
    setDeleteConfirmId(null);
    setDeleteConfirmName("");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Manajemen Cabang
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola cabang dan pengguna ({branches.length} cabang)
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Cabang
        </Button>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-border">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama, kode, atau kota..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-6 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading && branches.length === 0 ? (
          <div className="px-6 py-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-accent/50 animate-pulse"
              />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Building2 className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              {search
                ? "Tidak ada cabang yang cocok dengan pencarian"
                : "Belum ada cabang. Tambahkan cabang pertama!"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-6 py-3">Kode</th>
                <th className="text-left px-6 py-3">Nama Cabang</th>
                <th className="text-left px-6 py-3 hidden sm:table-cell">Kota</th>
                <th className="text-left px-6 py-3 hidden md:table-cell">Telepon</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-right px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((branch) => (
                <tr
                  key={branch.id}
                  className="border-b border-border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/branches/${branch.id}`)}
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium">
                      {branch.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-sm">{branch.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground hidden sm:table-cell">
                    {branch.city || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">
                    {branch.phone || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-sm",
                        branch.isActive
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          branch.isActive ? "bg-green-500" : "bg-muted-foreground"
                        )}
                      />
                      {branch.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/branches/${branch.id}`);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(branch.id);
                          setDeleteConfirmName(branch.name);
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

      {/* Create Branch Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-md mx-4 border border-border">
            <h3 className="text-lg font-semibold mb-4">Tambah Cabang Baru</h3>
            <div className="space-y-4">
              <Input
                label="Kode Cabang"
                placeholder="Contoh: CBD-01"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
              <Input
                label="Nama Cabang"
                placeholder="Masukkan nama cabang"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Input
                label="Alamat"
                placeholder="Masukkan alamat"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
              <Input
                label="No. Telepon"
                placeholder="Masukkan nomor telepon"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setCreateOpen(false);
                  setNewName("");
                  setNewCode("");
                  setNewAddress("");
                  setNewPhone("");
                }}
              >
                Batal
              </Button>
              <Button
                loading={isCreating}
                disabled={!newName.trim() || !newCode.trim()}
                onClick={handleCreate}
              >
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 border border-border">
            <h3 className="text-lg font-semibold mb-2">Hapus Cabang?</h3>
            <p className="text-sm text-muted-foreground mb-1">
              Cabang <span className="font-medium text-foreground">{deleteConfirmName}</span> akan
              dihapus permanen.
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
