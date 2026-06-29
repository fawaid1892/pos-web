/**
 * Hook untuk management branch aktif
 */

import { create } from "zustand";
import type { Branch } from "@/types";

interface BranchState {
  branches: Branch[];
  activeBranch: Branch | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setActiveBranch: (branch: Branch) => void;
  fetchBranches: () => Promise<void>;
  clearError: () => void;
}

/** Helper to extract array data from API responses that may be { data: [...] } or [...] */
function extractArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object" && "data" in (raw as Record<string, unknown>)) {
    const data = (raw as Record<string, unknown>).data;
    if (Array.isArray(data)) return data as T[];
  }
  return [];
}

export const useBranchStore = create<BranchState>((set, get) => ({
  branches: [],
  activeBranch: null,
  isLoading: false,
  error: null,

  setActiveBranch: (branch) => {
    set({ activeBranch: branch });
    localStorage.setItem("active_branch_id", branch.id);
  },

  fetchBranches: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/branches", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const raw = await response.json();
      const rawList = Array.isArray(raw) ? raw : (raw as Record<string, unknown>).data;
      const list = Array.isArray(rawList) ? rawList : [];
      const branches = list.map(normalizeBranch);
      set({ branches, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal memuat cabang",
      });
    }
  },

  clearError: () => set({ error: null }),
}));

/** Map snake_case backend fields to camelCase frontend Branch type */
function normalizeBranch(b: Record<string, unknown>): Branch {
  return {
    id: String(b.id ?? ""),
    name: String(b.name ?? ""),
    code: String(b.code ?? b.name ?? ""),
    address: String(b.address ?? ""),
    phone: b.phone ? String(b.phone) : undefined,
    isActive: b.is_active === true || b.isActive === true,
    createdAt: String(b.created_at ?? b.createdAt ?? ""),
    updatedAt: String(b.updated_at ?? b.updatedAt ?? ""),
  };
}

// Convenience selectors
export const useActiveBranchId = () =>
  useBranchStore((state) => state.activeBranch?.id ?? null);
