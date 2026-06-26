/**
 * Hook untuk management branch aktif
 * 
 * TODO: connect ke API backend saat udah siap
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

export const useBranchStore = create<BranchState>((set) => ({
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
      // TODO: Ganti dengan panggilan API beneran
      // const response = await api.get<Branch[]>("/branches");
      // set({ branches: response.data, isLoading: false });

      // Mock data sementara
      const mockBranches: Branch[] = [
        {
          id: "br-001",
          name: "Toko Pusat",
          code: "PST",
          address: "Jl. Merdeka No. 1",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "br-002",
          name: "Cabang Kota",
          code: "KTA",
          address: "Jl. Sudirman No. 55",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      set({ branches: mockBranches, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal memuat cabang",
      });
    }
  },

  clearError: () => set({ error: null }),
}));
