"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Package, AlertCircle } from "lucide-react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { useBranchStore } from "@/hooks/useBranch";
import type { Product } from "@/types";

interface ProductGridProps {
  onSelectProduct: (product: Product) => void;
}

async function fetchProducts(branchId: string | null): Promise<Product[]> {
  const params = branchId ? `?branch_id=${branchId}` : "";
  const res = await fetch(`/api/products${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch products" }));
    throw new Error(err.error || "Failed to fetch products");
  }
  const json = await res.json();
  const list = json.data ?? json.products ?? json;
  return Array.isArray(list) ? list : [];
}

function SkeletonCard() {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-border animate-pulse">
      <div className="w-12 h-12 rounded-lg bg-muted mb-2" />
      <div className="h-3 w-16 bg-muted rounded mb-1" />
      <div className="h-3 w-20 bg-muted rounded" />
    </div>
  );
}

export function ProductGrid({ onSelectProduct }: ProductGridProps) {
  const [search, setSearch] = useState("");
  const activeBranch = useBranchStore((state) => state.activeBranch);

  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["pos-products", activeBranch?.id],
    queryFn: () => fetchProducts(activeBranch?.id ?? null),
    enabled: true,
    refetchInterval: 30_000,
  });

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.code || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk (nama / SKU / barcode)..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="flex flex-col items-center justify-center h-full text-destructive">
            <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-4">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">
                {error instanceof Error
                  ? error.message
                  : "Gagal memuat produk"}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-brand-600 hover:underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Package className="w-12 h-12 mb-2" />
            <p className="text-sm">Produk tidak ditemukan</p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((product) => (
              <button
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border border-border",
                  "hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950",
                  "transition-all duration-150 active:scale-95",
                  product.stock <= 0 && "opacity-50 pointer-events-none"
                )}
              >
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-2">
                  <Package className="w-6 h-6 text-muted-foreground" />
                </div>
                <span className="text-xs font-medium text-center leading-tight line-clamp-2">
                  {product.name}
                </span>
                <span className="text-xs font-bold text-brand-600 mt-1">
                  Rp {product.price.toLocaleString("id-ID")}
                </span>
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="text-[10px] text-amber-600 mt-0.5">
                    Sisa {product.stock}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
