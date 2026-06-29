"use client";

import type { FileTextSettings } from "@/types";
import { cn } from "@/lib/utils";

interface FileTextPreviewProps {
  settings: FileTextSettings;
  className?: string;
}

/**
 * Live preview of thermal receipt based on current settings.
 * Scales down to fit the preview container (simulates ~80mm / ~58mm width).
 */
export function FileTextPreview({ settings, className }: FileTextPreviewProps) {
  const isWide = settings.paperWidth === "80mm";

  const fontStyles: Record<string, string> = {
    mono: "font-mono",
    sans: "font-sans",
    serif: "font-serif",
  };

  const fontSizes: Record<string, string> = {
    sm: "text-[10px] leading-[14px]",
    md: "text-xs leading-[18px]",
    lg: "text-sm leading-[22px]",
  };

  const mockItems = [
    { name: "Indomie Goreng", qty: 2, price: 3500, total: 7000 },
    { name: "Telor Ceplok", qty: 1, price: 5000, total: 5000 },
    { name: "Es Teh Manis", qty: 2, price: 3000, total: 6000 },
    { name: "Nasi Putih", qty: 1, price: 4000, total: 4000 },
  ];

  const subtotal = mockItems.reduce((sum, i) => sum + i.total, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  return (
    <div
      className={cn(
        "bg-white text-black shadow-xl rounded-xl overflow-hidden max-w-full",
        isWide ? "max-w-[340px]" : "max-w-[260px]",
        fontStyles[settings.fontFamily],
        fontSizes[settings.fontSize],
        className
      )}
    >
      {/* Paper simulation: inner wrapper with border */}
      <div className="p-4">
        {/* Logo */}
        {settings.showLogo && settings.logoUrl && (
          <div className="text-center mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="w-12 h-12 object-contain mx-auto"
            />
          </div>
        )}

        {/* ShoppingBag name */}
        <div className="text-center mb-1">
          <p className="font-bold text-sm uppercase tracking-wider">
            {settings.storeName}
          </p>
          <p className="text-[10px] leading-tight">{settings.storeAddress}</p>
          <p className="text-[10px]">Telp: {settings.storePhone}</p>
          {settings.taxId && (
            <p className="text-[10px]">NPWP: {settings.taxId}</p>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-black/30 my-2" />

        {/* Header text */}
        {settings.showHeader && settings.headerText && (
          <p className="text-center text-[10px] font-semibold uppercase tracking-wider mb-2">
            {settings.headerText}
          </p>
        )}

        {/* Column headers */}
        <div className="flex justify-between text-[9px] uppercase font-bold mb-1">
          <span className="flex-1">Item{settings.showItemNumber ? "  #" : ""}</span>
          <span className="w-8 text-right">Qty</span>
          <span className="w-12 text-right">Harga</span>
          <span className="w-12 text-right">Total</span>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-black/30 mb-1" />

        {/* Items */}
        {mockItems.map((item, i) => (
          <div key={i} className="flex justify-between text-[10px] py-[2px]">
            <span className="flex-1 truncate">
              {settings.showItemNumber ? `${i + 1}. ` : ""}
              {item.name}
            </span>
            <span className="w-8 text-right">{item.qty}</span>
            <span className="w-12 text-right">{item.price.toLocaleString("id-ID")}</span>
            <span className="w-12 text-right">{item.total.toLocaleString("id-ID")}</span>
          </div>
        ))}

        {/* Separator */}
        <div className="border-t border-dashed border-black/30 my-2" />

        {/* Totals */}
        <div className="space-y-[2px] text-[10px]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span>Pajak (10%)</span>
            <span>{tax.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between font-bold text-xs border-t border-black/30 pt-1">
            <span>TOTAL</span>
            <span>{total.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* Footer */}
        {settings.showFooter && settings.footerText && (
          <>
            <div className="border-t border-dashed border-black/30 my-2" />
            <p className="text-center text-[9px] italic text-black/70">
              {settings.footerText}
            </p>
          </>
        )}

        {/* Barcode placeholder */}
        {settings.showBarcode && (
          <>
            <div className="border-t border-dashed border-black/30 my-2" />
            <div className="flex justify-center">
              <div className="h-8 w-36 bg-[repeating-linear-gradient(90deg,black_0px,black_2px,transparent_2px,transparent_4px)] opacity-60" />
            </div>
          </>
        )}

        {/* Credit / terms */}
        <p className="text-center text-[8px] text-black/50 mt-3">
          Terima kasih atas kunjungan Anda
        </p>
      </div>
    </div>
  );
}
