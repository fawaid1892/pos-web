"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { UserTableSkeleton } from "@/components/users/user-table-skeleton";
import { UserFormModal, roleColors } from "@/components/users/user-form";
import { useUsers, useDeleteUser } from "@/hooks/useUsersQuery";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { User } from "@/types";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function UserListPage() {
  const { data: users = [], isLoading, error } = useUsers();
  const deleteMutation = useDeleteUser();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>("");

  // Filter & paginate
  const filtered = users.filter(
    (u) =>
      (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name || u.name || "").toLowerCase().includes(search.toLowerCase())
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

  const openCreateModal = () => {
    setEditingUser(undefined);
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // handled by mutation
    }
    setDeleteConfirmId(null);
    setDeleteConfirmName("");
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

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

  const statusLabel = (user: User) => {
    if (user.status === "active") return { label: "Aktif", active: true };
    if (user.status === "inactive") return { label: "Nonaktif", active: false };
    return { label: user.isActive ? "Aktif" : "Nonaktif", active: user.isActive };
  };

  const branchName = (user: User) => {
    if (user.branch_name) return user.branch_name;
    return user.branchId ? user.branchId : "—";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Manajemen User
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola pengguna dan hak akses ({users.length} user)
          </p>
        </div>
        <Button onClick={openCreateModal} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Tambah User
        </Button>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-border">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari username atau nama..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-6 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof Error ? error.message : "Gagal memuat data user"}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="px-6 py-4">
            <UserTableSkeleton />
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Users className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              {search
                ? "Tidak ada user yang cocok dengan pencarian"
                : "Belum ada user. Tambahkan user pertama!"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-6 py-3">Username</th>
                <th className="text-left px-6 py-3 hidden sm:table-cell">Nama</th>
                <th className="text-left px-6 py-3">Role</th>
                <th className="text-left px-6 py-3 hidden md:table-cell">Cabang</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-right px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((user) => {
                const status = statusLabel(user);
                return (
                  <tr
                    key={user.id}
                    className="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-400 font-semibold text-sm shrink-0">
                          {(user.full_name || user.name || user.username || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {user.username || user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.full_name || user.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground hidden sm:table-cell">
                      {user.full_name || user.name || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium",
                          roleColors[user.role] || roleColors.admin
                        )}
                      >
                        {roleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">
                      {branchName(user)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-sm",
                          status.active
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            status.active ? "bg-green-500" : "bg-muted-foreground"
                          )}
                        />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(user)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeleteConfirmId(user.id);
                            setDeleteConfirmName(user.full_name ?? user.name ?? user.username ?? "");
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* User Form Modal */}
      <UserFormModal
        mode={editingUser ? "edit" : "create"}
        user={editingUser}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(undefined);
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 border border-border">
            <h3 className="text-lg font-semibold mb-2">Hapus User?</h3>
            <p className="text-sm text-muted-foreground mb-1">
              User <span className="font-medium text-foreground">{deleteConfirmName}</span> akan
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
                loading={deleteMutation.isPending}
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
