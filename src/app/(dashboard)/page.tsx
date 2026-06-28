"use client";

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

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const mockStats = [
  {
    label: "Total Revenue (Hari Ini)",
    value: 12_450_000,
    change: 18.5,
    trend: "up" as const,
    icon: TrendingUp,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    label: "Total Transaksi",
    value: 47,
    change: 12.2,
    trend: "down" as const,
    icon: Receipt,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    label: "Cabang Aktif",
    value: 3,
    change: 0,
    trend: "neutral" as const,
    icon: Store,
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    label: "Stok Menipis",
    value: 8,
    change: 33.3,
    trend: "up" as const,
    icon: AlertTriangle,
    color: "bg-amber-500/10 text-amber-600",
  },
];

const salesLast7Days = [
  { day: "Sen", value: 4_200_000 },
  { day: "Sel", value: 3_800_000 },
  { day: "Rab", value: 5_100_000 },
  { day: "Kam", value: 4_700_000 },
  { day: "Jum", value: 6_300_000 },
  { day: "Sab", value: 8_200_000 },
  { day: "Min", value: 7_500_000 },
];

const maxSales = Math.max(...salesLast7Days.map((d) => d.value));

const recentTransactions = [
  {
    id: "INV/PST/20250628/A1B2",
    customer: "Walk-in Customer",
    total: 245_000,
    status: "completed",
    time: "10:45",
  },
  {
    id: "INV/KTA/20250628/C3D4",
    customer: "Budi Santoso",
    total: 527_500,
    status: "completed",
    time: "10:32",
  },
  {
    id: "INV/PST/20250628/E5F6",
    customer: "Siti Rahayu",
    total: 132_000,
    status: "completed",
    time: "10:15",
  },
  {
    id: "INV/KTA/20250628/G7H8",
    customer: "Walk-in Customer",
    total: 89_500,
    status: "cancelled",
    time: "09:58",
  },
  {
    id: "INV/PST/20250628/I9J0",
    customer: "Ahmad Fauzi",
    total: 1_250_000,
    status: "completed",
    time: "09:30",
  },
];

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={cn("rounded-lg p-2.5", color)}>
          <Icon className="h-5 w-5" />
        </div>
        {trend !== "neutral" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
              trend === "up"
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-red-500/10 text-red-600"
            )}
          >
            {trend === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight">
          {typeof value === "number" ? formatCurrency(value) : value}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// ─── Sales Chart ───────────────────────────────────────────────────────────────

function SalesChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold">Penjualan 7 Hari Terakhir</h3>
      <div className="flex items-end gap-3">
        {salesLast7Days.map((day) => {
          const heightPct = (day.value / maxSales) * 100;
          return (
            <div key={day.day} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {(day.value / 1_000_000).toFixed(1)}jt
              </span>
              <div className="relative flex h-32 w-full items-end">
                <div
                  className="w-full rounded-t-md bg-brand-500/80 transition-all hover:bg-brand-500"
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                {day.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Recent Transactions ───────────────────────────────────────────────────────

function RecentTransactions() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Transaksi Terbaru</h3>
        <span className="text-xs text-muted-foreground">Hari ini</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="pb-2 font-medium">Invoice</th>
              <th className="pb-2 font-medium">Pelanggan</th>
              <th className="pb-2 font-medium">Total</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Jam</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((tx) => (
              <tr key={tx.id} className="border-b border-border last:border-0">
                <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">
                  {tx.id}
                </td>
                <td className="py-2.5 pr-4">{tx.customer}</td>
                <td className="py-2.5 pr-4 font-medium tabular-nums">
                  {formatCurrency(tx.total)}
                </td>
                <td className="py-2.5 pr-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                      tx.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-red-500/10 text-red-600"
                    )}
                  >
                    {tx.status === "completed" ? "Selesai" : "Dibatalkan"}
                  </span>
                </td>
                <td className="py-2.5 text-xs text-muted-foreground">
                  {tx.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Ringkasan bisnis real-time
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Chart + Table */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SalesChart />
        </div>
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
