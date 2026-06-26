"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Printer, Users, Store, Settings as SettingsIcon, ChevronRight } from "lucide-react";

const settingsItems = [
  {
    icon: Printer,
    label: "Pengaturan Struk",
    description: "Atur tampilan struk thermal, header, footer, logo",
    href: "/settings/receipt",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    icon: Users,
    label: "Manajemen User",
    description: "Kelola pengguna, role, dan hak akses",
    href: "/users",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    icon: Store,
    label: "Data Cabang",
    description: "Atur cabang toko dan informasi cabang",
    href: "/branches",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
];

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          Pengaturan
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Atur preferensi toko dan aplikasi
        </p>
      </div>

      <div className="grid gap-4">
        {settingsItems.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="flex items-center gap-4 bg-card border border-border rounded-xl p-5 text-left hover:border-brand-600/50 hover:bg-accent/50 transition-all group"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", item.color)}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.description}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>
        ))}
      </div>
    </div>
  );
}
