'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { MenubarProvider } from '@/contexts/MenubarContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  const redirectToLogin = () => {
    router.push('/login');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MenubarProvider>
          <AuthProvider redirectToLogin={redirectToLogin}>
            {children}
          </AuthProvider>
        </MenubarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
