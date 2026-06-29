"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InventoryItem, AdjustmentFormData, TransferFormData } from "@/types";
import { useBranchStore } from "@/hooks/useBranch";

// ─── Fetch inventory ─────────────────────────────────────────────────────────

async function fetchInventory(branchId: string): Promise<InventoryItem[]> {
  const res = await fetch(`/api/inventory?branchId=${encodeURIComponent(branchId)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch inventory" }));
    throw new Error(err.error || "Failed to fetch inventory");
  }
  const json = await res.json();
  const list = json.data ?? json.inventory ?? json;
  return Array.isArray(list) ? list : [];
}

export function useInventory() {
  const activeBranch = useBranchStore((state) => state.activeBranch);
  const branchId = activeBranch?.id ?? "";

  return useQuery({
    queryKey: ["inventory", branchId],
    queryFn: () => fetchInventory(branchId),
    enabled: !!branchId,
    refetchInterval: 30_000,
  });
}

// ─── Adjust stock ────────────────────────────────────────────────────────────

async function adjustStock(data: AdjustmentFormData & { branchId: string }): Promise<void> {
  const res = await fetch("/api/inventory/adjustment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to adjust stock" }));
    throw new Error(err.error || "Failed to adjust stock");
  }
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  const activeBranch = useBranchStore((state) => state.activeBranch);
  const branchId = activeBranch?.id ?? "";

  return useMutation({
    mutationFn: (data: AdjustmentFormData) =>
      adjustStock({ ...data, branchId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ─── Transfer stock ──────────────────────────────────────────────────────────

async function transferStock(data: TransferFormData): Promise<void> {
  const res = await fetch("/api/inventory/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to transfer stock" }));
    throw new Error(err.error || "Failed to transfer stock");
  }
}

export function useTransferStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transferStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
