"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { BranchSelector } from "@/components/layout/branch-selector";
import { useBranchStore } from "@/hooks/useBranch";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchBranches } = useBranchStore();
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          {/* Topbar */}
          <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
            <h1 className="text-lg font-semibold">POS Multi Branch</h1>
            <BranchSelector />
          </header>
          {/* Content */}
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
