"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Product, Category } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductFormData {
  name: string;
  barcode?: string;
  code?: string;
  unit: string;
  price: number;
  cost_price?: number;
  category_id?: string;
  stock: number;
}

// ─── Fetch categories ─────────────────────────────────────────────────────────

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch categories" }));
    throw new Error(err.error || "Failed to fetch categories");
  }
  const json = await res.json();
  const list = json.data ?? json.categories ?? json;
  return Array.isArray(list) ? list : [];
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    refetchInterval: 30_000,
  });
}

// ─── Fetch products ───────────────────────────────────────────────────────────

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch products" }));
    throw new Error(err.error || "Failed to fetch products");
  }
  const json = await res.json();
  const list = json.data ?? json.products ?? json;
  return Array.isArray(list) ? list : [];
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    refetchInterval: 30_000,
  });
}

// ─── Create product ───────────────────────────────────────────────────────────

async function createProduct(data: ProductFormData): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to create product" }));
    throw new Error(err.error || "Failed to create product");
  }
  return res.json();
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ─── Update product ───────────────────────────────────────────────────────────

async function updateProduct({
  id,
  data,
}: {
  id: number;
  data: Partial<ProductFormData>;
}): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to update product" }));
    throw new Error(err.error || "Failed to update product");
  }
  return res.json();
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ─── Delete product ───────────────────────────────────────────────────────────

async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to delete product" }));
    throw new Error(err.error || "Failed to delete product");
  }
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
