"use client";

import { useState } from "react";
import { Search, Package } from "lucide-react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductGridProps {
  onSelectProduct: (product: Product) => void;
}

// Mock data — TODO: fetch dari API
const MOCK_PRODUCTS: Product[] = [
  { id: "p1", sku: "KOP-001", name: "Kopi Hitam", price: 15000, costPrice: 8000, categoryId: "cat-1", unit: "pcs", stock: 100, isActive: true },
  { id: "p2", sku: "KOP-002", name: "Kopi Susu", price: 20000, costPrice: 12000, categoryId: "cat-1", unit: "pcs", stock: 80, isActive: true },
  { id: "p3", sku: "TEH-001", name: "Teh Manis", price: 10000, costPrice: 5000, categoryId: "cat-2", unit: "pcs", stock: 120, isActive: true },
  { id: "p4", sku: "TEH-002", name: "Teh Tarik", price: 18000, costPrice: 10000, categoryId: "cat-2", unit: "pcs", stock: 45, isActive: true },
  { id: "p5", sku: "SNK-001", name: "Pisang Goreng", price: 12000, costPrice: 6000, categoryId: "cat-3", unit: "porsi", stock: 30, isActive: true },
  { id: "p6", sku: "SNK-002", name: "Kentang Goreng", price: 15000, costPrice: 8000, categoryId: "cat-3", unit: "porsi", stock: 25, isActive: true },
  { id: "p7", sku: "MIN-001", name: "Air Mineral", price: 5000, costPrice: 3000, categoryId: "cat-4", unit: "pcs", stock: 200, isActive: true },
  { id: "p8", sku: "MIN-002", name: "Jus Jeruk", price: 18000, costPrice: 10000, categoryId: "cat-4", unit: "gelas", stock: 40, isActive: true },
  { id: "p9", sku: "NAS-001", name: "Nasi Goreng", price: 25000, costPrice: 15000, categoryId: "cat-5", unit: "porsi", stock: 20, isActive: true },
  { id: "p10", sku: "NAS-002", name: "Nasi Ayam", price: 30000, costPrice: 18000, categoryId: "cat-5", unit: "porsi", stock: 15, isActive: true },
  { id: "p11", sku: "MKN-001", name: "Mie Goreng", price: 15000, costPrice: 8000, categoryId: "cat-6", unit: "porsi", stock: 35, isActive: true },
  { id: "p12", sku: "MKN-002", name: "Mie Rebus", price: 15000, costPrice: 8000, categoryId: "cat-6", unit: "porsi", stock: 35, isActive: true },
];

export function ProductGrid({ onSelectProduct }: ProductGridProps) {
  const [search, setSearch] = useState("");

  const filtered = MOCK_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
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

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Package className="w-12 h-12 mb-2" />
            <p className="text-sm">Produk tidak ditemukan</p>
          </div>
        ) : (
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
