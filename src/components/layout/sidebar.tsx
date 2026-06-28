"use client";

import { cn } from "@/lib/utils";
import { useBranchStore } from "@/hooks/useBranch";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
  SlidersHorizontal,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ShoppingCart, label: "POS", href: "/pos" },
  { icon: Package, label: "Products", href: "/products" },
  { icon: Package, label: "Stock", href: "/stock" },
  { icon: Users, label: "Users", href: "/users" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeBranch } = useBranchStore();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <>
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
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "hidden lg:flex w-full items-center justify-center px-3 py-2 rounded-lg text-sm transition-colors",
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
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-3 left-3 z-50 flex lg:hidden items-center justify-center w-9 h-9 rounded-lg bg-card border border-border shadow-sm"
      >
        <SlidersHorizontal className="w-4 h-4" />
      </button>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-card border-r border-border h-screen transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar (slide-over) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border transition-all duration-300 lg:hidden",
          mobileOpen ? "w-60 translate-x-0" : "w-60 -translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
