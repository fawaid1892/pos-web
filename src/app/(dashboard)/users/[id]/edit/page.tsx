"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { UserForm } from "@/components/users/user-form";
import { useUsersStore } from "@/hooks/useUsers";
import { Edit } from "lucide-react";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { users, fetchUsers, selectedUser, setSelectedUser } = useUsersStore();

  const user = users.find((u) => u.id === userId);

  useEffect(() => {
    if (users.length === 0) fetchUsers();
  }, [fetchUsers, users.length]);

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">User tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Edit className="w-5 h-5" />
          Edit User
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Mengubah data user: <span className="font-medium">{user.name}</span>
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <UserForm
          mode="edit"
          user={user}
          onSuccess={() => router.push("/users")}
          onCancel={() => router.push("/users")}
        />
      </div>
    </div>
  );
}
