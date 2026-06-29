"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Settings,
  Printer,
  Save,
  MapPin,
  Check,
  X,
  ArrowRight,
  Home,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBranchStore } from "@/hooks/useBranch";

// ─── LocalStorage helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = "pos_general_settings";

interface GeneralSettings {
  appName: string;
  taxRate: number;
  currency: string;
}

const defaultGeneral: GeneralSettings = {
  appName: "POS Multi Branch",
  taxRate: 10,
  currency: "IDR",
};

function loadGeneral(): GeneralSettings {
  if (typeof window === "undefined") return defaultGeneral;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultGeneral, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return defaultGeneral;
}

function saveGeneral(data: GeneralSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────

type Tab = "general" | "branch" | "receipt";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", icon: MapPin },
  { id: "branch", label: "Branch", icon: Settings },
  { id: "receipt", label: "FileText", icon: Printer },
];

// ─── Currency options ──────────────────────────────────────────────────────────

const currencyOptions = [
  { value: "IDR", label: "IDR — Indonesian Rupiah (Rp)" },
  { value: "USD", label: "USD — US Dollar ($)" },
  { value: "MYR", label: "MYR — Malaysian Ringgit (RM)" },
  { value: "SGD", label: "SGD — Singapore Dollar (S$)" },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const { branches, isLoading: branchesLoading, fetchBranches } = useBranchStore();
  const [activeTab, setActiveTab] = useState<Tab>("general");

  // General settings state
  const [general, setGeneral] = useState<GeneralSettings>(loadGeneral);
  const [saved, setSaved] = useState(false);

  // Fetch branches if not loaded
  useEffect(() => {
    if (branches.length === 0) {
      fetchBranches();
    }
  }, [branches.length, fetchBranches]);

  const handleGeneralChange = <K extends keyof GeneralSettings>(
    key: K,
    value: GeneralSettings[K]
  ) => {
    setGeneral((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSaveGeneral = () => {
    saveGeneral(general);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your application and store preferences
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 border-b border-border mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px",
                  isActive
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div>
          {/* ── General Tab ─────────────────────────────── */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4">General Settings</h3>
                <div className="space-y-4 max-w-lg">
                  <Input
                    label="Application Name"
                    value={general.appName}
                    onChange={(e) =>
                      handleGeneralChange("appName", e.target.value)
                    }
                    placeholder="POS Multi Branch"
                  />
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Default Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={general.taxRate}
                      onChange={(e) =>
                        handleGeneralChange(
                          "taxRate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Default Currency
                    </label>
                    <select
                      value={general.currency}
                      onChange={(e) =>
                        handleGeneralChange("currency", e.target.value)
                      }
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    >
                      {currencyOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <Button onClick={handleSaveGeneral}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                  {saved && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Saved to local storage
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                These settings are stored locally and will sync with the backend
                when available.
              </p>
            </div>
          )}

          {/* ── Branch Tab ──────────────────────────────── */}
          {activeTab === "branch" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Branches / Cabang
                </h3>
                <span className="text-xs text-muted-foreground">
                  {branches.length} branch{branches.length !== 1 ? "es" : ""}
                </span>
              </div>

              {branchesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-pulse text-sm text-muted-foreground">
                    Loading branches...
                  </div>
                </div>
              ) : branches.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Home className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">No branches available</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {branches.map((branch) => (
                    <div
                      key={branch.id}
                      className="bg-card border border-border rounded-xl p-4 flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400 flex items-center justify-center shrink-0">
                        <Home className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{branch.name}</p>
                          <span
                            className={cn(
                              "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium",
                              branch.isActive
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            )}
                          >
                            {branch.isActive ? (
                              <>
                                <Check className="w-3 h-3 mr-0.5" />
                                Active
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3 mr-0.5" />
                                Inactive
                              </>
                            )}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {branch.address || "No address"}
                          </span>
                          {branch.code && (
                            <span className="flex items-center gap-1">
                              Code: {branch.code}
                            </span>
                          )}
                          {branch.phone && (
                            <span className="flex items-center gap-1">
                              <Save className="w-3 h-3" />
                              {branch.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Branch data is read-only. Manage branches from the backend.
              </p>
            </div>
          )}

          {/* ── FileText Tab ─────────────────────────────── */}
          {activeTab === "receipt" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-2">
                  FileText / Struk Settings
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Customize thermal receipt appearance including header, footer,
                  logo, font, and paper size.
                </p>
                <Button onClick={() => router.push("/settings/receipt")}>
                  <Printer className="w-4 h-4 mr-2" />
                  Open FileText Settings
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-2">
                  Quick Overview
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Your receipt customization controls include:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    Branch identity (name, address, phone, tax ID)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    Header &amp; footer text
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    Font family, size, and paper width (58mm / 80mm)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    Logo upload
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    Barcode display option
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
