import { apiClient } from '@/lib/api-client';
import { AuthResponse, UserCredentials } from '@/types/api';

const TOKEN_KEY = 'access_token';
const USER_ID_KEY = 'user_id';
const USER_EMAIL_KEY = 'user_email';
const USER_NAME_KEY = 'user_name';

/**
 * Sign up a new user via FastAPI backend (POST /auth/signup)
 */
export async function signupWithFastAPI(
  email: string,
  password: string,
  fullName?: string
): Promise<AuthResponse> {
  const payload: UserCredentials = { email, password };
  const response = await apiClient.post<AuthResponse>('/auth/signup', payload);

  if (response.access_token) {
    apiClient.setToken(response.access_token);
    localStorage.setItem(TOKEN_KEY, response.access_token);
    localStorage.setItem(USER_ID_KEY, response.user_id);
    localStorage.setItem(USER_EMAIL_KEY, response.email);
    if (fullName) {
      localStorage.setItem(USER_NAME_KEY, fullName.trim());
    }
  }

  return response;
}

/**
 * Log in an existing user via FastAPI backend (POST /auth/login)
 */
export async function loginWithFastAPI(
  email: string,
  password: string
): Promise<AuthResponse> {
  const payload: UserCredentials = { email, password };
  const response = await apiClient.post<AuthResponse>('/auth/login', payload);

  if (response.access_token) {
    apiClient.setToken(response.access_token);
    localStorage.setItem(TOKEN_KEY, response.access_token);
    localStorage.setItem(USER_ID_KEY, response.user_id);
    localStorage.setItem(USER_EMAIL_KEY, response.email);
  }

  return response;
}

/**
 * Clear local session data
 */
export function clearAuthSession(): void {
  apiClient.clearToken();
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(USER_NAME_KEY);
  }
}