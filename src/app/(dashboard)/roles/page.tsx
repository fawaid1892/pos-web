"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRolesStore } from "@/hooks/useRoles";
import { cn } from "@/lib/utils";
import {
  Settings,
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function RoleListPage() {
  const router = useRouter();
  const {
    roles,
    isLoading,
    error,
    fetchRoles,
    deleteRole,
    createRole,
  } = useRolesStore();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>("");

  useEffect(() => {
    if (roles.length === 0) fetchRoles();
  }, [fetchRoles, roles.length]);

  // Filter & paginate
  const filtered = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
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
    if (!newName.trim()) return;
    setIsCreating(true);
    const role = await createRole(newName.trim(), newDescription.trim());
    setIsCreating(false);
    if (role) {
      setCreateOpen(false);
      setNewName("");
      setNewDescription("");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteRole(id);
    setDeleteConfirmId(null);
    setDeleteConfirmName("");
  };

  const getPermissionCount = (role: { permissions?: { length?: number } }) => {
    return role.permissions?.length ?? 0;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Manajemen Role
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola peran dan izin akses ({roles.length} role)
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Buat Role
        </Button>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-border">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari role..."
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
        {isLoading && roles.length === 0 ? (
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
            <Settings className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              {search
                ? "Tidak ada role yang cocok dengan pencarian"
                : "Belum ada role. Buat role pertama!"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-6 py-3">Nama Role</th>
                <th className="text-left px-6 py-3 hidden sm:table-cell">Deskripsi</th>
                <th className="text-center px-6 py-3">Izin</th>
                <th className="text-center px-6 py-3 hidden md:table-cell">Tipe</th>
                <th className="text-right px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((role) => (
                <tr
                  key={role.id}
                  className="border-b border-border hover:bg-accent/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-400 font-semibold text-sm shrink-0">
                        {role.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{role.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground hidden sm:table-cell max-w-xs truncate">
                    {role.description || "—"}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                    {getPermissionCount(role)}
                  </td>
                  <td className="px-6 py-4 text-center hidden md:table-cell">
                    <span
                      className={cn(
                        "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium",
                        role.is_system
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      )}
                    >
                      {role.is_system ? "System" : "Kustom"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/roles/${role.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!role.is_system && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeleteConfirmId(role.id);
                            setDeleteConfirmName(role.name);
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
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

      {/* Create Role Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-md mx-4 border border-border">
            <h3 className="text-lg font-semibold mb-4">Buat Role Baru</h3>
            <div className="space-y-4">
              <Input
                label="Nama Role"
                placeholder="Masukkan nama role"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Input
                label="Deskripsi"
                placeholder="Deskripsi role (opsional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setCreateOpen(false);
                  setNewName("");
                  setNewDescription("");
                }}
              >
                Batal
              </Button>
              <Button
                loading={isCreating}
                disabled={!newName.trim()}
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
            <h3 className="text-lg font-semibold mb-2">Hapus Role?</h3>
            <p className="text-sm text-muted-foreground mb-1">
              Role <span className="font-medium text-foreground">{deleteConfirmName}</span> akan
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
