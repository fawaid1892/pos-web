"use client";

import { useState } from "react";
import { ArrowDown, ShoppingBag, Check } from "lucide-react";
import { useBranchShoppingBag } from "@/hooks/useBranch";
import { cn } from "@/lib/utils";

export function BranchSelector() {
  const [open, setOpen] = useState(false);
  const { branches, activeBranch, setActiveBranch } = useBranchShoppingBag();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
          "hover:bg-accent border border-border"
        )}
      >
        <ShoppingBag className="w-4 h-4" />
        <span className="font-medium">
          {activeBranch?.name || "Pilih Cabang"}
        </span>
        <ArrowDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-56 z-50 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => {
                  setActiveBranch(branch);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                  "hover:bg-accent",
                  activeBranch?.id === branch.id && "bg-accent font-medium"
                )}
              >
                <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                <span className="flex-1 text-left">{branch.name}</span>
                <span className="text-xs text-muted-foreground">
                  {branch.code}
                </span>
                {activeBranch?.id === branch.id && (
                  <Check className="w-4 h-4 text-brand-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
