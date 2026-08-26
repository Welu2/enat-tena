import { apiClient } from '@/lib/api-client';
import { AuthResponse, ResetPasswordPayload, UserCredentials } from '@/types/api';

export const authService = {
  async signUp(credentials: UserCredentials): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/signup', credentials);
    if (res.access_token) apiClient.setToken(res.access_token);
    return res;
  },

  async logIn(credentials: UserCredentials): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (res.access_token) apiClient.setToken(res.access_token);
    return res;
  },

  async forgotPassword(email: string): Promise<{ status: string; message: string }> {
    return apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<{ status: string; message: string }> {
    return apiClient.post('/auth/reset-password', payload);
  },

  logOut(): void {
    apiClient.clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  },
};