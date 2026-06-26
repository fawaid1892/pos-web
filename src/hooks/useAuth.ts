/**
 * Hook untuk autentikasi
 * 
 * TODO: Implementasi login real setelah backend siap
 */

import { create } from "zustand";
import type { AuthSession, User } from "@/types";

interface AuthState {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, _password: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Ganti dengan panggilan API beneran
      // const response = await api.post<AuthSession>("/auth/login", { email, password });
      // set({ session: response.data, isAuthenticated: true, isLoading: false });

      // Mock login
      const mockUser: User = {
        id: "usr-001",
        name: "Admin Toko",
        email: email,
        role: "superadmin",
        phone: "081234567890",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockSession: AuthSession = {
        user: mockUser,
        token: "mock-token-xxx",
        activeBranchId: "br-001",
      };

      localStorage.setItem("auth_token", mockSession.token);
      localStorage.setItem("active_branch_id", mockSession.activeBranchId);

      set({ session: mockSession, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Login gagal",
      });
    }
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("active_branch_id");
    set({ session: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
