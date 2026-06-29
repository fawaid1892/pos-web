/**
 * Hook untuk pengaturan struk (receipt customization)
 *
 * TODO: Ganti mock dengan API call saat backend sudah siap
 * Endpoint yg ditunggu: GET/PUT /settings/receipt
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

const defaultSettings: FileTextSettings = {
  id: "rcpt-001",
  branchId: "br-001",
  storeName: "Toko POS Retail",
  storeAddress: "Jl. Merdeka No. 1, Jakarta Pusat",
  storePhone: "021-12345678",
  taxId: "01.234.567.8-901.000",
  headerText: "TERIMA KASIH TELAH BERBELANJA",
  footerText: "Barang yang sudah dibeli tidak dapat dikembalikan kecuali ada cacat produksi",
  fontFamily: "mono",
  fontSize: "md",
  logoUrl: "",
  showLogo: false,
  showHeader: true,
  showFooter: true,
  showItemNumber: true,
  showBarcode: false,
  paperWidth: "80mm",
  updatedAt: "2025-06-01T00:00:00Z",
};

export const useFileTextSettingsStore = create<FileTextSettingsState>(
  (set) => ({
    settings: null,
    isLoading: false,
    isSaving: false,
    error: null,

    fetchSettings: async (_branchId: string) => {
      set({ isLoading: true, error: null });
      try {
        // TODO: Ganti dengan API call
        // const response = await api.get<FileTextSettings>(`/settings/receipt/${branchId}`);
        // set({ settings: response.data, isLoading: false });

        await new Promise((r) => setTimeout(r, 200));
        set({ settings: { ...defaultSettings, branchId: _branchId }, isLoading: false });
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
        // TODO: Ganti dengan API call
        // const response = await api.put<FileTextSettings>("/settings/receipt", data);
        // set({ settings: response.data, isSaving: false });

        await new Promise((r) => setTimeout(r, 500));
        set((state) => ({
          settings: state.settings
            ? {
                ...state.settings,
                ...data,
                updatedAt: new Date().toISOString(),
              }
            : null,
          isSaving: false,
        }));
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
