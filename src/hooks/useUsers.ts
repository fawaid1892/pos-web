/**
 * Hook untuk manajemen user (CRUD)
 */

import { create } from "zustand";
import type { User, UserFormData } from "@/types";

interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  selectedUser: User | null;

  // Actions
  fetchUsers: () => Promise<void>;
  createUser: (data: UserFormData) => Promise<void>;
  updateUser: (id: number, data: Partial<UserFormData>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  getUserById: (id: number) => User | undefined;
  setSelectedUser: (user: User | null) => void;
  clearError: () => void;
}

/** Helper to extract array data from API responses that may be { data: [...] } or [...] */
function extractUserArray(raw: unknown): User[] {
  if (Array.isArray(raw)) return raw as User[];
  if (raw && typeof raw === "object" && "data" in (raw as Record<string, unknown>)) {
    const data = (raw as Record<string, unknown>).data;
    if (Array.isArray(data)) return data as User[];
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

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  selectedUser: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/users", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const raw = await response.json();
      const users = extractUserArray(raw);
      set({ users, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal memuat data user",
      });
    }
  },

  createUser: async (data: UserFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      const raw = await response.json();
      const newUser = extractItem<User>(raw);
      if (newUser) {
        set((state) => ({
          users: [...state.users, newUser],
          isLoading: false,
        }));
      } else {
        // If we can't extract a single item, refetch the full list
        await get().fetchUsers();
        set({ isLoading: false });
      }
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal membuat user",
      });
    }
  },

  updateUser: async (id: number, data: Partial<UserFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      const raw = await response.json();
      const updatedUser = extractItem<User>(raw);
      if (updatedUser) {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? updatedUser : u)),
          isLoading: false,
        }));
      } else {
        await get().fetchUsers();
        set({ isLoading: false });
      }
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal mengupdate user",
      });
    }
  },

  deleteUser: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal menghapus user",
      });
    }
  },

  getUserById: (id: number) => {
    return get().users.find((u) => u.id === id);
  },

  setSelectedUser: (user) => set({ selectedUser: user }),

  clearError: () => set({ error: null }),
}));
