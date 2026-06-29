/**
 * Hook untuk management branch aktif
 */

import { create } from "zustand";
import type { Branch, BranchFormData, User } from "@/types";

interface BranchState {
  branches: Branch[];
  activeBranch: Branch | null;
  isLoading: boolean;
  error: string | null;

  // Branch CRUD
  setActiveBranch: (branch: Branch) => void;
  fetchBranches: () => Promise<void>;
  createBranch: (data: BranchFormData) => Promise<Branch | null>;
  updateBranch: (id: string, data: Partial<BranchFormData>) => Promise<Branch | null>;
  deleteBranch: (id: string) => Promise<boolean>;

  // User assignment
  branchUsers: User[];
  branchUsersLoading: boolean;
  fetchBranchUsers: (branchId: string) => Promise<User[]>;
  assignUserToBranch: (branchId: string, userId: string) => Promise<void>;
  removeUserFromBranch: (branchId: string, userId: string) => Promise<void>;

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

/** Helper to extract single item from API responses that may be { data: {...} } or {...} */
function extractItem<T>(raw: unknown): T | null {
  if (raw && typeof raw === "object" && "data" in (raw as Record<string, unknown>)) {
    return (raw as Record<string, unknown>).data as T;
  }
  return raw as T;
}

export const useBranchStore = create<BranchState>((set, get) => ({
  branches: [],
  activeBranch: null,
  isLoading: false,
  error: null,

  branchUsers: [],
  branchUsersLoading: false,

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

  createBranch: async (data: BranchFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      const raw = await response.json();
      const newBranch = extractItem<Branch>(raw);
      if (newBranch) {
        const normalized = normalizeBranch(newBranch as unknown as Record<string, unknown>);
        set((state) => ({
          branches: [...state.branches, normalized],
          isLoading: false,
        }));
        return normalized;
      }
      // If can't extract, refetch
      await get().fetchBranches();
      set({ isLoading: false });
      return null;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal membuat cabang",
      });
      return null;
    }
  },

  updateBranch: async (id: string, data: Partial<BranchFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/branches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      const raw = await response.json();
      const updatedBranch = extractItem<Branch>(raw);
      if (updatedBranch) {
        const normalized = normalizeBranch(updatedBranch as unknown as Record<string, unknown>);
        set((state) => ({
          branches: state.branches.map((b) => (b.id === id ? normalized : b)),
          isLoading: false,
        }));
        return normalized;
      }
      await get().fetchBranches();
      set({ isLoading: false });
      return null;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal mengupdate cabang",
      });
      return null;
    }
  },

  deleteBranch: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/branches/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      set((state) => ({
        branches: state.branches.filter((b) => b.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal menghapus cabang",
      });
      return false;
    }
  },

  fetchBranchUsers: async (branchId: string) => {
    set({ branchUsersLoading: true });
    try {
      const response = await fetch(`/api/branches/${branchId}/users`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const raw = await response.json();
      const users = extractArray<User>(raw);
      set({ branchUsers: users, branchUsersLoading: false });
      return users;
    } catch (err) {
      set({
        branchUsersLoading: false,
        error: err instanceof Error ? err.message : "Gagal memuat user cabang",
      });
      return [];
    }
  },

  assignUserToBranch: async (branchId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/branches/${branchId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      // Refetch users for this branch
      await get().fetchBranchUsers(branchId);
      set({ isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal menambahkan user",
      });
    }
  },

  removeUserFromBranch: async (branchId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/branches/${branchId}/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      set((state) => ({
        branchUsers: state.branchUsers.filter((u) => u.id !== userId),
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal menghapus user dari cabang",
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
    province: b.province ? String(b.province) : undefined,
    city: b.city ? String(b.city) : undefined,
    isActive: b.is_active === true || b.isActive === true,
    createdAt: String(b.created_at ?? b.createdAt ?? ""),
    updatedAt: String(b.updated_at ?? b.updatedAt ?? ""),
  };
}

// Convenience selectors
export const useActiveBranchId = () =>
  useBranchStore((state) => state.activeBranch?.id ?? null);
