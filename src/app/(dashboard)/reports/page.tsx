"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Package,
  ArrowUp,
  Search,
  Download,
  ArrowDown,
  FileText,
  Layout,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useActiveBranchId } from "@/hooks/useBranch";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportTab = "sales" | "stock" | "profit-loss";
type ExportFormat = "pdf" | "xlsx" | "csv";

interface SalesDay {
  date: string;
  count: number;
  total: number;
  payment_method?: string;
}

interface SalesReport {
  rows: SalesDay[];
  summary: {
    total_sales: number;
    total_transactions: number;
    average_per_day: number;
  };
}

interface StockReportItem {
  id: string;
  product_name: string;
  barcode?: string;
  category_name?: string;
  stock_qty: number;
  min_stock: number;
  branch_name?: string;
  updated_at: string;
}

interface StockReport {
  rows: StockReportItem[];
  total: number;
}

interface ProfitLossItem {
  id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
  cost: number;
  profit: number;
  margin_percent: number;
}

interface ProfitLossReport {
  rows: ProfitLossItem[];
  summary: {
    total_revenue: number;
    total_cost: number;
    total_profit: number;
    average_margin: number;
  };
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function thirtyDaysAgoStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Data Fetching Hooks ──────────────────────────────────────────────────────

function useSalesReport(branchId: string | null, start: string, end: string) {
  return useQuery<SalesReport>({
    queryKey: ["reports-sales", branchId, start, end],
    queryFn: async () => {
      const res = await fetch(
        `/api/reports?branch_id=${branchId}&type=sales&start=${start}&end=${end}`
      );
      if (!res.ok) throw new Error("Gagal memuat laporan penjualan");
      return res.json();
    },
    enabled: !!branchId && !!start && !!end,
  });
}

function useStockReport(branchId: string | null) {
  return useQuery<StockReport>({
    queryKey: ["reports-stock", branchId],
    queryFn: async () => {
      const res = await fetch(`/api/reports?branch_id=${branchId}&type=stock`);
      if (!res.ok) throw new Error("Gagal memuat laporan stok");
      return res.json();
    },
    enabled: !!branchId,
  });
}

function useProfitLossReport(branchId: string | null, start: string, end: string) {
  return useQuery<ProfitLossReport>({
    queryKey: ["reports-profit-loss", branchId, start, end],
    queryFn: async () => {
      const res = await fetch(
        `/api/reports?branch_id=${branchId}&type=profit-loss&start=${start}&end=${end}`
      );
      if (!res.ok) throw new Error("Gagal memuat laporan laba rugi");
      return res.json();
    },
    enabled: !!branchId && !!start && !!end,
  });
}

// ─── Tab Button ───────────────────────────────────────────────────────────────

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-brand-600 text-white shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

// ─── Export Dropdown ──────────────────────────────────────────────────────────

function ExportDropdown({
  branchId,
  start,
  end,
  disabled,
}: {
  branchId: string | null;
  start: string;
  end: string;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setOpen(false);
    try {
      const res = await fetch(
        `/api/reports/export?branch_id=${branchId}&format=${format}&start=${start}&end=${end}`
      );
      if (!res.ok) throw new Error("Gagal mengekspor laporan");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sales-report-${todayStr()}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Gagal mengekspor laporan. Silakan coba lagi.");
    }
  };

  const formats: { value: ExportFormat; label: string; icon: React.ElementType }[] = [
    { value: "pdf", label: "PDF", icon: FileTextText },
    { value: "xlsx", label: "XLSX", icon: FileText },
    { value: "csv", label: "CSV", icon: Layout },
  ];

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        <Download className="w-4 h-4 mr-2" />
        Export
        <ArrowDown className="w-3 h-3 ml-1" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-lg border border-border bg-card shadow-lg py-1">
            {formats.map((fmt) => (
              <button
                key={fmt.value}
                onClick={() => handleExport(fmt.value)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <fmt.icon className="w-4 h-4 text-muted-foreground" />
                {fmt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sales Tab ────────────────────────────────────────────────────────────────

function SalesTab({
  branchId,
  start,
  end,
}: {
  branchId: string | null;
  start: string;
  end: string;
}) {
  const { data, isLoading, error } = useSalesReport(branchId, start, end);
  const summary = data?.summary;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Penjualan</p>
          {isLoading ? (
            <div className="mt-2 h-7 w-28 animate-pulse rounded bg-muted" />
          ) : (
            <p className="mt-1 text-xl font-bold">{formatCurrency(summary?.total_sales ?? 0)}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Transaksi</p>
          {isLoading ? (
            <div className="mt-2 h-7 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <p className="mt-1 text-xl font-bold">{summary?.total_transactions ?? 0}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Rata-rata per Hari</p>
          {isLoading ? (
            <div className="mt-2 h-7 w-28 animate-pulse rounded bg-muted" />
          ) : (
            <p className="mt-1 text-xl font-bold">{formatCurrency(summary?.average_per_day ?? 0)}</p>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Gagal memuat laporan penjualan
        </div>
      )}

      {/* Grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tanggal</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Transaksi</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !data || data.rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Belum ada data penjualan di periode ini
                  </td>
                </tr>
              ) : (
                data.rows.map((row) => (
                  <tr key={row.date} className="border-b border-border hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3 text-sm">{formatDate(row.date)}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{row.count}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(row.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Stock Tab ────────────────────────────────────────────────────────────────

function StockTab({ branchId }: { branchId: string | null }) {
  const { data, isLoading, error } = useStockReport(branchId);
  const [search, setSearch] = useState("");

  const filtered = (data?.rows ?? []).filter(
    (item) =>
      item.product_name.toLowerCase().includes(search.toLowerCase()) ||
      (item.barcode || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari produk atau barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Gagal memuat laporan stok
        </div>
      )}

      {/* Grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Produk</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Barcode</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Kategori</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Stok</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Min. Stok</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Terakhir Update</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {search
                      ? "Tidak ada produk yang cocok dengan pencarian"
                      : "Belum ada data stok"}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{item.product_name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell font-mono">
                      {item.barcode || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {item.category_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span
                        className={cn(
                          "font-medium",
                          item.stock_qty <= 0
                            ? "text-red-600 dark:text-red-400"
                            : item.stock_qty <= item.min_stock
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-green-600 dark:text-green-400"
                        )}
                      >
                        {item.stock_qty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-muted-foreground hidden md:table-cell">
                      {item.min_stock}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                      {formatDate(item.updated_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {data && !isLoading && !error && (
        <p className="text-sm text-muted-foreground">
          Total {data.total ?? filtered.length} produk
        </p>
      )}
    </div>
  );
}

// ─── Profit & Loss Tab ────────────────────────────────────────────────────────

function ProfitLossTab({
  branchId,
  start,
  end,
}: {
  branchId: string | null;
  start: string;
  end: string;
}) {
  const { data, isLoading, error } = useProfitLossReport(branchId, start, end);
  const summary = data?.summary;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pendapatan</p>
          {isLoading ? (
            <div className="mt-2 h-7 w-28 animate-pulse rounded bg-muted" />
          ) : (
            <p className="mt-1 text-xl font-bold text-green-600">{formatCurrency(summary?.total_revenue ?? 0)}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Modal</p>
          {isLoading ? (
            <div className="mt-2 h-7 w-28 animate-pulse rounded bg-muted" />
          ) : (
            <p className="mt-1 text-xl font-bold text-amber-600">{formatCurrency(summary?.total_cost ?? 0)}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Laba</p>
          {isLoading ? (
            <div className="mt-2 h-7 w-28 animate-pulse rounded bg-muted" />
          ) : (
            <p className="mt-1 text-xl font-bold text-blue-600">{formatCurrency(summary?.total_profit ?? 0)}</p>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Gagal memuat laporan laba rugi
        </div>
      )}

      {/* Margin indicator */}
      {summary && summary.average_margin > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Rata-rata margin laba: <span className="font-semibold">{summary.average_margin.toFixed(1)}%</span>
        </div>
      )}

      {/* Grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Produk</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Terjual</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Pendapatan</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Modal</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Laba</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Margin</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !data || data.rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Belum ada data laba rugi di periode ini
                  </td>
                </tr>
              ) : (
                data.rows.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{item.product_name}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.quantity_sold}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.revenue)}</td>
                    <td className="px-4 py-3 text-sm text-right text-muted-foreground hidden sm:table-cell">
                      {formatCurrency(item.cost)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.profit)}</td>
                    <td className="px-4 py-3 text-sm text-right hidden md:table-cell">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                          item.margin_percent >= 30
                            ? "bg-green-100 text-green-700"
                            : item.margin_percent >= 15
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        )}
                      >
                        {item.margin_percent.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const branchId = useActiveBranchId();
  const [activeTab, setActiveTab] = useState<ReportTab>("sales");
  const [startDate, setStartDate] = useState(thirtyDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);

  const tabs: { key: ReportTab; label: string; icon: React.ElementType }[] = [
    { key: "sales", label: "Penjualan", icon: ArrowUp },
    { key: "stock", label: "Stok", icon: Package },
    { key: "profit-loss", label: "Laba & Rugi", icon: BarChart },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Laporan
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Lihat laporan penjualan, stok, dan laba rugi
          </p>
        </div>

        {/* Export button — only visible on Sales tab */}
        {activeTab === "sales" && (
          <ExportDropdown
            branchId={branchId}
            start={startDate}
            end={endDate}
            disabled={!branchId}
          />
        )}
      </div>

      {/* Tabs + Date Range */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <TabButton
              key={tab.key}
              active={activeTab === tab.key}
              icon={tab.icon}
              label={tab.label}
              onClick={() => setActiveTab(tab.key)}
            />
          ))}
        </div>

        {/* Date range picker — only for Sales and P&L tabs */}
        {(activeTab === "sales" || activeTab === "profit-loss") && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-muted-foreground">Dari</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1.5 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-muted-foreground">Sampai</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1.5 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!branchId ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <BarChart className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">Pilih cabang terlebih dahulu untuk melihat laporan</p>
          </div>
        ) : activeTab === "sales" ? (
          <SalesTab branchId={branchId} start={startDate} end={endDate} />
        ) : activeTab === "stock" ? (
          <StockTab branchId={branchId} />
        ) : (
          <ProfitLossTab branchId={branchId} start={startDate} end={endDate} />
        )}
      </div>
    </div>
  );
}
