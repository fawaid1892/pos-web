/**
 * API Client — Centralized HTTP layer
 *
 * Automatically handles 401 responses by attempting token refresh.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
};

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/**
 * Attempt to refresh the auth token using the stored refresh_token.
 * Returns true if a new token was obtained, false otherwise.
 */
async function attemptTokenRefresh(): Promise<boolean> {
  // Only run on browser (localStorage is not available during SSR)
  if (typeof window === "undefined") return false;

  const refresh_token = localStorage.getItem("auth_refresh_token");
  if (!refresh_token) return false;

  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Refresh failed — clear auth
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_refresh_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("active_branch_id");
      return false;
    }

    const newToken = data?.token || data?.data?.token;
    const newRefreshToken = data?.refresh_token || data?.data?.refresh_token;

    if (!newToken) return false;

    localStorage.setItem("auth_token", newToken);
    if (newRefreshToken) {
      localStorage.setItem("auth_refresh_token", newRefreshToken);
    }
    if (data?.user) {
      localStorage.setItem("auth_user", JSON.stringify(data.user));
    }

    return true;
  } catch {
    // Network error during refresh — don't clear auth, might recover
    return false;
  }
}

/**
 * Redirect to login page, preserving the current path as a redirect param.
 */
function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const currentPath = window.location.pathname;
  if (currentPath === "/login") return; // already there
  window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, params } = options;

  // Build query string
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  // Build headers
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Attach auth token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers: { ...defaultHeaders, ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

  // ─── 401 handling with automatic refresh ───────────────────────────────
  if (response.status === 401 && typeof window !== "undefined") {
    // Try to refresh the token
    const refreshed = await attemptTokenRefresh();

    if (refreshed) {
      // Retry the original request with the new token
      const newToken = localStorage.getItem("auth_token");
      const retryHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers,
      };
      if (newToken) retryHeaders["Authorization"] = `Bearer ${newToken}`;

      const retryResponse = await fetch(url, {
        method,
        headers: retryHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${retryResponse.status}: ${retryResponse.statusText}`,
          retryResponse.status
        );
      }

      return retryResponse.json();
    }

    // Refresh failed or no refresh token — redirect to login
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_refresh_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("active_branch_id");
    redirectToLogin();
    throw new ApiError("Sesi telah berakhir. Silakan login kembali.", 401);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  return response.json();
}

// ─── Convenience Methods ──────────────────────────────────────────────────────

export const api = {
  get: <T>(endpoint: string, params?: RequestOptions["params"]) =>
    request<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "POST", body }),

  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PUT", body }),

  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PATCH", body }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};

export { ApiError };
