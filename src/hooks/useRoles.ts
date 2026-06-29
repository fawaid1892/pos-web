/**
 * Hook untuk manajemen role (CRUD + permissions)
 */

import { create } from "zustand";
import type { Role, Permission } from "@/types";

interface RolesState {
  roles: Role[];
  allPermissions: Permission[];
  selectedRole: Role | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRoles: () => Promise<void>;
  fetchPermissions: () => Promise<void>;
  fetchRolePermissions: (roleId: string) => Promise<Permission[]>;
  createRole: (name: string, description: string) => Promise<Role | null>;
  updateRole: (id: string, name: string, description: string) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  setRolePermissions: (roleId: string, permissionIds: string[]) => Promise<void>;
  setSelectedRole: (role: Role | null) => void;
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

export const useRolesStore = create<RolesState>((set, get) => ({
  roles: [],
  allPermissions: [],
  selectedRole: null,
  isLoading: false,
  error: null,

  fetchRoles: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/roles", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const raw = await response.json();
      const roles = extractArray<Role>(raw);
      set({ roles, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal memuat data role",
      });
    }
  },

  fetchPermissions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/roles/permissions/list", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const raw = await response.json();
      const permissions = extractArray<Permission>(raw);
      set({ allPermissions: permissions, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal memuat daftar permission",
      });
    }
  },

  fetchRolePermissions: async (roleId: string) => {
    try {
      const response = await fetch(`/api/roles/${roleId}/permissions`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const raw = await response.json();
      return extractArray<Permission>(raw);
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Gagal memuat permission role",
      });
      return [];
    }
  },

  createRole: async (name: string, description: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      const raw = await response.json();
      const newRole = extractItem<Role>(raw);
      if (newRole) {
        set((state) => ({
          roles: [...state.roles, newRole],
          isLoading: false,
        }));
        return newRole;
      } else {
        await get().fetchRoles();
        set({ isLoading: false });
        return null;
      }
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal membuat role",
      });
      return null;
    }
  },

  updateRole: async (id: string, name: string, description: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/roles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      const raw = await response.json();
      const updatedRole = extractItem<Role>(raw);
      if (updatedRole) {
        set((state) => ({
          roles: state.roles.map((r) => (r.id === id ? updatedRole : r)),
          selectedRole: updatedRole,
          isLoading: false,
        }));
      } else {
        await get().fetchRoles();
        set({ isLoading: false });
      }
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal mengupdate role",
      });
    }
  },

  deleteRole: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/roles/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      set((state) => ({
        roles: state.roles.filter((r) => r.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal menghapus role",
      });
    }
  },

  setRolePermissions: async (roleId: string, permissionIds: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/roles/${roleId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permission_ids: permissionIds }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      set({ isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal menyimpan permission",
      });
    }
  },

  setSelectedRole: (role) => set({ selectedRole: role }),

  clearError: () => set({ error: null }),
}));
