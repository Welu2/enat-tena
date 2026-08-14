"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import type { AuthUser, LoginRequest, RegisterRequest } from "@/types/api";

// ---------------------------------------------------------------------------
// Context Shape
// ---------------------------------------------------------------------------

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate user from stored token on mount
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (!token) {
      setIsLoading(false);
      return;
    }

    userService
      .getProfile()
      .then((profile) => {
        setUser({
          id: profile.id,
          phone_number: profile.phone_number,
          full_name: profile.full_name,
        });
      })
      .catch(() => {
        // Token expired or invalid — clear silently
        localStorage.removeItem("access_token");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    const data = await authService.login(payload);
    setUser(data.user);
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const data = await authService.register(payload);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    authService.logout();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
