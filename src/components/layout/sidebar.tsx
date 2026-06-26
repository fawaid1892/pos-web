"use client";

import { cn } from "@/lib/utils";
import { useBranchStore } from "@/hooks/useBranch";
import {
  Store,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  Printer,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";

const navItems = [
  { icon: ShoppingCart, label: "POS", href: "/pos" },
  { icon: Package, label: "Produk", href: "/products" },
  { icon: Store, label: "Cabang", href: "/branches" },
  { icon: BarChart3, label: "Laporan", href: "/reports" },
];

const settingsSubItems = [
  { icon: Users, label: "Manajemen User", href: "/users" },
  { icon: Printer, label: "Pengaturan Struk", href: "/settings/receipt" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { activeBranch } = useBranchStore();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => pathname.startsWith(href);
  const isSettingsActive = settingsSubItems.some((s) => isActive(s.href));

  return (
    <aside
      className={cn(
        "flex flex-col bg-card border-r border-border h-screen transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo / Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
          <Store className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-semibold text-sm">POS Retail</span>
            <span className="text-xs text-muted-foreground">
              {activeBranch?.name || "Multi Branch"}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => router.push(item.href)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isActive(item.href)
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}

        {/* Separator */}
        {!collapsed && (
          <div className="my-2 border-t border-border" />
        )}

        {/* Settings dropdown */}
        <div>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isSettingsActive
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Pengaturan</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    settingsOpen && "rotate-180"
                  )}
                />
              </>
            )}
          </button>

          {/* Sub-items (only when expanded) */}
          {!collapsed && settingsOpen && (
            <div className="ml-2 mt-1 space-y-1 border-l border-border pl-2">
              {settingsSubItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive(item.href)
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border space-y-1">
        <button
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "text-muted-foreground"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm transition-colors",
            "hover:bg-accent text-muted-foreground"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
