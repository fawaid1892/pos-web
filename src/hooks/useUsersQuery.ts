"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User, UserFormData } from "@/types";

// ─── Fetch users ──────────────────────────────────────────────────────────────

async function fetchUsers(): Promise<User[]> {
  const res = await fetch("/api/users");
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch users" }));
    throw new Error(err.error || "Failed to fetch users");
  }
  const json = await res.json();
  // The API might return { data: [...], users: [...] } or array directly
  const list = json.data ?? json.users ?? json;
  return Array.isArray(list) ? list : [];
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    refetchInterval: 30_000, // auto-refresh every 30s
  });
}

// ─── Create user ──────────────────────────────────────────────────────────────

async function createUser(data: UserFormData): Promise<User> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to create user" }));
    throw new Error(err.error || "Failed to create user");
  }
  return res.json();
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// ─── Update user ──────────────────────────────────────────────────────────────

async function updateUser({
  id,
  data,
}: {
  id: string;
  data: Partial<UserFormData>;
}): Promise<User> {
  const res = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to update user" }));
    throw new Error(err.error || "Failed to update user");
  }
  return res.json();
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// ─── Delete user ──────────────────────────────────────────────────────────────

async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to delete user" }));
    throw new Error(err.error || "Failed to delete user");
  }
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
