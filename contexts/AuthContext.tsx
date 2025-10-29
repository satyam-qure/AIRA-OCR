'use client';

import React, { createContext, ReactNode, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

interface UserInfo {
  username: string;
  details: {
    first_name: string;
    last_name: string;
    email: string;
    organisation?: string;
  };
  authenticated: boolean;
  [key: string]: unknown;
}

interface AuthContextType {
  userInfo?: UserInfo | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetchProfile: () => Promise<UserInfo>;
  logout: () => Promise<void>;
  redirectToLogin?: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  redirectToLogin?: () => void;
}

export function AuthProvider({ children, redirectToLogin }: AuthProviderProps) {
  const queryClient = useQueryClient();

  const fetchProfile = async (): Promise<UserInfo> => {
    const response = await axiosInstance.get('/profile');
    return response.data;
  };

  const {
    data: userInfo,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<UserInfo>({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const refetchProfile = async () => {
    const result = await refetch();
    return result.data as UserInfo;
  };

  const logout = async () => {
    try {
      // Call logout API
      await axiosInstance.delete('/_allauth/browser/v1/auth/session');
    } catch (error) {
      // Even if logout API fails, clear local state
      console.error('Logout API failed:', error);
    } finally {
      // Clear all react-query cache
      queryClient.clear();
      // Redirect to login
      redirectToLogin?.();
    }
  };

  const value: AuthContextType = {
    userInfo,
    isLoading,
    isError,
    error,
    refetchProfile,
    logout,
    redirectToLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
