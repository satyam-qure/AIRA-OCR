'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AxiosError } from 'axios';

export function Authenticated({ children }: { children: React.ReactNode }) {
  const { userInfo, isLoading, isError, error, redirectToLogin } = useAuth();

  useEffect(() => {
    if (!isLoading && !userInfo && isError && (error as AxiosError)?.response?.status === 401) {
      redirectToLogin?.();
    }
  }, [userInfo, isLoading, isError, error, redirectToLogin]);

  if (isLoading || isError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent dark:border-white"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
