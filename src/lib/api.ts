/**
 * API Client — Centralized HTTP layer
 * 
 * TODO: Update BASE_URL saat backend udah siap
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
