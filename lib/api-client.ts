// =============================================================================
// Enat Tena — Centralized API Client (FastAPI-ready)
// =============================================================================

import { ApiError } from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

const MOCKS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true";

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", token);
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
}

// ---------------------------------------------------------------------------
// Response interceptor — global error handling
// ---------------------------------------------------------------------------

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    // 204 No Content
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }

  let data: Record<string, unknown> | undefined;
  try {
    data = await response.json();
  } catch {
    // body is not JSON
  }

  const message =
    (data && typeof data.detail === "string" && data.detail) ||
    `Request failed with status ${response.status}`;

  // 401 Unauthorized — clear token and redirect to login
  if (response.status === 401) {
    clearAccessToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  throw new ApiError(
    message as string,
    response.status,
    data as unknown as import("@/types/api").ApiErrorResponse
  );
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

interface RequestOptions {
  /** Skip attaching the Authorization header */
  noAuth?: boolean;
  /** Additional headers */
  headers?: Record<string, string>;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Attach Bearer token (request interceptor)
  if (!options.noAuth) {
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: options.signal,
  });

  return handleResponse<T>(response);
}

// ---------------------------------------------------------------------------
// Typed HTTP methods
// ---------------------------------------------------------------------------

export const apiClient = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>("GET", path, undefined, options);
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("POST", path, body, options);
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("PUT", path, body, options);
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("PATCH", path, body, options);
  },

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>("DELETE", path, undefined, options);
  },
};

// ---------------------------------------------------------------------------
// Mock mode helper
// ---------------------------------------------------------------------------

/**
 * Returns mock data when NEXT_PUBLIC_ENABLE_MOCKS=true,
 * otherwise calls the real API via apiClient.
 */
export function withMock<T>(
  mockData: T,
  realFetcher: () => Promise<T>,
  /** Simulated delay in ms (only in mock mode) */
  delayMs = 400
): Promise<T> {
  if (MOCKS_ENABLED) {
    return new Promise((resolve) => setTimeout(() => resolve(mockData), delayMs));
  }
  return realFetcher();
}