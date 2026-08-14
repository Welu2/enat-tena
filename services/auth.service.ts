// =============================================================================
// Auth Service — login, register, forgot password, logout
// =============================================================================

import { apiClient, withMock, setAccessToken, clearAccessToken } from "@/lib/api-client";
import { mockAuthResponse, mockForgotPasswordResponse } from "@/lib/mock-data";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from "@/types/api";

export const authService = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const data = await withMock(mockAuthResponse, () =>
      apiClient.post<AuthResponse>("/auth/login", payload, { noAuth: true })
    );
    setAccessToken(data.access_token);
    return data;
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const data = await withMock(mockAuthResponse, () =>
      apiClient.post<AuthResponse>("/auth/register", payload, { noAuth: true })
    );
    setAccessToken(data.access_token);
    return data;
  },

  async forgotPassword(
    payload: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    return withMock(mockForgotPasswordResponse, () =>
      apiClient.post<ForgotPasswordResponse>(
        "/auth/forgot-password",
        payload,
        { noAuth: true }
      )
    );
  },

  logout(): void {
    clearAccessToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
};
