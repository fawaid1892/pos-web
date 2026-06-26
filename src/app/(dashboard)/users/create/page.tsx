"use client";

import { useRouter } from "next/navigation";
import { UserForm } from "@/components/users/user-form";
import { UserPlus } from "lucide-react";

export default function CreateUserPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Tambah User Baru
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Isi data user baru. Password dapat diubah nanti.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <UserForm
          mode="create"
          onSuccess={() => router.push("/users")}
          onCancel={() => router.push("/users")}
        />
      </div>
    </div>
  );
}
