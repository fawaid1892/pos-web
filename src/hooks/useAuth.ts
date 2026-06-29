/**
 * Hook untuk autentikasi
 *
 * Login via API proxy /api/auth/login, simpan token ke localStorage + zustand.
 */
import { create } from "zustand";
import type { AuthSession, User } from "@/types";

interface AuthState {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initialize: () => void;
  refreshAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: () => {
    const token = localStorage.getItem("auth_token");
    const userJson = localStorage.getItem("auth_user");
    const activeBranchId = localStorage.getItem("active_branch_id");

    if (token && userJson) {
      try {
        const user: User = JSON.parse(userJson);
        const session: AuthSession = { user, token, activeBranchId: activeBranchId || "" };
        set({ session, isAuthenticated: true });
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_refresh_token");
        localStorage.removeItem("auth_user");
      }
    }
  },

  login: async (usernameOrEmail: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameOrEmail, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Login gagal");
      }

      const { token, refresh_token, user } = data;

      // Persist to localStorage
      localStorage.setItem("auth_token", token);
      if (refresh_token) {
        localStorage.setItem("auth_refresh_token", refresh_token);
      }
      localStorage.setItem("auth_user", JSON.stringify(user));

      // If backend returns activeBranchId, store it
      if (user?.branchId) {
        localStorage.setItem("active_branch_id", user.branchId);
      }

      set({
        session: { user, token, activeBranchId: user?.branchId || "" },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Login gagal",
      });
    }
  },

  logout: () => {
    // Clear server-side cookie by calling API
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});

    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_refresh_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("active_branch_id");
    set({ session: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),

  refreshAuth: async () => {
    const refresh_token = localStorage.getItem("auth_refresh_token");
    if (!refresh_token) return false;

    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Refresh failed — clear everything
        get().logout();
        return false;
      }

      const { token: newToken, refresh_token: newRefreshToken, user } = data;

      // Update localStorage
      localStorage.setItem("auth_token", newToken);
      if (newRefreshToken) {
        localStorage.setItem("auth_refresh_token", newRefreshToken);
      }
      if (user) {
        localStorage.setItem("auth_user", JSON.stringify(user));
      }

      // Update session
      set({
        session: { user: user || get().session?.user, token: newToken, activeBranchId: user?.branchId || get().session?.activeBranchId || "" },
        isAuthenticated: true,
      });

      return true;
    } catch {
      get().logout();
      return false;
    }
  },
}));
