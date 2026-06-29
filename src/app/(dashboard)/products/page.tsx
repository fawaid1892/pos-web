"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ProductFormModal } from "@/components/products/product-form";
import { useProducts, useDeleteProduct } from "@/hooks/useProductsQuery";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Package,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function ProductListPage() {
  const { data: products = [], isLoading, error } = useProducts();
  const deleteMutation = useDeleteProduct();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>("");

  // Filter & paginate
  const filtered = products.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode || "").toLowerCase().includes(search.toLowerCase())
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
    setEditingProduct(undefined);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Manajemen Produk
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola produk dan stok ({products.length} produk)
          </p>
        </div>
        <Button onClick={openCreateModal} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-border">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama atau barcode..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-6 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof Error ? error.message : "Gagal memuat data produk"}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="px-6 py-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-accent/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Package className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              {search
                ? "Tidak ada produk yang cocok dengan pencarian"
                : "Belum ada produk. Tambahkan produk pertama!"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-6 py-3">Nama</th>
                <th className="text-left px-6 py-3 hidden sm:table-cell">Barcode</th>
                <th className="text-left px-6 py-3">Harga</th>
                <th className="text-left px-6 py-3 hidden md:table-cell">Harga Modal</th>
                <th className="text-left px-6 py-3 hidden lg:table-cell">Kategori</th>
                <th className="text-left px-6 py-3">Stok</th>
                <th className="text-right px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border hover:bg-accent/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-sm">{product.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground hidden sm:table-cell font-mono">
                    {product.barcode || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">
                    {product.costPrice ? formatCurrency(product.costPrice) : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground hidden lg:table-cell">
                    {(product as any).category_name || (product as any).category?.name || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm ${
                        Number(product.stock) <= 0
                          ? "text-red-600 dark:text-red-400"
                          : Number(product.stock) <= 5
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          Number(product.stock) <= 0
                            ? "bg-red-500"
                            : Number(product.stock) <= 5
                            ? "bg-amber-500"
                            : "bg-green-500"
                        }`}
                      />
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteConfirmId(product.id);
                          setDeleteConfirmName(product.name);
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

      {/* Product Form Modal */}
      <ProductFormModal
        mode={editingProduct ? "edit" : "create"}
        product={editingProduct}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(undefined);
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 border border-border">
            <h3 className="text-lg font-semibold mb-2">Hapus Produk?</h3>
            <p className="text-sm text-muted-foreground mb-1">
              Produk <span className="font-medium text-foreground">{deleteConfirmName}</span> akan
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
