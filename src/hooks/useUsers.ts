/**
 * Hook untuk manajemen user (CRUD)
 *
 * TODO: Ganti mock dengan API call saat backend sudah siap
 * Endpoint yg ditunggu: GET/POST/PUT/DELETE /users
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
  updateUser: (id: string, data: Partial<UserFormData>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  getUserById: (id: string) => User | undefined;
  setSelectedUser: (user: User | null) => void;
  clearError: () => void;
}

const mockUsers: User[] = [
  {
    id: "usr-001",
    name: "Admin Toko",
    email: "admin@tokopos.com",
    role: "superadmin",
    phone: "081234567890",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "usr-002",
    name: "Kasir Pusat",
    email: "kasir@tokopos.com",
    role: "cashier",
    branchId: "br-001",
    phone: "081234567891",
    isActive: true,
    createdAt: "2025-02-15T00:00:00Z",
    updatedAt: "2025-05-20T00:00:00Z",
  },
  {
    id: "usr-003",
    name: "Manajer Cabang",
    email: "manager@tokopos.com",
    role: "manager",
    branchId: "br-002",
    phone: "081234567892",
    isActive: true,
    createdAt: "2025-03-01T00:00:00Z",
    updatedAt: "2025-06-10T00:00:00Z",
  },
  {
    id: "usr-004",
    name: "Kasir Cabang",
    email: "kasir2@tokopos.com",
    role: "cashier",
    branchId: "br-002",
    phone: "081234567893",
    isActive: false,
    createdAt: "2025-03-15T00:00:00Z",
    updatedAt: "2025-06-15T00:00:00Z",
  },
  {
    id: "usr-005",
    name: "Staff Gudang",
    email: "staff@tokopos.com",
    role: "admin",
    branchId: "br-001",
    phone: "081234567894",
    isActive: true,
    createdAt: "2025-04-01T00:00:00Z",
    updatedAt: "2025-05-30T00:00:00Z",
  },
];

let nextId = 6;

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  selectedUser: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Ganti dengan API call
      // const response = await api.get<User[]>("/users");
      // set({ users: response.data, isLoading: false });

      // Mock: simulasikan network delay
      await new Promise((r) => setTimeout(r, 300));
      set({ users: mockUsers, isLoading: false });
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
      // TODO: Ganti dengan API call
      // const response = await api.post<User>("/users", data);
      // set((state) => ({ users: [...state.users, response.data], isLoading: false }));

      const now = new Date().toISOString();
      const newUser: User = {
        id: `usr-${String(nextId++).padStart(3, "0")}`,
        name: data.name,
        email: data.email,
        role: data.role,
        branchId: data.branchId,
        phone: data.phone,
        isActive: data.isActive,
        createdAt: now,
        updatedAt: now,
      };

      mockUsers.push(newUser);
      set((state) => ({
        users: [...state.users, newUser],
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal membuat user",
      });
    }
  },

  updateUser: async (id: string, data: Partial<UserFormData>) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Ganti dengan API call
      // const response = await api.put<User>(`/users/${id}`, data);
      // set((state) => ({
      //   users: state.users.map((u) => (u.id === id ? response.data : u)),
      //   isLoading: false,
      // }));

      const index = mockUsers.findIndex((u) => u.id === id);
      if (index !== -1) {
        mockUsers[index] = {
          ...mockUsers[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
      }

      set((state) => ({
        users: state.users.map((u) =>
          u.id === id
            ? {
                ...u,
                ...data,
                updatedAt: new Date().toISOString(),
              }
            : u
        ),
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal mengupdate user",
      });
    }
  },

  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Ganti dengan API call
      // await api.delete(`/users/${id}`);

      const userIndex = mockUsers.findIndex((u) => u.id === id);
      if (userIndex !== -1) mockUsers.splice(userIndex, 1);

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

  getUserById: (id: string) => {
    return get().users.find((u) => u.id === id);
  },

  setSelectedUser: (user) => set({ selectedUser: user }),

  clearError: () => set({ error: null }),
}));
