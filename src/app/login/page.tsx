"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, logout, isAuthenticated, isLoading, error, clearError } =
    useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const redirectTo = searchParams.get("redirect") || "/";

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  // Clear errors on mount
  useEffect(() => {
    clearError();
    logout(); // Ensure clean state on login page visit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Client-side validation
    if (!username.trim()) {
      setFormError("Username harus diisi");
      return;
    }
    if (!password.trim()) {
      setFormError("Password harus diisi");
      return;
    }

    await login(username.trim(), password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-card shadow-lg">
          {/* Header */}
          <div className="px-8 pt-8 pb-4 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500/10">
              <LogIn className="h-7 w-7 text-brand-500" />
            </div>
            <h1 className="text-xl font-bold text-foreground">POS Multi Branch</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Masuk untuk mengakses dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
            {/* Error banner */}
            {(formError || error) && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formError || error}</span>
              </div>
            )}

            {/* Username field */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-sm font-medium text-foreground"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                autoComplete="username"
                autoFocus
                disabled={isLoading}
                className={cn(
                  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "transition-colors"
                )}
              />
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className={cn(
                    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm",
                    "placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "transition-colors"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex h-10 w-full items-center justify-center rounded-lg font-medium text-sm",
                "bg-brand-500 text-white hover:bg-brand-600",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "transition-colors"
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} POS Multi Branch. All rights reserved.
        </p>
      </div>
    </div>
  );
}
