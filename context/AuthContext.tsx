"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types/api';
import { userService } from '@/services/user.service';
import { clearAuthSession, loginWithFastAPI, signupWithFastAPI } from '@/lib/api';

interface AuthContextType {
  token: string | null;
  userEmail: string | null;
  userId: string | null;
  userName: string | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const userProfile = await userService.getProfile();
      setProfile(userProfile);
      return userProfile;
    } catch {
      return null;
    }
  }, []);

  // Hydrate session on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedId = localStorage.getItem('user_id');
    const storedEmail = localStorage.getItem('user_email');
    const storedName = localStorage.getItem('user_name');

    if (storedToken) {
      setToken(storedToken);
      setUserId(storedId);
      setUserEmail(storedEmail);
      setUserName(storedName);
      refreshProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshProfile]);

  const login = async (email: string, password: string) => {
    const res = await loginWithFastAPI(email, password);
    setToken(res.access_token);
    setUserId(res.user_id);
    setUserEmail(res.email);

    const userProfile = await refreshProfile();
    if (userProfile?.onboarding_completed) {
      router.push('/home');
    } else {
      router.push('/onboarding');
    }
  };

  const signup = async (email: string, password: string, fullName?: string) => {
    const res = await signupWithFastAPI(email, password, fullName);
    setToken(res.access_token);
    setUserId(res.user_id);
    setUserEmail(res.email);
    if (fullName) setUserName(fullName);
    router.push('/onboarding');
  };

  const logout = () => {
    clearAuthSession();
    setToken(null);
    setUserId(null);
    setUserEmail(null);
    setUserName(null);
    setProfile(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        userEmail,
        userName,
        profile,
        isAuthenticated: !!token,
        isLoading,
        login,
        signup,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}