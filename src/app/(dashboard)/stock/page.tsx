"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/hooks/useInventoryQuery";
import { useBranchStore } from "@/hooks/useBranch";
import { BranchSelector } from "@/components/layout/branch-selector";
import {
  Package,
  Search,
  ArrowUp,
  Edit,
    ArrowLeft,
    ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

function getStockStatus(stockQty: number, minStock: number): { label: string; color: "green" | "amber" | "red" } {
  if (stockQty <= 0) return { label: "Habis", color: "red" };
  if (stockQty <= minStock * 2) return { label: "Menipis", color: "amber" };
  return { label: "Cukup", color: "green" };
}

const statusStyles = {
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  amber:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const dotStyles = {
  green: "bg-green-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

export default function StockInventoryPage() {
  const router = useRouter();
  const { activeBranch } = useBranchStore();
  const { data: inventory = [], isLoading, error } = useInventory();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Filter & search
  const filtered = inventory.filter(
    (item) =>
      (item.productName || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.barcode || "").toLowerCase().includes(search.toLowerCase())
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Stok Inventory
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeBranch
              ? `Inventory ${activeBranch.name}`
              : "Pilih cabang untuk melihat inventory"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BranchSelector />
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/stock/adjustment")}
          >
            <ArrowUp className="w-4 h-4 mr-1.5" />
            Adjustment
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/stock/transfer")}
          >
            <ArrowRight className="w-4 h-4 mr-1.5" />
            Transfer
          </Button>
        </div>
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
          {error instanceof Error
            ? error.message
            : "Gagal memuat data inventory"}
        </div>
      )}

      {/* No Branch Selected */}
      {!activeBranch && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Package className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">
            Pilih cabang terlebih dahulu untuk melihat inventory
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="px-6 py-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-accent/30 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : paginated.length === 0 && activeBranch ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Package className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              {search
                ? "Tidak ada produk yang cocok dengan pencarian"
                : "Belum ada data inventory untuk cabang ini"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-6 py-3">Nama Produk</th>
                <th className="text-left px-6 py-3 hidden sm:table-cell">
                  Barcode
                </th>
                <th className="text-left px-6 py-3 hidden md:table-cell">
                  Kategori
                </th>
                <th className="text-right px-6 py-3">Stok</th>
                <th className="text-right px-6 py-3 hidden sm:table-cell">
                  Min. Stok
                </th>
                <th className="text-center px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item) => {
                const status = getStockStatus(item.stockQty, item.minStock);
                return (
                  <tr
                    key={item.id}
                    className="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm">
                        {item.productName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground hidden sm:table-cell font-mono">
                      {item.barcode || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">
                      {item.categoryName || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-sm font-medium",
                          status.color === "red" &&
                            "text-red-600 dark:text-red-400",
                          status.color === "amber" &&
                            "text-amber-600 dark:text-amber-400",
                          status.color === "green" &&
                            "text-green-600 dark:text-green-400"
                        )}
                      >
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            dotStyles[status.color]
                          )}
                        />
                        {item.stockQty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-muted-foreground hidden sm:table-cell">
                      {item.minStock}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          statusStyles[status.color]
                        )}
                      >
                        {status.label}
                      </span>
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
    </div>
  );
}
