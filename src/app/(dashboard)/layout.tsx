"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { BranchSelector } from "@/components/layout/branch-selector";
import { useBranchStore } from "@/hooks/useBranch";
import { useWebSocket } from "@/hooks/useWebSocket";

function WebSocketListener() {
  const queryClient = useQueryClient();

  useWebSocket("ws://localhost:8080/api/v1/ws", {
    onEvent: (event) => {
      const type = event?.type as string | undefined;

      switch (type) {
        case "transaction.created":
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          queryClient.invalidateQueries({ queryKey: ["sales-chart"] });
          break;
        case "stock.adjusted":
        case "stock.transferred":
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          break;
      }
    },
  });

  return null;
}

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
      <WebSocketListener />
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
