/**
 * Hook untuk pengaturan struk (receipt customization)
 */

import { create } from "zustand";
import type { FileTextSettings, FileTextSettingsFormData } from "@/types";

interface FileTextSettingsState {
  settings: FileTextSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchSettings: (branchId: string) => Promise<void>;
  saveSettings: (data: FileTextSettingsFormData) => Promise<void>;
  updateLogo: (logoUrl: string) => void;
  clearError: () => void;
}

/** Helper to extract a single item from API responses that may be { data: {...} } or {...} */
function extractSettings(raw: unknown): FileTextSettings | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if ("data" in obj && obj.data && typeof obj.data === "object") {
    return obj.data as FileTextSettings;
  }
  // Check if the response itself has the expected fields
  if ("storeName" in obj || "headerText" in obj) {
    return obj as unknown as FileTextSettings;
  }
  return null;
}

export const useFileTextSettingsStore = create<FileTextSettingsState>(
  (set) => ({
    settings: null,
    isLoading: false,
    isSaving: false,
    error: null,

    fetchSettings: async (branchId: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch(`/api/settings/receipt?branchId=${encodeURIComponent(branchId)}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const raw = await response.json();
        const settings = extractSettings(raw);
        set({ settings, isLoading: false });
      } catch (err) {
        set({
          isLoading: false,
          error: err instanceof Error ? err.message : "Gagal memuat pengaturan struk",
        });
      }
    },

    saveSettings: async (data: FileTextSettingsFormData) => {
      set({ isSaving: true, error: null });
      try {
        const response = await fetch("/api/settings/receipt", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const raw = await response.json();
        const savedSettings = extractSettings(raw);
        if (savedSettings) {
          set({ settings: savedSettings, isSaving: false });
        } else {
          // Fallback: optimistically update local state
          set((state) => ({
            settings: state.settings
              ? { ...state.settings, ...data, updatedAt: new Date().toISOString() }
              : null,
            isSaving: false,
          }));
        }
      } catch (err) {
        set({
          isSaving: false,
          error: err instanceof Error ? err.message : "Gagal menyimpan pengaturan",
        });
      }
    },

    updateLogo: (logoUrl: string) => {
      set((state) => ({
        settings: state.settings ? { ...state.settings, logoUrl } : null,
      }));
    },

    clearError: () => set({ error: null }),
  })
);
