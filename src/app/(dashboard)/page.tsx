"use client";

import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Receipt,
  Store,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { useActiveBranchId } from "@/hooks/useBranch";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function subDaysFrom(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

// ─── Data Fetching ─────────────────────────────────────────────────────────────

function useDashboardStats(branchId: string | null) {
  return useQuery({
    queryKey: ["dashboard-stats", branchId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/stats?branch_id=${branchId}`);
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return res.json();
    },
    enabled: !!branchId,
    refetchInterval: 30_000, // auto-refresh every 30s
  });
}

function useSalesChart(branchId: string | null, start: string, end: string) {
  return useQuery({
    queryKey: ["sales-chart", branchId, start, end],
    queryFn: async () => {
      const res = await fetch(
        `/api/dashboard/sales-chart?start=${start}&end=${end}&branch_id=${branchId}`
      );
      if (!res.ok) throw new Error("Failed to fetch sales chart");
      return res.json();
    },
    enabled: !!branchId,
  });
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  isLoading,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={cn("rounded-lg p-2.5", color)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3">
        {isLoading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <p className="text-2xl font-bold tracking-tight">
            {typeof value === "number" ? formatCurrency(value) : value}
          </p>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// ─── Sales Chart ───────────────────────────────────────────────────────────────

function SalesChart({ data }: { data: { date: string; total: number; count: number }[] | undefined }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Penjualan 7 Hari Terakhir</h3>
        <p className="text-sm text-muted-foreground">Belum ada data penjualan</p>
      </div>
    );
  }

  const maxSales = Math.max(...data.map((d) => d.total));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold">Penjualan 7 Hari Terakhir</h3>
      <div className="flex items-end gap-3">
        {data.map((day) => {
          const heightPct = maxSales > 0 ? (day.total / maxSales) * 100 : 0;
          const shortDate = day.date.slice(5); // "MM-DD"
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {(day.total / 1_000_000).toFixed(1)}jt
              </span>
              <div className="relative flex h-32 w-full items-end">
                <div
                  className="w-full rounded-t-md bg-brand-500/80 transition-all hover:bg-brand-500"
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                {shortDate}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const branchId = useActiveBranchId();

  // Date range: last 7 days
  const today = new Date();
  const endDate = formatDate(today);
  const startDate = formatDate(subDaysFrom(today, 6));

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats(branchId);
  const {
    data: chartData,
    isLoading: chartLoading,
    error: chartError,
  } = useSalesChart(branchId, startDate, endDate);

  const statCards = [
    {
      label: "Pendapatan Hari Ini",
      value: stats?.today_revenue ?? 0,
      icon: TrendingUp,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Total Transaksi",
      value: stats?.total_transactions ?? 0,
      icon: Receipt,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Cabang Aktif",
      value: stats?.active_branches ?? 0,
      icon: Store,
      color: "bg-violet-500/10 text-violet-600",
    },
    {
      label: "Stok Menipis",
      value: stats?.low_stock_items ?? 0,
      icon: AlertTriangle,
      color: "bg-amber-500/10 text-amber-600",
    },
  ];

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Ringkasan bisnis real-time
        </p>
      </div>

      {/* Error banner */}
      {(statsError || chartError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Gagal memuat data dashboard. Silakan coba lagi.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} isLoading={statsLoading} />
        ))}
      </div>

      {/* Chart */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {chartLoading ? (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold">Penjualan 7 Hari Terakhir</h3>
              <div className="flex items-end gap-3 h-32">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full h-24 animate-pulse rounded-t-md bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <SalesChart data={chartData?.rows} />
          )}
        </div>
        <div className="lg:col-span-2">
          {/* Placeholder for future recent transactions widget */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Informasi</h3>
            <p className="text-sm text-muted-foreground">
              Data dashboard diperbarui secara real-time. Pilih cabang untuk melihat data spesifik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
